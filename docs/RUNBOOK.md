# Runbook

| Qué | Comando |
|---|---|
| Chequeo inicial | `bash harness/init.sh` |
| Verificación final | `bash harness/verify.sh` |
| Revisar estilo de un texto | `./articulos/revisar.sh ruta/al/archivo.md` (o `.json`) |
| Vista previa de publicación | `node scripts/generate-weekly-article.js --simulate --from-json archivo.json` |
| Publicar (genera página e índices) | `node scripts/generate-weekly-article.js --from-json archivo.json` |

Publicar solo cuando Germán lo pidió. Al fusionar a `main`, Vercel despliega.
`.simulate-output/` está ignorado por git.

Smoke test de enlaces internos: `node scripts/smoke-test.mjs`. Se ejecuta dentro de `verify.sh`.
