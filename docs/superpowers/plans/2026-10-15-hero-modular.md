# Sistema modular de hero: plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un interruptor central (`activeHero`) que elige entre tres presentaciones del hero (`editorial`, `cinematic`, `conceptual`) sin tocar el diagnóstico ni el resto de la web.

**Architecture:** Las variantes son secciones independientes, ocultas con el atributo `hidden`, situadas antes de `#hero` (el diagnóstico). `assets/hero/hero-loader.js` elige la variante desde `assets/hero/config.js`, la muestra y rellena sus textos por idioma. `editorial` no muestra ni descarga nada. El diagnóstico no se mueve ni se modifica.

**Tech Stack:** HTML, CSS y JavaScript sin build ni dependencias. Pruebas con `node --test` (Node 24) y comprobaciones en navegador.

**Spec:** `docs/superpowers/specs/2026-10-15-hero-modular-design.md`

## Global Constraints

- No modificar la lógica, las preguntas, los resultados ni el manejo de datos del diagnóstico (`_diagRender`, `diagSubmitName`, `diagSelectProfile`, `diagAnswer`, `diagBuildResult`, `applyLang`).
- No borrar el hero original ni tocar secciones que no son el hero.
- Sin dependencias nuevas ni cambio de framework. Sin paso de build.
- `activeHero` debe quedar en `'editorial'` al fusionar.
- No modificar `<head>`, metaetiquetas, JSON-LD ni el `<h1>` oculto de SEO. Los titulares de variantes son `<h2>`.
- Clases CSS de las variantes con prefijo `hv-`. Estilo del titular: `DM Sans`, peso 800, `clamp(1.55rem, 3.8vw, 2.4rem)`, interlineado 1.15, espaciado −0.025em (igual que `.diag-h`).
- Idiomas: es, en, fr. Textos del sitio existentes se reutilizan; no se inventa copy de campaña.
- Una variante inactiva no carga recursos.
- Commits con la línea `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

## Desviación consciente de la spec

La spec dice fusionar los textos en `_t[lang]` con claves `hv_*`. Eso obliga a llamar a `applyLang`, que **reinicia el diagnóstico** al paso 0. Este plan rellena los textos con un atributo propio `data-hv` y un `MutationObserver` sobre `<html lang>`. El resultado para el visitante es el mismo y no toca `applyLang` ni el diagnóstico. La Task 5 corrige la frase en la spec.

## Review Focus

1. `activeHero` o `?hero=` inválido, vacío o con mayúsculas raras: cae a `editorial`, nunca deja la página sin hero (Task 1, prueba).
2. Un idioma sin texto en una variante (por ejemplo `fr` vacío): usa el texto en español, no un titular vacío (Task 1, prueba).
3. `frames.count` en la configuración distinto de los archivos en disco: fotogramas rotos o saltos de imagen (Task 3, prueba que cuenta archivos).
4. Cambiar de idioma con una variante visible actualiza su texto sin reiniciar un diagnóstico en curso (Task 2 y 4, comprobación en navegador).
5. Nombre escrito en la variante: se recorta, se copia a `#diagName` y un nombre vacío no avanza el diagnóstico (Task 1 prueba de `cleanName`, Task 4 en navegador).
6. Sin JavaScript o si falla la carga del loader: se ve el hero editorial, porque las variantes nacen con `hidden` (Task 2, comprobación).

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `assets/hero/config.js` (crear) | Única fuente de configuración: variante activa, contenidos, recursos |
| `assets/hero/hero-loader.js` (crear) | Elegir variante, mostrar su sección, rellenar textos, enlazar con el diagnóstico |
| `assets/hero/hero.css` (crear) | Estilos de variantes (prefijo `hv-`) |
| `assets/hero/cinematic.js` (crear, desde `assets/js/hero-scrub.js`) | Secuencia de fotogramas ligada al scroll, parametrizada |
| `assets/hero/cinematic/f001..f064.webp` (mover desde `assets/video/hero-frames/`) | Fotogramas de la variante cinematic |
| `assets/hero/conceptual/sample.webp` (crear) | Imagen del ejemplo inactivo de conceptual |
| `assets/hero/README.md` (crear) | Guía para cambiar contenido o volver al original |
| `tests/hero/hero-loader.test.mjs` (crear) | Pruebas de selección, contenido y configuración |
| `tests/hero/diagnosis-flow.js` (crear) | Recorrido del diagnóstico, para ejecutar en el navegador |
| `index.html` (modificar) | `<link>`, `<script>` y dos secciones nuevas; quitar el hero de #11 |
| `assets/js/hero-scrub.js` (borrar) | Sustituido por `assets/hero/cinematic.js` |

---

### Task 1: Configuración y lógica de selección, con pruebas

**Files:**
- Create: `assets/hero/config.js`
- Create: `assets/hero/hero-loader.js`
- Test: `tests/hero/hero-loader.test.mjs`

**Interfaces:**
- Produces: `GB_HERO` (objeto global y `module.exports`), y `GBHeroLoader` con `selectVariant(config, search) -> string`, `contentFor(config, variant, lang) -> object`, `cleanName(value) -> string`, `init(win) -> string|null`.

- [ ] **Step 1: Escribir las pruebas que fallan**

`tests/hero/hero-loader.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
const ROOT = path.resolve(import.meta.dirname, '..', '..');
const config = require(path.join(ROOT, 'assets/hero/config.js'));
const loader = require(path.join(ROOT, 'assets/hero/hero-loader.js'));

const base = { allowUrlOverride: true, activeHero: 'editorial',
  variants: { editorial: {}, cinematic: {}, conceptual: {} } };

test('por defecto la variante activa es editorial', () => {
  assert.equal(config.activeHero, 'editorial');
});

test('selectVariant usa activeHero', () => {
  assert.equal(loader.selectVariant({ ...base, activeHero: 'cinematic' }, ''), 'cinematic');
});

test('selectVariant acepta ?hero= cuando está permitido', () => {
  assert.equal(loader.selectVariant(base, '?hero=conceptual'), 'conceptual');
  assert.equal(loader.selectVariant(base, '?x=1&hero=CINEMATIC'), 'cinematic');
});

test('selectVariant ignora ?hero= cuando allowUrlOverride es false', () => {
  assert.equal(loader.selectVariant({ ...base, allowUrlOverride: false }, '?hero=cinematic'), 'editorial');
});

test('selectVariant cae a editorial con valores inválidos', () => {
  assert.equal(loader.selectVariant({ ...base, activeHero: 'nope' }, ''), 'editorial');
  assert.equal(loader.selectVariant(base, '?hero=__proto__'), 'editorial');
  assert.equal(loader.selectVariant(base, '?hero='), 'editorial');
  assert.equal(loader.selectVariant(null, ''), 'editorial');
  assert.equal(loader.selectVariant({}, ''), 'editorial');
});

test('contentFor devuelve el idioma pedido', () => {
  const c = { variants: { cinematic: { content: { es: { headline: 'ES' }, en: { headline: 'EN' } } } } };
  assert.equal(loader.contentFor(c, 'cinematic', 'en').headline, 'EN');
});

test('contentFor cae a español cuando falta el idioma o el texto está vacío', () => {
  const c = { variants: { cinematic: { content: { es: { headline: 'ES', cta: 'Ir' }, fr: { headline: '' } } } } };
  assert.equal(loader.contentFor(c, 'cinematic', 'fr').headline, 'ES');
  assert.equal(loader.contentFor(c, 'cinematic', 'en').cta, 'Ir');
  assert.deepEqual(loader.contentFor(c, 'nope', 'es'), {});
});

test('cleanName recorta, limita a 60 y tolera valores nulos', () => {
  assert.equal(loader.cleanName('  Ana  '), 'Ana');
  assert.equal(loader.cleanName(null), '');
  assert.equal(loader.cleanName('x'.repeat(100)).length, 60);
});

test('la configuración define las tres variantes y contenido en es, en y fr', () => {
  for (const v of ['editorial', 'cinematic', 'conceptual']) assert.ok(v in config.variants, v);
  for (const v of ['cinematic', 'conceptual'])
    for (const l of ['es', 'en', 'fr']) assert.ok(config.variants[v].content[l].headline, `${v}.${l}.headline`);
});

test('cinematic: la cantidad de fotogramas coincide con los archivos en disco', () => {
  const f = config.variants.cinematic.frames;
  const dir = path.join(ROOT, path.dirname(f.path));
  const prefix = path.basename(f.path);
  const files = fs.readdirSync(dir).filter(n => n.startsWith(prefix) && n.endsWith('.' + f.ext));
  assert.equal(files.length, f.count);
});

test('conceptual: la imagen declarada existe', () => {
  const img = config.variants.conceptual.image;
  assert.ok(fs.existsSync(path.join(ROOT, img.desktop)), img.desktop);
  if (img.mobile) assert.ok(fs.existsSync(path.join(ROOT, img.mobile)), img.mobile);
});
```

- [ ] **Step 2: Ejecutar y comprobar que falla**

Run: `node --test tests/hero/`
Expected: FAIL con `Cannot find module '.../assets/hero/config.js'`.

- [ ] **Step 3: Crear la configuración**

`assets/hero/config.js`:

```js
// Configuración central del hero. Para cambiar la presentación, edita solo este archivo.
// activeHero: 'editorial' (hero actual) | 'cinematic' | 'conceptual'
var GB_HERO = {
  activeHero: 'editorial',
  allowUrlOverride: true, // ?hero=cinematic previsualiza una variante solo en ese navegador

  variants: {
    editorial: {},

    cinematic: {
      frames: { path: 'assets/hero/cinematic/f', count: 64, ext: 'webp', width: 1024, height: 576 },
      scrollLength: 500, // alto del recorrido, en vh
      content: {
        es: { headline: 'Toda marca tiene un ADN. ¿Cómo está la tuya?', cta: 'Comenzar diagnóstico' },
        en: { headline: 'Every brand has DNA. How is yours?', cta: 'Start diagnosis' },
        fr: { headline: 'Toute marque a un ADN. Comment va le vôtre ?', cta: 'Commencer le diagnostic' }
      }
    },

    // Ejemplo inactivo con textos que ya existen en la web. Sustituir por el concepto de campaña.
    conceptual: {
      image: { desktop: 'assets/hero/conceptual/sample.webp', mobile: '', alt: '' },
      align: 'left',    // 'left' | 'center'
      overlay: 0.5,     // 0 a 1
      nameField: true,  // muestra un campo de nombre que se copia al diagnóstico
      content: {
        es: {
          eyebrow: '',
          headline: 'No construyo logos. Construyo posicionamiento.',
          sub: 'Llevo más de 20 años trabajando en la brecha que existe entre lo que una marca quiere ser y lo que el mercado realmente percibe.',
          cta: 'Comenzar diagnóstico', namePlaceholder: '¿Cómo te llamas?'
        },
        en: {
          eyebrow: '',
          headline: "I don't build logos. I build positioning.",
          sub: "For over 20 years I've worked in the gap between what a brand wants to be and what the market actually perceives.",
          cta: 'Start diagnosis', namePlaceholder: "What's your name?"
        },
        fr: {
          eyebrow: '',
          headline: 'Je ne construis pas des logos. Je construis du positionnement.',
          sub: "Depuis plus de 20 ans, je travaille dans l'écart entre ce qu'une marque veut être et ce que le marché perçoit réellement.",
          cta: 'Commencer le diagnostic', namePlaceholder: 'Comment vous appelez-vous?'
        }
      }
    }
  },

  // Reservado para campañas programadas. El sistema lo ignora por ahora.
  // Formato futuro: [{ variant: 'conceptual', from: '2026-11-01', to: '2026-11-15' }]
  schedule: []
};

if (typeof module === 'object' && module.exports) module.exports = GB_HERO;
```

- [ ] **Step 4: Crear el cargador (solo lógica pura por ahora)**

`assets/hero/hero-loader.js`:

```js
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GBHeroLoader = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var FALLBACK = 'editorial';
  var has = Object.prototype.hasOwnProperty;

  function selectVariant(config, search) {
    var variants = (config && config.variants) || {};
    if (config && config.allowUrlOverride && typeof search === 'string') {
      var m = /[?&]hero=([A-Za-z]+)/.exec(search);
      var wanted = m ? m[1].toLowerCase() : '';
      if (wanted && has.call(variants, wanted)) return wanted;
    }
    var active = config && config.activeHero;
    if (typeof active === 'string' && has.call(variants, active)) return active;
    return FALLBACK;
  }

  function contentFor(config, variant, lang) {
    var v = config && config.variants && has.call(config.variants, variant) ? config.variants[variant] : null;
    var c = (v && v.content) || {};
    var es = c.es || {}, cur = c[lang] || {}, out = {};
    Object.keys(es).forEach(function (k) { out[k] = es[k]; });
    Object.keys(cur).forEach(function (k) { if (cur[k]) out[k] = cur[k]; });
    return out;
  }

  function cleanName(value) {
    return String(value == null ? '' : value).trim().slice(0, 60);
  }

  return { selectVariant: selectVariant, contentFor: contentFor, cleanName: cleanName };
});
```

- [ ] **Step 5: Ejecutar y comprobar**

Run: `node --test tests/hero/`
Expected: FALLAN solo las pruebas de disco (`cinematic: la cantidad de fotogramas...` y `conceptual: la imagen declarada existe`), porque los archivos se crean en las Tasks 3 y 4. El resto pasa.

- [ ] **Step 6: Commit**

```bash
git add assets/hero/config.js assets/hero/hero-loader.js tests/hero/hero-loader.test.mjs
git commit -m "hero: configuración central y lógica de selección con pruebas"
```

---

### Task 2: Estructura en la página con `editorial` activa

**Files:**
- Create: `assets/hero/hero.css`
- Modify: `assets/hero/hero-loader.js` (añadir `init`)
- Modify: `index.html` (quitar el hero de #11; añadir `<link>`, `<script>` y dos secciones ocultas)
- Create: `tests/hero/diagnosis-flow.js`

**Interfaces:**
- Consumes: `selectVariant`, `contentFor`, `cleanName` de la Task 1; `GB_HERO` global.
- Produces: `GBHeroLoader.init(win) -> string` (variante aplicada). Atributos: `data-hv="<clave>"` rellena textos o placeholders; `data-hv-goto-diagnosis` en un botón o enlace baja al diagnóstico; `<html data-hero="<variante>">`.

- [ ] **Step 1: Crear los estilos**

`assets/hero/hero.css`:

```css
/* Variantes de hero. Todo con prefijo hv-. */
.hv-section[hidden] { display: none; }

.hv-title {
  margin: 0; color: var(--white, #fff); font-family: 'DM Sans', sans-serif; font-weight: 800;
  font-size: clamp(1.55rem, 3.8vw, 2.4rem); line-height: 1.15; letter-spacing: -0.025em;
  text-wrap: balance; text-shadow: 0 2px 24px rgba(0,0,0,.7);
}
.hv-sub { margin: 1rem 0 0; color: rgba(255,255,255,.78); font-size: 1rem; line-height: 1.6; max-width: 560px; }
.hv-eyebrow { margin: 0 0 1rem; font-size: .68rem; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: var(--red, #ed2450); }
.hv-cta {
  display: inline-block; margin-top: 1.4rem; padding: .8rem 1.4rem; border: 0; cursor: pointer;
  background: var(--red, #ed2450); color: #fff; font-family: 'DM Sans', sans-serif; font-weight: 700;
  font-size: .85rem; letter-spacing: .04em; text-decoration: none; border-radius: 3px;
}
.hv-cta:hover { opacity: .9; }
.hv-cta[hidden], .hv-title[hidden], .hv-sub[hidden], .hv-eyebrow[hidden] { display: none; }

/* cinematic */
.hv-cin { position: relative; width: 100%; background: #000; }
.hv-cin-canvas {
  position: sticky; top: 0; z-index: 1; display: block; width: 100%; height: 100vh; object-fit: cover;
  background: #000 center / cover no-repeat;
}
.hv-cin-overlay {
  position: fixed; inset: 0; z-index: 3; height: 100vh; pointer-events: none;
  display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-end;
  padding: 0 5vw 12vh;
}
.hv-cin-overlay::before {
  content: ''; position: absolute; inset: 0; z-index: -1;
  background: linear-gradient(to bottom, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0) 55%, rgba(0,0,0,.6) 100%);
}
.hv-cin-overlay .hv-title { max-width: 760px; }
.hv-cin-overlay .hv-cta { pointer-events: auto; }

/* conceptual */
.hv-con {
  position: relative; display: flex; align-items: flex-end; min-height: 100svh; overflow: hidden;
  background: #080808 var(--hv-bg-desktop, none) center / cover no-repeat;
}
.hv-con::before { content: ''; position: absolute; inset: 0; background: rgba(0,0,0,var(--hv-overlay, .5)); }
.hv-con-inner { position: relative; z-index: 1; width: 100%; max-width: 860px; padding: 0 5vw 12vh; }
.hv-con[data-align="center"] { justify-content: center; text-align: center; }
.hv-con[data-align="center"] .hv-sub { margin-left: auto; margin-right: auto; }
.hv-name { display: flex; gap: .6rem; flex-wrap: wrap; margin-top: 1.4rem; }
.hv-con[data-align="center"] .hv-name { justify-content: center; }
.hv-name input {
  flex: 1 1 220px; max-width: 320px; padding: .8rem 1rem; border-radius: 3px; font: inherit; color: #fff;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.25);
}
.hv-name .hv-cta { margin-top: 0; }

@media (max-width: 768px) {
  .hv-con { background-image: var(--hv-bg-mobile, var(--hv-bg-desktop, none)); }
}
@media (max-width: 600px) {
  .hv-title { font-size: 1.45rem; }
  .hv-cin-overlay { padding: 0 24px 14vh; }
  .hv-con-inner { padding: 0 24px 14vh; }
}
@media (prefers-reduced-motion: reduce) { .hv-cta { transition: none; } }
```

- [ ] **Step 2: Añadir `init` al cargador**

En `assets/hero/hero-loader.js`, reemplazar el `return { ... }` final por:

```js
  function init(win) {
    var doc = win.document, cfg = win.GB_HERO;
    if (!cfg) return null;
    var variant = selectVariant(cfg, win.location.search);
    var html = doc.documentElement;
    html.setAttribute('data-hero', variant);
    if (variant === 'editorial') return variant;

    var section = doc.getElementById('hv-' + variant);
    if (!section) { html.setAttribute('data-hero', 'editorial'); return 'editorial'; }
    section.hidden = false;

    var reduced = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function fill() {
      var c = contentFor(cfg, variant, html.lang || 'es');
      section.querySelectorAll('[data-hv]').forEach(function (el) {
        var val = c[el.getAttribute('data-hv')] || '';
        if (el.tagName === 'INPUT') { el.placeholder = val; el.setAttribute('aria-label', val); }
        else { el.textContent = val; el.hidden = !val; }
      });
    }
    fill();
    new win.MutationObserver(fill).observe(html, { attributes: true, attributeFilter: ['lang'] });

    function goToDiagnosis(name) {
      var target = doc.getElementById('hero');
      var input = doc.getElementById('diagName');
      var clean = cleanName(name);
      if (input && clean) input.value = clean;
      if (target) target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      if (input) win.setTimeout(function () { input.focus({ preventScroll: true }); }, reduced ? 0 : 450);
    }

    section.querySelectorAll('[data-hv-goto-diagnosis]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); goToDiagnosis(''); });
    });
    var form = section.querySelector('form.hv-name');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var field = form.querySelector('input');
      goToDiagnosis(field ? field.value : '');
    });

    var v = cfg.variants[variant] || {};
    if (variant === 'cinematic' && win.GBHeroCinematic) win.GBHeroCinematic.start({ section: section, config: v, win: win });
    if (variant === 'conceptual') {
      if (v.image && v.image.desktop) section.style.setProperty('--hv-bg-desktop', 'url("' + v.image.desktop + '")');
      if (v.image && v.image.mobile) section.style.setProperty('--hv-bg-mobile', 'url("' + v.image.mobile + '")');
      if (typeof v.overlay === 'number') section.style.setProperty('--hv-overlay', String(Math.min(1, Math.max(0, v.overlay))));
      section.setAttribute('data-align', v.align === 'center' ? 'center' : 'left');
      if (v.image && v.image.alt) { section.setAttribute('role', 'img'); section.setAttribute('aria-label', v.image.alt); }
      if (v.nameField === false && form) { var f = form.querySelector('input'); if (f) f.hidden = true; }
    }
    return variant;
  }

  if (typeof window !== 'undefined' && window.document) {
    var run = function () { init(window); };
    if (window.document.readyState === 'complete') run();
    else window.document.addEventListener('DOMContentLoaded', run);
  }

  return { selectVariant: selectVariant, contentFor: contentFor, cleanName: cleanName, init: init };
```

Nota: la autoejecución al final solo corre en el navegador. En Node `window` no existe y las pruebas siguen importando el módulo sin efectos.

- [ ] **Step 3: Quitar el hero de #11 de `index.html` y añadir las secciones ocultas**

Ejecutar este script desde la raíz del repo:

```bash
python3 - <<'EOF'
import re
p = 'index.html'
s = open(p, encoding='utf-8').read()

# 1) Quitar la sección HERO SCROLL (prueba) antes del marcador del diagnóstico
a = s.index('<!-- ── HERO SCROLL (PRUEBA) ── -->')
b = s.index('<!-- ── HERO DIAGNÓSTICO ── -->')
variants = '''<!-- ── HERO: VARIANTES (ver assets/hero/README.md) ── -->
<section id="hv-cinematic" class="hv-section hv-cin" hidden aria-label="Introducción">
  <canvas id="hvCinCanvas" class="hv-cin-canvas" aria-hidden="true"></canvas>
  <div id="hvCinOverlay" class="hv-cin-overlay">
    <h2 class="hv-title" data-hv="headline"></h2>
    <a href="#hero" class="hv-cta" data-hv="cta" data-hv-goto-diagnosis></a>
  </div>
</section>
<section id="hv-conceptual" class="hv-section hv-con" hidden>
  <div class="hv-con-inner">
    <p class="hv-eyebrow" data-hv="eyebrow"></p>
    <h2 class="hv-title" data-hv="headline"></h2>
    <p class="hv-sub" data-hv="sub"></p>
    <form class="hv-name">
      <input type="text" data-hv="namePlaceholder" autocomplete="given-name" maxlength="60" />
      <button type="submit" class="hv-cta" data-hv="cta"></button>
    </form>
  </div>
</section>

'''
s = s[:a] + variants + s[b:]

# 2) Quitar el CSS del hero de prueba
c = s.index('  /* ── HERO SCROLL (prueba) ── */')
d = s.index('  @media (prefers-reduced-motion: reduce) {\n    html { scroll-behavior: auto; }')
s = s[:c] + s[d:]

# 3) Quitar las claves gv_h del diccionario de idiomas
s, n = re.subn(r'      gv_h:"[^"]*",\n', '', s)
assert n == 3, n

# 4) Scripts y estilos nuevos
s = s.replace('<script src="assets/js/hero-scrub.js" defer></script>',
  '<script src="assets/hero/config.js"></script>\n<script src="assets/hero/hero-loader.js" defer></script>\n<script src="assets/hero/cinematic.js" defer></script>')
s = s.replace('</head>', '  <link rel="stylesheet" href="assets/hero/hero.css" />\n</head>', 1)
open(p, 'w', encoding='utf-8').write(s)
EOF
grep -c "gvScroll\|gv-\|gv_h\|hero-scrub" index.html
```

Expected: imprime `0`.

- [ ] **Step 4: Crear el recorrido del diagnóstico para el navegador**

`tests/hero/diagnosis-flow.js` (se pega en la consola del navegador o se ejecuta con la herramienta de JavaScript del panel):

```js
// Recorre el diagnóstico completo con respuestas fijas y devuelve un resumen comparable.
(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const text = () => (document.getElementById('diagContent') || {}).innerText || '';
  const out = { variant: document.documentElement.getAttribute('data-hero') };
  const input = document.getElementById('diagName');
  out.hasNameInput = !!input;
  if (!input) return out;
  input.value = 'Prueba';
  diagSubmitName(); await wait(150);
  out.step1 = text().includes('Prueba');
  diagSelectProfile(0); await wait(150);
  diagAnswer(0, 2); await wait(150);
  diagAnswer(1, 1); await wait(150);
  diagAnswer(2, 0); await wait(1800);
  const cal = document.querySelector('#diagContent [data-cal-link]');
  out.result = !!cal;
  out.calLink = cal && cal.getAttribute('data-cal-link');
  out.rings = document.querySelectorAll('#diagContent .score-ring').length;
  out.dots = document.querySelectorAll('#diagProgress .diag-dot').length;
  return out;
})();
```

- [ ] **Step 5: Verificar que la página es idéntica a la de `main`**

Run:

```bash
node --test tests/hero/ 2>&1 | grep -E "^# (pass|fail)"
python3 -m http.server 4640 >/dev/null 2>&1 &
```

En el navegador abrir `http://localhost:4640/index.html` y ejecutar `tests/hero/diagnosis-flow.js`.
Expected: `variant: "editorial"`, `hasNameInput: true`, `step1: true`, `result: true`, `calLink: "german-baher-njlkqp"`, `rings: 3`, `dots: 6`. En la consola no hay errores nuevos. `document.getElementById('hv-cinematic').hidden` y `document.getElementById('hv-conceptual').hidden` son `true`.
Comprobar también que el panel de red no muestra peticiones a `assets/hero/cinematic/` ni `assets/hero/conceptual/`.

- [ ] **Step 6: Verificar sin JavaScript**

En las herramientas del navegador, desactivar JavaScript y recargar. Expected: se ve el hero del diagnóstico; las dos secciones nuevas no aparecen (nacen con `hidden`).

- [ ] **Step 7: Commit**

```bash
pkill -f "http.server 4640"
git add assets/hero/hero.css assets/hero/hero-loader.js tests/hero/diagnosis-flow.js index.html
git commit -m "hero: estructura modular con editorial activa y variantes ocultas"
```

---

### Task 3: Variante cinematic

**Files:**
- Move: `assets/video/hero-frames/f*.webp` → `assets/hero/cinematic/f*.webp`
- Create: `assets/hero/cinematic.js`
- Delete: `assets/js/hero-scrub.js`

**Interfaces:**
- Consumes: la sección `#hv-cinematic` con `#hvCinCanvas` y `#hvCinOverlay`; `GB_HERO.variants.cinematic.{frames,scrollLength}`.
- Produces: `window.GBHeroCinematic.start({ section, config, win })`.

- [ ] **Step 1: Mover los fotogramas y borrar el script antiguo**

```bash
mkdir -p assets/hero/cinematic
git mv assets/video/hero-frames/f*.webp assets/hero/cinematic/
git rm -q assets/js/hero-scrub.js
ls assets/hero/cinematic | wc -l
```

Expected: `64`.

- [ ] **Step 2: Ejecutar la prueba de fotogramas**

Run: `node --test tests/hero/ 2>&1 | grep -E "fotogramas|^# (pass|fail)"`
Expected: la prueba de fotogramas pasa. Solo falla `conceptual: la imagen declarada existe`.

- [ ] **Step 3: Crear `cinematic.js`**

`assets/hero/cinematic.js`:

```js
// Variante cinematic: secuencia de fotogramas ligada al scroll. Se inicia desde hero-loader.js.
(function (root) {
  'use strict';

  function start(opts) {
    var win = opts.win, doc = win.document;
    var section = opts.section, cfg = opts.config || {};
    var f = cfg.frames || {};
    var canvas = section.querySelector('canvas');
    var overlay = section.querySelector('.hv-cin-overlay');
    if (!canvas || !f.path || !f.count) return;

    var COUNT = f.count, W = f.width, H = f.height, EXT = f.ext || 'webp';
    var LERP_TAU = 8, SNAP = 0.01;
    var reduced = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ctx = canvas.getContext('2d', { alpha: false });
    canvas.width = W; canvas.height = H;
    section.style.height = (cfg.scrollLength || 500) + 'vh';
    canvas.style.backgroundImage = 'url(' + f.path + pad(1) + '.' + EXT + ')';

    var frames = new Array(COUNT);
    var startY = 0, span = 1, current = 0, lastTime = win.performance.now(), lastDrawn = -1;

    function pad(n) { return (n < 10 ? '00' : n < 100 ? '0' : '') + n; }
    function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

    function measure() {
      startY = section.offsetTop;
      span = Math.max(1, section.offsetHeight - win.innerHeight);
    }
    var t;
    function onResize() { win.clearTimeout(t); t = win.setTimeout(measure, 100); }
    win.addEventListener('resize', onResize);
    win.addEventListener('orientationchange', onResize);
    win.addEventListener('load', measure);
    measure();

    function loadFrame(i) {
      return new Promise(function (resolve) {
        var img = new win.Image();
        img.decoding = 'async';
        img.onload = function () { frames[i] = img; resolve(); };
        img.onerror = function () { resolve(); };
        img.src = f.path + pad(i + 1) + '.' + EXT;
      });
    }
    // Carga progresiva: primero fotogramas espaciados, luego se rellenan los huecos.
    var order = [], seen = {};
    [16, 8, 4, 2, 1].forEach(function (step) {
      for (var i = 0; i < COUNT; i += step) if (!seen[i]) { seen[i] = 1; order.push(i); }
    });
    var idx = 0;
    function worker() {
      if (idx >= order.length) return Promise.resolve();
      return loadFrame(order[idx++]).then(worker);
    }
    for (var k = 0; k < 4; k++) worker();

    function nearestLoaded(n) {
      for (var d = 0; d < COUNT; d++) {
        if (frames[n - d]) return n - d;
        if (frames[n + d]) return n + d;
      }
      return -1;
    }
    function render(pos) {
      var n = nearestLoaded(clamp(Math.round(pos), 0, COUNT - 1));
      if (n < 0 || n === lastDrawn) return;
      ctx.drawImage(frames[n], 0, 0, W, H);
      lastDrawn = n;
    }

    function update(now) {
      var y = win.scrollY || win.pageYOffset;
      var p = clamp((y - startY) / span, 0, 1);
      var dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      var target = p * (COUNT - 1);
      if (reduced) current = target;
      else {
        current += (target - current) * (1 - Math.exp(-dt * LERP_TAU));
        if (Math.abs(target - current) < SNAP) current = target;
      }
      render(current);
      if (overlay) overlay.style.display = y > startY + span + win.innerHeight ? 'none' : '';
      win.requestAnimationFrame(update);
    }
    win.requestAnimationFrame(update);
  }

  root.GBHeroCinematic = { start: start };
})(typeof window !== 'undefined' ? window : this);
```

- [ ] **Step 4: Verificar la variante en el navegador**

```bash
python3 -m http.server 4640 >/dev/null 2>&1 &
```

Abrir `http://localhost:4640/index.html?hero=cinematic` y ejecutar:

```js
(async () => {
  const c = document.getElementById('hvCinCanvas'), s = document.getElementById('hv-cinematic');
  const ctx = c.getContext('2d');
  const sig = () => { const d = ctx.getImageData(0,0,c.width,c.height).data; let a=0,b=0; for (let i=0;i<d.length;i+=4){a+=d[i]; b=(b+d[i+1]*((i>>2)%97))%1000003;} return a+':'+b; };
  await new Promise(r => setTimeout(r, 3500));
  const span = s.offsetHeight - innerHeight, out = [];
  for (const f of [0,0.2,0.4,0.6,0.8]) { scrollTo({top: s.offsetTop + span*f, behavior:'instant'}); await new Promise(r => setTimeout(r,1500)); out.push(sig()); }
  const t = document.querySelector('#hv-cinematic .hv-title');
  return { distinct: new Set(out).size, hero: document.documentElement.dataset.hero, headline: t.textContent, size: getComputedStyle(t).fontSize, weight: getComputedStyle(t).fontWeight, hidden: s.hidden };
})();
```

Expected: `distinct: 5`, `hero: "cinematic"`, titular "Toda marca tiene un ADN. ¿Cómo está la tuya?", `weight: "800"`, `hidden: false`.
Cambiar el idioma con el selector ES/EN/FR: el titular y el botón cambian. Ejecutar `tests/hero/diagnosis-flow.js` en esta URL: mismos valores que en la Task 2.
Pulsar el botón "Comenzar diagnóstico": la página baja al diagnóstico y el campo de nombre queda enfocado.
Sin `?hero=`: la web vuelve a `editorial` y no hay peticiones a `assets/hero/cinematic/`.

- [ ] **Step 5: Commit**

```bash
pkill -f "http.server 4640"
git add -A assets/hero assets/video assets/js
git commit -m "hero: variante cinematic parametrizada desde la configuración"
```

---

### Task 4: Variante conceptual

**Files:**
- Create: `assets/hero/conceptual/sample.webp`

**Interfaces:**
- Consumes: la sección `#hv-conceptual` ya creada en la Task 2, con `data-hv` para `eyebrow`, `headline`, `sub`, `namePlaceholder`, `cta`; `GB_HERO.variants.conceptual`.

- [ ] **Step 1: Crear la imagen del ejemplo**

```bash
mkdir -p assets/hero/conceptual
cp assets/hero/cinematic/f032.webp assets/hero/conceptual/sample.webp
ls -l assets/hero/conceptual/sample.webp
```

Es un fotograma existente de tu propio video, usado como imagen de ejemplo. Se reemplaza con la imagen de cada campaña.

- [ ] **Step 2: Ejecutar todas las pruebas**

Run: `node --test tests/hero/`
Expected: todas pasan (11 de 11).

- [ ] **Step 3: Verificar la variante en el navegador**

```bash
python3 -m http.server 4640 >/dev/null 2>&1 &
```

Abrir `http://localhost:4640/index.html?hero=conceptual` y ejecutar:

```js
(async () => {
  await new Promise(r => setTimeout(r, 800));
  const s = document.getElementById('hv-conceptual');
  const h = s.querySelector('[data-hv="headline"]'), inp = s.querySelector('input');
  const out = { hero: document.documentElement.dataset.hero, hidden: s.hidden, headline: h.textContent, ph: inp.placeholder,
                size: getComputedStyle(h).fontSize, bg: getComputedStyle(s).backgroundImage.slice(0, 60) };
  inp.value = '  Ana  ';
  s.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
  await new Promise(r => setTimeout(r, 900));
  out.nameCopied = document.getElementById('diagName').value;
  out.focused = document.activeElement && document.activeElement.id;
  // un nombre vacío no avanza el diagnóstico
  document.getElementById('diagName').value = '';
  inp.value = '';
  s.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
  await new Promise(r => setTimeout(r, 300));
  out.stepAfterEmpty = typeof _diagStep === 'number' ? _diagStep : null;
  return out;
})();
```

Expected: `hero: "conceptual"`, `hidden: false`, titular en español, `ph: "¿Cómo te llamas?"`, `bg` empieza con `url(`, `nameCopied: "Ana"`, `focused: "diagName"`, `stepAfterEmpty: 0`.
Cambiar a EN y FR con el selector: titular y placeholder cambian y, si ya estaba en un paso del diagnóstico, el comportamiento es el de `main` (reinicio por idioma, que es el actual).
Ejecutar `tests/hero/diagnosis-flow.js`: mismos valores que en la Task 2.
En móvil de 390 px: sin desbordes horizontales (`document.documentElement.scrollWidth <= innerWidth`).

- [ ] **Step 4: Commit**

```bash
pkill -f "http.server 4640"
git add assets/hero/conceptual
git commit -m "hero: variante conceptual con ejemplo inactivo"
```

---

### Task 5: Documentación, verificación final y propuesta

**Files:**
- Create: `assets/hero/README.md`
- Modify: `docs/superpowers/specs/2026-10-15-hero-modular-design.md` (frase de idiomas)

- [ ] **Step 1: Crear la guía**

`assets/hero/README.md`:

````markdown
# Hero modular

El hero de la web tiene tres presentaciones. Se elige en `assets/hero/config.js`.

| Variante | Qué es |
|---|---|
| `editorial` | El hero actual: el diagnóstico de marca. Predeterminada. |
| `cinematic` | Imagen del ADN que avanza con el scroll, un titular y un botón. |
| `conceptual` | Hero temporal de campaña: imagen, titular, texto y campo de nombre. |

El diagnóstico de marca es el mismo en las tres. No se modifica.

## Cambiar de variante

En `assets/hero/config.js`:

```js
activeHero: 'cinematic'
```

## Volver al original

```js
activeHero: 'editorial'
```

## Previsualizar sin publicar

Añade `?hero=cinematic` o `?hero=conceptual` a la URL. Solo afecta a ese navegador. Se desactiva con `allowUrlOverride: false`.

## Cambiar textos

Edita `content` de la variante, en `es`, `en` y `fr`. Si un idioma queda vacío, se usa el español.

## Cambiar la imagen o los fotogramas

- **conceptual:** reemplaza `assets/hero/conceptual/sample.webp` (o cambia la ruta en `image.desktop` e `image.mobile`).
- **cinematic:** reemplaza los fotogramas de `assets/hero/cinematic/` y ajusta `frames.count`, `frames.width` y `frames.height`. Nombres: `f001.webp`, `f002.webp`, y así. Recomendado: WebP, 1024×576, unos 16 KB por fotograma.

## Comprobar antes de publicar

```bash
node --test tests/hero/
```

Y en el navegador, ejecutar `tests/hero/diagnosis-flow.js` con cada variante.

## Campañas programadas

`schedule` está reservado y el sistema lo ignora. Todavía no hay publicación automática.
````

- [ ] **Step 2: Corregir la frase de idiomas en la spec**

En `docs/superpowers/specs/2026-10-15-hero-modular-design.md`, sustituir el párrafo de **Idiomas** por:

```markdown
**Idiomas.** Cada elemento de texto de una variante lleva `data-hv="<clave>"`. El cargador lo rellena desde `content[lang]` y se actualiza con un `MutationObserver` sobre `<html lang>`. No se fusiona en `_t` ni se llama a `applyLang`, porque `applyLang` reinicia el diagnóstico.
```

- [ ] **Step 3: Verificación final de las tres variantes**

```bash
node --test tests/hero/ 2>&1 | grep -E "^# (pass|fail)"
python3 -m http.server 4640 >/dev/null 2>&1 &
```

Para cada URL, `http://localhost:4640/index.html`, `...?hero=cinematic` y `...?hero=conceptual`:
1. Sin errores nuevos en la consola.
2. `tests/hero/diagnosis-flow.js` devuelve `result: true`, `calLink: "german-baher-njlkqp"`, `rings: 3`, `dots: 6`.
3. Cambio de idioma ES, EN, FR sin errores.
4. Móvil de 390 px sin desbordes.
5. Con `editorial`: ninguna petición a `assets/hero/cinematic/` ni `assets/hero/conceptual/`.

Comprobar `git diff origin/main -- index.html`: solo aparecen el `<link>`, los tres `<script>` y las dos secciones nuevas. Ningún cambio dentro de `#hero`, del `<head>` ni de las funciones del diagnóstico.

- [ ] **Step 4: Commit, subir y abrir la propuesta**

```bash
pkill -f "http.server 4640"
git add assets/hero/README.md docs/superpowers/specs/2026-10-15-hero-modular-design.md
git commit -m "hero: guía de uso y ajuste de la spec"
git push -u origin HEAD
gh pr create --base main --title "Sistema modular de hero (editorial, cinematic, conceptual)" --body-file /tmp/pr-hero.md
gh pr close 11 --comment "Sustituida por el sistema modular de hero: la variante cinematic es esta prueba, parametrizada."
```

El cuerpo de la propuesta resume: interruptor en `assets/hero/config.js`, `editorial` predeterminada, diagnóstico sin cambios, verificación hecha, pendientes (medir PageSpeed de `cinematic`, imagen real para `conceptual`, traducciones en y fr de Claude).
