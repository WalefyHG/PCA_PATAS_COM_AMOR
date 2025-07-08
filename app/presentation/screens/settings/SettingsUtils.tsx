import React from 'react'
import { View, Text, Image, TouchableOpacity, Animated, Platform } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useThemeContext } from '../../contexts/ThemeContext'
import { StyleSheet } from 'react-native'
import { Switch } from 'react-native-gesture-handler'
import { isWeb } from '@gluestack-ui/nativewind-utils/IsWeb'

interface SettingsSectionProps {
    title: string
    icon?: string
    children: React.ReactNode
}

interface SettingToggleItemProps {
    icon: string
    title: string
    value: boolean
    onToggle: (value: boolean) => void
    colors: any
    isDark: boolean
}

interface SettingLinkItemProps {
    icon: string
    title: string
    onPress: () => void
    colors: any
    isDark: boolean
    color?: string
}

function SettingsSection({ title, icon, children }: SettingsSectionProps) {
    const { isDarkTheme, colors } = useThemeContext()

    return (
        <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                {icon && (
                    <View style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                        backgroundColor: `${colors.primary}20`
                    }}>
                        <Feather name={icon as any} size={14} color={colors.primary} />
                    </View>
                )}
                <Text style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: isDarkTheme ? 'white' : '#111827',
                    ...Platform.select({
                        ios: { fontFamily: "San Francisco" },
                        android: { fontFamily: "Roboto" },
                    }),
                }}>
                    {title}
                </Text>
            </View>
            <View style={[
                {
                    borderRadius: 12,
                    overflow: 'hidden',
                    backgroundColor: isDarkTheme ? '#1f2937' : 'white',
                },
                Platform.select({
                    ios: styles.iosShadow,
                    android: styles.iosShadow, // Use iOS shadow as fallback for Android
                    ...(isWeb ? styles.webShadow : {}),
                })
            ]}>
                {children}
            </View>
        </View>
    )
}

// SettingToggleItem.tsx
function SettingToggleItem({ icon, title, value, onToggle, colors, isDark }: SettingToggleItemProps) {
    return (
        <View style={styles.settingItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[
                    styles.iconContainer,
                    { backgroundColor: `${colors.primary}15` }
                ]}>
                    <Feather name={icon as any} size={18} color={colors.primary} />
                </View>
                <Text style={[
                    styles.settingText,
                    { color: isDark ? 'white' : '#111827' }
                ]}>
                    {title}
                </Text>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: isDark ? '#374151' : '#e5e7eb', true: `${colors.primary}80` }}
                thumbColor={value ? colors.primary : isDark ? '#9ca3af' : '#f9fafb'}
            />
        </View>
    )
}

// SettingLinkItem.tsx
function SettingLinkItem({ icon, title, onPress, colors, isDark }: SettingLinkItemProps) {
    return (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={onPress}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[
                    styles.iconContainer,
                    { backgroundColor: `${colors.primary}15` }
                ]}>
                    <Feather name={icon as any} size={18} color={colors.primary} />
                </View>
                <Text style={[
                    styles.settingText,
                    { color: isDark ? 'white' : '#111827' }
                ]}>
                    {title}
                </Text>
            </View>
            <Feather name="chevron-right" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
        </TouchableOpacity>
    )
}

// SettingActionItem.tsx
function SettingActionItem({ icon, title, onPress, color, isDark }: SettingLinkItemProps) {
    return (
        <TouchableOpacity
            style={[
                styles.settingItem,
                {
                    backgroundColor: isDark
                        ? `${color}20`
                        : `${color}10`,
                    borderTopWidth: 0
                }
            ]}
            onPress={onPress}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[
                    styles.iconContainer,
                    { backgroundColor: `${color}20` }
                ]}>
                    <Feather name={icon as any} size={18} color={color} />
                </View>
                <Text style={[
                    styles.settingText,
                    { color }
                ]}>
                    {title}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    iosShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    androidShadow: {
        elevation: 4,
    },
    webShadow: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)'
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    settingText: {
        fontSize: 16,
        ...Platform.select({
            ios: { fontFamily: "San Francisco" },
            android: { fontFamily: "Roboto" },
        }),
    }
})


export { SettingsSection, SettingToggleItem, SettingLinkItem, SettingActionItem }