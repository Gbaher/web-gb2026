#!/usr/bin/env bash
# Marca en un artículo los patrones típicos de texto escrito por IA.
# Uso: ./articulos/revisar.sh articulos/02-en-desarrollo/mi-articulo.md
# No reemplaza la lectura en voz alta. Solo ayuda a no pasar nada por alto.

if [ -z "$1" ] || [ ! -f "$1" ]; then
  echo "Uso: $0 ruta/del/articulo.md"
  exit 1
fi

archivo="$1"
total=0

# Solo se revisa el cuerpo. Se ignora el frontmatter y todo lo que no esté en la sección "## Borrador".
# Si el archivo es el .json que se publica en la web, se revisan todos sus textos sin el HTML.
if [[ "$archivo" == *.json ]]; then
  cuerpo=$(node -e '
    const a = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
    const fuera = new Set(["slug", "keywords", "category_tag", "breadcrumb_label", "subtitle_em", "h2_em", "type", "url", "sources"]);
    const textos = [];
    (function recorrer(v, k) {
      if (fuera.has(k)) return;
      if (typeof v === "string") textos.push(v.replace(/<[^>]*>/g, ""));
      else if (Array.isArray(v)) v.forEach(x => recorrer(x));
      else if (v && typeof v === "object") Object.entries(v).forEach(([kk, x]) => recorrer(x, kk));
    })(a);
    console.log(textos.join("\n"));
  ' "$archivo") || exit 1
else
cuerpo=$(awk '/^## Borrador/{b=1; next} /^## (Antes de pasar a listos|Notas y fuentes|Reutilización)/{b=0} b' "$archivo")
if [ -z "$cuerpo" ]; then
  cuerpo=$(awk 'NR==1 && /^---$/{f=1; next} f && /^---$/{f=0; next} !f' "$archivo")
fi
fi

buscar() {
  local titulo="$1" patron="$2"
  local resultado
  resultado=$(printf '%s\n' "$cuerpo" | grep -n -i -E -- "$patron")
  if [ -n "$resultado" ]; then
    local n
    n=$(printf '%s\n' "$resultado" | wc -l)
    total=$((total + n))
    echo ""
    echo "== $titulo ($n)"
    printf '%s\n' "$resultado"
  fi
}

buscar "Rayas o guiones largos" "—|–| - "
buscar "Punto y coma" ";"
buscar "Dos puntos para anunciar un remate" "[a-záéíóúñ]: [a-záéíóúñ¿]"
buscar "Fórmula 'no es X, es Y'" "no es [^.]*, (es|sino)|no se trata de|más que [^.]*, es"
buscar "Pregunta que se responde sola" "¿(el resultado|la respuesta|la razón|el problema|por qué)\?"
buscar "Anuncia lo que viene o resume lo dicho" "en este artículo|vamos a ver|a continuación|en resumen|en conclusión|en definitiva|al final del día"
buscar "Frases de contexto vacías" "mundo actual|era digital|hoy más que nunca|cada vez más (competitivo|digital|conectado)"
buscar "Verbos de folleto" "sumérgete|descubre|desbloque|potenci|impuls|eleva|naveg"
buscar "Palabras infladas" "\bclave\b|crucial|fundamental|esencial|auténtic|genuin|transformador|poderos"
buscar "Muletillas de relleno" "cabe destacar|es importante (mencionar|destacar|recordar)|sin (lugar a )?duda"
buscar "Jerga corporativa" "sinergia|disruptiv|360|aportar valor|siguiente nivel"
buscar "Negritas en el texto" "\*\*[^*]+\*\*"

echo ""
if [ "$total" -eq 0 ]; then
  echo "No aparece ningún patrón de la lista. Ahora léelo en voz alta."
else
  echo "Total: $total marcas para revisar. Algunas pueden estar bien en contexto, decide tú."
fi
