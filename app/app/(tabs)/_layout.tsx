import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { BottomNavigation, BottomNavigationTab, Icon, IconElement } from "@ui-kitten/components";
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRoute, RouteProp } from "@react-navigation/native";


const { Navigator, Screen } = createBottomTabNavigator();

// Screens

import User from './users/index';
import Profile from './profile/[id]';
import About from './about/index';
import Settings from './settings/index';
import News from './news/index';

// Interfaces




const HomeIcon = (props: any): IconElement => (
    <Icon {...props} name='home-outline'/>
);

const ProfileIcon = (props: any): IconElement => (
<Icon {...props} name='person-outline'/>
);

const AboutIcon = (props: any): IconElement => (
<Icon {...props} name='info-outline'/>
);

const SettingsIcon = (props: any): IconElement => (
<Icon {...props} name='settings-2-outline'/>
);

const NewsIcon = (props: any): IconElement => (
<Icon {...props} name='book-open-outline'/>
);




const BottomTabBar = ({ navigation, state }: BottomTabBarProps) => {
    return (
        <BottomNavigation
            selectedIndex={state.index}
            onSelect={index => navigation.navigate(state.routeNames[index])}>
            <BottomNavigationTab title='USERS' icon={HomeIcon} />
            <BottomNavigationTab title='PROFILE' icon={ProfileIcon} />
            <BottomNavigationTab title='ABOUT' icon={AboutIcon} />
            <BottomNavigationTab title='SETTINGS' icon={SettingsIcon} />
            <BottomNavigationTab title='NEWS' icon={NewsIcon} />
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

    return (
        <Navigator tabBar={props => <BottomTabBar {...props} />}>
            <Screen name='User' component={User} />
            <Screen name='Profile' component={Profile} initialParams={{id: route.params?.id ?? null}} />
            <Screen name='About' component={About} />
            <Screen name='Settings' component={Settings} />
            <Screen name='News' component={News} />
        </Navigator>
    )
}

export default TabLayout;