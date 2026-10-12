# Definition of Done

Una tarea está terminada solo si:
1. Cumple sus criterios de aceptación en `harness/tasks.json`.
2. `bash harness/verify.sh` pasa, o los fallos preexistentes están anotados en el reporte.
3. Si hay texto: pasó `revisar.sh` y la lista de `voz.md`, y las marcas restantes están justificadas.
4. Si hay página nueva o publicación: la vista previa `--simulate` se revisó.
5. El diff se revisó y solo contiene archivos de la tarea.
6. Reporte guardado en `progress/` y estado actualizado en `tasks.json`.
7. El revisor aprobó (cambios al sitio publicado, a `vercel.json` o a las automatizaciones requieren auditoría en `audits/`).
8. Si cambia algo que se publica, queda como propuesta de cambio para que Germán la fusione.
