import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppTheme, getTheme, defaultTheme, applyThemeToDocument } from './themes';

interface ThemeContextType {
    theme: AppTheme;
    setThemeById: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

interface ThemeProviderProps {
    children: React.ReactNode;
}

const THEME_STORAGE_KEY = 'vibeterm-theme';

export function ThemeProvider({ children }: ThemeProviderProps): React.ReactElement {
    // Always use the default (velocity) theme - clear any old theme from storage
    const [theme, setTheme] = useState<AppTheme>(() => {
        // Clear old theme from localStorage to force velocity
        const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedThemeId && savedThemeId !== 'velocity') {
            localStorage.removeItem(THEME_STORAGE_KEY);
        }
        return defaultTheme;
    });

    // Apply theme immediately on mount
    useEffect(() => {
        applyThemeToDocument(defaultTheme);
    }, []);

    const setThemeById = useCallback((id: string) => {
        const newTheme = getTheme(id);
        setTheme(newTheme);
        applyThemeToDocument(newTheme);
        localStorage.setItem(THEME_STORAGE_KEY, id);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setThemeById }}>
            {children}
        </ThemeContext.Provider>
    );
}
