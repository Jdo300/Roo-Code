#!/usr/bin/env bash
# wait_for_window.sh — Poll until a window matching title pattern appears (or timeout)
# Usage: ./wait_for_window.sh "<title-pattern>" [timeout_seconds]
# timeout defaults to 30 seconds
set -euo pipefail

PATTERN="${1:?Usage: wait_for_window.sh \"<title-pattern>\" [timeout_secs]}"
TIMEOUT="${2:-30}"

echo "Waiting for window matching: '$PATTERN' (timeout: ${TIMEOUT}s)"

ELAPSED=0
INTERVAL=2

while true; do
    # Use wmctrl -l to get a list of all window names and IDs
    # This is more reliable than xdotool search --name for partial/bracketed matches
    WIN_INFO=$(XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 \
        wmctrl -l | grep -i "$PATTERN" | head -1 || true)

    if [[ -n "$WIN_INFO" ]]; then
        WIN_ID=$(echo "$WIN_INFO" | awk '{print $1}')
        echo "✅ Window found! WIN_ID=$WIN_ID (after ${ELAPSED}s)"
        echo "   Title: $(echo "$WIN_INFO" | cut -d' ' -f5-)"
        export WIN_ID
        exit 0
    fi

    if (( ELAPSED >= TIMEOUT )); then
        echo "❌ Timeout after ${TIMEOUT}s — window '$PATTERN' not found" >&2
        exit 1
    fi

    sleep "$INTERVAL"
    ELAPSED=$(( ELAPSED + INTERVAL ))
    echo "  ... still waiting (${ELAPSED}s elapsed)"
done
