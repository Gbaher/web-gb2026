#!/usr/bin/env node
// scripts/generate-article.js
// Generates a full Brand Intelligence HTML article using Anthropic API
// Run: node scripts/generate-article.js [num]
//      num = article number to generate (defaults to next queued)

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Load queue ──────────────────────────────────────────────────────
const queuePath = path.join(ROOT, 'content-queue.json');
const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));

const targetNum = process.argv[2] ? parseInt(process.argv[2]) : null;
const article = targetNum
  ? queue.articles.find(a => a.num === targetNum)
  : queue.articles.find(a => a.status === 'queued');

if (!article) {
  console.error('❌ No queued articles found. Add topics to content-queue.json.');
  process.exit(1);
}

console.log(`\n📝 Generating BI-${String(article.num).padStart(3,'0')}: "${article.title_es}"\n`);

// ── Brand context prompt ─────────────────────────────────────────────
const BRAND_CONTEXT = `
Eres el ghostwriter de Germán Baher, brand strategist con 20+ años de experiencia en Latinoamérica y Canadá.

AUTOR: Germán Baher
SITIO: germanbaher.com
METODOLOGÍA PROPIA: FDT — Feeling · Doing · Thinking
  - Feeling: dimensión emocional de la marca (qué siente el cliente antes de conocerte)
  - Doing: dimensión de ejecución (coherencia entre identidad y acción)
  - Thinking: dimensión estratégica (decisiones basadas en datos e inteligencia de mercado)

VOZ Y TONO:
- Directo, sin relleno, sin buzzwords vacíos
- Cuestiona suposiciones cómodas del lector corporativo
- Hace preguntas incómodas que generan auto-reflexión
- Usa analogías concretas, no metáforas abstractas
- Nunca usa: "en el mundo actual", "es clave", "robusto", "potenciar", "sinergias"
- Usa: preguntas directas, datos con fuente, ejemplos reconocibles, frases cortas

FORMATO REQUERIDO — ESTRUCTURA HTML EXACTA:
Cada artículo tiene estas secciones en este orden:
1. Paradoja / Hook (h2 + 2-3 párrafos que plantean el problema)
2. Quote destacado (div.bi-quote)
3. El modelo FDT aplicado al tema (section-break + h2 + explicación)
4. Diagnóstico visual — síntomas reconocibles (div.bi-gap con label, h3, párrafos, bi-gap-fix)
5. Dato estadístico (div.bi-stat con número grande + descripción)
6. Segundo gap o profundización
7. Tercer gap o solución
8. Tabla comparativa (div.bi-compare — Sin FDT vs Con FDT)
9. Takeaways numerados (div.bi-takeaways)
10. Párrafo de cierre + link interno a /metodologia
`;

// ── Generate article content in all 3 languages ─────────────────────
async function generateArticleContent(lang) {
  const titles = { es: article.title_es, en: article.title_en, fr: article.title_fr };
  const subs   = { es: article.sub_es,   en: article.sub_en,   fr: article.sub_fr };
  const cats   = { es: article.cat_es,   en: article.cat_en,   fr: article.cat_fr };
  const kws    = { es: article.keywords_es, en: article.keywords_en, fr: article.keywords_fr || article.keywords_es };

  const langNames = { es: 'Spanish', en: 'English', fr: 'French' };

  const prompt = `${BRAND_CONTEXT}

Write the BODY CONTENT of a Brand Intelligence article in ${langNames[lang]}.

ARTICLE DATA:
- Number: BI-${String(article.num).padStart(3,'0')}
- Cluster: ${article.cluster}
- Category: ${cats[lang]}
- Title: ${titles[lang]}
- Subtitle: ${subs[lang]}
- Target keywords: ${kws[lang].join(', ')}
- Reading time: ${lang === 'es' ? article.read_time_es : lang === 'en' ? article.read_time_en : article.read_time_fr}

OUTPUT: Return ONLY the inner HTML content that goes inside the article body container div.
Use this exact structure with these exact CSS classes (same as existing articles):
- <div class="section-break reveal"><span class="section-break-num">SECTION NAME</span><div class="section-break-line"></div></div>
- <h2 class="reveal">Title with <em>red emphasis</em></h2>
- <p class="reveal">Body text</p>
- <div class="bi-quote reveal"><p>"quote"</p></div>
- <div class="bi-gap reveal"><div class="bi-gap-label">Gap Label</div><h3>Gap title</h3><p>Body</p><p class="bi-gap-fix">→ The work: action</p></div>
- <div class="bi-stat reveal"><div class="bi-stat-num">75%</div><div class="bi-stat-desc">description*</div></div>
- <div class="bi-compare reveal"> ... (two columns: without FDT / with FDT) </div>
- <div class="bi-takeaways reveal"><div class="bi-takeaways-title">KEY TITLE</div><ol><li>...</li></ol></div>
- End with a paragraph linking to /metodologia: <a href="/metodologia" style="color:var(--red);font-weight:600;">anchor text →</a>

Write 1200-1600 words of body content. Be specific, use real examples, avoid generic advice.
Include ONE statistical fact (with source footnote at end).
Do NOT include the CTA subscribe form, author bio, or nav elements — those are added automatically.`;

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }]
  });

  return response.content[0].text;
}

// ── Build full HTML file ─────────────────────────────────────────────
function buildHTML(lang, bodyContent) {
  const titles   = { es: article.title_es, en: article.title_en, fr: article.title_fr };
  const subs     = { es: article.sub_es,   en: article.sub_en,   fr: article.sub_fr };
  const cats     = { es: article.cat_es,   en: article.cat_en,   fr: article.cat_fr };
  const slugs    = { es: article.slug_es,  en: article.slug_en,  fr: article.slug_fr };
  const times    = { es: article.read_time_es, en: article.read_time_en, fr: article.read_time_fr };
  const kws      = { es: article.keywords_es?.join(', '), en: article.keywords_en?.join(', '), fr: article.keywords_es?.join(', ') };
  const biLabel  = { es: 'Brand Intelligence — Semanal', en: 'Brand Intelligence — Weekly', fr: 'Brand Intelligence — Hebdomadaire' };
  const ctaH3    = { es: 'El próximo insight llega la semana que viene.', en: 'The next insight arrives next week.', fr: 'Le prochain insight arrive la semaine prochaine.' };
  const ctaSub   = { es: 'Análisis de marca que te hace pensar — directo en tu email.', en: 'Brand analysis that makes you think — straight to your inbox.', fr: 'Des analyses de marque qui font réfléchir — directement dans votre boîte mail.' };
  const ctaBtn   = { es: 'Quiero recibirlo →', en: 'I want to receive it →', fr: 'Je veux le recevoir →' };
  const ctaNote  = { es: 'Sin spam. Cancela cuando quieras.', en: 'No spam. Unsubscribe anytime.', fr: 'Sans spam. Désinscription à tout moment.' };
  const ctaOk    = { es: '¡Listo! Te avisamos con el próximo <span>Brand Intelligence.</span>', en: 'Done! We\'ll notify you with the next <span>Brand Intelligence.</span>', fr: 'Parfait ! Nous vous informons du prochain <span>Brand Intelligence.</span>' };
  const navBack  = { es: 'Brand Intelligence', en: 'Brand Intelligence', fr: 'Brand Intelligence' };
  const authorRole = { es: 'Brand & Growth Strategist · Canadá y Latinoamérica', en: 'Brand & Growth Strategist · Canada & Latin America', fr: 'Brand & Growth Strategist · Canada & Amérique Latine' };
  const biNum    = `BI — ${String(article.num).padStart(3,'0')}`;
  const biNumSlug = `bi-${String(article.num).padStart(3,'0')}`;
  const url      = `https://www.germanbaher.com/${slugs[lang]}`;
  const ogUrl    = `https://www.germanbaher.com/api/og?title=${encodeURIComponent(titles[lang])}&cat=${encodeURIComponent('Brand Intelligence · ' + biNum)}&sub=${encodeURIComponent(subs[lang])}`;
  const altLangs = Object.keys(slugs).map(l =>
    `  <link rel="alternate" hreflang="${l}" href="https://www.germanbaher.com/${slugs[l]}" />`
  ).join('\n');
  const breadHome = { es: 'Inicio', en: 'Home', fr: 'Accueil' };
  const prevSlug = { es: `/${biNumSlug}-prev-es`, en: `/${biNumSlug}-prev-en`, fr: `/${biNumSlug}-prev-fr` };
  const navAllLabel = { es: 'Ver todos los insights', en: 'See all insights', fr: 'Voir tous les insights' };
  const statNote = { es: '* Fuente: datos de comportamiento web y estudios de percepción de marca.', en: '* Source: web behavior data and brand perception studies.', fr: '* Source : données comportementales web et études de perception de marque.' };

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${titles[lang]} | Brand Intelligence — Germán Baher</title>
  <meta name="description" content="${subs[lang]}" />
  <meta name="keywords" content="${kws[lang]}, Brand Intelligence, Germán Baher, FDT, metodología de marca" />
  <meta name="author" content="Germán Baher" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${url}" />
${altLangs}
  <link rel="icon" type="image/svg+xml" href="assets/brand/icon-red.svg" />

  <meta property="og:site_name" content="Germán Baher — Brand Intelligence" />
  <meta property="og:title" content="${titles[lang]}" />
  <meta property="og:description" content="${subs[lang]}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${ogUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:type" content="article" />
  <meta property="article:published_time" content="${new Date().toISOString().split('T')[0]}T00:00:00-04:00" />
  <meta property="article:author" content="https://www.germanbaher.com" />
  <meta property="article:section" content="${cats[lang]}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${titles[lang]}" />
  <meta name="twitter:description" content="${subs[lang]}" />
  <meta name="twitter:image" content="${ogUrl}" />

  <script type="application/ld+json">
  [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "${titles[lang].replace(/"/g, '\\"')}",
      "description": "${subs[lang].replace(/"/g, '\\"')}",
      "image": "${ogUrl}",
      "datePublished": "${new Date().toISOString().split('T')[0]}",
      "dateModified": "${new Date().toISOString().split('T')[0]}",
      "author": { "@type": "Person", "name": "Germán Baher", "url": "https://www.germanbaher.com" },
      "publisher": { "@type": "Organization", "name": "Germán Baher — Growth Brands", "url": "https://www.germanbaher.com" },
      "mainEntityOfPage": { "@type": "WebPage", "@id": "${url}" },
      "inLanguage": "${lang}"
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "${breadHome[lang]}", "item": "https://www.germanbaher.com" },
        { "@type": "ListItem", "position": 2, "name": "Brand Intelligence", "item": "https://www.germanbaher.com/brand-intelligence" },
        { "@type": "ListItem", "position": 3, "name": "${titles[lang].replace(/"/g, '\\"')}", "item": "${url}" }
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
    ${navBack[lang]}
  </a>
</nav>

<section class="article-hero">
  <div class="container">
    <nav aria-label="Breadcrumb" style="margin-bottom:1.8rem;">
      <ol style="display:flex;align-items:center;gap:0.5rem;list-style:none;font-size:0.72rem;color:rgba(255,255,255,0.3);flex-wrap:wrap;">
        <li><a href="/" style="color:rgba(255,255,255,0.35);text-decoration:none;">${breadHome[lang]}</a></li>
        <li style="opacity:0.4">›</li>
        <li><a href="/brand-intelligence" style="color:rgba(255,255,255,0.35);text-decoration:none;">Brand Intelligence</a></li>
        <li style="opacity:0.4">›</li>
        <li style="color:rgba(255,255,255,0.55);">${titles[lang]}</li>
      </ol>
    </nav>
    <div class="article-meta">
      <span class="article-tag">${cats[lang]}</span>
      <span class="article-num">${biNum}</span>
      <span class="article-time">${times[lang]}</span>
    </div>
    <h1>${titles[lang]}</h1>
    <p class="lead">${subs[lang]}</p>
  </div>
</section>

<div class="article-body">
  <div class="container">

${bodyContent}

    <div class="bi-cta reveal">
      <div class="bi-cta-tag">${biLabel[lang]}</div>
      <h3>${ctaH3[lang]}</h3>
      <p>${ctaSub[lang]}</p>
      <form class="cta-form" id="ctaForm">
        <input type="email" name="email" placeholder="Email" required />
        <button type="submit">${ctaBtn[lang]}</button>
      </form>
      <p class="cta-note">${ctaNote[lang]}</p>
      <div class="cta-success" id="ctaSuccess">${ctaOk[lang]}</div>
    </div>

    <div class="bi-author reveal">
      <img src="assets/images/german-portrait-main.webp" alt="Germán Baher" />
      <div>
        <div class="bi-author-name">Germán Baher</div>
        <div class="bi-author-role">${authorRole[lang]}</div>
      </div>
    </div>

    <p style="font-size:0.7rem;color:rgba(255,255,255,0.18);margin-top:1rem;">${statNote[lang]}</p>

  </div>
</div>

<div class="bi-nav-bottom">
  <a href="/brand-intelligence" class="bi-nav-link">
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 2L4 7l5 5"/></svg>
    ${navAllLabel[lang]}
  </a>
</div>

<script>
  window.addEventListener('scroll', () => {
    const doc = document.documentElement;
    document.getElementById('progressBar').style.width = (doc.scrollTop / (doc.scrollHeight - doc.clientHeight)) * 100 + '%';
  });
  const io = new IntersectionObserver(e => e.forEach(x => { if (x.isIntersecting) { x.target.classList.add('on'); io.unobserve(x.target); } }), { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  const WEBHOOK = 'https://script.google.com/macros/s/AKfycbwnJOX14kd3puq3j2PEy65jvb00fF9S1BuTjfs9onDyLTLEdfRaOzyrRwvsP143XcY5Bw/exec';
  document.getElementById('ctaForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = this.querySelector('button');
    btn.textContent = '...'; btn.disabled = true;
    try { await fetch(WEBHOOK, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ email: this.email.value, fuente: '${slugs[lang]}' }) }); } catch(_) {}
    this.style.display = 'none';
    document.getElementById('ctaSuccess').style.display = 'block';
  });
</script>
</body>
</html>`;
}

// ── Update vercel.json with new routes ───────────────────────────────
function updateVercelRoutes() {
  const vercelPath = path.join(ROOT, 'vercel.json');
  const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));

  const newRewrites = [
    { source: `/${article.slug_es}`, destination: `/${article.slug_es}.html` },
    { source: `/${article.slug_en}`, destination: `/${article.slug_en}.html` },
    { source: `/${article.slug_fr}`, destination: `/${article.slug_fr}.html` },
  ];
  const newRedirects = [
    { source: `/${article.slug_es}.html`, destination: `/${article.slug_es}`, permanent: true },
    { source: `/${article.slug_en}.html`, destination: `/${article.slug_en}`, permanent: true },
    { source: `/${article.slug_fr}.html`, destination: `/${article.slug_fr}`, permanent: true },
  ];

  // Avoid duplicates
  const existingSources = new Set(vercel.rewrites?.map(r => r.source) || []);
  newRewrites.forEach(r => { if (!existingSources.has(r.source)) vercel.rewrites.push(r); });
  const existingRedirSources = new Set(vercel.redirects?.map(r => r.source) || []);
  newRedirects.forEach(r => { if (!existingRedirSources.has(r.source)) vercel.redirects.push(r); });

  fs.writeFileSync(vercelPath, JSON.stringify(vercel, null, 2));
  console.log('✓ vercel.json updated with new routes');
}

// ── Mark article as published in queue ───────────────────────────────
function markPublished() {
  article.status = 'published';
  article.published_at = new Date().toISOString().split('T')[0];
  queue.last_published_num = article.num;
  fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2));
  console.log('✓ content-queue.json updated');
}

// ── Generate LinkedIn post copy ───────────────────────────────────────
async function generateLinkedInPost() {
  const biNum = `BI-${String(article.num).padStart(3,'0')}`;
  const articleUrl = `https://www.germanbaher.com/${article.slug_es}`;

  const prompt = `Eres Germán Baher, brand strategist con 20+ años de experiencia.
Estilo LinkedIn de Germán: publica "La Pregunta Estratégica del Día" — dilemas incómodos para líderes de negocio.
Tono: directo, incisivo, sin relleno. Genera tensión cognitiva desde la primera línea.
NO usar: emojis decorativos en exceso, frases de motivación vacías, "en el mundo actual".
SÍ usar: pregunta directa que incomoda, datos concretos, insight del artículo, llamada a la acción final.

Escribe un post de LinkedIn en ESPAÑOL para este artículo:
Título: ${article.title_es}
Subtítulo: ${article.sub_es}
Cluster FDT: ${article.cluster}
URL del artículo: ${articleUrl}

ESTRUCTURA DEL POST (en este orden exacto):
1. HOOK (1 línea): Una pregunta incómoda o afirmación que para al lector en el feed. Sin emoji al inicio.
2. TENSIÓN (2-3 líneas): Amplía la incomodidad. El lector debe reconocerse.
3. INSIGHT (2-3 líneas): El dato o perspectiva central del artículo. Concreto.
4. CIERRE (1 línea): La conclusión que cambia la perspectiva.
5. CTA (1 línea): "El análisis completo en Brand Intelligence →" + URL
6. HASHTAGS (1 línea al final): 4-5 hashtags relevantes en español

Máximo 1300 caracteres total (límite óptimo LinkedIn).
Devuelve SOLO el texto del post, sin explicaciones.`;

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }]
  });

  return response.content[0].text.trim();
}

// ── Save LinkedIn post to file (for GitHub Actions to read) ──────────
function saveLinkedInPost(postText) {
  const postPath = path.join(ROOT, 'linkedin-post-draft.txt');
  const biNum = `BI-${String(article.num).padStart(3,'0')}`;
  const content = `LINKEDIN POST DRAFT — ${biNum}
Generated: ${new Date().toISOString()}
Article ES: https://www.germanbaher.com/${article.slug_es}
Article EN: https://www.germanbaher.com/${article.slug_en}
---
${postText}
---
`;
  fs.writeFileSync(postPath, content);

  // Also write JSON for webhook
  const jsonPath = path.join(ROOT, 'linkedin-post-draft.json');
  fs.writeFileSync(jsonPath, JSON.stringify({
    post_text: postText,
    article_num: article.num,
    article_title: article.title_es,
    article_url: `https://www.germanbaher.com/${article.slug_es}`,
    article_url_en: `https://www.germanbaher.com/${article.slug_en}`,
    og_image: `https://www.germanbaher.com/api/og?title=${encodeURIComponent(article.title_es)}&cat=${encodeURIComponent('Brand Intelligence · BI-' + String(article.num).padStart(3,'0'))}&sub=${encodeURIComponent(article.sub_es)}`,
    cluster: article.cluster,
    generated_at: new Date().toISOString()
  }, null, 2));

  console.log('✓ linkedin-post-draft.txt + .json written');
}

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
  const langs = ['es', 'en', 'fr'];
  const files = {};

  // Generate article content for all 3 languages
  for (const lang of langs) {
    console.log(`  Generating ${lang.toUpperCase()} content...`);
    const body = await generateArticleContent(lang);
    const html = buildHTML(lang, body);
    const slug = { es: article.slug_es, en: article.slug_en, fr: article.slug_fr }[lang];
    const filePath = path.join(ROOT, `${slug}.html`);
    fs.writeFileSync(filePath, html);
    files[lang] = filePath;
    console.log(`  ✓ ${slug}.html written`);
  }

  // Generate LinkedIn post
  console.log('  Generating LinkedIn post...');
  const liPost = await generateLinkedInPost();
  saveLinkedInPost(liPost);

  updateVercelRoutes();
  markPublished();

  console.log('\n✅ Article generation complete!');
  console.log('Files created:');
  Object.entries(files).forEach(([l, f]) => console.log(`  ${l.toUpperCase()}: ${path.basename(f)}`));
  console.log('  LinkedIn post: linkedin-post-draft.txt');
  console.log('\nNext: review the PR, merge to publish. LinkedIn post goes to Make.com automatically.\n');
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
