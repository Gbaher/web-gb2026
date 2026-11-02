// api/og.js — Carátula de cada publicación · Germán Baher
// Vercel Edge Function: genera un PNG 16:9 (1280x720) al vuelo desde parámetros de la URL.
// Se usa como og:image de cada artículo y como imagen del post de LinkedIn.
// Estilo carátula: titular en DM Sans a la izquierda, Germán a la derecha con luz dramática.
//
// URL: /api/og?title=Las+marcas+deberían+comportarse+como+personas&em=como+personas&num=BI-012&img=...
//   title  Título del artículo (obligatorio).
//   em     Parte del título que va en rojo (opcional, tiene que estar dentro del título).
//   num    Número del artículo, por ejemplo BI-012 (opcional).
//   cat    Etiqueta superior (opcional, por defecto "Brand Intelligence").
//   img    Retrato 16:9 de Germán (opcional). Puede ser una ruta de la web (/assets/og/bi-012.jpg)
//          o una imagen generada en Higgsfield. Sin imagen, la derecha lleva la marca GB en grande.
import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

const W = 1280;
const H = 720;
const RED = '#ED2450';
const BLACK = '#080808';

// Servidores de imágenes permitidos además de la propia web (Higgsfield).
const HOSTS_PERMITIDOS = ['d8j0ntlcm91z4.cloudfront.net', 'd2ol7oe51mr4n9.cloudfront.net'];

// Marca GB
const ICON = "M204.73,76.12c-13.32-13.32-29.54-19.97-48.27-19.97,0,0-.02,0-.03,0-1.84,0-3.34,1.5-3.34,3.34v48.09c.86-.16,1.71-.25,2.53-.25,5.41,0,9.57,2.08,13.32,5.83,3.75,3.33,5.41,7.91,5.41,13.32s-2.08,9.57-5.83,13.32c-3.75,3.75-8.32,5.41-13.73,5.41-12.9,0-19.14-8.74-19.14-26.63V3.7c0-1.83-1.48-3.32-3.31-3.34L88.67,0c-1.86-.02-3.37,1.48-3.37,3.34v42.88c0,2.09-1.9,3.66-3.95,3.27-4.11-.77-8.29-1.25-12.7-1.25-19.56,0-35.79,6.66-48.69,19.97C6.66,81.53,0,97.34,0,116.49c0,17.48,5.41,32.46,16.64,44.52,11.65,12.07,24.97,18.31,41.2,18.31,2.71,0,5.58-.32,8.53-.88,1.59-.3,2.76-1.68,2.76-3.3v-43.29c-.16,0-.32.03-.47.03-4.99,0-9.57-1.66-12.9-4.99-3.33-3.33-4.99-7.91-4.99-12.9s1.66-9.15,5.41-12.9c3.75-3.75,8.32-5.83,12.9-5.83,10.82,0,16.64,6.66,16.64,20.81v49.93c0,10.82-2.5,19.56-7.49,25.38-4.99,6.24-11.65,9.15-20.81,9.15-5.06,0-10.36-.96-15.36-3.07-2.19-.93-4.62.69-4.62,3.07v37.51c0,1.45.94,2.75,2.32,3.19,8.96,2.83,16.51,4.24,22.64,4.24,21.64,0,39.12-7.07,52.43-22.05,7.59-8.73,13.46-18.51,16.64-29.95.49-1.76,2.32-2.81,4.07-2.3,6.1,1.8,12.46,2.7,18.82,2.7,19.56,0,36.62-6.66,49.93-19.97,13.73-13.32,20.39-29.54,20.39-49.1s-6.66-35.37-19.97-48.69z";

// Tipografías empaquetadas con la función (DM Sans, licencia OFL en assets/fonts/OFL.txt).
const loadFont = (u) => fetch(u).then((r) => r.arrayBuffer());
const FONT_800 = loadFont(new URL('../assets/fonts/DMSans-800.woff', import.meta.url));
const FONT_700 = loadFont(new URL('../assets/fonts/DMSans-700.woff', import.meta.url));
const FONT_500 = loadFont(new URL('../assets/fonts/DMSans-500.woff', import.meta.url));

function el(type, style, children, extra = {}) {
  return { type, props: { style, children, ...extra } };
}

// Parte el título en palabras para que el texto se corte bien y la parte en rojo se distinga.
function titleWords(title, em) {
  const i = em ? title.indexOf(em) : -1;
  const parts = i === -1
    ? [[title, false]]
    : [[title.slice(0, i), false], [em, true], [title.slice(i + em.length), false]];
  const words = [];
  for (const [text, red] of parts) {
    for (const w of text.split(/\s+/).filter(Boolean)) {
      words.push(el('span', { marginRight: '0.22em', color: red ? RED : '#ffffff' }, w));
    }
  }
  return words;
}

function imageSrc(img, origin) {
  if (!img) return '';
  try {
    const u = new URL(img, origin);
    if (u.origin === origin || (u.protocol === 'https:' && HOSTS_PERMITIDOS.includes(u.hostname))) return u.toString();
  } catch (e) {}
  return '';
}

export default async function handler(req) {
  const url = new URL(req.url);
  const p = url.searchParams;
  const title = p.get('title') || 'Brand Intelligence';
  const em = p.get('em') || '';
  const num = (p.get('num') || '').toUpperCase();
  const cat = (p.get('cat') || 'Brand Intelligence').toUpperCase();
  const img = imageSrc(p.get('img') || '', url.origin);

  const [w800, w700, w500] = await Promise.all([FONT_800, FONT_700, FONT_500]);

  const size = title.length > 60 ? 70 : title.length > 40 ? 82 : 96;

  return new ImageResponse(
    el('div', {
      width: `${W}px`, height: `${H}px`, display: 'flex', position: 'relative',
      background: BLACK, fontFamily: 'DM Sans', overflow: 'hidden',
    }, [
      ...(img ? [
        // Retrato a sangre, Germán a la derecha.
        el('img', {
          position: 'absolute', top: '0', left: '0', width: `${W}px`, height: `${H}px`,
          objectFit: 'cover', objectPosition: 'right center',
        }, undefined, { src: img }),
        // La izquierda se funde a negro para el titular.
        el('div', {
          position: 'absolute', top: '0', left: '0', width: `${W}px`, height: `${H}px`,
          background: 'linear-gradient(90deg, #080808 0%, #080808 36%, rgba(8,8,8,0.82) 46%, rgba(8,8,8,0.25) 58%, rgba(8,8,8,0) 66%)',
        }),
      ] : [
        el('div', {
          position: 'absolute', top: '-180px', right: '-160px', width: '720px', height: '720px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(237,36,80,0.45) 0%, rgba(237,36,80,0.12) 45%, rgba(8,8,8,0) 70%)',
        }),
        el('svg', { position: 'absolute', top: '110px', right: '90px' }, [
          { type: 'path', props: { d: ICON, fill: 'none', stroke: 'rgba(237,36,80,0.55)', strokeWidth: '1.4' } },
        ], { viewBox: '0 0 224.71 245.48', width: '360', height: '394' }),
      ]),
      el('div', {
        position: 'absolute', bottom: '0', left: '0', width: `${W}px`, height: '190px',
        background: 'linear-gradient(0deg, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0) 100%)',
      }),
      // Línea roja lateral
      el('div', { position: 'absolute', top: '0', left: '0', width: '10px', height: `${H}px`, background: RED }),

      // Columna de texto
      el('div', {
        position: 'absolute', top: '0', left: '0', width: '700px', height: `${H}px`,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 0 60px 80px',
      }, [
        el('div', { display: 'flex', alignItems: 'center', marginBottom: '34px' }, [
          el('div', {
            display: 'flex', fontSize: '19px', fontWeight: 700, letterSpacing: '4px', color: RED,
            border: '1.5px solid rgba(237,36,80,0.7)', padding: '8px 15px', borderRadius: '3px',
          }, cat),
          num ? el('div', { display: 'flex', fontSize: '19px', fontWeight: 700, letterSpacing: '3px', color: 'rgba(255,255,255,0.4)', marginLeft: '20px' }, num) : null,
        ].filter(Boolean)),
        el('div', {
          display: 'flex', flexWrap: 'wrap', fontSize: `${size}px`, fontWeight: 800, lineHeight: 1.02,
          letterSpacing: '-2.5px', maxWidth: '600px',
        }, titleWords(title, em)),
      ]),

      // Firma
      el('div', { position: 'absolute', bottom: '44px', left: '80px', display: 'flex', alignItems: 'center' }, [
        el('svg', {}, [
          { type: 'path', props: { d: ICON, fill: '#ffffff', fillRule: 'evenodd' } },
        ], { viewBox: '0 0 224.71 245.48', width: '34', height: '37' }),
        el('div', { display: 'flex', flexDirection: 'column', marginLeft: '16px' }, [
          el('div', { display: 'flex', fontSize: '21px', fontWeight: 700, letterSpacing: '2px', color: '#ffffff' }, 'GERMÁN BAHER'),
          el('div', { display: 'flex', fontSize: '14px', fontWeight: 500, letterSpacing: '4px', color: 'rgba(255,255,255,0.5)' }, 'GROWTH BRANDS'),
        ]),
      ]),
      el('div', {
        position: 'absolute', bottom: '50px', right: '52px', display: 'flex',
        fontSize: '20px', fontWeight: 500, letterSpacing: '1px', color: 'rgba(255,255,255,0.75)',
      }, 'germanbaher.com'),
    ]),
    {
      width: W,
      height: H,
      fonts: [
        { name: 'DM Sans', data: w800, weight: 800, style: 'normal' },
        { name: 'DM Sans', data: w700, weight: 700, style: 'normal' },
        { name: 'DM Sans', data: w500, weight: 500, style: 'normal' },
      ],
      headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=31536000, immutable' },
    }
  );
}
