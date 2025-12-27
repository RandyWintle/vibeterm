import { contextBridge, ipcRenderer, webUtils } from 'electron';

export interface Project {
    path: string;
    name: string;
    startupCommand?: string;
}

export interface QuickCommand {
    id: string;
    command: string;
    label?: string;
    category?: string;
}

export interface AppSettings {
    rootDevDirectory?: string;
    autoScanOnStartup?: boolean;
    quickCommands?: QuickCommand[];
    defaultStartupCommand?: string;
}

export type GitStatusType = 'clean' | 'modified' | 'ahead' | 'behind' | 'diverged' | 'no-remote' | 'not-git' | 'error';

export interface GitStatus {
    status: GitStatusType;
    ahead?: number;
    behind?: number;
    modified?: number;
    untracked?: number;
}

export interface ElectronAPI {
    pty: {
        create: (id: string, cwd: string) => Promise<{ success: boolean; error?: string }>;
        write: (id: string, data: string) => void;
        resize: (id: string, cols: number, rows: number) => void;
        destroy: (id: string) => void;
        onData: (callback: (event: { id: string; data: string }) => void) => () => void;
    };
    projects: {
        get: () => Promise<Project[]>;
        add: (path: string) => Promise<Project[]>;
        remove: (path: string) => Promise<Project[]>;
        setCommand: (path: string, command: string | undefined) => Promise<Project[]>;
        scan: (rootPath: string) => Promise<Project[]>;
        clearAll: () => Promise<Project[]>;
    };
    settings: {
        get: () => Promise<AppSettings>;
        set: (settings: Partial<AppSettings>) => Promise<AppSettings>;
    };
    git: {
        status: (projectPath: string) => Promise<GitStatus>;
        statusAll: () => Promise<Record<string, GitStatus>>;
        fixPlan: (projectPath: string) => Promise<GitFixPlan>;
        fix: (projectPath: string) => Promise<GitFixResult>;
        push: (projectPath: string) => Promise<GitOpResult>;
        pull: (projectPath: string) => Promise<GitOpResult>;
        fetch: (projectPath: string) => Promise<GitOpResult>;
    };
    contextMenu: {
        showProject: (projectPath: string, x: number, y: number) => Promise<{ action: string } | null>;
    };
    dialog: {
        openDirectory: () => Promise<string | null>;
    };
    env: {
        home: string;
    };
    utils: {
        getFilePath: (file: File) => string;
    };
}

export interface GitFixPlan {
    canFix: boolean;
    actions: string[];
    commands: string[];
    warning?: string;
}

export interface GitFixResult {
    success: boolean;
    output: string;
    error?: string;
}

export interface GitOpResult {
    success: boolean;
    output?: string;
    error?: string;
}

// Get home directory using process.env (available in preload)
const homeDir = process.env.HOME || process.env.USERPROFILE || '/';

const electronAPI: ElectronAPI = {
    pty: {
        create: (id: string, cwd: string) => ipcRenderer.invoke('pty:create', { id, cwd }),
        write: (id: string, data: string) => {
            ipcRenderer.invoke('pty:write', { id, data });
        },
        resize: (id: string, cols: number, rows: number) => {
            ipcRenderer.invoke('pty:resize', { id, cols, rows });
        },
        destroy: (id: string) => {
            ipcRenderer.invoke('pty:destroy', { id });
        },
        onData: (callback: (event: { id: string; data: string }) => void) => {
            const handler = (_: Electron.IpcRendererEvent, event: { id: string; data: string }) => {
                callback(event);
            };
            ipcRenderer.on('pty:data', handler);
            return () => ipcRenderer.removeListener('pty:data', handler);
        },
    },
    projects: {
        get: () => ipcRenderer.invoke('projects:get'),
        add: (path: string) => ipcRenderer.invoke('projects:add', path),
        remove: (path: string) => ipcRenderer.invoke('projects:remove', path),
        setCommand: (path: string, command: string | undefined) =>
            ipcRenderer.invoke('projects:setCommand', { path, command }),
        scan: (rootPath: string) => ipcRenderer.invoke('projects:scan', rootPath),
        clearAll: () => ipcRenderer.invoke('projects:clearAll'),
    },
    settings: {
        get: () => ipcRenderer.invoke('settings:get'),
        set: (settings: Partial<AppSettings>) => ipcRenderer.invoke('settings:set', settings),
    },
    git: {
        status: (projectPath: string) => ipcRenderer.invoke('git:status', projectPath),
        statusAll: () => ipcRenderer.invoke('git:statusAll'),
        fixPlan: (projectPath: string) => ipcRenderer.invoke('git:fixPlan', projectPath),
        fix: (projectPath: string) => ipcRenderer.invoke('git:fix', projectPath),
        push: (projectPath: string) => ipcRenderer.invoke('git:push', projectPath),
        pull: (projectPath: string) => ipcRenderer.invoke('git:pull', projectPath),
        fetch: (projectPath: string) => ipcRenderer.invoke('git:fetch', projectPath),
    },
    contextMenu: {
        showProject: (projectPath: string, x: number, y: number) =>
            ipcRenderer.invoke('context-menu:project', { projectPath, x, y }),
    },
    dialog: {
        openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
    },
    env: {
        home: homeDir,
    },
    utils: {
        getFilePath: (file: File) => webUtils.getPathForFile(file),
    },
};

contextBridge.exposeInMainWorld('electron', electronAPI);

declare global {
    interface Window {
        electron: ElectronAPI;
    }
}
