import React, { useState, useEffect } from 'react';

interface AppSettings {
    rootDevDirectory?: string;
    autoScanOnStartup?: boolean;
}

interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
    onProjectsUpdated: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, onProjectsUpdated }) => {
    const [settings, setSettings] = useState<AppSettings>({});
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        if (isOpen && window.electron) {
            window.electron.settings.get().then(setSettings);
        }
    }, [isOpen]);

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

                    {/* Theme Section - Simplified since we only have Velocity */}
                    <div>
                        <h3 className="section-header mb-4">
                            Theme
                        </h3>
                        <div
                            className="card p-4 flex items-center gap-4"
                            style={{ backgroundColor: 'var(--bg-surface)' }}
                        >
                            {/* Color dots preview */}
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EF4444' }} />
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10B981' }} />
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00D9FF' }} />
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#C084FC' }} />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                    Velocity
                                </div>
                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    Electric cyan on warm charcoal
                                </div>
                            </div>
                            <div className="badge badge-accent">Active</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
