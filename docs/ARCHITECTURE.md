# Architecture

## Stack
- Sitio estático: HTML/CSS/JS en la raíz. Sin build (`npm run build` es un `echo`).
- Node ESM (`"type": "module"`). Node 24 en CI.
- Funciones serverless en `api/` (`og.js`, `subscribe.js`, `unsubscribe.js`).
- Deploy: Vercel desde `main`. Rutas y redirecciones en `vercel.json`.
- CI: `.github/workflows/generate-weekly-article.yml` (manual) abre la propuesta de cambio semanal.

## Mapa
- `index.html`, `case-*.html`, `faq.html`: páginas del sitio.
- `bi-NNN-*.html`: artículos publicados (una página por idioma).
- `brand-intelligence*.html`: índices de la sección, `sitemap.xml`, `vercel.json`: se actualizan al publicar.
- `articulos/`: sistema editorial. Ideas, borradores, listos, publicados. Reglas de voz en `00-sistema/`. `revisar.sh` revisa estilo.
- `articulos/automatizacion/`: instrucciones de las rutinas de viernes, lunes y LinkedIn.
- `scripts/generate-weekly-article.js`: genera la página de un artículo y actualiza índices, `vercel.json` y `sitemap.xml`. `--simulate` escribe solo en `.simulate-output/`.
- `data/`, `content-queue.json`: datos del sistema de contenido.
- `harness/`, `agents/`, `progress/`, `audits/`: arnés agéntico.

## Reglas
- Un artículo se publica solo con `generate-weekly-article.js --from-json`. No editar a mano `sitemap.xml` ni `vercel.json` para eso.
- No mezclar cambios de diseño del sitio con cambios editoriales en un mismo commit.
- Carpetas con material ajeno al sitio (`German_Baher_Brand_System_v1.0/`, `germanbaher-organized/`, `drafts/`) no forman parte del deploy. No tocarlas sin pedido.
