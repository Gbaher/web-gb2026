# Decisions

## 2026-10-01 - Instalar arnés agéntico mínimo
**Contexto:** el repo ya tenía sistema editorial y automatización semanal, pero sin verificación única ni memoria de progreso.
**Decisión:** añadir `AGENTS.md`, `harness/`, `agents/`, `progress/`, `audits/` según la guía de arnés. `CLAUDE.md` se mantiene como fuente de las reglas editoriales.
**Motivo:** verificación repetible y memoria fuera del chat.
**Alternativas descartadas:** reemplazar `CLAUDE.md` por `AGENTS.md`. Se duplicarían las reglas de voz.
**Impacto:** `bash harness/verify.sh` es el cierre estándar de cualquier tarea.
