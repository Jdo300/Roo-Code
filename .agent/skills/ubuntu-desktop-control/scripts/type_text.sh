#!/usr/bin/env bash
# type_text.sh — Type text into the focused window using xdotool
# Usage: ./type_text.sh "<text>"
# Handles special characters; uses --clearmodifiers to avoid modifier key issues.
set -euo pipefail

TEXT="${1:?Usage: type_text.sh \"<text>\"}"

XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 \
    xdotool type --clearmodifiers --delay 12 -- "$TEXT"

echo "Typed: $TEXT"
