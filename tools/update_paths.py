#!/usr/bin/env python3
"""
Pointe data/story.js et script.js vers les illustrations JPEG générées
par tools/generate_images.py, uniquement pour les fichiers qui existent.

Usage : python tools/update_paths.py
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "assets" / "images"

FILES = [ROOT / "data" / "story.js", ROOT / "script.js"]


def main() -> None:
    changed: dict[str, int] = {}

    for path in FILES:
        text = path.read_text(encoding="utf-8")
        original = text

        for match in set(re.findall(r'assets/images/(\w+)\.svg', text)):
            if not (IMAGES / f"{match}.jpg").exists():
                continue
            # Le favicon reste en SVG, seule l'illustration passe en JPEG.
            text = text.replace(
                f'"assets/images/{match}.svg"',
                f'"assets/images/{match}.jpg"',
            )

        if text != original:
            path.write_text(text, encoding="utf-8")
            changed[path.name] = len(re.findall(r"\.jpg", text))

    for name, count in changed.items():
        print(f"[ ok ] {name} : {count} référence(s) en .jpg")

    if not changed:
        print("[ -- ] rien à mettre à jour")


if __name__ == "__main__":
    main()
