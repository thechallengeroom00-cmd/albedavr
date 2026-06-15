#!/bin/bash

cd "$(dirname "$0")" || exit 1

NODE="/Users/macbookpro/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"

echo "Ron VR wordt gestart op http://localhost:3006/ron-vr"
echo "Laat dit venster open zolang je de applicatie gebruikt."
echo

"$NODE" node_modules/next/dist/bin/next start -H localhost -p 3006 &
SERVER_PID=$!

trap 'kill "$SERVER_PID" 2>/dev/null' EXIT INT TERM

sleep 2
open "http://localhost:3006/ron-vr"

wait "$SERVER_PID"
