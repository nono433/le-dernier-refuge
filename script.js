/* ============================================================
   LE DERNIER REFUGE — moteur de livre dont tu es le héros
   HTML + CSS + JavaScript vanilla. Aucun framework.
   ============================================================ */

const app = document.getElementById("app");

const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let duration = 0;      // durée choisie : 3, 5 ou 10
let flags = {};        // drapeaux narratifs (ex : "radio", "labo")
let page = 0;          // compteur de pages (affiché dans l'en-tête)
let currentChoices = []; // choix visibles sur la page courante

// Estimation du nombre de scènes par durée (pour la barre de progression)
const ESTIMATED_PAGES = { 3: 9, 5: 13, 10: 23 };

/* ---------- Arrière-plan : cendres qui montent ---------- */

function spawnEmbers() {
  const host = document.getElementById("bg-embers");
  if (!host || REDUCED_MOTION) return;

  const count = window.innerWidth < 640 ? 22 : 48;
  let html = "";

  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    const kind = roll < 0.6 ? "warm" : roll < 0.82 ? "ash" : "cold";
    const size = (kind === "ash" ? 2 : 1.5) + Math.random() * 3;
    const duration = 16 + Math.random() * 24;
    const opacity = 0.25 + Math.random() * 0.6;

    html +=
      `<span class="ember ember-${kind}" style="` +
      `--x:${(Math.random() * 100).toFixed(2)}vw;` +
      `--s:${size.toFixed(1)}px;` +
      `--d:${duration.toFixed(1)}s;` +
      `--dl:${(-Math.random() * duration).toFixed(1)}s;` +
      `--drift:${(Math.random() * 140 - 70).toFixed(0)}px;` +
      `--o:${opacity.toFixed(2)}"></span>`;
  }

  host.innerHTML = html;
}

/* ---------- Utilitaires ---------- */

/* Voile de transition : la page « s'éteint » puis la suivante apparaît.

   Un verrou empêche deux tours de page de s'empiler : sans lui, un
   double-clic (ou deux touches de choice enfoncées ensemble) déclencherait
   deux rendus successifs, et le compteur de pages sauterait d'un coup. */
let turning = false;

function turnPage(render) {
  if (turning) return;
  turning = true;

  if (REDUCED_MOTION) {
    render();
    turning = false;
    return;
  }

  const veil = document.createElement("div");
  veil.className = "page-veil";
  document.body.appendChild(veil);

  setTimeout(() => {
    render();
    veil.classList.add("out");
    setTimeout(() => veil.remove(), 450);
    turning = false;
  }, 260);
}


function hasFlag(req) {
  if (Array.isArray(req)) return req.some((f) => flags[f]);
  return !!flags[req];
}

function toArray(value) {
  return value === undefined ? [] : Array.isArray(value) ? value : [value];
}

/* ---------- Écran : menu ---------- */

function showMenu() {
  MiniGame.shutdown();
  currentChoices = [];
  app.innerHTML = `
    <div class="screen menu-screen">
      <div class="book-cover">
        <img src="assets/images/menu.jpg" alt="Illustration de couverture : une ville en ruines sous la lune, une silhouette à l'œil rouge">
      </div>
      <h1 class="game-title">Le Dernier Refuge</h1>
      <p class="game-subtitle">Un livre dont tu es le héros</p>
      <div class="divider">❖</div>
      <p class="game-tagline">La ville est morte. Tu es à moitié machine.<br>Trouve le refuge avant qu'il ne soit trop tard.</p>
      <button class="btn btn-primary" id="btn-new">Nouvelle aventure</button>
    </div>`;
  document.getElementById("btn-new").addEventListener("click", () => turnPage(showDuration));
}

/* ---------- Écran : choix de la durée ---------- */

function showDuration() {
  currentChoices = [];
  app.innerHTML = `
    <div class="screen duration-screen">
      <h2 class="screen-title">Choisis la durée de ton aventure</h2>
      <div class="duration-options">
        <button class="duration-card" data-min="3">
          <span class="duration-time">3 minutes</span>
          <span class="duration-desc">Une histoire courte et intense.<br>6 à 8 scènes.</span>
        </button>
        <button class="duration-card" data-min="5">
          <span class="duration-time">5 minutes</span>
          <span class="duration-desc">Une aventure plus développée.<br>10 à 12 scènes.</span>
        </button>
        <button class="duration-card" data-min="10">
          <span class="duration-time">10 minutes</span>
          <span class="duration-desc">L'expérience complète.<br>18 à 22 scènes.</span>
        </button>
      </div>
      <button class="btn btn-ghost" id="btn-back">Retour</button>
    </div>`;

  document.querySelectorAll(".duration-card").forEach((btn) =>
    btn.addEventListener("click", () =>
      turnPage(() => startAdventure(Number(btn.dataset.min)))
    )
  );
  document.getElementById("btn-back").addEventListener("click", () => turnPage(showMenu));
}

/* ---------- Démarrage ---------- */

function startAdventure(min) {
  duration = min;
  flags = {};
  page = 0;
  showScene("reveil");
}

/* ---------- Écran : scène ---------- */

function showScene(id) {
  MiniGame.shutdown();
  const scene = STORY.scenes[id];
  if (!scene) {
    showMenu();
    return;
  }
  page++;

  // Filtre les choix selon la durée choisie et les drapeaux obtenus
  const choices = (scene.choices || []).filter(
    (c) => (!c.min || duration >= c.min) && (!c.requires || hasFlag(c.requires))
  );
  currentChoices = choices;

  const novaLines = toArray(scene.nova);
  const extraNova = Object.entries(scene.novaIf || {})
    .filter(([f]) => flags[f])
    .map(([, text]) => text);

  const estimated = ESTIMATED_PAGES[duration] || 23;
  const progress = Math.min(100, Math.round((page / estimated) * 100));

  app.innerHTML = `
    <div class="screen scene-screen">
      <div class="page-header">
        <span class="page-chapter">${scene.title}</span>
        <span class="nova-status"><span class="nova-dot"></span>NOVA</span>
        <span class="page-number">Page ${page}</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width: ${progress}%"></div></div>
      <div class="scene-image">
        <img src="${scene.image}" alt="Illustration : ${scene.title}">
      </div>
      <div class="scene-text">
        ${scene.text.map((p) => `<p>${p}</p>`).join("")}
        ${[...novaLines, ...extraNova]
          .map((l) => `<p class="nova-line"><span class="nova-marker">◈ NOVA</span>${l}</p>`)
          .join("")}
      </div>
      <div class="choices">
        <p class="choices-label">Que fais-tu ?</p>
        <ol class="choices-list">
          ${choices
            .map(
              (c, i) => `
            <li>
              <button class="choice-btn" data-index="${i}">
                <span class="choice-num">${i + 1}</span>
                <span class="choice-text">${c.text}</span>
              </button>
            </li>`
            )
            .join("")}
        </ol>
      </div>
    </div>`;

  document.querySelectorAll(".choice-btn").forEach((btn) =>
    btn.addEventListener("click", () => choose(choices[Number(btn.dataset.index)]))
  );

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- Scène de mini-jeu : réflexes / tir ----------
   Remplace la liste de choix par un bouton qui lance le jeu.
   Le résultat (réussite ou échec) envoie vers une autre scène
   et peut poser un drapeau.                                      */

function showGame(id) {
  const scene = STORY.scenes[id];
  if (!scene || !scene.game) {
    showScene(id);
    return;
  }

  page++;
  currentChoices = []; // aucun choix numérique pendant le jeu

  const estimated = ESTIMATED_PAGES[duration] || 23;
  const progress = Math.min(100, Math.round((page / estimated) * 100));

  app.innerHTML = `
    <div class="screen scene-screen">
      <div class="page-header">
        <span class="page-chapter">${scene.title}</span>
        <span class="nova-status"><span class="nova-dot"></span>NOVA</span>
        <span class="page-number">Page ${page}</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width: ${progress}%"></div></div>
      <div class="scene-image">
        <img src="${scene.image}" alt="Illustration : ${scene.title}">
      </div>
      <div class="scene-text">
        ${scene.text.map((p) => `<p>${p}</p>`).join("")}
        ${toArray(scene.nova)
          .map((l) => `<p class="nova-line"><span class="nova-marker">◈ NOVA</span>${l}</p>`)
          .join("")}
      </div>
      <div class="choices">
        <p class="choices-label">Que fais-tu ?</p>
        <button class="choice-btn" id="btn-game">
          <span class="choice-num">◈</span>
          <span class="choice-text">${scene.game.action}</span>
        </button>
      </div>
    </div>`;

  document.getElementById("btn-game").addEventListener("click", () => {
    turnPage(() => launchGame(scene));
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function launchGame(scene) {
  const game = scene.game;

  MiniGame.run(game, (won) => {
    const branch = won ? game.win : game.lose;

    if (branch.set) flags[branch.set] = true;

    turnPage(() => go(branch.next));
  });
}

/* Aiguille vers la bonne écran selon la cible : scène de jeu,
   scène normale, ou fin. */
function go(id) {
  const scene = STORY.scenes[id];

  if (scene && scene.game) showGame(id);
  else if (scene) showScene(id);
  else showEnding(id);
}

/* ---------- Choix du joueur ---------- */

function choose(choice) {
  if (!choice) return;
  if (choice.set) flags[choice.set] = true;

  turnPage(() => go(choice.next));
}

/* ---------- Écran : fin ---------- */

function showEnding(id) {
  MiniGame.shutdown();
  const ending = STORY.endings[id];
  if (!ending) {
    showMenu();
    return;
  }
  page++;
  currentChoices = []; // plus de choix actifs sur l'écran de fin

  const novaLines = toArray(ending.nova);

  app.innerHTML = `
    <div class="screen ending-screen ${ending.type === "mort" ? "ending-death" : ""}">
      <div class="page-header">
        <span class="page-chapter">${ending.title}</span>
        <span class="page-number">Page ${page}</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width: 100%"></div></div>
      <div class="scene-image">
        <img src="${ending.image}" alt="Illustration : ${ending.title}">
      </div>
      <div class="scene-text">
        ${ending.text.map((p) => `<p>${p}</p>`).join("")}
        ${novaLines
          .map((l) => `<p class="nova-line"><span class="nova-marker">◈ NOVA</span>${l}</p>`)
          .join("")}
      </div>
      <div class="ending-actions">
        <button class="btn btn-primary" id="btn-restart">Recommencer</button>
        <button class="btn btn-ghost" id="btn-menu">Retour au menu</button>
      </div>
    </div>`;

  document.getElementById("btn-restart").addEventListener("click", () =>
    turnPage(() => startAdventure(duration))
  );
  document.getElementById("btn-menu").addEventListener("click", () => turnPage(showMenu));

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- Raccourcis clavier (1 à 4) ---------- */

document.addEventListener("keydown", (e) => {
  const n = Number(e.key);
  if (n >= 1 && n <= currentChoices.length) {
    choose(currentChoices[n - 1]);
  }
});

/* ---------- Démarrage ---------- */

spawnEmbers();
showMenu();
