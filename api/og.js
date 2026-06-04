// api/og.js — Dynamic OG image generator · Germán Baher
// Vercel Edge Function: genera PNG al vuelo desde params de URL
// URL: /api/og?title=BI-003&cat=Brand+Intelligence&sub=El+gap+entre+producto+y+marca
import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

// Icon path data (marca GB)
const ICON = "M204.73,76.12c-13.32-13.32-29.54-19.97-48.27-19.97,0,0-.02,0-.03,0-1.84,0-3.34,1.5-3.34,3.34v48.09c.86-.16,1.71-.25,2.53-.25,5.41,0,9.57,2.08,13.32,5.83,3.75,3.33,5.41,7.91,5.41,13.32s-2.08,9.57-5.83,13.32c-3.75,3.75-8.32,5.41-13.73,5.41-12.9,0-19.14-8.74-19.14-26.63V3.7c0-1.83-1.48-3.32-3.31-3.34L88.67,0c-1.86-.02-3.37,1.48-3.37,3.34v42.88c0,2.09-1.9,3.66-3.95,3.27-4.11-.77-8.29-1.25-12.7-1.25-19.56,0-35.79,6.66-48.69,19.97C6.66,81.53,0,97.34,0,116.49c0,17.48,5.41,32.46,16.64,44.52,11.65,12.07,24.97,18.31,41.2,18.31,2.71,0,5.58-.32,8.53-.88,1.59-.3,2.76-1.68,2.76-3.3v-43.29c-.16,0-.32.03-.47.03-4.99,0-9.57-1.66-12.9-4.99-3.33-3.33-4.99-7.91-4.99-12.9s1.66-9.15,5.41-12.9c3.75-3.75,8.32-5.83,12.9-5.83,10.82,0,16.64,6.66,16.64,20.81v49.93c0,10.82-2.5,19.56-7.49,25.38-4.99,6.24-11.65,9.15-20.81,9.15-5.06,0-10.36-.96-15.36-3.07-2.19-.93-4.62.69-4.62,3.07v37.51c0,1.45.94,2.75,2.32,3.19,8.96,2.83,16.51,4.24,22.64,4.24,21.64,0,39.12-7.07,52.43-22.05,7.59-8.73,13.46-18.51,16.64-29.95.49-1.76,2.32-2.81,4.07-2.3,6.1,1.8,12.46,2.7,18.82,2.7,19.56,0,36.62-6.66,49.93-19.97,13.73-13.32,20.39-29.54,20.39-49.1s-6.66-35.37-19.97-48.69z";

export default function handler(req) {
  const { searchParams } = new URL(req.url);

  const title = (searchParams.get('title') || 'Brand Intelligence').toUpperCase();
  const cat   = (searchParams.get('cat')   || 'GERMÁN BAHER · BRAND INTELLIGENCE').toUpperCase();
  const sub   =  searchParams.get('sub')   || '';

  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          background: '#050405',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: '"DM Sans", sans-serif',
          padding: '0 84px',
        },
        children: [

          // ── Red glow blob top-right ──
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '-120px', right: '-80px',
                width: '520px', height: '520px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(237,36,80,0.72) 0%, rgba(160,12,40,0.40) 40%, transparent 70%)',
                filter: 'blur(60px)',
              }
            }
          },

          // ── Red glow blob bottom-left ──
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: '-100px', left: '60px',
                width: '380px', height: '380px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(237,36,80,0.50) 0%, rgba(140,10,35,0.28) 45%, transparent 70%)',
                filter: 'blur(55px)',
              }
            }
          },

          // ── Dark vignette overlay ──
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute', inset: '0',
                background: 'linear-gradient(160deg, rgba(5,4,5,0.78) 0%, rgba(5,4,5,0.50) 50%, rgba(5,4,5,0.84) 100%)',
              }
            }
          },

          // ── Top accent line ──
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute', top: '52px', left: '84px',
                width: '56px', height: '3px',
                background: '#ed2450',
              }
            }
          },

          // ── Category label ──
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute', top: '48px', left: '156px',
                fontSize: '16px', fontWeight: '700',
                letterSpacing: '3px', color: '#ed2450',
              },
              children: cat
            }
          },

          // ── Title ──
          {
            type: 'div',
            props: {
              style: {
                fontSize: title.length > 60 ? '56px' : title.length > 40 ? '66px' : '74px',
                fontWeight: '800',
                lineHeight: '1.18',
                color: '#ffffff',
                maxWidth: '980px',
                letterSpacing: '-0.5px',
                zIndex: '1',
              },
              children: title
            }
          },

          // ── Subtitle ──
          sub ? {
            type: 'div',
            props: {
              style: {
                marginTop: '22px',
                fontSize: '26px',
                fontWeight: '400',
                color: 'rgba(255,255,255,0.55)',
                maxWidth: '860px',
                lineHeight: '1.5',
                zIndex: '1',
              },
              children: sub
            }
          } : null,

          // ── Bottom bar ──
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute', bottom: '0', left: '0', right: '0',
                height: '1px', background: 'rgba(255,255,255,0.08)',
              }
            }
          },

          // ── Logo icon (SVG path) ──
          {
            type: 'svg',
            props: {
              viewBox: '0 0 224.71 245.48',
              width: '32', height: '35',
              style: {
                position: 'absolute', bottom: '32px', left: '84px',
                opacity: '0.75',
              },
              children: [{
                type: 'path',
                props: { d: ICON, fill: '#ffffff', fillRule: 'evenodd' }
              }]
            }
          },

          // ── URL label ──
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute', bottom: '36px', right: '84px',
                fontSize: '18px', fontWeight: '500',
                color: 'rgba(255,255,255,0.28)',
                letterSpacing: '1px',
              },
              children: 'germanbaher.com'
            }
          },

        ].filter(Boolean)
      }
    },
    {
      width: 1200,
      height: 630,
    }
  );
}
