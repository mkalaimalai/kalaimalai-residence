"""FastAPI application entrypoint for the Kalaimalai Residence platform API.

A DDD/hexagonal modular monolith with synchronous communication between bounded
contexts. Deployed standalone on Render; the GitHub Pages frontend calls it over REST.
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.engine import make_url

from app.bootstrap import build_api_router
from app.config import get_settings
from app.shared.db import engine

settings = get_settings()

app = FastAPI(
    title="Kalaimalai Residence API",
    version="0.1.0",
    description="Home construction platform — project, document, vendor, commercial, "
    "quality and handover domains over Supabase Postgres.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(build_api_router())


@app.get("/healthz", tags=["health"])
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/healthz/db", tags=["health"])
async def healthz_db() -> dict[str, str]:
    """Report whether the configured database is actually reachable.

    `/healthz` answers without touching Postgres, which means a service with a broken
    or unset DATABASE_URL stays green until the first real query — the failure then
    surfaces as an opaque 500 on every endpoint. This reports the connection attempt
    itself, plus the sanitized target, so a misconfigured deployment names its own
    problem instead of requiring a traceback from the host's logs.

    Credentials are never included: only scheme, host, port, database and user.
    """
    url = make_url(get_settings().database_url)
    target = {
        "driver": url.drivername,
        "host": url.host or "",
        "port": str(url.port or ""),
        "database": url.database or "",
        "user": url.username or "",
    }
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as exc:
        # Deliberately broad: any failure at all is the answer this endpoint exists to give.
        return {
            "status": "error",
            "error": type(exc).__name__,
            "detail": str(exc)[:300],
            **target,
        }
    return {"status": "ok", **target}
