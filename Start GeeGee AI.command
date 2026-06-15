#!/bin/bash

cd "$(dirname "$0")" || exit 1

NODE="/Users/macbookpro/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"

if [ ! -x "$NODE" ]; then
  echo "De benodigde Node.js-versie is niet gevonden."
  echo "Open Codex opnieuw en probeer het daarna nog een keer."
  read -r
  exit 1
fi

echo "GeeGee AI wordt gestart op http://127.0.0.1:3000"
echo "Laat dit Terminal-venster open zolang je de app gebruikt."

EXISTING_PIDS="$(lsof -tiTCP:3000 -sTCP:LISTEN 2>/dev/null)"
if [ -n "$EXISTING_PIDS" ]; then
  echo "Een oudere lokale versie wordt afgesloten..."
  echo "$EXISTING_PIDS" | xargs kill 2>/dev/null
  sleep 1
fi

(sleep 2; open "http://127.0.0.1:3000/workshop/DEMO123") &
"$NODE" node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000
