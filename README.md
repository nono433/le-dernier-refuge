# Le Dernier Refuge

> *La ville est morte. Tu es à moitié machine. Trouve le refuge avant qu'il ne soit trop tard.*

Un **livre dont tu es le héros** interactif et jouable directement dans le navigateur, dans un univers post-apocalyptique zombie.

Aucune installation, aucun compte, aucune dépendance : ouvrez `index.html` et vous êtes déjà dans l'histoire.

**▶️ [Jouer en ligne](https://nono433.github.io/le-dernier-refuge/)**

---

## Le principe

Au réveil, vous ne vous souvenez de rien : pas l'alerte, pas la fuite, pas la panne. Une IA intégrée, **NOVA**, vous guide à travers les rues mortes. Vous êtes à la fois humain et machine — et vous ne savez pas encore ce que cela signifie.

À chaque page, vous choisissez. Vos choix modifient votre parcours, débloquent des répliques de NOVA et ouvrent des chemins que d'autres parcours ne verront jamais.

### Durée au choix

| Durée   | Description                      | Scènes   |
| ------- | -------------------------------- | -------- |
| 3 min   | Histoire courte et intense       | 6 à 8    |
| 5 min   | Aventure plus développée         | 10 à 12  |
| 10 min  | L'expérience complète            | 18 à 22  |

### Ce qui vous attend

- **39 scènes** illustrées, du trottoir à la lisière de la forêt
- **8 fins** — dont **4 morts** et **4 issues** aux tons très différents
- Des **drapeaux narratifs** : ce que vous découvrez change ce que NOVA vous dit
- Des **choix conditionnels** : certains ne s'affichent qu'en mode 10 minutes, ou après avoir trouvé un objet
- **2 mini-jeux de réflexes et de tir**, où votre score décide de la suite de l'histoire

---

## Jouer

### En ligne

Rendez-vous sur **[https://nono433.github.io/le-dernier-refuge/](https://nono433.github.io/le-dernier-refuge/)**

### En local

Le livre est 100 % statique. Deux options :

**Le plus simple** — téléchargez le dossier, puis ouvrez `index.html` dans votre navigateur. Ça marche.

**Avec un petit serveur local** (recommandé, certains navigateurs sont plus stricts en `file://`) :

```bash
git clone https://github.com/nono433/le-dernier-refuge.git
cd le-dernier-refuge
python -m http.server 8000
# puis http://localhost:8000
```

### Raccourcis clavier

Les choix sont numérotés : **appuyez sur `1`, `2`, `3`…** pour faire avancer l'histoire sans toucher la souris.

---

## Les mini-jeux

Deux scènes ne proposent pas des choix mais un **jeu de réflexes et de tir**. Des silhouettes sortent de l'ombre et avancent vers le feu : il faut les abattre avant qu'elles n'arrivent.

| Scène        | Situation                            | Silhouettes | Cartouches |
| ------------ | ------------------------------------- | ----------- | ---------- |
| Le Campement | Tenir la feuillée jusqu'à l'aube      | 10          | 10         |
| La Boutique  | Frapper la variante avant qu'elle bondisse | 3        | 3          |

Le résultat change l'histoire : la réussite ouvre une voie, l'échec mène à une fin.

| Jeu            | Réussite                      | Échec               |
| -------------- | ----------------------------- | ------------------- |
| Le Campement   | Le Refuge (`sentier` posé)   | Fin — Le Feu Éteint |
| La Boutique    | Le Vélo (`chevalier` posé)    | Fin — La Variante   |

**Pour jouer** : viser et tirer à la souris ou au doigt. Au clavier, les flèches ou `ZQSD` déplacent le viseur et `Espace` tire. Le décor est l'illustration de la scène elle-même : aucun fichier image supplémentaire n'est nécessaire.

### Écrire un mini-jeu

Ajoutez un bloc `game` à n'importe quelle scène. Les choix habituels restent accessibles : le joueur peut passer son chemin.

```js
ma_scene: {
  title: "Le Titre",
  image: "assets/images/ma_scene.jpg",
  text: ["..."],
  nova: ["..."],
  choices: [{ text: "Fuir sans se retourner", next: "rue" }],
  game: {
    action: "Tenir la position",     // libellé du bouton
    image: "assets/images/ma_scene.jpg",  // décor du jeu
    title: "Veillée",
    brief: "Ce que le joueur doit faire.",
    ammo: 10,          // cartouches disponibles
    total: 10,         // silhouettes à abattre
    spawnDelay: 2300,  // intervalle moyen d'apparition (ms)
    travel: 7600,      // durée moyenne de traversée (ms)
    win:  { title, text, nova, next: "refuge", set: "sentier" },
    lose: { title, text, nova, next: "mort_feu" }
  }
}
```

`next` et `set` de `win` et `lose` se comportent comme ceux d'un choix : une scène de jeu peut donc mener vers une autre scène, une fin, ou poser un drapeau. Astuce : gardez `ammo` supérieur ou égal à `total` pour que le joueur ne puisse pas perdre par maladresse.

Le moteur ménage le joueur : il respecte `prefers-reduced-motion`, autorise le jeu au clavier seul, et se démonte proprement si le joueur change de page en plein jeu. Un filet de sécurité garantit qu'une partie se termine toujours, même si la cible finit par arriver.

---

## Écriture d'une scène

L'histoire est un pur objet JavaScript dans [`data/story.js`](data/story.js). Pas de build, pas de framework — vous éditez et rechargez la page.

```js
ma_scene: {
  title: "Le Titre affiché",
  image: "assets/images/ma_scene.jpg",
  text: [
    "Premier paragraphe, à la deuxième personne.",
    "Deuxième paragraphe."
  ],
  nova: "Une réplique de NOVA.",           // chaîne ou tableau
  novaIf: { radio: "Réplique si le drapeau « radio » est actif." },
  choices: [
    { text: "Libellé du choix", next: "scene_suivante" },
    { text: "Choix long uniquement", next: "autre", min: 10 },
    { text: "Nécessite le drapeau", next: "autre", requires: "radio" },
    { text: "Débloque le drapeau", next: "autre", set: "radio" }
  ]
}
```

### Les règles du moteur

| Champ       | Rôle                                                                   |
| ----------- | ---------------------------------------------------------------------- |
| `title`     | Nom affiché dans l'en-tête de la page                                 |
| `image`     | Chemin de l'illustration dans `assets/images/`                         |
| `text`      | Tableau de paragraphes, **toujours à la deuxième personne**            |
| `nova`      | Réplique(s) de l'IA — chaîne ou tableau                               |
| `novaIf`    | Répliques conditionnelles selon les drapeaux actifs                     |
| `choices`   | Les choix affichés. **`text` ne doit jamais révéler la conséquence**   |
| `min`       | Durée minimale requise pour que le choix s'affiche (3, 5 ou 10)        |
| `requires`  | Drapeau requis — chaîne, ou tableau = « au moins un des drapeaux »     |
| `set`       | Drapeau activé quand le joueur prend ce choix                          |

### Et les fins ?

Une fin est une entrée de `STORY.endings` au lieu de `STORY.scenes`, avec un `text` et une illustration. Ajoutez `"type": "mort"` pour déclencher l'écran de fin rouge.

---

## Structure du projet

```
le-dernier-refuge/
├── index.html              Point d'entrée
├── style.css               Styles, animations, arrière-plan cendres
├── minigame.css            Styles du mini-jeu (scène sombre, viseur)
├── script.js               Moteur du jeu (rendu, choix, transitions)
├── minigame.js             Moteur du mini-jeu de reflexes / tir
├── data/
│   └── story.js            L'histoire : scènes, fins et mini-jeux
├── assets/
│   └── images/             45 illustrations JPEG + versions SVG
└── tools/                  Génération d'images et contrôles qualité
```

## Les illustrations

Les 45 images de `assets/images/` sont des JPEG générés par **ComfyUI / SDXL** (1024×768), dans un style « graphic novel » sombre et désaturé.

Deux outils Python accompagnent le projet :

```bash
# Contrôle qualité : luminance, contraste, dominante rouge/teal
python tools/qa_images.py

# Régénère via ComfyUI (Comfy Desktop doit tourner sur 127.0.0.1:8188)
python tools/generate_images.py            # seulement ce qui manque
python tools/generate_images.py --force    # tout
python tools/generate_images.py reveil rue # scènes précises

# Bascule les références .svg vers les .jpg générés
python tools/update_paths.py
```

`qa_images.py` liste les images à régénérer et affiche la commande correspondante.

> Les illustrations sont générées localement via l'API de ComfyUI. Le dépôt ne contient que les résultats — aucun checkpoint, aucun script de téléchargement.

---

## Contrôles qualité

### L'histoire

Vérifie que rien n'est cassé avant de publier : cibles pointant dans le vide, images manquantes, branches incomplètes, scènes inaccessibles, images orphelines.

```bash
python tools/qa_story.py
```

`node` est nécessaire pour lire `data/story.js`. Le script se termine avec le code 1 en cas de problème bloquant, ce qui permet de l'utiliser en intégration continue.

### Le moteur et le mini-jeu

```bash
npm install --no-save jsdom   # une fois, pour les tests
node tools/qa_engine.js       # affichage, tir, nettoyage, routage, verrou de page
node tools/qa_play.js         # parties complètes : victoire et échec
```

Ces deux scripts font tourner le vrai moteur dans un DOM simulé. `qa_play.js` joue une partie entière en abattant tout, et une autre en ne tiring jamais : il vérifie que la boucle se termine dans les deux cas et que le joueur n'arrive jamais sur un écran bloqué.

---

## Compatibilité

Navigateurs modernes uniquement. Aucune installation nécessaire — le livre ne charge que sa police.

- `prefers-reduced-motion` est respecté, y compris dans le mini-jeu
- Fonctionne au clavier, jeu compris (flèches ou `ZQSD` pour viser, `Espace` pour tirer)
- Responsive : l'interface s'adapte au mobile, le jeu se joue au doigt

---

## Licence

Code : MIT. Texte et illustrations : © l'auteur — voir [LICENSE](LICENSE).

Le livre est publié pour être lu, partagé et modifié. Forkez-le, traduisez-le, ajoutez vos propres fins.
