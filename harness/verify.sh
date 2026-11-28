#!/usr/bin/env bash
# Filtro de calidad. Sale con código distinto de cero si algo falla.
# El chequeo de estilo (revisar.sh) solo informa: las marcas se juzgan en contexto.
set -uo pipefail

echo "== Harness verification =="

if [ ! -f "AGENTS.md" ]; then
  echo "ERROR: Ejecuta desde la raíz del proyecto."
  exit 1
fi

fail=0
note() { echo "FALLO: $1"; fail=1; }

echo "== Sintaxis JS =="
for f in scripts/*.js api/*.js; do
  [ -f "$f" ] || continue
  node --check "$f" || note "$f"
done

echo "== JSON válido =="
for f in vercel.json content-queue.json harness/tasks.json articulos/0[23]-*/*.json; do
  [ -f "$f" ] || continue
  node -e 'JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"))' "$f" 2>/dev/null || note "$f no es JSON válido"
done

echo "== sitemap.xml =="
node -e '
const fs = require("fs");
const xml = fs.readFileSync("sitemap.xml", "utf8");
const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
if (!locs.length) { console.error("sitemap sin <loc>"); process.exit(1); }
console.log(locs.length + " URLs en sitemap");
' || note "sitemap.xml"

echo "== Estilo de textos listos (informativo) =="
for f in articulos/03-listos/*.md articulos/03-listos/*.json; do
  [ -f "$f" ] || continue
  echo "-- $f"
  bash articulos/revisar.sh "$f"
done

echo "== Vista previa de publicación (--simulate) =="
for f in articulos/03-listos/*.json; do
  [ -f "$f" ] || continue
  node scripts/generate-weekly-article.js --simulate --from-json "$f" >/dev/null || note "simulate $f"
done

echo "== Smoke test: enlaces internos =="
node scripts/smoke-test.mjs || note "smoke-test (enlaces rotos)"
if [ -f "scripts/visual-test.sh" ]; then bash scripts/visual-test.sh || note "visual-test"; fi

if [ "$fail" -ne 0 ]; then
  echo "VERIFICACIÓN FALLIDA."
  exit 1
fi
echo "OK: verificación completada."
