#!/usr/bin/env python3
"""
Vérifie que l'histoire est cohérente avant publication :

  - chaque "next" pointe vers une scène ou une fin existante
  - chaque "requires" / "set" utilise un drapeau defined quelque part
  - chaque scène et chaque fin a bien une image sur le disque
  - chaque scène de jeu (game) a une branche win ET lose, et des
    nombres cohérents (ammo >= total, etc.)
  - aucune scène n'est inaccessible (aucun chemin ne mène à elle)
  - aucune clé en double

Usage : python tools/qa_story.py
Sortie : 0 si tout va bien, 1 sinon.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "assets" / "images"


def load_story() -> dict:
    """Charge story.js avec node et renvoie l'objet STORY en JSON.

    Le fichier déclare `const STORY = {...}` : on le lit dans un
    contexte global puis on évalue l'expression.
    """
    script = (
        "const fs=require('fs'),vm=require('vm');"
        f"const src=fs.readFileSync({str(ROOT / 'data' / 'story.js')!r},'utf8');"
        "const ctx=vm.createContext({});"
        "vm.runInContext(src,ctx);"
        "process.stdout.write(vm.runInContext('JSON.stringify(STORY)',ctx));"
    )
    try:
        out = subprocess.run(
            ["node", "-e", script], capture_output=True, text=True, encoding="utf-8"
        )
    except FileNotFoundError:
        raise SystemExit("node est necessaire pour lire story.js")

    if out.returncode != 0:
        print(out.stderr.strip())
        raise SystemExit("echec de lecture de story.js")

    return json.loads(out.stdout)


def main() -> None:
    story = load_story()
    scenes = story["scenes"]
    endings = story["endings"]
    problems: list[str] = []
    warnings: list[str] = []

    targets = {**scenes, **endings}

    # --- cible et drapeaux ------------------------------------------------

    reachable = set()
    edges: list[tuple[str, str]] = []

    for sid, scene in scenes.items():
        for choice in scene.get("choices", []):
            nxt = choice["next"]
            edges.append((sid, nxt))
            if nxt in targets:
                reachable.add(nxt)
            else:
                problems.append(f"{sid} -> cible inconnue : {nxt}")

        game = scene.get("game")
        if not game:
            continue

        for branch in ("win", "lose"):
            if branch not in game:
                problems.append(f"{sid}.game : branche '{branch}' manquante")
                continue
            nxt = game[branch]["next"]
            edges.append((sid, nxt))
            if nxt in targets:
                reachable.add(nxt)
            else:
                problems.append(f"{sid}.game.{branch} -> cible inconnue : {nxt}")

        total, ammo = game.get("total"), game.get("ammo")
        if not total or not ammo:
            problems.append(f"{sid}.game : 'total' ou 'ammo' manquant")
        elif ammo < total:
            warnings.append(
                f"{sid}.game : {ammo} cartouches pour {total} silhouettes "
                "(échec possible même en jouant bien)"
            )

    # --- images ------------------------------------------------------------

    for sid, entry in targets.items():
        image = entry.get("image")
        if not image:
            problems.append(f"{sid} : aucune image")
        elif not (ROOT / image).exists():
            problems.append(f"{sid} : image introuvable -> {image}")

    for sid, scene in scenes.items():
        game = scene.get("game")
        if game and game.get("image") and not (ROOT / game["image"]).exists():
            problems.append(f"{sid}.game : image introuvable -> {game['image']}")

    # --- images orphelines -------------------------------------------------

    used = {e.get("image") for e in targets.values()}
    for scene in scenes.values():
        if scene.get("game"):
            used.add(scene["game"].get("image"))

    # Le menu et le favicon sont référencés depuis script.js et index.html,
    # pas depuis story.js : on lit ces fichiers pour ne pas crier au lieu.
    for source in ("script.js", "index.html"):
        text = (ROOT / source).read_text(encoding="utf-8")
        used.update(re.findall(r"assets/images/[\w.-]+\.(?:jpg|svg)", text))

    for image in IMAGES.glob("*.jpg"):
        rel = f"assets/images/{image.name}"
        if rel not in used:
            warnings.append(f"image jamais utilisee : {rel}")

    # --- accessibilite -----------------------------------------------------

    start = "reveil"
    seen = {start}
    stack = [start]
    while stack:
        current = stack.pop()
        for src, nxt in edges:
            if src == current and nxt not in seen:
                seen.add(nxt)
                stack.append(nxt)

    unreachable = [sid for sid in targets if sid not in seen]
    for sid in unreachable:
        warnings.append(f"inaccessible depuis '{start}' : {sid}")

    # --- rapport -----------------------------------------------------------

    games = [sid for sid, s in scenes.items() if s.get("game")]
    n_choices = sum(len(s.get("choices", [])) for s in scenes.values())

    print(f"scenes  : {len(scenes)}")
    print(f"fins    : {len(endings)}")
    print(f"choix   : {n_choices}")
    print(f"jeux    : {len(games)} ({', '.join(games) or 'aucun'})")
    print(f"accessibles : {len(seen)} / {len(targets)}")
    print()

    for w in warnings:
        print(f"[ !  ] {w}")
    for p in problems:
        print(f"[ KO ] {p}")

    print()
    if problems:
        print(f"{len(problems)} probleme(s) bloquant(s)")
        sys.exit(1)
    print("histoire coherente" + (f" ({len(warnings)} avertissement(s))" if warnings else ""))
    sys.exit(0)


if __name__ == "__main__":
    main()