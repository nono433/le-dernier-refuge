#!/usr/bin/env python3
"""
Contrôle qualité des illustrations : luminance, contraste, dominante rouge.

Usage : python tools/qa_images.py [--max-red 0.22] [--min-lum 25] [--max-lum 175]
Le script liste les images à régénérer (clés à passer ensuite à
tools/generate_images.py --force <cle>).
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image, ImageStat

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "assets" / "images"


def analyse(path: Path) -> dict:
    im = Image.open(path).convert("RGB")
    small = im.resize((192, 144))
    raw = small.tobytes()
    n = len(raw) // 3

    stat = ImageStat.Stat(im)
    lum = sum(stat.mean) / 3
    contrast = sum(stat.stddev) / 3

    red = teal = 0
    for i in range(0, len(raw), 3):
        r, g, b = raw[i], raw[i + 1], raw[i + 2]
        if r > 110 and r > g + 40 and r > b + 40:
            red += 1
        elif g > 60 and b > 60 and g > r + 30 and b > r + 15:
            teal += 1

    return {"size": im.size, "lum": lum, "contrast": contrast,
            "red": red / n, "teal": teal / n}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--max-red", type=float, default=0.22)
    ap.add_argument("--min-lum", type=float, default=25.0)
    ap.add_argument("--max-lum", type=float, default=175.0)
    ap.add_argument("--min-contrast", type=float, default=18.0)
    args = ap.parse_args()

    bad: list[str] = []
    print(f"{'image':22s} {'lum':>6s} {'contr':>6s} {'rouge':>6s} {'teal':>6s}  verdict")

    for path in sorted(IMAGES.glob("*.jpg")):
        if path.stem.startswith("probe_"):
            continue
        a = analyse(path)
        reasons = []
        if a["red"] > args.max_red:
            reasons.append("trop rouge")
        if a["lum"] < args.min_lum:
            reasons.append("trop sombre")
        if a["lum"] > args.max_lum:
            reasons.append("trop clair")
        if a["contrast"] < args.min_contrast:
            reasons.append("plat")

        verdict = ", ".join(reasons) or "ok"
        if reasons:
            bad.append(path.stem)
        print(f"{path.stem:22s} {a['lum']:6.1f} {a['contrast']:6.1f} "
              f"{a['red']*100:5.1f}% {a['teal']*100:5.1f}%  {verdict}")

    print()
    if bad:
        print("à régénérer :")
        print("  python tools/generate_images.py --force " + " ".join(bad))
        sys.exit(1)
    print("toutes les images sont conformes")


if __name__ == "__main__":
    main()
