# Les idées prennent forme

Portfolio immersif d’Emmanuel Galland. Un essaim de points partage sept formations 3D et les transforme à mesure du défilement natif. Quatre univers servent de démonstration : Kikalmo, Market Plus, les outils maison (Atelier Rénovation et Tableau 3D), puis BodyOS.

## Fonctionnement

- `dist/formations.js` construit les positions des points : globe orbital, jeu de lettres, tableau de bord modulaire, plan relié à un tableau électrique, anneaux de suivi, interfaces et monogramme.
- `dist/experience.js` pilote une seule boucle d’animation, le rendu WebGL, le rendu Canvas compatible, les transitions, la souris et les commandes accessibles.
- `dist/styles.css` définit la composition, le mode mobile, les transitions de texte et la lecture linéaire.
- Défilement natif, liens d’ancrage, navigation précédent/suivant et clavier (flèches gauche/droite hors des contrôles).
- Les trois boutons de compétences transforment l’essaim et changent l’explication. « Disperser les points » reforme la figure après une impulsion.
- La préférence de mouvement est mémorisée localement ; `prefers-reduced-motion` est respecté. La boucle s’arrête lorsque l’onglet est masqué, ainsi qu’en pause après le rendu demandé.
- Aucune photo, catalogue exhaustif, donnée d’audience ni collecte de données. Les formations sont des interprétations visuelles des projets.

## Déploiement

Site statique, sans étape de compilation. Servir `dist/`. Les polices Google Fonts sont facultatives ; des polices système prennent le relais si elles sont indisponibles.

## Version archivée

Cette branche présente le prototype à formations de points du 3 novembre 2026 (source `85ca8132869507413f22991817ed4cc8b10dbef1`). La branche principale conserve le prototype à l’oie.

Depuis la racine du dépôt, lancer `python3 -m http.server 8000 --directory dist`, puis ouvrir <http://localhost:8000/>. Les deux modules de rendu, l’icône et la feuille de style sont inclus.

Les scènes Market Plus et BodyOS utilisent des formes abstraites. Leurs services privés ne sont pas liés dans cette édition publique.
