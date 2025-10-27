#!/bin/bash

echo "╔════════════════════════════════════════╗"
echo "║  Starting V7 Print Bridge...          ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Keep this terminal window open while printing labels."
echo "Press Ctrl+C to stop the bridge."
echo ""

cd "$(dirname "$0")"
node v7-print-bridge.js


