import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { BottomNavigation, BottomNavigationTab, Icon, IconElement } from "@ui-kitten/components";
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRoute, RouteProp } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

const Stack = createNativeStackNavigator();
const { Navigator, Screen } = createBottomTabNavigator();

// Screens

import User from './users/index';
import Profile from './profile/[id]';
import About from './about/index';
import Settings from './settings/index';
import News from './news/index';
import HeaderLayout from "@/app/utils/HeaderLayout";
import { useThemeContext } from "@/app/utils/ThemeContext";
import Adopt from "@/app/screens/Adopt";
import AddBlogPost from "@/app/screens/AddBlogPost";

// Interfaces




const HomeIcon = (props: any): IconElement => (
    <Icon {...props} name='home-outline' />
);

const ProfileIcon = (props: any): IconElement => (
    <Icon {...props} name='person-outline' />
);

const AboutIcon = (props: any): IconElement => (
    <Icon {...props} name='info-outline' />
);

const SettingsIcon = (props: any): IconElement => (
    <Icon {...props} name='settings-2-outline' />
);

const NewsIcon = (props: any): IconElement => (
    <Icon {...props} name='book-open-outline' />
);




const BottomTabBar = ({ navigation, state }: BottomTabBarProps) => {
    const { t } = useTranslation();
    return (
        <BottomNavigation
            selectedIndex={state.index}
            onSelect={index => navigation.navigate(state.routeNames[index])}>
            <BottomNavigationTab title={t("Users")} icon={HomeIcon} />
            <BottomNavigationTab title={t("Profile")} icon={ProfileIcon} />
            <BottomNavigationTab title={t("About")} icon={AboutIcon} />
            <BottomNavigationTab title={t("Settings")} icon={SettingsIcon} />
            <BottomNavigationTab title={t("News")} icon={NewsIcon} />
        </BottomNavigation>
    );
}

type ProfileRouteParams = {
    Profile: {
        id: string | null;
    };
};

const TabLayout = () => {
    const route = useRoute<RouteProp<ProfileRouteParams, 'Profile'>>();
    const { paperTheme } = useThemeContext(); // Obtendo o tema do react-native-paper
    const { t } = useTranslation();
    return (
        <Navigator
            tabBar={props => <BottomTabBar {...props} />}
            screenOptions={{
                headerRight: () => <HeaderLayout />,
                headerTitleAlign: "left",
                headerStyle: {
                    backgroundColor: paperTheme.colors.primary,
                },
                headerTintColor: paperTheme.colors.surface,
                headerTitleStyle: {
                    fontWeight: 'bold',
                    color: paperTheme.colors.surface,
                },
            }}
        >
            <Screen name='User' component={User} options={{ title: t("Users") }} />
            <Screen name='Profile' component={Profile} initialParams={{ id: route.params?.id ?? null }} options={{ title: t("Profile") }} />
            <Screen name='About' component={About} options={{ title: t("About") }} />
            <Screen name='Settings' component={Settings} options={{ title: t("Settings") }} />
            <Screen name='News' component={News} options={{ title: t("News") }} />
        </Navigator>
    )
}

const AppLayout = () => {
    const { t } = useTranslation();
    const { paperTheme } = useThemeContext();
    return (
        <Stack.Navigator screenOptions={{}}>
            <Stack.Screen name="(tabs)" component={TabLayout} options={{ headerShown: false }} />
            <Stack.Screen name="Adopt" component={Adopt} options={{
                headerRight: () => <HeaderLayout />,
                title: t("Adopt"),
                headerTitleAlign: "left",
                headerStyle: {
                    backgroundColor: paperTheme.colors.primary,
                },
                headerTintColor: paperTheme.colors.surface,
                headerTitleStyle: {
                    fontWeight: 'bold',
                    color: paperTheme.colors.surface,
                },
            }} />
            <Stack.Screen name="AddBlogPost" component={AddBlogPost} options={{
                headerRight: () => <HeaderLayout />,
                title: t("Add Blog Post"),
                headerTitleAlign: "left",
                headerStyle: {
                    backgroundColor: paperTheme.colors.primary,
                },
                headerTintColor: paperTheme.colors.surface,
                headerTitleStyle: {
                    fontWeight: 'bold',
                    color: paperTheme.colors.surface,
                },
            }} />
        </Stack.Navigator>
    )
}

export default AppLayout;