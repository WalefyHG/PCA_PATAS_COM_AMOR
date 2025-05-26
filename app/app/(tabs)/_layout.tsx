import { View, StyleSheet, Text, TouchableOpacity, Platform } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useRoute, type RouteProp } from "@react-navigation/native"
import { useTranslation } from "react-i18next"
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import HeaderLayout from "@/app/utils/HeaderLayout";
import { useThemeContext } from "@/app/utils/ThemeContext";

// Screens
import User from './users/index';
import Profile from './profile/[id]';
import About from './about/index';
import Settings from './settings/index';
import News from './news/index';
import Adopt from "@/app/screens/Adopt";
import AddBlogPost from "@/app/screens/AddBlogPost";
import AdminConsole from "@/app/screens/AdminConsole";
import BlogPostDetail from "@/app/screens/NewsDetails"
import PetAdoptionDetail from "@/app/screens/AdoptionDetails"
import AddPet from "@/app/screens/AddPet"
import AddEditUserScreen from "@/app/screens/AddUsers"

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

type ProfileRouteParams = {
    Profile: {
        id: string | null
    }
}

// Custom Tab Bar Component
function CustomTabBar({ state, descriptors, navigation }: any) {
    const { isDarkTheme, colors } = useThemeContext()

    return (
        <View
            style={[
                styles.tabBarContainer,
                {
                    backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF",
                    borderTopColor: isDarkTheme ? "#374151" : "#E5E7EB",
                },
            ]}
        >
            {state.routes.map((route: any, index: number) => {
                const { options } = descriptors[route.key]
                const label = options.tabBarLabel || options.title || route.name

                const isFocused = state.index === index

                let iconName: "users" | "user" | "info" | "settings" | "book-open" | "circle"
                switch (route.name) {
                    case "User":
                        iconName = "users"
                        break
                    case "Profile":
                        iconName = "user"
                        break
                    case "About":
                        iconName = "info"
                        break
                    case "Settings":
                        iconName = "settings"
                        break
                    case "News":
                        iconName = "book-open"
                        break
                    default:
                        iconName = "circle"
                }

                const onPress = () => {
                    const event = navigation.emit({
                        type: "tabPress",
                        target: route.key,
                        canPreventDefault: true,
                    })

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name)
                    }
                }

                return (
                    <TouchableOpacity
                        key={route.key}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        onPress={onPress}
                        style={styles.tabButton}
                    >
                        {isFocused ? (
                            <LinearGradient
                                colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.tabIndicator}
                            />
                        ) : null}

                        <Feather
                            name={iconName}
                            size={20}
                            color={isFocused ? (isDarkTheme ? "#FFFFFF" : colors.primary) : isDarkTheme ? "#9CA3AF" : "#6B7280"}
                        />

                        <Text
                            style={[
                                styles.tabLabel,
                                {
                                    color: isFocused ? (isDarkTheme ? "#FFFFFF" : colors.primary) : isDarkTheme ? "#9CA3AF" : "#6B7280",
                                    fontWeight: isFocused ? "600" : "400",
                                },
                            ]}
                        >
                            {label}
                        </Text>
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

const TabLayout = () => {
    const route = useRoute<RouteProp<ProfileRouteParams, "Profile">>()
    const { t } = useTranslation()
    const { isDarkTheme, colors } = useThemeContext()
    const screenOptions = {
        headerRight: () => <HeaderLayout />,
        headerTitleAlign: "left" as "left",
        headerStyle: {
            backgroundColor: isDarkTheme ? colors.primaryDark : colors.primary,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
            fontSize: 18,
        },
        tabBarHideOnKeyboard: true,
    }

    return (
        <Tab.Navigator
            screenOptions={screenOptions}
            tabBar={(props) => <CustomTabBar {...props} />}
        >
            <Tab.Screen name="User" component={User} options={{ title: t("Users"), headerShown: false }} />
            <Tab.Screen
                name="Profile"
                component={Profile}
                initialParams={{ id: route.params?.id ?? null }}
                options={{ title: t("Profile"), headerShown: false }}
            />
            <Tab.Screen name="About" component={About} options={{ title: t("About"), headerShown: false }} />
            <Tab.Screen name="Settings" component={Settings} options={{ title: t("Settings"), headerShown: false }} />
            <Tab.Screen name="News" component={News} options={{ title: t("News"), headerShown: false }} />
        </Tab.Navigator>
    )
}

const AppLayout = () => {
    const { t } = useTranslation()
    const { isDarkTheme, colors } = useThemeContext()
    const screenOptions = {
        headerRight: () => <HeaderLayout />,
        headerTitleAlign: "left" as "left",
        headerStyle: {
            backgroundColor: isDarkTheme ? colors.primaryDark : colors.primary,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
            fontSize: 18,
        },
        tabBarHideOnKeyboard: true,
    }
    return (
        <Stack.Navigator screenOptions={screenOptions}>
            <Stack.Screen name="(tabs)" component={TabLayout} options={{ headerShown: false }} />
            <Stack.Screen name="Adopt" component={Adopt} options={{ title: t("Adopt"), headerShown: false }} />
            <Stack.Screen name="AddBlogPost" component={AddBlogPost} options={{ title: t("Add Blog Post") }} />
            <Stack.Screen name="AdminConsole" component={AdminConsole} options={{ title: t("Admin Console"), headerShown: false }} />
            <Stack.Screen name="NewsDetails" component={BlogPostDetail} options={{ title: t("News Details"), headerShown: false }} />
            <Stack.Screen name="AdoptDetails" component={PetAdoptionDetail} options={{ title: t("Adopt Details"), headerShown: false }} />
            <Stack.Screen name="AddPet" component={AddPet} options={{ title: t("Add Pet") }} />
            <Stack.Screen name="AddUsers" component={AddEditUserScreen} options={{ title: t("Add User") }} />
        </Stack.Navigator>
    )
}

const styles = StyleSheet.create({
    tabBarContainer: {
        flexDirection: "row",
        height: 60,
        borderTopWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    tabButton: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 8,
    },
    tabIndicator: {
        position: "absolute",
        top: 0,
        height: 3,
        width: "50%",
        borderBottomLeftRadius: 3,
        borderBottomRightRadius: 3,
    },
    tabLabel: {
        fontSize: 12,
        marginTop: 4,
    },
})

export default AppLayout;