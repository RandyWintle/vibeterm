# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm start                  # Start Electron app in dev mode (hot reload enabled)

# Build & Package
npm run package            # Package app for current platform
npm run make              # Create distributable installers

# Test Build (use this when user asks to test the app)
./scripts/build-install.sh # Build, install to /Applications, and launch

# Code Quality
npm run lint              # Run ESLint on TypeScript files
```

## Testing Workflow

When the user asks for a "test build", "build the app", or wants to test changes in the production app:

1. Run `./scripts/build-install.sh`
2. This script will:
   - Build the production app with `npm run make`
   - Kill any running VibeTerm instance
   - Copy the `.app` to `/Applications` (overwriting existing)
   - Launch the app automatically

Always use this script for testing production builds rather than running commands manually.

## Architecture

VibeTerm is an Electron-based terminal emulator with a React frontend. It uses node-pty for pseudo-terminal functionality and xterm.js for terminal rendering.

### Process Architecture

```
Main Process (src/main.ts)
├── PtyManager: Manages node-pty processes per terminal instance
├── ProjectStore: Persists project folders using electron-store
└── IPC Handlers: pty:*, projects:*, dialog:*
    │
    │ IPC (contextBridge)
    ▼
Preload (src/preload.ts)
├── Exposes window.electron API to renderer
└── Types defined via ElectronAPI interface
    │
    ▼
Renderer Process (src/renderer/)
├── App.tsx: Terminal/project state management
├── components/Terminal.tsx: XTerm wrapper with PTY communication
├── components/TerminalGrid.tsx: Responsive grid layout (1-6 terminals)
└── components/Sidebar.tsx: Project list and quick terminal button
```

### Key Implementation Details

- **PTY Creation**: Each terminal gets a unique UUID. PTY processes are spawned with the user's default shell (`$SHELL` or `/bin/zsh`).
- **IPC Pattern**: Main process uses `ipcMain.handle()`, renderer uses `ipcRenderer.invoke()` via preload bridge.
- **Native Modules**: node-pty requires rebuild for Electron. Configured in forge.config.ts to unpack from ASAR.
- **Theme**: Tokyo Night color scheme defined in both Terminal.tsx (xterm theme) and tailwind.config.js.

### Build Configuration

- **Electron Forge**: Handles packaging with Vite plugin for bundling
- **Vite**: Separate configs for main, preload, and renderer processes
- **Native Module Handling**: node-pty and electron-store are externalized in vite.main.config.ts

## Native Module Packaging (Important)

This project uses native Node modules (`node-pty`, `electron-store`) which require special handling when packaging with Electron Forge + Vite.

### The Problem

When Vite bundles the main process, it externalizes native modules (they can't be bundled). In development this works fine because Node resolves them from `node_modules/`. However, in production:

1. Vite bundles `main.ts` → `.vite/build/main.js` inside the ASAR archive
2. The bundled code does `require('node-pty')` expecting Node to resolve it
3. But `node_modules` isn't included in the package by default
4. Even if you manually copy modules, transitive dependencies may not resolve correctly due to npm's hoisting algorithm

### The Solution

The `forge.config.ts` uses a `packageAfterCopy` hook that:

1. **Runs `npm install --production`** in the build directory to create a proper `node_modules` with correct dependency resolution
2. **Copies pre-built native modules** (`node-pty`) from the project's `node_modules` over the npm-installed versions, since they're already rebuilt for Electron's Node version
3. **Configures ASAR unpacking** for native modules so `.node` binaries are accessible at runtime

```typescript
// Key parts of forge.config.ts
packagerConfig: {
  asar: {
    unpack: '**/node_modules/{node-pty,electron-store}/**/*',
  },
},
hooks: {
  packageAfterCopy: async (_config, buildPath) => {
    // 1. Install production deps with proper resolution
    execSync('npm install --production --ignore-scripts', { cwd: buildPath });

    // 2. Copy Electron-rebuilt native modules
    await fs.copy(
      path.join(__dirname, 'node_modules/node-pty'),
      path.join(buildPath, 'node_modules/node-pty')
    );
  },
}
```

### What Doesn't Work

- **Manual module copying**: Copying only specific modules and their direct dependencies breaks because transitive dependencies aren't hoisted correctly
- **Disabling ASAR**: Works but increases app size and startup time
- **Just using `asarUnpack`**: Only unpacks files, doesn't help if modules aren't in the package

### Troubleshooting Build Issues

If you get "Cannot find module 'X'" errors in the packaged app:

1. Check if the module is in the ASAR: `npx asar list out/*/vibeterm.app/Contents/Resources/app.asar | grep X`
2. Check if it's a transitive dependency that needs to be installed
3. Ensure native modules are being unpacked from ASAR
4. Verify the `packageAfterCopy` hook is running (check build output for "Installing production dependencies")
