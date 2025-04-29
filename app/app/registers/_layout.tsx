import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CadastroProvider from "./CadastroProvider";


// Screens
import Screen2Component from "./Screen2";
import Screen3Component from "./Screen3";
import FinishScreen from "./FinishScreen";
import Registers from ".";

const Stack = createNativeStackNavigator();

export default function RegistersLayout() {
    return (
        <SafeAreaProvider>
            <CadastroProvider>
                <Stack.Navigator
                    screenOptions={{
                        headerShown: false,
                        contentStyle: {
                            flex: 1,
                            overflow: "scroll",
                            backgroundColor: "#fff",
                        }
                    }}
                    initialRouteName="Screen1"
                >

                    <Stack.Screen
                        name="Screen1"
                        component={Registers}
                        options={{
                            headerShown: false,
                            contentStyle: {
                                flex: 1,
                                backgroundColor: "#fff",
                            }
                        }}
                    />

                    <Stack.Screen
                        name="Screen2"
                        component={Screen2Component}
                        options={{
                            headerShown: false,
                            contentStyle: {
                                flex: 1,
                                backgroundColor: "#fff",
                            }
                        }}
                    />
                    <Stack.Screen
                        name="Screen3"
                        component={Screen3Component}
                        options={{
                            headerShown: false,
                            contentStyle: {
                                flex: 1,
                                backgroundColor: "#fff",
                            }
                        }}
                    />
                    <Stack.Screen
                        name="FinishScreen"
                        component={FinishScreen}
                        options={{
                            headerShown: false,
                            contentStyle: {
                                flex: 1,
                                backgroundColor: "#fff",
                            }
                        }}
                    />
                </Stack.Navigator>
            </CadastroProvider>
        </SafeAreaProvider>
    )
}

