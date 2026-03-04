#!/usr/bin/env bash
# screenshot.sh — Capture a screenshot of the full X11 display
# Usage: ./screenshot.sh [output_path]
# Output defaults to /tmp/desktop_screenshot.png
set -euo pipefail

OUTPUT="${1:-/tmp/desktop_screenshot.png}"

XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 \
    ffmpeg -f x11grab -i :0 -vframes 1 -update 1 -y "$OUTPUT" 2>/dev/null

echo "Screenshot saved: $OUTPUT"

# If ARTIFACTS_DIR is set, copy there too
if [[ -n "${ARTIFACTS_DIR:-}" ]]; then
    BASENAME=$(basename "$OUTPUT")
    cp "$OUTPUT" "$ARTIFACTS_DIR/$BASENAME"
    echo "Copied to artifacts: $ARTIFACTS_DIR/$BASENAME"
fi
