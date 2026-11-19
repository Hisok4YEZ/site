/* Hefti Sports, Col des Mosses : packs, tarifs, menu.
   La réservation se fait sur la plateforme en ligne du magasin (Easyrent). */
(function () {
  'use strict';

  /* ================= Données : tarifs officiels 2026-2027 (CHF, TVA comprise) =================
     Source : grille « Tarifs locations journées » de heftisports.ch (septembre 2026).
     Chaque tableau : [½ j dès 12 h, 1 j, 2 j, 3 j, 4 j, 5 j, 6 j, 7 j, 14 j] ; null = non proposé. */
  var RESERVATION = 'https://easyresv3.wintersteiger.at/index_easyrent.php?shop_id=100258&sprache=fra';

  var T = {
    fond: {
      classic: [25, 29, 54, 69, 83, 98, 113, 129, 199],
      skating: [34, 39, 73, 89, 107, 124, 140, 153, 244],
      evolution: [null, 44, 79, 104, 124, 148, 170, 193, 298],
      junior: [19, 22, 43, 56, 69, 82, 95, 104, 167],
      backcountry: [null, 44, 79, 104, 124, 148, 170, 193, 298]
    },
    alpin: {
      introduction: [25, 29, 54, 72, 84, 99, 119, 135, 200],
      evolution: [35, 41, 76, 94, 109, 124, 139, 154, 259],
      performance: [null, 55, 93, 120, 147, 174, 200, 226, 338],
      test: [null, 65, 115, 140, 180, 205, 230, 255, 430],
      junior: [16, 18, 34, 44, 53, 62, 71, 76, 111],
      kid: [9, 13, 20, 25, 30, 35, 40, 45, 65]
    },
    chaussures: {
      adulte: [16, 19, 35, 46, 57, 68, 79, 90, 139],
      junior: [10, 15, 23, 28, 33, 38, 43, 46, 67],
      kid: [8, 9, 17, 20, 23, 26, 29, 32, 46]
    },
    snow: {
      introduction: [29, 35, 64, 89, 109, 124, 139, 154, 245],
      test: [null, 65, 115, 140, 180, 205, 230, 255, 430],
      junior: [21, 25, 46, 59, 72, 85, 98, 107, 170],
      kid: [16, 18, 34, 43, 52, 61, 70, 75, 110]
    },
    rando: {
      skis: [null, 49, 89, 115, 140, 165, 190, 215, 320],
      chaussures: [null, 20, 37, 48, 59, 70, 81, 92, 141],
      dva: [null, 15, 28, 35, 42, 49, 56, 63, 98]
    },
    divers: {
      casque: [null, 7, 12, 16, 19, 22, 25, 28, 42],
      raquettes: [17, 19, 36, 47, 58, 69, 80, 91, 140],
      raquettesKid: [13, 15, 28, 39, 50, 61, 72, 83, 132],
      telemark: [null, 69, 126, 163, 199, 235, 271, 307, 460],
      snowblade: [21, 23, 44, 57, 70, 83, 96, 105, 168],
      luge: [null, 8, 14, 18, 21, 23, 27, 30, 44],
      veste: [null, 20, 30, 40, 50, 55, 60, 65, null],
      gants: [null, 8, 14, 17, 20, 23, 26, 29, null],
      casier4: [null, 20, 40, 56, 72, 88, 104, 120, 232],
      casier2: [null, 10, 20, 28, 36, 44, 52, 60, 116]
    }
  };

  /* Packs mis en avant (vitrine) : [nom, détail, étiquette, tarifs] */
  var PACKS = {
    fond: [
      ['Classique', 'Skis de fond classique et chaussures', 'Chaussures comprises', T.fond.classic],
      ['Skating', 'Skis de skating et chaussures', 'Chaussures comprises', T.fond.skating],
      ['Évolution', 'Classique ou skating, gamme évolution', 'Chaussures comprises', T.fond.evolution],
      ['Junior', 'Skis jusqu’à 170 cm et chaussures', 'Chaussures comprises', T.fond.junior]
    ],
    alpin: [
      ['Introduction', 'Skis de la gamme introduction', 'Skis seuls · bâtons inclus', T.alpin.introduction],
      ['Évolution', 'Skis de la gamme évolution', 'Skis seuls · bâtons inclus', T.alpin.evolution],
      ['Performance', 'Skis de la gamme performance', 'Skis seuls · bâtons inclus', T.alpin.performance],
      ['Junior', 'Skis de 96 à 150 cm', 'Skis seuls · bâtons inclus', T.alpin.junior]
    ],
    snow: [
      ['Introduction', 'Snowboard de la gamme introduction', 'Planche seule', T.snow.introduction],
      ['Test / Splitboard', 'Snowboard test ou splitboard', 'Planche seule', T.snow.test],
      ['Junior', 'Planche de 100 à 138 cm', 'Planche seule', T.snow.junior],
      ['Kid', 'Planche de 70 à 99 cm', 'Planche seule', T.snow.kid]
    ],
    raquettes: [
      ['Raquettes adulte', 'Raquettes à neige', 'Bâtons inclus', T.divers.raquettes],
      ['Raquettes enfant', 'Raquettes à neige, pointures 23 à 33', 'Bâtons inclus', T.divers.raquettesKid]
    ]
  };

  var CGL = [
    'Garantie de dépôt : carte de crédit ou pièce d’identité.',
    'Le dommage sur le matériel de location dans des conditions normales d’utilisation est compris dans le prix.',
    'La perte et le vol sont à l’entière responsabilité et à la charge du loueur.',
    'La location à la demi-journée commence dès 12 h.',
    'Bâtons de ski inclus pour les articles marqués d’un astérisque (*).',
    'Tous les tarifs sont en francs suisses (CHF), TVA comprise.'
  ];

  /* ================= Outils ================= */
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  var formatteurCHF = new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  function francs(n) {
    var montant = formatteurCHF.formatToParts(Math.round(n)).filter(function (p) { return p.type === 'integer' || p.type === 'group'; }).map(function (p) { return p.value; }).join('');
    return 'CHF ' + montant;
  }
  /* Même montant, avec la devise et le nombre dans deux balises pour la mise en forme du tableau */
  function francsHTML(n) { return francs(n).replace(/^CHF /, '<span class="chf">CHF</span> <span class="montant">') + '</span>'; }
  /* Cellule de tableau : nombre → montant ; [« dès », nombre] → « dès CHF … » ; texte → tel quel ; null → tiret */
  function cellule(v) {
    if (v === null || v === undefined) return '<span class="montant">–</span>';
    if (typeof v === 'number') return francsHTML(v);
    if (Array.isArray(v)) return v[0] + ' ' + francsHTML(v[1]);
    return v;
  }

  /* ================= Packs (vitrine) ================= */
  function rendPacks(type) {
    $('#grille-packs').innerHTML = PACKS[type].map(function (p) {
      var t = p[3];
      return '<article class="carte-pack"><div class="carte-pack-int"><span class="piste"><i class="neutre"></i>' + p[2] + '</span><h3>' + p[0] + '</h3><p class="pour">' + p[1] + '</p><div class="prix"><strong>' + francs(t[1]) + '</strong><span>la journée · ' + francs(t[6]) + ' les 6 jours</span></div><a href="' + RESERVATION + '" target="_blank" rel="noopener" class="btn btn-ligne">Réserver en ligne</a></div></article>';
    }).join('');
  }
  $$('.packs .onglets button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.packs .onglets button').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
      rendPacks(b.dataset.onglet);
    });
  });

  /* ================= Grille de tarifs ================= */
  var COLS_JOURS = ['½ j', '1 j', '2 j', '3 j', '4 j', '5 j', '6 j', '7 j', '14 j'];
  var TITRES_COLS = { '½ j': 'demi-journée, dès 12 h', '1 j': '1 jour', '7 j': '1 semaine, 7 jours', '14 j': '2 semaines, 14 jours' };
  var ONGLETS_TARIFS = [
    { id: 'fond', nom: 'Ski de fond', lignes: [['Classique + chaussures *', '', T.fond.classic], ['Skating + chaussures *', '', T.fond.skating], ['Classique / skating évolution + chaussures *', '', T.fond.evolution], ['Junior + chaussures *', 'Skis jusqu’à 170 cm', T.fond.junior], ['Backcountry + chaussures *', 'Sur réservation', T.fond.backcountry]] },
    { id: 'alpin', nom: 'Ski alpin', lignes: [['Ski Introduction *', '', T.alpin.introduction], ['Ski Évolution *', '', T.alpin.evolution], ['Ski Performance *', '', T.alpin.performance], ['Ski Test *', '', T.alpin.test], ['Ski Junior *', 'Skis de 96 à 150 cm', T.alpin.junior], ['Ski Kid *', 'Skis de 70 à 95 cm', T.alpin.kid]] },
    { id: 'chaussures', nom: 'Chaussures', lignes: [['Chaussures ski / boots snowboard', 'Pointures 35 à 49', T.chaussures.adulte], ['Chaussures junior', 'Pointures 34 à 42', T.chaussures.junior], ['Chaussures kid', 'Pointures 23 à 33', T.chaussures.kid]] },
    { id: 'snow', nom: 'Snowboard', lignes: [['Snowboard Introduction', '', T.snow.introduction], ['Snowboard Test / Splitboard', '', T.snow.test], ['Snowboard Junior', 'Planche de 100 à 138 cm', T.snow.junior], ['Snowboard Kid', 'Planche de 70 à 99 cm', T.snow.kid]] },
    { id: 'rando', nom: 'Randonnée', lignes: [['Skis + peaux + couteaux *', 'Sur réservation', T.rando.skis], ['Chaussures de randonnée', 'Pointures 35 à 49', T.rando.chaussures], ['DVA (détecteur de victimes d’avalanche)', 'Sur réservation', T.rando.dva]] },
    { id: 'divers', nom: 'Divers', lignes: [['Casque', '', T.divers.casque], ['Raquettes *', '', T.divers.raquettes], ['Raquettes enfant *', 'Pointures 23 à 33', T.divers.raquettesKid], ['Télémark + chaussures', 'Sur réservation', T.divers.telemark], ['Snowblade', '', T.divers.snowblade], ['Luge', '', T.divers.luge], ['Veste ou pantalon de ski', '', T.divers.veste], ['Gants ou lunettes', '', T.divers.gants], ['Casier ski / snowboard + chaussures', '4 personnes', T.divers.casier4], ['Casier ski / snowboard + chaussures', '2 personnes', T.divers.casier2]] },
    { id: 'saison', nom: 'Saison', cols: ['2e saison', 'Neuf'], lignes: [
      ['Ski de fond classique + chaussures *', 'Gamme introduction', [['dès', 200], 290]],
      ['Ski de fond skating + chaussures *', 'Gamme introduction', [['dès', 300], 400]],
      ['Ski de fond mix + chaussures *', 'Gamme évolution', ['selon modèle', 'selon modèle']],
      ['Ski de fond junior + chaussures *', '', [['dès', 100], 190]],
      ['Ski Introduction *', '', [['dès', 170], 295]],
      ['Ski Évolution *', '', [['dès', 390], 500]],
      ['Ski Performance *', '', ['selon modèle', 'selon modèle']],
      ['Ski junior performance *', '', [['dès', 220], 290]],
      ['Ski junior *', 'Skis de 126 à 150 cm', [['dès', 105], 160]],
      ['Ski junior *', 'Skis de 96 à 125 cm', [['dès', 90], 120]],
      ['Ski kid *', 'Skis de 70 à 95 cm', [['dès', 60], 90]],
      ['Chaussures intro', 'Pointures 35 à 49', [['dès', 140], 180]],
      ['Chaussures rando', 'Pointures 35 à 49', [['dès', 200], 280]],
      ['Chaussures junior performance', 'Pointures 34 à 42', [['dès', 110], ['dès', 170]]],
      ['Chaussures junior intro', 'Pointures 34 à 42', [['dès', 70], 95]],
      ['Chaussures kid', 'Pointures 23 à 33', [['dès', 40], 70]],
      ['Snowboard Introduction', '', [['dès', 195], 320]],
      ['Snowboard Évolution', '', [['dès', 400], 500]],
      ['Snowboard Performance', '', ['selon modèle', 'selon modèle']],
      ['Snowboard junior', 'Planche de 100 à 138 cm', [145, null]],
      ['Snowboard kid', 'Planche de 70 à 99 cm', [90, null]],
      ['Randonnée : ski + peaux + fixations adulte *', '', [500, 'selon modèle']],
      ['Randonnée : ski + peaux + fixations junior *', '', [290, 'selon modèle']],
      ['Chaussures de randonnée adulte', '', [['dès', 200], 280]],
      ['Chaussures de randonnée junior', '', [['dès', 140], 180]],
      ['Casque adulte', 'Prix pour la saison', [65]],
      ['Casque junior', 'Prix pour la saison', [50]],
      ['Raquettes', 'Prix pour la saison', [180]],
      ['Snowblades', 'Prix pour la saison', [200]]
    ] },
    { id: 'atelier', nom: 'Atelier', cols: ['Prix'], lignes: [
      ['Petit service ski de fond', 'Révision de la structure + fartage', [45]],
      ['Grand service ski de fond', 'Réparation de la semelle + révision de la structure + fartage', [60]],
      ['Fartage standard ski de fond', 'Nettoyage de semelle + fartage standard', [15]],
      ['Fartage course ski de fond', 'Nettoyage de semelle + fartage course', [25]],
      ['Préparation zone de croche', 'Nettoyage zone de croche + fart de croche universel', [15]],
      ['Finition couche', 'Application de paraffine en spray', [15]],
      ['Petit service ski', 'Structure avec pierre, carres latérales, tuning et fartage', [48]],
      ['Petit service snowboard', 'Structure avec pierre, carres latérales, tuning et fartage', [53]],
      ['Grand service ski', 'Remplissage p-tex, structure avec pierre, carres latérales, tuning et fartage', [75]],
      ['Grand service snowboard', 'Remplissage p-tex, structure avec pierre, carres latérales, tuning et fartage', [80]],
      ['Fartage à chaud ski de fond', 'Standard / course', ['<span class="chf">CHF</span> <span class="montant">15 / 25</span>']],
      ['Test BPA des fixations', '', [15]],
      ['Service express', 'Petit et grand service, en supplément', [10]]
    ] }
  ];
  function rendTarifs(id) {
    var o = ONGLETS_TARIFS.find(function (x) { return x.id === id; });
    var cols = o.cols || COLS_JOURS;
    $('#table-tarifs').classList.toggle('semaine', !o.cols);
    var h = '<thead><tr><th scope="col">' + o.nom + '</th>' + cols.map(function (c) { return TITRES_COLS[c] || /^\d+ j$/.test(c) ? '<th scope="col"><abbr title="' + (TITRES_COLS[c] || c.replace(' j', ' jours')) + '" style="text-decoration:none">' + c + '</abbr></th>' : '<th scope="col">' + c + '</th>'; }).join('') + '</tr></thead><tbody>';
    o.lignes.forEach(function (l) {
      h += '<tr><td><strong>' + l[0] + '</strong>' + (l[1] ? '<small>' + l[1] + '</small>' : '') + '</td>' + l[2].map(function (p, k) { var reste = k === l[2].length - 1 ? cols.length - l[2].length : 0; return '<td' + (reste ? ' colspan="' + (reste + 1) + '"' : '') + '>' + cellule(p) + '</td>'; }).join('') + '</tr>';
    });
    $('#table-tarifs').innerHTML = h + '</tbody>';
  }
  function choisitTarif(id) {
    $$('#onglets-tarifs button').forEach(function (x) { x.setAttribute('aria-selected', x.dataset.tarif === id ? 'true' : 'false'); });
    rendTarifs(id);
  }
  $('#onglets-tarifs').innerHTML = ONGLETS_TARIFS.map(function (o, k) { return '<button type="button" role="tab" aria-selected="' + (k === 0) + '" data-tarif="' + o.id + '">' + o.nom + '</button>'; }).join('');
  $('#onglets-tarifs').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    choisitTarif(b.dataset.tarif);
  });
  $$('[data-voir-tarif]').forEach(function (a) { a.addEventListener('click', function () { choisitTarif(a.dataset.voirTarif); }); });

  /* ================= En-tête, menu, conditions ================= */
  var bm = $('#bouton-menu'), nav = $('#nav');
  bm.addEventListener('click', function () {
    var o = nav.classList.toggle('ouvert');
    document.body.classList.toggle('menu-ouvert', o);
    bm.setAttribute('aria-expanded', o); bm.querySelector('.txt').textContent = o ? 'Fermer' : 'Menu';
  });
  $$('#nav a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('ouvert'); document.body.classList.remove('menu-ouvert'); bm.setAttribute('aria-expanded', 'false'); bm.querySelector('.txt').textContent = 'Menu'; }); });
  $$('[data-cgl]').forEach(function (ul) { ul.innerHTML = CGL.map(function (c) { return '<li>' + c + '</li>'; }).join(''); });

  /* ================= Démarrage ================= */
  rendPacks('fond'); rendTarifs('fond');
})();
