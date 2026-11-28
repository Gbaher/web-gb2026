# Harness Rules

## Seguridad
- No exponer secretos, tokens ni API keys. No commitear `.env*`.
- No modificar configuración de producción (`vercel.json`, dominios, variables de Vercel) sin autorización.
- No ejecutar scripts destructivos sin explicar el impacto.

## Git
- `git status` antes y después de cambiar.
- Nunca `git add .`. Hay muchos archivos sin seguir ajenos a la tarea.
- Un commit por unidad lógica. Nada se fusiona a `main` sin que Germán lo apruebe.

## Texto
- Todo texto pasa por `./articulos/revisar.sh` y la lista de `articulos/00-sistema/voz.md`.
- Se editan las palabras de Germán, no se reemplazan. No inventar cifras, clientes ni casos.

## Dependencias
- No instalar paquetes sin justificar en `docs/DECISIONS.md`. El sitio no tiene build.

## UI
- No aprobar cambios visuales sin abrir la página real. Revisar móvil y escritorio.
- Los HTML de `bi-NNN-*` se generan con el script. No editarlos a mano salvo corrección puntual.
