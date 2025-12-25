import React, { useState, useEffect, useCallback } from 'react';
import { Project } from '../App';

type GitStatusType = 'clean' | 'modified' | 'ahead' | 'behind' | 'diverged' | 'no-remote' | 'not-git' | 'error';

interface GitStatus {
    status: GitStatusType;
    ahead?: number;
    behind?: number;
    modified?: number;
    untracked?: number;
}

interface SidebarProps {
    projects: Project[];
    onAddProject: () => void;
    onRemoveProject: (path: string) => void;
    onOpenTerminal: (project: Project) => void;
    onConfigureProject: (project: Project) => void;
    onOpenSettings: () => void;
    onGitFix: (project: Project) => void;
    width: number;
    onResize: (width: number) => void;
}

interface GitStatusBadgeProps {
    status: GitStatus;
    onClick?: (e: React.MouseEvent) => void;
}

const GitStatusBadge: React.FC<GitStatusBadgeProps> = ({ status, onClick }) => {
    const getConfig = () => {
        switch (status.status) {
            case 'clean':
                return {
                    icon: '✓',
                    className: 'git-status git-clean',
                    title: 'Clean - up to date',
                    clickable: false
                };
            case 'modified':
                return {
                    icon: '●',
                    className: 'git-status git-modified',
                    title: `${status.modified || 0} modified, ${status.untracked || 0} untracked - click to fix`,
                    clickable: true
                };
            case 'ahead':
                return {
                    icon: '↑',
                    className: 'git-status git-ahead',
                    title: `${status.ahead} commit${status.ahead !== 1 ? 's' : ''} ahead - click to push`,
                    clickable: true
                };
            case 'behind':
                return {
                    icon: '↓',
                    className: 'git-status git-behind',
                    title: `${status.behind} commit${status.behind !== 1 ? 's' : ''} behind - click to pull`,
                    clickable: true
                };
            case 'diverged':
                return {
                    icon: '⇅',
                    className: 'git-status git-diverged',
                    title: `${status.ahead} ahead, ${status.behind} behind - click to fix`,
                    clickable: true
                };
            case 'no-remote':
                return {
                    icon: '○',
                    className: 'git-status git-no-remote',
                    title: 'No remote configured',
                    clickable: false
                };
            case 'not-git':
            case 'error':
            default:
                return null;
        }
    };

    const config = getConfig();
    if (!config) return null;

    const handleClick = (e: React.MouseEvent) => {
        if (config.clickable && onClick) {
            e.stopPropagation();
            onClick(e);
        }
    };

    return (
        <span
            className={`${config.className} ${config.clickable ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            title={config.title}
            onClick={handleClick}
        >
            {config.icon}
        </span>
    );
};

const Sidebar: React.FC<SidebarProps> = ({
    projects,
    onAddProject,
    onRemoveProject,
    onOpenTerminal,
    onConfigureProject,
    onOpenSettings,
    onGitFix,
    width,
    onResize,
}) => {
    const [gitStatuses, setGitStatuses] = useState<Record<string, GitStatus>>({});
    const [refreshing, setRefreshing] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    const refreshGitStatuses = useCallback(async () => {
        if (!window.electron || projects.length === 0) return;
        setRefreshing(true);
        try {
            const statuses = await window.electron.git.statusAll();
            setGitStatuses(statuses);
        } catch (error) {
            console.error('Failed to fetch git statuses:', error);
        } finally {
            setRefreshing(false);
        }
    }, [projects.length]);

    useEffect(() => {
        refreshGitStatuses();
    }, [refreshGitStatuses]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isResizing) {
                const newWidth = Math.max(200, Math.min(600, e.clientX));
                onResize(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.body.style.cursor = 'default';
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'default';
        };
    }, [isResizing, onResize]);

    return (
        <aside
            className="border-r flex flex-col pt-10 relative"
            style={{
                width: `${width}px`,
                backgroundColor: 'var(--bg-sidebar)',
                borderColor: 'var(--border)',
            }}
        >
            {/* Resize Handle */}
            <div
                className="resize-handle"
                onMouseDown={() => setIsResizing(true)}
            />

            {/* Header with glowing logo */}
            <div className="sidebar-header">
                <h1
                    className="text-lg font-bold flex items-center gap-2 logo-glow"
                    style={{ color: 'var(--accent)' }}
                >
                    <span className="text-xl">⚡</span>
                    <span className="tracking-tight">VibeTerm</span>
                </h1>
            </div>

            {/* Projects Section */}
            <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
                <div className="px-4 mb-3 flex items-center justify-between">
                    <span className="section-header">Projects</span>
                    <div className="flex items-center gap-1">
                        {/* Refresh button */}
                        <button
                            onClick={refreshGitStatuses}
                            disabled={refreshing}
                            className="btn-icon no-drag"
                            title="Refresh git status"
                        >
                            <svg
                                className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                        </button>
                        {/* Add project button */}
                        <button
                            onClick={onAddProject}
                            className="btn-icon no-drag"
                            title="Add project"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                </div>

                {projects.length === 0 ? (
                    <div
                        className="px-4 py-12 text-center animate-fade-in"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <div className="text-3xl mb-3 opacity-50">📁</div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                            No projects yet
                        </p>
                        <p className="text-xs mt-1">
                            Click + to add a folder
                        </p>
                    </div>
                ) : (
                    <ul className="px-2 space-y-0.5">
                        {projects.map((project, index) => (
                            <li
                                key={project.path}
                                className="project-item group animate-slide-in-bounce no-drag"
                                style={{ animationDelay: `${index * 40}ms` }}
                            >
                                <button
                                    onClick={() => onOpenTerminal(project)}
                                    className="flex-1 flex items-center gap-2 text-left overflow-hidden"
                                >
                                    <span className="text-base opacity-70 flex-shrink-0">📁</span>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                                                style={{ color: 'var(--text-primary)' }}
                                            >
                                                {project.name}
                                            </span>
                                            {gitStatuses[project.path] && (
                                                <span className="flex-shrink-0">
                                                    <GitStatusBadge
                                                        status={gitStatuses[project.path]}
                                                        onClick={() => onGitFix(project)}
                                                    />
                                                </span>
                                            )}
                                        </div>
                                        {project.startupCommand && (
                                            <span
                                                className="block truncate text-xs font-mono mt-0.5"
                                                style={{ color: 'var(--accent-muted)' }}
                                            >
                                                → {project.startupCommand}
                                            </span>
                                        )}
                                    </div>
                                </button>

                                {/* Action buttons - appear on hover, positioned absolutely to not affect layout */}
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'var(--bg-sidebar)' }}>
                                    {/* Configure button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onConfigureProject(project);
                                        }}
                                        className="btn-icon"
                                        title="Configure project"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                            />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </button>
                                    {/* Remove button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveProject(project.path);
                                        }}
                                        className="btn-icon btn-danger"
                                        title="Remove project"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Footer */}
            <div
                className="p-3 border-t space-y-2"
                style={{ borderColor: 'var(--border)' }}
            >
                <button
                    onClick={() => {
                        const homeDir = window.electron?.env?.home || '/';
                        onOpenTerminal({ path: homeDir, name: 'Terminal' });
                    }}
                    className="w-full btn btn-outline text-sm flex items-center justify-center gap-2 no-drag"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    New Terminal
                </button>
                <button
                    onClick={onOpenSettings}
                    className="w-full btn btn-ghost text-sm flex items-center justify-center gap-2 no-drag"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
