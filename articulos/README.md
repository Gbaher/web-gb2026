# Sistema editorial de germanbaher.com

Aquí las ideas se trabajan hasta convertirse en artículos para la web. Cada artículo tiene que acercar a alguien a pedir un Brand Diagnosis.

## Cómo se mueve una idea

```
01-ideas  →  02-en-desarrollo  →  03-listos  →  04-publicados
```

**01-ideas.** Todo empieza en `banco-de-ideas.md`. Una idea entra con una tesis de una línea. Si no puedes escribir la tesis, todavía no es una idea, es un tema.

**02-en-desarrollo.** Cuando una idea está madura, se crea un archivo propio copiando `00-sistema/plantilla-articulo.md`. Primero se graba una nota de voz contando la idea y el borrador se arma desde esa transcripción.

**03-listos.** Texto revisado contra la guía de voz, con título, descripción y llamada a la acción definidos. Esperando fecha.

**04-publicados.** Lo que ya está en la web. Se deja la fecha real y la URL para poder medir y reutilizar.

Para mover un artículo de etapa basta con mover el archivo de carpeta y actualizar el campo `estado`.

## Nombres de archivo

`AAAA-MM-slug-del-articulo.md`

Ejemplo: `2026-10-tu-marca-no-es-tu-logo.md`

El slug es el mismo que tendrá la URL en la web. Corto, en minúsculas, sin tildes.

## La carpeta 00-sistema

Aquí están las reglas del juego. Se leen antes de escribir.

| Archivo | Para qué sirve |
|---|---|
| `pilares.md` | Los territorios sobre los que escribimos y por qué |
| `voz.md` | Cómo suena Germán y qué delata un texto escrito por IA |
| `muestras-de-voz.md` | Transcripciones y textos reales de Germán, la referencia de su forma de hablar |
| `plantilla-articulo.md` | La estructura base de cada artículo |

## Revisar un borrador

```
./articulos/revisar.sh articulos/02-en-desarrollo/2026-10-mi-articulo.md
```

Marca las rayas, las fórmulas repetidas y las palabras típicas de la IA. Después hay que leerlo en voz alta igual.

## Automatización semanal

Cada viernes llega un correo con el tema y las preguntas, el lunes se arma el artículo con la respuesta dictada, y al aprobarlo se publica en la web y en LinkedIn. Todo está explicado en `automatizacion/README.md`.

Cada artículo tiene dos archivos con el mismo nombre. El `.md` es donde se trabaja y el `.json` es la versión que se publica. Para ver cómo queda sin publicar:

```
node scripts/generate-weekly-article.js --from-json articulos/02-en-desarrollo/2026-09-marca-agentica.json --simulate
```

## Ritmo sugerido

Un artículo pilar al mes y dos cortos. Si hay que elegir, conviene publicar menos y que cada texto esté bien trabajado.
