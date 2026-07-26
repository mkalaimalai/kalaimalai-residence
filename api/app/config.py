"""Application settings, loaded from environment (12-factor)."""
from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Supabase Postgres. Use the POOLED connection string (port 6543) on Render.
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres"

    # Supabase project JWT secret — verifies legacy HS256 access tokens.
    supabase_jwt_secret: str = "dev-insecure-secret-change-me"
    supabase_jwt_audience: str = "authenticated"

    # Project URL, e.g. https://<ref>.supabase.co. Required to verify the ASYMMETRIC
    # (ES256/RS256) access tokens that Supabase issues by default on projects created
    # with JWT signing keys — their public keys are fetched from this host's JWKS
    # endpoint. Without it only legacy HS256 tokens can be verified.
    supabase_url: str = ""

    # Comma-separated list of allowed browser origins for CORS.
    cors_origins: str = "http://localhost:3000"

    # --- Google Drive upload (rendering / drawing-sheet files) --------------------
    #
    # Two credential modes, tried in this order:
    #
    # 1. OAuth user token (`google_oauth_token_file`) — REQUIRED for personal
    #    @gmail.com Drive. Uploads are owned by the consenting user and count against
    #    their quota. Mint it with `python scripts/google_oauth_setup.py`.
    # 2. Service account (`google_service_account_file`) — only works against a
    #    Workspace Shared Drive. Against My Drive it always fails with "Service
    #    Accounts do not have storage quota", because the service account ends up
    #    owning the file and its quota is zero. Sharing a folder does NOT change this.
    google_oauth_client_file: str = ""
    google_oauth_token_file: str = ""
    # Path to the service-account JSON key. NEVER commit the key itself.
    google_service_account_file: str = ""
    # Destination folder id — the folder new files are created in.
    google_drive_folder_id: str = ""
    # Uploaded PDFs are rasterised to one JPEG per page so they render in a gallery
    # instead of being download-only. 200 dpi matches how the committed drawing sheets
    # in data/drawingSheets.ts were produced — crisp enough to zoom into dimension text.
    pdf_render_dpi: int = 200
    pdf_jpeg_quality: int = 90
    # Grant `anyone: reader` on each uploaded file so the public site can display it.
    # Off by default: turning it on publishes every uploaded file to anyone with the
    # link, which is a deliberate choice, not a default.
    google_drive_public: bool = False

    # Disable auth entirely for local dev/seeding convenience. NEVER true in prod.
    auth_disabled: bool = False

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
