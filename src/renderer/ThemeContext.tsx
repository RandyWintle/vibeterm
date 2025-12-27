import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppTheme, getTheme, defaultTheme, applyThemeToDocument, themeList } from './themes';

interface ThemeContextType {
    theme: AppTheme;
    setThemeById: (id: string) => void;
    availableThemes: AppTheme[];
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
    // Load saved theme or use default
    const [theme, setTheme] = useState<AppTheme>(() => {
        const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedThemeId) {
            return getTheme(savedThemeId);
        }
        return defaultTheme;
    });

    // Apply theme immediately on mount
    useEffect(() => {
        applyThemeToDocument(theme);
    }, []);

    const setThemeById = useCallback((id: string) => {
        const newTheme = getTheme(id);
        setTheme(newTheme);
        applyThemeToDocument(newTheme);
        localStorage.setItem(THEME_STORAGE_KEY, id);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setThemeById, availableThemes: themeList }}>
            {children}
        </ThemeContext.Provider>
    );
}
