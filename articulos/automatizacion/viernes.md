# Viernes: tres posts para elegir

Objetivo: que Germán reciba por correo tres posts de LinkedIn ya escritos para la semana que viene, para elegir uno respondiendo el correo.

## Antes de empezar

Lee `CLAUDE.md`, `articulos/00-sistema/voz.md`, `articulos/00-sistema/muestras-de-voz.md`, `articulos/00-sistema/pilares.md` y `articulos/01-ideas/banco-de-ideas.md`. Lee también las secciones `## LinkedIn` de los últimos cuatro archivos de `articulos/04-publicados` para no repetir ángulo ni arranque.

## Pasos

1. Calcula la semana del próximo lunes (hoy más 3 días) con el comando de `README.md`. Esa es la semana del correo.

2. Busca en Gmail si ya existe un correo con el asunto `Elige tu post · semana <esa semana>`. Si existe, termina sin hacer nada.

3. Elige tres ideas distintas del banco:
   - Primero las de "Prioridad alta", después el "Pozo de ideas".
   - Descarta las que ya tengan archivo en `02-en-desarrollo`, `03-listos` o `04-publicados`, y las que se propusieron en un correo `Elige tu post ·` de las últimas 12 semanas (búscalas en Gmail).
   - Las tres tienen que ser de pilares distintos cuando sea posible. Mira qué pilares tienen menos artículos en `04-publicados`.
   - Cada idea tiene que poder crecer a una nota web de 600 a 1000 palabras con su tesis. Si no puede, elige otra.

4. Escribe un post por idea. Entre 120 y 220 palabras. Reglas, además de todo `voz.md`:
   - Parte de las frases, analogías y expresiones reales de `muestras-de-voz.md`. Úsalas tal cual, no las parafrasees en lenguaje de redactor. Cada post debe llevar al menos una frase tomada de ahí.
   - Primera persona y opinión directa. Primera línea con la escena o la frase que más engancha, nunca con una definición ni con el contexto del mercado.
   - Nada de casos, clientes, cifras, países ni anécdotas que Germán no haya contado antes. Si la idea pide un caso, el post se sostiene con la opinión y se deja una pregunta para que Germán lo aporte (paso 6).
   - Párrafos de una a tres frases, ritmo desigual, sin emojis y como mucho dos hashtags al final.
   - Termina con una línea de invitación a leer la nota completa y con `{url}`, que se reemplaza al publicar.
   - Corre `./articulos/revisar.sh` sobre cada post (guárdalos en un archivo temporal con la sección `## Borrador`) y corrige hasta que no marque nada, o hasta que lo marcado esté justificado. Lee cada uno en voz alta mentalmente: si suena a post de LinkedIn de manual, reescríbelo.

5. Guarda las tres propuestas en una rama `propuestas/<semana>` en `articulos/01-ideas/propuestas/<semana>.md`, con el número, la idea del banco y el texto de cada post. Haz commit y push de la rama. No abras propuesta de cambio. Así el lunes se recuperan sin depender del correo.

6. Envía el correo con el conector de Gmail a gbaher03@gmail.com:
   - Asunto: `Elige tu post · semana <semana>`
   - Cuerpo en texto simple y en este orden:
     - Un saludo corto, sin fórmulas.
     - Las tres propuestas, numeradas 1, 2 y 3. De cada una: el título de trabajo, la tesis en una línea, el post completo y, debajo, una pregunta opcional si hay un caso real que mejoraría el texto.
     - Las instrucciones, tal cual: "Responde este correo con el número que eliges. Si quieres cambiar algo, dilo en la misma respuesta o dicta una nota corta. Si no eliges nada antes del domingo en la noche, esta semana no sale nada. El lunes en la mañana te llega el artículo armado para aprobar y el post sale en LinkedIn cuando lo apruebes."
   - El correo lo lee Germán, así que aplica también la guía de voz. Nada de rayas, nada de entusiasmo de vendedor.

7. Termina con un resumen de una línea: semana, las tres ideas elegidas y si el correo salió.
