---
description: Take a screenshot of the X11 desktop or a specific window on Linux using ffmpeg
---

# Desktop Screenshot Skill

This skill enables capturing screenshots of the X11 display (`:0`) using `ffmpeg`, which is available on this system.

## Prerequisites

- `ffmpeg` is available at `/usr/bin/ffmpeg` ✅
- `DISPLAY=:0` is set ✅
- `xdotool` is available for window interaction ✅
- `xwininfo` is available for window geometry ✅

## Taking a Full Desktop Screenshot

```bash
XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 ffmpeg -f x11grab -i :0 -vframes 1 -update 1 -y /path/to/output.png 2>/dev/null
```

**IMPORTANT:** The `-update 1` flag is required when writing to a `.png` file. Without it, ffmpeg requires a sequence pattern.

**Then copy to artifacts dir and view:**

```bash
cp /tmp/output.png /home/rgadmin/.gemini/antigravity/brain/<conversation-id>/output.png
```

Then use `view_file` with the artifact path to display it.

## Getting Screen Dimensions

```bash
XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 xdpyinfo | grep dimensions
```

The current system has a **3200x1094** display (two monitors: primary 1920x1080, secondary 1090x640).

## Finding a Window's Geometry

```bash
XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 xwininfo -root -tree 2>/dev/null | grep "Window Title"
```

Output example:

```
0x6c00004 "[Extension Development Host] Welcome - tmp - Visual Studio Code": ("code" "Code")  1090x640+2080+55  +2080+55
```

→ Window is **1090x640** at position **x=2080, y=55** in the combined X screen.

## Targeting a Specific Window Region

Once you have window geometry (WxH+X+Y), you can screenshot just that region:

```bash
# Window is at +2080+55 with size 1090x640
# NOTE: The :0.0+X,Y syntax does NOT work for offset capture in this version of ffmpeg
# Use the full screen capture approach instead, then crop mentally
XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 ffmpeg -f x11grab -i :0 -vframes 1 -update 1 -y /tmp/screenshot.png 2>/dev/null
```

## Interacting with Windows Using xdotool

```bash
# Find window by part of its title
WIN_ID=$(XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 xdotool search --name "Extension Development Host" 2>/dev/null | head -1)

# Focus/activate a window
XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 xdotool windowactivate --sync "$WIN_ID"

# Move mouse relative to a window and click
XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 xdotool mousemove --window "$WIN_ID" 710 482
XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 xdotool click 1

# Click at absolute screen coordinates
XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 xdotool mousemove 2790 537 click 1

# Press a key
XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 xdotool key Escape
```

## Launching VSCode Extension Development Host (Roo Code)

The Extension Development Host requires special flags to work correctly on this Linux X11 system:

```bash
XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 /usr/share/code/code \
  --extensionDevelopmentPath=/home/rgadmin/repos/Roo-Code/src \
  --disable-workspace-trust \
  --disable-gpu \
  /tmp &
```

**Why these flags are needed:**

- `--disable-gpu`: Prevents GPU process crash (error_code=1002) that causes blank windows in virtual/non-hardware-accelerated X11. Without this, the Electron renderer crashes silently, leaving only a blank window.
- `--disable-workspace-trust`: Bypasses the "Do you trust the authors?" modal dialog that blocks the extension sidebar from loading when opening `/tmp`.

## Troubleshooting

### Blank window in Extension Development Host

- Check for GPU errors: `GPU process launch failed: error_code=1002` in stderr
- Fix: Add `--disable-gpu` flag

### Sidebar/panels don't load

- Check for trust dialog: A "Do you trust the authors?" dialog blocks the UI
- Fix: Add `--disable-workspace-trust` flag, or click "Yes, I trust the authors" button

### Screenshot is from wrong monitor

- The system has TWO monitors. The right monitor (secondary) starts at X=1920
- VSCode Extension Host opens on the right monitor at +2080+55
- Use full-screen capture (`-i :0`) rather than targeting specific coordinates

### File written to /tmp but not in artifacts dir

- Always use a two-step approach: `ffmpeg ... -y /tmp/shot.png && cp /tmp/shot.png /path/to/artifacts/`
