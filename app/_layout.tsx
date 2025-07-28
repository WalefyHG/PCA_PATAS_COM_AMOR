import "../i18n";
import React from "react";
import RouterLayout from "./app/_layout";
import * as eva from "@eva-design/eva";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
import { ThemeProvider, useThemeContext } from "./presentation/contexts/ThemeContext";
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Main = () => {
    const { paperTheme, evaTheme } = useThemeContext();

    return (
        <GestureHandlerRootView>
            <PaperProvider theme={paperTheme}>
                <IconRegistry icons={EvaIconsPack} />
                <ApplicationProvider {...eva} theme={evaTheme}>
                    <SafeAreaProvider>
                        <RouterLayout />
                    </SafeAreaProvider>
                </ApplicationProvider>
            </PaperProvider>
        </GestureHandlerRootView>
    );
};

export default function App() {
    return (
        <ThemeProvider>
            <Main />
        </ThemeProvider>
    );
}
