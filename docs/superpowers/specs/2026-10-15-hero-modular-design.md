# Sistema modular de hero: diseño

Fecha: 2026-10-15. Estado: para revisión de Germán.

## Objetivo

Poder cambiar la presentación del hero de germanbaher.com (titular, texto, imagen o video) con un valor de configuración, sin tocar el resto de la web ni el diagnóstico de marca. El hero actual es el predeterminado y se puede volver a él en cualquier momento.

## Fuera de alcance

- Rediseñar la web o cambiar de framework. Sin dependencias nuevas ni paso de build.
- Modificar la lógica, las preguntas, los resultados o el manejo de datos del diagnóstico.
- Publicación automática o programada de campañas (solo se deja el campo preparado).
- Tocar secciones que no son el hero.

## Lo que ya existe (verificado en index.html)

- El diagnóstico vive en `#hero > #diagShell > #diagContent`, con 6 puntos de progreso (`#dot0` a `#dot5`).
- Estado en variables globales: `_diagName`, `_diagAnswers`, `_diagStep`. Funciones globales: `_diagRender`, `diagSubmitName`, `diagSelectProfile`, `diagAnswer`, `diagBuildResult`.
- No envía datos a ningún servidor. El único paso externo es el botón final, que abre Cal.com (`data-cal-link="german-baher-njlkqp"`).
- Cambiar de idioma lo reinicia al paso 0 (`applyLang`). Se conserva tal cual.
- La web tiene un `<h1>` oculto para SEO y el `<h1 class="diag-h">` del diagnóstico. No se tocan.
- Sistema de idiomas: diccionario global `_t` (es, en, fr) y `applyLang(lang)`, que rellena todo `[data-i18n]`.

## Decisión de arquitectura

Las variantes se **apilan encima** del diagnóstico. El diagnóstico no se mueve, no se re-crea y no se modifica. Cada variante es una sección independiente que va antes de `#hero`. Con `editorial`, ninguna sección extra se muestra ni descarga nada, y la web queda idéntica a la actual.

Descartado: mover el diagnóstico a una ventana modal (obliga a re-crear su DOM) y reescribir el hero como componente (riesgo sin beneficio en un sitio estático).

## Archivos

```
assets/hero/
  config.js        Configuración central. Aquí se cambia la variante activa y los contenidos.
  hero.css         Estilos de variantes. Todas las clases con prefijo .hv-
  hero-loader.js   Aplica la variante activa, integra los textos al sistema de idiomas.
  cinematic.js     Secuencia de fotogramas ligada al scroll (el hero de #11, parametrizado).
  cinematic/       Fotogramas de la variante cinematic.
  conceptual/      Imágenes de la variante conceptual.
  README.md        Cómo cambiar titular, imagen, o volver al original.
```

Cambios en `index.html`: un `<link>` a `hero.css`, un `<script>` de `config.js` y `hero-loader.js`, y dos secciones nuevas (`#hv-cinematic`, `#hv-conceptual`) antes de `#hero`. Nada más.

## Configuración (assets/hero/config.js)

```js
window.GB_HERO = {
  activeHero: 'editorial',        // 'editorial' | 'cinematic' | 'conceptual'
  allowUrlOverride: true,         // ?hero=cinematic solo para previsualizar, no persiste
  variants: {
    editorial: {},
    cinematic: {
      frames: { path: 'assets/hero/cinematic/f', count: 64, ext: 'webp', width: 1024, height: 576 },
      scrollLength: 500,          // en vh
      content: {
        es: { headline: 'Toda marca tiene un ADN. ¿Cómo está la tuya?' },
        en: { headline: 'Every brand has DNA. How is yours?' },
        fr: { headline: 'Toute marque a un ADN. Comment va le vôtre ?' }
      }
    },
    conceptual: {
      image: { desktop: '...', mobile: '...', alt: '' },
      align: 'left',              // 'left' | 'center'
      overlay: 0.45,              // 0 a 1
      content: {
        es: { eyebrow: '', headline: '', sub: '', cta: '' },
        en: { eyebrow: '', headline: '', sub: '', cta: '' },
        fr: { eyebrow: '', headline: '', sub: '', cta: '' }
      }
    }
  },
  schedule: []                    // Reservado: [{ variant, from, to }]. El sistema lo ignora por ahora.
};
```

## Comportamiento

**Selección.** `hero-loader.js` lee `activeHero`. Si `allowUrlOverride` es `true` y la URL trae `?hero=<variante>`, usa esa. Marca `<html data-hero="...">`. Una variante desconocida o un error de carga caen a `editorial`.

**editorial.** No se renderiza nada nuevo. Es la web de hoy.

**cinematic.** Muestra `#hv-cinematic`: lienzo fijo con la secuencia de fotogramas, que avanza con el scroll sobre `scrollLength` vh, y un titular. Los fotogramas se cargan solo si esta variante está activa, de forma progresiva. Respeta `prefers-reduced-motion`.

**conceptual.** Muestra `#hv-conceptual`: imagen de fondo (desktop y móvil), eyebrow opcional, titular, texto y botón. Todo sale de la configuración. Sin JavaScript pesado ni carga de video.

**Acceso al diagnóstico (todas las variantes).** Cada variante tiene un botón que baja a `#hero` y enfoca `#diagName`. Si la variante muestra un campo de nombre, el valor se copia a `#diagName` antes de bajar. No se llama a `diagSubmitName` por el visitante: el recorrido lo inicia él, como hoy.

**Idiomas.** Los textos de cada variante se fusionan en `_t[lang]` bajo claves `hv_*` y se aplican con el mecanismo `data-i18n` existente. Al cambiar de idioma, la variante se actualiza junto con el resto de la web.

## SEO y analítica

- No se modifican `<head>`, metaetiquetas, JSON-LD ni el `<h1>` oculto.
- Los titulares de las variantes son `<h2>`.
- El diagnóstico y sus eventos no cambian. GTM (propuesta aparte) sigue su propio camino por el consentimiento de cookies.
- Una variante inactiva no se renderiza y no carga recursos.

## Cómo cambiar y cómo volver atrás

- Cambiar titular o texto: editar `content` en `assets/hero/config.js`.
- Cambiar imagen o fotogramas: reemplazar los archivos en `assets/hero/` y ajustar rutas y tamaño en `config.js`.
- Cambiar de variante: editar `activeHero`.
- Volver al original: `activeHero: 'editorial'`. El hero original nunca se borra.

## Verificación (por variante)

Para cada variante: la web carga sin errores de consola; el diagnóstico completa su recorrido (nombre, perfil, 3 preguntas, resultado, botón de Cal.com) igual que en `main`; el cambio de idioma funciona en es, en y fr; en móvil de 390 px no hay desbordes; `editorial` no hace ninguna petición nueva. Medir peso y PageSpeed de `cinematic` y `conceptual` antes de activarlas.

## Riesgos y puntos abiertos

- El campo de nombre en el hero y el del diagnóstico son dos campos distintos; la copia es de un solo sentido.
- La variante `cinematic` pesa ~1 MB de imágenes; falta medir su efecto en LCP.
- El video de GenoTrace ya no se usa. Los fotogramas salen del video propio generado en Higgsfield.
- Esta propuesta reemplaza a #11.

## Orden de implementación

1. Estructura `assets/hero/` y `config.js` con `editorial` activa (sin cambios visibles). Probar que la web es idéntica.
2. `cinematic` migrada desde #11 y parametrizada. Probar.
3. `conceptual` con un ejemplo inactivo hecho con textos ya existentes de la web. Probar.
4. README y verificación final de las tres variantes.
