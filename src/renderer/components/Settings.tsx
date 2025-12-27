import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';

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

interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
    onProjectsUpdated: () => void;
}

// Theme color previews for visual display
const themeColorPreviews: Record<string, string[]> = {
    'velocity': ['#EF4444', '#10B981', '#00D9FF', '#C084FC'],
    'zen-garden': ['#C97065', '#8B9A6D', '#C9A86C', '#7A8B9A'],
    'neon-noir': ['#FF4757', '#00F5A0', '#FF2E97', '#B026FF'],
    'forest-canopy': ['#E57373', '#4ADE80', '#D4A656', '#5C9FD4'],
    'monolith': ['#C9A0A0', '#A0C9A0', '#FFFFFF', '#A0B0C9'],
    'vibe-mode': ['#FF4757', '#00FF9F', '#FF6B35', '#00E5FF'],
};

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, onProjectsUpdated }) => {
    const { theme, setThemeById, availableThemes } = useTheme();
    const [settings, setSettings] = useState<AppSettings>({});
    const [scanning, setScanning] = useState(false);
    const [newCommand, setNewCommand] = useState('');

    useEffect(() => {
        if (isOpen && window.electron) {
            window.electron.settings.get().then(setSettings);
        }
    }, [isOpen]);

    const handleSetDefaultCommand = async (command: string) => {
        if (!window.electron) return;
        const newSettings = await window.electron.settings.set({
            defaultStartupCommand: command || undefined
        });
        setSettings(newSettings);
    };

    const handleAddQuickCommand = async () => {
        if (!window.electron || !newCommand.trim()) return;
        const currentCommands = settings.quickCommands || [];
        const newQuickCommand: QuickCommand = {
            id: `custom-${Date.now()}`,
            command: newCommand.trim(),
            category: 'Custom',
        };
        const newSettings = await window.electron.settings.set({
            quickCommands: [...currentCommands, newQuickCommand]
        });
        setSettings(newSettings);
        setNewCommand('');
    };

    const handleRemoveQuickCommand = async (id: string) => {
        if (!window.electron) return;
        const currentCommands = settings.quickCommands || [];
        const newSettings = await window.electron.settings.set({
            quickCommands: currentCommands.filter(cmd => cmd.id !== id)
        });
        setSettings(newSettings);
    };

    const handleSetRootDirectory = async () => {
        if (!window.electron) return;
        const path = await window.electron.dialog.openDirectory();
        if (path) {
            const newSettings = await window.electron.settings.set({ rootDevDirectory: path });
            setSettings(newSettings);
        }
    };

    const handleScanNow = async () => {
        if (!settings.rootDevDirectory || !window.electron) return;
        setScanning(true);
        try {
            await window.electron.projects.scan(settings.rootDevDirectory);
            onProjectsUpdated();
        } finally {
            setScanning(false);
        }
    };

    const handleClearRootDirectory = async () => {
        if (!window.electron) return;
        await window.electron.projects.clearAll();
        const newSettings = await window.electron.settings.set({ rootDevDirectory: undefined });
        setSettings(newSettings);
        onProjectsUpdated();
    };

    const handleToggleAutoScan = async () => {
        if (!window.electron) return;
        const newSettings = await window.electron.settings.set({
            autoScanOnStartup: !settings.autoScanOnStartup
        });
        setSettings(newSettings);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop with blur */}
            <div
                className="modal-backdrop animate-backdrop"
                onClick={onClose}
            />

            {/* Modal with bounce animation */}
            <div className="modal w-full max-w-lg mx-4 animate-fade-up-bounce">
                {/* Header */}
                <div className="modal-header flex items-center justify-between">
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Settings
                    </h2>
                    <button
                        onClick={onClose}
                        className="btn-icon"
                        title="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="modal-body">
                    {/* Project Discovery Section */}
                    <div className="mb-6">
                        <h3 className="section-header mb-4">
                            Project Discovery
                        </h3>

                        <div className="mb-4">
                            <label
                                className="block text-sm font-medium mb-2"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                Root Dev Directory
                            </label>
                            <div className="flex gap-2">
                                <div
                                    className="input flex-1 truncate flex items-center"
                                    style={{
                                        color: settings.rootDevDirectory ? 'var(--text-primary)' : 'var(--text-muted)',
                                    }}
                                >
                                    {settings.rootDevDirectory || 'Not set'}
                                </div>
                                <button
                                    onClick={handleSetRootDirectory}
                                    className="btn btn-outline"
                                >
                                    Browse
                                </button>
                                {settings.rootDevDirectory && (
                                    <button
                                        onClick={handleClearRootDirectory}
                                        className="btn btn-outline btn-danger"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                                VibeTerm will scan this directory for projects (folders containing .git, package.json, etc.)
                            </p>
                        </div>

                        {/* Auto-scan toggle */}
                        <div className="flex items-center justify-between py-3">
                            <label
                                className="text-sm"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                Auto-scan on startup
                            </label>
                            <button
                                onClick={handleToggleAutoScan}
                                className={`toggle ${settings.autoScanOnStartup ? 'active' : ''}`}
                            >
                                <div className="toggle-knob" />
                            </button>
                        </div>

                        {/* Scan button */}
                        {settings.rootDevDirectory && (
                            <button
                                onClick={handleScanNow}
                                disabled={scanning}
                                className="w-full btn btn-primary mt-2"
                            >
                                {scanning ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Scanning...
                                    </span>
                                ) : (
                                    'Scan for Projects Now'
                                )}
                            </button>
                        )}
                    </div>

                    {/* Terminal Commands Section */}
                    <div className="mb-6">
                        <h3 className="section-header mb-4">
                            Terminal Commands
                        </h3>

                        {/* Default Startup Command */}
                        <div className="mb-4">
                            <label
                                className="block text-sm font-medium mb-2"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                Default Startup Command
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={settings.defaultStartupCommand || ''}
                                    onChange={(e) => handleSetDefaultCommand(e.target.value)}
                                    placeholder="e.g., npm run dev"
                                    className="input flex-1"
                                />
                                {settings.defaultStartupCommand && (
                                    <button
                                        onClick={() => handleSetDefaultCommand('')}
                                        className="btn btn-outline"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                                Runs for all projects without a custom command
                            </p>
                        </div>

                        {/* Quick Commands */}
                        <div>
                            <label
                                className="block text-sm font-medium mb-2"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                Quick Command Presets
                            </label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={newCommand}
                                    onChange={(e) => setNewCommand(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddQuickCommand()}
                                    placeholder="Add custom command..."
                                    className="input flex-1"
                                />
                                <button
                                    onClick={handleAddQuickCommand}
                                    disabled={!newCommand.trim()}
                                    className="btn btn-primary"
                                >
                                    Add
                                </button>
                            </div>
                            <div
                                className="max-h-40 overflow-y-auto rounded-lg p-3"
                                style={{ backgroundColor: 'var(--bg-surface)' }}
                            >
                                <div className="flex flex-wrap gap-2">
                                    {(settings.quickCommands || []).map((cmd) => (
                                        <span
                                            key={cmd.id}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono"
                                            style={{
                                                backgroundColor: 'var(--bg-tertiary)',
                                                color: 'var(--text-primary)',
                                            }}
                                        >
                                            {cmd.command}
                                            <button
                                                onClick={() => handleRemoveQuickCommand(cmd.id)}
                                                className="ml-1 opacity-60 hover:opacity-100"
                                                title="Remove"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                                {(settings.quickCommands || []).length} commands available as quick presets
                            </p>
                        </div>
                    </div>

                    {/* Theme Section */}
                    <div>
                        <h3 className="section-header mb-4">
                            Theme
                        </h3>
                        <div className="space-y-2">
                            {availableThemes.map((t) => {
                                const isActive = theme.id === t.id;
                                const colors = themeColorPreviews[t.id] || ['#666', '#888', '#AAA', '#CCC'];
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => setThemeById(t.id)}
                                        className={`card card-interactive w-full p-4 flex items-center gap-4 text-left transition-all ${
                                            isActive ? 'ring-2 ring-offset-2' : ''
                                        }`}
                                        style={{
                                            backgroundColor: isActive ? 'var(--bg-elevated, var(--bg-surface))' : 'var(--bg-surface)',
                                            borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                                            // @ts-expect-error CSS custom properties
                                            '--tw-ring-color': 'var(--accent)',
                                            '--tw-ring-offset-color': 'var(--bg-base)',
                                        }}
                                    >
                                        {/* Color dots preview */}
                                        <div className="flex gap-1.5">
                                            {colors.map((color, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`w-3 h-3 rounded-full ${t.isAnimated ? 'animate-pulse' : ''}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="text-sm font-medium"
                                                    style={{ color: 'var(--text-primary)' }}
                                                >
                                                    {t.name}
                                                </span>
                                                {t.isAnimated && (
                                                    <span
                                                        className="text-xs px-1.5 py-0.5 rounded"
                                                        style={{
                                                            backgroundColor: 'rgba(255, 107, 53, 0.15)',
                                                            color: '#FF6B35',
                                                        }}
                                                    >
                                                        ANIMATED
                                                    </span>
                                                )}
                                            </div>
                                            <div
                                                className="text-xs truncate"
                                                style={{ color: 'var(--text-muted)' }}
                                            >
                                                {t.description || 'No description'}
                                            </div>
                                        </div>
                                        {isActive && (
                                            <div className="badge badge-accent flex-shrink-0">Active</div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                            {availableThemes.length} themes available. Your selection is saved automatically.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
