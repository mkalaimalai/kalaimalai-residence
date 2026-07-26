"""Supabase JWT verification → the `require_user` FastAPI dependency.

Portal-sensitive GETs and all writes depend on `require_user`; public build-time GETs
do not. Admin-only write routes additionally depend on `require_admin`.
"""
from __future__ import annotations

from dataclasses import dataclass

from fastapi import Depends, Header, HTTPException, status
from jose import JWTError, jwt

from app.config import Settings, get_settings


@dataclass(frozen=True)
class AuthUser:
    id: str
    email: str | None
    role: str  # app-level role from app_metadata.role, defaults to "viewer"


def _decode(token: str, settings: Settings) -> dict:
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
