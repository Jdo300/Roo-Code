#!/usr/bin/env bash
# launch_vscode_ext_host.sh — Kill existing VSCode then launch Extension Development Host
# Usage: ./launch_vscode_ext_host.sh [extension_path]
# extension_path defaults to /home/rgadmin/repos/Roo-Code/src
set -euo pipefail

EXT_PATH="${1:-/home/rgadmin/repos/Roo-Code/src}"
WORKSPACE="${2:-/tmp}"
VSCODE_BIN="/usr/share/code/code"

echo "=== Launching VSCode Extension Development Host ==="
echo "  Extension path: $EXT_PATH"
echo "  Workspace:      $WORKSPACE"
echo "  VSCode binary:  $VSCODE_BIN"

if [[ ! -x "$VSCODE_BIN" ]]; then
    echo "❌ VS Code not found at $VSCODE_BIN" >&2
    exit 1
fi

if [[ ! -d "$EXT_PATH" ]]; then
    echo "❌ Extension path does not exist: $EXT_PATH" >&2
    exit 1
fi

# Kill any existing VSCode instances
echo ""
echo "Killing existing VSCode processes..."
pkill -f "/usr/share/code/code" 2>/dev/null && echo "  Killed existing VSCode" || echo "  No existing VSCode process"
sleep 3

# Launch Extension Development Host in background
echo ""
echo "Launching Extension Development Host..."
XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 \
    "$VSCODE_BIN" \
    --extensionDevelopmentPath="$EXT_PATH" \
    --disable-workspace-trust \
    --disable-gpu \
    "$WORKSPACE" \
    &>/tmp/vscode-edh.log &

VSCODE_PID=$!
echo "✅ VSCode launched (PID: $VSCODE_PID)"
echo "Logs: /tmp/vscode-edh.log"
echo ""
echo "Waiting for window to appear... (this takes ~20s)"
echo "Run: bash .agent/skills/ubuntu-desktop-control/scripts/wait_for_window.sh \"Extension Development Host\" 40"
