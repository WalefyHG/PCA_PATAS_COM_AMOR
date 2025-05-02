import CadastroProvider from "./registers/CadastroProvider";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import Toastable from "../components/Toastable";
import '../../global.css';
import { LinkingOptions } from "@react-navigation/native";




// const linking: LinkingOptions<ReactNavigation.RootParamList> = {
//     prefixes: ['http://localhost:8081', 'patascomamor://'],
//     config: {
//         screens: {
//             Home: "/",
//             Registers: {
//                 path: "registers",
//                 screens: {
//                     Screen1: "Screen1",
//                     Screen2: "Screen2",
//                     Screen3: "Screen3",
//                     FinishScreen: "FinishScreen",
//                 }
//             },
//             Tabs: {
//                 path: "tabs",
//                 screens: {
//                     User: "User",
//                     Profile: "Profile",
//                     About: "About",
//                     Settings: "Settings",
//                     News: "News",
//                 }
//             }
//         }
//     }
// }


// Screens
import HomeScreen from "./index";
import RegistersLayout from "./registers/_layout";
import TabLayout from "./(tabs)/_layout";
import { S } from "@expo/html-elements";



const Stack = createNativeStackNavigator();

export default function RouterLayout() {

    const { top } = useSafeAreaInsets();

    return (
        <CadastroProvider>
            <SafeAreaProvider>
                <Toastable />

                <Stack.Navigator
                    screenOptions={{
                        headerShown: false,
                        contentStyle: {
                            flex: 1,
                            overflow: "scroll",
                            backgroundColor: "#fff",
                        }
                    }}
                    initialRouteName="Home"
                >
                    <Stack.Screen
                        name="Home"
                        component={HomeScreen}
                        options={{
                            headerShown: false,
                            contentStyle: {
                                flex: 1,
                                backgroundColor: "#fff",
                            }
                        }}

                    />

                    <Stack.Screen
                        name="registers"
                        component={RegistersLayout}
                        options={{
                            title: "Registers",
                            contentStyle: {
                                flex: 1,
                                backgroundColor: "#fff",
                            }
                        }}
                    />

                    <Stack.Screen
                        name="Tabs"
                        component={TabLayout}
                        options={{
                            title: "Tabs",
                            contentStyle: {
                                flex: 1,
                                backgroundColor: "#fff",
                            }
                        }}
                    />
                </Stack.Navigator>
            </SafeAreaProvider>
        </CadastroProvider>
    )
}