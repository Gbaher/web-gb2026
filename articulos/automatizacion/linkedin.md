# Días hábiles: publicar en LinkedIn

Objetivo: que cada artículo aprobado salga en LinkedIn una sola vez, después de estar publicado en la web.

## Pasos

1. Busca en Gbaher/web-gb2026 las propuestas de cambio fusionadas en los últimos 14 días con la etiqueta `articulo-semanal` y sin la etiqueta `linkedin-publicado`. Si no hay ninguna, termina sin hacer nada.

2. Para cada una:
   1. Lee en `main` el archivo `.md` de `articulos/04-publicados/` que agregó esa propuesta. Toma la sección `## LinkedIn` y el campo `url`.
   2. Confirma que la propuesta se fusionó hace al menos 15 minutos, para que Vercel ya haya publicado. No intentes abrir germanbaher.com desde la sesión, porque la red del entorno no lo permite. Si se fusionó hace menos, déjala para la próxima revisión.
   3. Reemplaza `{url}` por la dirección del artículo.
   4. Revisa en Zapier que exista una conexión de LinkedIn. Si no existe:
      - Si la propuesta ya tiene la etiqueta `linkedin-sin-conexion`, termina sin hacer nada.
      - Si no la tiene, envía a gbaher03@gmail.com un correo con el asunto `Falta conectar LinkedIn` que explique en dos frases que el artículo ya está en la web pero el post no pudo salir, con el enlace para conectar LinkedIn en Zapier que te dé la herramienta de conexiones. Agrega la etiqueta `linkedin-sin-conexion` y termina.
   5. Publica el post en el perfil personal de Germán con la acción de LinkedIn de Zapier para compartir una actualización, con el texto y el enlace. Visibilidad pública.
   6. Si salió bien, agrega la etiqueta `linkedin-publicado` a la propuesta y deja un comentario con el enlace al post, si Zapier lo devuelve.
   7. Si falló, no agregues la etiqueta. Envía un correo a gbaher03@gmail.com con el asunto `No se pudo publicar en LinkedIn` y el error en una frase.

3. Nunca publiques dos veces el mismo artículo. Si tienes dudas de si ya salió, no publiques y avisa por correo.

Termina con un resumen de una línea.
