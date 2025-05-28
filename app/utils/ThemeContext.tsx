import React, { createContext, useContext, useState, useMemo } from 'react';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import * as eva from '@eva-design/eva';

// Cores modernas personalizadas
const customColors = {
    primary: '#6366F1', // Indigo vibrante
    primaryDark: '#4F46E5',
    primaryLight: '#818CF8',
    secondary: '#F472B6', // Rosa moderno
    secondaryDark: '#EC4899',
    secondaryLight: '#F9A8D4',
    success: '#10B981', // Verde esmeralda
    warning: '#F59E0B', // Âmbar
    error: '#EF4444', // Vermelho
    info: '#3B82F6', // Azul
    background: {
        light: '#FFFFFF',
        dark: '#111827'
    },
    surface: {
        light: '#F9FAFB',
        dark: '#1F2937'
    },
    text: {
        light: '#1F2937',
        dark: '#F9FAFB'
    }
};

// Criando temas personalizados
const createCustomTheme = (isDark: boolean) => {
    const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;

    return {
        ...baseTheme,
        colors: {
            ...baseTheme.colors,
            primary: customColors.primary,
            primaryContainer: isDark ? customColors.primaryDark : customColors.primaryLight,
            secondary: customColors.secondary,
            secondaryContainer: isDark ? customColors.secondaryDark : customColors.secondaryLight,
            background: isDark ? customColors.background.dark : customColors.background.light,
            surface: isDark ? customColors.surface.dark : customColors.surface.light,
            error: customColors.error,
            onBackground: isDark ? customColors.text.dark : customColors.text.light,
            onSurface: isDark ? customColors.text.dark : customColors.text.light,
        },
    };
};

const ThemeContext = createContext<{
    isDarkTheme: boolean;
    toggleTheme: () => void;
    setTheme: (isDark: boolean) => void;
    paperTheme: typeof MD3DarkTheme;
    evaTheme: typeof eva.dark;
    colors: typeof customColors;
} | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [isDarkTheme, setIsDarkTheme] = useState(false);

    const toggleTheme = () => setIsDarkTheme((prev) => !prev);
    const setTheme = (isDark: boolean) => setIsDarkTheme(isDark);
    const paperTheme = createCustomTheme(isDarkTheme);
    const evaTheme = isDarkTheme ? eva.dark : eva.light;

    const value = useMemo(() => ({
        isDarkTheme,
        toggleTheme,
        setTheme,
        paperTheme,
        evaTheme,
        colors: customColors
    }), [isDarkTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useThemeContext must be used inside ThemeProvider');
    return context;
};
