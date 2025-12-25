import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TerminalGrid from './components/TerminalGrid';
import Settings from './components/Settings';
import ProjectConfig from './components/ProjectConfig';
import GitFixModal from './components/GitFixModal';
import { v4 as uuidv4 } from 'uuid';

export interface Project {
    path: string;
    name: string;
    startupCommand?: string;
}

export interface TerminalInstance {
    id: string;
    cwd: string;
    name: string;
    startupCommand?: string;
}

const App: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [terminals, setTerminals] = useState<TerminalInstance[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [configProject, setConfigProject] = useState<Project | null>(null);
    const [fixProject, setFixProject] = useState<Project | null>(null);
    const [sidebarWidth, setSidebarWidth] = useState(260); // Default width 260px

    useEffect(() => {
        // Check if electron API is available
        if (!window.electron) {
            setError('Electron API not available. Make sure you are running in Electron.');
            console.error('window.electron is undefined');
            return;
        }

        // Load saved projects on mount
        window.electron.projects.get()
            .then(setProjects)
            .catch((err) => {
                console.error('Failed to load projects:', err);
                setError(String(err));
            });
    }, []);

    const handleAddProject = useCallback(async () => {
        if (!window.electron) return;
        const path = await window.electron.dialog.openDirectory();
        if (path) {
            const updatedProjects = await window.electron.projects.add(path);
            setProjects(updatedProjects);
        }
    }, []);

    const handleRemoveProject = useCallback(async (path: string) => {
        if (!window.electron) return;
        const updatedProjects = await window.electron.projects.remove(path);
        setProjects(updatedProjects);
    }, []);

    const handleConfigureProject = useCallback((project: Project) => {
        setConfigProject(project);
    }, []);

    const handleSaveProjectConfig = useCallback(async (path: string, command: string | undefined) => {
        if (!window.electron) return;
        const updatedProjects = await window.electron.projects.setCommand(path, command);
        setProjects(updatedProjects);
        setConfigProject(null);
    }, []);

    const handleOpenTerminal = useCallback((project: Project) => {
        const newTerminal: TerminalInstance = {
            id: uuidv4(),
            cwd: project.path,
            name: project.name,
            startupCommand: project.startupCommand,
        };
        setTerminals((prev) => [...prev, newTerminal]);
    }, []);

    const handleCloseTerminal = useCallback((id: string) => {
        if (window.electron) {
            window.electron.pty.destroy(id);
        }
        setTerminals((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const handleOpenQuickTerminal = useCallback(() => {
        const homeDir = window.electron?.env?.home || '/';
        const quickProject: Project = {
            path: homeDir,
            name: 'Terminal',
        };
        handleOpenTerminal(quickProject);
    }, [handleOpenTerminal]);

    // Show error state
    if (error) {
        return (
            <div className="flex h-screen items-center justify-center" style={{ backgroundColor: 'var(--terminal-bg)', color: 'var(--danger)' }}>
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Error</h1>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen" style={{ backgroundColor: 'var(--terminal-bg)' }}>
            {/* Title bar drag region */}
            <div className="fixed top-0 left-0 right-0 h-8 drag-region z-50" />

            {/* Sidebar */}
            <Sidebar
                projects={projects}
                onAddProject={handleAddProject}
                onRemoveProject={handleRemoveProject}
                onOpenTerminal={handleOpenTerminal}
                onConfigureProject={handleConfigureProject}
                onOpenSettings={() => setSettingsOpen(true)}
                onGitFix={(project) => setFixProject(project)}
                width={sidebarWidth}
                onResize={setSidebarWidth}
            />

            {/* Main content area */}
            <main className="flex-1 flex flex-col pt-8 overflow-hidden">
                {terminals.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                        <div className="text-6xl mb-6">🚀</div>
                        <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Welcome to VibeTerm</h2>
                        <p className="text-lg mb-8">Select a project from the sidebar or open a quick terminal</p>
                        <button
                            onClick={handleOpenQuickTerminal}
                            className="btn btn-primary text-lg px-6 py-3"
                        >
                            Open Terminal
                        </button>
                    </div>
                ) : (
                    <TerminalGrid
                        terminals={terminals}
                        onCloseTerminal={handleCloseTerminal}
                    />
                )}
            </main>

            {/* Settings Modal */}
            <Settings
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                onProjectsUpdated={async () => {
                    if (window.electron) {
                        const updated = await window.electron.projects.get();
                        setProjects(updated);
                    }
                }}
            />

            {/* Project Config Modal */}
            {configProject && (
                <ProjectConfig
                    project={configProject}
                    onSave={handleSaveProjectConfig}
                    onClose={() => setConfigProject(null)}
                />
            )}

            {/* Git Fix Modal */}
            {fixProject && (
                <GitFixModal
                    project={fixProject}
                    onClose={() => setFixProject(null)}
                    onFixed={() => {
                        // Refresh git status (will be handled by sidebar auto-refresh)
                        // But we could trigger a global refresh if we lifted that state up
                    }}
                />
            )}
        </div>
    );
};

export default App;
