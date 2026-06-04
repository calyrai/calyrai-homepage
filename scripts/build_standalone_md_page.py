#!/usr/bin/env python3

from __future__ import annotations

import argparse
from pathlib import Path

from homepage_builder.content_page import build_content_page

def main() -> None:
	parser = argparse.ArgumentParser()
	parser.add_argument("--md", required=True, help="Markdown source file.")
	parser.add_argument("--out", required=True, help="HTML output file.")
	parser.add_argument("--back-href", default="../index.html#theory", help="Back-link target.")
	parser.add_argument("--kicker", default="Theory / Content Page", help="Page kicker text.")
	parser.add_argument("--brand", default="Calyr.ai / Theory", help="Topbar brand label.")
	args = parser.parse_args()

	root = Path(__file__).resolve().parent.parent
	md_path = (root / args.md).resolve()
	out_path = (root / args.out).resolve()
	build_content_page(root, md_path, out_path, back_href=args.back_href, kicker=args.kicker, brand=args.brand)
	print(f"Updated {out_path}")


if __name__ == "__main__":
	main()