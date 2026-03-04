#!/usr/bin/env bash
# window_info.sh — Find a window by title pattern and return its geometry
# Usage: ./window_info.sh "<title-pattern>"
# Outputs: WIN_ID and GEOMETRY (e.g. 1090x640+2080+55)
set -euo pipefail

PATTERN="${1:?Usage: window_info.sh \"<title-pattern>\"}"

WIN_ID=$(XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 \
    xdotool search --name "$PATTERN" 2>/dev/null | head -1)

if [[ -z "$WIN_ID" ]]; then
    echo "No window found matching: $PATTERN" >&2
    exit 1
fi

# Get geometry from xwininfo
GEOMETRY=$(XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 \
    xwininfo -id "$WIN_ID" 2>/dev/null \
    | awk '/Absolute upper-left X:/{x=$NF} /Absolute upper-left Y:/{y=$NF} /Width:/{w=$NF} /Height:/{h=$NF} END{print w"x"h"+"x"+"y}')

echo "WIN_ID=$WIN_ID"
echo "GEOMETRY=$GEOMETRY"

# Also export for sourcing
export WIN_ID
export GEOMETRY
