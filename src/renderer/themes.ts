// Theme definitions for VibeTerm
// A collection of distinctive, production-grade themes

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
    description?: string;
    // App UI colors
    sidebarBg: string;
    sidebarHover: string;
    terminalBg: string;
    accent: string;
    accentHover: string;
    accentSecondary?: string; // For gradient/dual accent themes
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    danger: string;
    success: string;
    warning?: string;
    // Special properties for animated themes
    isAnimated?: boolean;
    cursorStyle?: 'block' | 'underline' | 'bar';
    // Terminal colors
    terminal: TerminalTheme;
}

// ============================================
// VELOCITY - The signature VibeTerm look
// Electric cyan on warm charcoal
// ============================================
const velocityTheme: AppTheme = {
    name: 'Velocity',
    id: 'velocity',
    description: 'Electric cyan on warm charcoal - the signature VibeTerm look',
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

// ============================================
// ZEN GARDEN - Calm, meditative focus
// Muted sage greens on warm stone
// Inspired by Japanese rock gardens
// ============================================
const zenGardenTheme: AppTheme = {
    name: 'Zen Garden',
    id: 'zen-garden',
    description: 'Muted sage on warm stone - calm focus for deep work',
    sidebarBg: '#1A1915',
    sidebarHover: '#252320',
    terminalBg: '#1E1D19',
    accent: '#8B9A6D',
    accentHover: '#A3B285',
    textPrimary: '#E8E4DC',
    textSecondary: '#A8A193',
    textMuted: '#6B6459',
    border: 'rgba(139, 154, 109, 0.12)',
    danger: '#C97065',
    success: '#7A9B6D',
    warning: '#C9A86C',
    cursorStyle: 'underline',
    terminal: {
        background: '#1E1D19',
        foreground: '#D8D4C9',
        cursor: '#8B9A6D',
        cursorAccent: '#1E1D19',
        selectionBackground: 'rgba(139, 154, 109, 0.25)',
        selectionForeground: '#E8E4DC',
        // Earthy, muted palette
        black: '#2D2B26',
        red: '#C97065',
        green: '#8B9A6D',
        yellow: '#C9A86C',
        blue: '#7A8B9A',
        magenta: '#9A7A8B',
        cyan: '#6D8B8A',
        white: '#D8D4C9',
        brightBlack: '#5A564F',
        brightRed: '#D99A91',
        brightGreen: '#A8B78A',
        brightYellow: '#D9C18A',
        brightBlue: '#9AAAB8',
        brightMagenta: '#B89AAA',
        brightCyan: '#8AABA9',
        brightWhite: '#F0EDE6',
    },
};

// ============================================
// NEON NOIR - Retro synthwave vibes
// Hot pink and electric purple on deep black
// 80s arcade meets cyberpunk
// ============================================
const neonNoirTheme: AppTheme = {
    name: 'Neon Noir',
    id: 'neon-noir',
    description: 'Hot pink and electric purple - 80s arcade meets cyberpunk',
    sidebarBg: '#0A0A0F',
    sidebarHover: '#15141F',
    terminalBg: '#0D0C14',
    accent: '#FF2E97',
    accentHover: '#FF5CAF',
    accentSecondary: '#B026FF',
    textPrimary: '#F5F0FF',
    textSecondary: '#A89FBF',
    textMuted: '#5C5470',
    border: 'rgba(255, 46, 151, 0.12)',
    danger: '#FF4757',
    success: '#00F5A0',
    warning: '#FFBE0B',
    terminal: {
        background: '#0D0C14',
        foreground: '#E8E0F5',
        cursor: '#FF2E97',
        cursorAccent: '#0D0C14',
        selectionBackground: 'rgba(176, 38, 255, 0.3)',
        selectionForeground: '#F5F0FF',
        // Neon-saturated palette
        black: '#1A1825',
        red: '#FF4757',
        green: '#00F5A0',
        yellow: '#FFBE0B',
        blue: '#00D4FF',
        magenta: '#B026FF',
        cyan: '#00F5FF',
        white: '#E8E0F5',
        brightBlack: '#3D3A50',
        brightRed: '#FF6B7A',
        brightGreen: '#5CFFBE',
        brightYellow: '#FFD55C',
        brightBlue: '#5CE1FF',
        brightMagenta: '#CF6FFF',
        brightCyan: '#5CF5FF',
        brightWhite: '#FFFFFF',
    },
};

// ============================================
// FOREST CANOPY - Deep nature immersion
// Rich greens and warm wood tones
// Like coding in a treehouse
// ============================================
const forestCanopyTheme: AppTheme = {
    name: 'Forest Canopy',
    id: 'forest-canopy',
    description: 'Rich greens and wood tones - like coding in a treehouse',
    sidebarBg: '#0F1510',
    sidebarHover: '#1A231A',
    terminalBg: '#121A13',
    accent: '#4ADE80',
    accentHover: '#6EE7A0',
    accentSecondary: '#A3BE8C',
    textPrimary: '#E8F5E9',
    textSecondary: '#9CB89F',
    textMuted: '#5C6F5F',
    border: 'rgba(74, 222, 128, 0.1)',
    danger: '#E57373',
    success: '#4ADE80',
    warning: '#D4A656',
    terminal: {
        background: '#121A13',
        foreground: '#D4E7D5',
        cursor: '#4ADE80',
        cursorAccent: '#121A13',
        selectionBackground: 'rgba(74, 222, 128, 0.2)',
        selectionForeground: '#E8F5E9',
        // Natural forest palette
        black: '#1E2B20',
        red: '#E57373',
        green: '#4ADE80',
        yellow: '#D4A656',
        blue: '#5C9FD4',
        magenta: '#B88BC7',
        cyan: '#5EC4B6',
        white: '#D4E7D5',
        brightBlack: '#3D5240',
        brightRed: '#EF9A9A',
        brightGreen: '#81E89E',
        brightYellow: '#E4C17A',
        brightBlue: '#81BBE4',
        brightMagenta: '#CEA8DB',
        brightCyan: '#81D4C8',
        brightWhite: '#F1F8F2',
    },
};

// ============================================
// MONOLITH - Minimal grayscale precision
// Pure blacks and whites with subtle warmth
// Maximum focus, zero distraction
// ============================================
const monolithTheme: AppTheme = {
    name: 'Monolith',
    id: 'monolith',
    description: 'Pure grayscale precision - maximum focus, zero distraction',
    sidebarBg: '#0A0A0A',
    sidebarHover: '#141414',
    terminalBg: '#0E0E0E',
    accent: '#FFFFFF',
    accentHover: '#E0E0E0',
    textPrimary: '#F5F5F5',
    textSecondary: '#9E9E9E',
    textMuted: '#525252',
    border: 'rgba(255, 255, 255, 0.06)',
    danger: '#E57373',
    success: '#A5D6A7',
    warning: '#FFE082',
    cursorStyle: 'bar',
    terminal: {
        background: '#0E0E0E',
        foreground: '#E0E0E0',
        cursor: '#FFFFFF',
        cursorAccent: '#0E0E0E',
        selectionBackground: 'rgba(255, 255, 255, 0.15)',
        selectionForeground: '#FFFFFF',
        // Grayscale with subtle warm tints for semantics
        black: '#1A1A1A',
        red: '#C9A0A0',
        green: '#A0C9A0',
        yellow: '#C9C0A0',
        blue: '#A0B0C9',
        magenta: '#B8A0C9',
        cyan: '#A0C0C0',
        white: '#E0E0E0',
        brightBlack: '#404040',
        brightRed: '#D4B5B5',
        brightGreen: '#B5D4B5',
        brightYellow: '#D4CEB5',
        brightBlue: '#B5C5D4',
        brightMagenta: '#C9B5D4',
        brightCyan: '#B5D0D0',
        brightWhite: '#FFFFFF',
    },
};

// ============================================
// VIBE MODE - High-energy animated theme
// Pulsing gradients and dynamic glows
// For when you need to GET SHIT DONE
// ============================================
const vibeModeTheme: AppTheme = {
    name: 'VIBE MODE',
    id: 'vibe-mode',
    description: 'Pulsing energy and dynamic glows - GET SHIT DONE mode',
    isAnimated: true,
    sidebarBg: '#0A0A12',
    sidebarHover: '#141428',
    terminalBg: '#0C0C18',
    accent: '#FF6B35',
    accentHover: '#FF8A5C',
    accentSecondary: '#00E5FF',
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B8D4',
    textMuted: '#5A6080',
    border: 'rgba(255, 107, 53, 0.15)',
    danger: '#FF4757',
    success: '#00FF9F',
    warning: '#FFD93D',
    terminal: {
        background: '#0C0C18',
        foreground: '#F0F4FF',
        cursor: '#FF6B35',
        cursorAccent: '#0C0C18',
        selectionBackground: 'rgba(255, 107, 53, 0.3)',
        selectionForeground: '#FFFFFF',
        // High-contrast, energetic palette
        black: '#181830',
        red: '#FF4757',
        green: '#00FF9F',
        yellow: '#FFD93D',
        blue: '#00E5FF',
        magenta: '#FF6BFF',
        cyan: '#00F5FF',
        white: '#F0F4FF',
        brightBlack: '#3A3A60',
        brightRed: '#FF6B7A',
        brightGreen: '#5CFFBE',
        brightYellow: '#FFE566',
        brightBlue: '#5CEEFF',
        brightMagenta: '#FF99FF',
        brightCyan: '#66F8FF',
        brightWhite: '#FFFFFF',
    },
};

export const themes: Record<string, AppTheme> = {
    'velocity': velocityTheme,
    'zen-garden': zenGardenTheme,
    'neon-noir': neonNoirTheme,
    'forest-canopy': forestCanopyTheme,
    'monolith': monolithTheme,
    'vibe-mode': vibeModeTheme,
};

export const themeList = Object.values(themes);
export const defaultTheme = velocityTheme;

export function getTheme(id: string): AppTheme {
    return themes[id] || defaultTheme;
}

export function applyThemeToDocument(theme: AppTheme): void {
    const root = document.documentElement;

    // Core colors
    root.style.setProperty('--sidebar-bg', theme.sidebarBg);
    root.style.setProperty('--sidebar-hover', theme.sidebarHover);
    root.style.setProperty('--terminal-bg', theme.terminalBg);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent-hover', theme.accentHover);
    root.style.setProperty('--accent-secondary', theme.accentSecondary || theme.accent);
    root.style.setProperty('--text-primary', theme.textPrimary);
    root.style.setProperty('--text-secondary', theme.textSecondary);
    root.style.setProperty('--text-muted', theme.textMuted);
    root.style.setProperty('--border', theme.border);
    root.style.setProperty('--danger', theme.danger);
    root.style.setProperty('--success', theme.success);
    root.style.setProperty('--warning', theme.warning || '#F59E0B');

    // New naming convention
    root.style.setProperty('--bg-base', theme.terminalBg);
    root.style.setProperty('--bg-sidebar', theme.sidebarBg);
    root.style.setProperty('--bg-surface', theme.sidebarHover);

    // Glow colors (derived from accent)
    root.style.setProperty('--accent-glow', hexToRgba(theme.accent, 0.15));
    root.style.setProperty('--accent-glow-strong', hexToRgba(theme.accent, 0.25));

    // Handle animated theme class
    if (theme.isAnimated) {
        root.classList.add('theme-animated', 'vibe-mode-active');
    } else {
        root.classList.remove('theme-animated', 'vibe-mode-active');
    }

    // Set theme ID for CSS selectors
    root.setAttribute('data-theme', theme.id);
}

// Helper to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return hex;
}
