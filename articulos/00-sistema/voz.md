# Cómo escribe Germán

Un artículo tiene que sonar a Germán explicándole algo a un cliente, sentados a una mesa. Si al leerlo en voz alta suena a folleto, a post de LinkedIn o a respuesta de chatbot, hay que reescribirlo.

Esta guía tiene dos partes. Primero, lo que delata que un texto lo escribió una IA. Después, cómo conseguir que el texto suene a Germán y no a cualquiera.

## Lo que delata a la IA

Revisa cada borrador contra esta lista. El script `articulos/revisar.sh` detecta automáticamente varias de estas marcas, pero no todas. La lectura humana sigue siendo necesaria.

### Puntuación

- Rayas y guiones largos (— y –). No se usan nunca. Tampoco el guion corto como pausa en medio de una frase.
- Dos puntos para anunciar un remate. "La razón es simple: nadie te recuerda." Se escribe en dos frases o se reescribe.
- Punto y coma. Casi nadie lo usa al hablar.
- Títulos con mayúscula en cada palabra. Se escribe "Cómo construir una marca humana".
- Negritas y comillas para dar énfasis en medio del texto.
- Emojis.

### Frases

- La fórmula "no es X, es Y" y todas sus variantes ("no se trata de X, sino de Y", "más que X, es Y"). Es la marca más reconocible de la IA. Como mucho una vez por artículo, y solo si es la tesis.
- Grupos de tres. Tres adjetivos, tres ejemplos, tres frases cortas seguidas. Si hay que enumerar, que sean dos, o cuatro, o los que realmente sean.
- Frases de remate al final de cada párrafo, como si fueran citas para compartir. Una en todo el texto está bien. Una por párrafo es un tic.
- Paralelismos simétricos del tipo "Menos ruido. Más claridad."
- Preguntas que el propio texto responde enseguida. "¿El resultado? Una marca que nadie recuerda."
- Frases larguísimas encadenadas con comas y gerundios.
- Todas las frases del mismo largo. Una persona real mezcla frases cortas con otras más largas sin pensarlo.

### Repetición

- Decir la misma idea tres veces con otras palabras. La IA la anuncia en la introducción, la explica en el cuerpo y la resume en el cierre. Con decirla una vez bien, alcanza.
- Repetir la tesis como estribillo en cada sección.
- Usar la misma palabra fuerte muchas veces. Si "conectar" aparece seis veces, sobran cuatro.
- Anunciar lo que viene. "En este artículo vamos a ver..." Directamente se cuenta.
- Cerrar con un resumen de lo que ya se dijo.

### Estructura

- Todo en viñetas. Un artículo se escribe en párrafos. Las listas quedan para pasos concretos.
- Listas con una palabra en negrita y dos puntos al inicio de cada punto.
- Un subtítulo cada tres párrafos. Un artículo corto puede no tener ninguno.
- Arrancar con el contexto del mercado o con una definición.
- Terminar con una moraleja o una frase inspiradora.

### Vocabulario

Si aparece alguna de estas, se cambia la frase entera, no solo la palabra.

- En el mundo actual, en la era digital, hoy más que nunca, en un mundo cada vez más
- Sumérgete, descubre, desbloquea, potencia, impulsa, eleva, navega
- Clave, crucial, fundamental, esencial
- Auténtico, genuino, transformador, poderoso
- Cabe destacar, es importante mencionar, sin duda, sin lugar a dudas
- En definitiva, en resumen, en conclusión, al final del día
- Sinergia, disruptivo, 360, aportar valor, llevar al siguiente nivel
- Viaje, cuando se usa para hablar de un proceso

### Tono

- Entusiasmo de vendedor. Nada es "increíble" ni "apasionante".
- Halagar al lector. "Si estás leyendo esto, ya diste el primer paso."
- Dudar de todo. Llenar el texto de "podría", "quizás", "en muchos casos". Germán tiene opinión y la dice.
- Neutralidad de enciclopedia. Si el texto no toma postura, no sirve.

## Cómo suena Germán

La forma más rápida de sonar a Germán es partir de cómo habla, no de cómo escribe. Al escribir todos nos ponemos más formales. Al hablar decimos lo que pensamos.

Lo que sí va:

- Primera persona. "Yo", "me pasó", "lo vi con una clienta".
- Empezar una frase con "Y", "Pero" o "Entonces".
- Frases que suenan dichas en voz alta, aunque no sean perfectas.
- Anécdotas reales de veinte años de trabajo, con industria, país y situación.
- Opinar sin pedir permiso.
- Ritmo desigual. Una frase de cuatro palabras al lado de otra de treinta.
- Alguna expresión coloquial cuando sale natural.

Las expresiones, muletillas y formas de explicar propias de Germán se van juntando en `muestras-de-voz.md`. Ese archivo es la referencia más importante de todo el sistema. Cuanto más material real tenga, más se va a parecer el texto a él.

## El método: de la voz al texto

1. Graba una nota de voz de cinco a diez minutos contando la idea como se la contarías a un cliente. Sin guion.
2. Transcribe la grabación y pégala en la sección "Transcripción" del artículo.
3. El borrador se arma a partir de esa transcripción. Se ordena, se corta lo que sobra y se aclara lo que quedó confuso. Tus frases se quedan tal cual las dijiste siempre que se entiendan.
4. Corre `./articulos/revisar.sh ruta/del/articulo.md` y corrige lo que marque.
5. Lee el texto en voz alta. Donde te trabes o donde no suene a ti, se reescribe.

Cuando Claude ayude con un borrador, su trabajo es editar tu transcripción, no escribir desde cero. Si no hay transcripción, lo primero es pedirla.
