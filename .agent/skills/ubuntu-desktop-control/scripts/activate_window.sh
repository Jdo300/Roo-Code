#!/usr/bin/env bash
# activate_window.sh — Focus/activate a window by title pattern
# Usage: ./activate_window.sh "<title-pattern>"
set -euo pipefail

PATTERN="${1:?Usage: activate_window.sh \"<title-pattern>\"}"

WIN_ID=$(XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 \
    xdotool search --name "$PATTERN" 2>/dev/null | head -1)

if [[ -z "$WIN_ID" ]]; then
    echo "❌ No window found matching: $PATTERN" >&2
    exit 1
fi

XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 \
    xdotool windowactivate --sync "$WIN_ID"

# Also raise and focus it
XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 \
    xdotool windowraise "$WIN_ID"

sleep 0.3
echo "✅ Window activated: WIN_ID=$WIN_ID (matching '$PATTERN')"
export WIN_ID
