import { app, BrowserWindow, ipcMain, dialog, Menu, shell } from 'electron';
import path from 'node:path';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// Removed electron-squirrel-startup because it caused build issues on macOS
// and is not needed for this platform.

// Use require for native modules to avoid bundling issues
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pty = require('node-pty');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Store = require('electron-store');

interface PtyProcess {
  pty: ReturnType<typeof pty.spawn>;
  onData: (data: string) => void;
}

class PtyManager {
  private processes: Map<string, PtyProcess> = new Map();

  create(id: string, cwd: string, onData: (data: string) => void): void {
    if (this.processes.has(id)) {
      this.destroy(id);
    }

    const shell = process.env.SHELL || '/bin/zsh';

    const ptyProcess = pty.spawn(shell, ['-l'], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd,
      env: {
        ...process.env,
        TERM: 'xterm-256color',
        COLORTERM: 'truecolor',
        LANG: process.env.LANG || 'en_US.UTF-8',
      },
    });

    ptyProcess.onData(onData);
    ptyProcess.onExit(({ exitCode }: { exitCode: number }) => {
      console.log(`PTY ${id} exited with code ${exitCode}`);
      this.processes.delete(id);
    });

    this.processes.set(id, { pty: ptyProcess, onData });
  }

  write(id: string, data: string): void {
    const process = this.processes.get(id);
    if (process) {
      process.pty.write(data);
    }
  }

  resize(id: string, cols: number, rows: number): void {
    const process = this.processes.get(id);
    if (process) {
      process.pty.resize(cols, rows);
    }
  }

  destroy(id: string): void {
    const process = this.processes.get(id);
    if (process) {
      process.pty.kill();
      this.processes.delete(id);
    }
  }

  destroyAll(): void {
    for (const [id] of this.processes) {
      this.destroy(id);
    }
  }
}

interface Project {
  path: string;
  name: string;
  startupCommand?: string;
}

type GitStatusType = 'clean' | 'modified' | 'ahead' | 'behind' | 'diverged' | 'no-remote' | 'not-git' | 'error';

interface GitStatus {
  status: GitStatusType;
  ahead?: number;
  behind?: number;
  modified?: number;
  untracked?: number;
}

// Get git status for a project directory
function getGitStatus(projectPath: string): GitStatus {
  const { execSync } = require('node:child_process');
  const pathModule = require('node:path');
  const fs = require('node:fs');

  // Check if it's a git repo
  const gitDir = pathModule.join(projectPath, '.git');
  if (!fs.existsSync(gitDir)) {
    return { status: 'not-git' };
  }

  try {
    // Get porcelain status for local changes
    let modified = 0;
    let untracked = 0;
    try {
      const statusOutput = execSync('git status --porcelain', {
        cwd: projectPath,
        encoding: 'utf8',
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'pipe']
      }).trim();

      if (statusOutput) {
        const lines = statusOutput.split('\n');
        for (const line of lines) {
          if (line.startsWith('??')) {
            untracked++;
          } else {
            modified++;
          }
        }
      }
    } catch {
      // Ignore status errors
    }

    // Check ahead/behind remote
    let ahead = 0;
    let behind = 0;
    try {
      const revOutput = execSync('git rev-list --count --left-right HEAD...@{u}', {
        cwd: projectPath,
        encoding: 'utf8',
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'pipe']
      }).trim();

      const parts = revOutput.split(/\s+/);
      if (parts.length === 2) {
        ahead = parseInt(parts[0], 10) || 0;
        behind = parseInt(parts[1], 10) || 0;
      }
    } catch {
      // No upstream configured
      if (modified > 0 || untracked > 0) {
        return { status: 'modified', modified, untracked };
      }
      return { status: 'no-remote' };
    }

    // Determine overall status
    if (ahead > 0 && behind > 0) {
      return { status: 'diverged', ahead, behind, modified, untracked };
    } else if (ahead > 0) {
      return { status: 'ahead', ahead, modified, untracked };
    } else if (behind > 0) {
      return { status: 'behind', behind, modified, untracked };
    } else if (modified > 0 || untracked > 0) {
      return { status: 'modified', modified, untracked };
    }

    return { status: 'clean' };
  } catch (error) {
    console.error('Git status error for', projectPath, error);
    return { status: 'error' };
  }
}

interface GitFixPlan {
  canFix: boolean;
  actions: string[];
  commands: string[];
  warning?: string;
}

// Figure out what needs to be done to fix git status
function getGitFixPlan(projectPath: string): GitFixPlan {
  const status = getGitStatus(projectPath);
  const actions: string[] = [];
  const commands: string[] = [];
  let warning: string | undefined;

  if (status.status === 'clean') {
    return { canFix: false, actions: ['Already clean!'], commands: [] };
  }

  if (status.status === 'not-git') {
    return { canFix: false, actions: ['Not a git repository'], commands: [] };
  }

  if (status.status === 'error') {
    return { canFix: false, actions: ['Error checking git status'], commands: [] };
  }

  // Handle uncommitted changes first
  if ((status.modified || 0) > 0 || (status.untracked || 0) > 0) {
    actions.push(`Stage ${(status.modified || 0) + (status.untracked || 0)} file(s)`);
    actions.push('Commit with auto-generated message');
    commands.push('git add -A');
    commands.push(`git commit -m "Auto-commit: ${new Date().toLocaleString()}"`);
  }

  // Handle sync with remote
  if (status.status === 'behind' || status.status === 'diverged') {
    if (status.status === 'diverged') {
      actions.push(`Pull ${status.behind} commit(s) with rebase`);
      commands.push('git pull --rebase');
      warning = 'This will rebase your local commits on top of remote changes.';
    } else {
      actions.push(`Pull ${status.behind} commit(s)`);
      commands.push('git pull');
    }
  }

  if (status.status === 'ahead' || status.status === 'diverged' ||
    (status.modified || 0) > 0 || (status.untracked || 0) > 0) {
    const commitCount = status.ahead || ((status.modified || 0) > 0 || (status.untracked || 0) > 0 ? 1 : 0);
    if (commitCount > 0) {
      actions.push(`Push ${commitCount} commit(s) to remote`);
      commands.push('git push');
    }
  }

  if (status.status === 'no-remote') {
    return {
      canFix: (status.modified || 0) > 0 || (status.untracked || 0) > 0,
      actions: actions.length > 0 ? actions : ['No remote configured - can only commit locally'],
      commands: commands.filter(c => !c.includes('push') && !c.includes('pull')),
      warning: 'No remote configured. Changes will only be committed locally.'
    };
  }

  return { canFix: actions.length > 0, actions, commands, warning };
}

// Execute the git fix
function executeGitFix(projectPath: string): { success: boolean; output: string; error?: string } {
  const { execSync } = require('node:child_process');
  const plan = getGitFixPlan(projectPath);

  if (!plan.canFix || plan.commands.length === 0) {
    return { success: false, output: '', error: 'Nothing to fix' };
  }

  const outputs: string[] = [];

  try {
    for (const command of plan.commands) {
      console.log(`Executing: ${command} in ${projectPath}`);
      const output = execSync(command, {
        cwd: projectPath,
        encoding: 'utf8',
        timeout: 30000,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      outputs.push(`$ ${command}\n${output}`);
    }
    return { success: true, output: outputs.join('\n') };
  } catch (error: unknown) {
    const err = error as { message?: string; stderr?: string };
    console.error('Git fix error:', err);
    return {
      success: false,
      output: outputs.join('\n'),
      error: err.stderr || err.message || 'Unknown error'
    };
  }
}

interface ProjectData {
  projects: Project[];
}

class ProjectStore {
  private store: InstanceType<typeof Store>;

  constructor() {
    this.store = new Store({
      name: 'vibeterm-projects',
      defaults: {
        projects: [],
      },
    });
    this.migrateFromLegacy();
    this.validateProjects();
  }

  // Migrate from old format (string[]) to new format (Project[])
  private migrateFromLegacy(): void {
    const data = this.store.get('projects', []);
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
      // Old format detected, migrate
      const migrated: Project[] = (data as string[]).map((path: string) => ({
        path,
        name: path.split('/').pop() || path,
      }));
      this.store.set('projects', migrated);
    }
  }

  private validateProjects(): void {
    const fs = require('node:fs');
    const projects = this.store.get('projects', []) as Project[];
    const validProjects = projects.filter((p: Project) => {
      try {
        return fs.existsSync(p.path) && fs.statSync(p.path).isDirectory();
      } catch {
        return false;
      }
    });

    if (validProjects.length !== projects.length) {
      this.store.set('projects', validProjects);
    }
  }

  getProjects(): Project[] {
    return this.store.get('projects', []) as Project[];
  }

  addProject(projectPath: string): Project[] {
    const projects = this.getProjects();
    if (!projects.find(p => p.path === projectPath)) {
      const newProject: Project = {
        path: projectPath,
        name: projectPath.split('/').pop() || projectPath,
      };
      projects.push(newProject);
      this.store.set('projects', projects);
    }
    return this.getProjects();
  }

  removeProject(projectPath: string): Project[] {
    const projects = this.getProjects();
    const filtered = projects.filter((p: Project) => p.path !== projectPath);
    this.store.set('projects', filtered);
    return this.getProjects();
  }

  setProjectCommand(projectPath: string, command: string | undefined): Project[] {
    const projects = this.getProjects();
    const project = projects.find(p => p.path === projectPath);
    if (project) {
      project.startupCommand = command;
      this.store.set('projects', projects);
    }
    return this.getProjects();
  }

  clearAll(): Project[] {
    this.store.set('projects', []);
    return this.getProjects();
  }
}

interface QuickCommand {
  id: string;
  command: string;
  label?: string;
  category?: string;
}

interface AppSettings {
  rootDevDirectory?: string;
  autoScanOnStartup?: boolean;
  quickCommands?: QuickCommand[];
  defaultStartupCommand?: string;
}

const DEFAULT_QUICK_COMMANDS: QuickCommand[] = [
  // AI/Coding
  { id: 'ai-claude', command: 'claude', category: 'AI/Coding' },
  { id: 'ai-aider', command: 'aider', category: 'AI/Coding' },
  { id: 'ai-copilot', command: 'gh copilot', category: 'AI/Coding' },

  // Dev Servers
  { id: 'dev-npm-dev', command: 'npm run dev', category: 'Dev Servers' },
  { id: 'dev-npm-start', command: 'npm start', category: 'Dev Servers' },
  { id: 'dev-yarn-dev', command: 'yarn dev', category: 'Dev Servers' },
  { id: 'dev-python-http', command: 'python -m http.server', category: 'Dev Servers' },
  { id: 'dev-flask', command: 'flask run', category: 'Dev Servers' },
  { id: 'dev-rails', command: 'rails s', category: 'Dev Servers' },

  // Git Tools
  { id: 'git-lazygit', command: 'lazygit', category: 'Git' },
  { id: 'git-tig', command: 'tig', category: 'Git' },
  { id: 'git-status', command: 'git status', category: 'Git' },

  // Editors
  { id: 'edit-nvim', command: 'nvim .', category: 'Editors' },
  { id: 'edit-vim', command: 'vim .', category: 'Editors' },
  { id: 'edit-code', command: 'code .', category: 'Editors' },

  // Utilities
  { id: 'util-htop', command: 'htop', category: 'Utilities' },
  { id: 'util-docker', command: 'docker compose up', category: 'Utilities' },
  { id: 'util-make', command: 'make', category: 'Utilities' },
];

class SettingsStore {
  private store: InstanceType<typeof Store>;

  constructor() {
    this.store = new Store({
      name: 'vibeterm-settings',
      defaults: {
        rootDevDirectory: undefined,
        autoScanOnStartup: false,
        quickCommands: DEFAULT_QUICK_COMMANDS,
        defaultStartupCommand: undefined,
      },
    });
  }

  get(): AppSettings {
    return {
      rootDevDirectory: this.store.get('rootDevDirectory') as string | undefined,
      autoScanOnStartup: this.store.get('autoScanOnStartup', false) as boolean,
      quickCommands: this.store.get('quickCommands', DEFAULT_QUICK_COMMANDS) as QuickCommand[],
      defaultStartupCommand: this.store.get('defaultStartupCommand') as string | undefined,
    };
  }

  set(settings: Partial<AppSettings>): AppSettings {
    if ('rootDevDirectory' in settings) {
      if (settings.rootDevDirectory === undefined) {
        this.store.delete('rootDevDirectory');
      } else {
        this.store.set('rootDevDirectory', settings.rootDevDirectory);
      }
    }
    if (settings.autoScanOnStartup !== undefined) {
      this.store.set('autoScanOnStartup', settings.autoScanOnStartup);
    }
    if ('quickCommands' in settings) {
      if (settings.quickCommands === undefined) {
        this.store.set('quickCommands', DEFAULT_QUICK_COMMANDS);
      } else {
        this.store.set('quickCommands', settings.quickCommands);
      }
    }
    if ('defaultStartupCommand' in settings) {
      if (settings.defaultStartupCommand === undefined) {
        this.store.delete('defaultStartupCommand');
      } else {
        this.store.set('defaultStartupCommand', settings.defaultStartupCommand);
      }
    }
    return this.get();
  }
}

// Scan a directory for projects (recursive, up to depth 3)
function scanForProjects(rootPath: string, depth: number = 0, maxDepth: number = 3): { path: string; name: string }[] {
  if (depth > maxDepth) return [];

  console.log('Scanning for projects in:', rootPath, 'depth:', depth);
  const fs = require('node:fs');
  const pathModule = require('node:path');

  const projectIndicators = [
    '.git',
    'package.json',
    'Cargo.toml',
    'go.mod',
    'pyproject.toml',
    'setup.py',
    'Gemfile',
    'pom.xml',
    'build.gradle',
    '.project',
    'Makefile',
  ];

  const discovered: { path: string; name: string }[] = [];

  try {
    const entries = fs.readdirSync(rootPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('.')) continue; // Skip hidden directories
      if (entry.name === 'node_modules') continue;
      if (entry.name === 'Library') continue; // Skip macOS Library
      if (entry.name === 'Applications') continue;

      const fullPath = pathModule.join(rootPath, entry.name);

      // Check if this directory contains any project indicators
      let isProject = false;
      for (const indicator of projectIndicators) {
        const indicatorPath = pathModule.join(fullPath, indicator);
        if (fs.existsSync(indicatorPath)) {
          console.log('Found project:', entry.name, 'at', fullPath);
          discovered.push({
            path: fullPath,
            name: entry.name,
          });
          isProject = true;
          break;
        }
      }

      // If not a project, recurse into it
      if (!isProject && depth < maxDepth) {
        const nested = scanForProjects(fullPath, depth + 1, maxDepth);
        discovered.push(...nested);
      }
    }
  } catch (error) {
    // Ignore permission errors, etc.
    if (depth === 0) {
      console.error('Error scanning directory:', error);
    }
  }

  if (depth === 0) {
    console.log('Total projects discovered:', discovered.length);
  }
  return discovered;
}

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;
const ptyManager = new PtyManager();
const projectStore = new ProjectStore();
const settingsStore = new SettingsStore();

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0D0F12',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development' || MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.webContents.openDevTools();
  }

  // Clean up PTY processes when window is about to close
  mainWindow.on('close', () => {
    isQuitting = true;
    ptyManager.destroyAll();
  });
};

// Terminal IPC handlers
ipcMain.handle('pty:create', async (_, { id, cwd }: { id: string; cwd: string }) => {
  try {
    ptyManager.create(id, cwd, (data: string) => {
      // Check if window exists, is not destroyed, and we're not quitting
      if (!isQuitting && mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents && !mainWindow.webContents.isDestroyed()) {
        mainWindow.webContents.send('pty:data', { id, data });
      }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('pty:write', async (_, { id, data }: { id: string; data: string }) => {
  ptyManager.write(id, data);
});

ipcMain.handle('pty:resize', async (_, { id, cols, rows }: { id: string; cols: number; rows: number }) => {
  ptyManager.resize(id, cols, rows);
});

ipcMain.handle('pty:destroy', async (_, { id }: { id: string }) => {
  ptyManager.destroy(id);
});

// Project IPC handlers
ipcMain.handle('projects:get', async () => {
  return projectStore.getProjects();
});

ipcMain.handle('projects:add', async (_, projectPath: string) => {
  return projectStore.addProject(projectPath);
});

ipcMain.handle('projects:remove', async (_, projectPath: string) => {
  return projectStore.removeProject(projectPath);
});

ipcMain.handle('projects:setCommand', async (_, { path, command }: { path: string; command: string | undefined }) => {
  return projectStore.setProjectCommand(path, command);
});

ipcMain.handle('projects:scan', async (_, rootPath: string) => {
  const discovered = scanForProjects(rootPath);
  // Add each discovered project (duplicates are handled by addProject)
  for (const project of discovered) {
    projectStore.addProject(project.path);
  }
  return projectStore.getProjects();
});

ipcMain.handle('projects:clearAll', async () => {
  return projectStore.clearAll();
});

ipcMain.handle('settings:get', async () => {
  return settingsStore.get();
});

ipcMain.handle('settings:set', async (_, settings: Partial<AppSettings>) => {
  return settingsStore.set(settings);
});

ipcMain.handle('dialog:openDirectory', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

// Git status handlers
ipcMain.handle('git:status', async (_, projectPath: string) => {
  return getGitStatus(projectPath);
});

ipcMain.handle('git:statusAll', async () => {
  const projects = projectStore.getProjects();
  const statuses: Record<string, GitStatus> = {};

  for (const project of projects) {
    statuses[project.path] = getGitStatus(project.path);
  }

  return statuses;
});

ipcMain.handle('git:fixPlan', async (_, projectPath: string) => {
  return getGitFixPlan(projectPath);
});

ipcMain.handle('git:fix', async (_, projectPath: string) => {
  return executeGitFix(projectPath);
});

// Git push
ipcMain.handle('git:push', async (_, projectPath: string) => {
  const { execSync } = require('node:child_process');
  try {
    const output = execSync('git push', {
      cwd: projectPath,
      encoding: 'utf8',
      timeout: 60000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return { success: true, output };
  } catch (error: unknown) {
    const err = error as { message?: string; stderr?: string };
    return { success: false, error: err.stderr || err.message || 'Push failed' };
  }
});

// Git pull
ipcMain.handle('git:pull', async (_, projectPath: string) => {
  const { execSync } = require('node:child_process');
  try {
    const output = execSync('git pull', {
      cwd: projectPath,
      encoding: 'utf8',
      timeout: 60000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return { success: true, output };
  } catch (error: unknown) {
    const err = error as { message?: string; stderr?: string };
    return { success: false, error: err.stderr || err.message || 'Pull failed' };
  }
});

// Git fetch
ipcMain.handle('git:fetch', async (_, projectPath: string) => {
  const { execSync } = require('node:child_process');
  try {
    const output = execSync('git fetch', {
      cwd: projectPath,
      encoding: 'utf8',
      timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return { success: true, output };
  } catch (error: unknown) {
    const err = error as { message?: string; stderr?: string };
    return { success: false, error: err.stderr || err.message || 'Fetch failed' };
  }
});

// Context menu for projects
ipcMain.handle('context-menu:project', async (event, { projectPath, x, y }: { projectPath: string; x: number; y: number }) => {
  return new Promise<{ action: string } | null>((resolve) => {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'Open in Finder',
        click: () => {
          shell.showItemInFolder(projectPath);
          resolve({ action: 'openInFinder' });
        },
      },
      { type: 'separator' },
      {
        label: 'GitHub',
        submenu: [
          {
            label: 'Push',
            click: () => resolve({ action: 'git:push' }),
          },
          {
            label: 'Pull',
            click: () => resolve({ action: 'git:pull' }),
          },
          { type: 'separator' },
          {
            label: 'Fetch',
            click: () => resolve({ action: 'git:fetch' }),
          },
          {
            label: 'Fix...',
            click: () => resolve({ action: 'git:fix' }),
          },
        ],
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    menu.popup({
      window: BrowserWindow.fromWebContents(event.sender) || undefined,
      x,
      y,
      callback: () => {
        resolve(null);
      },
    });
  });
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  ptyManager.destroyAll();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    isQuitting = false; // Reset flag when creating new window
    createWindow();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  ptyManager.destroyAll();
});
