import React from 'react';
import Terminal from './Terminal';
import { TerminalInstance } from '../App';

interface TerminalGridProps {
    terminals: TerminalInstance[];
    onCloseTerminal: (id: string) => void;
}

const TerminalGrid: React.FC<TerminalGridProps> = ({ terminals, onCloseTerminal }) => {
    // Calculate grid columns based on terminal count
    const getGridClass = () => {
        const count = terminals.length;
        if (count === 1) return 'grid-cols-1';
        if (count === 2) return 'grid-cols-2';
        if (count <= 4) return 'grid-cols-2';
        if (count <= 6) return 'grid-cols-3';
        return 'grid-cols-3';
    };

    return (
        <div className={`flex-1 grid ${getGridClass()} gap-2 p-2 overflow-hidden`}>
            {terminals.map((terminal, index) => (
                <div
                    key={terminal.id}
                    className="terminal-container relative animate-scale-in-bounce rounded-lg overflow-hidden"
                    style={{
                        animationDelay: `${index * 60}ms`,
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg-base)',
                    }}
                >
                    {/* Terminal header with gradient */}
                    <div className="terminal-header">
                        <div className="terminal-header-title">
                            <span className="text-sm opacity-60">📁</span>
                            <div className="min-w-0">
                                <span
                                    className="block text-sm truncate font-medium"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    {terminal.name}
                                </span>
                                {terminal.startupCommand && (
                                    <span
                                        className="block text-xs truncate font-mono"
                                        style={{ color: 'var(--accent-muted)' }}
                                    >
                                        → {terminal.startupCommand}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => onCloseTerminal(terminal.id)}
                            className="terminal-close-btn"
                            title="Close terminal"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Terminal content with inner shadow */}
                    <div className="terminal-inner">
                        <Terminal
                            id={terminal.id}
                            cwd={terminal.cwd}
                            startupCommand={terminal.startupCommand}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TerminalGrid;
