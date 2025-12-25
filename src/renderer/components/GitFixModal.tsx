import React, { useState, useEffect } from 'react';
import { Project } from '../App';

interface GitFixPlan {
    canFix: boolean;
    actions: string[];
    commands: string[];
    warning?: string;
}

interface GitFixModalProps {
    project: Project;
    onClose: () => void;
    onFixed: () => void;
}

const GitFixModal: React.FC<GitFixModalProps> = ({ project, onClose, onFixed }) => {
    const [plan, setPlan] = useState<GitFixPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [fixing, setFixing] = useState(false);
    const [result, setResult] = useState<{ success: boolean; output: string; error?: string } | null>(null);

    useEffect(() => {
        if (window.electron) {
            window.electron.git.fixPlan(project.path).then((p) => {
                setPlan(p);
                setLoading(false);
            });
        }
    }, [project.path]);

    const handleFix = async () => {
        if (!window.electron) return;
        setFixing(true);
        try {
            const res = await window.electron.git.fix(project.path);
            setResult(res);
            if (res.success) {
                onFixed();
            }
        } catch (error) {
            setResult({ success: false, output: '', error: String(error) });
        } finally {
            setFixing(false);
        }
    };

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
                    <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <span>🪄</span>
                        Fix Git Status
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
                    <div className="flex items-center gap-3 mb-6">
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

                    {loading ? (
                        <div className="py-12 text-center">
                            <div className="inline-block mb-3">
                                <svg className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24">
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
                            </div>
                            <p style={{ color: 'var(--text-muted)' }}>Analyzing git status...</p>
                        </div>
                    ) : result ? (
                        // Show result
                        <div className="animate-scale-in-bounce">
                            {result.success ? (
                                <div
                                    className="card p-4 mb-4"
                                    style={{ backgroundColor: 'var(--success-glow)', border: '1px solid var(--success)' }}
                                >
                                    <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--success)' }}>
                                        <span className="text-xl">✓</span>
                                        <span className="font-semibold">Fixed!</span>
                                    </div>
                                    <pre
                                        className="text-xs overflow-auto max-h-40 p-3 rounded-lg font-mono"
                                        style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-secondary)' }}
                                    >
                                        {result.output || 'All done!'}
                                    </pre>
                                </div>
                            ) : (
                                <div
                                    className="card p-4 mb-4"
                                    style={{ backgroundColor: 'var(--danger-glow)', border: '1px solid var(--danger)' }}
                                >
                                    <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--danger)' }}>
                                        <span className="text-xl">✗</span>
                                        <span className="font-semibold">Error</span>
                                    </div>
                                    <pre
                                        className="text-xs overflow-auto max-h-40 p-3 rounded-lg font-mono"
                                        style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-secondary)' }}
                                    >
                                        {result.error || result.output || 'Unknown error'}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ) : plan && !plan.canFix ? (
                        // Nothing to fix
                        <div
                            className="card p-6 text-center animate-scale-in-bounce"
                            style={{ backgroundColor: 'var(--bg-surface)' }}
                        >
                            <span className="text-3xl block mb-3">✨</span>
                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                {plan.actions[0]}
                            </p>
                        </div>
                    ) : plan ? (
                        // Show plan
                        <div>
                            <h4 className="section-header mb-3">Planned Actions</h4>
                            <ul className="space-y-2 mb-6">
                                {plan.actions.map((action, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-2 text-sm animate-slide-in-bounce"
                                        style={{ animationDelay: `${i * 50}ms`, color: 'var(--text-secondary)' }}
                                    >
                                        <span style={{ color: 'var(--accent)' }}>→</span>
                                        {action}
                                    </li>
                                ))}
                            </ul>

                            {plan.warning && (
                                <div
                                    className="card p-3 mb-6 flex items-start gap-2"
                                    style={{ backgroundColor: 'var(--warning-glow)', border: '1px solid var(--warning)' }}
                                >
                                    <span>⚠️</span>
                                    <p className="text-sm" style={{ color: 'var(--warning)' }}>{plan.warning}</p>
                                </div>
                            )}

                            <h4 className="section-header mb-3">Commands to Execute</h4>
                            <div
                                className="card p-4 font-mono text-xs space-y-1.5"
                                style={{ backgroundColor: 'var(--bg-base)' }}
                            >
                                {plan.commands.map((cmd, i) => (
                                    <div
                                        key={i}
                                        className="animate-slide-in-bounce"
                                        style={{ animationDelay: `${(plan.actions.length + i) * 50}ms`, color: 'var(--text-secondary)' }}
                                    >
                                        <span style={{ color: 'var(--success)' }}>$</span> {cmd}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button
                        onClick={onClose}
                        className="btn btn-ghost"
                    >
                        {result ? 'Close' : 'Cancel'}
                    </button>
                    {!result && plan?.canFix && (
                        <button
                            onClick={handleFix}
                            disabled={fixing}
                            className="btn btn-primary"
                        >
                            {fixing ? (
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
                                    Fixing...
                                </span>
                            ) : (
                                'Fix It!'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GitFixModal;
