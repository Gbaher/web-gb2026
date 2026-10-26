# Progreso - T-0001 - Instalar arnés agéntico mínimo

**Fecha:** 2026-10-01
**Agente:** orchestrator + implementer
**Estado:** review

## Objetivo
Instalar el arnés de `guia_arnes_agentico.docx` adaptado a un sitio estático con sistema editorial ya existente.

## Contexto leído
CLAUDE.md, articulos/README.md, articulos/automatizacion/README.md, articulos/revisar.sh, package.json, scripts/generate-weekly-article.js (cabecera).

## Archivos creados
AGENTS.md, docs/{PRD,ARCHITECTURE,DECISIONS,RUNBOOK}.md, harness/{init.sh,verify.sh,tasks.json,rules.md,definition-of-done.md}, agents/{orchestrator,implementer,reviewer}.md, audits/.gitkeep. Modificado: CLAUDE.md (apartado Arnés).

## Decisiones
- CLAUDE.md se conserva como fuente de reglas editoriales. AGENTS.md es corto y apunta a él.
- `verify.sh` valida sintaxis JS, JSON, sitemap, `revisar.sh` y `--simulate` sobre `articulos/03-listos/`. No hay tests ni lint porque el proyecto no los tiene.
- Se omitió SYSTEM_MAP.md y GLOSSARY.md: el mapa va en ARCHITECTURE.md.

## Comandos ejecutados
`bash harness/init.sh` OK. `bash harness/verify.sh` OK (03-listos vacío, 29 URLs en sitemap).

## Añadido después
- `scripts/smoke-test.mjs`: revisa href/src internos de los HTML de la raíz contra archivos y `vercel.json`. Enchufado en `verify.sh`.
- Hook PostToolUse (`.claude/settings.json` + `.claude/hooks/revisar-articulo.sh`): al editar un .md o .json dentro de `articulos/`, corre `revisar.sh` y devuelve las marcas.

## Hallazgo
`verify.sh` fallaba por un enlace roto previo: `bi-003-marque-ne-vend-pas.html` apuntaba a `/bi-002-marque-brisee`, que no existía. Resuelto el 2026-10-01 creando `bi-002-marque-brisee.html` (traducción al francés desde la versión en español).
Cambios asociados: rewrite y redirect en `vercel.json`, entrada en `sitemap.xml`, `c2_url` francés en `brand-intelligence.html`, y hreflang es/en/fr en las tres versiones de BI-002.

## Pendientes
- Germán completa la sección PENDIENTE de `docs/PRD.md` (público, métricas, páginas críticas).
- Germán revisa la traducción francesa de BI-002 antes de fusionar.

## Próximo paso
Revisión por Germán y commit (por nombre de archivo, el repo tiene muchos archivos sin seguir ajenos).
