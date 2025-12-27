# VibeTerm Feature Requests

## Backlog

<!-- Add new feature requests here -->

## In Progress

<!-- Features currently being developed -->

## Completed

### Project Context Menu
Right-click on projects in the sidebar to access quick actions:
- **Open in Finder** - Open the project folder in macOS Finder
- **Configure** - Open project settings
- **GitHub**
  - Push
  - Pull
  - Fetch
  - Fix... (opens GitFixModal)

### Expanded Quick Commands
- 18 default quick command presets organized by category:
  - AI/Coding: claude, aider, gh copilot
  - Dev Servers: npm run dev, npm start, yarn dev, python http server, flask, rails
  - Git: lazygit, tig, git status
  - Editors: nvim, vim, code
  - Utilities: htop, docker compose up, make
- Settings modal: Set global default startup command + add/remove custom commands
- ProjectConfig modal: Categorized command presets with search filter
- Projects without a custom command use the global default

### File Drag & Drop
- Drag files from Finder into terminal windows to insert file paths
- Paths with spaces are automatically quoted
