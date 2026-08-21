# Sallkof Industrias + NÜV — Corporate & Consumer Site

Date: 2026-08-21
Status: Approved for planning

## Summary

New standalone React/Next.js site living at `sallkof-nuv/` inside the
`web_gb2026` repo, unrelated to the existing static Germán Baher
personal site. Serves two audiences via a portal bifurcation:

- **Sallkof Industrias** (B2B): manufacturing/maquila partner site,
  trust-building, ends in an interactive 3-step wizard that qualifies
  a lead and routes them to "Agenda tu visita a la planta."
- **NÜV by Sallkof** (B2C): consumer wellness brand, 4 product
  verticals (Alma / Aura / Armo / Abra), backed by a "Sallkof Lab"
  trust seal.

## Non-goals (this pass)

- No backend/lead-capture wiring — wizard CTA is UI-only (styled link,
  no submission).
- No touching the existing static site at repo root.
- No real photography pipeline — NÜV cards use real product photos
  supplied by the user (paths TBD at implementation time) or, absent
  those, an icon/illustration placeholder system. Sallkof plant
  imagery uses the icon/illustration system.

## Tech stack

- Next.js (App Router), TypeScript, Tailwind CSS.
- Framer Motion for microinteractions (already a workspace dependency
  at repo root; add to the new app's own `package.json`).
- New app is self-contained: own `package.json`, own `tailwind.config`,
  own deploy target. Does not modify root `package.json` or any
  existing HTML file.

## Design tokens

- `petroleo` — #0C231E (primary/corporate, deep petroleum green)
- `offwhite` — #F6F6F7 (background, avoids clinical white)
- `salvia` — sage green accent
- Vertical colors (sourced from real NÜV packaging, confirmed by user
  over brief's original guesses):
  - **Alma** — verde salvia (salud base, magnesio/vitaminas)
  - **Aura** — azul (movimiento, colágenos)
  - **Armo** — púrpura (energía inteligente, proteína/creatina)
  - **Abra** — naranja (nutrición especializada/batidos)
- Typography: DM Sans via `next/font/google`. Black/Bold for
  headings, Regular for body, generous tracking/line-height.
- Aesthetic: minimalist, spacious, rounded cards, soft shadows, fluid
  transitions.

## Routes & information architecture

- `/` — Portal (split-screen bifurcation). Two large clickable panels:
  "Empresas y Emprendedores" → `/sallkof`, "Consumidores" → `/nuv`.
  Panels expand slightly on hover; full-bleed on mobile stacked
  vertically.
- `/sallkof` — B2B page. Sections reached via smooth-scroll anchor
  nav: Hero → Wizard → (implicit) trust content → CTA.
- `/nuv` — B2C page. Hero → Seal banner → 4 vertical cards → CTA.

Both `/sallkof` and `/nuv` are single scrollable pages (anchor-nav
SPA feel within the route), not further sub-paginated.

## Components

**Shared**
- `Nav` — logo + route switcher (Sallkof ↔ NÜV ↔ home), sticky,
  transparent-to-solid on scroll.
- `Footer` — standard site footer, contact/legal.
- `SealBanner` — "Respaldado por la precisión y tecnología de Sallkof
  Lab," used at top of `/nuv`.

**Portal (`/`)**
- `PortalHero` — split-screen, two `PortalPanel` components (B2B/B2C),
  hover state raises elevation + subtle scale.

**Sallkof (`/sallkof`)**
- `SallkofHero` — headline "Tu idea merece una planta seria," subtitle
  on infrastructure/estándares.
- `Wizard` — client component, 3-step local state machine:
  - **Paso 1**: nombre + empresa (text inputs, required to advance).
  - **Paso 2**: objetivo — radio-card selection (Crear marca propia /
    Maquilar producto existente / I+D).
  - **Paso 3**: auto-displays 3 `ObjectionCard`s (trazabilidad,
    control de calidad, escalas de producción); the card most
    relevant to the Paso 2 selection is visually highlighted. Ends
    with CTA "Agenda tu visita a la planta" (styled button/link, no
    backend submit).
  - Back/forward preserves state; step transitions via Framer Motion
    slide/fade.

**NÜV (`/nuv`)**
- `NuvHero` — headline "Biociencia para el bienestar real."
- `VerticalCard` × 4 (Alma/Aura/Armo/Abra) — real product photo (or
  icon-illustration fallback), vertical color accent, short copy,
  hover lift + shadow.

## Copy

Full Spanish copy authored for: portal panel labels, both hero
sections, wizard step prompts + all 3 objection cards, all 4 NÜV
vertical card descriptions, seal banner line, CTA button labels.
English/French not in scope for this pass (existing root site has
ES/EN/FR precedent, but not requested here).

## Data flow & state

All state is local component state (`useState`), no persistence, no
network calls, no global store. Wizard state resets on page reload —
acceptable since there's no backend to save to yet.

## Error handling

Minimal by design (no backend): wizard Paso 1 blocks advancing until
both fields are non-empty; no other validation surface exists in this
pass.

## Responsive & testing plan

Mobile-first Tailwind breakpoints. Portal split-screen stacks
vertically below 768px. Verification is manual via the Browser tool
at mobile/tablet/desktop widths, covering: wizard forward/back flow,
card hover states, nav behavior, and no horizontal overflow — before
the work is called done. No automated test suite in this pass (no
existing test tooling in this repo to extend).

## Open item carried into implementation

Real NÜV product photo file paths — user will supply; implementation
should pull them into `sallkof-nuv/public/images/nuv/` when available,
falling back to the icon/illustration system for any vertical without
a supplied photo.
