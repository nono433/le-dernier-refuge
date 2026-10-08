/* Test hors navigateur du mini-jeu et du moteur de scenes.

   necessite jsdom :  npm install --no-save jsdom
   usage :            node tools/qa_engine.js

   Le moteur est teste dans un DOM simule : on verifie l'affichage de
   l'ecran de jeu, la depense des cartouches, le nettoyage, et le
   routage vers la bonne scene apres un resultat. */
"use strict";

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

/* La scene de jeu est supposee faire 800x600 pour que la visee soit
   testable : jsdom ne fait pas de mise en page. */
const W = 800;
const H = 600;

const dom = new JSDOM(html, { pretendToBeVisual: true, runScripts: "outside-only" });
const { window } = dom;

window.matchMedia = () => ({ matches: false });
window.scrollTo = () => {};

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

// Un seul eval : chaque appel a sa propre portee, et le moteur fait
// reference a STORY, MiniGame et go() dans le meme fichier.
const bundle = ["data/story.js", "minigame.js", "script.js"]
  .map((f) => fs.readFileSync(path.join(ROOT, f), "utf8"))
  .join("\n;\n");

window.eval(bundle + "\n;window.__api={STORY,MiniGame,go,showGame,currentChoices,flags};");

const api = window.__api;
const doc = window.document;
const app = doc.getElementById("app");

let failures = 0;
function check(label, cond, extra = "") {
  const ok = !!cond;
  if (!ok) failures++;
  console.log(`  ${ok ? "[ OK ]" : "[KO  ]"} ${label}${extra ? " — " + extra : ""}`);
}

/* ---------- L'ecran de jeu remplace la liste de choix ---------- */

console.log("— Ecran de jeu —");
api.showGame("campement");

const gameBtn = doc.getElementById("btn-game");
check("le bouton d'action s'affiche", gameBtn);
check("son libelle vient de l'histoire", gameBtn && /feu/i.test(gameBtn.textContent));
check("la liste de choix disparait", !doc.querySelector(".choices-list"));
check("le texte de la scene reste lisible", /Veillée|Tiens-toi près du feu/.test(app.textContent));

/* ---------- Construction de l'ecran ---------- */

console.log("\n— Moteur du jeu —");
const campGame = api.STORY.scenes.campement.game;
api.MiniGame.run(campGame, () => {});

check("la scene de jeu est construite", !!doc.getElementById("mg-stage"));
check("le bouton Commencer est present", !!doc.getElementById("mg-go"));
check("une pastille par cartouche",
  doc.querySelectorAll("#mg-ammo i").length === campGame.ammo,
  doc.querySelectorAll("#mg-ammo i").length + " vues");

const bg = doc.querySelector(".mg-stage-bg");
check("le decor reprend l'image de la scene",
  bg && /campement\.jpg/.test(bg.style.backgroundImage));
check("le compteur demarre a zero",
  new RegExp(`0 \\/ ${campGame.total}`).test(doc.getElementById("mg-count").textContent));

/* ---------- Tir ---------- */

doc.getElementById("mg-go").click();
check("une silhouette apparait au demarrage", doc.querySelectorAll(".mg-target").length === 1);

const key = (k) => doc.dispatchEvent(new window.KeyboardEvent("keydown", { key: k, bubbles: true }));

const spentBefore = doc.querySelectorAll("#mg-ammo i.spent").length;
const coordBefore = doc.getElementById("mg-coord").textContent;

key("ArrowLeft");
key(" ");

check("le tir consomme une cartouche",
  doc.querySelectorAll("#mg-ammo i.spent").length === spentBefore + 1);
check("le viseur bouge au clavier",
  doc.getElementById("mg-coord").textContent !== coordBefore);
check("aucun resultat avant la fin", !doc.querySelector(".mg-result"));

/* ---------- Nettoyage ---------- */

api.MiniGame.shutdown();
check("shutdown retire l'ecran de jeu", !doc.getElementById("mg-stage"));

/* ---------- Les deux jeux sont complets ---------- */

console.log("\n— Configuration des jeux —");
for (const id of ["campement", "boutique"]) {
  const g = api.STORY.scenes[id].game;
  // On ne demande plus ammo >= total : la difficulté peut être > 1.
  // On vérifie juste que le ratio est raisonnable (au moins 0.5).
  check(`${id} : ratio ammo/total raisonnable`, g.ammo / g.total >= 0.5, `${g.ammo}/${g.total}`);
  check(`${id} : branche win complete`,
    !!(g.win && g.win.next && g.win.title && g.win.text && g.win.nova));
  check(`${id} : branche lose complete`,
    !!(g.lose && g.lose.next && g.lose.title && g.lose.text && g.lose.nova));
  check(`${id} : image de decor presente`, !!(g.image && g.image.endsWith(".jpg")));
}

/* ---------- Routage ---------- */

console.log("\n— Routage —");
const c = api.STORY.scenes.campement.game;
const b = api.STORY.scenes.boutique.game;

check("campement : reussite -> refuge", c.win.next === "refuge");
check("campement : echec -> mort_feu", c.lose.next === "mort_feu");
check("boutique : reussite -> velo", b.win.next === "velo");
check("boutique : echec -> mort_variante", b.lose.next === "mort_variante");
check("mort_feu est une fin", api.STORY.endings.mort_feu.type === "mort");
check("mort_variante est une fin", api.STORY.endings.mort_variante.type === "mort");

/* ---------- Les raccourcis clavier sont inactifs pendant un jeu ---------- */

api.showGame("boutique");
check("aucun choix actif pendant un jeu", api.currentChoices.length === 0);

/* ---------- go() aiguille correctement ---------- */

api.go("campement");
check("go() mène à l'ecran de jeu", !!doc.getElementById("btn-game"));

api.go("rue");
check("go() mène à une scene normale", !!doc.querySelector(".choices-list"));

api.go("mort_feu");
check("go() mène à une fin", /Fin/.test(app.textContent));

/* ---------- Le verrou anti-double-clic ---------- */

console.log("\n— Transition de page —");
api.go("reveil");

const readPage = () => Number((app.textContent.match(/Page (\d+)/) || [])[1] || 0);
const startPage = readPage();
const before = app.innerHTML;

const first = doc.querySelectorAll(".choice-btn")[0];
first.click();
first.click();
first.click();

setTimeout(() => {
  const endPage = readPage();
  check("trois clics n'avancent que d'une page",
    endPage === startPage + 1,
    `${startPage} -> ${endPage}`);
  check("le texte a bien change", app.innerHTML !== before);

  console.log();
  if (failures === 0) {
    console.log("moteur et mini-jeu : tous les tests passent");
  } else {
    console.log(`${failures} test(s) en echec`);
  }
  process.exit(failures === 0 ? 0 : 1);
}, 700);