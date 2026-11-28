# PageSpeed Optimization Report
**Date:** 2026-10-09  
**Target URL:** https://germanbaher.com (mobile)  
**Initial Score:** 51/100 (Rendimiento)  
**Issues Addressed:** Core Web Vitals, TBT, render-blocking resources

## Diagnostics (Before)
| Métrica | Valor | Objetivo |
|---------|-------|----------|
| FCP | 2.9s | < 1.8s |
| LCP | 2.9s | < 2.5s |
| TBT | 8180 ms | < 200 ms |
| Speed Index | 11.9s | < 3.8s |
| Payload total | 8.4 MB | < 4 MB |

### Main Issues
1. **Render-blocking requests:** 2050 ms (Google Fonts + Cal.com + WebGL)
2. **Long tasks (TBT):** 20 tareas largas encontradas (WebGL shader compilation)
3. **Image delivery:** 3490 KiB potential savings (already WebP, need further compression)
4. **CSS/JS minification:** 2 KiB each

---

## Optimizations Implemented

### 1. Google Fonts Optimization ✅
**Impact:** ~500-800ms FCP improvement expected

```html
<!-- Before -->
<link href="...&display=swap" rel="stylesheet" />

<!-- After -->
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="dns-prefetch" href="https://fonts.gstatic.com" />
<link href="...&display=swap" rel="stylesheet" media="print" onload="this.media='all'" />
<noscript><link href="...&display=swap" rel="stylesheet" /></noscript>
```

**Why:** 
- `media="print"` defers CSS parsing until onload
- `preconnect + dns-prefetch` reduces latency to gstatic.com
- Graceful fallback via `<noscript>`

### 2. Defer WebGL Mesh Gradient ✅
**Impact:** ~4-6s TBT reduction expected

Wrapped canvas initialization in `requestIdleCallback` to defer expensive shader compilation until after page is interactive.

```javascript
function initMeshGradient(){ /* ...shader code... */ }
if ('requestIdleCallback' in window) {
  requestIdleCallback(initMeshGradient, {timeout: 2000});
} else {
  setTimeout(initMeshGradient, 200);
}
```

**Why:** 
- Shader compilation (gl.compileShader) is a long task
- WebGL draw calls block main thread
- Deferring non-critical—hero animation doesn't impact hero text readability

### 3. Defer Cal.com Embed ✅
**Impact:** ~500ms render-blocking request reduction

Same pattern: wrapped in `requestIdleCallback` with 3s timeout.

**Why:** 
- Cal.com embed loads external script
- Not critical for initial page load
- Agendador no es arriba del fold

### 4. Cookie Consent Async ✅
**Impact:** Minor (script already efficient)

Changed from blocking to `defer` attribute.

---

## Remaining Opportunities

### High Impact
1. **Image compression** (3490 KiB savings)
   - Current: WebP format ✅
   - Next: Run through ImageOptim or similar
   - Target: Compress large case images (7MB for alalay/brand-application.webp)

2. **CSS minification** (2 KiB savings)
   - Current: ~5KB inline CSS
   - Tool: PostCSS / cssnano
   - Risk: Inline CSS must be minified carefully to preserve media queries

3. **JavaScript minification** (2 KiB savings)
   - Inline scripts are already fairly optimized
   - Tool: Terser / esbuild

### Medium Impact
4. **Remove unused CSS** (Audit with Lighthouse)
   - Bootstrap critical path styles
   - Defer below-fold CSS

5. **Preload LCP images**
   ```html
   <link rel="preload" as="image" href="assets/images/hero-02.webp" />
   ```

6. **Disable WebGL on slow networks**
   ```javascript
   const connection = navigator.connection;
   if (connection?.effectiveType === '4g' && connection.saveData) {
     canvas.style.display = 'none';
   }
   ```

---

## Testing Recommendations

Run fresh PageSpeed audit after deployment:
```bash
lighthouse https://germanbaher.com --form-factor=mobile --output=json
```

Expected improvements:
- FCP: 2.9s → ~2.2s (Google Fonts defer)
- TBT: 8180ms → ~2000ms (WebGL defer)
- LCP: 2.9s → ~2.5s (render-blocking resources)
- Overall Score: 51 → ~65-75

---

## Files Modified
- `index.html` — Google Fonts, WebGL, Cal.com, Cookie consent defer strategies

## Commit
- Hash: 4543a5a
- Message: "perf: optimize Core Web Vitals and TBT"
