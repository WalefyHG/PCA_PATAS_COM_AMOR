// utils/ThemeContext.tsx
import React, { createContext, useContext, useState, useMemo } from 'react';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import * as eva from '@eva-design/eva';

const ThemeContext = createContext<{
    isDarkTheme: boolean;
    toggleTheme: () => void;
    paperTheme: typeof MD3DarkTheme;
    evaTheme: typeof eva.dark;
} | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [isDarkTheme, setIsDarkTheme] = useState(false);

    const toggleTheme = () => setIsDarkTheme((prev) => !prev);

    const paperTheme = isDarkTheme ? MD3DarkTheme : MD3LightTheme;
    const evaTheme = isDarkTheme ? eva.dark : eva.light;

    const value = useMemo(() => ({
        isDarkTheme,
        toggleTheme,
        paperTheme,
        evaTheme,
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
