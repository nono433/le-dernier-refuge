/* Simule des parties completes pour verifier que la boucle de jeu se
   termine toujours, et que les deux issues sont atteignables.

   necessite jsdom :  npm install --no-save jsdom
   usage :            node tools/qa_play.js
*/
"use strict";

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const bundle = ["data/story.js", "minigame.js", "script.js"]
  .map((f) => fs.readFileSync(path.join(ROOT, f), "utf8"))
  .join("\n;\n");

const W = 800;
const H = 600;

let failures = 0;
function check(label, cond, extra = "") {
  const ok = !!cond;
  if (!ok) failures++;
  console.log(`  ${ok ? "[ OK ]" : "[KO  ]"} ${label}${extra ? " — " + extra : ""}`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Mise en page simulee : la scene fait 800x600 et chaque silhouette est
   interpolee entre son point d'apparition et le feu, comme le ferait
   une transition CSS. Sans cette interpolation, la visee ne veut rien
   dire. */
function installLayout(window) {
  window.Element.prototype.getBoundingClientRect = function () {
    const isTarget = this.classList && this.classList.contains("mg-target");
    const style = this.style || {};
    const px = (v) => parseFloat(v) || 0;

    let w = 0;
    let h = 0;
    if (this.id === "mg-stage") { w = W; h = H; }
    else if (isTarget) { w = 52; h = 78; }
    else return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0 };

    const left = px(style.left);
    const top = px(style.top);

    let dx = 0;
    let dy = 0;
    const calc = /translate\(calc\(-50% \+ (-?[\d.]+)px\),\s*calc\(-50% \+ (-?[\d.]+)px\)\)/.exec(style.transform || "");
    if (calc) {
      const travel = parseFloat((style.transition || "").replace(/[^0-9.]/g, "")) || 1;
      const ratio = Math.max(0, Math.min(1, Date.now() / travel));
      dx = parseFloat(calc[1]) * ratio;
      dy = parseFloat(calc[2]) * ratio;
    }

    const cx = left + dx;
    const cy = top + dy;
    return {
      left: cx - w / 2, top: cy - h / 2, width: w, height: h,
      right: cx + w / 2, bottom: cy + h / 2, x: cx - w / 2, y: cy - h / 2,
    };
  };
}

function play(shoot, overrides) {
  return new Promise((resolve) => {
    const dom = new JSDOM(html, { pretendToBeVisual: true, runScripts: "outside-only" });
    const { window } = dom;
    window.matchMedia = () => ({ matches: false });
    window.scrollTo = () => {};
    installLayout(window);

    window.eval(bundle + "\n;window.__api={STORY,MiniGame};");
    const doc = window.document;

    const game = Object.assign({}, window.__api.STORY.scenes.campement.game, overrides);
    let outcome = "aucun";
    let panel = null;

    window.__api.MiniGame.run(game, (won) => {
      outcome = won ? "victoire" : "echec";
      clearInterval(watcher);
      resolve({ outcome, panel });
    });

    doc.getElementById("mg-go").click();

    const watcher = setInterval(() => {
      if (outcome !== "aucun") return;

      for (const t of doc.querySelectorAll(".mg-target")) {
        // Une silhouette touchée reste un quart de seconde à l'écran en
        // s'effaçant : la retoucher gaspillerait des cartouches.
        if (t.classList.contains("mg-target--hit")) continue;

        if (shoot) {
          const r = t.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          doc.dispatchEvent(new window.MouseEvent("pointermove", { bubbles: true, clientX: cx, clientY: cy }));
          doc.dispatchEvent(new window.MouseEvent("pointerdown", { bubbles: true, clientX: cx, clientY: cy }));
        }
      }

      const found = doc.querySelector(".mg-result");
      if (found && !panel) panel = found;

      // L'ecran de resultat attend un clic sur « Continuer ».
      const next = doc.querySelector("#mg-next");
      if (next) next.click();
    }, 50);

    setTimeout(() => {
      if (outcome === "aucun") {
        clearInterval(watcher);
        resolve({ outcome: "bloque", panel });
      }
    }, 25000);
  });
}

(async () => {
  // Trajets courts : on verifie la logique, pas la duree reelle.
  const fast = { total: 6, ammo: 6, spawnDelay: 240, travel: 850 };

  console.log("— On abat chaque silhouette —");
  const win = await play(true, fast);
  check("la partie se termine", win.outcome !== "bloque", win.outcome);
  check("tout abatter donne la victoire", win.outcome === "victoire", win.outcome);
  check("l'ecran de resultat s'affiche", !!win.panel);
  check("il annonce la victoire", win.panel && win.panel.classList.contains("win"));

  console.log("\n— On ne tire jamais —");
  const lose = await play(false, fast);
  check("la partie se termine", lose.outcome !== "bloque", lose.outcome);
  check("ne pas tirer donne l'echec", lose.outcome === "echec", lose.outcome);
  check("l'ecran de resultat s'affiche", !!lose.panel);
  check("il annonce l'echec", lose.panel && lose.panel.classList.contains("lose"));

  console.log("\n— Nombre impair de cibles, cartouches en surplus —");
  const odd = await play(true, { total: 5, ammo: 9, spawnDelay: 220, travel: 800 });
  check("la partie se termine", odd.outcome !== "bloque", odd.outcome);
  check("tout abattre donne la victoire", odd.outcome === "victoire", odd.outcome);

  console.log();
  if (failures === 0) {
    console.log("parties : les deux issues sont atteignables et la boucle se termine");
  } else {
    console.log(`${failures} test(s) en echec`);
  }
  process.exit(failures === 0 ? 0 : 1);
})();