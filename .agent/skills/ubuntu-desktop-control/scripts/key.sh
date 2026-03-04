#!/usr/bin/env bash
# key.sh — Press a key or key combination using xdotool
# Usage: ./key.sh "<key-combo>"
# Examples:
#   ./key.sh "ctrl+shift+p"     # Command palette
#   ./key.sh "Return"           # Enter key
#   ./key.sh "Escape"           # Escape
#   ./key.sh "ctrl+c"           # Copy
#   ./key.sh "ctrl+grave"       # Toggle terminal (backtick)
set -euo pipefail

KEY="${1:?Usage: key.sh \"<key-combo>\"}"

XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 \
    xdotool key --clearmodifiers "$KEY"

echo "Key pressed: $KEY"
