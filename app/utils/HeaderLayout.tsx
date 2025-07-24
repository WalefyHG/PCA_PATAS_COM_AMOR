import { View, StyleSheet, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import { useThemeContext } from "../presentation/contexts/ThemeContext"
import HeaderUserMenu from "./HeaderUserMenu"

interface HeaderLayoutProps {
    title?: string
    showBack?: boolean
    showSearch?: boolean
    onSearch?: () => void
    size?: "small" | "medium" | "large"
}

export default function HeaderLayout({ title, showBack = false, showSearch = false, onSearch, size = "small" }: HeaderLayoutProps) {
    const navigation = useNavigation<any>()
    const { isDarkTheme, colors } = useThemeContext()

    return (
        <View style={styles.container}>
            {showSearch && (
                <TouchableOpacity
                    onPress={onSearch}
                    style={[styles.iconButton, { backgroundColor: isDarkTheme ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.05)" }]}
                >
                    <Feather name="search" size={20} color={isDarkTheme ? "#fff" : colors.primary} />
                </TouchableOpacity>
            )}
            <HeaderUserMenu showLabel={true} size={size} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
})
