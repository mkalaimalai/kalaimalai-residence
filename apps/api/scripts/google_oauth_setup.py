"""One-time Google consent so the API can upload to YOUR Drive.

Run this yourself — it opens a browser where you sign in to Google. Nothing about your
Google password is visible to the API or to anyone else; what lands on disk is a refresh
token scoped to Drive, which the upload endpoints then use.

    cd api
    ./.venv/bin/python scripts/google_oauth_setup.py

Prerequisite — an OAuth client, which takes two minutes in the Cloud Console:

  1. console.cloud.google.com → project **ai-builder-503614**
  2. APIs & Services → OAuth consent screen → External → fill in the app name and your
     email → under **Test users** add madhu.kalaimalai@gmail.com.
     (Testing mode is fine. Its refresh tokens expire after 7 days; click "Publish app"
     to stop that. See the note at the bottom.)
  3. APIs & Services → Credentials → Create credentials → **OAuth client ID** →
     Application type **Desktop app** → Create → Download JSON.
  4. Save it as api/.google-oauth-client.json (gitignored), or pass its path as the
     first argument to this script.

Afterwards set in api/.env.supabase:

    GOOGLE_OAUTH_TOKEN_FILE=<absolute path printed by this script>
"""
from __future__ import annotations

import os
import sys

from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/drive"]

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_CLIENT = os.path.join(HERE, ".google-oauth-client.json")
DEFAULT_TOKEN = os.path.join(HERE, ".google-oauth-token.json")


def main() -> int:
    client_file = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_CLIENT
    token_file = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_TOKEN

    if not os.path.exists(client_file):
        print(f"OAuth client file not found: {client_file}\n")
        print(__doc__)
        return 1

    # run_local_server spins up a throwaway listener on 127.0.0.1 for the redirect,
    # which is why the client must be of type "Desktop app".
    flow = InstalledAppFlow.from_client_secrets_file(client_file, SCOPES)
    creds = flow.run_local_server(port=0, prompt="consent")

    with open(token_file, "w") as fh:
        fh.write(creds.to_json())
    os.chmod(token_file, 0o600)

    print(f"\n✓ Token written to {token_file}")
    print("  Add this line to api/.env.supabase:\n")
    print(f"    GOOGLE_OAUTH_TOKEN_FILE={token_file}\n")
    if not creds.refresh_token:
        print(
            "  ! No refresh token was issued, so uploads will stop working within the "
            "hour.\n    Revoke the app at myaccount.google.com/permissions and re-run."
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
