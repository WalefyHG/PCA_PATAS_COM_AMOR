import { Platform, Dimensions } from "react-native"

// Get device dimensions
export const getWindowDimensions = () => {
    return Dimensions.get("window")
}

// Check if device is a tablet
export const isTablet = () => {
    const { width, height } = getWindowDimensions()
    const aspectRatio = height / width
    return aspectRatio <= 1.6
}

// Get platform-specific font
export const getPlatformFont = () => {
    switch (Platform.OS) {
        case "ios":
            return "San Francisco"
        case "android":
            return "Roboto"
        default:
            return "System"
    }
}

// Get platform-specific spacing
export const getPlatformSpacing = () => {
    switch (Platform.OS) {
        case "ios":
            return {
                headerPadding: 12,
                contentPadding: 16,
                cardSpacing: 12,
            }
        case "android":
            return {
                headerPadding: 8,
                contentPadding: 16,
                cardSpacing: 10,
            }
        default:
            return {
                headerPadding: 16,
                contentPadding: 24,
                cardSpacing: 16,
            }
    }
}

// Get platform-specific UI elements
export const getPlatformUIElements = (isDark: boolean) => {
    switch (Platform.OS) {
        case "ios":
            return {
                cardStyle: `rounded-xl shadow-lg ${isDark ? "bg-gray-800" : "bg-white"}`,
                buttonStyle: "rounded-full",
                inputStyle: "rounded-lg border border-gray-300",
            }
        case "android":
            return {
                cardStyle: `rounded-lg elevation-2 ${isDark ? "bg-gray-800" : "bg-gray-50"}`,
                buttonStyle: "rounded-md",
                inputStyle: "rounded-md border-b border-gray-300",
            }
        default:
            return {
                cardStyle: `rounded-lg shadow-md ${isDark ? "bg-gray-800" : "bg-gray-100"}`,
                buttonStyle: "rounded-md",
                inputStyle: "rounded-md border border-gray-300",
            }
    }
}
