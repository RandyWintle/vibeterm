# VibeTerm

A fast, focused terminal emulator for project-based development. Built with Electron, designed for vibe coders who want quick access to their projects with style.

## Features

- **Project Sidebar** - Quick access to all your dev projects with one click
- **Git Status Indicators** - See at a glance which projects need attention (modified, ahead, behind, diverged)
- **One-Click Git Fix** - Click any non-clean git status to auto-commit and sync
- **Multi-Terminal Grid** - Run up to 6 terminals side-by-side
- **Project Startup Commands** - Configure custom commands that run when opening a project
- **Auto Project Discovery** - Scan your dev directory to find all projects automatically
- **Resizable Sidebar** - Drag to resize, preferences are remembered

## Design: Velocity

VibeTerm features the "Velocity" design system:

- **Colors**: Electric cyan (`#00D9FF`) accents on warm charcoal (`#0D0F12`)
- **Typography**: Plus Jakarta Sans (UI) + JetBrains Mono (terminal)
- **Animations**: Playful spring-based bounce effects
- **Interactions**: Glow effects, smooth hover states, animated list items

## Installation

### From Source

```bash
# Clone the repository
git clone https://github.com/RandyWintle/vibeterm.git
cd vibeterm

# Install dependencies
npm install

# Run in development mode
npm start

# Package for production
npm run package
```

The packaged app will be in `out/vibeterm-darwin-arm64/vibeterm.app` (macOS ARM) or equivalent for your platform.

## Development

```bash
# Start development server with hot reload
npm start

# Package app for current platform
npm run package

# Create distributable installers
npm run make

# Run ESLint
npm run lint
```

## Usage

### Adding Projects

1. Click the `+` button in the sidebar, or
2. Go to **Settings** > set a **Root Dev Directory** > click **Scan for Projects Now**

VibeTerm automatically detects projects by looking for:
- `.git` directories
- `package.json` (Node.js)
- `Cargo.toml` (Rust)
- `go.mod` (Go)
- `pyproject.toml` / `setup.py` (Python)
- And more...

### Git Status Icons

| Icon | Color | Meaning | Action on Click |
|------|-------|---------|-----------------|
| ✓ | Green | Clean, up to date | - |
| ● | Yellow | Uncommitted changes | Auto-commit & push |
| ↑ | Cyan | Commits ahead | Push to remote |
| ↓ | Red | Commits behind | Pull from remote |
| ⇅ | Red | Diverged | Rebase & push |
| ○ | Gray | No remote configured | - |

### Startup Commands

Right-click a project (or click the gear icon on hover) to configure a startup command. This command runs automatically when you open the project terminal.

Examples:
- `npm run dev` - Start a dev server
- `code . && npm start` - Open in VS Code and start
- `docker-compose up` - Start containers

## Tech Stack

- **Electron** - Cross-platform desktop app
- **Vite** - Fast build tooling
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **node-pty** - Pseudo-terminal for shell processes
- **xterm.js** - Terminal emulator component
- **electron-store** - Persistent settings storage

## Architecture

```
src/
├── main.ts              # Electron main process
├── preload.ts           # Context bridge for IPC
└── renderer/
    ├── App.tsx          # Main app component
    ├── index.css        # Velocity design system
    ├── themes.ts        # Theme configuration
    ├── ThemeContext.tsx # Theme provider
    └── components/
        ├── Sidebar.tsx      # Project list & navigation
        ├── TerminalGrid.tsx # Multi-terminal layout
        ├── Terminal.tsx     # xterm.js wrapper
        ├── Settings.tsx     # App settings modal
        ├── ProjectConfig.tsx # Project settings modal
        └── GitFixModal.tsx  # Git operations modal
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+T` | New terminal |
| `Cmd+W` | Close terminal |
| `Cmd+,` | Open settings |

## Requirements

- macOS 10.15+ (Apple Silicon or Intel)
- Node.js 18+

## License

MIT

---

Built with [Claude Code](https://claude.com/claude-code)
