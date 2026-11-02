# Arnés Agéntico — germanbaher.com

## Identidad del proyecto

**Repositorio:** web-gb2026  
**Sitio:** germanbaher.com (Germán Baher — Brand Strategist)  
**Stack:** HTML + CSS + JS puro (sin build). APIs en `api/`. Alojado en Vercel.  
**Publicación:** al fusionar a `main`, Vercel auto-despliega.

**Lo que más se trabaja:**
- Artículos de Brand Intelligence (`articulos/`)
- Páginas multiidioma (ES/EN/FR)
- Rutinas de automatización semanal

---

## Regla Base

**Entiende antes de tocar. Verifica antes de cerrar. Nada se publica sin que Germán fusione.**

---

## Lectura Obligatoria (En Orden)

1. **`CLAUDE.md`** — Voz, tono y reglas editoriales (OBLIGATORIO para textos)
2. **`docs/PRD.md`** — Qué es el proyecto, alcance
3. **`docs/ARCHITECTURE.md`** — Estructura de carpetas y cómo funciona
4. **`harness/rules.md`** — Reglas técnicas de este arnés
5. **`harness/tasks.json`** — Tareas activas y completadas
6. **`harness/definition-of-done.md`** — Checklist para cierres

**Para artículos, además:**
- `articulos/00-sistema/voz.md` — Tono y estilo de Germán
- `articulos/00-sistema/muestras-de-voz.md` — Frases y giros que funcionan
- `articulos/00-sistema/pilares.md` — Temas recurrentes

---

## Flujo de Trabajo

```
1. bash harness/init.sh                           # Inicia sesión
2. Plan breve (qué harás y por qué)              # Antes de tocar archivos
3. Cambios (pequeños, enfocados)                 # Un cambio = una idea
4. bash harness/verify.sh                         # Verifica integridad
5. Reporte: progress/YYYY-MM-DD-ID-tarea.md     # Documenta el trabajo
6. Revisión por reviewer (agents/reviewer.md)     # Aprobación antes de publicar
7. git push a rama de revisión                    # Nunca directo a main
8. Germán aprueba y fusiona                       # El gatekeeper final
```

---

## Reglas de Contexto

| Regla | Por qué |
|-------|---------|
| Busca en `docs/`, `progress/`, `audits/` antes de investigar de nuevo | Contexto ya existe; no redescubrirs |
| Lee solo el archivo que necesitas, no el repo completo | Eficiencia |
| Las rutinas de `articulos/automatizacion/` tienen prioridad | Están automatizadas; no bloquearlas |
| No hables del task manager; es interno | No es para usuarios |

---

## Reglas de Implementación

| Prohibido | Por qué | Alternativa |
|-----------|---------|------------|
| `git add .` | Hay archivos ajenos; riesgo de commit accidental | Agrega por nombre: `git add harness/tasks.json` |
| Refactor sin pedir | Scope creep; rompe lo que funciona | Si necesitas refactorizar, documenta en DECISIONS.md |
| Dependencias nuevas sin justificar | El sitio es puro; cada dep es un riesgo | Escribe la razón en DECISIONS.md y espera aprobación |
| "Funciona" sin probar | Puede romperse en producción | Prueba en navegador (móvil + escritorio) |
| Inventar cifras, clientes, casos | Es contenido de Germán; se revende | Pedir transcripción o datos verificados |

---

## Roles

**Orquestador** (`agents/orchestrator.md`)  
→ Planifica tareas, diseña flujos, actualiza DECISIONS.md

**Implementador** (`agents/implementer.md`)  
→ Hace los cambios, verifica, reporta en progress/

**Revisor** (`agents/reviewer.md`)  
→ Aprueba antes de publicar, audita cambios sensibles

---

## Comandos Clave

```bash
bash harness/init.sh          # Inicia arnés, lista tareas activas
bash harness/verify.sh        # Verifica integridad (sintaxis, JSON, links)
bash articulos/revisar.sh <archivo.md>  # Estilo de Brand Intelligence
node scripts/generate-weekly-article.js --simulate --from-json <archivo.json>
```

---

## Directorios del Arnés

```
harness/                 # Definición del arnés
├── init.sh             # Inicia sesión, lista tareas
├── verify.sh           # Verifica integridad (JS, JSON, sitemap, links)
├── rules.md            # Reglas técnicas
├── tasks.json          # Tareas activas/completadas
└── definition-of-done.md  # Checklist de cierre

agents/                 # Definición de roles
├── orchestrator.md     # Planificador
├── implementer.md      # Constructor
└── reviewer.md         # Aprobador

progress/              # Reportes de trabajo (YYYY-MM-DD-ID-tarea.md)
audits/                # Auditorías de cambios sensibles
docs/                  # Documentación del proyecto
├── PRD.md            # Product Requirements Document
├── ARCHITECTURE.md    # Cómo funciona el sitio
├── DECISIONS.md       # Decisiones técnicas registradas
└── RUNBOOK.md         # Procedimientos operacionales

articulos/            # Brand Intelligence (lo más importante)
├── 00-sistema/       # Voz, pilares, plantilla
├── 01-ideas/         # Banco de ideas
├── 02-borradores/    # En redacción
├── 03-listos/        # Listos para publicar
└── automatizacion/   # Scripts de rutinas semanales
```

---

## Checklist de Inicio

Antes de empezar cualquier tarea:

- [ ] `bash harness/init.sh` sin errores
- [ ] Leíste `CLAUDE.md` (si es texto) + `docs/ARCHITECTURE.md`
- [ ] Conoces el ID de la tarea en `harness/tasks.json`
- [ ] Tienes rama de feature o rama de revisión
- [ ] Git status limpio (nada sin commitear)
