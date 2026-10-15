#!/usr/bin/env bash
# Chequeo previo a tocar nada. Falla si falta la estructura mínima.
set -euo pipefail

echo "== Harness init =="

if [ ! -f "AGENTS.md" ]; then
  echo "ERROR: No se encontró AGENTS.md. Ejecuta desde la raíz del proyecto."
  exit 1
fi

required_paths=(
  "CLAUDE.md"
  "docs/PRD.md"
  "docs/ARCHITECTURE.md"
  "harness/tasks.json"
  "harness/rules.md"
  "harness/definition-of-done.md"
  "articulos/revisar.sh"
  "articulos/00-sistema/voz.md"
  "scripts/generate-weekly-article.js"
  "vercel.json"
  "sitemap.xml"
  "progress"
  "audits"
)
for path in "${required_paths[@]}"; do
  if [ ! -e "$path" ]; then
    echo "ERROR: Falta $path"
    exit 1
  fi
done

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: node no está instalado."
  exit 1
fi
echo "node $(node -v)"

echo "== Git =="
git branch --show-current
git status --short | head -20
echo "(solo las primeras 20 líneas)"

if [ -d "node_modules" ]; then
  echo "node_modules presente."
else
  echo "AVISO: node_modules no existe. Solo hace falta si un script lo importa."
fi

echo ""
echo "== Tareas Activas =="
node -e "
const fs = require('fs');
try {
  const t = JSON.parse(fs.readFileSync('./harness/tasks.json', 'utf8'));
  const active = t.tasks.find(x => x.id === t.active_task);
  if (active) {
    console.log('🔴 ACTIVA: [' + active.id + '] ' + active.title);
    console.log('   ' + active.description);
  }
  console.log('');
  const pending = t.tasks.filter(x => x.status === 'pending').length;
  const inprog = t.tasks.filter(x => x.status === 'in_progress').length;
  console.log('📋 Pendientes: ' + pending + ' | ⏳ En progreso: ' + inprog);
} catch(e) {
  console.log('(No se puede leer tasks.json)');
}
" 2>/dev/null || true

echo ""
echo "✓ OK: estructura mínima del arnés verificada."
echo ""
echo "Próximos pasos:"
echo "  1. Lee AGENTS.md"
echo "  2. Elige tarea en harness/tasks.json"
echo "  3. bash harness/verify.sh"
