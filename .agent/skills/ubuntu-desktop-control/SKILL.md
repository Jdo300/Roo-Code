---
description: >-
    Ubuntu/X11 desktop GUI automation and control — take screenshots of the
    desktop, click, move the mouse, type text, press keys, scroll, open/focus/find
    windows, launch applications, and run autonomous end-to-end GUI tests — on
    this machine's X11 display (:0). Use for any desktop computer-use task:
    clicking buttons, interacting with windows, verifying UI state visually,
    automating desktop workflows, GUI testing VS Code / RooCode extensions,
    controlling any Linux desktop app without human input. Keywords: desktop
    control, computer use, mouse click, keyboard input, window management,
    screenshot capture, GUI automation, xdotool, ffmpeg, X11, Ubuntu, headless
    desktop, visual verification, UI testing, application launcher, window focus,
    desktop interaction, screen capture.
---

# Ubuntu Desktop Control Skill

Full desktop GUI automation for X11 Linux (Ubuntu). Controls any desktop application — click, type, key combos, scroll, screenshot, window management — via `xdotool` + `ffmpeg`. Includes a ready-made end-to-end test runner for the RooCode VS Code extension, but the individual action scripts work for **any application** on this machine.

## Use this skill when

- You need to **take a screenshot** of the desktop or a specific window
- You need to **click, double-click, or right-click** anywhere on screen
- You need to **type text** or **press keys** (including key combos like `ctrl+shift+p`)
- You need to **scroll** in a window
- You need to **find, focus, or activate a window** by its title
- You need to **wait for a window or application to appear**
- You need to **launch VS Code** (or the RooCode Extension Development Host)
- You need to **automate any desktop GUI workflow** without human interaction
- You need to **verify UI state visually** (take before/after screenshots)
- You need to do **end-to-end GUI testing** of any desktop application
- You need to **interact with any Linux desktop application** (browser, terminal, file manager, VS Code, etc.)
- You need **desktop computer-use / computer control** capabilities on this Ubuntu machine
- You need to **control the mouse or keyboard** programmatically on X11

## Do not use this skill when

- You only need a single quick screenshot with no interaction (use the simpler `desktop-screenshot` skill)
- You are on **Wayland** — this skill is X11/xdotool only (Wayland requires `ydotool`)
- `DISPLAY=:0` is not accessible (verify with `echo $DISPLAY` and `xdpyinfo`)

## Environment

| Variable                    | Value                                              |
| --------------------------- | -------------------------------------------------- |
| `DISPLAY`                   | `:0`                                               |
| `XAUTHORITY`                | `/home/rgadmin/.Xauthority`                        |
| Screen resolution           | **3840×1080** (two monitors combined)              |
| Primary monitor             | 1920×1080, top-left at `(0, 0)`                    |
| Secondary monitor           | 1920×1080, top-left at `(1920, 0)`                 |
| VSCode Extension Host       | Opens on the **secondary (right) monitor**         |
| Typical EDH window geometry | Varies — use `window_info.sh` to get actual coords |

## Quick Start — RooCode End-to-End Test

```bash
cd /home/rgadmin/repos/Roo-Code

# Full automated test (launch VSCode, screenshot, interact, verify):
bash .agent/skills/ubuntu-desktop-control/scripts/roocode_test.sh

# Dry-run (only launch + screenshot, no clicks):
bash .agent/skills/ubuntu-desktop-control/scripts/roocode_test.sh --dry-run
```

Screenshots are saved to `/tmp/roocode_test/` (or `$ARTIFACTS_DIR` if set).

## Actions Reference

All scripts live in `.agent/skills/ubuntu-desktop-control/scripts/`. Always set the env vars:

```bash
export DISPLAY=:0
export XAUTHORITY=/home/rgadmin/.Xauthority
export SKILL_DIR=/home/rgadmin/repos/Roo-Code/.agent/skills/ubuntu-desktop-control
```

| Action          | Script                      | Arguments                               | Description                               |
| --------------- | --------------------------- | --------------------------------------- | ----------------------------------------- |
| screenshot      | `screenshot.sh`             | `[output.png]`                          | Capture full X11 screen                   |
| click           | `click.sh`                  | `<x> <y> [left\|right\|middle\|double]` | Click at absolute coords                  |
| type            | `type_text.sh`              | `"<text>"`                              | Type text into focused window             |
| key             | `key.sh`                    | `"<combo>"`                             | Press key (e.g. `ctrl+shift+p`, `Return`) |
| scroll          | `scroll.sh`                 | `<up\|down> [amount] [x] [y]`           | Scroll the mouse wheel                    |
| window_info     | `window_info.sh`            | `"<title-pattern>"`                     | Get window ID and geometry                |
| wait_for_window | `wait_for_window.sh`        | `"<title-pattern>" [timeout]`           | Wait until window appears                 |
| activate_window | `activate_window.sh`        | `"<title-pattern>"`                     | Focus a window by title                   |
| launch_vscode   | `launch_vscode_ext_host.sh` | `[extension_path]`                      | Kill + relaunch VSCode EDH                |
| setup           | `setup.sh`                  | —                                       | Check/install dependencies                |
| full test       | `roocode_test.sh`           | `[--dry-run]`                           | Full RooCode E2E test                     |

## Workflow Pattern

Always follow this loop when automating GUI interactions:

1. **Screenshot** — See the current screen state before acting
2. **Analyze** — Identify the target element and its approximate coordinates
3. **Act** — click, type, key, scroll
4. **Screenshot** — Verify the result
5. **Repeat**

```bash
SKILL=.agent/skills/ubuntu-desktop-control/scripts

# 1. See screen
bash $SKILL/screenshot.sh /tmp/before.png

# 2. Activate the window
bash $SKILL/activate_window.sh "Extension Development Host"

# 3. Click something (e.g. RooCode robot icon at ~x=2093, y=375 on secondary monitor)
bash $SKILL/click.sh 2093 375

# 4. See result
bash $SKILL/screenshot.sh /tmp/after.png
```

## VSCode Extension Development Host Details

### Launch Command

```bash
bash .agent/skills/ubuntu-desktop-control/scripts/launch_vscode_ext_host.sh
```

Internally this runs:

```bash
pkill -f "/usr/share/code/code" 2>/dev/null || true
sleep 3
XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 /usr/share/code/code \
  --extensionDevelopmentPath=/home/rgadmin/repos/Roo-Code/src \
  --disable-workspace-trust \
  --disable-gpu \
  /tmp &
```

### Required Flags

| Flag                                 | Why                                                                     |
| ------------------------------------ | ----------------------------------------------------------------------- |
| `--extensionDevelopmentPath=.../src` | Load RooCode from source                                                |
| `--disable-gpu`                      | Prevents GPU crash (error 1002) on virtual/non-hardware-accelerated X11 |
| `--disable-workspace-trust`          | Skips "Do you trust the authors?" dialog that blocks the sidebar        |

### Window Detection

After launch, wait ~20 seconds then find the window:

```bash
bash .agent/skills/ubuntu-desktop-control/scripts/wait_for_window.sh "Extension Development Host" 30
bash .agent/skills/ubuntu-desktop-control/scripts/window_info.sh "Extension Development Host"
```

Expected output: `1090x640+2080+55` (on the right monitor).

### Key UI Coordinates (Secondary Monitor at x=2080)

These are approximate — always take a screenshot first to verify:

| UI Element                | Approx X  | Approx Y | Notes                            |
| ------------------------- | --------- | -------- | -------------------------------- |
| Activity bar (left strip) | 2093      | varies   | Narrow vertical strip            |
| Explorer icon             | 2093      | 280      | Folder icon, top of activity bar |
| Extensions icon           | 2093      | 340      | Puzzle piece icon                |
| RooCode robot icon        | 2093      | 375      | Below Extensions, if it shows    |
| Command Palette trigger   | —         | —        | Use `ctrl+shift+p` key instead   |
| Sidebar/panel area        | 2180–2500 | 100–640  | Main content area                |

## Troubleshooting

### Blank VSCode window

- **Cause**: GPU process crash (`GPU process launch failed: error_code=1002`)
- **Fix**: Ensure `--disable-gpu` flag is present in launch command

### Sidebar blank or missing

- **Cause A**: Workspace trust dialog — add `--disable-workspace-trust`
- **Cause B**: Webview assets not built — run `pnpm --filter @roo-code/vscode-webview build`
- **Fix**: Check `src/webview-ui/build/assets/index.js` exists

### Screenshot from wrong area

- The system has **two monitors**. Right monitor starts at X=1920 (window at +2080)
- Always capture **full screen** (`ffmpeg -i :0`) then identify the region visually

### xdotool click not working

- Must activate (focus) the window first: `xdotool windowactivate --sync <WIN_ID>`
- Then move mouse and click: `xdotool mousemove <x> <y> && xdotool click 1`

### window_info.sh finds no window

- Window may not have loaded yet — use `wait_for_window.sh` with a timeout

## Requirements

This skill requires the following tools (auto-checked by `setup.sh`):

- `xdotool` — mouse/keyboard simulation
- `ffmpeg` — screenshot capture
- `xwininfo` — window geometry
- `/usr/share/code/code` — VS Code must be installed

Install all at once:

```bash
sudo apt-get install -y xdotool wmctrl x11-utils ffmpeg
```

Run `setup.sh` to verify installed status.
