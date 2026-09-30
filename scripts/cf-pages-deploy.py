#!/usr/bin/env python3
"""Cloudflare Pages deploy for kredi-hesaplama.

Same surrogate auth as cf-wrangler, BUT runs with cwd = this repo's root.
(AGENTS.md lesson 2026-09-30: wrangler picks up functions/ + _redirects/_headers
from its cwd — the cf-wrangler wrapper uses ~/workspace/height-calculator,
which once 301'd a whole project to height-calculator.net.)
"""
from __future__ import annotations

import os
import subprocess
import sys

sys.path.insert(0, "/opt/hatch/skills/skill-creator/bin")
from dynamic_credentials import dynamic_credential_entry  # noqa: E402

REPO = os.path.expanduser("~/workspace/kredi-hesaplama")
PROJECT = "kredi-hesaplama"


def main(argv: list[str]) -> int:
    entry = dynamic_credential_entry("custom.cloudflare", "access_token")
    surrogate = str(entry["surrogate"]).strip()
    if not surrogate.startswith("hsurr:"):
        print("error: did not get a surrogate credential", file=sys.stderr)
        return 1
    env = dict(os.environ)
    env["CLOUDFLARE_API_TOKEN"] = surrogate
    # Token can't list accounts; pin the account explicitly.
    env["CLOUDFLARE_ACCOUNT_ID"] = "1abe704f3449834965689b3b47db3926"
    dist = os.path.join(REPO, "dist")
    cmd = [
        "npx", "-y", "wrangler@4",
        "pages", "deploy", dist,
        "--project-name", PROJECT,
        "--branch", "main",
        "--commit-dirty=true",
        *argv,
    ]
    print("+", " ".join(cmd[2:]), f"(cwd={REPO})", flush=True)
    proc = subprocess.run(cmd, cwd=REPO, env=env)
    return proc.returncode


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
