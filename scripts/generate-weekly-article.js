#!/usr/bin/env node
// Weekly Brand Intelligence article generator (ES only).
// Standalone: does not read/write data/brand-intelligence/editorial-registry.json,
// does not use approval_hash/JCS/5A concepts, does not touch content-queue.json.
//
// Modes:
//   node scripts/generate-weekly-article.js            → real run (needs OPENAI_API_KEY), writes repo files.
//   node scripts/generate-weekly-article.js --simulate  → mock content, no network, no repo writes.
//                                                          Output preview goes to .simulate-output/.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SIMULATE = process.argv.includes('--simulate');
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const SITE = 'https://www.germanbaher.com';
const LOG_PATH = path.join(ROOT, 'data', 'brand-intelligence', 'weekly-article-log.json');

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function isoWeekId(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((d - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function slugify(input) {
  return input
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function nextBiNumber() {
  const files = fs.readdirSync(ROOT).filter(f => /^bi-\d{3}-.*\.html$/.test(f));
  let max = 0;
  for (const f of files) {
    const n = parseInt(f.slice(3, 6), 10);
    if (n > max) max = n;
  }
  return max + 1;
}

function latestEsArticle() {
  const files = fs.readdirSync(ROOT).filter(f => /^bi-\d{3}-.*\.html$/.test(f));
  let best = null;
  for (const f of files) {
    const num = parseInt(f.slice(3, 6), 10);
    const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
    if (!/<html lang="es">/.test(html)) continue;
    if (!best || num > best.num) {
      const titleMatch = html.match(/<title>([^<|]+)/);
      const slug = f.replace(/^bi-\d{3}-/, '').replace(/\.html$/, '');
      best = { num, file: f, slug, title: titleMatch ? titleMatch[1].trim() : f };
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Content source (OpenAI real call, or mock for --simulate)
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `Eres estratega senior de marca escribiendo para germanbaher.com, sección Brand Intelligence.
Español latino neutro. Tono profesional, directo, sin relleno ni frases genéricas.
Tema: branding, estrategia de marca, creatividad, comportamiento del consumidor o inteligencia de marca (modelo Feeling-Thinking-Doing).
Nunca inventes estadísticas, estudios ni testimonios. Si citas una cifra o dato verificable, agrégalo también en "sources" con "label" y "url" reales y verificables.
Si no tienes una fuente real y verificable para una cifra, no la incluyas.
Responde EXCLUSIVAMENTE con un objeto JSON (sin texto adicional, sin markdown) con esta forma exacta:
{
  "title": "string",
  "subtitle_em": "string corto, la parte final del titular a resaltar en rojo",
  "meta_description": "string <= 160 caracteres",
  "keywords": "string, palabras clave separadas por coma",
  "category_tag": "string corto, 1-2 palabras (ej. Estrategia, Posicionamiento)",
  "read_minutes": number,
  "breadcrumb_label": "string corto para breadcrumb",
  "lead": "string, 1-2 frases",
  "quote": "string, frase citable de 1 linea",
  "sections": [
    {"type":"text","h2":"string","h2_em":"string opcional a resaltar","paragraphs":["string", "..."]},
    {"type":"compare","title_left":"string","items_left":["string"],"title_right":"string","items_right":["string"]},
    {"type":"gap","label":"string","h3":"string","paragraphs":["string"],"fix":"string"},
    {"type":"stat","number":"string ej. 3x","description":"string, debe listarse tambien en sources"}
  ],
  "takeaways": [ {"bold":"string corto","text":"string"} ],
  "faq": [ {"question":"string","answer":"string"} ],
  "closing_paragraph": "string con una invitacion a /metodologia o /#contacto",
  "sources": [ {"label":"string","url":"string"} ]
}
Incluye entre 4 y 7 elementos en "sections", mezclando tipos "text" con al menos un "compare" o "gap".`;

async function callOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) fail('OPENAI_API_KEY no está configurada.');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      response_format: { type: 'json_object' },
      temperature: 0.7,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: 'Genera el próximo artículo de Brand Intelligence.' },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    fail(`OpenAI API respondió ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) fail('OpenAI no devolvió contenido.');

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    fail(`Respuesta de OpenAI no es JSON válido: ${e.message}`);
  }
  return parsed;
}

function mockArticle() {
  return {
    title: '[SIMULADO] El silencio también posiciona tu marca',
    subtitle_em: 'también posiciona.',
    meta_description: '[SIMULADO] Cuando tu marca no comunica, el mercado igual saca conclusiones. Esto es lo que llena ese vacío.',
    keywords: 'branding, silencio de marca, posicionamiento, comunicación estratégica, Germán Baher',
    category_tag: 'Estrategia',
    read_minutes: 6,
    breadcrumb_label: 'El silencio también posiciona',
    lead: '[SIMULADO] Cuando una marca deja de comunicar, no desaparece del radar. El mercado llena ese vacío con sus propias conclusiones.',
    quote: '[SIMULADO] "El silencio de una marca también es un mensaje — solo que no lo eliges tú."',
    sections: [
      {
        type: 'text',
        h2: 'Nadie interpreta el silencio como <em>neutralidad.</em>',
        h2_em: 'neutralidad.',
        paragraphs: [
          '[SIMULADO] Párrafo de ejemplo para validar la plantilla visual sin depender de una llamada real a OpenAI.',
          '[SIMULADO] Segundo párrafo de ejemplo, misma sección.',
        ],
      },
      {
        type: 'compare',
        title_left: 'Marca en silencio',
        items_left: ['[SIMULADO] Ítem A', '[SIMULADO] Ítem B'],
        title_right: 'Marca presente',
        items_right: ['[SIMULADO] Ítem C', '[SIMULADO] Ítem D'],
      },
      {
        type: 'gap',
        label: 'Brecha de ejemplo',
        h3: '[SIMULADO] Encabezado de brecha',
        paragraphs: ['[SIMULADO] Descripción de la brecha para prueba visual.'],
        fix: '[SIMULADO] El trabajo: acción sugerida de ejemplo.',
      },
    ],
    takeaways: [
      { bold: '[SIMULADO] Punto uno →', text: 'Texto de ejemplo del primer takeaway.' },
      { bold: '[SIMULADO] Punto dos →', text: 'Texto de ejemplo del segundo takeaway.' },
    ],
    faq: [
      { question: '[SIMULADO] ¿Pregunta de ejemplo?', answer: 'Respuesta de ejemplo para validar el FAQPage JSON-LD.' },
    ],
    closing_paragraph: '[SIMULADO] Si quieres profundizar, revisa <a href="/metodologia" style="color:var(--red);font-weight:600;">la metodología FDT →</a>',
    sources: [],
  };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateArticle(a) {
  const errors = [];
  const req = (cond, msg) => { if (!cond) errors.push(msg); };

  req(typeof a.title === 'string' && a.title.trim().length > 0, 'title ausente o vacío');
  req(typeof a.meta_description === 'string' && a.meta_description.trim().length > 0, 'meta_description ausente');
  req(typeof a.keywords === 'string' && a.keywords.trim().length > 0, 'keywords ausente');
  req(typeof a.lead === 'string' && a.lead.trim().length > 0, 'lead ausente');
  req(Array.isArray(a.sections) && a.sections.length >= 3, 'sections debe tener al menos 3 elementos');
  req(Array.isArray(a.takeaways) && a.takeaways.length >= 1, 'takeaways vacío');
  req(Array.isArray(a.faq) && a.faq.length >= 1, 'faq vacío');
  req(typeof a.closing_paragraph === 'string' && a.closing_paragraph.trim().length > 0, 'closing_paragraph ausente');

  const statSections = (a.sections || []).filter(s => s.type === 'stat');
  for (const s of statSections) {
    const hasSource = (a.sources || []).some(src => src.label && src.url);
    req(hasSource, `sección "stat" (${s.number || '?'}) presente sin al menos una fuente verificable en sources`);
  }

  if (errors.length) fail(`Artículo generado no pasa validación:\n - ${errors.join('\n - ')}`);
}

// ---------------------------------------------------------------------------
// HTML rendering (mirrors bi-005 template exactly)
// ---------------------------------------------------------------------------

function renderSection(s) {
  if (s.type === 'text') {
    const h2 = s.h2_em
      ? s.h2.replace(s.h2_em, `<em>${escapeHtml(s.h2_em)}</em>`)
      : escapeHtml(s.h2);
    const paras = (s.paragraphs || []).map(p => `    <p class="reveal">${p}</p>`).join('\n');
    return `    <h2 class="reveal">${h2}</h2>\n${paras}`;
  }
  if (s.type === 'compare') {
    const left = (s.items_left || []).map(i => `          <li>${escapeHtml(i)}</li>`).join('\n');
    const right = (s.items_right || []).map(i => `          <li>${escapeHtml(i)}</li>`).join('\n');
    return `    <div class="bi-compare reveal">
      <div class="bi-compare-col">
        <div class="bi-compare-title grey">${escapeHtml(s.title_left)}</div>
        <ul>
${left}
        </ul>
      </div>
      <div class="bi-compare-col red-col">
        <div class="bi-compare-title red">${escapeHtml(s.title_right)}</div>
        <ul>
${right}
        </ul>
      </div>
    </div>`;
  }
  if (s.type === 'gap') {
    const paras = (s.paragraphs || []).map(p => `      <p>${p}</p>`).join('\n');
    return `    <div class="bi-gap reveal">
      <div class="bi-gap-label">${escapeHtml(s.label)}</div>
      <h3>${escapeHtml(s.h3)}</h3>
${paras}
      <p class="bi-gap-fix">→ ${s.fix}</p>
    </div>`;
  }
  if (s.type === 'stat') {
    return `    <div class="bi-stat reveal">
      <div class="bi-stat-num">${escapeHtml(s.number)}</div>
      <div class="bi-stat-desc">${s.description}</div>
    </div>`;
  }
  return '';
}

function renderArticleHtml({ a, num, slug, canonicalPath, publishedDate, prev }) {
  const url = `${SITE}${canonicalPath}`;
  const takeaways = a.takeaways.map(t => `        <li><strong>${escapeHtml(t.bold)}</strong> ${t.text}</li>`).join('\n');
  const faqEntities = a.faq.map(f => `        {
          "@type": "Question",
          "name": ${JSON.stringify(f.question)},
          "acceptedAnswer": { "@type": "Answer", "text": ${JSON.stringify(f.answer)} }
        }`).join(',\n');
  const sectionsHtml = a.sections.map(renderSection).join('\n\n');
  const quoteBlock = `    <div class="bi-quote reveal">\n      <p>${escapeHtml(a.quote)}</p>\n    </div>`;
  const keywordsTags = a.keywords.split(',').slice(0, 4)
    .map(k => `  <meta property="article:tag" content="${escapeHtml(k.trim())}" />`).join('\n');
  const h1 = a.subtitle_em
    ? escapeHtml(a.title).replace(escapeHtml(a.subtitle_em), `<em>${escapeHtml(a.subtitle_em)}</em>`)
    : escapeHtml(a.title);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(a.title)} | Brand Intelligence — Germán Baher</title>
  <meta name="description" content="${escapeHtml(a.meta_description)}" />
  <meta name="keywords" content="${escapeHtml(a.keywords)}" />
  <meta name="author" content="Germán Baher" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${url}" />
  <link rel="icon" type="image/svg+xml" href="assets/brand/icon-red.svg" />

  <meta property="og:site_name" content="Germán Baher — Brand Intelligence" />
  <meta property="og:locale" content="es_LA" />
  <meta property="og:title" content="${escapeHtml(a.title)}" />
  <meta property="og:description" content="${escapeHtml(a.meta_description)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${SITE}/assets/images/og-cover-v4.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(a.title)} — Brand Intelligence por Germán Baher" />
  <meta property="og:type" content="article" />
  <meta property="article:published_time" content="${publishedDate}T00:00:00-04:00" />
  <meta property="article:modified_time" content="${publishedDate}T00:00:00-04:00" />
  <meta property="article:author" content="${SITE}" />
  <meta property="article:section" content="${escapeHtml(a.category_tag)}" />
${keywordsTags}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(a.title)}" />
  <meta name="twitter:description" content="${escapeHtml(a.meta_description)}" />
  <meta name="twitter:image" content="${SITE}/assets/images/og-cover-v4.jpg" />

  <script type="application/ld+json">
  [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": ${JSON.stringify(a.title)},
      "description": ${JSON.stringify(a.meta_description)},
      "image": "${SITE}/assets/images/og-cover-v4.jpg",
      "datePublished": "${publishedDate}",
      "dateModified": "${publishedDate}",
      "author": { "@type": "Person", "name": "Germán Baher", "url": "${SITE}", "jobTitle": "Brand Strategist" },
      "publisher": {
        "@type": "Organization",
        "name": "Germán Baher — Growth Brands",
        "url": "${SITE}",
        "logo": { "@type": "ImageObject", "url": "${SITE}/assets/brand/logo-full.svg" }
      },
      "mainEntityOfPage": { "@type": "WebPage", "@id": "${url}" },
      "articleSection": "${escapeHtml(a.category_tag)}",
      "keywords": ${JSON.stringify(a.keywords)},
      "inLanguage": "es"
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "${SITE}" },
        { "@type": "ListItem", "position": 2, "name": "Brand Intelligence", "item": "${SITE}/brand-intelligence" },
        { "@type": "ListItem", "position": 3, "name": ${JSON.stringify(a.breadcrumb_label)}, "item": "${url}" }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
${faqEntities}
      ]
    }
  ]
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    :root { --red: #ed2450; --black: #080808; --black2: #0d0d0d; --black3: #141414; --white: #ffffff; --border: rgba(255,255,255,0.07); }
    body { background: var(--black); color: var(--white); font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
    ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-track { background: var(--black); } ::-webkit-scrollbar-thumb { background: var(--red); }
    .bg-lines { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
    .bg-lines::before { content: ''; position: absolute; top: -30%; left: -10%; width: 140%; height: 160%; background: linear-gradient(115deg, transparent 0%, transparent 28%, rgba(255,255,255,0.022) 28.4%, rgba(255,255,255,0.022) 28.8%, transparent 29.2%, transparent 48%, rgba(255,255,255,0.016) 48.3%, rgba(255,255,255,0.016) 48.6%, transparent 49%, transparent 65%, rgba(255,255,255,0.012) 65.3%, rgba(255,255,255,0.012) 65.6%, transparent 66%, transparent 100%); }
    nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; justify-content: space-between; align-items: center; padding: 1.2rem 5vw; background: rgba(8,8,8,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); }
    .nav-logo { display: flex; align-items: center; text-decoration: none; }
    .nav-logo img { height: 30px; width: auto; }
    .nav-back { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; font-weight: 500; color: rgba(255,255,255,0.5); text-decoration: none; letter-spacing: 0.04em; transition: color 0.2s; }
    .nav-back:hover { color: var(--white); }
    .nav-back svg { width: 14px; height: 14px; }
    .progress-bar { position: fixed; top: 0; left: 0; height: 2px; background: var(--red); z-index: 200; width: 0%; transition: width 0.1s linear; }
    .container { max-width: 720px; margin: 0 auto; padding: 0 5vw; position: relative; z-index: 1; }
    .article-hero { padding: 8rem 5vw 4rem; position: relative; z-index: 1; }
    .article-meta { display: flex; align-items: center; gap: 1.2rem; margin-bottom: 2rem; flex-wrap: wrap; }
    .article-tag { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--red); border: 1px solid rgba(237,36,80,0.4); padding: 0.25rem 0.7rem; border-radius: 2px; }
    .article-num { font-size: 0.72rem; color: rgba(255,255,255,0.25); font-weight: 600; letter-spacing: 0.1em; }
    .article-time { font-size: 0.72rem; color: rgba(255,255,255,0.25); }
    .article-hero h1 { font-size: clamp(2rem, 5vw, 3.6rem); font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 1.4rem; }
    .article-hero h1 em { font-style: normal; color: var(--red); }
    .article-hero .lead { font-size: 1.12rem; color: rgba(255,255,255,0.6); line-height: 1.75; border-left: 3px solid var(--red); padding-left: 1.2rem; }
    .article-body { padding: 0 5vw 6rem; position: relative; z-index: 1; }
    .section-break { display: flex; align-items: center; gap: 1rem; margin: 3.5rem 0 2.5rem; }
    .section-break-num { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.2em; color: var(--red); text-transform: uppercase; white-space: nowrap; }
    .section-break-line { flex: 1; height: 1px; background: var(--border); }
    h2 { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.01em; margin-bottom: 1rem; line-height: 1.25; }
    h2 em { font-style: normal; color: var(--red); }
    p { font-size: 1rem; line-height: 1.8; color: rgba(255,255,255,0.72); margin-bottom: 1.4rem; }
    .bi-quote { margin: 2.5rem 0; padding: 2rem 2rem 2rem 2.2rem; border-left: 4px solid var(--red); background: var(--black3); border-radius: 0 8px 8px 0; }
    .bi-quote p { font-size: 1.2rem; font-weight: 600; color: var(--white); line-height: 1.5; margin: 0; font-style: italic; }
    .bi-gap { background: var(--black3); border-radius: 10px; border-left: 3px solid var(--red); padding: 1.6rem 1.8rem; margin: 1.8rem 0; }
    .bi-gap-label { font-size: 0.58rem; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--red); margin-bottom: 0.5rem; }
    .bi-gap h3 { font-size: 1.05rem; font-weight: 700; margin: 0 0 0.6rem; color: var(--white); }
    .bi-gap p { font-size: 0.92rem; color: rgba(255,255,255,0.6); line-height: 1.7; margin: 0 0 0.8rem; }
    .bi-gap p:last-child { margin: 0; }
    .bi-gap-fix { font-size: 0.82rem; color: rgba(237,36,80,0.9); font-weight: 600; margin-top: 0.6rem !important; }
    .bi-stat { text-align: center; padding: 3rem 2rem; margin: 2.5rem 0; background: var(--black3); border-radius: 10px; border: 1px solid var(--border); }
    .bi-stat-num { font-size: 4rem; font-weight: 900; color: var(--red); line-height: 1; margin-bottom: 0.5rem; }
    .bi-stat-desc { font-size: 0.9rem; color: rgba(255,255,255,0.45); }
    .bi-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); border-radius: 10px; overflow: hidden; margin: 2.5rem 0; }
    .bi-compare-col { background: var(--black3); padding: 1.8rem; }
    .bi-compare-col.red-col { background: rgba(237,36,80,0.08); }
    .bi-compare-title { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 1.2rem; padding-bottom: 0.8rem; border-bottom: 1px solid var(--border); }
    .bi-compare-title.red { color: var(--red); } .bi-compare-title.grey { color: rgba(255,255,255,0.3); }
    .bi-compare ul { list-style: none; display: flex; flex-direction: column; gap: 0.7rem; }
    .bi-compare li { font-size: 0.9rem; color: rgba(255,255,255,0.65); line-height: 1.5; }
    .bi-compare li::before { content: '→  '; color: var(--red); font-weight: 700; }
    .bi-takeaways { background: var(--black3); border: 1px solid rgba(237,36,80,0.2); border-radius: 10px; padding: 2rem; margin: 3rem 0; }
    .bi-takeaways-title { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--red); margin-bottom: 1.4rem; }
    .bi-takeaways ol { list-style: none; display: flex; flex-direction: column; gap: 1rem; counter-reset: item; }
    .bi-takeaways li { font-size: 0.95rem; color: rgba(255,255,255,0.75); line-height: 1.6; display: flex; gap: 1rem; align-items: flex-start; counter-increment: item; }
    .bi-takeaways li::before { content: counter(item); min-width: 24px; height: 24px; background: var(--red); color: var(--white); font-size: 0.72rem; font-weight: 700; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
    .bi-cta { margin: 4rem 0 0; padding: 3rem; background: var(--black3); border: 1px solid rgba(237,36,80,0.25); border-radius: 12px; text-align: center; position: relative; overflow: hidden; }
    .bi-cta::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(ellipse at center, rgba(237,36,80,0.06) 0%, transparent 60%); pointer-events: none; }
    .bi-cta-tag { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--red); margin-bottom: 0.8rem; }
    .bi-cta h3 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.6rem; line-height: 1.3; }
    .bi-cta p { font-size: 0.9rem; color: rgba(255,255,255,0.45); margin-bottom: 1.8rem; max-width: 420px; margin-left: auto; margin-right: auto; }
    .cta-form { display: flex; gap: 0.8rem; max-width: 420px; margin: 0 auto 0.8rem; flex-wrap: wrap; }
    .cta-form input { flex: 1; min-width: 160px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 0.75rem 1rem; color: var(--white); font-family: 'DM Sans', sans-serif; font-size: 0.9rem; outline: none; transition: border-color 0.2s; }
    .cta-form input::placeholder { color: rgba(255,255,255,0.25); }
    .cta-form input:focus { border-color: var(--red); }
    .cta-form button { background: var(--red); color: var(--white); border: none; border-radius: 6px; padding: 0.75rem 1.4rem; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 0.88rem; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: opacity 0.2s; white-space: nowrap; }
    .cta-form button:hover { opacity: 0.88; }
    .cta-note { font-size: 0.72rem; color: rgba(255,255,255,0.2); }
    .cta-success { display: none; color: var(--white); font-weight: 600; padding: 1rem; }
    .cta-success span { color: var(--red); }
    .bi-author { display: flex; align-items: center; gap: 1.2rem; padding: 2rem 0; border-top: 1px solid var(--border); margin-top: 3rem; }
    .bi-author img { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; }
    .bi-author-name { font-size: 0.9rem; font-weight: 700; margin-bottom: 0.2rem; }
    .bi-author-role { font-size: 0.78rem; color: rgba(255,255,255,0.35); }
    .bi-nav-bottom { display: flex; justify-content: space-between; align-items: center; padding: 2rem 5vw; border-top: 1px solid var(--border); position: relative; z-index: 1; flex-wrap: wrap; gap: 1rem; }
    .bi-nav-link { font-size: 0.82rem; font-weight: 600; color: rgba(255,255,255,0.4); text-decoration: none; display: flex; align-items: center; gap: 0.5rem; transition: color 0.2s; }
    .bi-nav-link:hover { color: var(--white); }
    .reveal { opacity: 0; transform: translateY(18px); transition: opacity 0.55s ease, transform 0.55s ease; }
    .reveal.on { opacity: 1; transform: none; }
    @media (max-width: 600px) { .bi-compare { grid-template-columns: 1fr; } .article-hero h1 { font-size: 2rem; } .cta-form { flex-direction: column; } }
  </style>
</head>
<body>
<div class="progress-bar" id="progressBar"></div>
<div class="bg-lines"></div>

<nav>
  <a href="/" class="nav-logo"><img src="assets/brand/logo-full.svg" alt="Germán Baher Growth Brands" /></a>
  <a href="/brand-intelligence" class="nav-back">
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 2L4 7l5 5"/></svg>
    Brand Intelligence
  </a>
</nav>

<section class="article-hero">
  <div class="container">
    <nav aria-label="Breadcrumb" style="margin-bottom:1.8rem;">
      <ol style="display:flex;align-items:center;gap:0.5rem;list-style:none;font-size:0.72rem;color:rgba(255,255,255,0.3);flex-wrap:wrap;">
        <li><a href="/" style="color:rgba(255,255,255,0.35);text-decoration:none;" rel="home">Inicio</a></li>
        <li style="opacity:0.4">›</li>
        <li><a href="/brand-intelligence" style="color:rgba(255,255,255,0.35);text-decoration:none;">Brand Intelligence</a></li>
        <li style="opacity:0.4">›</li>
        <li style="color:rgba(255,255,255,0.55);">${escapeHtml(a.breadcrumb_label)}</li>
      </ol>
    </nav>
    <div class="article-meta">
      <span class="article-tag">${escapeHtml(a.category_tag)}</span>
      <span class="article-num">BI — ${String(num).padStart(3, '0')}</span>
      <span class="article-time">${a.read_minutes} min de lectura</span>
    </div>
    <h1>${h1}</h1>
    <p class="lead">${a.lead}</p>
  </div>
</section>

<div class="article-body">
  <div class="container">

${quoteBlock}

${sectionsHtml}

    <div class="bi-takeaways reveal">
      <div class="bi-takeaways-title">Puntos clave</div>
      <ol>
${takeaways}
      </ol>
    </div>

    <p class="reveal">${a.closing_paragraph}</p>

    <div class="bi-cta reveal">
      <div class="bi-cta-tag">Brand Intelligence — Semanal</div>
      <h3>El próximo insight llega la semana que viene.</h3>
      <p>Análisis de marca que te hace pensar — directo en tu email.</p>
      <form class="cta-form" id="ctaForm">
        <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" style="display:none!important" />
        <input type="email" name="email" placeholder="Tu email" required />
        <button type="submit">Quiero recibirlo →</button>
      </form>
      <p class="cta-note">Sin spam. Cancelas cuando quieras.</p>
      <div class="cta-success" id="ctaSuccess">✓ ¡Perfecto! Te avisamos con el próximo <span>Brand Intelligence.</span></div>
    </div>

    <div class="bi-author reveal">
      <img src="assets/images/german-portrait-main.webp" alt="Germán Baher — Brand Strategist" />
      <div>
        <div class="bi-author-name">Germán Baher</div>
        <div class="bi-author-role">Brand Strategist · Growth Brands · Latinoamérica &amp; Canadá</div>
      </div>
    </div>

  </div>
</div>

<div class="bi-nav-bottom">
  <a href="/brand-intelligence" class="bi-nav-link">
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 2L4 7l5 5"/></svg>
    Ver todos los insights
  </a>${prev ? `
  <a href="/bi-${String(prev.num).padStart(3, '0')}-${prev.slug}" class="bi-nav-link">
    BI-${String(prev.num).padStart(3, '0')}: ${escapeHtml(prev.title)}
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 2l5 5-5 5"/></svg>
  </a>` : ''}
</div>

<script>
  window.addEventListener('scroll', () => {
    const doc = document.documentElement;
    document.getElementById('progressBar').style.width = (doc.scrollTop / (doc.scrollHeight - doc.clientHeight)) * 100 + '%';
  });
  const io = new IntersectionObserver(e => e.forEach(x => { if (x.isIntersecting) { x.target.classList.add('on'); io.unobserve(x.target); } }), { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  document.getElementById('ctaForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const gotcha = this.querySelector('input[name="_gotcha"]');
    if (gotcha && gotcha.value) return;
    const btn = this.querySelector('button');
    btn.textContent = 'Enviando…'; btn.disabled = true;
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.email.value, fuente: 'bi-${String(num).padStart(3, '0')}' })
      });
    } catch(_) {}
    this.style.display = 'none';
    document.getElementById('ctaSuccess').style.display = 'block';
  });
</script>
<script src="assets/js/cookie-consent.js"></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Card insertion in brand-intelligence.html
// ---------------------------------------------------------------------------

function renderCard({ a, num, canonicalPath }) {
  return `      <a href="${canonicalPath}" class="bi-card reveal">
        <div class="bi-card-top">
          <span class="bi-card-num">BI — ${String(num).padStart(3, '0')}</span>
          <span class="bi-card-cat">${escapeHtml(a.category_tag)}</span>
        </div>
        <h3>${escapeHtml(a.title)}</h3>
        <p>${escapeHtml(a.lead)}</p>
        <div class="bi-card-footer">
          <span class="bi-card-time">${a.read_minutes} min de lectura</span>
          <div class="bi-card-arrow">
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M2 6h8M6 2l4 4-4 4"/>
            </svg>
          </div>
        </div>
      </a>
`;
}

function updateBrandIntelligenceHtml(cardHtml) {
  const filePath = path.join(ROOT, 'brand-intelligence.html');
  const original = fs.readFileSync(filePath, 'utf8');
  const marker = '    </div>\n  </div>\n</section>\n\n<!-- FOOTER -->';
  if (!original.includes(marker)) {
    fail('No se encontró el punto de inserción esperado en brand-intelligence.html (marker de cierre de .bi-grid / FOOTER).');
  }
  return original.replace(marker, `${cardHtml}    </div>\n  </div>\n</section>\n\n<!-- FOOTER -->`);
}

// ---------------------------------------------------------------------------
// vercel.json rewrite + redirect insertion
// ---------------------------------------------------------------------------

function updateVercelJson(canonicalPath, htmlFileName) {
  const filePath = path.join(ROOT, 'vercel.json');
  const config = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (config.rewrites.some(r => r.source === canonicalPath)) {
    fail(`vercel.json ya tiene un rewrite para ${canonicalPath} (colisión de identificador).`);
  }

  config.rewrites.push({ source: canonicalPath, destination: `/${htmlFileName}` });
  config.redirects.push({ source: `/${htmlFileName}`, destination: canonicalPath, permanent: true });

  return JSON.stringify(config, null, 2) + '\n';
}

// ---------------------------------------------------------------------------
// sitemap.xml insertion
// ---------------------------------------------------------------------------

function updateSitemap(canonicalPath, publishedDate) {
  const filePath = path.join(ROOT, 'sitemap.xml');
  const original = fs.readFileSync(filePath, 'utf8');
  const url = `${SITE}${canonicalPath}`;
  if (original.includes(`<loc>${url}</loc>`)) {
    fail(`sitemap.xml ya contiene una entrada para ${url} (colisión de identificador).`);
  }
  const entry = `  <url>\n    <loc>${url}</loc>\n    <lastmod>${publishedDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>\n`;
  if (!original.trim().endsWith('</urlset>')) fail('sitemap.xml no termina en </urlset>, formato inesperado.');
  return original.replace(/<\/urlset>\s*$/, entry);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const today = new Date();
  const publishedDate = today.toISOString().slice(0, 10);
  const weekId = isoWeekId(today);

  console.log(`Semana ISO: ${weekId}`);
  console.log(SIMULATE ? 'Modo: SIMULACIÓN (sin red, sin escritura en el repo)' : 'Modo: REAL');

  const num = nextBiNumber();
  const prev = latestEsArticle();

  const article = SIMULATE ? mockArticle() : await callOpenAI();
  validateArticle(article);

  const slug = slugify(article.title);
  const htmlFileName = `bi-${String(num).padStart(3, '0')}-${slug}.html`;
  const canonicalPath = `/bi-${String(num).padStart(3, '0')}-${slug}`;
  const targetHtmlPath = path.join(ROOT, htmlFileName);

  if (!SIMULATE && fs.existsSync(targetHtmlPath)) {
    fail(`El archivo ${htmlFileName} ya existe — posible colisión de identificador. Abortando sin escribir.`);
  }

  const articleHtml = renderArticleHtml({ a: article, num, slug, canonicalPath, publishedDate, prev });
  const cardHtml = renderCard({ a: article, num, canonicalPath });
  const updatedBiHtml = updateBrandIntelligenceHtml(cardHtml);
  const updatedVercelJson = updateVercelJson(canonicalPath, htmlFileName);
  const updatedSitemap = updateSitemap(canonicalPath, publishedDate);

  const logEntry = {
    id: `bi-${String(num).padStart(3, '0')}`,
    week: weekId,
    slug,
    file: htmlFileName,
    canonical_path: canonicalPath,
    generated_at: today.toISOString(),
    simulated: SIMULATE,
  };

  if (SIMULATE) {
    const outDir = path.join(ROOT, '.simulate-output');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, htmlFileName), articleHtml);
    fs.writeFileSync(path.join(outDir, 'brand-intelligence.html'), updatedBiHtml);
    fs.writeFileSync(path.join(outDir, 'vercel.json'), updatedVercelJson);
    fs.writeFileSync(path.join(outDir, 'sitemap.xml'), updatedSitemap);
    fs.writeFileSync(path.join(outDir, 'weekly-article-log-entry.json'), JSON.stringify(logEntry, null, 2) + '\n');

    console.log('\n--- SIMULACIÓN COMPLETA ---');
    console.log(`Artículo: ${article.title}`);
    console.log(`ID: ${logEntry.id}  Slug: ${slug}  Ruta: ${canonicalPath}`);
    console.log(`Archivos de vista previa escritos en: ${path.relative(ROOT, outDir)}/`);
    console.log(' - ' + htmlFileName + ' (nuevo)');
    console.log(' - brand-intelligence.html (vista previa con card insertada)');
    console.log(' - vercel.json (vista previa con rewrite+redirect)');
    console.log(' - sitemap.xml (vista previa con nueva entrada)');
    console.log(' - weekly-article-log-entry.json');
    console.log('Ningún archivo real del repositorio fue modificado. Ningún comando git fue ejecutado.');
    return;
  }

  // Real run: write all files only after every piece above succeeded.
  fs.writeFileSync(targetHtmlPath, articleHtml);
  fs.writeFileSync(path.join(ROOT, 'brand-intelligence.html'), updatedBiHtml);
  fs.writeFileSync(path.join(ROOT, 'vercel.json'), updatedVercelJson);
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), updatedSitemap);

  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
  const log = fs.existsSync(LOG_PATH) ? JSON.parse(fs.readFileSync(LOG_PATH, 'utf8')) : { entries: [] };
  log.entries.push(logEntry);
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2) + '\n');

  console.log('\n--- GENERACIÓN COMPLETA ---');
  console.log(`Archivo creado: ${htmlFileName}`);
  console.log(`ID: ${logEntry.id}  Ruta: ${canonicalPath}`);
  console.log('Archivos modificados: brand-intelligence.html, vercel.json, sitemap.xml');
  console.log(`Log actualizado: ${path.relative(ROOT, LOG_PATH)}`);

  // Emit machine-readable outputs for the GitHub Actions workflow.
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT,
      `article_id=${logEntry.id}\ntitle=${article.title}\nbranch=auto/weekly-article-${weekId}\nhtml_file=${htmlFileName}\n`);
  }
}

main().catch(err => fail(err.stack || err.message));
