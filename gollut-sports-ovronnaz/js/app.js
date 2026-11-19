/* Gollut Sports, Ovronnaz : packs, tarifs, menu.
   La réservation se fait en ligne avec Skiset, partenaire du magasin. */
(function () {
  'use strict';

  /* ================= Données : tarifs officiels (CHF) =================
     Source : page « Location » de gollut.ch (location) et panneau « Tarifs de réparations,
     saison 2025-2026 » (atelier), consultés en novembre 2026.
     Chaque tableau de location : [1 j, 2 j, 3 j, 4 j, 5 j, 6 j]. */
  var RESERVATION = 'https://www.skiset.com/station-ski/ovronnaz/magasins/gollut-sport';

  var T = {
    skis: {
      basics: [39, 74, 105, 110, 134, 138],
      top: [50, 88, 123, 138, 172, 183],
      vip: [65, 114, 160, 179, 223, 238],
      kid: [13, 25, 34, 37, 43, 46],
      junior: [19, 37, 52, 59, 72, 79],
      juniorRace: [29, 57, 79, 89, 109, 119]
    },
    chaussures: {
      adulte: [19, 37, 52, 59, 72, 79],
      kids: [9, 17, 22, 27, 32, 37],
      juniors: [19, 37, 52, 59, 72, 79],
      telemark: [23, 44, 60, 68, 79, 84]
    },
    divers: {
      nordique: [33, 59, 76, 93, 108, 123],
      casqueAdulte: [12, 23, 31, 33, 38, 40],
      casqueEnfant: [9, 17, 24, 28, 31, 32],
      luge: [19, 37, 52, 59, 72, 79],
      raquettes: [19, 37, 52, 59, 72, 79],
      dva: [38, 72, 99, 106, 132, 136],
      batons: [9, 17, 24, 28, 31, 32]
    }
  };

  /* Matériel mis en avant (vitrine) : [nom, détail, étiquette, tarifs] */
  var PACKS = {
    adulte: [
      ['Basics', 'Skis de la gamme basics', 'Skis', T.skis.basics],
      ['Top skis / télémark', 'Skis haut de gamme ou télémark', 'Skis', T.skis.top],
      ['VIP – Test', 'Les skis VIP et de test', 'Skis', T.skis.vip],
      ['Souliers', 'Souliers de ski et boots de snowboard', 'Chaussures', T.chaussures.adulte]
    ],
    enfant: [
      ['Kids', 'Skis de 70 à 100 cm', 'Skis', T.skis.kid],
      ['Juniors', 'Skis de 101 à 150 cm', 'Skis', T.skis.junior],
      ['Juniors race', 'Juniors race, freestyle, freeride', 'Skis', T.skis.juniorRace],
      ['Souliers kids', 'Souliers de ski pour enfants', 'Chaussures', T.chaussures.kids]
    ],
    neige: [
      ['Set nordique', 'Ski de fond', 'Set', T.divers.nordique],
      ['Raquettes à neige', 'Pour se balader dans la neige', 'Raquettes', T.divers.raquettes],
      ['Luge et bob', 'Pour toute la famille', 'Luge', T.divers.luge],
      ['DVA + pelle + sonde', 'Le matériel de sécurité avalanche', 'Sécurité', T.divers.dva]
    ]
  };

  var CGL = [
    'Conditions générales de location : [À CONFIRMER] auprès du magasin.',
    'Tous les tarifs sont en francs suisses (CHF).'
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
      return '<article class="carte-pack"><div class="carte-pack-int"><span class="piste"><i class="neutre"></i>' + p[2] + '</span><h3>' + p[0] + '</h3><p class="pour">' + p[1] + '</p><div class="prix"><strong>' + francs(t[0]) + '</strong><span>la journée · ' + francs(t[5]) + ' les 6 jours</span></div><a href="' + RESERVATION + '" target="_blank" rel="noopener" class="btn btn-ligne">Réserver en ligne</a></div></article>';
    }).join('');
  }
  $$('.packs .onglets button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.packs .onglets button').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
      rendPacks(b.dataset.onglet);
    });
  });

  /* ================= Grille de tarifs ================= */
  var COLS_JOURS = ['1 j', '2 j', '3 j', '4 j', '5 j', '6 j'];
  var TITRES_COLS = { '1 j': '1 jour' };
  var PAR_PIECE = '<span class="chf">CHF</span> <span class="montant">25</span> / pièce';
  var PAR_METRE = '<span class="chf">CHF</span> <span class="montant">8</span> / mètre';
  var ONGLETS_TARIFS = [
    { id: 'skis', nom: 'Skis', lignes: [
      ['Basics', '', T.skis.basics],
      ['Top skis / télémark', '', T.skis.top],
      ['VIP – Test', '', T.skis.vip],
      ['Kids', 'Skis de 70 à 100 cm', T.skis.kid],
      ['Juniors', 'Skis de 101 à 150 cm', T.skis.junior],
      ['Juniors race, freestyle, freeride', '', T.skis.juniorRace],
      ['Skis de randonnée', 'Pas en location : seulement en vente d’occasion', [null, null, null, null, null, null]]
    ] },
    { id: 'chaussures', nom: 'Chaussures', lignes: [
      ['Souliers et boots snowboard', '', T.chaussures.adulte],
      ['Souliers kids', '', T.chaussures.kids],
      ['Souliers juniors', 'Pointures 38 à 42', T.chaussures.juniors],
      ['Souliers de randonnée et télémark', '', T.chaussures.telemark]
    ] },
    { id: 'divers', nom: 'Fond et divers', lignes: [
      ['Set nordique', 'Ski de fond', T.divers.nordique],
      ['Raquettes à neige', '', T.divers.raquettes],
      ['Luge et bob', '', T.divers.luge],
      ['DVA + pelle + sonde', '', T.divers.dva],
      ['Casque adulte', '', T.divers.casqueAdulte],
      ['Casque enfant', '', T.divers.casqueEnfant],
      ['Bâtons', '', T.divers.batons]
    ] },
    { id: 'atelier', nom: 'Atelier', cols: ['Prix'], lignes: [
      ['Grand service', 'Surmoulage, carres et fartage · skis adultes < 99 au patin', [['dès', 75]]],
      ['Grand service', 'Skis adultes 100 < au patin et snowboards', [['dès', 95]]],
      ['Grand service', 'Skis juniors (< 140 cm)', [['dès', 55]]],
      ['Petit service', 'Carres et fartage · skis adultes < 99 au patin', [['dès', 55]]],
      ['Petit service', 'Skis adultes 100 < au patin et snowboards', [['dès', 65]]],
      ['Petit service', 'Skis juniors (< 140 cm)', [['dès', 45]]],
      ['Aiguisage', 'Skis adultes < 99 au patin', [['dès', 50]]],
      ['Aiguisage', 'Skis adultes 100 < au patin et snowboards', [['dès', 60]]],
      ['Aiguisage', 'Skis juniors (< 140 cm)', [['dès', 40]]],
      ['Surmoulage', 'Surmoulage + bande + pierre · skis adultes < 99 au patin', [['dès', 50]]],
      ['Surmoulage', 'Skis adultes 100 < au patin et snowboards', [['dès', 60]]],
      ['Surmoulage', 'Skis juniors (< 140 cm)', [['dès', 40]]],
      ['Empiècements et collages divers', '', [['dès', 25]]],
      ['Forfait compétition', 'Payable d’avance · 10 services minimum', [350]],
      ['Forfait compétition', 'Payable d’avance · 15 services minimum', [450]],
      ['Fixations : pose sans achat', 'Skis et snowboard', [['dès', 100]]],
      ['Fixations : pose sans achat', 'Randonnée', [['dès', 120]]],
      ['Fixations : déplacement', 'Skis et snowboard', [['dès', 50]]],
      ['Fixations : déplacement', 'Randonnée', [['dès', 75]]],
      ['Boots clinic : thermo', 'Sans achat', [['dès', 65]]],
      ['Boots clinic : coques + thermo', 'Sans achat', [['dès', 80]]],
      ['Boots clinic : scanner', 'Sans achat', [['dès', 100]]],
      ['Boots clinic : élargissements', '', ['dès ' + PAR_PIECE]],
      ['Encollage peaux de phoque', '', [['dès', 60]]],
      ['Filet', 'Au mètre', [PAR_METRE]]
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
  rendPacks('adulte'); rendTarifs('skis');
})();
