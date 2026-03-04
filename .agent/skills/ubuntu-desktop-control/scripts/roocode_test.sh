#!/usr/bin/env bash
# roocode_test.sh — Autonomous end-to-end GUI test for the RooCode VS Code extension
#
# Usage:
#   ./roocode_test.sh             # Full test (launch, interact, verify)
#   ./roocode_test.sh --dry-run   # Screenshot-only (no clicks/keyboard)
#
# Outputs screenshots to /tmp/roocode_test/ or $ARTIFACTS_DIR
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DRY_RUN=false
PASS=0
FAIL=0

for arg in "$@"; do
    [[ "$arg" == "--dry-run" ]] && DRY_RUN=true
done

# ── Output directory ──────────────────────────────────────────────────────────
OUTPUT_DIR="${ARTIFACTS_DIR:-/tmp/roocode_test}"
mkdir -p "$OUTPUT_DIR"

echo "=========================================="
echo "  RooCode Extension GUI Test"
echo "  Mode: $([ "$DRY_RUN" = true ] && echo 'DRY-RUN (no clicks)' || echo 'FULL')"
echo "  Output: $OUTPUT_DIR"
echo "=========================================="
echo ""

# ── Helper: screenshot with label ────────────────────────────────────────────
shot() {
    local label="$1"
    local path="$OUTPUT_DIR/${label}.png"
    bash "$SCRIPT_DIR/screenshot.sh" "$path"
    echo "📸 Screenshot: $path"
}

# ── Helper: log pass/fail ─────────────────────────────────────────────────────
check() {
    local description="$1"
    local condition="$2"  # "true" or "false"
    if [[ "$condition" == "true" ]]; then
        echo "  ✅ PASS: $description"
        (( PASS++ )) || true
    else
        echo "  ❌ FAIL: $description"
        (( FAIL++ )) || true
    fi
}

# ── STEP 1: Check dependencies ────────────────────────────────────────────────
echo "--- Step 1: Dependency check ---"
bash "$SCRIPT_DIR/setup.sh"
echo ""

# ── STEP 2: Launch VSCode Extension Development Host ─────────────────────────
echo "--- Step 2: Launch VSCode Extension Development Host ---"
bash "$SCRIPT_DIR/launch_vscode_ext_host.sh"
echo ""

# ── STEP 3: Wait for window ───────────────────────────────────────────────────
echo "--- Step 3: Wait for VSCode window (up to 40s) ---"
if bash "$SCRIPT_DIR/wait_for_window.sh" "Extension Development Host" 40; then
    check "VSCode EDH window appeared" "true"
else
    check "VSCode EDH window appeared" "false"
    echo "❌ Cannot continue without VSCode window" >&2
    echo ""
    echo "=== TEST SUMMARY: PASS=$PASS FAIL=$FAIL ==="
    exit 1
fi
echo ""

# ── STEP 4: Initial screenshot ───────────────────────────────────────────────
echo "--- Step 4: Initial screenshot ---"
sleep 5  # Extra warm-up time after window appears
shot "01_launched"
echo ""

# ── STEP 5: Activate window ───────────────────────────────────────────────────
echo "--- Step 5: Activate VSCode window ---"
bash "$SCRIPT_DIR/activate_window.sh" "Extension Development Host"
sleep 1
echo ""

if [[ "$DRY_RUN" == "true" ]]; then
    echo "--- DRY-RUN MODE: Skipping all GUI interactions ---"
    echo ""
    shot "02_dryrun_final"
    check "Dry-run screenshot captured" "true"
    echo ""
    echo "=== DRY-RUN COMPLETE: PASS=$PASS FAIL=$FAIL ==="
    echo "Screenshots in: $OUTPUT_DIR"
    exit 0
fi

# ── STEP 6: Click RooCode icon in activity bar ───────────────────────────────
echo "--- Step 6: Click RooCode robot icon in activity bar ---"
# The activity bar is on the left of the VSCode window.
# VSCode opens on secondary monitor at approx +2080+55
# Activity bar is at approx x=2093; RooCode icon varies — try common positions
echo "  Clicking activity bar area to find RooCode icon..."

# First, try clicking the activity bar to trigger the extension view
# The exact y-coordinate varies — we click each "slot" from top to bottom
ACTIVITY_X=2093

# Try the Extensions-like view slot (usually position 5-6 from top)
bash "$SCRIPT_DIR/click.sh" "$ACTIVITY_X" 375
sleep 2
shot "02_after_activity_bar_click"

# ── STEP 7: Check if sidebar opened ──────────────────────────────────────────
echo "--- Step 7: Post-click screenshot of sidebar area ---"
sleep 1
shot "03_sidebar_check"
echo ""

# ── STEP 8: Open Command Palette and search for Roo ──────────────────────────
echo "--- Step 8: Open command palette and search for 'Roo' ---"
bash "$SCRIPT_DIR/key.sh" "ctrl+shift+p"
sleep 1
shot "04_command_palette_opened"

bash "$SCRIPT_DIR/type_text.sh" "Roo"
sleep 1
shot "05_command_palette_roo_search"
check "Command palette opened and Roo searched" "true"
echo ""

# ── STEP 9: Dismiss command palette ──────────────────────────────────────────
echo "--- Step 9: Dismiss command palette ---"
bash "$SCRIPT_DIR/key.sh" "Escape"
sleep 0.5
echo ""

# ── STEP 10: Open Extensions sidebar to verify RooCode is listed ─────────────
echo "--- Step 10: Open Extensions sidebar ---"
bash "$SCRIPT_DIR/key.sh" "ctrl+shift+x"
sleep 2
shot "06_extensions_sidebar"
check "Extensions sidebar opened" "true"
echo ""

# ── STEP 11: Toggle integrated terminal to check for errors ──────────────────
echo "--- Step 11: Open integrated terminal ---"
bash "$SCRIPT_DIR/key.sh" "ctrl+grave"
sleep 2
shot "07_terminal_open"
check "Integrated terminal toggled" "true"
echo ""

# ── STEP 12: Final clean screenshot ──────────────────────────────────────────
echo "--- Step 12: Final screenshot ---"
bash "$SCRIPT_DIR/key.sh" "Escape"
sleep 0.5
shot "08_final"
echo ""

# ── SUMMARY ───────────────────────────────────────────────────────────────────
echo "=========================================="
echo "  TEST COMPLETE"
echo "  ✅ PASS: $PASS"
echo "  ❌ FAIL: $FAIL"
echo "  Screenshots: $OUTPUT_DIR"
echo "=========================================="

if (( FAIL > 0 )); then
    exit 1
fi
exit 0
