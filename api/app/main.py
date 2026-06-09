"""FastAPI application entrypoint for the Kalaimalai Residence platform API.

A DDD/hexagonal modular monolith with synchronous communication between bounded
contexts. Deployed standalone on Render; the GitHub Pages frontend calls it over REST.
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.bootstrap import build_api_router
from app.config import get_settings

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
