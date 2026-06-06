/**
 * cookie-consent.js — Germán Baher Growth Brands
 * GDPR + PIPEDA compliant cookie consent system
 * Supports: ES / EN / FR
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'gb_cookie_consent';
  var VERSION = '1';

  // ── Translations ──────────────────────────────────────────────────
  var T = {
    es: {
      title: 'Cookies & Privacidad',
      body: 'Usamos cookies para mejorar tu experiencia y analizar el tráfico del sitio. Puedes aceptar todas, solo las esenciales, o personalizar tu elección.',
      accept_all: 'Aceptar todo',
      essential_only: 'Solo esenciales',
      customize: 'Personalizar',
      save: 'Guardar preferencias',
      close: 'Cerrar',
      privacy_link: 'Política de privacidad',
      categories: {
        essential: { name: 'Esenciales', desc: 'Necesarias para el funcionamiento del sitio. No se pueden desactivar.', locked: true },
        analytics: { name: 'Analítica', desc: 'Nos ayudan a entender cómo usas el sitio para mejorarlo.' },
        marketing: { name: 'Marketing', desc: 'Permiten mostrar contenido relevante según tus intereses.' }
      }
    },
    en: {
      title: 'Cookies & Privacy',
      body: 'We use cookies to improve your experience and analyze site traffic. You can accept all, essential only, or customize your choice.',
      accept_all: 'Accept all',
      essential_only: 'Essential only',
      customize: 'Customize',
      save: 'Save preferences',
      close: 'Close',
      privacy_link: 'Privacy policy',
      categories: {
        essential: { name: 'Essential', desc: 'Required for the site to function. Cannot be disabled.', locked: true },
        analytics: { name: 'Analytics', desc: 'Help us understand how you use the site so we can improve it.' },
        marketing: { name: 'Marketing', desc: 'Allow us to show relevant content based on your interests.' }
      }
    },
    fr: {
      title: 'Cookies & Confidentialité',
      body: 'Nous utilisons des cookies pour améliorer votre expérience et analyser le trafic. Vous pouvez tout accepter, choisir l\'essentiel ou personnaliser.',
      accept_all: 'Tout accepter',
      essential_only: 'Essentiels seulement',
      customize: 'Personnaliser',
      save: 'Enregistrer',
      close: 'Fermer',
      privacy_link: 'Politique de confidentialité',
      categories: {
        essential: { name: 'Essentiels', desc: 'Nécessaires au fonctionnement du site. Ne peuvent pas être désactivés.', locked: true },
        analytics: { name: 'Analytique', desc: 'Nous aident à comprendre comment vous utilisez le site.' },
        marketing: { name: 'Marketing', desc: 'Permettent d\'afficher du contenu pertinent selon vos intérêts.' }
      }
    }
  };

  // ── State ─────────────────────────────────────────────────────────
  var lang = (function () {
    var stored = localStorage.getItem('gb_lang') || document.documentElement.lang || 'es';
    return T[stored] ? stored : 'es';
  })();

  var t = T[lang];

  function getConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data.version !== VERSION) return null;
      return data;
    } catch (e) { return null; }
  }

  function saveConsent(prefs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: VERSION,
      timestamp: new Date().toISOString(),
      prefs: prefs
    }));
    applyConsent(prefs);
    document.dispatchEvent(new CustomEvent('gb:consent', { detail: prefs }));
  }

  function applyConsent(prefs) {
    // Google Analytics — enable only if analytics accepted
    if (prefs.analytics && typeof window.gtag === 'function') {
      window['ga-disable-G-XXXXXXXX'] = false;
    } else {
      window['ga-disable-G-XXXXXXXX'] = true;
    }
    // Extend here for other scripts
  }

  // ── Styles ────────────────────────────────────────────────────────
  var css = `
    #gb-cookie-banner *{box-sizing:border-box;margin:0;padding:0;}
    #gb-cookie-banner{
      position:fixed;bottom:0;left:0;right:0;z-index:9999;
      background:rgba(10,10,10,0.97);backdrop-filter:blur(20px);
      border-top:1px solid rgba(237,36,80,0.25);
      font-family:'DM Sans',system-ui,sans-serif;
      transform:translateY(100%);transition:transform .35s cubic-bezier(.4,0,.2,1);
    }
    #gb-cookie-banner.gb-show{transform:translateY(0);}
    .gb-banner-inner{
      max-width:1100px;margin:0 auto;
      display:flex;align-items:center;gap:1.5rem;
      padding:1.1rem 5vw;flex-wrap:wrap;
    }
    .gb-banner-text{flex:1;min-width:220px;}
    .gb-banner-title{font-size:.7rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#ed2450;margin-bottom:.35rem;}
    .gb-banner-body{font-size:.8rem;color:rgba(255,255,255,.55);line-height:1.5;}
    .gb-banner-body a{color:#ed2450;text-decoration:none;}
    .gb-banner-body a:hover{text-decoration:underline;}
    .gb-banner-actions{display:flex;gap:.6rem;flex-wrap:wrap;flex-shrink:0;}
    .gb-btn{font-family:'DM Sans',system-ui,sans-serif;font-weight:700;font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;border:none;border-radius:4px;padding:.55rem 1.1rem;cursor:pointer;transition:opacity .2s,transform .15s;white-space:nowrap;}
    .gb-btn:hover{opacity:.88;transform:translateY(-1px);}
    .gb-btn-primary{background:#ed2450;color:#fff;}
    .gb-btn-ghost{background:transparent;color:rgba(255,255,255,.5);border:1px solid rgba(255,255,255,.15);}
    .gb-btn-ghost:hover{color:#fff;border-color:rgba(255,255,255,.4);}
    .gb-btn-link{background:none;border:none;color:rgba(255,255,255,.35);font-size:.72rem;padding:.4rem .6rem;cursor:pointer;font-family:'DM Sans',system-ui,sans-serif;text-decoration:underline;text-underline-offset:3px;}
    .gb-btn-link:hover{color:rgba(255,255,255,.7);}

    /* Customize panel */
    #gb-cookie-panel{
      position:fixed;bottom:0;right:0;z-index:10000;width:380px;max-width:100vw;
      background:#111;border:1px solid rgba(255,255,255,.08);border-bottom:none;border-right:none;
      border-radius:12px 0 0 0;
      font-family:'DM Sans',system-ui,sans-serif;
      transform:translateX(120%);transition:transform .35s cubic-bezier(.4,0,.2,1);
      display:flex;flex-direction:column;
    }
    #gb-cookie-panel.gb-show{transform:translateX(0);}
    .gb-panel-header{display:flex;justify-content:space-between;align-items:center;padding:1.2rem 1.4rem;border-bottom:1px solid rgba(255,255,255,.06);}
    .gb-panel-title{font-size:.72rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#ed2450;}
    .gb-panel-close{background:none;border:none;color:rgba(255,255,255,.3);font-size:1.2rem;cursor:pointer;line-height:1;padding:.2rem;transition:color .2s;}
    .gb-panel-close:hover{color:#fff;}
    .gb-panel-body{padding:1rem 1.4rem;overflow-y:auto;max-height:55vh;display:flex;flex-direction:column;gap:1rem;}
    .gb-category{background:#1a1a1a;border-radius:8px;padding:1rem 1.1rem;}
    .gb-cat-header{display:flex;justify-content:space-between;align-items:flex-start;gap:.8rem;margin-bottom:.4rem;}
    .gb-cat-name{font-size:.82rem;font-weight:700;color:#fff;}
    .gb-cat-desc{font-size:.72rem;color:rgba(255,255,255,.4);line-height:1.5;}
    /* Toggle switch */
    .gb-toggle{position:relative;flex-shrink:0;width:40px;height:22px;margin-top:1px;}
    .gb-toggle input{opacity:0;width:0;height:0;position:absolute;}
    .gb-toggle-slider{position:absolute;inset:0;background:rgba(255,255,255,.12);border-radius:22px;cursor:pointer;transition:background .2s;}
    .gb-toggle-slider::before{content:'';position:absolute;height:16px;width:16px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:transform .2s;}
    .gb-toggle input:checked+.gb-toggle-slider{background:#ed2450;}
    .gb-toggle input:checked+.gb-toggle-slider::before{transform:translateX(18px);}
    .gb-toggle input:disabled+.gb-toggle-slider{background:rgba(237,36,80,.4);cursor:not-allowed;}
    .gb-toggle input:disabled:checked+.gb-toggle-slider::before{transform:translateX(18px);}
    .gb-locked-badge{font-size:.6rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#ed2450;background:rgba(237,36,80,.1);border:1px solid rgba(237,36,80,.2);border-radius:3px;padding:.15rem .5rem;margin-top:.25rem;display:inline-block;}
    .gb-panel-footer{padding:1rem 1.4rem;border-top:1px solid rgba(255,255,255,.06);}
    .gb-panel-footer .gb-btn{width:100%;justify-content:center;text-align:center;padding:.7rem;}

    @media(max-width:640px){
      .gb-banner-inner{flex-direction:column;align-items:flex-start;gap:.9rem;}
      #gb-cookie-panel{width:100%;border-radius:12px 12px 0 0;border-left:none;}
    }
  `;

  function injectStyles() {
    var el = document.createElement('style');
    el.id = 'gb-cookie-styles';
    el.textContent = css;
    document.head.appendChild(el);
  }

  // ── Banner HTML ───────────────────────────────────────────────────
  function buildBanner() {
    var el = document.createElement('div');
    el.id = 'gb-cookie-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', t.title);
    el.innerHTML = `
      <div class="gb-banner-inner">
        <div class="gb-banner-text">
          <div class="gb-banner-title">${t.title}</div>
          <div class="gb-banner-body">${t.body} <a href="/privacy">${t.privacy_link} →</a></div>
        </div>
        <div class="gb-banner-actions">
          <button class="gb-btn gb-btn-primary" id="gb-accept-all">${t.accept_all}</button>
          <button class="gb-btn gb-btn-ghost" id="gb-essential-only">${t.essential_only}</button>
          <button class="gb-btn-link" id="gb-customize">${t.customize}</button>
        </div>
      </div>
    `;
    return el;
  }

  // ── Customize Panel ───────────────────────────────────────────────
  function buildPanel() {
    var el = document.createElement('div');
    el.id = 'gb-cookie-panel';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', t.customize);

    var cats = ['essential', 'analytics', 'marketing'];
    var catsHTML = cats.map(function (key) {
      var cat = t.categories[key];
      var locked = cat.locked;
      return `
        <div class="gb-category">
          <div class="gb-cat-header">
            <div>
              <div class="gb-cat-name">${cat.name}</div>
              ${locked ? '<span class="gb-locked-badge">Siempre activo</span>' : ''}
            </div>
            <label class="gb-toggle">
              <input type="checkbox" data-cat="${key}"
                ${locked ? 'checked disabled' : ''}
                ${key === 'analytics' ? 'checked' : ''}
              />
              <span class="gb-toggle-slider"></span>
            </label>
          </div>
          <div class="gb-cat-desc">${cat.desc}</div>
        </div>
      `;
    }).join('');

    el.innerHTML = `
      <div class="gb-panel-header">
        <span class="gb-panel-title">${t.customize}</span>
        <button class="gb-panel-close" id="gb-panel-close" aria-label="${t.close}">×</button>
      </div>
      <div class="gb-panel-body">${catsHTML}</div>
      <div class="gb-panel-footer">
        <button class="gb-btn gb-btn-primary" id="gb-save-prefs">${t.save}</button>
      </div>
    `;
    return el;
  }

  // ── Controller ────────────────────────────────────────────────────
  function init() {
    var consent = getConsent();
    if (consent) {
      applyConsent(consent.prefs);
      return; // already consented, don't show
    }

    injectStyles();
    var banner = buildBanner();
    var panel  = buildPanel();
    document.body.appendChild(banner);
    document.body.appendChild(panel);

    // Show banner with slight delay for page load
    requestAnimationFrame(function () {
      setTimeout(function () { banner.classList.add('gb-show'); }, 300);
    });

    function closeBanner() {
      banner.classList.remove('gb-show');
      panel.classList.remove('gb-show');
      setTimeout(function () {
        banner.remove();
        panel.remove();
      }, 400);
    }

    // Accept all
    document.getElementById('gb-accept-all').addEventListener('click', function () {
      saveConsent({ essential: true, analytics: true, marketing: true });
      closeBanner();
    });

    // Essential only
    document.getElementById('gb-essential-only').addEventListener('click', function () {
      saveConsent({ essential: true, analytics: false, marketing: false });
      closeBanner();
    });

    // Open customize panel
    document.getElementById('gb-customize').addEventListener('click', function () {
      panel.classList.add('gb-show');
    });

    // Close panel
    document.getElementById('gb-panel-close').addEventListener('click', function () {
      panel.classList.remove('gb-show');
    });

    // Save preferences
    document.getElementById('gb-save-prefs').addEventListener('click', function () {
      var prefs = { essential: true };
      panel.querySelectorAll('input[data-cat]').forEach(function (input) {
        prefs[input.dataset.cat] = input.checked;
      });
      saveConsent(prefs);
      closeBanner();
    });
  }

  // ── Public API (for re-opening preferences) ───────────────────────
  window.GBCookies = {
    reset: function () {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    },
    getConsent: getConsent,
    hasConsented: function (cat) {
      var c = getConsent();
      return c ? !!c.prefs[cat] : false;
    }
  };

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-sync lang if switcher changes
  document.addEventListener('gb:lang', function (e) {
    lang = e.detail;
    t = T[lang] || T['es'];
  });

})();
