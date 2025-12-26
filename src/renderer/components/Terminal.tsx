import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { useTheme } from '../ThemeContext';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
    id: string;
    cwd: string;
    startupCommand?: string;
}

const Terminal: React.FC<TerminalProps> = ({ id, cwd, startupCommand }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<XTerm | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const { theme } = useTheme();
    const [isDragOver, setIsDragOver] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;

        // Create terminal instance with current theme
        const terminal = new XTerm({
            cursorBlink: true,
            cursorStyle: 'bar',
            fontSize: 13,
            fontFamily: '"JetBrains Mono", Menlo, Monaco, "Courier New", monospace',
            lineHeight: 1.3,
            letterSpacing: 0,
            theme: theme.terminal,
            allowProposedApi: true,
        });

        // Add addons
        const fitAddon = new FitAddon();
        const webLinksAddon = new WebLinksAddon();
        terminal.loadAddon(fitAddon);
        terminal.loadAddon(webLinksAddon);

        terminalRef.current = terminal;
        fitAddonRef.current = fitAddon;

        // Open terminal in container
        terminal.open(containerRef.current);

        // Focus the terminal
        terminal.focus();

        // Initial fit
        setTimeout(() => {
            fitAddon.fit();
            terminal.focus();
        }, 100);

        // Create PTY process
        window.electron.pty.create(id, cwd).then((result) => {
            if (!result.success) {
                terminal.writeln(`\x1b[31mError: ${result.error}\x1b[0m`);
            } else if (startupCommand) {
                // Send startup command after a short delay to let shell initialize
                setTimeout(() => {
                    window.electron.pty.write(id, startupCommand + '\n');
                }, 500);
            }
        });

        // Handle data from PTY
        const unsubscribe = window.electron.pty.onData((event) => {
            if (event.id === id) {
                terminal.write(event.data);
            }
        });

        // Send input to PTY
        terminal.onData((data) => {
            window.electron.pty.write(id, data);
        });

        // Handle resize
        terminal.onResize(({ cols, rows }) => {
            window.electron.pty.resize(id, cols, rows);
        });

        // Resize observer
        const resizeObserver = new ResizeObserver(() => {
            if (fitAddonRef.current) {
                fitAddonRef.current.fit();
            }
        });
        resizeObserver.observe(containerRef.current);

        // Cleanup
        return () => {
            resizeObserver.disconnect();
            unsubscribe();
            terminal.dispose();
        };
    }, [id, cwd, startupCommand]);

    // Update theme when it changes
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.options.theme = theme.terminal;
        }
    }, [theme]);

    const handleClick = () => {
        if (terminalRef.current) {
            terminalRef.current.focus();
        }
    };

    // Drag-and-drop handlers for file path insertion
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const files = e.dataTransfer?.files;
        if (!files?.length) return;

        // Get file paths, quote them for shell safety
        const paths = Array.from(files)
            .map(file => `"${(file as any).path}"`)
            .join(' ');

        // Write to PTY (sends to shell)
        window.electron.pty.write(id, paths);
    };

    return (
        <div
            ref={containerRef}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="w-full h-full min-h-[200px] cursor-text"
            style={{
                padding: '8px',
                backgroundColor: theme.terminal.background,
                boxShadow: isDragOver ? `inset 0 0 0 2px ${theme.accent}` : 'none',
                transition: 'box-shadow 0.15s ease',
            }}
        />
    );
};

export default Terminal;
