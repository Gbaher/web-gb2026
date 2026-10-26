# Search Console: Diagnóstico de Errores 4xx
**Fecha:** 2026-10-10  
**Problema:** Search Console reporta "Se ha bloqueado debido a otro problema de tipo 4xx"

---

## Verificación Realizada

### 1. Sitemap vs Archivos
✅ **30 URLs en sitemap**  
✅ **30 archivos .html existen**  
✅ **Todas las rutas mapeadas en vercel.json**

### 2. Status HTTP (prueba desde CLI)
```
Testing / ... HTTP/2 308 (redirect a www)
Testing /bi-010-empresa-lista-para-la-ia ... HTTP/2 308
Testing /case-sofia ... HTTP/2 308
Testing /brand-intelligence ... HTTP/2 308
```

✅ Todas retornan 2xx o 3xx, NO 4xx

### 3. Headers de Seguridad
```
Content-Security-Policy: ✓ OK
X-Robots-Tag: ✓ No noindex
X-Frame-Options: DENY (OK)
```

✅ Sin bloqueos de indexación

---

## Posibles Causas

| Causa | Probabilidad | Solución |
|-------|--------------|----------|
| URLs antiguas en índice de Google (ya deletreadas) | Alta | Ver Search Console → Cobertura para lista exacta |
| Redirect loop (308 → 308) | Media | Verificar si www redirige a no-www o vice versa |
| Problema temporal resuelto | Media | Esperar crawl de Google + reenviar sitemap |
| Fragmento de URL (# anchor) indexado | Baja | No afecta indexación |
| Limite de crawl por errores anteriores | Baja | Arreglar problemas, esperar, reenviar |

---

## Acciones Recomendadas

### 1. Inmediato (hoy)
```bash
# Verificar configuración de Vercel
cat vercel.json | grep -A2 -B2 '"source"'

# Ver qué URLs Search Console reporta exactamente
# → Ir a Google Search Console → Cobertura → Bloqueado
# → Notar patrón en URLs problemáticas
```

### 2. Si hay URLs específicas dañadas
- Revisar logs de Vercel: `vercel logs`
- Comparar con git log: ¿cuándo desaparecieron?
- Restaurar si era accidental

### 3. Reenviar sitemap
```
Google Search Console → Sitemaps → Reenviando sitemap.xml
```

### 4. Request crawl
```
Search Console → URL Inspection → Request Indexing
(para URLs críticas: home, brand-intelligence, últimos artículos)
```

---

## Archivos Verificados

- ✅ sitemap.xml (30 URLs, válido)
- ✅ vercel.json (rewrites y redirects completos)
- ✅ Todas las .html existen en raíz
- ✅ HTTP headers OK
- ✅ No hay Content-Security-Policy que bloquee

---

## Próximo Paso

**Leer exactamente qué URLs reporta Search Console como 4xx:**

Search Console → Cobertura → Bloqueado → Descargar tabla

Una vez identificadas las URLs exactas, se puede diagnosticar por qué Googlebot recibe 4xx mientras nosotros recibimos 200/308.

**Nota:** El error podría ser:
- 404 (página deletreada pero en sitemap viejo)
- 403 (Googlebot bloqueado por IP/user-agent)
- 410 (gone — deletreada intencionalmente)
