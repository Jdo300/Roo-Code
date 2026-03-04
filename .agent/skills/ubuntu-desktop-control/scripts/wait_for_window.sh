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
    WIN_ID=$(XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 \
        xdotool search --name "$PATTERN" 2>/dev/null | head -1)

    if [[ -n "$WIN_ID" ]]; then
        echo "✅ Window found! WIN_ID=$WIN_ID (after ${ELAPSED}s)"
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
