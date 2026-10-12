# Automatización semanal

Cada semana sale un post en LinkedIn y una nota completa en germanbaher.com, con el post enlazando a la nota. Todo es automático, excepto dos cosas que hace Germán: elegir uno de tres posts respondiendo un correo y aprobar la nota web.

## La semana

| Cuándo | Qué pasa | Instrucciones |
|---|---|---|
| Viernes en la mañana | Le llega a Germán un correo con tres posts de LinkedIn escritos con sus frases, para elegir uno | `viernes.md` |
| Fin de semana | Germán responde el correo con el número que elige y, si quiere, con cambios o una nota dictada | |
| Lunes en la mañana | Se arma la nota web completa a partir del post elegido, se revisa y se abre una propuesta de cambio en GitHub. Germán recibe un correo con el enlace | `lunes.md` |
| Cuando Germán aprueba | Al fusionar la propuesta, Vercel publica la nota en la web | |
| Días hábiles a media mañana | Si hay una nota aprobada que todavía no salió en LinkedIn, se publica el post con el enlace a la nota | `linkedin.md` |

Las tres tareas son rutinas de Claude Code programadas en la cuenta de Germán. Cada rutina abre una sesión nueva, clona este repositorio y sigue el archivo de instrucciones que le corresponde. Para cambiar cómo funciona un paso basta con editar su archivo aquí.

## Reglas que no se rompen

- Nunca se publica nada sin que Germán apruebe la propuesta de cambio.
- Los posts y la nota se escriben con las frases y expresiones de Germán (`muestras-de-voz.md`). Si no respondió el correo, esa semana no sale nada.
- Un post nunca sale sin que Germán haya elegido su número y sin que la nota web esté publicada.
- No se inventan cifras, clientes, casos ni citas.
- Todo texto pasa por `articulos/revisar.sh` antes de proponerse.

## Datos fijos

- Correo de Germán: gbaher03@gmail.com
- Repositorio de la web: Gbaher/web-gb2026. Al fusionar a `main`, Vercel publica en https://www.germanbaher.com
- Asunto del correo del viernes: `Elige tu post · semana AAAA-WNN`
- Asunto del correo del lunes: `Listo para aprobar · semana AAAA-WNN · Título`
- Etiquetas de GitHub: `articulo-semanal` en cada propuesta del lunes, `linkedin-publicado` cuando ya salió el post, `linkedin-sin-conexion` si no se pudo publicar porque LinkedIn no está conectado en Zapier
- La semana se identifica con el formato ISO, por ejemplo `2026-W41`. Para calcularla: `node -e "const d=new Date(process.argv[1]||Date.now());const t=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()));t.setUTCDate(t.getUTCDate()+3-((t.getUTCDay()+6)%7));const w=1+Math.round(((t-new Date(Date.UTC(t.getUTCFullYear(),0,4)))/864e5-3+((new Date(Date.UTC(t.getUTCFullYear(),0,4)).getUTCDay()+6)%7))/7);console.log(t.getUTCFullYear()+'-W'+String(w).padStart(2,'0'))" AAAA-MM-DD`
