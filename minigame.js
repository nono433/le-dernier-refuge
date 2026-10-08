/* ============================================================
   LE DERNIER REFUGE — mini-jeu de réflexes / tir
   ------------------------------------------------------------
   Une scène du livre peut porter un bloc "game". Le moteur
   remplace alors la liste de choix par un écran de jeu :
   des silhouettes sortent de l'obscurité et avancent vers le
   feu. Il faut les abattre avant qu'elles n'arrivent.

   Formats :
     - souris / tactile : viser et cliquer (ou toucher)
     - clavier          : flèches ou ZQSD/WASD pour viser,
                         Espace ou Entrée pour tirer

   Toutes les parties se ferment proprement : changer de scène
   en plein jeu ne laisse ni minuterie ni écouteur orphelin.
   ============================================================ */

const MiniGame = (() => {
  const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let stop = null;   // fonction de démontage de la partie en cours

  /* Marge de tir réduite : la difficulté monte. */
  const HIT_RADIUS_RATIO = 0.55;

  /* ---------- Petites aides ---------- */

  function make(tag, className, parent) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (parent) parent.appendChild(node);
    return node;
  }

  /* Nombre aléatoire dans un intervalle, arrondi à l'entier */
  function between(min, max) {
    return Math.round(min + Math.random() * (max - min));
  }

  /* ============================================================
     run(config, onFinish)
     ------------------------------------------------------------
     config :
       image      illustration de fond (assets/images/...)
       ammo       cartouches disponibles
       total      silhouettes à abattre
       spawnDelay intervalle moyen entre deux apparitions (ms)
       travel     durée moyenne de traversée (ms)
       brief      texte d'accroche
       nova       réplique de NOVA avant le début
       win        { title, text, nova }   en cas de réussite
       lose       { title, text, nova }   en cas d'échec
     onFinish :
       function (won) — appelée quand le joueur clique « Continuer »
     ============================================================ */

  function run(config, onFinish) {
    shutdown();

    const app = document.getElementById("app");
    const timers = [];
    const listeners = [];
    const nodes = [];

    /* ---------- Écran ---------- */

    app.innerHTML = `
      <div class="mg-screen">
        <div class="mg-brief">
          <p class="mg-kicker">Réflexes</p>
          <h2>${config.title || ""}</h2>
          <p>${config.brief || ""}</p>
          ${config.nova ? `<p class="mg-nova">◈ NOVA — ${config.nova}</p>` : ""}
        </div>

        <div class="mg-stage" id="mg-stage">
          <div class="mg-stage-bg"></div>
          <div class="mg-fire"></div>
          <div class="mg-cross"><i></i><i></i><i></i><i></i></div>
        </div>

        <div class="mg-hud">
          <div class="mg-ammo" id="mg-ammo"></div>
          <div>Silhouettes <span class="mg-count" id="mg-count">0 / ${config.total}</span></div>
          <div>Visée <span class="mg-count" id="mg-coord">—</span></div>
        </div>

        <p class="mg-hint">
          Souris ou doigt pour viser, clic ou tapotement pour tirer.
          Au clavier : <kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd> ou <kbd>ZQSD</kbd>/<kbd>WASD</kbd> pour viser, <kbd>Espace</kbd> pour tirer.
        </p>

        <div class="mg-start">
          <button class="mg-btn" id="mg-go">Commencer</button>
        </div>
      </div>`;

    const stage = document.getElementById("mg-stage");
    const ammoBox = document.getElementById("mg-ammo");
    const countBox = document.getElementById("mg-count");
    const coordBox = document.getElementById("mg-coord");
    const cross = stage.querySelector(".mg-cross");
    nodes.push(stage);

    /* Le décor est l'illustration de la scène, ce qui évite tout
       fichier image supplémentaire. */
    stage.querySelector(".mg-stage-bg").style.backgroundImage = `url("${config.image}")`;

    /* ---------- État ---------- */

    let ammo = config.ammo;
    let killed = 0;
    let spawned = 0;
    let alive = 0;
    let finished = false;
    let running = false;

    const aim = { x: 0, y: 0 };
    const targets = [];

    /* ---------- Cartouches ---------- */

    for (let i = 0; i < config.ammo; i++) {
      nodes.push(make("i", "", ammoBox));
    }

    /* ---------- Géométrie ---------- */

    function size() {
      const rect = stage.getBoundingClientRect();
      return { w: rect.width, h: rect.height, cx: rect.width / 2, cy: rect.height / 2 };
    }

    function stagePoint(evt) {
      const rect = stage.getBoundingClientRect();
      return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
    }

    /* ---------- Réticule ---------- */

    function moveCross(x, y) {
      const { w, h } = size();
      aim.x = Math.max(0, Math.min(w, x));
      aim.y = Math.max(0, Math.min(h, y));
      cross.style.left = aim.x + "px";
      cross.style.top = aim.y + "px";
      coordBox.textContent = `${Math.round(aim.x)} , ${Math.round(aim.y)}`;
    }

    /* ---------- Apparition d'une silhouette ---------- */

    function spawn() {
      if (finished || spawned >= config.total) return;
      spawned++;
      alive++;

      const { w, h, cx, cy } = size();
      const node = make("div", "mg-target", stage);
      nodes.push(node);

      /* Un point de départ quelconque sur le pourtour du décor */
      const edge = between(0, 3);
      const fromX = w + 30;
      const fromY = h + 30;
      let x;
      let y;

      if (edge === 0)      { x = Math.random() * w;         y = fromY; }
      else if (edge === 1) { x = Math.random() * w;         y = -30;  }
      else if (edge === 2) { x = fromX;                    y = Math.random() * h; }
      else                 { x = -30;                      y = Math.random() * h; }

      /* Les dernières silhouettes pressent un peu plus : on raccourcit
         le trajet au lieu d'augmenter le nombre d'adversaires, pour
         garder la scène lisible. */
      const ramp = REDUCED_MOTION ? 1 : 1 - (spawned - 1) * 0.045;
      const travel = Math.max(1400, Math.round(config.travel * ramp * (0.85 + Math.random() * 0.3)));

      node.style.left = x + "px";
      node.style.top = y + "px";

      const dx = cx - x;
      const dy = cy - y;
      const target = { node, timer: null };

      /* On force un reflow pour que la transition démarre vraiment. */
      void node.offsetWidth;

      node.style.transition = `transform ${travel}ms linear`;
      node.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

      target.timer = setTimeout(() => {
        targets.splice(targets.indexOf(target), 1);
        alive--;
        end(false);
      }, travel);

      targets.push(target);
    }

    /* ---------- Tir ---------- */

    function shoot(x, y) {
      if (finished || !running || ammo <= 0) return;

      ammo--;
      flash();
      tracer(x, y);

      /* La cible la plus proche du point visé, parmi celles encore debout */
      let hit = null;
      let best = Infinity;

      for (const target of targets) {
        const rect = target.node.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        const cx = rect.left - stageRect.left + rect.width / 2;
        const cy = rect.top - stageRect.top + rect.height / 2;
        const d = Math.hypot(cx - x, cy - y);

        if (d < rect.width * HIT_RADIUS_RATIO && d < best) {
          best = d;
          hit = target;
        }
      }

      if (hit) {
        clearTimeout(hit.timer);
        targets.splice(targets.indexOf(hit), 1);
        alive--;
        killed++;
        hit.node.classList.add("mg-target--hit");
        setTimeout(() => hit.node.remove(), REDUCED_MOTION ? 0 : 240);
      } else {
        // Tiré dans le vide : un éclat marque l'impact, sinon le joueur
        // ne sait pas s'il a mal visé ou si le tir n'a pas parti.
        spark(x, y);
      }

      refresh();

      /* Plus rien à abattre et plus rien à apparaître : la veillée est
         terminée. On tranche ici plutôt que d'attendre le filet de
         sécurité, pour ne pas laisser le joueur attendre. */
      if (killed >= config.total && alive === 0) {
        end(true);
        return;
      }

      if (ammo <= 0 && (alive > 0 || spawned < config.total)) {
        end(false);
        return;
      }
    }

    function flash() {
      stage.classList.add("mg-stage--firing");
      setTimeout(() => stage.classList.remove("mg-stage--firing"), 90);
    }

    /* Éclat au point d'impact d'un tir manqué */
    function spark(x, y) {
      const dot = make("div", "mg-spark", stage);
      nodes.push(dot);
      dot.style.left = x + "px";
      dot.style.top = y + "px";
      setTimeout(() => dot.remove(), REDUCED_MOTION ? 0 : 260);
    }

    function tracer(x, y) {
      const { cx, cy } = size();
      const line = make("div", "mg-tracer", stage);
      nodes.push(line);
      const dist = Math.hypot(x - cx, y - cy);
      const angle = Math.atan2(y - cy, x - cx);

      line.style.width = dist + "px";
      line.style.transform = `rotate(${angle}rad)`;
      line.style.width = dist + "px";
      line.classList.add("mg-tracer--go");
      setTimeout(() => line.remove(), REDUCED_MOTION ? 0 : 200);
    }

    /* ---------- Fin de partie ---------- */

    function end(won) {
      if (finished) return;
      finished = true;
      running = false;

      for (const target of targets) {
        clearTimeout(target.timer);
        target.node.remove();
      }
      targets.length = 0;

      showResult(won);
    }

    function showResult(won) {
      const part = won ? config.win : config.lose;

      const panel = make("div", `mg-result ${won ? "win" : "lose"}`, stage);
      nodes.push(panel);

      /* Une victoire peut se conclure par une cinématique.
         Le champ "video" du jeu désigne la vidéo à lire.
         Elle ne se joue qu'en cas de réussite : l'échec
         garde l'écran de résultat habituel. */
      const cinematic = won && config.video
        ? `<video class="mg-video" src="${config.video}" autoplay muted loop playsinline></video>`
        : "";

      panel.innerHTML = `
        ${cinematic}
        <h3>${part.title}</h3>
        <p>${part.text}</p>
        <p class="mg-nova">◈ NOVA — ${part.nova}</p>
        <button class="mg-btn" id="mg-next">Continuer</button>`;

      stage.style.cursor = "default";

      const next = panel.querySelector("#mg-next");
      next.addEventListener("click", () => {
        shutdown();
        onFinish(won);
      });
    }

    /* ---------- Compteurs ---------- */

    function refresh() {
      Array.from(ammoBox.children).forEach((shell, i) => {
        shell.classList.toggle("spent", i >= ammo);
      });
      countBox.textContent = `${killed} / ${config.total}`;
    }

    /* ---------- Danger : la vignette se referme ---------- */

    function danger() {
      let closest = Infinity;

      for (const target of targets) {
        const rect = target.node.getBoundingClientRect();
        const { cx, cy } = size();
        const d = Math.hypot(rect.left + rect.width / 2 - cx, rect.top + rect.height / 2 - cy);
        if (d < closest) closest = d;
      }

      const { w, h } = size();
      const max = Math.hypot(w, h) / 2;
      const ratio = Math.max(0, Math.min(1, 1 - closest / max));
      stage.style.setProperty("--mg-danger", (0.55 + ratio * 0.45).toFixed(2));
    }

    /* ---------- Entrées : souris, tactile, clavier ---------- */

    function on(events, handler, opts) {
      for (const name of events) {
        document.addEventListener(name, handler, opts);
        listeners.push([name, handler, opts]);
      }
    }

    on(["pointermove"], (e) => {
      if (!running) return;
      const p = stagePoint(e);
      moveCross(p.x, p.y);
      danger();
    });

    on(["pointerdown"], (e) => {
      if (!running) return;
      const p = stagePoint(e);
      moveCross(p.x, p.y);
      shoot(p.x, p.y);
    });

    on(["keydown"], (e) => {
      if (!running) return;

      const step = e.shiftKey ? 26 : 11;
      const { cx, cy } = size();
      let handled = true;

      switch (e.key) {
        case "ArrowLeft":  case "q": case "Q": moveCross(aim.x - step, aim.y); break;
        case "ArrowRight": case "d": case "D": moveCross(aim.x + step, aim.y); break;
        case "ArrowUp":    case "z": case "Z": case "w": case "W": moveCross(aim.x, aim.y - step); break;
        case "ArrowDown":  case "s": case "S": moveCross(aim.x, aim.y + step); break;
        case " ": case "Enter":
          shoot(aim.x, aim.y);
          break;
        default:
          handled = false;
      }

      if (handled) {
        e.preventDefault();
        danger();
      }
    });

    on(["contextmenu"], (e) => {
      if (running) e.preventDefault();
    });

    /* Le réticule démarre au centre, là où se trouve le feu */
    const initial = size();
    moveCross(initial.cx, initial.cy);

    /* ---------- Démarrage ---------- */

    const go = document.getElementById("mg-go");

    const launch = () => {
      if (running) return;
      running = true;
      go.disabled = true;
      go.textContent = "En cours…";
      coordBox.textContent = "en place";

      const { cx, cy } = size();
      moveCross(cx, cy);

      /* Une première cible tout de suite, sinon l'attente paraît longue */
      spawn();

      /* La dernière silhouette apparaît au plus tard après
         spawnDelay x (total - 1) : c'est ce délai qui borne la partie. */
      let lastSpawn = 0;
      for (let i = 1; i < config.total; i++) {
        lastSpawn = config.spawnDelay * i * 1.2; // 1.2 = marge du jeté aléatoire
        timers.push(setTimeout(spawn, config.spawnDelay * i * (0.8 + Math.random() * 0.4)));
      }

      /* Filet de sécurité : une fois la dernière apparue, elle finit
         toujours par arriver au feu. Sans ce garde-fou, une partie
         pourrait rester bloquée si un événement de la page est perdu. */
      timers.push(
        setTimeout(() => {
          if (finished) return;
          if (killed >= config.total) end(true);
          else if (alive > 0 || spawned < config.total) end(false);
        }, lastSpawn + config.travel * 2 + 2000)
      );
    };

    go.addEventListener("click", launch);
    on(["keydown"], (e) => {
      if (!running && (e.key === " " || e.key === "Enter") && document.activeElement === go) {
        e.preventDefault();
        launch();
      }
    });

    /* ---------- Démontage ---------- */

    shutdown = function () {
      for (const id of timers) clearTimeout(id);
      for (const [name, handler, opts] of listeners) {
        document.removeEventListener(name, handler, opts);
      }
      for (const node of nodes) node.remove();
      listeners.length = 0;
      timers.length = 0;
      nodes.length = 0;
      stop = null;
    };

    stop = shutdown;
    refresh();
  }

  /* Coupe une partie en cours, si elle existe (changement de page,
     retour au menu, redémarrage). */
  function shutdown() {
    if (stop) stop();
  }

  return { run, shutdown };
})();