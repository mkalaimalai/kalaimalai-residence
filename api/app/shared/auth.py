"""Supabase JWT verification → the `require_user` FastAPI dependency.

Portal-sensitive GETs and all writes depend on `require_user`; public build-time GETs
do not. Admin-only write routes additionally depend on `require_admin`.
"""
from __future__ import annotations

from dataclasses import dataclass
from threading import Lock

import httpx
from fastapi import Depends, Header, HTTPException, status
from jose import JWTError, jwt

from app.config import Settings, get_settings

# Asymmetric algorithms Supabase signs with when a project uses JWT signing keys.
_ASYMMETRIC = ("ES256", "RS256")

# Cached JWKS, keyed by kid. Supabase rotates keys rarely, and an unknown kid triggers a
# refetch, so an unbounded process-lifetime cache is correct here.
_jwks_cache: dict[str, dict] = {}
_jwks_lock = Lock()


def _fetch_jwks(settings: Settings) -> dict[str, dict]:
    """Pull the project's public verification keys, keyed by `kid`."""
    if not settings.supabase_url:
        raise JWTError(
            "Token is signed with an asymmetric key but SUPABASE_URL is not set, so the "
            "project's JWKS cannot be fetched"
        )
    url = f"{settings.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
    try:
        res = httpx.get(url, timeout=5.0)
        res.raise_for_status()
        keys = res.json().get("keys") or []
    except (httpx.HTTPError, ValueError) as exc:
        raise JWTError(f"Could not fetch JWKS from {url}: {exc}") from exc
    return {k["kid"]: k for k in keys if "kid" in k}


def _signing_key(kid: str, settings: Settings) -> dict:
    """Resolve a `kid` to its JWK, refetching once if it is not already cached."""
    with _jwks_lock:
        if kid in _jwks_cache:
            return _jwks_cache[kid]
    fresh = _fetch_jwks(settings)
    with _jwks_lock:
        _jwks_cache.update(fresh)
    if kid not in fresh:
        raise JWTError(f"Token key id {kid} is not published by the project's JWKS")
    return fresh[kid]


@dataclass(frozen=True)
class AuthUser:
    id: str
    email: str | None
    role: str  # app-level role from app_metadata.role, defaults to "viewer"


def _decode(token: str, settings: Settings) -> dict:
    """Verify a Supabase access token, whichever way the project signs them.

    Projects created with JWT signing keys issue **ES256** tokens verified against the
    published JWKS; older projects issue **HS256** tokens verified with the shared
    secret. The algorithm is read from the header and the matching path taken — the
    allowed set is still pinned per path, so a token cannot pick its own verifier.
    """
    alg = jwt.get_unverified_header(token).get("alg")

    if alg in _ASYMMETRIC:
        kid = jwt.get_unverified_header(token).get("kid")
        if not kid:
            raise JWTError(f"{alg} token has no kid, so its public key cannot be found")
        return jwt.decode(
            token,
            _signing_key(kid, settings),
            algorithms=list(_ASYMMETRIC),
            audience=settings.supabase_jwt_audience,
        )

    return jwt.decode(
        token,
        settings.supabase_jwt_secret,
        algorithms=["HS256"],
        audience=settings.supabase_jwt_audience,
    )


def require_user(
    authorization: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> AuthUser:
    if settings.auth_disabled:
        return AuthUser(id="dev", email="dev@local", role="admin")

    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = authorization.split(" ", 1)[1].strip()
    try:
        claims = _decode(token, settings)
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    # app_metadata, NOT user_metadata: the latter is writable by the user themselves
    # (`updateUser({ data: { role: "admin" } })` with only the public anon key), so
    # trusting it for authorization lets any account self-promote. app_metadata can
    # only be written with the service_role key.
    metadata = claims.get("app_metadata") or {}
    return AuthUser(
        id=claims.get("sub", ""),
        email=claims.get("email"),
        role=str(metadata.get("role", "viewer")),
    )


def require_admin(user: AuthUser = Depends(require_user)) -> AuthUser:
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin role required"
        )
    return user
