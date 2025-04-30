# Troubleshooting Roo Code Extension Build Errors

This document summarizes common build issues encountered in the Roo Code extension project and the steps taken to resolve them. It is intended as a guide for other debug agents.

## Initial Symptoms

Build failures often manifest as errors during the `npm run build` process, including:

- Lint errors (often in the `webview-ui`).
- TypeScript type checking errors (`check-types:extension`, `check-types:webview`, `check-types:e2e`).
- Webview build errors (`build:webview`).
- Packaging errors (`npm run vsix`) with messages about missing dependencies.

## Troubleshooting Process & Tools Used

A systematic approach is crucial:

1. **Run Full Build:** Start with `npm run build` to see all initial errors.
2. **Isolate Errors:** Run individual scripts (`npm run lint`, `npm run check-types`, `cd webview-ui && npm run build`, `npm run build:esbuild`) to pinpoint the source of failures.
3. **Examine Code & Config:** Use `read_file` to inspect relevant files (`package.json` in root and sub-projects, build scripts, source files with errors). Use `search_files` to find definitions or specific code patterns.
4. **Fix Code Issues:** Use `apply_diff` for targeted code modifications based on error messages and code analysis.
5. **Investigate Environment:** If build failures persist or seem inconsistent, investigate the Node.js environment:
    - Check globally installed packages (`pnpm list -g`, `npm list -g`).
    - Check Node.js and package manager versions (`node -v`, `npm -v`, `pnpm --version`).
    - Check TypeScript version (`tsc --version`).
    - Verify package manager global configuration (`pnpm config get global-bin-dir`).
    - Check system PATH (`echo $env:PATH` on Windows).
    - Use `brave_search` and `context7` to research specific error messages and known compatibility issues (e.g., `vsce` with pnpm).
6. **Address Environmental Issues:** Use commands like `pnpm setup`, `pnpm config set`, `npm install -g`, `pnpm add -g` (if global setup works), or manual PATH updates. Be aware that VS Code restarts might be necessary for environment changes to take effect.
7. **Reinstall Dependencies:** After environmental fixes or significant code changes, run `pnpm install` (or `npm install` if switching package managers) from the root to ensure dependencies are correctly installed and linked.
8. **Re-run Build Steps:** After each fix, re-run the relevant build steps to confirm the issue is resolved.

## Common Problems and Solutions

- **Workspace Dependency Not Found (e.g., `@evals/types`):**
    - **Problem:** Local workspace packages are not correctly linked.
    - **Solution:** Ensure dependencies in sub-projects use `"workspace:*"` (or the appropriate version) and run `pnpm install` from the root.
- **Missing Dependencies (e.g., `@aws-sdk/credential-providers`, `google-auth-library`):**
    - **Problem:** Dependencies required by the project are not installed.
    - **Solution:** Explicitly add missing dependencies to the root `package.json` using `pnpm add -w [package-name]`.
- **Jest Mock Type Errors (`TS2741`, `TS2345`):**
    - **Problem:** Incompatibilities between Jest mock types and expected function signatures in TypeScript.
    - **Solution:** Use `@ts-expect-error` directives above the problematic lines in test files as a workaround when strict typing is difficult to achieve. Ensure mock implementations match expected behavior. Add missing properties to mock objects (e.g., `shell` to TerminalState mocks).
- **McpToolCallResponse Type Mismatch (`TS2322`):**
    - **Problem:** The type returned by an MCP tool call does not match the expected type.
    - **Solution:** Cast the result to the expected type (`as McpToolCallResponse`) if the runtime data structure is known to be correct.
- **`tsdx` Command Not Found / pnpm Global Bin Directory Issue:**
    - **Problem:** Global executables installed by pnpm are not found in the system's PATH within VS Code terminals.
    - **Solution:** This is a complex environmental issue. Ensure pnpm is correctly installed and `pnpm setup` has been run. Verify the pnpm global bin directory is in the system's PATH. If persistent, may require manual PATH updates, VS Code restarts, or deeper system/pnpm troubleshooting (potentially involving other agents).
- **`vsce package` Missing Dependency Errors with pnpm Workspaces:**
    - **Problem:** `vsce` has compatibility issues with pnpm's dependency structure during packaging.
    - **Solution:** Add the `--no-dependencies` flag to the `vsce package` command in the `vsix` script in `package.json`. This tells `vsce` to skip dependency verification and bundling, relying on the project's build process to include necessary code.
- **TypeScript Version Mismatch:**
    - **Problem:** The TypeScript version in the environment differs from the version specified in the project's `package.json`.
    - **Solution:** Ensure project dependencies are installed using the project's package manager (`pnpm install`), which will install the correct TypeScript version in `node_modules`. The build process should then use this version.

## Key Takeaways for Debug Agents

- Always start by understanding the full build output.
- Isolate failures to specific build steps or files.
- Don't hesitate to investigate the environment (Node.js, package manager, TypeScript, PATH) if code-specific fixes don't resolve the issue or if known good builds fail.
- Leverage MCP tools for external research on specific errors or compatibility issues.
- Be aware of package manager-specific behaviors, especially in monorepos.
- Use `@ts-expect-error` judiciously in test files when type strictness conflicts with mocking patterns.
- If an environmental issue is complex and beyond current capabilities, create a subtask for a specialized agent.
- Document findings and solutions in the memory bank for future reference.
