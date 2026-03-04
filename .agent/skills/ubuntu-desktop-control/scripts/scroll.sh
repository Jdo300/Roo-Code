#!/usr/bin/env bash
# scroll.sh — Scroll the mouse wheel at current or specified position
# Usage: ./scroll.sh <up|down> [amount] [x] [y]
# amount: number of scroll ticks (default: 3)
# x, y: coordinates to scroll at (optional — moves mouse first if provided)
set -euo pipefail

DIRECTION="${1:?Usage: scroll.sh <up|down> [amount] [x] [y]}"
AMOUNT="${2:-3}"
X="${3:-}"
Y="${4:-}"

XDO="XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 xdotool"

# Move mouse if coordinates given
if [[ -n "$X" && -n "$Y" ]]; then
    eval "$XDO mousemove $X $Y"
    sleep 0.1
fi

case "$DIRECTION" in
    up)
        BUTTON=4
        ;;
    down)
        BUTTON=5
        ;;
    *)
        echo "Unknown direction: $DIRECTION (use: up or down)" >&2
        exit 1
        ;;
esac

for ((i=0; i<AMOUNT; i++)); do
    eval "$XDO click $BUTTON"
    sleep 0.05
done

echo "Scrolled $DIRECTION x$AMOUNT"
