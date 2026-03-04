#!/usr/bin/env bash
# setup.sh — Check/install dependencies for ubuntu-desktop-control skill
# Safe to re-run at any time.
set -euo pipefail

PASS="✅"
FAIL="❌"
WARN="⚠️"

echo "=== ubuntu-desktop-control: dependency check ==="

check_bin() {
    local bin="$1"
    local pkg="${2:-$1}"
    if command -v "$bin" &>/dev/null; then
        echo "$PASS  $bin found at $(command -v "$bin")"
    else
        echo "$WARN  $bin not found"
        echo "      To install: sudo apt-get install -y $pkg"
        # Try to install if sudo is available without a password
        if sudo -n apt-get install -y "$pkg" &>/dev/null 2>&1; then
            echo "$PASS  $bin installed successfully"
        else
            echo "$FAIL  $bin missing — please run: sudo apt-get install -y $pkg"
            MISSING_DEPS=true
        fi
    fi
}

MISSING_DEPS=false

check_bin xdotool
check_bin ffmpeg
check_bin xwininfo x11-utils
check_bin wmctrl

# Check DISPLAY
if [[ -z "${DISPLAY:-}" ]]; then
    echo "$WARN  DISPLAY not set. Attempting to use :0"
    export DISPLAY=:0
fi

if XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 xdpyinfo &>/dev/null; then
    DIMS=$(XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 xdpyinfo 2>/dev/null | grep dimensions | awk '{print $2}')
    echo "$PASS  X11 display :0 accessible — screen: $DIMS"
else
    echo "$FAIL  Cannot access X11 display :0. Check XAUTHORITY and DISPLAY."
    exit 1
fi

# Check VSCode
if [[ -x /usr/share/code/code ]]; then
    echo "$PASS  VS Code found at /usr/share/code/code"
else
    echo "$WARN  /usr/share/code/code not found. VS Code may be at a different path."
fi

# Check RooCode src
EXT_PATH="/home/rgadmin/repos/Roo-Code/src"
if [[ -d "$EXT_PATH" ]]; then
    echo "$PASS  RooCode extension path exists: $EXT_PATH"
else
    echo "$WARN  Extension path not found: $EXT_PATH"
fi

echo ""
echo "=== All checks complete ==="
if [[ "$MISSING_DEPS" == "true" ]]; then
    echo ""
    echo "⚠️  Some dependencies are missing. Install them with:"
    echo "   sudo apt-get install -y xdotool wmctrl x11-utils ffmpeg"
    exit 1
fi
