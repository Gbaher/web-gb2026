#!/usr/bin/env bash
# Hook PostToolUse (Edit|Write): si se tocó un artículo en articulos/, corre revisar.sh
# y devuelve las marcas a Claude. No bloquea: revisar.sh solo informa.
archivo=$(jq -r '.tool_input.file_path // empty')
case "$archivo" in
  */articulos/01-ideas/*|*/articulos/02-en-desarrollo/*|*/articulos/03-listos/*|*/articulos/04-publicados/*) ;;
  *) exit 0 ;;
esac
case "$archivo" in *.md|*.json) ;; *) exit 0 ;; esac
[ -f "$archivo" ] || exit 0
raiz=$(cd "$(dirname "$0")/../.." && pwd)
salida=$(bash "$raiz/articulos/revisar.sh" "$archivo" 2>&1)
jq -n --arg ctx "revisar.sh sobre $archivo:
$salida" '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:$ctx}}'
