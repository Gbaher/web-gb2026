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
      privacy_title: 'Política de Privacidad',
      privacy_updated: 'Última actualización: junio 2026',
      prefs_btn: 'Gestionar cookies',
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
      privacy_title: 'Privacy Policy',
      privacy_updated: 'Last updated: June 2026',
      prefs_btn: 'Manage cookies',
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
      privacy_title: 'Politique de Confidentialité',
      privacy_updated: 'Dernière mise à jour : juin 2026',
      prefs_btn: 'Gérer les cookies',
      categories: {
        essential: { name: 'Essentiels', desc: 'Nécessaires au fonctionnement du site. Ne peuvent pas être désactivés.', locked: true },
        analytics: { name: 'Analytique', desc: 'Nous aident à comprendre comment vous utilisez le site.' },
        marketing: { name: 'Marketing', desc: 'Permettent d\'afficher du contenu pertinent selon vos intérêts.' }
      }
    }
  };

  // ── Privacy Policy Content (ES/EN/FR) ─────────────────────────────
  var PRIVACY = {
    es: `
      <h2>1. ¿Quién es el responsable?</h2>
      <p><strong>Germán Baher LLC</strong> — Toronto, Ontario, Canadá<br/>
      Email: <a href="mailto:gbaher03@gmail.com">gbaher03@gmail.com</a></p>

      <h2>2. ¿Qué datos recopilamos?</h2>
      <p><strong>Datos que tú nos proporcionas:</strong> nombre, email, WhatsApp (opcional) y mensaje cuando completas cualquier formulario del sitio.</p>
      <p><strong>Datos automáticos:</strong> páginas visitadas, tiempo en el sitio, dispositivo y dirección IP para el funcionamiento del servidor.</p>

      <h2>3. ¿Por qué usamos tus datos?</h2>
      <table>
        <tr><th>Finalidad</th><th>Base legal</th></tr>
        <tr><td>Responder consultas</td><td>Interés legítimo</td></tr>
        <tr><td>Newsletter Brand Intelligence</td><td>Consentimiento explícito</td></tr>
        <tr><td>Agendar sesiones</td><td>Ejecución de contrato</td></tr>
        <tr><td>Analítica web</td><td>Consentimiento explícito</td></tr>
      </table>

      <h2>4. Cookies que usamos</h2>
      <table>
        <tr><th>Nombre</th><th>Tipo</th><th>Finalidad</th><th>Duración</th></tr>
        <tr><td>gb_cookie_consent</td><td><span class="badge badge-e">Esencial</span></td><td>Preferencia de cookies</td><td>1 año</td></tr>
        <tr><td>gb_lang</td><td><span class="badge badge-e">Esencial</span></td><td>Preferencia de idioma</td><td>1 año</td></tr>
        <tr><td>_ga, _gid</td><td><span class="badge badge-a">Analítica</span></td><td>Google Analytics</td><td>14 meses</td></tr>
        <tr><td>li_fat_id</td><td><span class="badge badge-m">Marketing</span></td><td>LinkedIn conversiones</td><td>30 días</td></tr>
      </table>

      <h2>5. Servicios de terceros</h2>
      <p><strong>Google Sheets</strong> — almacenamiento de formularios · <strong>Cal.com</strong> — agendamiento · <strong>Vercel</strong> — hosting · <strong>Make.com</strong> — automatizaciones</p>
      <p>No vendemos, arrendamos ni compartimos tus datos con terceros para sus propios fines comerciales.</p>

      <h2>6. Tus derechos</h2>
      <p>Tienes derecho a <strong>acceder, rectificar, eliminar</strong> tus datos, oponerte al tratamiento y solicitar su portabilidad. Escríbenos a <a href="mailto:gbaher03@gmail.com">gbaher03@gmail.com</a> con el asunto "Derechos RGPD". Respondemos en 30 días hábiles.</p>
      <p>Si estás en Canadá, puedes contactar la <a href="https://www.priv.gc.ca" target="_blank" rel="noopener">Oficina del Comisionado de Privacidad (OPC)</a>.</p>

      <h2>7. Retención y contacto</h2>
      <p>Conservamos los datos solo el tiempo necesario (máx. 5 años para clientes por obligaciones fiscales). Para cualquier consulta: <a href="mailto:gbaher03@gmail.com">gbaher03@gmail.com</a></p>
    `,
    en: `
      <h2>1. Who is responsible?</h2>
      <p><strong>Germán Baher LLC</strong> — Toronto, Ontario, Canada<br/>
      Email: <a href="mailto:gbaher03@gmail.com">gbaher03@gmail.com</a></p>

      <h2>2. What data do we collect?</h2>
      <p><strong>Data you provide:</strong> name, email, WhatsApp (optional) and message when you fill out any form on the site.</p>
      <p><strong>Automatic data:</strong> pages visited, time on site, device and IP address for server operation.</p>

      <h2>3. Why do we use your data?</h2>
      <table>
        <tr><th>Purpose</th><th>Legal basis</th></tr>
        <tr><td>Respond to inquiries</td><td>Legitimate interest</td></tr>
        <tr><td>Brand Intelligence newsletter</td><td>Explicit consent</td></tr>
        <tr><td>Schedule sessions</td><td>Contract performance</td></tr>
        <tr><td>Web analytics</td><td>Explicit consent</td></tr>
      </table>

      <h2>4. Cookies we use</h2>
      <table>
        <tr><th>Name</th><th>Type</th><th>Purpose</th><th>Duration</th></tr>
        <tr><td>gb_cookie_consent</td><td><span class="badge badge-e">Essential</span></td><td>Cookie preference</td><td>1 year</td></tr>
        <tr><td>gb_lang</td><td><span class="badge badge-e">Essential</span></td><td>Language preference</td><td>1 year</td></tr>
        <tr><td>_ga, _gid</td><td><span class="badge badge-a">Analytics</span></td><td>Google Analytics</td><td>14 months</td></tr>
        <tr><td>li_fat_id</td><td><span class="badge badge-m">Marketing</span></td><td>LinkedIn conversions</td><td>30 days</td></tr>
      </table>

      <h2>5. Third-party services</h2>
      <p><strong>Google Sheets</strong> — form storage · <strong>Cal.com</strong> — scheduling · <strong>Vercel</strong> — hosting · <strong>Make.com</strong> — automations</p>
      <p>We do not sell, rent, or share your data with third parties for their own commercial purposes.</p>

      <h2>6. Your rights</h2>
      <p>You have the right to <strong>access, correct, delete</strong> your data, object to processing, and request portability. Email us at <a href="mailto:gbaher03@gmail.com">gbaher03@gmail.com</a> with subject "Privacy Rights". We respond within 30 business days.</p>
      <p>Canadian residents may contact the <a href="https://www.priv.gc.ca" target="_blank" rel="noopener">Office of the Privacy Commissioner (OPC)</a>.</p>

      <h2>7. Retention & contact</h2>
      <p>We retain data only as long as necessary (max. 5 years for clients due to fiscal obligations). For any questions: <a href="mailto:gbaher03@gmail.com">gbaher03@gmail.com</a></p>
    `,
    fr: `
      <h2>1. Qui est responsable ?</h2>
      <p><strong>Germán Baher LLC</strong> — Toronto, Ontario, Canada<br/>
      Email : <a href="mailto:gbaher03@gmail.com">gbaher03@gmail.com</a></p>

      <h2>2. Quelles données collectons-nous ?</h2>
      <p><strong>Données que vous fournissez :</strong> nom, email, WhatsApp (optionnel) et message lors de la soumission d'un formulaire.</p>
      <p><strong>Données automatiques :</strong> pages visitées, temps sur le site, appareil et adresse IP.</p>

      <h2>3. Pourquoi utilisons-nous vos données ?</h2>
      <table>
        <tr><th>Finalité</th><th>Base légale</th></tr>
        <tr><td>Répondre aux demandes</td><td>Intérêt légitime</td></tr>
        <tr><td>Newsletter Brand Intelligence</td><td>Consentement explicite</td></tr>
        <tr><td>Planifier des sessions</td><td>Exécution du contrat</td></tr>
        <tr><td>Analytique web</td><td>Consentement explicite</td></tr>
      </table>

      <h2>4. Cookies utilisés</h2>
      <table>
        <tr><th>Nom</th><th>Type</th><th>Finalité</th><th>Durée</th></tr>
        <tr><td>gb_cookie_consent</td><td><span class="badge badge-e">Essentiel</span></td><td>Préférence cookies</td><td>1 an</td></tr>
        <tr><td>gb_lang</td><td><span class="badge badge-e">Essentiel</span></td><td>Préférence langue</td><td>1 an</td></tr>
        <tr><td>_ga, _gid</td><td><span class="badge badge-a">Analytique</span></td><td>Google Analytics</td><td>14 mois</td></tr>
        <tr><td>li_fat_id</td><td><span class="badge badge-m">Marketing</span></td><td>Conversions LinkedIn</td><td>30 jours</td></tr>
      </table>

      <h2>5. Vos droits</h2>
      <p>Vous avez le droit d'<strong>accéder, rectifier, supprimer</strong> vos données et de vous opposer au traitement. Écrivez-nous à <a href="mailto:gbaher03@gmail.com">gbaher03@gmail.com</a> (objet : « Droits de confidentialité »). Réponse sous 30 jours ouvrables.</p>
      <p>Les résidents canadiens peuvent contacter le <a href="https://www.priv.gc.ca" target="_blank" rel="noopener">Commissariat à la protection de la vie privée (CPVP)</a>.</p>

      <h2>6. Contact</h2>
      <p>Pour toute question : <a href="mailto:gbaher03@gmail.com">gbaher03@gmail.com</a></p>
    `
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
    .gb-privacy-trigger{background:none;border:none;color:#ed2450;font-size:inherit;font-family:inherit;cursor:pointer;padding:0;text-decoration:underline;text-underline-offset:2px;transition:opacity .2s;}
    .gb-privacy-trigger:hover{opacity:.75;}

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
      #gb-privacy-modal .gb-modal-box{width:100%;height:100%;max-height:100vh;border-radius:0;}
    }

    /* Privacy Modal */
    #gb-privacy-modal{
      position:fixed;inset:0;z-index:11000;
      display:flex;align-items:center;justify-content:center;
      padding:16px;
      background:rgba(0,0,0,0);
      pointer-events:none;
      transition:background .3s;
    }
    #gb-privacy-modal.gb-show{background:rgba(0,0,0,0.75);pointer-events:all;backdrop-filter:blur(6px);}
    .gb-modal-box{
      background:#111;border:1px solid rgba(255,255,255,.1);border-radius:14px;
      width:100%;max-width:680px;max-height:88vh;
      display:flex;flex-direction:column;
      transform:translateY(30px) scale(.97);opacity:0;
      transition:transform .35s cubic-bezier(.34,1.56,.64,1),opacity .3s;
      font-family:'DM Sans',system-ui,sans-serif;
    }
    #gb-privacy-modal.gb-show .gb-modal-box{transform:none;opacity:1;}
    .gb-modal-header{
      display:flex;align-items:center;justify-content:space-between;
      padding:1.4rem 1.8rem;border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0;
    }
    .gb-modal-header-left{display:flex;flex-direction:column;gap:.25rem;}
    .gb-modal-eyebrow{font-size:.58rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#ed2450;}
    .gb-modal-title{font-size:1.15rem;font-weight:800;color:#fff;letter-spacing:-.01em;}
    .gb-modal-close{
      background:rgba(255,255,255,.07);border:none;color:rgba(255,255,255,.6);
      width:32px;height:32px;border-radius:50%;font-size:1.1rem;line-height:1;
      cursor:pointer;display:flex;align-items:center;justify-content:center;
      transition:background .2s,color .2s;flex-shrink:0;
    }
    .gb-modal-close:hover{background:rgba(255,255,255,.14);color:#fff;}
    .gb-modal-body{
      overflow-y:auto;padding:1.6rem 1.8rem;flex:1;
      scrollbar-width:thin;scrollbar-color:#ed2450 #1a1a1a;
    }
    .gb-modal-body::-webkit-scrollbar{width:3px;}
    .gb-modal-body::-webkit-scrollbar-thumb{background:#ed2450;}
    .gb-modal-body h2{
      font-size:.92rem;font-weight:800;color:#fff;
      margin:1.6rem 0 .6rem;padding-top:.4rem;
      border-top:1px solid rgba(255,255,255,.05);
    }
    .gb-modal-body h2:first-child{margin-top:0;border-top:none;}
    .gb-modal-body p{font-size:.82rem;color:rgba(255,255,255,.6);line-height:1.7;margin-bottom:.8rem;}
    .gb-modal-body a{color:#ed2450;text-decoration:none;}
    .gb-modal-body a:hover{text-decoration:underline;}
    .gb-modal-body table{width:100%;border-collapse:collapse;margin:.8rem 0 1rem;font-size:.78rem;}
    .gb-modal-body th{text-align:left;padding:.5rem .7rem;color:rgba(255,255,255,.3);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.07);}
    .gb-modal-body td{padding:.55rem .7rem;color:rgba(255,255,255,.6);border-bottom:1px solid rgba(255,255,255,.04);vertical-align:top;line-height:1.4;}
    .gb-modal-body tr:last-child td{border:none;}
    .badge{display:inline-block;font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:.15rem .5rem;border-radius:3px;}
    .badge-e{background:rgba(237,36,80,.12);color:#ed2450;}
    .badge-a{background:rgba(96,165,250,.1);color:#60a5fa;}
    .badge-m{background:rgba(245,158,11,.1);color:#f59e0b;}
    .gb-modal-footer{
      padding:1rem 1.8rem;border-top:1px solid rgba(255,255,255,.07);
      display:flex;align-items:center;justify-content:space-between;
      gap:.8rem;flex-wrap:wrap;flex-shrink:0;
    }
    .gb-modal-meta{font-size:.7rem;color:rgba(255,255,255,.25);}
    .gb-modal-prefs{
      background:rgba(237,36,80,.1);border:1px solid rgba(237,36,80,.25);color:#ed2450;
      border-radius:5px;padding:.5rem 1rem;font-family:'DM Sans',system-ui,sans-serif;
      font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
      cursor:pointer;transition:all .2s;white-space:nowrap;
    }
    .gb-modal-prefs:hover{background:rgba(237,36,80,.2);}
  `;

  function injectStyles() {
    var el = document.createElement('style');
    el.id = 'gb-cookie-styles';
    el.textContent = css;
    document.head.appendChild(el);
  }

  // ── Privacy Modal ─────────────────────────────────────────────────
  var privacyModal = null;

  function buildPrivacyModal() {
    var el = document.createElement('div');
    el.id = 'gb-privacy-modal';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', t.privacy_title);
    el.innerHTML = `
      <div class="gb-modal-box">
        <div class="gb-modal-header">
          <div class="gb-modal-header-left">
            <span class="gb-modal-eyebrow">Germán Baher LLC · Legal</span>
            <span class="gb-modal-title">${t.privacy_title}</span>
          </div>
          <button class="gb-modal-close" id="gb-privacy-close" aria-label="${t.close}">×</button>
        </div>
        <div class="gb-modal-body" id="gb-privacy-body">
          ${PRIVACY[lang] || PRIVACY['es']}
        </div>
        <div class="gb-modal-footer">
          <span class="gb-modal-meta">${t.privacy_updated} · v1.0</span>
          <button class="gb-modal-prefs" id="gb-modal-open-prefs">⚙ ${t.prefs_btn}</button>
        </div>
      </div>
    `;
    return el;
  }

  function openPrivacyModal() {
    if (!privacyModal) {
      privacyModal = buildPrivacyModal();
      document.body.appendChild(privacyModal);

      document.getElementById('gb-privacy-close').addEventListener('click', closePrivacyModal);
      document.getElementById('gb-modal-open-prefs').addEventListener('click', function () {
        closePrivacyModal();
        if (window.GBCookies) GBCookies.reset();
      });
      privacyModal.addEventListener('click', function (e) {
        if (e.target === privacyModal) closePrivacyModal();
      });
      document.addEventListener('keydown', function onEsc(e) {
        if (e.key === 'Escape') { closePrivacyModal(); document.removeEventListener('keydown', onEsc); }
      });
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { privacyModal.classList.add('gb-show'); });
    });
    document.body.style.overflow = 'hidden';
  }

  function closePrivacyModal() {
    if (!privacyModal) return;
    privacyModal.classList.remove('gb-show');
    document.body.style.overflow = '';
    setTimeout(function () {
      if (privacyModal) { privacyModal.remove(); privacyModal = null; }
    }, 350);
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
          <div class="gb-banner-body">${t.body} <button class="gb-privacy-trigger">${t.privacy_link} →</button></div>
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

    // Privacy policy modal trigger (inside banner)
    var privTrigger = banner.querySelector('.gb-privacy-trigger');
    if (privTrigger) privTrigger.addEventListener('click', openPrivacyModal);

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

  // ── Public API ────────────────────────────────────────────────────
  window.GBCookies = {
    reset: function () {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    },
    getConsent: getConsent,
    hasConsented: function (cat) {
      var c = getConsent();
      return c ? !!c.prefs[cat] : false;
    },
    openPrivacy: openPrivacyModal,
    closePrivacy: closePrivacyModal
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
