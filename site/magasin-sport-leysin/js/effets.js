/* Magasin SPORT, Leysin : effets au défilement (JS natif, sans bibliothèque).
   - en-tête qui change d'apparence et barre de progression de lecture
   - apparitions à l'entrée dans l'écran (IntersectionObserver)
   - titres mot par mot, compteurs animés, parallaxe douce
   Seuls transform et opacity sont animés. Si l'utilisateur a demandé moins
   d'animations, ou si quelque chose échoue, tout le contenu reste visible. */
(function () {
  'use strict';
  var racine = document.documentElement;
  clearTimeout(window.__secoursAnim);

  function tous(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  try {
    var anime = racine.classList.contains('anim');

    /* ——— En-tête + barre de progression (un seul calcul par image) ——— */
    var entete = document.getElementById('entete');
    var barre = document.getElementById('progression');
    var parallaxes = [];
    var enAttente = false;

    function maj() {
      enAttente = false;
      var y = window.pageYOffset || 0;
      var vh = window.innerHeight;
      entete.classList.toggle('defile', y > 40);
      if (barre) {
        var max = racine.scrollHeight - vh;
        barre.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0).toFixed(4) + ')';
      }
      for (var k = 0; k < parallaxes.length; k++) {
        var p = parallaxes[k];
        if (!p.visible) continue;
        var dy;
        if (p.accueil) {
          /* La bannière descend plus lentement que la page */
          dy = Math.min(y, vh) * p.force;
        } else {
          var r = p.cadre.getBoundingClientRect();
          var centre = r.top + r.height / 2 - vh / 2;
          var marge = (p.el.offsetHeight - r.height) / 2;
          dy = Math.max(-marge, Math.min(marge, -centre * p.force));
        }
        p.el.style.transform = 'translate3d(0,' + dy.toFixed(1) + 'px,0)';
      }
    }
    function demande() { if (!enAttente) { enAttente = true; window.requestAnimationFrame(maj); } }
    window.addEventListener('scroll', demande, { passive: true });
    window.addEventListener('resize', demande);

    if (!anime) { maj(); return; }

    /* ——— Titres : découpe mot par mot ——— */
    tous('[data-mots]').forEach(function (t) {
      var texte = t.textContent.replace(/\s+/g, ' ').trim();
      var n = 0;
      (function decoupe(noeud) {
        Array.prototype.slice.call(noeud.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var frag = document.createDocumentFragment();
            c.textContent.split(/(\s+)/).forEach(function (bout) {
              if (!bout) return;
              if (/^\s+$/.test(bout)) { frag.appendChild(document.createTextNode(' ')); return; }
              var mot = document.createElement('span'); mot.className = 'mot';
              var int = document.createElement('span'); int.textContent = bout; int.style.setProperty('--m', n++);
              mot.appendChild(int); frag.appendChild(mot);
            });
            noeud.replaceChild(frag, c);
          } else if (c.nodeType === 1) decoupe(c);
        });
      })(t);
      /* Les lecteurs d'écran lisent le titre d'un seul tenant */
      t.setAttribute('aria-label', texte);
      t.classList.add('decoupe');
    });

    /* ——— Compteurs ——— */
    function compte(el) {
      var cible = parseFloat(el.getAttribute('data-compte')), debut = null, duree = 1600;
      function pas(t) {
        if (debut === null) debut = t;
        var a = Math.min(1, (t - debut) / duree);
        var e = 1 - Math.pow(1 - a, 4);
        el.textContent = Math.round(cible * e);
        if (a < 1) window.requestAnimationFrame(pas); else el.textContent = cible;
      }
      el.textContent = '0';
      window.requestAnimationFrame(pas);
    }

    /* ——— Apparitions à l'entrée dans l'écran ——— */
    var vus = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        /* Assez visible : 18 % de l'élément, ou un quart de l'écran pour les blocs très hauts */
        if (!e.isIntersecting || (e.intersectionRatio < 0.18 && e.intersectionRect.height < window.innerHeight * 0.25)) return;
        e.target.classList.add('vu');
        tous('[data-compte]', e.target).forEach(compte);
        if (e.target.hasAttribute('data-compte')) compte(e.target);
        vus.unobserve(e.target);
      });
    }, { threshold: [0, 0.05, 0.1, 0.18, 0.3, 0.5], rootMargin: '0px 0px -6% 0px' });
    tous('[data-reveal], [data-cascade], [data-mots], [data-vu]').forEach(function (el) { vus.observe(el); });

    /* ——— Parallaxe : seulement sur les éléments visibles ——— */
    var presents = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        parallaxes.forEach(function (p) { if (p.cadre === e.target) p.visible = e.isIntersecting; });
      });
      demande();
    }, { rootMargin: '10% 0px 10% 0px' });
    tous('[data-parallaxe]').forEach(function (el) {
      var p = { el: el, cadre: el.parentNode, force: parseFloat(el.getAttribute('data-parallaxe')) || 0.1, accueil: el.hasAttribute('data-accueil'), visible: false };
      parallaxes.push(p);
      presents.observe(p.cadre);
    });

    maj();
  } catch (err) {
    /* En cas de souci, on rend tout visible plutôt que de laisser du contenu caché */
    racine.classList.remove('anim');
    if (window.console) console.warn('Effets désactivés :', err);
  }
})();
