#!/usr/bin/env python3

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parent.parent


def _write_redirect(path: Path, target: str, title: str) -> None:
    html = f"""<!DOCTYPE html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\" />
  <meta http-equiv=\"refresh\" content=\"0; url={target}\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>{title}</title>
</head>
<body>
  <p>If you are not redirected, <a href=\"{target}\">open the v4 homepage</a>.</p>
</body>
</html>
"""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(html, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Build canonical v4 homepage and align legacy entrypoints.")
    parser.add_argument("--root", default="homepage_v4", help="v4 root directory")
    args = parser.parse_args()

    repo_root = _repo_root()

    subprocess.run(
        [sys.executable, str(repo_root / "scripts" / "nexus_homepage.py"), "validate", "--root", args.root],
        check=True,
        cwd=repo_root,
    )
    subprocess.run(
        [sys.executable, str(repo_root / "scripts" / "nexus_homepage.py"), "build", "--root", args.root],
        check=True,
        cwd=repo_root,
    )

    _write_redirect(
        repo_root / "homepage_v4" / "index.html",
        "output/index.html",
        "CALYR.AI Homepage v4",
    )
    _write_redirect(
        repo_root / "homepage_v3" / "index.html",
        "legacy-v3.html",
        "Calyr.aí - Molecular Deeptech",
    )

    print("Unified on legacy v3: built homepage_v4/output/index.html but aligned default entrypoints to the Mondrian landing.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
