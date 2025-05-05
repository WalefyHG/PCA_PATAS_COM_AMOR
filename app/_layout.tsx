import "../i18n";
import React from "react";
import RouterLayout from "./app/_layout";
import * as eva from "@eva-design/eva";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
import { ThemeProvider, useThemeContext } from "./utils/ThemeContext";

const Main = () => {
    const { paperTheme, evaTheme } = useThemeContext();

    return (
        <PaperProvider theme={paperTheme}>
            <IconRegistry icons={EvaIconsPack} />
            <ApplicationProvider {...eva} theme={evaTheme}>
                <SafeAreaProvider>
                    <RouterLayout />
                </SafeAreaProvider>
            </ApplicationProvider>
        </PaperProvider>
    );
};

export default function App() {
    return (
        <ThemeProvider>
            <Main />
        </ThemeProvider>
    );
}
