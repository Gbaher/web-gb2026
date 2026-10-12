#!/usr/bin/env node
// Smoke test: enlaces internos de los HTML de la raíz.
// Un href="/ruta" es válido si existe el archivo (con o sin .html) o si vercel.json lo reescribe/redirige.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
const rutasVercel = new Set(
  [...(vercel.rewrites || []), ...(vercel.redirects || [])]
    .map(r => r.source)
    .filter(s => s && !/[:*()]/.test(s))
);
const patrones = [...(vercel.rewrites || []), ...(vercel.redirects || [])]
  .map(r => r.source)
  .filter(s => s && /[:*()]/.test(s))
  .map(s => new RegExp('^' + s.replace(/:[A-Za-z]+\*/g, '.*').replace(/:[A-Za-z]+/g, '[^/]+').replace(/\*/g, '.*') + '$'));

function existe(ruta) {
  if (ruta === '/') return fs.existsSync(path.join(ROOT, 'index.html'));
  const rel = ruta.replace(/^\//, '').replace(/\/$/, '');
  const abs = path.join(ROOT, rel);
  return (
    fs.existsSync(abs) ||
    fs.existsSync(abs + '.html') ||
    fs.existsSync(path.join(abs, 'index.html')) ||
    rutasVercel.has(ruta) ||
    rutasVercel.has('/' + rel) ||
    patrones.some(p => p.test('/' + rel))
  );
}

const rotos = [];
let revisados = 0;
for (const f of fs.readdirSync(ROOT).filter(n => n.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
  for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
    const ruta = m[1];
    if (ruta.startsWith('//')) continue;
    revisados++;
    if (!existe(ruta)) rotos.push(`${f} -> ${ruta}`);
  }
}

console.log(`${revisados} enlaces internos revisados`);
if (rotos.length) {
  console.error('Enlaces rotos:');
  [...new Set(rotos)].forEach(r => console.error('  ' + r));
  process.exit(1);
}
console.log('OK: sin enlaces rotos.');
