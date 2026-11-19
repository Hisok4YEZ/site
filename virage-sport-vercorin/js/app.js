/* Virage Sport, Vercorin : packs, tarifs, menu.
   La réservation se fait en ligne avec Intersport Rent, réseau de location du magasin. */
(function () {
  'use strict';

  /* ================= Données (CHF) =================
     - Location d'hiver : Virage Sport ne publie pas ses prix. Les montants ci-dessous
       sont INDICATIFS (repris du modèle) et doivent être confirmés par le magasin.
       Tableaux : [½ j, 1 j, 2 j, 3 j, 4 j, 5 j, 6 j].
     - Atelier : page « Atelier » de virage.ch (novembre 2026).
     - Été : PDF « Tarifs été / Summer price list » de virage.ch (2026).
       Tableaux : [1 j, 2 j, 3 j, 4 j, 5 j, 6 j, 7 j]. */
  var RESERVATION = 'https://www.intersportrent.ch/fr/location-de-ski/shops/intersport-virage-sport/au-centre-village-vercorin';
  var TELEPHONE = 'tel:+41274558700';

  var T = {
    hiver: {
      green: [15, 20, 39, 56, 71, 83, 94],
      red: [21, 27, 55, 77, 97, 116, 132],
      black: [24, 31, 62, 85, 107, 130, 150],
      skiEnfant: [9, 11, 23, 33, 43, 53, 61],
      snowEnfant: [11, 15, 30, 41, 52, 61, 69]
    },
    velos: {
      ebike: [85, 160, 200, 228, 277, 298, 328],
      vtt: [65, 118, 163, 206, 240, 273, 308],
      junior: [45, 80, 110, 144, 166, 189, 219],
      kids: [30, 53, 74, 94, 110, 124, 139]
    },
    outdoor: {
      casque: [9, 17, 24, 28, 31, 32, 36],
      baudrier: [10, 18, 25, 29, 32, 33, 37],
      piolet: [10, 18, 25, 29, 32, 33, 37],
      crampons: [15, 29, 40, 47, 56, 59, 64],
      longe: [12, 23, 31, 33, 38, 40, 45],
      setVia: [22, 39, 52, 62, 72, 82, 92],
      setMontagne: [30, 58, 80, 90, 110, 120, 130]
    }
  };

  /* Cartes de la vitrine : [nom, détail, étiquette, classe de pastille, tarifs, index 1 jour, index 6 jours, lien] */
  var PACKS = {
    adulte: [
      ['Green', 'Pour les débutants et ceux qui veulent skier tranquillement en respectant leur budget. Indicatif [À CONFIRMER].', 'Débutants', 'verte', T.hiver.green, 1, 6, RESERVATION],
      ['Red', 'Un excellent matériel offrant une grande maniabilité, accroche et stabilité. Indicatif [À CONFIRMER].', 'Bons skieurs', 'rouge', T.hiver.red, 1, 6, RESERVATION],
      ['Black', 'Skis et snowboards dernier cri, pour pistes techniques, freeride ou haut de gamme. Indicatif [À CONFIRMER].', 'Experts', 'noire', T.hiver.black, 1, 6, RESERVATION]
    ],
    enfant: [
      ['Ski enfant', 'Skis et chaussures adaptés à la taille et au niveau des enfants. Indicatif [À CONFIRMER].', 'Enfant', 'neutre', T.hiver.skiEnfant, 1, 6, RESERVATION],
      ['Snowboard enfant', 'Planche et boots pour les jeunes riders. Indicatif [À CONFIRMER].', 'Enfant', 'neutre', T.hiver.snowEnfant, 1, 6, RESERVATION]
    ],
    ete: [
      ['E-bike', 'Vélo électrique, casque VTT compris.', 'Été', 'neutre', T.velos.ebike, 0, 5, TELEPHONE],
      ['VTT Enduro', 'VTT tout suspendu, casque VTT compris.', 'Été', 'neutre', T.velos.vtt, 0, 5, TELEPHONE],
      ['Junior', 'Vélos de 26" à 28", casque VTT compris.', 'Été', 'neutre', T.velos.junior, 0, 5, TELEPHONE],
      ['Kids', 'Vélos de 20" à 24", casque VTT compris.', 'Été', 'neutre', T.velos.kids, 0, 5, TELEPHONE]
    ]
  };

  var CGL = [
    'Conditions générales de location : [À CONFIRMER] auprès du magasin.',
    'Réservation en ligne : conditions d’Intersport Rent. Option d’annulation à CHF 5.– par personne, annulation possible jusqu’à la veille à 12 h (remboursement du montant de la réservation moins le montant de l’annulation).',
    'Location à la saison : locations garanties jusqu’au 20 décembre, ensuite uniquement sur réservation.',
    'Tous les tarifs sont en francs suisses (CHF).'
  ];

  /* ================= Outils ================= */
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  var formatteurCHF = new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  /* Format suisse : « CHF 45.– » */
  function francs(n) {
    var montant = formatteurCHF.formatToParts(Math.round(n)).filter(function (p) { return p.type === 'integer' || p.type === 'group'; }).map(function (p) { return p.value; }).join('');
    return 'CHF ' + montant + '.–';
  }
  /* Même montant, avec la devise et le nombre dans deux balises pour la mise en forme du tableau */
  function francsHTML(n) { return francs(n).replace(/^CHF /, '<span class="chf">CHF</span> <span class="montant">') + '</span>'; }
  /* Cellule de tableau : nombre → montant ; [préfixe, nombre, suffixe] → « dès CHF … » ; texte → tel quel ; null → tiret */
  function cellule(v) {
    if (v === null || v === undefined) return '<span class="montant">–</span>';
    if (typeof v === 'number') return francsHTML(v);
    if (Array.isArray(v)) return (v[0] ? v[0] + ' ' : '') + francsHTML(v[1]) + (v[2] ? ' ' + v[2] : '');
    return v;
  }

  /* ================= Packs (vitrine) ================= */
  function rendPacks(type) {
    $('#grille-packs').innerHTML = PACKS[type].map(function (p) {
      var t = p[4], lien = p[7], externe = lien.indexOf('http') === 0;
      var bouton = externe ? '<a href="' + lien + '" target="_blank" rel="noopener" class="btn btn-ligne">Réserver en ligne</a>' : '<a href="' + lien + '" class="btn btn-ligne">Appeler pour réserver</a>';
      return '<article class="carte-pack"><div class="carte-pack-int"><span class="piste"><i class="' + p[3] + '"></i>' + p[2] + '</span><h3>' + p[0] + '</h3><p class="pour">' + p[1] + '</p><div class="prix"><strong>' + francs(t[p[5]]) + '</strong><span>la journée · ' + francs(t[p[6]]) + ' les 6 jours</span></div>' + bouton + '</div></article>';
    }).join('');
  }
  $$('.packs .onglets button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.packs .onglets button').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
      rendPacks(b.dataset.onglet);
    });
  });

  /* ================= Grille de tarifs ================= */
  var JOURS_HIVER = ['½ j', '1 j', '2 j', '3 j', '4 j', '5 j', '6 j'];
  var JOURS_ETE = ['1 j', '2 j', '3 j', '4 j', '5 j', '6 j', '7 j'];
  var PAR_JOUR = function (n) { return ['', n, '/ jour']; };
  var ONGLETS_TARIFS = [
    { id: 'ski', nom: 'Ski (hiver)', cols: JOURS_HIVER, note: 'Tarifs indicatifs — [À CONFIRMER]. Virage Sport ne publie pas ses prix de location d’hiver : le prix exact s’affiche lors de la réservation sur Intersport Rent.', lignes: [
      ['Green', 'Skis + chaussures · débutants', T.hiver.green],
      ['Red', 'Skis + chaussures · bons skieurs', T.hiver.red],
      ['Black', 'Skis ou snowboard + chaussures · haut de gamme', T.hiver.black],
      ['Ski enfant', 'Skis + chaussures', T.hiver.skiEnfant],
      ['Snowboard enfant', 'Planche + boots', T.hiver.snowEnfant]
    ] },
    { id: 'atelier', nom: 'Atelier', cols: ['Prix'], note: 'Tarifs officiels de l’atelier, publiés sur virage.ch.', lignes: [
      ['Skis : petit service', '', [50]],
      ['Skis : grand service', '', [75]],
      ['Skis : finition course', 'En supplément', [['+', 15]]],
      ['Skis : fartage', '', [12]],
      ['Skis : fartage course', '', [20]],
      ['Snowboard : grand service', '', [['dès', 75]]],
      ['Snowboard : petit service', '', [50]],
      ['Snowboard : fartage', '', [18]]
    ] },
    { id: 'velos', nom: 'Vélos (été)', cols: JOURS_ETE, note: 'Tarifs officiels de l’été 2026 (PDF de virage.ch), par jour de location. Casque VTT compris.', lignes: [
      ['E-bikes', '', T.velos.ebike],
      ['VTT Enduro', '', T.velos.vtt],
      ['Junior', 'Vélos 26" à 28"', T.velos.junior],
      ['Kids', 'Vélos 20" à 24"', T.velos.kids]
    ] },
    { id: 'options', nom: 'Options vélo', cols: ['Prix'], note: 'Tarifs officiels de l’été 2026 (PDF de virage.ch).', lignes: [
      ['Casque location', 'Si non inclus', [PAR_JOUR(10)]],
      ['Casque intégral', '', [PAR_JOUR(15)]],
      ['Gilet de protection', 'Plastron et bras', [PAR_JOUR(20)]],
      ['Protection genou / coude', '', [PAR_JOUR(5)]],
      ['Protections genou + coude', 'Le pack', [PAR_JOUR(10)]]
    ] },
    { id: 'outdoor', nom: 'Outdoor (été)', cols: JOURS_ETE, note: 'Tarifs officiels de l’été 2026 (PDF de virage.ch), par jour de location.', lignes: [
      ['Casque de montagne', '', T.outdoor.casque],
      ['Baudrier', '', T.outdoor.baudrier],
      ['Piolet', '', T.outdoor.piolet],
      ['Crampons', '', T.outdoor.crampons],
      ['Longe via ferrata', '', T.outdoor.longe],
      ['Set via ferrata', 'Casque, baudrier, longe', T.outdoor.setVia],
      ['Set montagne', 'Baudrier, piolet, crampons', T.outdoor.setMontagne]
    ] }
  ];
  function titreCol(c) {
    if (c === '½ j') return 'demi-journée';
    return c === '1 j' ? '1 jour' : c.replace(' j', ' jours');
  }
  function rendTarifs(id) {
    var o = ONGLETS_TARIFS.find(function (x) { return x.id === id; });
    var cols = o.cols;
    $('#note-tarifs').textContent = o.note;
    $('#table-tarifs').classList.toggle('semaine', cols.length > 1);
    var h = '<thead><tr><th scope="col">' + o.nom + '</th>' + cols.map(function (c) { return /^(½|\d+) j$/.test(c) ? '<th scope="col"><abbr title="' + titreCol(c) + '" style="text-decoration:none">' + c + '</abbr></th>' : '<th scope="col">' + c + '</th>'; }).join('') + '</tr></thead><tbody>';
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
  rendPacks('adulte'); rendTarifs('ski');
})();
