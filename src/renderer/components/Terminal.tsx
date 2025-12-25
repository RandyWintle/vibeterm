import React, { useEffect, useRef } from 'react';
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

    return (
        <div
            ref={containerRef}
            onClick={handleClick}
            className="w-full h-full min-h-[200px] cursor-text"
            style={{ padding: '8px', backgroundColor: theme.terminal.background }}
        />
    );
};

export default Terminal;
