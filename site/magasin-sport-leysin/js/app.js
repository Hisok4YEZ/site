/* Magasin SPORT, Leysin : réservation, packs, tarifs, menu */
(function () {
  'use strict';

  /* ================= Données (tarifs en CHF, à confirmer par le magasin) =================
     Chaque tableau : [½ j, 1 j, 2 j, 3 j, 4 j, 5 j, 6 j]           */
  var T = {
    pack: {
      baby: [8, 9, 19, 25, 31, 37, 42], junior: [9, 11, 23, 33, 43, 53, 61], competition: [11, 14, 28, 40, 52, 61, 71],
      bronze: [15, 20, 39, 56, 71, 83, 94], argent: [18, 24, 47, 66, 84, 100, 113], or: [21, 27, 55, 77, 97, 116, 132], diamant: [24, 31, 62, 85, 107, 130, 150]
    },
    skis: {
      baby: [5, 6, 9, 14, 19, 23, 25], junior: [6, 8, 15, 21, 26, 31, 36], competition: [7, 9, 17, 24, 32, 39, 44],
      bronze: [12, 15, 30, 43, 55, 67, 75], argent: [14, 18, 36, 52, 68, 82, 94], or: [16, 22, 43, 62, 80, 97, 111], diamant: [18, 24, 49, 70, 89, 107, 125]
    },
    snowPack: { enfant: [11, 15, 30, 41, 52, 61, 69], adulte: [19, 24, 49, 68, 85, 101, 113] },
    snow: { enfant: [8, 10, 19, 27, 37, 44, 52], adulte: [13, 17, 34, 49, 62, 77, 89] },
    chaussures: { baby: [3, 5, 8, 12, 15, 18, 20], junior: [5, 6, 11, 16, 21, 24, 27], adulte: [9, 13, 26, 38, 49, 58, 66] },
    batons: [5, 5, 8, 9, 11, 13, 14],
    luge: [3, 5, 8, 9, 12, 15, 17],
    raquettes: [7, 9, 16, 21, 25, 29, 33],
    casque: [3, 5, 7, 9, 12, 15, 17],
    veloski: { sans: [27, 37, 73], avec: [32, 41, 83] }
  };

  var GAMMES = {
    enfant: [
      { id: 'baby', nom: 'Baby', detail: 'Les tout-petits, skis de 80 à 110 cm' },
      { id: 'junior', nom: 'Junior', detail: 'Du débutant au niveau intermédiaire, skis de 120 à 150 cm' },
      { id: 'competition', nom: 'Compétition', detail: "Pour les jeunes skieurs confirmés, skis de 120 à 160 cm" }
    ],
    adulte: [
      { id: 'bronze', nom: 'Bronze', detail: 'Débutant, chasse-neige, ou mini-skis', piste: 'verte', niveau: 'Pistes vertes' },
      { id: 'argent', nom: 'Argent', detail: 'Skieur moyen, parallèle de base', piste: 'bleue', niveau: 'Pistes bleues' },
      { id: 'or', nom: 'Or', detail: 'Bon skieur, ski haut de gamme', piste: 'rouge', niveau: 'Pistes rouges' },
      { id: 'diamant', nom: 'Diamant', detail: "Bon skieur, ski récent et d'exception", piste: 'noire', niveau: 'Toutes pistes' }
    ]
  };

  var CGL = [
    "Une empreinte bancaire est faite pour la caution ; à défaut, une pièce d'identité est demandée.",
    'La location est payable lors de la prise en charge du matériel.',
    "Les heures de retrait d'une demi-journée suivent les horaires d'ouverture du magasin.",
    'Le tarif dégressif s’applique uniquement aux journées entières et consécutives.',
    'Le matériel loué est placé sous la responsabilité du locataire.',
    "Le matériel n'est pas assuré contre la perte, le vol ou la casse. Une garantie casse est proposée en caisse.",
    'Tout matériel non restitué est facturé selon sa valeur à neuf : 60 % la première année, 40 % la deuxième, puis 20 %.',
    "Les dégâts résultant d'un usage anormal sont facturés au tarif de l'atelier."
  ];

  /* Périodes de vacances (à valider selon le calendrier local chaque saison) */
  var VACANCES = [['2026-12-19', '2027-01-04'], ['2027-02-06', '2027-03-08'], ['2027-04-03', '2027-05-03']];

  var DUREES = [
    { v: 'am', court: '½ j matin', idx: 0, jours: 1 },
    { v: 'pm', court: '½ j après-midi', idx: 0, jours: 1 },
    { v: '1', court: '1 jour', idx: 1, jours: 1 },
    { v: '2', court: '2 jours', idx: 2, jours: 2 },
    { v: '3', court: '3 jours', idx: 3, jours: 3 },
    { v: '4', court: '4 jours', idx: 4, jours: 4 },
    { v: '5', court: '5 jours', idx: 5, jours: 5 },
    { v: '6', court: '6 jours', idx: 6, jours: 6 }
  ];

  /* ================= Outils ================= */
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  var formatteurCHF = new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  function francs(n) {
    var montant = formatteurCHF.formatToParts(Math.round(n)).filter(function (p) { return p.type === 'integer' || p.type === 'group'; }).map(function (p) { return p.value; }).join('');
    return 'CHF ' + montant + '.–';
  }
  /* Même montant, avec la devise et le nombre dans deux balises pour la mise en forme du tableau */
  function francsHTML(n) { return francs(n).replace(/^CHF /, '<span class="chf">CHF</span> <span class="montant">') + '</span>'; }
  function echappe(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function isoLocal(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function versDate(iso) { var p = iso.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function ajouteJours(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function dateLongue(d) { return d.toLocaleDateString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long' }); }
  function dateCourte(d) { return d.toLocaleDateString('fr-CH', { weekday: 'short', day: 'numeric', month: 'short' }); }
  function duree() { return DUREES.find(function (x) { return x.v === etat.duree; }); }

  /* ================= État ================= */
  var compteur = 0;
  function nouveauSkieur(cat, preset) {
    compteur++;
    var s = { id: compteur, prenom: '', cat: cat || 'adulte', activite: 'ski', formule: 'pack', gamme: cat === 'enfant' ? 'junior' : 'argent', bottes: 'avec', casque: false, batons: false, taille: '', poids: '', pointure: '' };
    if (preset) Object.keys(preset).forEach(function (k) { s[k] = preset[k]; });
    return s;
  }
  /* Date proposée par défaut : demain, ou l'ouverture de la saison si elle n'a pas commencé (à mettre à jour chaque saison) */
  var OUVERTURE_SAISON = '2026-12-19';
  var demain = isoLocal(ajouteJours(new Date(), 1));
  var etat = { date: demain > OUVERTURE_SAISON ? demain : OUVERTURE_SAISON, duree: '6', skieurs: [nouveauSkieur('adulte')], etape: 1 };

  /* ================= Calcul des prix ================= */
  function lignesSkieur(s) {
    var d = duree(), i = d.idx, L = [];
    function ajoute(nom, tab) { L.push({ nom: nom, prix: tab[i] }); }
    var g = (GAMMES[s.cat].find(function (x) { return x.id === s.gamme; }) || GAMMES[s.cat][0]);
    if (s.activite === 'ski') {
      if (s.formule === 'pack') ajoute('Pack ' + g.nom + ' (skis + chaussures)', T.pack[g.id]);
      if (s.formule === 'skis') ajoute('Skis ' + g.nom, T.skis[g.id]);
      if (s.formule === 'chaussures') ajoute('Chaussures ' + (s.cat === 'adulte' ? 'adulte' : (g.id === 'baby' ? 'baby' : 'junior')), T.chaussures[s.cat === 'adulte' ? 'adulte' : (g.id === 'baby' ? 'baby' : 'junior')]);
      if (s.batons && s.formule !== 'chaussures') ajoute('Bâtons', T.batons);
    } else if (s.activite === 'snow') {
      if (s.formule === 'pack') ajoute('Pack snowboard ' + s.cat, T.snowPack[s.cat]);
      else ajoute('Snowboard ' + s.cat, T.snow[s.cat]);
    } else if (s.activite === 'raquettes') {
      ajoute('Raquettes', T.raquettes);
    } else if (s.activite === 'luge') {
      ajoute('Luge', T.luge);
    } else if (s.activite === 'veloski') {
      if (i > 2) return { lignes: [], total: 0, indispo: true };
      ajoute('Vélo-ski ' + (s.bottes === 'avec' ? 'avec bottes' : 'sans bottes'), T.veloski[s.bottes]);
    }
    if (s.casque) ajoute('Casque', T.casque);
    return { lignes: L, total: L.reduce(function (a, l) { return a + l.prix; }, 0), indispo: false };
  }

  function chevaucheVacances(debut, jours) {
    var a = versDate(debut), b = ajouteJours(a, jours - 1);
    return VACANCES.some(function (v) { var x = versDate(v[0]), y = versDate(v[1]); return a <= y && b >= x; });
  }

  function calcul() {
    var brut = 0;
    var details = etat.skieurs.map(function (s) { var r = lignesSkieur(s); brut += r.total; return r; });
    var remise = null, d = duree();
    if (etat.skieurs.length >= 10) remise = { taux: 0.10, nom: 'Groupe de 10 personnes et plus' };
    if (d.v === '6' && etat.date && !chevaucheVacances(etat.date, 6)) {
      if (!remise || remise.taux < 0.25) remise = { taux: 0.25, nom: 'Semaine hors périodes de vacances' };
    }
    var montantRemise = remise ? Math.round(brut * remise.taux) : 0;
    return { details: details, brut: brut, remise: remise, montantRemise: montantRemise, total: Math.round(brut - montantRemise) };
  }

  function texteDates() {
    if (!etat.date) return '';
    var d = duree(), a = versDate(etat.date);
    if (d.v === 'am') return dateLongue(a) + ', le matin';
    if (d.v === 'pm') return dateLongue(a) + ', l’après-midi';
    if (d.jours === 1) return dateLongue(a) + ', la journée';
    return 'Du ' + dateLongue(a) + ' au ' + dateLongue(ajouteJours(a, d.jours - 1));
  }

  function resumeSkieur(s) {
    var g = GAMMES[s.cat].find(function (x) { return x.id === s.gamme; });
    var noms = { ski: 'Ski alpin', snow: 'Snowboard', raquettes: 'Raquettes', luge: 'Luge', veloski: 'Vélo-ski' };
    var t = noms[s.activite];
    if (s.activite === 'ski') t += ', ' + ({ pack: 'pack ', skis: 'skis ', chaussures: 'chaussures ' }[s.formule]) + (s.formule === 'chaussures' ? '' : g.nom);
    if (s.activite === 'snow') t += s.formule === 'pack' ? ', planche + boots' : ', planche seule';
    var opts = [];
    if (s.casque) opts.push('casque');
    if (s.batons && s.activite === 'ski' && s.formule !== 'chaussures') opts.push('bâtons');
    return t + (opts.length ? ' + ' + opts.join(' + ') : '');
  }

  /* ================= Rendu : récapitulatif ================= */
  var dernierTotal = null;
  function rendRecap() {
    var c = calcul(), d = duree();
    var html = '<h3>Votre réservation</h3><p class="periode">' + (etat.date ? echappe(texteDates()) : 'Dates à choisir') + '</p><ul>';
    etat.skieurs.forEach(function (s, k) {
      var r = c.details[k];
      html += '<li><span>' + echappe(s.prenom || ('Personne ' + (k + 1))) + '<small>' + echappe(resumeSkieur(s)) + '</small></span><span>' + (r.indispo ? '—' : francs(r.total)) + '</span></li>';
    });
    html += '</ul>';
    if (c.remise) html += '<ul><li class="remise"><span>' + echappe(c.remise.nom) + '<small>−' + Math.round(c.remise.taux * 100) + ' %</small></span><span>−' + francs(c.montantRemise) + '</span></li></ul>';
    html += '<div class="total"><span>Total</span><strong id="total-montant">' + francs(c.total) + '</strong></div>';
    html += '<p class="paiement">Rien à payer en ligne : vous réglez au magasin en récupérant le matériel. ' + (d.idx === 0 ? 'Location à la demi-journée.' : d.jours + ' jour' + (d.jours > 1 ? 's' : '') + ' de location.') + '</p>';
    $('#recap').innerHTML = html;
    if (dernierTotal !== null && dernierTotal !== c.total) $('#total-montant').classList.add('flash');
    dernierTotal = c.total;
  }

  /* ================= Rendu : étape 1 ================= */
  function rendDuree() {
    $('#r-duree').innerHTML = DUREES.map(function (d) {
      return '<label class="puce"><input type="radio" name="duree" value="' + d.v + '"' + (etat.duree === d.v ? ' checked' : '') + '><span>' + d.court + '</span></label>';
    }).join('');
  }
  function rendRappel() {
    var p = $('#r-rappel');
    if (!etat.date) { p.textContent = 'Choisissez une date pour voir vos dates de location.'; return; }
    var t = texteDates();
    if (duree().v === '6') t += chevaucheVacances(etat.date, 6) ? ' (période de vacances)' : ' : −25 % appliqués, hors périodes de vacances';
    p.textContent = t.charAt(0).toUpperCase() + t.slice(1);
  }

  /* ================= Rendu : étape 2 ================= */
  function radio(nom, valeur, courant, texte, desactive) {
    return '<label class="puce"><input type="radio" name="' + nom + '" value="' + valeur + '"' + (courant === valeur ? ' checked' : '') + (desactive ? ' disabled' : '') + '><span>' + texte + '</span></label>';
  }
  function rendSkieur(s, k) {
    var n = 's' + s.id, d = duree(), r = lignesSkieur(s);
    var h = '<article class="skieur" data-id="' + s.id + '">';
    h += '<header><h4>Personne ' + (k + 1) + (s.prenom ? ' : ' + echappe(s.prenom) : '') + '</h4>' + (etat.skieurs.length > 1 ? '<button type="button" class="lien-bouton" data-retirer="' + s.id + '">Retirer</button>' : '') + '</header>';
    h += '<div class="ligne-champs ligne-2" style="margin-bottom:18px"><div><label for="' + n + '-prenom">Prénom</label><input class="champ" id="' + n + '-prenom" data-champ="prenom" value="' + echappe(s.prenom) + '" autocomplete="off"></div>';
    h += '<fieldset class="groupe" style="margin:0"><legend class="visuellement-cache">Âge</legend><span class="etiquette" style="font-size:13.5px;color:var(--brume);margin-bottom:6px;display:block;font-weight:700">Âge</span><div class="puces">' + radio(n + '-cat', 'adulte', s.cat, 'Adulte') + radio(n + '-cat', 'enfant', s.cat, 'Enfant') + '</div></fieldset></div>';

    h += '<fieldset class="groupe"><legend>Activité</legend><div class="puces">' +
      radio(n + '-act', 'ski', s.activite, 'Ski alpin') + radio(n + '-act', 'snow', s.activite, 'Snowboard') +
      radio(n + '-act', 'raquettes', s.activite, 'Raquettes') +
      (s.cat === 'adulte' ? radio(n + '-act', 'veloski', s.activite, 'Vélo-ski') : '') +
      radio(n + '-act', 'luge', s.activite, 'Luge') + '</div></fieldset>';

    if (s.activite === 'ski') {
      h += '<fieldset class="groupe"><legend>Formule</legend><div class="puces">' + radio(n + '-for', 'pack', s.formule, 'Skis + chaussures') + radio(n + '-for', 'skis', s.formule, 'Skis seuls') + radio(n + '-for', 'chaussures', s.formule, 'Chaussures seules') + '</div></fieldset>';
      if (s.formule !== 'chaussures' || s.cat === 'enfant') {
        h += '<fieldset class="groupe"><legend>Gamme</legend><div class="gammes">' + GAMMES[s.cat].filter(function (g) { return !(s.formule === 'chaussures' && g.id === 'competition'); }).map(function (g) {
          var tab = s.formule === 'pack' ? T.pack[g.id] : s.formule === 'skis' ? T.skis[g.id] : T.chaussures[g.id === 'baby' ? 'baby' : 'junior'];
          return '<label class="gamme"><input type="radio" name="' + n + '-gam" value="' + g.id + '"' + (s.gamme === g.id ? ' checked' : '') + '><span><strong>' + g.nom + '<em style="font-style:normal">' + francs(tab[d.idx]) + '</em></strong>' + g.detail + (g.piste ? '<br><span class="piste"><i class="' + g.piste + '"></i>' + g.niveau + '</span>' : '') + '</span></label>';
        }).join('') + '</div></fieldset>';
      }
    }
    if (s.activite === 'snow') {
      h += '<fieldset class="groupe"><legend>Formule</legend><div class="puces">' + radio(n + '-for', 'pack', s.formule, 'Planche + boots') + radio(n + '-for', 'planche', s.formule, 'Planche seule') + '</div></fieldset>';
    }
    if (s.activite === 'veloski') {
      if (d.idx > 2) h += '<p class="indispo">Le vélo-ski se loue pour une demi-journée, 1 jour ou 2 jours. Changez la durée à l’étape 1, ou choisissez une autre activité.</p><div style="height:18px"></div>';
      else h += '<fieldset class="groupe"><legend>Bottes</legend><div class="puces">' + radio(n + '-bot', 'avec', s.bottes, 'Avec bottes') + radio(n + '-bot', 'sans', s.bottes, 'Sans bottes') + '</div></fieldset>';
    }
    if (s.activite !== 'luge' && s.activite !== 'raquettes') {
      h += '<div class="ligne-champs" style="margin-bottom:20px">' +
        '<div><label for="' + n + '-taille">Taille (cm)</label><input class="champ" id="' + n + '-taille" data-champ="taille" inputmode="numeric" value="' + echappe(s.taille) + '" placeholder="175"></div>' +
        '<div><label for="' + n + '-poids">Poids (kg)</label><input class="champ" id="' + n + '-poids" data-champ="poids" inputmode="numeric" value="' + echappe(s.poids) + '" placeholder="70"></div>' +
        '<div><label for="' + n + '-pointure">Pointure</label><input class="champ" id="' + n + '-pointure" data-champ="pointure" inputmode="numeric" value="' + echappe(s.pointure) + '" placeholder="42"></div></div>';
    }
    h += '<fieldset class="groupe"><legend>Options</legend><div class="options">' +
      '<label class="case"><input type="checkbox" data-option="casque"' + (s.casque ? ' checked' : '') + '> Casque (+' + francs(T.casque[d.idx]) + ')</label>' +
      (s.activite === 'ski' && s.formule !== 'chaussures' ? '<label class="case"><input type="checkbox" data-option="batons"' + (s.batons ? ' checked' : '') + '> Bâtons (+' + francs(T.batons[d.idx]) + ')</label>' : '') +
      '</div></fieldset>';
    h += '<div class="sous-total"><span>Sous-total</span><strong>' + (r.indispo ? 'Indisponible' : francs(r.total)) + '</strong></div>';
    return h + '</article>';
  }
  function rendSkieurs() {
    $('#skieurs').innerHTML = etat.skieurs.map(rendSkieur).join('');
    $('#ajouter-skieur').hidden = etat.skieurs.length >= 15;
  }
  function majSousTotaux() {
    etat.skieurs.forEach(function (s) {
      var el = $('.skieur[data-id="' + s.id + '"] .sous-total strong');
      if (el) { var r = lignesSkieur(s); el.textContent = r.indispo ? 'Indisponible' : francs(r.total); }
    });
  }

  /* ================= Rendu : étape 3 ================= */
  function rendResumeFinal() {
    var c = calcul();
    var h = '<table><tbody><tr><td><strong>Dates</strong><small>' + echappe(texteDates().charAt(0).toUpperCase() + texteDates().slice(1)) + '</small></td><td></td></tr>';
    etat.skieurs.forEach(function (s, k) {
      var r = c.details[k];
      h += '<tr><td><strong>' + echappe(s.prenom || 'Personne ' + (k + 1)) + '</strong><small>' + r.lignes.map(function (l) { return echappe(l.nom); }).join(', ') +
        (s.taille || s.poids || s.pointure ? ' · ' + [s.taille && s.taille + ' cm', s.poids && s.poids + ' kg', s.pointure && 'pointure ' + s.pointure].filter(Boolean).map(echappe).join(', ') : '') + '</small></td><td>' + francs(r.total) + '</td></tr>';
    });
    if (c.remise) h += '<tr><td><strong>' + echappe(c.remise.nom) + '</strong></td><td>−' + francs(c.montantRemise) + '</td></tr>';
    h += '<tr><td><strong>Total à régler au magasin</strong></td><td>' + francs(c.total) + '</td></tr></tbody></table>';
    $('#resume-final').innerHTML = h;

    var sel = $('#c-retrait'), d = duree(), jour = versDate(etat.date).getDay(), opts;
    if (jour === 0) opts = ['Dimanche : horaires à confirmer'];
    else if (jour === 1) opts = ['Matin, 9 h – 10 h', 'Matin, 10 h – 12 h', 'Après-midi, 13 h 30 – 15 h', 'Après-midi, 15 h – 18 h 30'];
    else if (jour === 6) opts = ['Matin, 9 h – 10 h 30', 'Matin, 10 h 30 – 12 h', 'Après-midi, 13 h – 15 h', 'Après-midi, 15 h – 17 h'];
    else opts = ['Matin, 9 h – 10 h 30', 'Matin, 10 h 30 – 12 h', 'Après-midi, 12 h – 15 h', 'Après-midi, 15 h – 18 h 30'];
    if (jour !== 0 && d.v === 'am') opts = opts.filter(function (o) { return o.indexOf('Matin,') === 0; });
    if (jour !== 0 && d.v === 'pm') opts = opts.filter(function (o) { return o.indexOf('Après-midi,') === 0; });
    sel.innerHTML = opts.map(function (o) { return '<option>' + o + '</option>'; }).join('');
  }

  /* ================= Navigation entre étapes ================= */
  function allerA(n) {
    etat.etape = n;
    [1, 2, 3, 4].forEach(function (k) { $('#etape-' + k).hidden = k !== n; });
    $$('#etapes li').forEach(function (li, k) {
      li.classList.toggle('fait', k + 1 < n || n === 4);
      li.classList.toggle('actuelle', k + 1 === n);
    });
    if (n === 2) rendSkieurs();
    if (n === 3) rendResumeFinal();
    rendRecap();
    var haut = $('#reserver').getBoundingClientRect().top + window.scrollY + 40;
    if (window.scrollY > haut || window.scrollY < haut - 400) window.scrollTo({ top: haut, behavior: 'smooth' });
  }
  function erreur(n, msg) { var e = $('#erreur-' + n); e.textContent = msg || ''; e.hidden = !msg; }

  $('#vers-2').addEventListener('click', function () {
    if (!etat.date) { erreur(1, 'Choisissez le premier jour de location.'); return; }
    if (etat.date < isoLocal(new Date())) { erreur(1, 'Cette date est passée. Choisissez une date à partir d’aujourd’hui.'); return; }
    erreur(1); allerA(2);
  });
  $('#vers-3').addEventListener('click', function () {
    var bloque = etat.skieurs.some(function (s) { return lignesSkieur(s).indispo; });
    if (bloque) { erreur(2, 'Le vélo-ski se loue au maximum 2 jours. Changez la durée ou l’activité de la personne concernée.'); return; }
    erreur(2); allerA(3);
  });
  $$('[data-retour]').forEach(function (b) { b.addEventListener('click', function () { allerA(+b.dataset.retour); }); });

  /* Étape 1 */
  var champDate = $('#r-date');
  champDate.min = isoLocal(new Date());
  champDate.value = etat.date;
  champDate.addEventListener('change', function () { etat.date = champDate.value; erreur(1); rendRappel(); rendRecap(); });
  $('#r-duree').addEventListener('change', function (e) { if (e.target.name === 'duree') { etat.duree = e.target.value; rendRappel(); rendRecap(); } });

  /* Étape 2 : saisie */
  var conteneur = $('#skieurs');
  function skieurDe(el) { var a = el.closest('.skieur'); return a && etat.skieurs.find(function (s) { return s.id === +a.dataset.id; }); }
  conteneur.addEventListener('input', function (e) {
    var s = skieurDe(e.target); if (!s || !e.target.dataset.champ) return;
    s[e.target.dataset.champ] = e.target.value;
    if (e.target.dataset.champ === 'prenom') {
      var h = e.target.closest('.skieur').querySelector('h4');
      h.textContent = 'Personne ' + (etat.skieurs.indexOf(s) + 1) + (s.prenom ? ' : ' + s.prenom : '');
    }
    rendRecap();
  });
  conteneur.addEventListener('change', function (e) {
    var s = skieurDe(e.target); if (!s) return;
    var t = e.target, nom = t.name || '', structure = false;
    if (t.dataset.option) { s[t.dataset.option] = t.checked; }
    else if (/-cat$/.test(nom)) { s.cat = t.value; s.gamme = t.value === 'enfant' ? 'junior' : 'argent'; if (t.value === 'enfant' && s.activite === 'veloski') s.activite = 'ski'; structure = true; }
    else if (/-act$/.test(nom)) { s.activite = t.value; s.formule = 'pack'; structure = true; }
    else if (/-for$/.test(nom)) { s.formule = t.value; if (t.value === 'chaussures' && s.gamme === 'competition') s.gamme = 'junior'; structure = true; }
    else if (/-gam$/.test(nom)) { s.gamme = t.value; }
    else if (/-bot$/.test(nom)) { s.bottes = t.value; }
    if (structure) {
      var focus = t.name + '|' + t.value;
      rendSkieurs();
      var el = $('input[name="' + focus.split('|')[0] + '"][value="' + focus.split('|')[1] + '"]');
      if (el) el.focus();
    } else majSousTotaux();
    erreur(2);
    rendRecap();
  });
  conteneur.addEventListener('click', function (e) {
    var b = e.target.closest('[data-retirer]'); if (!b) return;
    etat.skieurs = etat.skieurs.filter(function (s) { return s.id !== +b.dataset.retirer; });
    rendSkieurs(); rendRecap();
  });
  $('#ajouter-skieur').addEventListener('click', function () {
    etat.skieurs.push(nouveauSkieur('adulte'));
    rendSkieurs(); rendRecap();
    var der = $$('.skieur').pop(); if (der) { der.scrollIntoView({ behavior: 'smooth', block: 'center' }); der.querySelector('input').focus({ preventScroll: true }); }
  });

  /* Étape 3 : envoi (simulé) */
  $('#form-contact').addEventListener('submit', function (e) {
    e.preventDefault();
    var champs = ['c-prenom', 'c-nom', 'c-tel'], vide = champs.filter(function (id) { return !$('#' + id).value.trim(); });
    if (vide.length) { erreur(3, 'Renseignez votre prénom, votre nom et votre téléphone.'); $('#' + vide[0]).focus(); return; }
    if (!$('#c-cgl').checked) { erreur(3, 'Cochez la case pour accepter les conditions générales de location.'); $('#c-cgl').focus(); return; }
    erreur(3);
    var c = calcul(), num = 'SPORT-' + String(Math.floor(10000 + Math.random() * 89999));
    var prenom = $('#c-prenom').value.trim();
    $('#etape-4').innerHTML =
      '<div class="coche" aria-hidden="true"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>' +
      '<h3>C’est réservé, ' + echappe(prenom) + ' !</h3>' +
      '<p>Votre matériel sera prêt au magasin, ' + echappe(texteDates().charAt(0).toLowerCase() + texteDates().slice(1)) + '.</p>' +
      '<div class="numero">' + num + '</div>' +
      '<p class="bandeau-demo">Démonstration : cette réservation n’a pas été envoyée au magasin.</p>' +
      '<p><strong>' + francs(c.total) + '</strong> à régler au magasin, pour ' + etat.skieurs.length + ' personne' + (etat.skieurs.length > 1 ? 's' : '') + '. Retrait : ' + echappe($('#c-retrait').value.toLowerCase()) + '.</p>' +
      '<div class="liste-prevoir"><h4>À prévoir le jour du retrait</h4><ul><li>Votre numéro de réservation</li><li>Une carte bancaire pour l’empreinte de caution, ou une pièce d’identité</li><li>Des chaussettes de ski, pour l’essayage des chaussures</li></ul></div>' +
      '<button type="button" class="btn btn-ligne" id="nouvelle-resa">Faire une autre réservation</button>';
    allerA(4);
    $('#nouvelle-resa').addEventListener('click', function () {
      etat.skieurs = [nouveauSkieur('adulte')];
      $('#form-contact').reset();
      allerA(1);
    });
  });

  /* ================= Accès rapide (accueil) ================= */
  var arDate = $('#ar-date');
  arDate.min = isoLocal(new Date());
  arDate.value = etat.date;
  $('#acces-rapide').addEventListener('submit', function (e) {
    e.preventDefault();
    etat.date = arDate.value || etat.date;
    etat.duree = $('#ar-duree').value;
    var nb = +$('#ar-nb').value;
    while (etat.skieurs.length < nb) etat.skieurs.push(nouveauSkieur('adulte'));
    if (etat.skieurs.length > nb) etat.skieurs = etat.skieurs.slice(0, nb);
    champDate.value = etat.date; rendDuree(); rendRappel();
    allerA(2);
    window.scrollTo({ top: $('#reserver').getBoundingClientRect().top + window.scrollY - 10, behavior: 'smooth' });
  });

  /* ================= Packs (vitrine) ================= */
  function rendPacks(type) {
    var html;
    if (type === 'snow') {
      html = [['enfant', 'Snowboard enfant', 'Planche et boots adaptées aux plus jeunes riders.'], ['adulte', 'Snowboard adulte', 'Planche et boots, pour débuter comme pour progresser.']].map(function (p) {
        var t = T.snowPack[p[0]];
        return '<article class="carte-pack"><div class="carte-pack-int"><span class="piste"><i class="neutre"></i>Planche + boots</span><h3>' + p[1] + '</h3><p class="pour">' + p[2] + '</p><div class="prix"><strong>' + francs(t[1]) + '</strong><span>la journée · ' + francs(t[6]) + ' les 6 jours</span></div><a href="#reserver" class="btn btn-ligne" data-ajout="snow-' + p[0] + '">Réserver ce pack</a></div></article>';
      }).join('');
    } else {
      html = GAMMES[type].map(function (g) {
        var t = T.pack[g.id];
        return '<article class="carte-pack"><div class="carte-pack-int">' + (g.piste ? '<span class="piste"><i class="' + g.piste + '"></i>' + g.niveau + '</span>' : '<span class="piste"><i class="neutre"></i>Enfant</span>') +
          '<h3>' + g.nom + '</h3><p class="pour">' + g.detail + '</p><div class="prix"><strong>' + francs(t[1]) + '</strong><span>la journée · ' + francs(t[6]) + ' les 6 jours</span></div><a href="#reserver" class="btn btn-ligne" data-ajout="ski-' + type + '-' + g.id + '">Réserver ce pack</a></div></article>';
      }).join('');
    }
    $('#grille-packs').innerHTML = html;
  }
  $$('.packs .onglets button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.packs .onglets button').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
      rendPacks(b.dataset.onglet);
    });
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-ajout]'); if (!a) return;
    var v = a.dataset.ajout.split('-'), preset;
    if (v[0] === 'ski') preset = nouveauSkieur(v[1], { activite: 'ski', formule: 'pack', gamme: v[2] });
    else if (v[0] === 'snow') preset = nouveauSkieur(v[1], { activite: 'snow', formule: 'pack' });
    else preset = nouveauSkieur('adulte', { activite: 'veloski' });
    var premier = etat.skieurs[0];
    var intact = etat.skieurs.length === 1 && !premier.prenom && premier.activite === 'ski' && premier.formule === 'pack' && premier.gamme === 'argent' && premier.cat === 'adulte';
    if (intact || etat.etape === 4) { etat.skieurs = [preset]; $('#form-contact').reset(); } else etat.skieurs.push(preset);
    if (v[0] === 'veloski' && duree().idx > 2) { etat.duree = '1'; rendDuree(); rendRappel(); }
    allerA(2);
  });

  /* ================= Grille de tarifs ================= */
  var ONGLETS_TARIFS = [
    { id: 'packs', nom: 'Packs ski', lignes: function () { return GAMMES.enfant.concat(GAMMES.adulte).map(function (g) { return [g.nom + (GAMMES.enfant.indexOf(g) > -1 ? ' (enfant)' : ''), g.detail, T.pack[g.id]]; }); } },
    { id: 'snow', nom: 'Snowboard', lignes: function () { return [['Pack enfant', 'Planche + boots', T.snowPack.enfant], ['Pack adulte', 'Planche + boots', T.snowPack.adulte], ['Planche seule enfant', '', T.snow.enfant], ['Planche seule adulte', '', T.snow.adulte]]; } },
    { id: 'skis', nom: 'Skis seuls', lignes: function () { return [['Baby', '80 à 110 cm', T.skis.baby], ['Junior', '110 à 150 cm', T.skis.junior], ['Compétition', '110 à 160 cm', T.skis.competition], ['Bronze ou mini-skis', '', T.skis.bronze], ['Argent', '', T.skis.argent], ['Or', '', T.skis.or], ['Diamant', '', T.skis.diamant]]; } },
    { id: 'chaussures', nom: 'Chaussures', lignes: function () { return [['Chaussures baby', '', T.chaussures.baby], ['Chaussures junior', '', T.chaussures.junior], ['Chaussures adulte', '', T.chaussures.adulte]]; } },
    { id: 'divers', nom: 'Divers', lignes: function () { return [['Bâtons', '', T.batons], ['Casque', 'Pas de casque seul le week-end et pendant les vacances', T.casque], ['Raquettes', '', T.raquettes], ['Luge', '', T.luge]]; } },
    { id: 'veloski', nom: 'Vélo-ski', lignes: function () { return [['Vélo-ski tout suspendu', 'Sans bottes', T.veloski.sans], ['Vélo-ski tout suspendu', 'Avec bottes', T.veloski.avec]]; } }
  ];
  function rendTarifs(id) {
    var o = ONGLETS_TARIFS.find(function (x) { return x.id === id; });
    var cols = id === 'veloski' ? ['½ j', '1 j', '2 j'] : ['½ j', '1 j', '2 j', '3 j', '4 j', '5 j', '6 j'];
    $('#table-tarifs').classList.toggle('semaine', id !== 'veloski');
    var h = '<thead><tr><th scope="col">' + o.nom + '</th>' + cols.map(function (c) { return '<th scope="col"><abbr title="' + (c === '½ j' ? 'demi-journée' : c.replace(' j', c === '1 j' ? ' jour' : ' jours')) + '" style="text-decoration:none">' + c + '</abbr></th>'; }).join('') + '</tr></thead><tbody>';
    o.lignes().forEach(function (l) {
      h += '<tr><td><strong>' + l[0] + '</strong>' + (l[1] ? '<small>' + l[1] + '</small>' : '') + '</td>' + l[2].map(function (p) { return '<td>' + francsHTML(p) + '</td>'; }).join('') + '</tr>';
    });
    $('#table-tarifs').innerHTML = h + '</tbody>';
  }
  $('#onglets-tarifs').innerHTML = ONGLETS_TARIFS.map(function (o, k) { return '<button type="button" role="tab" aria-selected="' + (k === 0) + '" data-tarif="' + o.id + '">' + o.nom + '</button>'; }).join('');
  $('#onglets-tarifs').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    $$('#onglets-tarifs button').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
    rendTarifs(b.dataset.tarif);
  });

  /* ================= En-tête, menu, CGL ================= */
  var bm = $('#bouton-menu'), nav = $('#nav');
  bm.addEventListener('click', function () {
    var o = nav.classList.toggle('ouvert');
    document.body.classList.toggle('menu-ouvert', o);
    bm.setAttribute('aria-expanded', o); bm.querySelector('.txt').textContent = o ? 'Fermer' : 'Menu';
  });
  $$('#nav a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('ouvert'); document.body.classList.remove('menu-ouvert'); bm.setAttribute('aria-expanded', 'false'); bm.querySelector('.txt').textContent = 'Menu'; }); });
  $$('[data-cgl]').forEach(function (ul) { ul.innerHTML = CGL.map(function (c) { return '<li>' + c + '</li>'; }).join(''); });

  /* ================= Démarrage ================= */
  rendDuree(); rendRappel(); rendPacks('adulte'); rendTarifs('packs'); rendRecap();
})();
