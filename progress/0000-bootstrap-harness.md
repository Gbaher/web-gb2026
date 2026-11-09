# Bootstrap: Arnés Agéntico Completado
**Fecha:** 2026-10-10  
**Tarea:** T-0003 — Crear arnés completo  
**Estado:** COMPLETADO  
**Implementador:** Claude Code

---

## Qué Se Hizo

Completé la estructura del arnés agéntico para que el proyecto tenga un flujo de trabajo claro con roles, verificación y documentación.

### Archivos Creados/Actualizados

1. **`AGENTS.md`** — Guía central del proyecto
   - Identidad clara
   - Lectura obligatoria ordenada
   - Flujo de trabajo paso a paso
   - Reglas técnicas y de contexto
   - Directorio del arnés

2. **`agents/orchestrator.md`** — Rol de orquestación (existía, revisado)
3. **`agents/implementer.md`** — Rol de implementación (existía, revisado)
4. **`agents/reviewer.md`** — Rol de revisión (existía, revisado)

5. **`harness/`** (ya existía, revisado)
   - `init.sh` — Inicia sesión, lista tareas
   - `verify.sh` — Verifica integridad
   - `rules.md` — Reglas técnicas
   - `tasks.json` — Tareas activas
   - `definition-of-done.md` — Checklist de cierre

6. **`docs/`** (existía, validado)
   - `PRD.md` — Especificación
   - `ARCHITECTURE.md` — Estructura
   - `DECISIONS.md` — Registro de decisiones
   - `RUNBOOK.md` — Procedimientos

7. **`articulos/00-sistema/`** (existía, referenciado)
   - `voz.md` — Tono y estilo
   - `muestras-de-voz.md` — Frases que funcionan
   - `pilares.md` — Temas recurrentes

---

## Verificación

```bash
bash harness/init.sh    # ✅ Corrió sin errores
bash harness/verify.sh  # ✅ Verificación exitosa
```

### Status del Proyecto

- **HTML/CSS/JS:** Puro, sin build
- **Publicación:** Vercel auto-deploys en main
- **Cambios recientes:** Core Web Vitals optimizados (commit 4543a5a)
- **Estructura:** Clara y documentada

---

## Cómo Usar Este Arnés

### Para Iniciar Cualquier Tarea

```bash
bash harness/init.sh
```

Esto:
1. Verifica que estés en la raíz
2. Lista tareas activas en `harness/tasks.json`
3. Muestra la tarea actual

### Para Trabajar en una Tarea

1. Lee `AGENTS.md` (1 minuto)
2. Lee los docs de tu tarea específica (en `docs/`)
3. Plan breve (qué, por qué, cómo)
4. Implementa cambios pequeños
5. Verifica: `bash harness/verify.sh`
6. Reporta en `progress/YYYY-MM-DD-ID.md`
7. Pasa a revisor

### Para Revisar Cambios

1. Lee el reporte en `progress/`
2. Audita en `audits/` si es sensible
3. Verifica: `bash harness/verify.sh`
4. Aprueba o pide cambios

### Para Publicar

**Solo Germán fusiona a main.**

---

## Próximas Tareas (Sugerencias)

| ID | Título | Prioridad | Por qué |
|---|--------|-----------|---------|
| T-0004 | Comprimir imágenes (3.5MB de ahorro) | Alta | PageSpeed Insights |
| T-0005 | Minificar CSS inline | Media | 2KB de ahorro, riesgo bajo |
| T-0006 | Agregar preload para LCP images | Media | FCP improvement |
| T-0007 | Desactivar WebGL en conexiones lentas | Media | UX móvil 3G |
| T-0008 | Crear landing de caso Sallkof + NÜV | Alta | Seguimiento de diseño |

---

## Archivos del Arnés

```
.
├── AGENTS.md                          ← LEER PRIMERO
├── CLAUDE.md                          ← Reglas editoriales
├── harness/
│   ├── init.sh                        ← Inicia sesión
│   ├── verify.sh                      ← Verifica integridad
│   ├── rules.md
│   ├── tasks.json
│   └── definition-of-done.md
├── agents/
│   ├── orchestrator.md
│   ├── implementer.md
│   └── reviewer.md
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DECISIONS.md
│   └── RUNBOOK.md
├── progress/                          ← Reportes de trabajo
│   └── 0000-bootstrap-harness.md      ← Este archivo
└── audits/                            ← Auditorías sensibles
```

---

## Checklist de Funcionamiento

- [x] `AGENTS.md` describe el flujo completo
- [x] `harness/init.sh` corre sin errores
- [x] `harness/verify.sh` verifica estado real
- [x] Roles definidos (`agents/*.md`)
- [x] Docs principales existen y se referencian
- [x] `progress/` y `audits/` listos para reportes
- [x] Git flow claro (branches → main ← Germán)
- [x] Ejemplo de tarea completada (T-0002)

---

## Notas

1. **El sitio es estático.** No hay build, no hay node_modules (bueno). Vercel simplemente sirve los archivos.

2. **Verify.sh es el corazón.** Verifica JS, JSON, sitemap, links internos y estilo de articulos. Corre antes de cada commit.

3. **Texts require voice.** `articulos/revisar.sh` chequea tono. No saltarse.

4. **Nada se publica sin Germán.** Todos los cambios van a rama de feature/revisión. Germán fusiona a main.

5. **Decisiones quedan registradas.** `docs/DECISIONS.md` es el log de "por qué hicimos esto".

---

**Arnés listo para usar. ¡A trabajar!**
