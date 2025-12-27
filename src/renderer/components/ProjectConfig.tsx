import React, { useState, useEffect, useMemo } from 'react';
import { Project } from '../App';

interface QuickCommand {
    id: string;
    command: string;
    label?: string;
    category?: string;
}

interface AppSettings {
    quickCommands?: QuickCommand[];
    defaultStartupCommand?: string;
}

interface ProjectConfigProps {
    project: Project;
    onSave: (path: string, command: string | undefined) => void;
    onClose: () => void;
}

const ProjectConfig: React.FC<ProjectConfigProps> = ({ project, onSave, onClose }) => {
    const [command, setCommand] = useState(project.startupCommand || '');
    const [settings, setSettings] = useState<AppSettings>({});
    const [searchFilter, setSearchFilter] = useState('');

    useEffect(() => {
        if (window.electron) {
            window.electron.settings.get().then(setSettings);
        }
    }, []);

    const handleSave = () => {
        onSave(project.path, command.trim() || undefined);
    };

    const handleClear = () => {
        setCommand('');
    };

    // Group commands by category
    const groupedCommands = useMemo(() => {
        const commands = settings.quickCommands || [];
        const filtered = searchFilter
            ? commands.filter(c =>
                c.command.toLowerCase().includes(searchFilter.toLowerCase()) ||
                c.label?.toLowerCase().includes(searchFilter.toLowerCase())
            )
            : commands;

        return filtered.reduce((acc, cmd) => {
            const cat = cmd.category || 'Other';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(cmd);
            return acc;
        }, {} as Record<string, QuickCommand[]>);
    }, [settings.quickCommands, searchFilter]);

    // Category display order
    const categoryOrder = ['AI/Coding', 'Dev Servers', 'Git', 'Editors', 'Utilities', 'Custom', 'Other'];
    const sortedCategories = Object.keys(groupedCommands).sort((a, b) => {
        const aIndex = categoryOrder.indexOf(a);
        const bIndex = categoryOrder.indexOf(b);
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="modal-backdrop animate-backdrop"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="modal w-full max-w-lg mx-4 animate-fade-up-bounce">
                {/* Header */}
                <div className="modal-header flex items-center justify-between">
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Configure Project
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
                    {/* Project info */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📁</span>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                                    {project.name}
                                </h3>
                                <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>
                                    {project.path}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Startup Command */}
                    <div className="mb-6">
                        <label className="section-header block mb-2">
                            Startup Command
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={command}
                                onChange={(e) => setCommand(e.target.value)}
                                placeholder="e.g., claude, npm run dev, code ."
                                className="input font-mono flex-1"
                            />
                            {command && (
                                <button
                                    onClick={handleClear}
                                    className="btn btn-outline"
                                    title="Clear to use default"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                            This command runs when you open a terminal for this project.
                            {settings.defaultStartupCommand && !command && (
                                <span style={{ color: 'var(--accent)' }}>
                                    {' '}Global default: {settings.defaultStartupCommand}
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Quick Commands */}
                    <div>
                        <label className="section-header block mb-2">
                            Quick Commands
                        </label>
                        <input
                            type="text"
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                            placeholder="Search commands..."
                            className="input mb-3"
                        />
                        <div
                            className="max-h-48 overflow-y-auto rounded-lg p-3"
                            style={{ backgroundColor: 'var(--bg-surface)' }}
                        >
                            {sortedCategories.length === 0 ? (
                                <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                                    No commands found
                                </p>
                            ) : (
                                sortedCategories.map((category) => (
                                    <div key={category} className="mb-3 last:mb-0">
                                        <div
                                            className="text-xs font-medium mb-2"
                                            style={{ color: 'var(--text-muted)' }}
                                        >
                                            {category}
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {groupedCommands[category].map((cmd) => (
                                                <button
                                                    key={cmd.id}
                                                    onClick={() => setCommand(cmd.command)}
                                                    className="preset-pill"
                                                >
                                                    {cmd.label || cmd.command}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button
                        onClick={onClose}
                        className="btn btn-ghost"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="btn btn-primary"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectConfig;
