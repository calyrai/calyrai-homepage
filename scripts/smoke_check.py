from __future__ import annotations

from pathlib import Path


def must_contain(path: str, needles: list[str]) -> None:
    text = Path(path).read_text(encoding="utf-8")
    missing = [n for n in needles if n not in text]
    if missing:
        raise AssertionError(f"{path}: missing {missing}")


def main() -> None:
    must_contain(
        "src/index.html",
        [
            "hero-orbit-stack",
            "hero-cta--orbit",
            "hero-characteristics--orbit",
            "<title>Calyr.a&iacute; – Molecular Deeptech</title>",
        ],
    )
    must_contain(
        "public/index.html",
        [
            "hero-orbit-stack",
            "hero-cta--orbit",
            "hero-characteristics--orbit",
            "<title>Calyr.a&iacute; – Molecular Deeptech</title>",
        ],
    )

    must_contain(
        "src/css/home.css",
        [
            ".hero-orbit-stack",
            ".hero-cta.hero-cta--orbit",
            ".hero-characteristics.hero-characteristics--orbit",
        ],
    )
    must_contain(
        "public/css/home.css",
        [
            ".hero-orbit-stack",
            ".hero-cta.hero-cta--orbit",
            ".hero-characteristics.hero-characteristics--orbit",
        ],
    )

    for path in ["data/contact.yaml", "src/data/contact.yaml"]:
        must_contain(path, ["first_name:", "last_name:", 'phone: "069919200915"'])

    print("SMOKE OK")


if __name__ == "__main__":
    main()
