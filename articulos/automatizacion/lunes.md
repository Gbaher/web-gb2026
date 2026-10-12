# Lunes: armar el artículo y pedir aprobación

Objetivo: convertir el post que Germán eligió el fin de semana en la nota web completa, y dejarla lista para que la apruebe con un clic. El post sale en LinkedIn cuando la nota está publicada.

## Antes de empezar

Lee `CLAUDE.md`, `articulos/00-sistema/voz.md`, `articulos/00-sistema/muestras-de-voz.md`, `articulos/00-sistema/pilares.md` y `articulos/00-sistema/plantilla-articulo.md`. Toma como ejemplo terminado `articulos/04-publicados` o, si está vacío, `articulos/02-en-desarrollo/2026-09-marca-agentica.md` con su `.json`.

Calcula la semana de hoy con el comando de `articulos/automatizacion/README.md`.

Si ya existe en GitHub una propuesta de cambio abierta o fusionada con la etiqueta `articulo-semanal` y el título `Artículo de la semana <semana>`, termina sin hacer nada.

## 1. Encontrar la elección

Busca en Gmail el hilo con el asunto `Elige tu post · semana <semana>`. Los mensajes posteriores al primero son la respuesta de Germán. Si respondió varias veces, júntalas en orden.

- Si la respuesta nombra un número (1, 2 o 3), ese es el post elegido. Recupera el texto de las tres propuestas de `articulos/01-ideas/propuestas/<semana>.md` en la rama `propuestas/<semana>` (o del primer mensaje del hilo si la rama no existe). Lo que Germán pida cambiar en la misma respuesta se aplica al post, con sus palabras. Si dictó una nota o contó un caso, es material nuevo: pégalo en "Transcripción" sin corregir.
- Si la respuesta es ambigua (no dice cuál, o elige dos), no adivines. Envía a gbaher03@gmail.com un correo con el asunto `Aclara tu elección · semana <semana>` con una sola pregunta, y termina.
- Si no hay respuesta, mira si en `articulos/03-listos` hay un artículo con `estado: "listo"` y su `.json`. Si lo hay, sáltate al paso 4 con ese artículo.
- Si no hay nada de lo anterior, envía a gbaher03@gmail.com un correo con el asunto `Sin elección · semana <semana>` que diga en dos frases que esta semana no se publica y que las propuestas se vuelven a ofrecer el viernes. Termina.

## 2. Escribir la nota web

La nota web es la versión completa del post elegido. Ni más ni menos ideas que las que Germán dio.

1. Crea `articulos/02-en-desarrollo/AAAA-MM-slug.md` desde la plantilla. En el brief pon la idea del banco y la tesis del post. En "Transcripción" pega el post elegido y, aparte, todo lo que Germán añadió en su respuesta, sin corregir.
2. Escribe el borrador de 600 a 1000 palabras desarrollando el post. Conserva sus frases, analogías y expresiones, y las de `muestras-de-voz.md`. Nada de ideas, cifras, clientes ni ejemplos que Germán no haya dicho. Si algo hace falta para que el texto se entienda, puedes agregar una frase de enlace, pero anótala en "Notas y fuentes" como agregada por Claude. Si el material no alcanza para 600 palabras, escribe menos. No rellenes.
3. El post de LinkedIn y la nota deben decir lo mismo. La nota no puede contradecir ni cambiar la tesis del post.
4. Corre `./articulos/revisar.sh` sobre el `.md` y corrige hasta que no marque nada, o hasta que lo que marque esté justificado en contexto.
5. Agrega las expresiones nuevas de Germán a `articulos/00-sistema/muestras-de-voz.md`.

## 3. Preparar la versión web y LinkedIn

1. Crea el `.json` con el mismo nombre que el `.md`, con la estructura de `2026-09-marca-agentica.json`. Usa `slug` corto (dos a cuatro palabras). Cada subtítulo del borrador es una sección `text`. El `lead` es el primer párrafo. El `quote` es la frase más de Germán del texto, tal como la dijo. `takeaways` y `faq` salen del mismo contenido, con sus palabras. El último párrafo, con la invitación al Brand Diagnosis, va en `closing_paragraph`.
2. Corre `./articulos/revisar.sh` sobre el `.json`.
3. Escribe en el `.md` una sección `## LinkedIn` con el post elegido, con los cambios que pidió Germán y sin reescribirlo por tu cuenta. Termina con `{url}`, que se reemplaza por el enlace al publicar. Pásalo por la guía de voz.

## 4. Generar y proponer

1. Crea la rama `semana/<semana>` desde `main` actualizado.
2. Corre `node scripts/generate-weekly-article.js --from-json <ruta del .json>`. Genera la página, la tarjeta en `brand-intelligence.html`, `vercel.json`, `sitemap.xml` y el registro.
3. Mueve el `.md` y el `.json` a `articulos/04-publicados/`. En el `.md` pon `estado: "publicado"`, la `fecha-publicacion` de hoy y la `url` que imprimió el generador (con https://www.germanbaher.com adelante).
4. En `articulos/01-ideas/banco-de-ideas.md`, mueve la idea a una sección "Publicadas" con la fecha y el enlace.
5. Haz commit y push de la rama. Abre una propuesta de cambio (no borrador) contra `main`:
   - Título: `Artículo de la semana <semana>: <título>`
   - Etiqueta: `articulo-semanal`
   - Cuerpo: qué contiene, los pendientes o frases agregadas por Claude que Germán tiene que mirar, el texto de LinkedIn completo, y la frase "Al aprobar y fusionar esta propuesta, el artículo se publica en germanbaher.com. El post de LinkedIn sale en la siguiente revisión de días hábiles."

## 5. Avisar a Germán

Envía a gbaher03@gmail.com un correo con el asunto `Listo para aprobar · semana <semana> · <título>`:

- El enlace a la propuesta de cambio y cómo aprobarla: abrir el enlace, revisar la vista previa de Vercel que aparece en la propuesta y tocar "Merge pull request".
- Las frases agregadas por Claude o los pendientes, si los hay.
- El texto de LinkedIn, para que lo lea antes.

Termina con un resumen de una línea.
