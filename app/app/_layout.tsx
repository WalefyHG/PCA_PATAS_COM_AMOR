import CadastroProvider from "./registers/CadastroProvider";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import Toastable from "../components/Toastable";
import '../../global.css';
import { LinkingOptions, NavigationContainer, NavigationIndependentTree } from "@react-navigation/native";




const linking: LinkingOptions<ReactNavigation.RootParamList> = {
    prefixes: ['http://localhost:8081', 'patascomamor://'],
    config: {
        screens: {
            Home: "/",
            Registers: {
                path: "registers",
                screens: {
                    Screen1: "Screen1",
                    Screen2: "Screen2",
                    Screen3: "Screen3",
                    FinishScreen: "FinishScreen",
                }
            },
            Tabs: {
                path: "tabs",
                screens: {
                    User: "User",
                    Profile: "Profile",
                    About: "About",
                    Settings: "Settings",
                    News: "News",
                }
            }
        }
    }
}


// Screens
import HomeScreen from "./index";
import RegistersLayout from "./registers/_layout";
import AppLayout from "./(tabs)/_layout";



const Stack = createNativeStackNavigator();

export default function RouterLayout() {

    return (
        <CadastroProvider>
            <NavigationIndependentTree >
                <NavigationContainer linking={linking}>
                    <SafeAreaProvider>
                        <Toastable />
                        <Stack.Navigator
                            screenOptions={{
                                headerShown: false,
                                contentStyle: {
                                    flex: 1,
                                    overflow: "scroll",
                                    backgroundColor: "#fff",
                                },
                            }}
                            initialRouteName="Home"
                        >
                            <Stack.Screen
                                name="Home"
                                component={HomeScreen}
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name="registers"
                                component={RegistersLayout}
                                options={{ title: "Registers" }}
                            />
                            <Stack.Screen
                                name="Tabs"
                                component={AppLayout}
                                options={{ title: "Tabs" }}
                            />
                        </Stack.Navigator>
                    </SafeAreaProvider>
                </NavigationContainer>
            </NavigationIndependentTree>
        </CadastroProvider>
    )
}