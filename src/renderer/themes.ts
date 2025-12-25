// Theme definitions for VibeTerm
// Velocity: Electric cyan on warm charcoal

export interface TerminalTheme {
    background: string;
    foreground: string;
    cursor: string;
    cursorAccent: string;
    selectionBackground: string;
    selectionForeground: string;
    black: string;
    red: string;
    green: string;
    yellow: string;
    blue: string;
    magenta: string;
    cyan: string;
    white: string;
    brightBlack: string;
    brightRed: string;
    brightGreen: string;
    brightYellow: string;
    brightBlue: string;
    brightMagenta: string;
    brightCyan: string;
    brightWhite: string;
}

export interface AppTheme {
    name: string;
    id: string;
    // App UI colors
    sidebarBg: string;
    sidebarHover: string;
    terminalBg: string;
    accent: string;
    accentHover: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    danger: string;
    success: string;
    // Terminal colors
    terminal: TerminalTheme;
}

// Velocity theme - the signature VibeTerm look
const velocityTheme: AppTheme = {
    name: 'Velocity',
    id: 'velocity',
    // App UI colors - warm charcoal with electric cyan
    sidebarBg: '#0A0C0F',
    sidebarHover: '#141820',
    terminalBg: '#0D0F12',
    accent: '#00D9FF',
    accentHover: '#33E1FF',
    textPrimary: '#F0F4F8',
    textSecondary: '#94A3B8',
    textMuted: '#475569',
    border: 'rgba(0, 217, 255, 0.08)',
    danger: '#EF4444',
    success: '#10B981',
    terminal: {
        background: '#0D0F12',
        foreground: '#E2E8F0',
        cursor: '#00D9FF',
        cursorAccent: '#0D0F12',
        selectionBackground: 'rgba(0, 217, 255, 0.25)',
        selectionForeground: '#F0F4F8',
        // ANSI colors tuned for warm charcoal
        black: '#1E293B',
        red: '#F87171',
        green: '#34D399',
        yellow: '#FBBF24',
        blue: '#60A5FA',
        magenta: '#C084FC',
        cyan: '#22D3EE',
        white: '#E2E8F0',
        brightBlack: '#475569',
        brightRed: '#FCA5A5',
        brightGreen: '#6EE7B7',
        brightYellow: '#FCD34D',
        brightBlue: '#93C5FD',
        brightMagenta: '#D8B4FE',
        brightCyan: '#67E8F9',
        brightWhite: '#F8FAFC',
    },
};

export const themes: Record<string, AppTheme> = {
    'velocity': velocityTheme,
};

export const themeList = Object.values(themes);
export const defaultTheme = velocityTheme;

export function getTheme(id: string): AppTheme {
    return themes[id] || defaultTheme;
}

export function applyThemeToDocument(theme: AppTheme): void {
    const root = document.documentElement;
    root.style.setProperty('--sidebar-bg', theme.sidebarBg);
    root.style.setProperty('--sidebar-hover', theme.sidebarHover);
    root.style.setProperty('--terminal-bg', theme.terminalBg);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent-hover', theme.accentHover);
    root.style.setProperty('--text-primary', theme.textPrimary);
    root.style.setProperty('--text-secondary', theme.textSecondary);
    root.style.setProperty('--text-muted', theme.textMuted);
    root.style.setProperty('--border', theme.border);
    root.style.setProperty('--danger', theme.danger);
    root.style.setProperty('--success', theme.success);

    // Also set the new naming convention
    root.style.setProperty('--bg-base', theme.terminalBg);
    root.style.setProperty('--bg-sidebar', theme.sidebarBg);
    root.style.setProperty('--bg-surface', theme.sidebarHover);
}
