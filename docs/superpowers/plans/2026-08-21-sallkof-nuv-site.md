# Sallkof Industrias + NÜV Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `sallkof-nuv/` Next.js site — a portal that splits into the Sallkof Industrias B2B page (hero + 3-step lead-qualifying wizard) and the NÜV by Sallkof B2C page (hero + 4 product-vertical cards), matching the approved design spec.

**Architecture:** Next.js App Router with three routes (`/`, `/sallkof`, `/nuv`), Tailwind CSS v4 CSS-first theming for design tokens, Framer Motion for microinteractions, all local component state (no backend, no persistence).

**Tech Stack:** Next.js (App Router, TypeScript), Tailwind CSS v4, Framer Motion, lucide-react (icon system), `next/font/google` (DM Sans).

**Spec:** [docs/superpowers/specs/2026-08-21-sallkof-nuv-site-design.md](../specs/2026-08-21-sallkof-nuv-site-design.md)

## Global Constraints

- New app is fully self-contained at `sallkof-nuv/` — never modify the repo root `package.json` or any existing `.html` file.
- Colors: `petroleo` #0C231E, `offwhite` #F6F6F7, `salvia` #7C9885, `citrico` #E8935C, `medianoche` #1B2A4A (general accents); vertical colors sourced from real NÜV packaging: `alma` #5C8A5F, `aura` #3B6EA5, `armo` #6B4E8E, `abra` #D97D3D.
- Typography: DM Sans, Black/Bold weights for headings, Regular for body.
- No backend, no form submission wiring, no automated test suite (per spec's explicit non-goals) — every task's verification step is a manual dev-server + browser check instead of an automated test run. Each task still ends in a working, visually-verifiable increment.
- All UI copy is Spanish, written inline in this plan — no placeholder/lorem text anywhere.
- Real NÜV product photos are not yet available; `VerticalCard` must support an optional `imageSrc` and fall back cleanly to the icon/illustration system when absent.

---

### Task 1: Scaffold Next.js app + design tokens + fonts

**Files:**
- Create: `sallkof-nuv/` (via `create-next-app`)
- Modify: `sallkof-nuv/app/globals.css`
- Modify: `sallkof-nuv/app/layout.tsx`

**Interfaces:**
- Produces: Tailwind theme tokens usable anywhere as `bg-petroleo`, `text-offwhite`, `bg-salvia`, `bg-citrico`, `bg-medianoche`, `bg-alma`, `bg-aura`, `bg-armo`, `bg-abra`, and `font-sans` (DM Sans). Root layout renders `{children}` with `bg-offwhite text-petroleo` applied to `<body>`.

- [ ] **Step 1: Scaffold the app**

Run from repo root:

```bash
npx create-next-app@latest sallkof-nuv --typescript --tailwind --app --eslint --src-dir=false --import-alias "@/*" --use-npm --no-turbopack
```

Answer any remaining prompts with defaults.

- [ ] **Step 2: Add Framer Motion and lucide-react**

```bash
cd sallkof-nuv && npm install framer-motion lucide-react
```

- [ ] **Step 3: Replace `app/globals.css` with design tokens**

```css
@import "tailwindcss";

@theme {
  --color-petroleo: #0C231E;
  --color-offwhite: #F6F6F7;
  --color-salvia: #7C9885;
  --color-citrico: #E8935C;
  --color-medianoche: #1B2A4A;
  --color-alma: #5C8A5F;
  --color-aura: #3B6EA5;
  --color-armo: #6B4E8E;
  --color-abra: #D97D3D;
  --font-sans: var(--font-dm-sans), system-ui, sans-serif;
}

html {
  scroll-behavior: smooth;
}
```

- [ ] **Step 4: Wire DM Sans + base body classes into `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "Sallkof Industrias & NÜV",
  description: "Biociencia industrial y bienestar de consumo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${dmSans.variable} font-sans bg-offwhite text-petroleo antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Verify**

```bash
npm run dev
```

Open `http://localhost:3000` in the Browser tool. Confirm: page loads with no console errors, background is off-white, default Next.js starter content renders in DM Sans (check via devtools computed font-family).

- [ ] **Step 6: Commit**

```bash
git add sallkof-nuv
git commit -m "feat(sallkof-nuv): scaffold Next.js app with design tokens and DM Sans"
```

---

### Task 2: Shared components — Nav, Footer, SealBanner

**Files:**
- Create: `sallkof-nuv/components/shared/Nav.tsx`
- Create: `sallkof-nuv/components/shared/Footer.tsx`
- Create: `sallkof-nuv/components/shared/SealBanner.tsx`

**Interfaces:**
- Consumes: Tailwind tokens from Task 1 (`bg-petroleo`, `text-offwhite`, etc).
- Produces: `<Nav />`, `<Footer />`, `<SealBanner />` — all zero-prop components, importable as default exports.

- [ ] **Step 1: Create `Nav.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/sallkof", label: "Sallkof Industrias" },
  { href: "/nuv", label: "NÜV" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-offwhite/90 backdrop-blur-sm border-b border-petroleo/10">
      <Link href="/" className="font-black text-lg tracking-tight text-petroleo">
        SALLKOF
      </Link>
      <div className="flex gap-6 text-sm font-medium">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              pathname === link.href
                ? "text-petroleo font-bold"
                : "text-petroleo/60 hover:text-petroleo transition-colors"
            }
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create `Footer.tsx`**

```tsx
export default function Footer() {
  return (
    <footer className="px-6 py-10 bg-petroleo text-offwhite/70 text-sm">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between gap-4">
        <p>© {new Date().getFullYear()} Sallkof Industrias. Todos los derechos reservados.</p>
        <p>Biociencia aplicada, de la planta al consumidor.</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Create `SealBanner.tsx`**

```tsx
import { ShieldCheck } from "lucide-react";

export default function SealBanner() {
  return (
    <div className="flex items-center justify-center gap-2 bg-medianoche text-offwhite text-xs md:text-sm font-medium px-4 py-2.5">
      <ShieldCheck size={16} className="shrink-0" />
      <span>Respaldado por la precisión y tecnología de Sallkof Lab</span>
    </div>
  );
}
```

- [ ] **Step 4: Verify**

Temporarily render `<Nav />`, `<SealBanner />`, `<Footer />` in `app/page.tsx`, run `npm run dev`, check in Browser tool: nav is sticky on scroll, active link bolds correctly on `/`, seal banner shows centered icon + text, footer shows current year. Remove the temporary render after confirming (Task 3 wires real usage).

- [ ] **Step 5: Commit**

```bash
git add components/shared
git commit -m "feat(sallkof-nuv): add shared Nav, Footer, SealBanner components"
```

---

### Task 3: Portal page (`/`)

**Files:**
- Create: `sallkof-nuv/components/portal/PortalPanel.tsx`
- Create: `sallkof-nuv/components/portal/PortalHero.tsx`
- Modify: `sallkof-nuv/app/page.tsx`

**Interfaces:**
- Consumes: `next/link`, Framer Motion (`motion` from `framer-motion`).
- Produces: `<PortalHero />` (zero-prop, default export) rendering the full split-screen portal, used directly by `app/page.tsx`.

- [ ] **Step 1: Create `PortalPanel.tsx`**

```tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface PortalPanelProps {
  href: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  bg: string;
  fg: string;
  flexGrow: number;
  onHover: () => void;
  onLeave: () => void;
}

export default function PortalPanel({
  href,
  eyebrow,
  title,
  subtitle,
  bg,
  fg,
  flexGrow,
  onHover,
  onLeave,
}: PortalPanelProps) {
  return (
    <motion.div
      animate={{ flexGrow }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="relative flex-1 min-h-[50vh] md:min-h-screen overflow-hidden"
      style={{ backgroundColor: bg }}
    >
      <Link
        href={href}
        className="flex flex-col justify-center h-full px-8 md:px-16 py-16"
      >
        <span
          className="text-xs md:text-sm font-bold tracking-widest uppercase mb-4"
          style={{ color: fg, opacity: 0.6 }}
        >
          {eyebrow}
        </span>
        <h2
          className="text-3xl md:text-5xl font-black mb-4 max-w-md"
          style={{ color: fg }}
        >
          {title}
        </h2>
        <p className="text-base md:text-lg max-w-sm" style={{ color: fg, opacity: 0.8 }}>
          {subtitle}
        </p>
      </Link>
    </motion.div>
  );
}
```

- [ ] **Step 2: Create `PortalHero.tsx`**

```tsx
"use client";

import { useState } from "react";
import PortalPanel from "./PortalPanel";

export default function PortalHero() {
  const [hovered, setHovered] = useState<"b2b" | "b2c" | null>(null);

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      <PortalPanel
        href="/sallkof"
        eyebrow="Empresas y Emprendedores"
        title="Maquila y desarrollo de producto"
        subtitle="Una planta con estándares reales para marcas que no se conforman con menos."
        bg="#0C231E"
        fg="#F6F6F7"
        flexGrow={hovered === "b2b" ? 1.15 : hovered === "b2c" ? 0.85 : 1}
        onHover={() => setHovered("b2b")}
        onLeave={() => setHovered(null)}
      />
      <PortalPanel
        href="/nuv"
        eyebrow="Consumidores"
        title="Nutrición y bienestar"
        subtitle="Biociencia aplicada al bienestar real, respaldada por Sallkof Lab."
        bg="#F6F6F7"
        fg="#0C231E"
        flexGrow={hovered === "b2c" ? 1.15 : hovered === "b2b" ? 0.85 : 1}
        onHover={() => setHovered("b2c")}
        onLeave={() => setHovered(null)}
      />
    </div>
  );
}
```

- [ ] **Step 3: Wire into `app/page.tsx`**

```tsx
import PortalHero from "@/components/portal/PortalHero";

export default function Home() {
  return (
    <main>
      <PortalHero />
    </main>
  );
}
```

- [ ] **Step 4: Verify**

`npm run dev`, open `/` in Browser tool at desktop width: confirm two panels fill viewport height, hovering one grows it and shrinks the other smoothly, clicking each navigates to `/sallkof` and `/nuv` respectively (both 404 until Tasks 5/8 — confirm navigation attempt, not final page). Resize to mobile width: panels stack vertically, each still readable and tappable.

- [ ] **Step 5: Commit**

```bash
git add components/portal app/page.tsx
git commit -m "feat(sallkof-nuv): add portal split-screen bifurcation page"
```

---

### Task 4: NÜV vertical data + VerticalCard component

**Files:**
- Create: `sallkof-nuv/lib/verticals.ts`
- Create: `sallkof-nuv/components/nuv/VerticalCard.tsx`

**Interfaces:**
- Produces: `VerticalId` type, `Vertical` interface, `VERTICALS: Vertical[]` array (exported from `lib/verticals.ts`); `<VerticalCard vertical={Vertical} />` component (default export, takes one required `vertical` prop).

- [ ] **Step 1: Create `lib/verticals.ts`**

```ts
export type VerticalId = "alma" | "aura" | "armo" | "abra";

export interface Vertical {
  id: VerticalId;
  name: string;
  tagline: string;
  description: string;
  imageSrc?: string;
}

export const VERTICALS: Vertical[] = [
  {
    id: "alma",
    name: "NÜV Alma",
    tagline: "Salud base y equilibrio cotidiano",
    description: "Magnesio, vitaminas y minerales para sostener tu día a día.",
  },
  {
    id: "aura",
    name: "NÜV Aura",
    tagline: "Movimiento, estructura y recuperación",
    description: "Colágenos y fórmulas para un cuerpo activo.",
  },
  {
    id: "armo",
    name: "NÜV Armo",
    tagline: "Energía inteligente y rendimiento",
    description: "Proteínas y creatina para rendimiento real.",
  },
  {
    id: "abra",
    name: "NÜV Abra",
    tagline: "Nutrición especializada",
    description: "Fórmulas y batidos para necesidades específicas.",
  },
];
```

- [ ] **Step 2: Create `components/nuv/VerticalCard.tsx`**

Static class maps avoid Tailwind JIT purge issues with dynamic class names.

```tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sprout, Activity, Zap, HeartPulse, type LucideIcon } from "lucide-react";
import type { Vertical, VerticalId } from "@/lib/verticals";

const ICONS: Record<VerticalId, LucideIcon> = {
  alma: Sprout,
  aura: Activity,
  armo: Zap,
  abra: HeartPulse,
};

const BG_CLASS: Record<VerticalId, string> = {
  alma: "bg-alma/10",
  aura: "bg-aura/10",
  armo: "bg-armo/10",
  abra: "bg-abra/10",
};

const TEXT_CLASS: Record<VerticalId, string> = {
  alma: "text-alma",
  aura: "text-aura",
  armo: "text-armo",
  abra: "text-abra",
};

const BORDER_CLASS: Record<VerticalId, string> = {
  alma: "hover:border-alma",
  aura: "hover:border-aura",
  armo: "hover:border-armo",
  abra: "hover:border-abra",
};

export default function VerticalCard({ vertical }: { vertical: Vertical }) {
  const Icon = ICONS[vertical.id];

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`rounded-3xl border-2 border-transparent bg-white p-8 shadow-sm hover:shadow-lg transition-shadow ${BORDER_CLASS[vertical.id]}`}
    >
      <div
        className={`relative w-full aspect-square rounded-2xl mb-6 flex items-center justify-center overflow-hidden ${BG_CLASS[vertical.id]}`}
      >
        {vertical.imageSrc ? (
          <Image
            src={vertical.imageSrc}
            alt={vertical.name}
            fill
            className="object-contain p-6"
          />
        ) : (
          <Icon size={64} className={TEXT_CLASS[vertical.id]} strokeWidth={1.5} />
        )}
      </div>
      <h3 className="text-xl font-black mb-1">{vertical.name}</h3>
      <p className={`text-sm font-bold mb-3 ${TEXT_CLASS[vertical.id]}`}>
        {vertical.tagline}
      </p>
      <p className="text-petroleo/70 text-sm">{vertical.description}</p>
    </motion.div>
  );
}
```

- [ ] **Step 3: Verify**

Temporarily render `<VerticalCard vertical={VERTICALS[0]} />` in `app/page.tsx`, run `npm run dev`, confirm in Browser tool: card shows sage-tinted square with sprout icon, hover lifts card and colors border/shadow, no console/type errors. Remove temporary render (Task 5 wires real usage).

- [ ] **Step 4: Commit**

```bash
git add lib/verticals.ts components/nuv/VerticalCard.tsx
git commit -m "feat(sallkof-nuv): add NÜV vertical data and VerticalCard component"
```

---

### Task 5: NÜV page (`/nuv`)

**Files:**
- Create: `sallkof-nuv/components/nuv/NuvHero.tsx`
- Create: `sallkof-nuv/app/nuv/page.tsx`

**Interfaces:**
- Consumes: `VERTICALS` and `Vertical` from `lib/verticals.ts` (Task 4), `VerticalCard` (Task 4), `Nav`/`Footer`/`SealBanner` (Task 2).
- Produces: working `/nuv` route.

- [ ] **Step 1: Create `NuvHero.tsx`**

```tsx
export default function NuvHero() {
  return (
    <section className="px-6 pt-20 pb-16 md:pt-28 md:pb-24 text-center max-w-3xl mx-auto">
      <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
        Biociencia para el bienestar real.
      </h1>
      <p className="text-lg text-petroleo/70">
        Fórmulas desarrolladas con precisión de laboratorio, para cada etapa
        de tu bienestar.
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Create `app/nuv/page.tsx`**

```tsx
import Nav from "@/components/shared/Nav";
import Footer from "@/components/shared/Footer";
import SealBanner from "@/components/shared/SealBanner";
import NuvHero from "@/components/nuv/NuvHero";
import VerticalCard from "@/components/nuv/VerticalCard";
import { VERTICALS } from "@/lib/verticals";

export default function NuvPage() {
  return (
    <>
      <Nav />
      <SealBanner />
      <main>
        <NuvHero />
        <section id="verticales" className="px-6 pb-24">
          <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
            {VERTICALS.map((vertical) => (
              <VerticalCard key={vertical.id} vertical={vertical} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Verify**

`npm run dev`, open `/nuv` in Browser tool at desktop and mobile widths: Nav + SealBanner stack correctly, hero centered, 4 cards render in a 2-column grid on desktop and single column on mobile, each with correct vertical color and icon, no overflow.

- [ ] **Step 4: Commit**

```bash
git add components/nuv/NuvHero.tsx app/nuv
git commit -m "feat(sallkof-nuv): add NÜV consumer page with vertical cards"
```

---

### Task 6: Wizard content data

**Files:**
- Create: `sallkof-nuv/lib/wizard-content.ts`

**Interfaces:**
- Produces: `Objetivo` type, `OBJETIVOS` array, `ObjectionId` type, `OBJECTIONS` array, `OBJETIVO_TO_OBJECTION: Record<Objetivo, ObjectionId>` — all consumed by Task 7's Wizard components.

- [ ] **Step 1: Create `lib/wizard-content.ts`**

```ts
export type Objetivo = "marca-propia" | "maquila" | "i-mas-d";

export interface ObjetivoOption {
  id: Objetivo;
  label: string;
  description: string;
}

export const OBJETIVOS: ObjetivoOption[] = [
  {
    id: "marca-propia",
    label: "Crear marca propia",
    description: "Desarrollamos tu producto desde cero, con tu marca.",
  },
  {
    id: "maquila",
    label: "Maquilar producto existente",
    description: "Ya tienes la fórmula o el producto — nosotros lo producimos a escala.",
  },
  {
    id: "i-mas-d",
    label: "I+D",
    description: "Necesitas investigación y desarrollo antes de producir.",
  },
];

export type ObjectionId = "trazabilidad" | "calidad" | "escalas";

export interface Objection {
  id: ObjectionId;
  title: string;
  description: string;
}

export const OBJECTIONS: Objection[] = [
  {
    id: "trazabilidad",
    title: "Trazabilidad total",
    description: "Cada lote documentado, de materia prima a producto terminado.",
  },
  {
    id: "calidad",
    title: "Control de calidad real",
    description: "Laboratorio propio, no solo un checklist de salida.",
  },
  {
    id: "escalas",
    title: "Escalas de producción",
    description: "De lotes piloto a volúmenes industriales, sin perder consistencia.",
  },
];

export const OBJETIVO_TO_OBJECTION: Record<Objetivo, ObjectionId> = {
  "marca-propia": "trazabilidad",
  "maquila": "escalas",
  "i-mas-d": "calidad",
};
```

- [ ] **Step 2: Verify**

Run `npx tsc --noEmit` inside `sallkof-nuv/` — confirm no type errors (file has no consumers yet, so this only checks the file itself is syntactically/typewise valid).

- [ ] **Step 3: Commit**

```bash
git add lib/wizard-content.ts
git commit -m "feat(sallkof-nuv): add wizard content data and objetivo-to-objection mapping"
```

---

### Task 7: Wizard component

**Files:**
- Create: `sallkof-nuv/components/sallkof/ObjectionCard.tsx`
- Create: `sallkof-nuv/components/sallkof/WizardStep1.tsx`
- Create: `sallkof-nuv/components/sallkof/WizardStep2.tsx`
- Create: `sallkof-nuv/components/sallkof/WizardStep3.tsx`
- Create: `sallkof-nuv/components/sallkof/Wizard.tsx`

**Interfaces:**
- Consumes: `OBJETIVOS`, `OBJECTIONS`, `OBJETIVO_TO_OBJECTION`, `Objetivo`, `ObjectionId` from `lib/wizard-content.ts` (Task 6).
- Produces: `<Wizard />` (zero-prop, default export) — the full 3-step flow, consumed by Task 8's `/sallkof` page.

- [ ] **Step 1: Create `ObjectionCard.tsx`**

```tsx
import { ClipboardCheck, ShieldCheck, TrendingUp } from "lucide-react";
import type { Objection, ObjectionId } from "@/lib/wizard-content";

const ICONS: Record<ObjectionId, typeof ClipboardCheck> = {
  trazabilidad: ClipboardCheck,
  calidad: ShieldCheck,
  escalas: TrendingUp,
};

export default function ObjectionCard({
  objection,
  highlighted,
}: {
  objection: Objection;
  highlighted: boolean;
}) {
  const Icon = ICONS[objection.id];

  return (
    <div
      className={`rounded-2xl p-6 border-2 transition-colors ${
        highlighted
          ? "border-salvia bg-salvia/10"
          : "border-petroleo/10 bg-white"
      }`}
    >
      <Icon
        size={28}
        className={highlighted ? "text-salvia" : "text-petroleo/60"}
        strokeWidth={1.5}
      />
      <h4 className="font-bold mt-3 mb-1">{objection.title}</h4>
      <p className="text-sm text-petroleo/70">{objection.description}</p>
    </div>
  );
}
```

- [ ] **Step 2: Create `WizardStep1.tsx`**

```tsx
"use client";

import { useState } from "react";

export default function WizardStep1({
  onNext,
}: {
  onNext: (data: { nombre: string; empresa: string }) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const canAdvance = nombre.trim().length > 0 && empresa.trim().length > 0;

  return (
    <div>
      <h3 className="text-2xl font-black mb-6">Empecemos por lo básico</h3>
      <div className="flex flex-col gap-4 max-w-sm">
        <input
          type="text"
          placeholder="Tu nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="border-2 border-petroleo/15 rounded-xl px-4 py-3 focus:border-salvia outline-none"
        />
        <input
          type="text"
          placeholder="Tu empresa"
          value={empresa}
          onChange={(e) => setEmpresa(e.target.value)}
          className="border-2 border-petroleo/15 rounded-xl px-4 py-3 focus:border-salvia outline-none"
        />
        <button
          type="button"
          disabled={!canAdvance}
          onClick={() => onNext({ nombre, empresa })}
          className="mt-2 bg-petroleo text-offwhite rounded-xl px-6 py-3 font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-petroleo/90 transition-colors"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `WizardStep2.tsx`**

```tsx
"use client";

import { OBJETIVOS, type Objetivo } from "@/lib/wizard-content";

export default function WizardStep2({
  onNext,
  onBack,
}: {
  onNext: (objetivo: Objetivo) => void;
  onBack: () => void;
}) {
  return (
    <div>
      <h3 className="text-2xl font-black mb-6">¿Cuál es tu objetivo?</h3>
      <div className="flex flex-col gap-3 max-w-md">
        {OBJETIVOS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onNext(option.id)}
            className="text-left border-2 border-petroleo/15 rounded-xl px-5 py-4 hover:border-salvia hover:bg-salvia/5 transition-colors"
          >
            <p className="font-bold">{option.label}</p>
            <p className="text-sm text-petroleo/60">{option.description}</p>
          </button>
        ))}
        <button
          type="button"
          onClick={onBack}
          className="self-start text-sm text-petroleo/50 hover:text-petroleo mt-2"
        >
          ← Volver
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `WizardStep3.tsx`**

```tsx
import { OBJECTIONS, OBJETIVO_TO_OBJECTION, type Objetivo } from "@/lib/wizard-content";
import ObjectionCard from "./ObjectionCard";

export default function WizardStep3({
  nombre,
  objetivo,
  onBack,
}: {
  nombre: string;
  objetivo: Objetivo;
  onBack: () => void;
}) {
  const highlightedId = OBJETIVO_TO_OBJECTION[objetivo];

  return (
    <div>
      <h3 className="text-2xl font-black mb-2">
        {nombre}, resolvemos tus dudas antes de que las tengas
      </h3>
      <p className="text-petroleo/60 mb-8">
        Esto es lo que la mayoría de marcas pregunta antes de producir con
        nosotros.
      </p>
      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        {OBJECTIONS.map((objection) => (
          <ObjectionCard
            key={objection.id}
            objection={objection}
            highlighted={objection.id === highlightedId}
          />
        ))}
      </div>
      <div className="flex items-center gap-4">
        <a
          href="mailto:hola@sallkof.com?subject=Quiero%20agendar%20una%20visita%20a%20la%20planta"
          className="bg-salvia text-petroleo rounded-xl px-6 py-3 font-bold hover:brightness-95 transition-all"
        >
          Agenda tu visita a la planta
        </a>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-petroleo/50 hover:text-petroleo"
        >
          ← Volver
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `Wizard.tsx`**

```tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import WizardStep1 from "./WizardStep1";
import WizardStep2 from "./WizardStep2";
import WizardStep3 from "./WizardStep3";
import type { Objetivo } from "@/lib/wizard-content";

type WizardData = {
  nombre: string;
  empresa: string;
  objetivo: Objetivo | null;
};

export default function Wizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [data, setData] = useState<WizardData>({
    nombre: "",
    empresa: "",
    objetivo: null,
  });

  const variants = {
    enter: { opacity: 0, x: 24 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial="enter"
          animate="center"
          exit="exit"
          variants={variants}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {step === 1 && (
            <WizardStep1
              onNext={({ nombre, empresa }) => {
                setData((prev) => ({ ...prev, nombre, empresa }));
                setStep(2);
              }}
            />
          )}
          {step === 2 && (
            <WizardStep2
              onNext={(objetivo) => {
                setData((prev) => ({ ...prev, objetivo }));
                setStep(3);
              }}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && data.objetivo && (
            <WizardStep3
              nombre={data.nombre}
              objetivo={data.objetivo}
              onBack={() => setStep(2)}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 6: Verify**

Temporarily render `<Wizard />` in `app/page.tsx`, run `npm run dev`, walk through in Browser tool: Paso 1 blocks "Siguiente" until both fields filled, advancing works; Paso 2 each option advances to Paso 3 with a slide transition; Paso 3 shows the name in the heading, the objection card matching the chosen objetivo is visually highlighted (verify all 3 objetivo choices produce the expected highlight per `OBJETIVO_TO_OBJECTION`), "Volver" steps back and preserves prior inputs. Remove temporary render (Task 8 wires real usage).

- [ ] **Step 7: Commit**

```bash
git add components/sallkof
git commit -m "feat(sallkof-nuv): add 3-step wizard with dynamic objection highlighting"
```

---

### Task 8: Sallkof page (`/sallkof`)

**Files:**
- Create: `sallkof-nuv/components/sallkof/SallkofHero.tsx`
- Create: `sallkof-nuv/app/sallkof/page.tsx`

**Interfaces:**
- Consumes: `Wizard` (Task 7), `Nav`/`Footer` (Task 2).
- Produces: working `/sallkof` route.

- [ ] **Step 1: Create `SallkofHero.tsx`**

```tsx
export default function SallkofHero() {
  return (
    <section className="px-6 pt-20 pb-16 md:pt-28 md:pb-24 text-center max-w-3xl mx-auto">
      <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
        Tu idea merece una planta seria.
      </h1>
      <p className="text-lg text-petroleo/70 mb-8">
        Infraestructura, trazabilidad y estándares de clase mundial para
        marcas que no se conforman con menos.
      </p>
      <a
        href="#wizard"
        className="inline-block bg-petroleo text-offwhite rounded-xl px-6 py-3 font-bold hover:bg-petroleo/90 transition-colors"
      >
        Cuéntanos tu proyecto
      </a>
    </section>
  );
}
```

- [ ] **Step 2: Create `app/sallkof/page.tsx`**

```tsx
import Nav from "@/components/shared/Nav";
import Footer from "@/components/shared/Footer";
import SallkofHero from "@/components/sallkof/SallkofHero";
import Wizard from "@/components/sallkof/Wizard";

export default function SallkofPage() {
  return (
    <>
      <Nav />
      <main>
        <SallkofHero />
        <section id="wizard" className="px-6 py-16 md:py-24 bg-white">
          <Wizard />
        </section>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Verify**

`npm run dev`, open `/sallkof` in Browser tool: hero CTA "Cuéntanos tu proyecto" smooth-scrolls to the wizard section, full wizard flow works end to end (repeat Task 7's check in this real page context), responsive at mobile width with no overflow.

- [ ] **Step 4: Commit**

```bash
git add components/sallkof/SallkofHero.tsx app/sallkof
git commit -m "feat(sallkof-nuv): add Sallkof B2B page with hero and wizard"
```

---

### Task 9: Cross-page polish — home page cleanup, full nav verification

**Files:**
- Modify: `sallkof-nuv/app/page.tsx` (remove any leftover verification scaffolding from Tasks 2/3/4/7 if present)

**Interfaces:**
- None new — this task only verifies integration of everything built in Tasks 1–8.

- [ ] **Step 1: Confirm `app/page.tsx` contains only the portal**

```tsx
import PortalHero from "@/components/portal/PortalHero";

export default function Home() {
  return (
    <main>
      <PortalHero />
    </main>
  );
}
```

If any temporary verification JSX from earlier tasks remains in this file, remove it now so the file matches exactly the above.

- [ ] **Step 2: Full click-through verification**

`npm run dev`. In the Browser tool at desktop width: start at `/`, hover both panels (confirm grow/shrink), click B2B panel → lands on `/sallkof` with Nav showing "Sallkof Industrias" bolded, complete the wizard, click Nav → "NÜV" → lands on `/nuv` with Nav showing "NÜV" bolded, confirm SealBanner + 4 cards render, click Nav → "Inicio" → back to `/`. Repeat the same click-through at mobile width (375px). Check `read_console_messages` for any errors across all three routes.

- [ ] **Step 3: Commit (only if Step 1 found cleanup to do)**

```bash
git add app/page.tsx
git commit -m "chore(sallkof-nuv): clean up portal page after component verification"
```

If Step 1 found nothing to remove, skip this commit — there's nothing to record.

---

### Task 10: Final responsive pass

**Files:**
- Modify: any component file where Task 9's verification surfaced a responsive issue (exact files unknown until Task 9 runs — this task fixes what Task 9 finds).

**Interfaces:**
- None new.

- [ ] **Step 1: Resize sweep**

Using the Browser tool's `resize_window`, check all three routes (`/`, `/sallkof`, `/nuv`) at 375px (mobile), 768px (tablet), and 1280px (desktop) widths. Look specifically for: horizontal scrollbars/overflow, text overlapping images, buttons smaller than a comfortable tap target (~44px), the portal panels not stacking cleanly on mobile, wizard step-3's 3-column objection grid not collapsing to 1 column below `sm`.

- [ ] **Step 2: Fix any issues found**

Apply targeted Tailwind class fixes directly in the affected component file(s). There is no way to pre-write these fixes — they depend on what Step 1 finds. Common fixes if needed: add `overflow-x-hidden` to a wrapping container, adjust `px-*` values at smaller breakpoints, add `flex-wrap` to button rows.

- [ ] **Step 3: Re-verify**

Re-run Step 1's sweep to confirm fixes resolved the issues without introducing new ones.

- [ ] **Step 4: Commit**

```bash
git add sallkof-nuv
git commit -m "fix(sallkof-nuv): responsive fixes from full-site resize sweep"
```

If Step 1 found zero issues, skip this task's commit entirely — nothing changed.

---

## Self-Review Notes

- **Spec coverage:** Portal split-screen (Task 3) ✓, Sallkof hero + wizard 3 steps + dynamic objection highlighting + CTA (Tasks 6–8) ✓, NÜV hero + seal banner + 4 vertical cards with real-photo/icon fallback (Tasks 4–5) ✓, shared Nav/Footer (Task 2) ✓, design tokens/fonts (Task 1) ✓, responsive verification (Tasks 9–10) ✓, no-backend/no-automated-tests constraint honored throughout (manual browser verification steps replace test steps per Global Constraints) ✓.
- **Placeholder scan:** No TBD/TODO markers; Task 10's fix step is intentionally contingent on Task 9's findings (there is no way to pre-write a fix for an issue not yet found) and is scoped narrowly with concrete examples of what such a fix looks like.
- **Type consistency:** `Objetivo`, `ObjectionId`, `Vertical`, `VerticalId` types are defined once (Tasks 4/6) and imported (never redefined) in every consuming component (Tasks 5/7/8). `Wizard`'s internal `WizardData.objetivo` is typed `Objetivo | null` and narrowed with `data.objetivo &&` before being passed to `WizardStep3` as non-null `Objetivo`, matching that component's prop type exactly.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-21-sallkof-nuv-site.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
