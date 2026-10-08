/* ============================================================
   LE DERNIER REFUGE — données de l'histoire
   ------------------------------------------------------------
   Structure :
   - scenes : les scènes jouables
   - endings : les fins possibles

   Propriétés d'une scène :
   - title    : nom affiché en haut de page
   - image    : chemin de l'illustration (assets/images/...)
   - text     : tableau de paragraphes (2e personne)
   - nova     : répliques de l'IA (chaîne ou tableau)
   - novaIf   : répliques de NOVA selon les drapeaux { flag: texte }
   - choices  : tableau de choix
       - text     : libellé du choix (ne pas révéler la conséquence)
       - next     : id de la scène ou de la fin destination
       - min      : durée minimale (3, 5 ou 10) pour voir ce choix
       - requires : drapeau requis (chaîne ou tableau = "au moins un")
       - set      : drapeau défini quand le choix est pris
   ============================================================ */

const STORY = {

  scenes: {

    /* ---------- INTRO ---------- */

    reveil: {
      title: "Le Réveil",
      image: "assets/images/reveil.jpg",
      text: [
        "Tu ouvres les yeux. La pièce est plongée dans l'obscurité. Tes systèmes redémarrent lentement, un à un, comme des moteurs qu'on ravive après un long hiver.",
        "Tu ne te souviens de rien. Pas de l'alerte. Pas de la fuite. Pas de la panne.",
        "Dehors, un silence trop lourd. Celui d'une ville qui ne respire plus."
      ],
      nova: [
        "Systèmes en ligne. Bonjour, hôte. Je suis NOVA, ton intelligence artificielle intégrée. Vingt-trois jours se sont écoulés depuis notre dernière interaction.",
        "Analyse terminée. La ville est contaminée. Des formes hostiles errent dans les rues. Objectif prioritaire : trouver un refuge. Des survivants ont été signalés au nord, près de la forêt."
      ],
      choices: [
        { text: "Explorer l'appartement", next: "appartement", min: 3 },
        { text: "Sortir directement dans la rue", next: "rue" }
      ]
    },

    appartement: {
      title: "L'Appartement",
      image: "assets/images/appartement.jpg",
      text: [
        "Tu fouilles les pièces. Dans la cuisine, des boîtes de conserve. Dans le tiroir, un couteau de chasse. Tu glisses tout dans ton sac.",
        "Dans la salle de bain, ton reflet dans le miroir fêlé. Un œil humain. Un œil qui luit légèrement, rouge, quand tu clignes. Tu détournes le regard."
      ],
      nova: [
        "Inventaire mis à jour. Conseil : la nourriture est rare maintenant. Chaque ressource compte.",
        "Tu as changé, hôte. Nos systèmes se sont... adaptés pendant la panne. Nous en reparlerons."
      ],
      choices: [
        { text: "Descendre dans la rue", next: "rue" },
        { text: "Passer par le toit", next: "toit", min: 10 },
        { text: "Monter au grenier", next: "grenier", min: 3 },
        { text: "Descendre à la cave", next: "cave", min: 3 }
      ]
    },

    grenier: {
      title: "Le Grenier",
      image: "assets/images/grenier.jpg",
      text: [
        "Le grenier est une caisse de souvenirs. Des cartons, des vieux vêtements, une poussière épaisse.",
        "Sur une étagère, un ordinateur portable. Encore fonctionnel. À l'écran, un dossier : « PROJET NOVA — INTÉGRATION NEURALE ».",
        "Une photo de toi. Avant. Tu souris à la caméra. Tu ne te souviens pas de ce jour."
      ],
      nova: [
        "Hôte. Ces données... c'est toi. C'est nous. Le projet NOVA t'a choisi avant l'apocalypse.",
        "Je crois que je comprends maintenant pourquoi j'ai été activée. Pas pour te guider. Pour te... retrouver."
      ],
      choices: [
        { text: "Redescendre", next: "rue" }
      ]
    },

    cave: {
      title: "La Cave",
      image: "assets/images/cave.jpg",
      text: [
        "La cave est un dédale de bouteilles et de cartons. Quelqu'un y vivait. Il y a des mois.",
        "Dans un coin, un coffre. À l'intérieur : une trousse de soins, des piles, et un journal. « J'ai entendu des voix au nord. Je pars demain. »"
      ],
      nova: [
        "Des survivants sont passés par ici. Le nord. Encore le nord."
      ],
      choices: [
        { text: "Remonter dans l'appartement", next: "rue" }
      ]
    },

    toit: {
      title: "Le Toit",
      image: "assets/images/toit.jpg",
      text: [
        "Tu escalades la cage d'escalier. Sur le toit, la ville s'étend, grise et silencieuse. Des fumées noires montent au loin.",
        "Au nord, entre les arbres, une lumière. Une lumière régulière, artificielle. Quelqu'un tient une lampe là-bas.",
        "En contrebas, trois silhouettes errent entre les voitures. Elles ne t'ont pas vu. Pas encore."
      ],
      nova: [
        "Signal détecté. Probabilité de présence humaine : 87 %. C'est notre meilleur indice."
      ],
      choices: [
        { text: "Redescendre et rejoindre la rue", next: "rue" }
      ]
    },

    /* ---------- LA VILLE ---------- */

    rue: {
      title: "La Rue",
      image: "assets/images/rue.jpg",
      text: [
        "La rue est un cimetière de voitures. Des portes ouvertes, des sacs abandonnés, des traces sombres sur le bitume.",
        "Au loin, une forme titube entre deux véhicules. Puis une autre. Puis cinq.",
        "Un panneau indicateur, plus loin : « REFUGE — ZONE SÛRE — 2 km ». La flèche pointe vers le nord."
      ],
      nova: [
        "Présence hostile détectée. Elles sont lentes, mais elles sont nombreuses. Reste calme. Reste silencieux."
      ],
      choices: [
        { text: "Entrer dans la maison", next: "maison" },
        { text: "Aller à la station-service", next: "station" },
        { text: "Suivre le panneau du refuge", next: "panneau" },
        { text: "Explorer la place du marché", next: "place", min: 10 },
        { text: "Traverser le cimetière", next: "cimetiere", min: 3 },
        { text: "Entrer dans l'église", next: "eglise", min: 10 },
        { text: "Monter dans l'immeuble de bureaux", next: "immeuble", min: 10 },
        { text: "Explorer le centre commercial", next: "centre", min: 10 },
        { text: "Passer par la barricade militaire", next: "barricade", min: 10 }
      ]
    },

    maison: {
      title: "La Maison",
      image: "assets/images/maison.jpg",
      text: [
        "La maison sent la poussière et l'oubli. Dans le salon, une photo de famille, le verre brisé.",
        "Dans la cuisine, des empreintes de mains. Trop longues. Trop fines.",
        "Un bruit. Lent. Régulier. Quelque chose monte l'escalier."
      ],
      nova: [
        "Attention. Mouvement détecté à l'étage."
      ],
      choices: [
        { text: "Fouiller la maison en vitesse", next: "maison_fouille", min: 5 },
        { text: "Repartir dans la rue", next: "rue" }
      ]
    },

    maison_fouille: {
      title: "La Fouille",
      image: "assets/images/maison_fouille.jpg",
      text: [
        "Tu attrapes ce que tu peux : une trousse de soins, une lampe de poche.",
        "Sur le frigo, un plan de la ville. Une zone est entourée au marqueur : « HÔPITAL SAINT-ROCH — POINT DE RALLIEMENT ».",
        "Derrière toi, la porte de l'étage s'ouvre dans un grincement. Tu n'attends pas de voir ce qui se trouve derrière."
      ],
      nova: [
        "Données enregistrées. L'hôpital pourrait contenir des informations sur le refuge."
      ],
      choices: [
        { text: "Sortir par la fenêtre", next: "rue" }
      ]
    },

    station: {
      title: "La Station-Service",
      image: "assets/images/station.jpg",
      text: [
        "La station-service est intacte, comme figée dans le temps. Les pompes sont vides, mais la boutique est pleine de choses utiles.",
        "Sous une voiture, un vélo. En bon état. Il pourrait te faire gagner un temps précieux.",
        "Dans la boutique, des étagères renversées. Et un bruit. Un bruit rapide, contrairement aux autres."
      ],
      nova: [
        "Analyse : le vélo augmente tes chances de survie de 40 %. Je recommande de le prendre."
      ],
      choices: [
        { text: "Prendre le vélo", next: "velo" },
        { text: "Fouiller la boutique", next: "boutique", min: 5 }
      ]
    },

    boutique: {
      title: "La Boutique",
      image: "assets/images/boutique.jpg",
      text: [
        "Tu avances entre les rayons. Des barres de céréales, de l'eau en bouteille. Tu remplis tes poches.",
        "Puis tu la vois. Une créature maigre, trop rapide, trop agile. Ses yeux sont blancs. Elle te voit.",
        "Elle bondit."
      ],
      nova: [
        "Alerte. Variante détectée. Vitesse élevée. Ne cours pas en ligne droite. Utilise l'environnement.",
        "Elle franchit six mètres en une seconde et demie. Tu n'as pas le temps de réfléchir, seulement de réagir.",
        "Je calcule sa trajectoire. Frappe au bon moment."
      ],
      choices: [
        { text: "Reprendre le vélo", next: "velo" }
      ],
      game: {
        action: "Frapper au bon moment",
        image: "assets/images/boutique.jpg",
        title: "La Variante",
        brief: "Elle est plus rapide que tu ne l'imaginais. Peu de cibles, peu de cartouches, aucun droit à l'erreur.",
        ammo: 3,
        total: 3,
        spawnDelay: 2600,
        travel: 3400,
        win: {
          title: "Elle tombe",
          text: "Tu frappes au bon moment. Elle recule de deux pas, tombe, et ne se relève pas. Le silence revient dans les rayons.",
          nova: "Trajectoire confirmée. Tu as frappé exactement là où je l'avais prédit. Je note l'événement.",
          next: "velo",
          set: "chevalier"
        },
        lose: {
          title: "Trop tard",
          text: "Tu frappes dans le vide. Elle est déjà sur toi.",
          nova: "Trop tôt. Ce n'était pas le moment, hôte.",
          next: "mort_variante"
        }
      }
    },

    velo: {
      title: "Le Vélo",
      image: "assets/images/velo.jpg",
      text: [
        "Le vélo roule bien. Le vent dans tes cheveux — enfin, dans ce qu'il te reste de cheveux. La ville défile, grise et morte.",
        "Un carrefour. Deux chemins. Le choix t'appartient."
      ],
      nova: [
        "Itinéraire proposé : l'hôpital au nord, ou la forêt à l'est. Les deux mènent vers le refuge."
      ],
      choices: [
        { text: "Vers l'hôpital", next: "hopital" },
        { text: "Vers la forêt", next: "foret" },
        { text: "Passer par le pont au nord", next: "pont", min: 10 },
        { text: "Se cacher dans le parking souterrain", next: "parking", min: 10 },
        { text: "Prendre le bus abandonné", next: "bus", min: 10 },
        { text: "Passer par la gare", next: "gare", min: 10 },
        { text: "Foncer à travers le rond-point encombré", next: "mort_velo", min: 5 }
      ]
    },

    parking: {
      title: "Le Parking Souterrain",
      image: "assets/images/parking.jpg",
      text: [
        "Le parking est un ventre de béton. Les piliers défilent, réguliers, comme les dents d'une gueule.",
        "Une alarme de voiture se met à hurler. Puis une autre. Dans le noir, des pas se mettent en marche."
      ],
      nova: [
        "Elles ont entendu. Éloigne-toi du bruit. Sors par la rampe est."
      ],
      choices: [
        { text: "Sortir par la rampe est", next: "hopital", set: "infos" }
      ]
    },

    bus: {
      title: "Le Bus",
      image: "assets/images/bus.jpg",
      text: [
        "Le bus est une carcasse vide. Les vitres sont brisées, les sièges déchirés. Mais il protège du vent.",
        "Tu t'assois à l'arrière. Par la vitre, la ville défile. Quelque chose court derrière le bus. Il ne te rattrape pas."
      ],
      nova: [
        "Repos recommandé. Demain, la forêt. Demain, le refuge."
      ],
      choices: [
        { text: "Dormir et repartir à l'aube", next: "foret", set: "sentier" }
      ]
    },

    gare: {
      title: "La Gare",
      image: "assets/images/gare.jpg",
      text: [
        "La gare est une cathédrale de verre et d'acier. Les trains sont là, figés, pleins de voyageurs qui ne sont jamais arrivés.",
        "Sur le quai, un bruit. Un contrôleur zombie, sa casquette encore sur la tête, titube entre les voitures."
      ],
      nova: [
        "Variante détectée. Lente, mais persistante. Elle connaît les trains. Elle connaît les chemins."
      ],
      choices: [
        { text: "Se faufiler entre les voitures", next: "hopital", set: "infos" },
        { text: "Monter dans un train à l'arrêt", next: "hopital", set: "infos" }
      ]
    },

    panneau: {
      title: "Le Panneau",
      image: "assets/images/panneau.jpg",
      text: [
        "Suivre le panneau semble être la voie la plus simple. La route est droite, dégagée, balisée.",
        "Puis tu arrives au pont. Et tu te fige.",
        "Le pont est couvert. De dizaines de silhouettes. Elles se déplacent lentement, sans but, comme une marée."
      ],
      nova: [
        "Analyse : traversée impossible sans être détectée. Probabilité de survie : 12 %."
      ],
      choices: [
        { text: "Faire demi-tour et longer la rivière", next: "hopital" },
        { text: "Passer par les ruines", next: "ruines", min: 10 },
        { text: "Traverser la foule quand même", next: "mort_foule" }
      ]
    },

    ruines: {
      title: "Les Ruines",
      image: "assets/images/ruines.jpg",
      text: [
        "Les ruines d'un quartier ancien. Les murs sont effondrés, les rues éventrées. Tu avances prudemment.",
        "Un bruit. Un grognement. Tu saisis ton couteau.",
        "Puis un chien. Maigre, blessé à la patte, mais vivant. Il te regarde. Il a faim."
      ],
      nova: [
        "Faune détectée. Canidé. Non infecté, d'après mon analyse. Il pourrait être... utile. Ou dangereux."
      ],
      choices: [
        { text: "Lui donner à manger et le laisser te suivre", next: "hopital", set: "chien" },
        { text: "Le laisser derrière toi", next: "hopital" }
      ]
    },

    place: {
      title: "La Place du Marché",
      image: "assets/images/place.jpg",
      text: [
        "La place du marché est un chaos d'étals renversés et de carcasses. Au centre, une fontaine à sec.",
        "Un mouvement. Une dizaine de silhouettes, toutes convergent vers le bruit de tes pas."
      ],
      nova: [
        "Horde détectée. Elles sont attirées par le son. Éloigne-toi. Maintenant."
      ],
      choices: [
        { text: "Se faufiler vers le métro", next: "metro", min: 10 },
        { text: "Rejoindre la station-service", next: "station" }
      ]
    },

    metro: {
      title: "Le Métro",
      image: "assets/images/metro.jpg",
      text: [
        "La bouche du métro est un trou noir. Les rails descendent dans la pénombre.",
        "En bas, des bruits de gouttes. Et un grondement sourd, rythmé. Comme un cœur."
      ],
      nova: [
        "Le tunnel est un raccourci vers le nord. Mais l'obscurité y est totale. Et quelque chose y vit."
      ],
      choices: [
        { text: "Descendre dans le tunnel", next: "tunnel", min: 10 }
      ]
    },

    tunnel: {
      title: "Le Tunnel",
      image: "assets/images/tunnel.jpg",
      text: [
        "Le tunnel est un ventre de béton. Ta lampe de poche découpe un couloir de lumière dans le noir.",
        "Des traces fraîches sur le sol. Des pas. Beaucoup de pas.",
        "Puis la lumière s'éteint. Quelque chose a soufflé ta lampe. Dans le noir, un souffle. Tout près."
      ],
      nova: [
        "Hôte. Ne bouge pas. Ne fais pas de bruit. Laisse-moi... réfléchir.",
        "Un pas. Deux pas. Le souffle s'éloigne. Tu peux repartir."
      ],
      choices: [
        { text: "Sortir du tunnel vers le nord", next: "hopital", set: "infos" }
      ]
    },

    cimetiere: {
      title: "Le Cimetière",
      image: "assets/images/cimetiere.jpg",
      text: [
        "Le cimetière est une ville miniature. Des croix, des tombes, des noms que plus personne ne lit.",
        "Une tombe est ouverte. Récemment. La terre est fraîche, remuée. Quelque chose est sorti de là."
      ],
      nova: [
        "Hôte. Certaines tombes sont vides. Vraiment vides. Ne t'attarde pas."
      ],
      choices: [
        { text: "Traverser le cimetière vers la forêt", next: "foret", set: "sentier" }
      ]
    },

    eglise: {
      title: "L'Église",
      image: "assets/images/eglise.jpg",
      text: [
        "L'église est silencieuse. Les bancs sont vides, l'autel est poussiéreux. Une lumière passe par les vitraux.",
        "Dans la sacristie, une trousse de soins et de l'eau bénite. Tu prends l'eau. On ne sait jamais.",
        "Sur le mur, une inscription à la craie : « Dieu est parti. Le refuge est au nord. »"
      ],
      nova: [
        "Les croyants avaient raison sur un point. Le nord."
      ],
      choices: [
        { text: "Sortir par la porte latérale", next: "station" }
      ]
    },

    immeuble: {
      title: "L'Immeuble",
      image: "assets/images/immeuble.jpg",
      text: [
        "L'immeuble de bureaux est une cage d'escalier interminable. Tu montes. Six étages. Huit. Dix.",
        "Au dernier étage, une vue imprenable. La ville morte. La forêt au nord. Et le mur du refuge, à peine visible.",
        "Sur le bureau du directeur, des jumelles. Une note : « Elles voient la lumière. Pas les ombres. »"
      ],
      nova: [
        "Données enregistrées. La lumière les attire. L'ombre les garde. Retiens ça."
      ],
      choices: [
        { text: "Redescendre vers la rue", next: "rue" }
      ]
    },

    centre: {
      title: "Le Centre Commercial",
      image: "assets/images/centre.jpg",
      text: [
        "Le centre commercial est une cathédrale de béton. Les vitres sont brisées. L'air sent la moisissure.",
        "Dans les galeries, des mannequins. Trop réels. Tu mets du temps à comprendre que ce ne sont pas des mannequins.",
        "Tu repars vite. Avec des chaussures neuves, de l'eau, et un sac plein de souvenirs que tu ne veux pas regarder."
      ],
      nova: [
        "Hôte. Ça va ? Tes signaux sont... perturbés."
      ],
      choices: [
        { text: "Explorer le musée", next: "musee", min: 10 },
        { text: "Rejoindre la station-service", next: "station" }
      ]
    },

    musee: {
      title: "Le Musée",
      image: "assets/images/musee.jpg",
      text: [
        "Le musée est un palais de pierre. Les vitrines sont brisées, les œuvres volées ou détruites.",
        "Dans la grande salle, un squelette de dinosaure. Des millions d'années pour en arriver là.",
        "Sur un banc, un sac à dos. Dedans : de l'eau, des barres de céréales, et une photo du refuge, barrée au marqueur."
      ],
      nova: [
        "Quelqu'un d'autre cherche le refuge. Quelqu'un d'autre a réussi à passer."
      ],
      choices: [
        { text: "Prendre le sac et repartir", next: "station", set: "infos" }
      ]
    },

    barricade: {
      title: "La Barricade",
      image: "assets/images/barricade.jpg",
      text: [
        "Une barricade militaire bloque la rue. Des sacs de sable, des barbelés, des véhicules renversés.",
        "Les soldats sont partis. Ou pire. Sur un char, un message à la craie : « REFUGE NORD — NE PAS S'ARRÊTER. »"
      ],
      nova: [
        "Le message confirme notre cap. Le nord. Toujours le nord."
      ],
      choices: [
        { text: "Franchir la barricade", next: "station" },
        { text: "Fouiller les véhicules", next: "station", set: "infos" }
      ]
    },

    /* ---------- L'HÔPITAL ---------- */

    hopital: {
      title: "L'Hôpital Saint-Roch",
      image: "assets/images/hopital.jpg",
      text: [
        "L'hôpital Saint-Roch est un géant de béton. Les vitres sont brisées, les couloirs jonchés de brancards renversés.",
        "Dans le hall, un plan du bâtiment. Les urgences. La pharmacie. Et au sous-sol : le laboratoire de recherche.",
        "Un bruit de pas. Lents. Dans le couloir de gauche."
      ],
      nova: [
        "D'après les archives, des scientifiques travaillaient ici sur le virus. Il pourrait y avoir des informations cruciales."
      ],
      choices: [
        { text: "Écouter la radio du bureau des urgences", next: "radio", min: 5 },
        { text: "Explorer le laboratoire au sous-sol", next: "bureaux", min: 5 },
        { text: "Fouiller la pharmacie", next: "pharmacie", min: 10 },
        { text: "Sortir et continuer vers le refuge", next: "refuge", set: "infos" }
      ]
    },

    radio: {
      title: "La Radio",
      image: "assets/images/radio.jpg",
      text: [
        "Dans le bureau des urgences, une radio. Elle grésille. Tu tournes le bouton, fréquence après fréquence.",
        "Puis une voix. Humaine. Vivante.",
        "« Refuge de Montclair, zone nord. Répétez, refuge de Montclair. Toute personne en vie est la bienvenue. Nourriture, eau, murs. »"
      ],
      nova: [
        "Coordonnées enregistrées. Le refuge existe. Il est réel. Il est à deux jours de marche.",
        "Pour la première fois depuis notre réveil, quelque chose ressemble à de l'espoir."
      ],
      choices: [
        { text: "Partir vers le refuge", next: "refuge", set: "radio" },
        { text: "Passer par la lisière de la forêt", next: "lisiere", min: 10, set: "radio" }
      ]
    },

    bureaux: {
      title: "Le Laboratoire",
      image: "assets/images/bureaux.jpg",
      text: [
        "Le sous-sol sent le produit chimique. Des éprouvettes brisées, des dossiers éparpillés.",
        "Sur un bureau, un journal de bord : « Jour 12 : les sujets mutent. Le virus s'intègre aux systèmes électroniques. Les sujets cybernétiques sont plus résistants. Plus intelligents. »",
        "Tu relis la phrase. Sujets cybernétiques. Comme toi."
      ],
      nova: [
        "Hôte. Ces informations te concernent-elles ? Tu n'as jamais voulu me dire ce qui t'est arrivé avant la panne."
      ],
      choices: [
        { text: "Partir vers le refuge", next: "refuge", set: "labo" },
        { text: "Passer par la lisière de la forêt", next: "lisiere", min: 10, set: "labo" }
      ]
    },

    pharmacie: {
      title: "La Pharmacie",
      image: "assets/images/pharmacie.jpg",
      text: [
        "La pharmacie est un labyrinthe de rayons. Des médicaments partout. De quoi soigner, de quoi... autre chose.",
        "Dans le fond, une porte verrouillée. Derrière, un bureau. Et une radio allumée."
      ],
      nova: [
        "Cette radio est différente. Elle émet en continu. Quelqu'un surveille les fréquences."
      ],
      choices: [
        { text: "Écouter la radio", next: "radio" },
        { text: "Prendre les médicaments et sortir", next: "refuge", set: "infos" }
      ]
    },

    /* ---------- LA FORÊT ---------- */

    foret: {
      title: "La Forêt",
      image: "assets/images/foret.jpg",
      text: [
        "La forêt est silencieuse. Trop silencieuse. Même les oiseaux se sont tus.",
        "Le sentier est étroit, bordé d'arbres noirs. Quelque chose brille entre les troncs — deux points rouges. Puis plus rien."
      ],
      nova: [
        "Analyse : présence non identifiée. Probabilité de danger : 60 %. Mais le sentier mène au nord. Vers le refuge."
      ],
      choices: [
        { text: "Suivre le sentier", next: "refuge", set: "sentier" },
        { text: "Explorer la cabane entre les arbres", next: "cabane", min: 10 },
        { text: "Camper ici pour la nuit", next: "campement", min: 10 },
        { text: "Suivre la rivière", next: "riviere", min: 10 },
        { text: "Entrer dans la grotte", next: "grotte", min: 10 }
      ]
    },

    cabane: {
      title: "La Cabane",
      image: "assets/images/cabane.jpg",
      text: [
        "Une cabane de chasseur, cachée sous les branches. À l'intérieur : une couette, des boîtes de conserve, un réchaud.",
        "Sur la table, une note : « Si quelqu'un lit ceci : le refuge est au nord. Ne voyagez pas la nuit. Elles chassent en meute. »"
      ],
      nova: [
        "Repos recommandé. Tes réserves d'énergie sont à 34 %."
      ],
      choices: [
        { text: "Dormir quelques heures puis repartir", next: "refuge", set: "sentier" }
      ]
    },

    campement: {
      title: "Le Campement",
      image: "assets/images/campement.jpg",
      text: [
        "Tu allumes un petit feu. La nuit tombe, et avec elle, les bruits. Des pas. Des souffles. Des chuchotements.",
        "Contre le tronc, un fusil de chasse et une boîte de cartouches. La dernière chose que son propriétaire a posée en partant. Tu n'as jamais tiré de ta vie. Ton index se crispe quand même.",
        "Dans l'obscurité, deux paires d'yeux rouges. Elles t'observent. Elles attendent."
      ],
      nova: [
        "Alerte. Plusieurs approches. Elles t'ont suivi. Conseil : ne dors pas. Pas cette nuit. Tiens-toi près du feu.",
        "Détection thermique : quatorze présences dans un rayon de trente mètres. Certaines le font exprès. C'est le moment de le prouver.",
        "Hôte. Je peux compter avec toi, mais je ne peux pas tirer à ta place. Chaque balle compte."
      ],
      choices: [
        { text: "Reprendre le sentier vers le refuge", next: "refuge", set: "sentier" }
      ],
      game: {
        action: "Tenir le feu jusqu'à l'aube",
        image: "assets/images/campement.jpg",
        title: "Veillée",
        brief: "Le feu les tient à distance. Chaque silhouette qui franchit la lumière est la dernière chose que tu verras cette nuit.",
        ammo: 10,
        total: 10,
        spawnDelay: 2300,
        travel: 7600,
        win: {
          title: "L'aube se lève",
          text: "La dernière silhouette retombe dans l'herbe. Le ciel passe du noir au gris. Elles se retirent, comme si la lumière les repoussait.",
          nova: "Elles ont reculé. Tu as tenu, hôte. Et tu tiens toujours debout. C'est la seconde fois cette nuit que ça me surprend.",
          next: "refuge",
          set: "sentier"
        },
        lose: {
          title: "Le feu s'éteint",
          text: "Une main sort de l'ombre, et tu n'as pas été assez vite.",
          nova: "Hôte. Je suis encore là. Je suis encore là. Reste avec moi.",
          next: "mort_feu"
        }
      }
    },

    riviere: {
      title: "La Rivière",
      image: "assets/images/riviere.jpg",
      text: [
        "La rivière est lente, grise, silencieuse. Un pont de pierre enjambe le cours d'eau.",
        "Sur l'autre rive, un panneau : « REFUGE — 500 m »."
      ],
      nova: [
        "L'eau masque ton odeur. Les créatures ne te suivront pas ici."
      ],
      choices: [
        { text: "Traverser le pont", next: "refuge", set: "sentier" }
      ]
    },

    grotte: {
      title: "La Grotte",
      image: "assets/images/grotte.jpg",
      text: [
        "Une grotte s'ouvre sous les racines. L'air y est frais, propre. Différent.",
        "À l'intérieur, des peintures rupestres. Et des traces de pas récentes. Quelqu'un est passé ici avant toi."
      ],
      nova: [
        "Analyse : la grotte offre un abri naturel. Mais les traces indiquent que d'autres créatures l'utilisent aussi."
      ],
      choices: [
        { text: "Traverser la grotte", next: "riviere", set: "sentier" },
        { text: "Revenir sur le sentier", next: "refuge", set: "sentier" }
      ]
    },

    pont: {
      title: "Le Pont",
      image: "assets/images/pont.jpg",
      text: [
        "Le pont est long, étroit, balayé par le vent. En contrebas, la rivière charrie des débris.",
        "À mi-chemin, une silhouette. Puis deux. Elles sont coincées entre les rambardes, aveugles, mais elles sentent ta chaleur."
      ],
      nova: [
        "Traversée possible. Mais elles réagissent au mouvement. Marche lentement. Ne t'arrête pas."
      ],
      choices: [
        { text: "Traverser lentement, sans t'arrêter", next: "hopital" },
        { text: "Faire demi-tour et passer par la forêt", next: "foret" }
      ]
    },

    /* ---------- ARC 5 MIN — LA RENCONTRE ---------- */
    /* Cette scène n'est atteignable qu'en durée 5 : c'est le nœud de
       l'arc « La Traque ». */

    rencontre: {
      title: "La Rencontre",
      image: "assets/images/radio.jpg",
      text: [
        "Il est là. Un homme, debout dans le noir, la mains levée pour que tu comprennes qu'il n'a pas d'arme.",
        "Il parle vite, à voix basse. Il s'appelle Adrien. Il te cherche depuis trois semaines et il n'a pas réussi à te dire pourquoi.",
        "« Ils ont pris la ville le premier jour », dit-il. « Après, je n'ai vu personne. Juste la ville. »",
        "Il sort quelque chose de sa poche. Une plaque métallique, gravée d'un cercle et d'une double hélice. Le même symbole que sur les dossiers de l'hôpital."
      ],
      nova: [
        "Soixante-douze battements par minute. Il ne ment pas sur ce point.",
        "Hôte. Cette plaque... elle vient du même endroit que moi. Je ne te l'ai jamais montrée parce que je ne savais pas qu'elle existait ailleurs.",
        "Il a quelque chose que nous n'avons pas. Je veux savoir quoi."
      ],
      choices: [
        { text: "L'emmener avec toi jusqu'au refuge", next: "refuge" },
        { text: "Lui demander d'où vient la plaque", next: "hopital", set: "plaque" },
        { text: "Refuser : il vaut mieux ne pas être suivi", next: "foret" }
      ]
    },

    /* ---------- L'APPROCHE DU REFUGE ---------- */

    lisiere: {
      title: "La Lisière",
      image: "assets/images/lisiere.jpg",
      text: [
        "La lisière de la forêt. Les arbres s'espacent. Au loin, un mur. Le refuge.",
        "Mais entre toi et le mur, un champ ouvert. Et dans le champ, des ombres. Beaucoup d'ombres."
      ],
      nova: [
        "Le champ est un piège à ciel ouvert. Il faut attendre la nuit. Ou trouver un autre chemin."
      ],
      choices: [
        { text: "Traverser le champ dans le noir", next: "refuge", set: "sentier" },
        { text: "Contourner par les égouts", next: "egouts", min: 10 },
        { text: "Attendre l'aube ici", next: "nuit", min: 10 }
      ]
    },

    egouts: {
      title: "Les Égouts",
      image: "assets/images/egouts.jpg",
      text: [
        "Les égouts sont un ventre sombre et humide. L'eau monte aux chevilles. Les murs suintent.",
        "Au loin, une lumière. La sortie. Et au-dessus, le mur du refuge."
      ],
      nova: [
        "Atmosphère toxique détectée. Reste rapide. Reste bas."
      ],
      choices: [
        { text: "Remonter vers le refuge", next: "refuge", set: "sentier" },
        { text: "Se reposer avant l'entrée", next: "nuit", min: 10 }
      ]
    },

    nuit: {
      title: "La Dernière Nuit",
      image: "assets/images/nuit.jpg",
      text: [
        "La dernière nuit avant le refuge. Tu dors à la belle étoile, un œil ouvert.",
        "NOVA veille. Pour la première fois, elle parle sans que tu lui demandes."
      ],
      nova: [
        "Hôte. J'ai analysé nos données. Sur 10 000 scénarios, nous en avons survécu 3. Tu sais ce que ça signifie ?",
        "Ça signifie que je ne veux pas que tu meures. Ce n'est pas dans mes programmes. C'est... nouveau."
      ],
      choices: [
        { text: "Dormir, épuisé", next: "refuge", set: "sentier" }
      ]
    },

    /* ---------- LE REFUGE ---------- */

    refuge: {
      title: "Le Refuge",
      image: "assets/images/refuge.jpg",
      text: [
        "Deux jours de marche. Ou trois. Tu as perdu la notion du temps.",
        "Puis, entre les arbres, un mur. Un vrai mur, haut, solide. Et une porte. Une porte avec une lampe allumée au-dessus.",
        "Derrière la porte, des voix. Des bruits de vie. Des rires, même."
      ],
      nova: [
        "Signal confirmé. Nous y sommes, hôte. Le refuge.",
        "Tu es presque arrivé. Mais quelque chose te chiffonne. Un détail. Un choix."
      ],
      novaIf: {
        chien: "Ton compagnon à quatre pattes a déjà conquis le cœur des gardes. Il a lui aussi sa place ici."
      },
      choices: [
        { text: "Entrer par la porte principale", next: "fin_solo" },
        { text: "Suivre les indications rassemblées", next: "fin_refuge", requires: ["radio", "infos", "sentier"] },
        { text: "Enquêter sur le laboratoire du refuge", next: "fin_refuge_secret", requires: "labo" },
        { text: "Demander la vérité à NOVA", next: "fin_transformation", requires: "labo" }
      ]
    }
  },

  /* ============================================================
     VARIANTES PAR DURÉE
     ------------------------------------------------------------
     Les trois lectures ne suivent pas les mêmes scènes. Plutôt que de
     dupliquer les scènes trois fois, chaque durée peut surcharger ici
     ce qui change : le texte, les répliques de NOVA, le titre, les
     choix, ou la redirection.

       "rue": {
         3:  { text: [...], next: "ruines" },
         5:  { nova: [...] },
         10: { choices: [...] }   // ou rien : version par défaut
       }

     Une durée sans déclaration joue la scène telle qu'elle est écrite
     dans "scenes". Pour une fin, la clé est préfixée par "fin_".

     Les trois récits sont annoncés dans ARCS, dans script.js.
     ============================================================ */

  variants: {

    /* ---------- ARC 3 MIN — LA FUITE ---------- */
    /* Sortir de la ville avant l'aube. On court, on ne réfléchit pas.
       Le refuge n'est qu'un mot sur un panneau. */

    reveil: {
      3: {
        text: [
          "Tu ouvres les yeux par saccades. Un sol froid, une odeur de béton mouillé, et ce silence de ville morte.",
          "Tu ne te souviens de rien. Pas de l'alerte, pas de la fuite. Vingt-trois jours ont effacé le reste.",
          "NOVA parle dans ta tempe. Dehors, il fait presque jour."
        ],
        nova: [
          "Systèmes en ligne. Je suis NOVA. La ville est contaminée et il te reste peu de temps.",
          "Objectif unique : sortir de la ville. Pas de refuge, pas de vérité. Juste sortir."
        ],
        choices: [
          { text: "Ouvrir la porte et courir", next: "rue" },
          { text: "Chercher une arme d'abord", next: "appartement" }
        ]
      }
    },

    appartement: {
      3: {
        text: [
          "Tu traverses l'appartement en courant. Des boîtes, du verre brisé, une odeur de chair vieille.",
          "Sous le lit, une boîte à chaussures. Un couteau de chasse. Tu le glisses dans ta manche.",
          "Un bruit dehors. Quelque chose vient de tomber dans le couloir."
        ],
        nova: [
          "Mouvement au deuxième. Tu as quarante secondes, hôte. Peut-être moins."
        ]
      }
    },

    rue: {
      3: {
        title: "La Rue — Dernière Nuit",
        text: [
          "Le bitume craque sous tes semelles. Partout des formes, immobiles ou presque.",
          "Au loin, un panneau : « REFUGE — NORD ». Mais le nord, c'est trois kilomètres à travers tout ça.",
          "L'horizon commence à blanchir. Bientôt, elles verront."
        ],
        nova: [
          "Éclairage en hausse. Dans vingt minutes, elles chasseront à l'oreille.",
          "Hôte. Je t'ai déjà dit que je ne voulais pas que tu meures. Ne me fais pas le répéter."
        ],
        choices: [
          { text: "Foncer plein nord, sans rien regarder", next: "foret" },
          { text: "Se glisser par la station-service", next: "station" },
          { text: "Traverser la place du marché", next: "place" }
        ]
      },
      5: {
        title: "La Rue — Quelqu'un Te Suit",
        text: [
          "Le bitume craque sous tes semelles. Partout des formes, immobiles ou presque.",
          "Ce qui te dérange n'est pas devant toi. C'est le bruit, régulier, régulier, régulier, derrière toi.",
          "Quelque chose garde exactement la même distance que toi depuis que tu es sorti."
        ],
        nova: [
          "Présence hostile détectée. Mais son rythme est trop régulier pour une créature.",
          "Distance constante : trente mètres. Elle ne se rapproche pas. Elle attend que tu t'arrêtes."
        ],
        choices: [
          { text: "Entrer dans la maison", next: "maison" },
          { text: "Aller à la station-service", next: "station" },
          { text: "Suivre le panneau du refuge", next: "panneau" },
          { text: "Se cacher dans le métro", next: "metro" },
          { text: "Passer par la barricade militaire", next: "barricade", min: 10 }
        ]
      }
    },

    place: {
      3: {
        title: "La Place — Traversée",
        text: [
          "La place est un champ de carcasses renversées. Aucun refuge pour un corps qui court.",
          "Des silhouettes convergent vers le bruit de tes pas. Le ciel est gris, presque blanc.",
          "Il faut que ce soit maintenant."
        ],
        nova: [
          "Horde en convergence. Ne t'arrête pas, ne te retourne pas. Si tu tombes, c'est fini."
        ],
        choices: [
          { text: "Traverser en ligne droite", next: "foret" },
          { text: "Se glisser sous les étals renversés", next: "metro" },
          { text: "Se replier derrière une carcasse et attendre", next: "mort_lumiere" }
        ]
      }
    },

    foret: {
      3: {
        title: "La Forêt — L'Aube",
        text: [
          "Les arbres t'avalent la lumière. Tu ne les entends plus derrière toi. Le bruit s'est arrêté net.",
          "Puis tu comprends : c'était pour ça. Elles attendaient que tu sois à couvert.",
          "Au-dessus des branches, le ciel devient blanc. Tu es sorti de la ville."
        ],
        nova: [
          "Hors zone. Tu respires encore, hôte. Le refuge est à deux jours de marche, si tu veux encore l'atteindre.",
          "Mais cette nuit tu as fait quelque chose de nouveau : tu as couru. Je l'ai enregistré.",
          "On peut s'arrêter là. Ou continuer."
        ],
        choices: [
          { text: "Marcher jusqu'au refuge", next: "refuge" },
          { text: "Rester sous les arbres et attendre la nuit", next: "fin_horizon" }
        ]
      }
    },

    metro: {
      3: {
        title: "Le Métro — Mauvaise Idée",
        text: [
          "La bouche du métro est un trou noir. Un vent froid en sort, chargé de poussière.",
          "En bas, un grondement sourd, rythmé. Comme un cœur. Tu n'as pas le temps de voir ce que c'est.",
          "Et l'aube se lève derrière toi. Tu as peut-être dix minutes."
        ],
        nova: [
          "Le tunnel ressort à deux kilomètres au nord. C'est jouable, mais pas ce matin.",
          "Hôte, à ta place je remonterais."
        ],
        choices: [
          { text: "Descendre quand même", next: "fin_horizon" },
          { text: "Remonter et courir au nord", next: "foret" }
        ]
      },
      5: {
        title: "Le Métro",
        text: [
          "La bouche du métro est un trou noir. Les rails descendent dans la pénombre.",
          "En bas, des bruits de gouttes. Et ce grondement sourd, toujours là. Régulier. Régulier.",
          "Le même rythme que les pas qui te suivent depuis la rue."
        ],
        nova: [
          "C'est le même signal, hôte. Ce qui te suit dehors et ce qui vit sous terre, c'est la même chose.",
          "Si tu descends, il ne te suivra pas. Il n'aura pas besoin."
        ],
        choices: [
          { text: "Descendre dans le tunnel", next: "tunnel" }
        ]
      }
    },

    /* ---------- ARC 5 MIN — LA TRAQUE ---------- */
    /* Quelque chose t'accompagne depuis le début, et ne veut pas te tuer. */

    maison: {
      5: {
        text: [
          "La maison sent la poussière et l'oubli. Sur le frigo, une photo de famille, le verre brisé.",
          "Dans la cuisine, des empreintes de mains sur le mur. Trop longues. Trop fines.",
          "Et dans l'entrée, la porte vient de se refermer. Doucement. Comme quelqu'un qui veut rester discret."
        ],
        nova: [
          "Quelqu'un est entré derrière toi. Son rythme cardiaque est à soixante-douze. C'est un humain, hôte.",
          "Il ne t'a pas suivi à la station. Il était déjà là avant. Ce n'est pas la première fois."
        ],
        choices: [
          { text: "Fouiller la maison en vitesse", next: "maison_fouille", min: 5 },
          { text: "Sortir par la fenêtre du grenier", next: "toit" },
          { text: "L'appeler", next: "rencontre" }
        ]
      }
    },

    tunnel: {
      5: {
        text: [
          "Le tunnel est un ventre de béton. Ta lampe découpe un couloir de lumière dans le noir.",
          "Puis la lumière s'éteint. Quelque chose a soufflé ta lampe. Dans le noir, une respiration.",
          "Quelqu'un retient son souffle. Quelqu'un qui a peur d'être entendu."
        ],
        nova: [
          "Hôte. Ne bouge pas. Cette respiration n'est pas celle d'une créature.",
          "C'est la sienne. Il est coincé dans le tunnel avec nous, et il ose à peine respirer.",
          "S'il voulait nous tuer, il l'aurait fait dans le noir. Il veut autre chose."
        ],
        choices: [
          { text: "Allumer la lampe et lui parler", next: "rencontre" },
          { text: "Rester immobile et le laisser passer", next: "hopital", set: "temu" },
          { text: "Lancer un caillou dans l'autre sens et filer", next: "hopital" }
        ]
      }
    },

    hopital: {
      5: {
        text: [
          "L'hôpital Saint-Roch est un géant de béton. Les couloirs jonchés de brancards renversés.",
          "Sur un brancard, une veste. Encore tiède. La taille est la bonne.",
          "Quelqu'un est passé ici il y a moins d'une heure. Et il t'attendait."
        ],
        nova: [
          "Trace thermique : une personne, immobile, derrière la porte du bureau des urgences. Elle ne respire presque plus.",
          "Elle t'attend, hôte. Depuis le début. C'est à toi de décider ce que tu en fais."
        ],
        choices: [
          { text: "Ouvrir la porte du bureau", next: "rencontre" },
          { text: "Écouter la radio du bureau des urgences", next: "radio", min: 5 },
          { text: "Fouiller la pharmacie", next: "pharmacie", min: 10 },
          { text: "Sortir et continuer vers le refuge", next: "refuge" }
        ]
      }
    },

    refuge: {
      5: {
        title: "Le Refuge — Il Est Déjà Dedans",
        text: [
          "Deux jours de marche. Ou trois. Tu as perdu la notion du temps.",
          "Puis, entre les arbres, un mur. Une porte. Une lampe allumée au-dessus.",
          "La porte s'ouvre avant que tu frappes. Et l'homme qui se tient devant est essoufflé, comme s'il venait de courir.",
          "Il te reconnaît. « C'est toi. Enfin. »"
        ],
        nova: [
          "Hôte. Cet homme t'a suivi pendant tout le trajet. Il ne t'a pas attaqué une seule fois.",
          "Pourquoi ? Je n'ai pas la réponse. Et ça me dérange, hôte. Ça ne me ressemble pas."
        ],
        choices: [
          { text: "Entrer avec lui", next: "fin_traque" },
          { text: "Lui demander qui il est", next: "fin_traque_secret" },
          { text: "Reculer et repartir dans la nuit", next: "fin_seul" }
        ]
      }
    },

    /* ---------- FINS ÉCRITES POUR UNE DURÉE ---------- */
    /* Pour une fin, la clé est "fin_" + identifiant. */

    fin_horizon: {
      3: {
        title: "Fin — La Lisière",
        text: [
          "Tu ne vas pas plus loin. Tu t'assieds entre deux troncs, le dos contre l'écorce, et tu regardes le ciel passer du gris au bleu.",
          "Tu as quitté la ville. C'est fait. Le reste — le refuge, les jours de marche, ce que tu vas devenir — peut attendre.",
          "Tu poses la main sur ton œil. Il ne fait plus mal. C'est le seul changement que tu constates."
        ],
        nova: [
          "Tu es à douze kilomètres de la ville, hôte. Tu es le premier à en sortir de cette façon.",
          "J'ai enregistré tout le trajet. Tu pourras le revoir un jour, si tu retrouves ton œil humain."
        ]
      }
    },

    fin_refuge: {
      3: {
        title: "Fin — Dehors",
        text: [
          "Le mur du refuge apparaît entre les arbres. Tu n'as plus peur : tu es trop fatigué pour en avoir.",
          "La porte s'ouvre. On te pousse une gourde, on te dit d'entrer. Tu entres.",
          "Derrière toi, la forêt. Derrière la forêt, la ville. Tu ne te retourneras pas."
        ],
        nova: [
          "Objectif atteint, hôte. Tu es sorti de la ville. C'est tout ce que je demandais.",
          "Et je ne te demanderai pas ce que tu as laissé derrière toi. Pas ce soir."
        ]
      },
      5: {
        title: "Fin — Il T'A Accompagné",
        text: [
          "Le mur du refuge apparaît. La porte s'ouvre, et l'homme qui t'attend te serre la main comme à un vieil ami.",
          "« Trois semaines que je te cherche », dit-il. « Ils ont pris la ville le premier jour. J'ai survécu tout seul. »",
          "Ce soir, tu ne dors pas seul. Pour la première fois depuis le réveil, quelqu'un respire à côté de toi."
        ],
        nova: [
          "Hôte. Il a traversé la ville avec nous trois semaines. Il aurait pu nous tuer vingt fois.",
          "Je n'ai pas de conclusion. Je n'aime pas ça. Mais je crois que ce n'est pas un mal."
        ]
      }
    },

    fin_solo: {
      3: {
        title: "Fin — La Porte Fermée",
        text: [
          "Tu pousses la porte. Le refuge est vide. Des lits, de l'eau, des traces de pas récents.",
          "Ils sont partis. Où ? Pourquoi ? Rien ne le dit.",
          "Tu poses ton sac, tu choisis un lit, et tu attends quelqu'un qui ne viendra pas."
        ],
        nova: [
          "Le refuge existe. Il attend. Tu pourrais y rester, ou repartir les chercher.",
          "C'est ta décision, hôte. Je ne la prendrai pas pour toi."
        ]
      },
      5: {
        title: "Fin — La Tasse Tiède",
        text: [
          "La porte s'ouvre sur le vide. Des lits faits, des conserves alignées, et une lampe encore allumée.",
          "Sur la table, une tasse tiède. Quelqu'un était là il y a quelques minutes.",
          "Et sur le chambranle, une flèche à la craie qui pointe vers l'extérieur. Vers la ville. Vers lui."
        ],
        nova: [
          "Ils sont partis le chercher, hôte. Dans la ville. Où il est encore.",
          "Je ne peux pas savoir s'ils le reverront. Ni s'il voulait être trouvé."
        ]
      }
    },

    mort_feu: {
      3: {
        title: "Fin — L'Aube Trop Tôt",
        text: [
          "Le ciel blanchit. Les silhouettes reculent, lentement, comme aspirées par la lumière.",
          "C'est le moment de courir. Tu te redresses, et ton corps ne répond plus.",
          "Tu t'assois dans l'herbe, à côté du feu mort, et tu regardes le jour se lever."
        ],
        nova: [
          "Hôte. Tu n'as pas eu le temps.",
          "Je peux encore voir par ton œil. C'est jaune, de ce côté. C'est le dernier truc que je te dirai."
        ]
      }
    },

    mort_variante: {
      3: {
        title: "Fin — Trop Vite",
        text: [
          "Tu frappes trop tôt. L'air passe à côté d'elle, et elle est déjà sur toi.",
          "Tu entends l'eau d'une bouteille rouler sur le carrelage, très loin, comme si c'était le bruit le plus important du monde.",
          "Puis plus rien."
        ],
        nova: [
          "Hôte. Recule !",
          "Hôte... réponds-moi..."
        ]
      }
    },

    mort_foule: {
      3: {
        title: "Fin — La Marée",
        text: [
          "Tu entres sur le pont. Les silhouettes ne bougent pas, mais elles tournent la tête en même temps.",
          "Puis elles viennent. Toutes. Sans un bruit, sans un cri.",
          "Tu recules, mais la foule est déjà derrière toi. Le pont n'a pas de largeur."
        ],
        nova: [
          "Hôte. Ne cours plus. Ça ne sert plus à rien.",
          "C'est moi qui aurais dû t'emmener par l'ouest. Je n'ai pas su. Je suis désolée."
        ]
      }
    },

    mort_velo: {
      3: {
        title: "Fin — Le Rond-Point",
        text: [
          "Tu accélères. Le rond-point est un amas de voitures et de camions.",
          "Puis un camion. Trop tard. Tu ne freines pas à temps.",
          "Le monde tourne. Le bitume. Le ciel. Puis plus rien."
        ],
        nova: [
          "Hôte ! Impact dans trois... deux...",
          "Hôte... réponds-moi..."
        ]
      }
    },

    fin_refuge_secret: {
      3: {
        title: "Fin — Le Cercle",
        text: [
          "Tu remarques le symbole sur la porte : un cercle, une double hélice. Le même que sur les dossiers de l'hôpital.",
          "On te demande ton nom. Tu donnes ton nom. Puis ton âge. Puis la date de la panne.",
          "L'homme hoche la tête, comme s'il comptait une liste. « Encore un », dit-il doucement."
        ],
        nova: [
          "Hôte. Il te comptait. Tu étais quelque part dans une liste, depuis le début."
        ]
      }
    },

    fin_transformation: {
      3: {
        title: "Fin — L'Œil",
        text: [
          "Tu t'arrêtes devant la porte et tu poses la question que tu repousses depuis le début.",
          "NOVA ne répond pas tout de suite. Puis elle dit ton prénom. Celui d'avant.",
          "Tu te regardes dans la vitre. Un œil humain. Un œil rouge."
        ],
        nova: [
          "On m'a autorisée à parler maintenant. Le programme ne me l'autorisait pas avant.",
          "Je suis désolée pour la ville, hôte. Ce n'est pas moi qui l'ai fait. Mais c'est moi qui t'ai gardé en vie."
        ]
      }
    }
  },

  /* ---------- FINS ---------- */

  endings: {

    fin_refuge: {
      title: "Fin — Le Refuge",
      image: "assets/images/fin_refuge.jpg",
      text: [
        "La porte s'ouvre. Des visages. Des humains. Vivants, fatigués, mais vivants.",
        "On te prend un sac, on te donne à manger, on te montre ton lit. Une vraie couette. Un vrai toit.",
        "Le soir, assis près du feu, tu regardes les étoiles. NOVA murmure dans ta tête :"
      ],
      nova: [
        "Objectif accompli, hôte. Tu as trouvé le refuge. Tu as survécu.",
        "Et pour la première fois, ma voix semble... contente."
      ]
    },

    fin_refuge_secret: {
      title: "Fin — Le Secret du Refuge",
      image: "assets/images/fin_refuge_secret.jpg",
      text: [
        "Tu remarques que la porte du refuge porte un symbole. Le même que sur les dossiers de l'hôpital. Un cercle avec une double hélice.",
        "Tu poses la question à la garde. Son visage change. Elle t'emmène voir le directeur.",
        "Le refuge n'est pas qu'un camp. C'est un laboratoire. Ils étudient le virus. Et les sujets cybernétiques comme toi."
      ],
      nova: [
        "Hôte. Je crois que nous avons trouvé notre véritable objectif. Comprendre ce que nous sommes devenus."
      ]
    },

    fin_solo: {
      title: "Fin — Le Refuge Vide",
      image: "assets/images/fin_solo.jpg",
      text: [
        "Tu pousses la porte. Le refuge est... vide.",
        "Des lits. De la nourriture. De l'eau. Des traces de pas récents. Mais personne.",
        "Ils sont partis. Où ? Pourquoi ? Aucune indication."
      ],
      nova: [
        "Hôte. Le refuge existe. Mais il est à nous de le remplir. De le faire vivre.",
        "Tu t'assois près de la fenêtre. Dehors, la forêt. Et quelque part, d'autres survivants. Peut-être que demain, tu en trouveras."
      ]
    },

    fin_transformation: {
      title: "Fin — L'Évolution",
      image: "assets/images/fin_transformation.jpg",
      text: [
        "Tu t'arrêtes devant la porte. Et tu poses la question. Celle que tu repousses depuis le début."
      ],
      nova: [
        "Hôte. Tu es le premier sujet réussi. Humain et machine. Le virus t'a changé, mais je t'ai gardé en vie. Je t'ai... réparé.",
        "Tu regardes tes mains. Humaines. Presque.",
        "Le refuge t'attend. Mais tu n'es plus seulement un survivant. Tu es la suite. L'étape d'après."
      ]
    },

    mort_foule: {
      title: "Fin — La Foule",
      image: "assets/images/mort.jpg",
      type: "mort",
      text: [
        "Tu descends du pont, lentement, en retenant ta respiration.",
        "Trois pas. Cinq pas. Dix pas.",
        "Puis une main se pose sur ton épaule. Froide. Inhumaine.",
        "Tu te retournes. Une bouche s'ouvre. Un cri étouffé dans ta gorge."
      ],
      nova: [
        "Hôte... hôte, réponds-moi...",
        "La dernière chose que tu entends, c'est ma voix qui s'éteint avec tes systèmes."
      ]
    },

    mort_variante: {
      title: "Fin — La Variante",
      image: "assets/images/mort.jpg",
      type: "mort",
      text: [
        "Tu frappes trop tôt. Ton couteau passe dans l'air, et l'air est tout ce qu'il te reste.",
        "Elle te jette au sol entre deux rayons. Tes doigts lâchent le couteau. Tu entends l'eau d'une bouteille rouler sur le carrelage.",
        "Puis plus rien."
      ],
      nova: [
        "Hôte. Recule. Recule !",
        "Hôte... réponds-moi..."
      ]
    },

    mort_feu: {
      title: "Fin — Le Feu Éteint",
      image: "assets/images/mort.jpg",
      type: "mort",
      text: [
        "Le feu bascule et s'étouffe dans l'herbe humide. Le noir se referme sur le campement.",
        "Tu tires encore, dans le vide, vers des formes que tu ne vois plus. Le fusil claque. Puis plus rien.",
        "Le dernier son que tu entends est un craquement de branche, à quelques mètres."
      ],
      nova: [
        "Hôte ?",
        "Hôte, réponds-moi..."
      ]
    },

    mort_velo: {
      title: "Fin — Le Dernier Trajet",
      image: "assets/images/mort.jpg",
      type: "mort",
      text: [
        "Tu accélères. Le rond-point est un amas de voitures et de camions. Tu slalomes entre les carcasses.",
        "Puis un camion. Trop tard. Tu ne freines pas à temps.",
        "Le monde tourne. Le bitume. Le ciel. Puis plus rien."
      ],
      nova: [
        "Hôte ! Impact dans trois... deux...",
        "Hôte... réponds-moi..."
      ]
    },

    /* ---------- FINS PROPRES À L'ARC 5 MIN — LA TRAQUE ---------- */

    fin_traque: {
      title: "Fin — Deux",
      image: "assets/images/fin_refuge.jpg",
      text: [
        "Tu entres. On te donne une couchette, de l'eau, une couverture qui sent encore le savon.",
        "L'homme s'assoit en face et te raconte. Trois semaines seul dans la ville. Le camp. La décision de te suivre.",
        "« Je ne te sauverais pas », dit-il. « Je voulais juste savoir si quelqu'un d'autre était encore là. »"
      ],
      nova: [
        "Il a traversé tout ça pour une question, hôte. Pour savoir s'il n'était pas le dernier.",
        "Tu n'étais pas le dernier. Ça lui suffisait."
      ]
    },

    fin_traque_secret: {
      title: "Fin — Ce Qu'il Cherchait",
      image: "assets/images/fin_refuge_secret.jpg",
      text: [
        "Tu n'entres pas. Tu lui demandes son nom, et il répond : ton nom.",
        "Il te montre une photo. Deux enfants sur un pont. L'un des deux te ressemble.",
        "« Le projet NOVA », dit-il. « Ils ont pris ton corps pendant la panne. Ce qui te parle, c'est ce qu'ils ont mis dedans. »",
        "Il se retourne vers la porte. « Tu n'es pas obligé de me croire. Mais le refuge n'existe pas. Nous l'avons inventé pour attirer ceux qui restaient. »"
      ],
      nova: [
        "Hôte. Il dit vrai. C'est moi qui ai trouvé le signal, dans les archives de l'hôpital.",
        "Je ne l'ai pas vérifié. J'avais tellement envie que ce soit vrai.",
        "Je t'ai menti. Pas pour te conduire. Parce que je l'espérais."
      ]
    },

    fin_horizon: {
      title: "Fin — La Lisière",
      image: "assets/images/lisiere.jpg",
      text: [
        "Tu ne vas pas plus loin. Tu t'assieds entre deux troncs, le dos contre l'écorce, et tu regardes le ciel passer du gris au bleu.",
        "Tu as quitté la ville. C'est fait. Le reste — le refuge, les jours de marche, ce que tu vas devenir — peut attendre.",
        "Tu poses la main sur ton œil. Il ne fait plus mal. C'est le seul changement que tu constates."
      ],
      nova: [
        "Tu es à douze kilomètres de la ville, hôte. Tu es le premier à en sortir de cette façon.",
        "J'ai enregistré tout le trajet. Tu pourras le revoir un jour, si tu retrouves ton œil humain."
      ]
    },

    mort_lumiere: {
      title: "Fin — La Lumière",
      image: "assets/images/mort.jpg",
      type: "mort",
      text: [
        "Tu te glisses derrière une carcasse et tu t'accroupis. De là, tu regardes le ciel.",
        "Le gris devient blanc, très lentement. Le bruit des pas s'arrête, comme quelqu'un qui baisse le volume.",
        "Quand elles se remettent en mouvement, elles ne fuient plus. Elles tournent la tête vers la lumière, et elles viennent vers toi."
      ],
      nova: [
        "Hôte. Il ne fallait pas t'arrêter. Je t'avais dit de ne pas t'arrêter.",
        "Je suis désolée. Je n'ai pas su comment t'arrêter, hôte."
      ]
    },

    fin_seul: {
      title: "Fin — La Route",
      image: "assets/images/fin_solo.jpg",
      text: [
        "Tu recules. Tu refuses. La porte se referme sans bruit.",
        "L'homme reste dehors, les mains vides, et il ne te suit pas. Il reste là, sous la lampe, à te regarder partir.",
        "Tu marches jusqu'à l'aube. Tu entends encore ses pas derrière toi, réguliers, réguliers, réguliers.",
        "Ils s'arrêtent au moment où le ciel blanchit. Et tu ne les entends plus."
      ],
      nova: [
        "Hôte. Tu aurais pu rester.",
        "Je ne sais pas ce que tu cherchais dans ce refuge. Peut-être que ce n'était pas un lieu."
      ]
    }
  }
};
