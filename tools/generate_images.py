#!/usr/bin/env python3
"""
Génère les illustrations du livre « Le Dernier Refuge » avec Comfy Desktop
(ComfyUI local, API HTTP) puis les enregistre en JPEG dans assets/images/.

Usage :
    python tools/generate_images.py            # génère tout ce qui manque
    python tools/generate_images.py --force    # régénère tout
    python tools/generate_images.py reveil rue # régénère des scènes précises

Prérequis : ComfyUI lancé (Comfy Desktop) sur 127.0.0.1:8188
et le checkpoint SDXL présent dans les modèles.
"""

from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

COMFY = "http://127.0.0.1:8188"
ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "assets" / "images"
COMFY_OUTPUT = Path(
    r"C:\Users\Admin\AppData\Local\Comfy-Desktop\ComfyUI-Installs\Arno\ComfyUI\output"
)

CKPT = "sd_xl_base_1.0.safetensors"
WIDTH, HEIGHT = 1024, 768
STEPS = 26
CFG = 7.0
SAMPLER = "dpmpp_2m"
SCHEDULER = "karras"
BASE_SEED = 1000000

# ---------------------------------------------------------------- style ----

POS = (
    "dark gritty graphic novel illustration, detailed ink linework, painterly comic art, "
    "post-apocalyptic abandoned city, cinematic dramatic lighting, high contrast, "
    "moody oppressive atmosphere, muted charcoal grey and desaturated teal palette, "
    "cold cinematic colours, detailed background art, no text"
)

NEG = (
    "photorealistic, photograph, 3d render, cgi, cartoon, anime, "
    "text, letters, words, watermark, signature, logo, caption, speech bubble, "
    "red floor, red ground, red pavement, red wooden boards, "
    "oversaturated, oversaturated red, glowing red surfaces, "
    "bright rainbow colors, cheerful, low contrast, blurry, out of focus, "
    "deformed hands, extra fingers, extra limbs, mutated, ugly, poorly drawn face, "
    "headless body, faceless figure, "
    "jpeg artifacts, frame, border"
)

# ------------------------------------------------------------ sujets --------
# clé de scène -> description précise de la scène

SUBJECTS: dict[str, str] = {
    "menu": (
        "cover illustration : ruined dead city skyline under a huge pale moon, "
        "a lone survivor silhouette in the foreground with one glowing red cybernetic eye, "
        "smoke rising from collapsed buildings, ominous red glow on the horizon"
    ),
    "reveil": (
        "a man with a visible head and face waking up on a bare mattress in a pitch black "
        "abandoned apartment, dark grey wooden floorboards, cold moonlight through broken "
        "windows, dust motes floating, his right eye glowing bright red"
    ),
    "appartement": (
        "a ransacked apartment interior, empty canned food and a hunting knife on a table, "
        "a cracked bathroom mirror reflecting a man with one glowing red eye, "
        "peeling wallpaper, shadows"
    ),
    "grenier": (
        "a dusty attic with cardboard boxes and old clothes, thick dust beams from a small window, "
        "an old laptop glowing on a shelf showing a red secret project file, "
        "an old photograph lying face up"
    ),
    "cave": (
        "a dark basement labyrinth of wine bottles and old crates, "
        "an open wooden chest with a first aid kit batteries and a handwritten journal, "
        "single dim flashlight beam, cobwebs"
    ),
    "toit": (
        "rooftop view over a grey silent dead city at dusk, black smoke columns in the distance, "
        "three shambling infected silhouettes between wrecked cars in the street below, "
        "a single artificial lamp glowing far to the north between trees"
    ),
    "rue": (
        "a street turned graveyard of abandoned cars with open doors and dark stains on asphalt, "
        "several stumbling infected figures in the fog, "
        "a damaged road sign pointing north toward a refuge zone"
    ),
    "maison": (
        "inside an abandoned family house, dust and a broken framed family photo, "
        "too long too thin handprints on the kitchen wall, "
        "a huge shadow creeping up the staircase, curtains moving"
    ),
    "maison_fouille": (
        "a survivor grabbing a flashlight and first aid kit in a kitchen, "
        "a city map circled in red marker on the refrigerator door, "
        "a deformed silhouette opening the upstairs door behind him"
    ),
    "station": (
        "an abandoned gas station frozen in time at night, empty fuel pumps, "
        "a bicycle hidden under a car, overturned shelves inside the lit shop window, "
        "rain slick asphalt and red neon glow"
    ),
    "boutique": (
        "a narrow convenience store aisle, a lean fast creature with glowing white eyes "
        "leaping over a shelf, the survivor rolling under the shelf toward the back door, "
        "scattered cereal boxes and bottles"
    ),
    "velo": (
        "a survivor riding a bicycle fast through a dead grey city street, motion blur, "
        "abandoned cars on both sides, wind, an empty crossroads ahead splitting left and right, "
        "dramatic backlight"
    ),
    "parking": (
        "a dark underground concrete parking garage, rows of pillars like teeth, "
        "car alarm lights flashing red, tall shadowy figures walking in the darkness between cars"
    ),
    "bus": (
        "interior of an abandoned city bus with broken windows and torn seats, "
        "a survivor sitting at the very back looking out, "
        "a fast creature running behind the bus in the street"
    ),
    "gare": (
        "a vast glass and steel train station, stopped trains on the platforms, "
        "a zombie train conductor in uniform cap shambling between the carriages, "
        "cold light through the dirty glass roof"
    ),
    "panneau": (
        "a highway overpass bridge completely covered by dozens of slow wandering silhouettes, "
        "a road sign in the foreground, the crowd moving like a dark tide, "
        "fog and streetlights"
    ),
    "ruines": (
        "ruins of an old town quarter, collapsed walls and gutted streets, "
        "a thin injured stray dog with a hurt paw standing alone and hungry, "
        "dust, rubble, one red eye glow from the survivor out of frame"
    ),
    "place": (
        "an abandoned market square with overturned stalls and a dry fountain, "
        "a horde of infected silhouettes all converging toward the center, "
        "top down dramatic angle, scattered produce and crates"
    ),
    "metro": (
        "a subway entrance like a black hole in the street, stairs and rails descending "
        "into total darkness, dripping water, a distant faint rhythmic red glow deep below"
    ),
    "tunnel": (
        "a concrete sewer tunnel, a single flashlight beam cutting through pitch darkness, "
        "many fresh footprints on the wet ground, a huge shape barely visible in the blackness, "
        "breath fog, claustrophobic"
    ),
    "cimetiere": (
        "a foggy cemetery full of crooked crosses and tombstones at night, "
        "one freshly dug open grave with loose earth, "
        "a single beam of light, bare trees, cold blue and red tones"
    ),
    "eglise": (
        "the silent interior of an abandoned church, empty pews and dusty altar, "
        "colored light falling through broken stained glass windows, "
        "chalk writing smeared on a stone wall"
    ),
    "immeuble": (
        "the top floor office of a tall building, a pair of binoculars on a desk, "
        "a huge window overlooking the dead city panorama with a dark forest to the north, "
        "wind lifting papers, sunset rim light"
    ),
    "centre": (
        "the vast concrete atrium of a ruined shopping mall, shattered glass storefronts, "
        "rows of too realistic mannequins standing in the dark food court, "
        "mold and water damage, flickering lights"
    ),
    "musee": (
        "the great hall of a looted museum with broken display cases, "
        "a giant dinosaur skeleton towering in the center, "
        "an abandoned backpack on a wooden bench, marble floor"
    ),
    "barricade": (
        "a military barricade blocking the street, sandbags barbed wire and overturned vehicles, "
        "an abandoned battle tank with a chalk message, soldiers gone, "
        "red flare light and smoke"
    ),
    "hopital": (
        "the ruined facade and lobby of an abandoned hospital, shattered windows, "
        "overturned stretchers and debris in the corridor, "
        "a building plan on the wall, emergency exit sign glowing red"
    ),
    "radio": (
        "a cluttered emergency room office, an old analog radio glowing and crackling, "
        "a hand on the tuning dial, scattered papers, "
        "warm light cutting through the dark room"
    ),
    "bureaux": (
        "an underground research laboratory basement, broken test tubes and scattered files, "
        "an open experiment logbook on a desk under a flickering lamp, "
        "chemical spill and cold blue light"
    ),
    "pharmacie": (
        "a dark pharmacy with narrow shelves forming a labyrinth, medicine boxes scattered, "
        "a locked metal door at the back with a small red radio light glowing beside it, "
        "single flashlight beam"
    ),
    "foret": (
        "a narrow path in a pitch dark dead forest, black bare trees, total silence, "
        "two glowing red eyes watching between the trunks, "
        "fog low on the ground, cold moonlight"
    ),
    "cabane": (
        "a small hunter cabin hidden under heavy branches, warm dim light inside, "
        "a stove, canned food, a handwritten warning note on a wooden table, "
        "dark forest around"
    ),
    "campement": (
        "a small campfire burning at night under a starry sky, "
        "a survivor sitting awake beside it, "
        "several pairs of red glowing eyes circling in the surrounding darkness"
    ),
    "riviere": (
        "a slow grey river with a stone bridge crossing it, "
        "a weathered refuge direction sign on the far bank, "
        "reeds, overcast dawn, mist over the water"
    ),
    "grotte": (
        "a cave opening under giant tree roots, fresh footprints in the dirt, "
        "prehistoric cave paintings of animals on the rock wall lit by torchlight, "
        "cool clean air, blue darkness outside"
    ),
    "pont": (
        "a long narrow bridge high above a river choked with debris, "
        "two blind infected silhouettes trapped between the railings, "
        "strong wind, dramatic sky, wide cinematic shot"
    ),
    "lisiere": (
        "the edge of a dead forest, trees thinning out, "
        "a distant lit concrete refuge wall on the horizon, "
        "an open field in between crawling with dark shadows at night"
    ),
    "egouts": (
        "a wet sewer tunnel with ankle deep water, moss and grime on the walls, "
        "a distant daylight opening ahead and the top of the refuge wall above, "
        "toxic green and red tones"
    ),
    "nuit": (
        "a lone survivor sleeping fitfully under the stars on open ground, "
        "last embers of a small fire, "
        "an artificial blue glow watching over him, vast dark landscape"
    ),
    "refuge": (
        "a tall solid concrete refuge wall with a heavy gate and a single lit lamp above it, "
        "warm light leaking from behind the gate, voices and life inside, "
        "a forest framing the scene, hope and dread"
    ),
    "fin_refuge": (
        "the refuge gate opening wide, tired but living human faces and reaching hands, "
        "warm firelight spilling out, survivors sharing food under the stars, "
        "relief, hopeful atmosphere"
    ),
    "fin_refuge_secret": (
        "a heavy bunker door marked with a circle and double helix symbol, "
        "a stern director and armed guard in a hidden underground laboratory, "
        "clones and monitors glowing, conspiracy revealed"
    ),
    "fin_solo": (
        "the interior of a refuge completely empty, rows of made beds, supplies and water, "
        "recent footprints but no people, "
        "one survivor standing alone by a window looking at the forest"
    ),
    "fin_transformation": (
        "a survivor standing before a gate looking at his own hands, "
        "half human skin half glowing cybernetic circuitry with red light, "
        "the refuge waiting ahead, transformation, evolution, dramatic rim light"
    ),
    "mort": (
        "a dark scene of death and doom in the dead city, "
        "a falling body and a swarming mass of infected silhouettes, "
        "everything fading to black, heavy vignette, red emergency glow"
    ),
}

# Clés du fichier story (mort.svg sert aux deux fins)
IMAGE_KEYS = list(SUBJECTS.keys())


# ------------------------------------------------------------------ API ----

def api(path: str, payload: dict | None = None, timeout: int = 30) -> dict:
    url = f"{COMFY}{path}"
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(
        url, data=data, method="POST" if data else "GET",
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())


def wait_server(timeout: int = 180) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            api("/system_stats")
            return
        except (urllib.error.URLError, OSError):
            time.sleep(2)
    raise SystemExit(f"ComfyUI introuvable sur {COMFY}")


def wait_result(prompt_id: str, timeout: int = 600) -> dict:
    deadline = time.time() + timeout
    while time.time() < deadline:
        hist = api(f"/history/{prompt_id}")
        if prompt_id in hist:
            entry = hist[prompt_id]
            status = entry.get("status", {})
            if status.get("status_str") == "error":
                raise RuntimeError(json.dumps(status, indent=2)[:2000])
            if status.get("completed"):
                return entry
        time.sleep(1.5)
    raise TimeoutError(f"prompt {prompt_id} trop long")


def build_workflow(prompt: str, negative: str, seed: int) -> dict:
    return {
        "1": {"class_type": "CheckpointLoaderSimple",
              "inputs": {"ckpt_name": CKPT}},
        "2": {"class_type": "EmptyLatentImage",
              "inputs": {"width": WIDTH, "height": HEIGHT, "batch_size": 1}},
        "3": {"class_type": "CLIPTextEncode",
              "inputs": {"text": prompt, "clip": ["1", 1]}},
        "4": {"class_type": "CLIPTextEncode",
              "inputs": {"text": negative, "clip": ["1", 1]}},
        "5": {"class_type": "KSampler",
              "inputs": {
                  "model": ["1", 0], "positive": ["3", 0], "negative": ["4", 0],
                  "latent_image": ["2", 0], "seed": seed, "steps": STEPS,
                  "cfg": CFG, "sampler_name": SAMPLER, "scheduler": SCHEDULER,
                  "denoise": 1.0,
              }},
        "6": {"class_type": "VAEDecode",
              "inputs": {"samples": ["5", 0], "vae": ["1", 2]}},
        "7": {"class_type": "SaveImage",
              "inputs": {"images": ["6", 0], "filename_prefix": "livre-refuge"}},
    }


def to_jpg(png_path: Path, jpg_path: Path) -> None:
    from PIL import Image
    with Image.open(png_path) as im:
        im = im.convert("RGB")
        im.save(jpg_path, "JPEG", quality=88, optimize=True, progressive=True)


# ----------------------------------------------------------------- main ----

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("keys", nargs="*", help="scènes à générer (défaut : toutes)")
    ap.add_argument("--force", action="store_true", help="regénérer même si présent")
    ap.add_argument("--seed", type=int, default=BASE_SEED)
    args = ap.parse_args()

    keys = args.keys or IMAGE_KEYS
    unknown = [k for k in keys if k not in SUBJECTS]
    if unknown:
        raise SystemExit(f"scènes inconnues : {', '.join(unknown)}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    wait_server()

    ckpts = api("/object_info/CheckpointLoaderSimple")["CheckpointLoaderSimple"]["input"][
        "required"]["ckpt_name"][0]
    if CKPT not in ckpts:
        raise SystemExit(f"checkpoint {CKPT} introuvable. Disponibles : {ckpts}")

    for i, key in enumerate(keys):
        jpg = OUT_DIR / f"{key}.jpg"
        if jpg.exists() and not args.force:
            print(f"[skip] {key} (déjà généré)")
            continue

        print(f"[gen ] {key} ...", flush=True)
        seed = args.seed + i * 7919
        wf = build_workflow(f"{SUBJECTS[key]}, {POS}", NEG, seed)
        try:
            res = api("/prompt", {"prompt": wf}, timeout=60)
        except urllib.error.HTTPError as e:
            print(f"[err ] {key}: {e.read().decode()[:500]}", file=sys.stderr)
            continue

        entry = wait_result(res["prompt_id"])
        node_out = entry["outputs"].get("7", {})
        files = node_out.get("images", [])
        if not files:
            print(f"[err ] {key}: aucune image produite", file=sys.stderr)
            continue

        meta = files[0]
        png = COMFY_OUTPUT / meta.get("subfolder", "") / meta["filename"]
        to_jpg(png, jpg)
        print(f"[ ok ] {key} -> {jpg.relative_to(ROOT)}", flush=True)

    print("\nTerminé.")


if __name__ == "__main__":
    main()
