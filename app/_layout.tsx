import React from "react";
import RouterLayout from "./app/_layout";
import * as eva from "@eva-design/eva";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";


export default function App() {
    return (
        <>
            <PaperProvider theme={eva.light}>
                <IconRegistry icons={EvaIconsPack} />
                <ApplicationProvider {...eva} theme={eva.light}>
                    <SafeAreaProvider>
                        <RouterLayout />
                    </SafeAreaProvider>
                </ApplicationProvider>
            </PaperProvider>
        </>
    )
}
