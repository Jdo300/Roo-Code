---
description: Launch the Roo Code extension in the VSCode Extension Development Host
---

# Launch Roo Code Extension Development Host

This workflow launches VSCode with the Roo Code extension loaded from source, bypassing known issues with GPU acceleration and workspace trust dialogs on this Linux X11 system.

## Steps

1. Kill any existing VSCode processes to avoid conflicts:

```bash
pkill -f "/usr/share/code/code" 2>/dev/null || true
sleep 3
```

2. Rebuild the extension (if you made code changes):

```bash
cd /home/rgadmin/repos/Roo-Code
pnpm -w bundle && pnpm --filter @roo-code/vscode-webview build
```

// turbo 3. Launch the Extension Development Host with required flags:

```bash
XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 /usr/share/code/code \
  --extensionDevelopmentPath=/home/rgadmin/repos/Roo-Code/src \
  --disable-workspace-trust \
  --disable-gpu \
  /tmp &
```

4. Wait 15-20 seconds for the Extension Host to fully initialize, then look for it on the secondary monitor (right side of the screen). The window title will show `[Extension Development Host] Welcome - tmp - Visual Studio Code`.

5. Click the Roo Code robot icon in the activity bar (left side of the Extension Host window) to open the Roo Code sidebar.

## Flags Explained

- `--extensionDevelopmentPath=/home/rgadmin/repos/Roo-Code/src`: Load the extension from source
- `--disable-workspace-trust`: Skip the "Do you trust the authors?" dialog that blocks the sidebar
- `--disable-gpu`: Fix GPU process crash (error_code=1002) that causes blank windows in virtual X11

## Troubleshooting

If you see a completely blank window:

- Check if `GPU process launch failed` appears in stderr
- Make sure both `--disable-gpu` and `--disable-workspace-trust` flags are present

If the sidebar is blank (empty panel):

- Verify `src/webview-ui/build/assets/index.js` exists
- Run `pnpm --filter @roo-code/vscode-webview build` to rebuild webview assets
