import React, { useState } from 'react';
import { Project } from '../App';

interface ProjectConfigProps {
    project: Project;
    onSave: (path: string, command: string | undefined) => void;
    onClose: () => void;
}

const ProjectConfig: React.FC<ProjectConfigProps> = ({ project, onSave, onClose }) => {
    const [command, setCommand] = useState(project.startupCommand || '');

    const handleSave = () => {
        onSave(project.path, command.trim() || undefined);
    };

    const presets = ['claude', 'npm run dev', 'npm start', 'code .', 'git status'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="modal-backdrop animate-backdrop"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="modal w-full max-w-md mx-4 animate-fade-up-bounce">
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
                        <input
                            type="text"
                            value={command}
                            onChange={(e) => setCommand(e.target.value)}
                            placeholder="e.g., claude, npm run dev, code ."
                            className="input font-mono"
                        />
                        <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                            This command will automatically run when you open a terminal for this project.
                        </p>
                    </div>

                    {/* Quick Presets */}
                    <div>
                        <label className="section-header block mb-3">
                            Quick Presets
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {presets.map((preset, index) => (
                                <button
                                    key={preset}
                                    onClick={() => setCommand(preset)}
                                    className="preset-pill animate-scale-in-bounce"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {preset}
                                </button>
                            ))}
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
