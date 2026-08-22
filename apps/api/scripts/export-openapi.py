"""Export the OpenAPI schema and validate expected endpoints exist.

Usage:
    python -m scripts.export-openapi         # validate + print to stdout
    python -m scripts.export-openapi --json   # JSON-only (for CI artifacts)

Exits non-zero when an expected entity endpoint is missing.
"""
from __future__ import annotations

import json
import sys

from app.main import app

EXPECTED_PATHS: dict[str, set[str]] = {
    "/projects": {"get", "post"},
    "/projects/public": {"get"},
    "/projects/{project_id}": {"get", "patch"},
    "/spaces": {"get", "post"},
    "/spaces/{entity_id}": {"get", "patch"},
    "/domains": {"get", "post"},
    "/domains/{entity_id}": {"get", "patch"},
    "/drawings": {"get"},
    "/vendors": {"get"},
    "/procurement": {"get"},
    "/decisions": {"get"},
    "/snags": {"get"},
    "/boq": {"get"},
    "/materials": {"get"},
    "/lessons": {"get"},
    "/progress": {"get"},
    "/warranties": {"get"},
    "/gallery": {"get"},
    "/media-sets": {"get"},
    "/healthz": {"get"},
    "/me": {"get", "post", "patch"},
    "/users": {"get"},
}

failures: list[str] = []


def main() -> None:
    schema = app.openapi()
    if "--json" in sys.argv:
        print(json.dumps(schema, indent=2))
        return

    paths = schema.get("paths", {})
    print(f"OpenAPI schema: {len(paths)} paths, {len(schema.get('components', {}).get('schemas', {}))} schemas")

    for expected_path, expected_methods in EXPECTED_PATHS.items():
        if expected_path not in paths:
            failures.append(f"missing path: {expected_path}")
            continue
        actual = set(p.lower() for p in paths[expected_path].keys())
        for m in expected_methods:
            if m not in actual:
                failures.append(f"missing {m.upper()} on {expected_path}")

    if failures:
        print(f"\nFAILED ({len(failures)}):")
        for f in failures:
            print(f"  ✗ {f}")
        sys.exit(1)

    print("All expected endpoints present.")


if __name__ == "__main__":
    main()
