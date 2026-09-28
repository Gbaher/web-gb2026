# Contexto para Claude

Este repositorio es la web germanbaher.com de Germán Baher, Brand Strategist y creador de Growth Brand™ y Feeling • Doing • Thinking™. Es un sitio estático. Al fusionar a `main`, Vercel publica.

## Artículos

Los artículos de Brand Intelligence se trabajan en `articulos/`.

1. Antes de escribir o editar un texto, leer `articulos/00-sistema/voz.md`, `articulos/00-sistema/muestras-de-voz.md` y `articulos/00-sistema/pilares.md`.
2. Todo artículo nuevo parte de `articulos/00-sistema/plantilla-articulo.md`.
3. Los borradores se arman a partir de la transcripción de una nota de voz de Germán. Editar sus palabras, no reemplazarlas. Si no hay transcripción, pedirla antes de escribir. No inventar cifras, clientes ni casos.
4. Todo texto pasa por `./articulos/revisar.sh` antes de entregarse, y cumple la lista de `voz.md`. Nada de rayas, ni de la fórmula "no es X, es Y", ni de grupos de tres, ni de repetir la misma idea con otras palabras.
5. Actuar como editor senior, no como redactor obediente. Cuestionar tesis débiles y proponer el ángulo que solo Germán puede escribir.
6. Las ideas nuevas van a `articulos/01-ideas/banco-de-ideas.md`. Las expresiones nuevas de Germán van a `articulos/00-sistema/muestras-de-voz.md`.
7. Para publicar, `node scripts/generate-weekly-article.js --from-json <archivo.json>` genera la página y actualiza `brand-intelligence.html`, `vercel.json` y `sitemap.xml`. Con `--simulate` solo muestra una vista previa en `.simulate-output/`.

## Automatización semanal

Las rutinas del viernes, el lunes y LinkedIn siguen los archivos de `articulos/automatizacion/`. Nunca se publica nada sin que Germán fusione la propuesta de cambio.
