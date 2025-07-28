import React, { useEffect } from "react";
import {
    Dimensions,
    StyleSheet,
    View,
} from "react-native";
import {
    Portal,
    Dialog,
    Button,
    Paragraph,
    useTheme,
} from "react-native-paper";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from "react-native-reanimated";
import { useThemeContext } from "../presentation/contexts/ThemeContext";

const { width } = Dimensions.get("window");

type ConfirmModalProps = {
    visible: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export function ConfirmModal({
    visible,
    message,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const { isDarkTheme, colors } = useThemeContext();
    const paperTheme = useTheme();

    const scale = useSharedValue(0.9);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            scale.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.ease) });
            opacity.value = withTiming(1, { duration: 250 });
        } else {
            scale.value = withTiming(0.9, { duration: 150 });
            opacity.value = withTiming(0, { duration: 150 });
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Portal>
            {visible && (
                <View style={StyleSheet.absoluteFillObject}>
                    <View style={styles.backdrop} />
                </View>
            )}
            <Dialog
                visible={visible}
                onDismiss={onCancel}
                style={[
                    styles.dialog,
                    {
                        backgroundColor: isDarkTheme ? "#1f2937" : "#ffffff",
                        borderColor: isDarkTheme ? "#374151" : "#e5e7eb",
                    },
                ]}
            >
                <Animated.View style={[styles.animatedContainer, animatedStyle]}>
                    <Dialog.Title
                        style={[
                            styles.title,
                            { color: isDarkTheme ? "#ffffff" : "#111827" },
                        ]}
                    >
                        Confirmar ação
                    </Dialog.Title>
                    <Dialog.Content>
                        <Paragraph
                            style={{
                                fontSize: 15,
                                color: isDarkTheme ? "#d1d5db" : "#6b7280",
                            }}
                        >
                            {message}
                        </Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions style={styles.actions}>
                        <Button
                            onPress={onCancel}
                            mode="outlined"
                            style={[
                                styles.cancelButton,
                                {
                                    backgroundColor: isDarkTheme ? "#374151" : "#f3f4f6",
                                    borderColor: isDarkTheme ? "#4b5563" : "#d1d5db",
                                },
                            ]}
                            labelStyle={{
                                color: isDarkTheme ? "#ffffff" : "#374151",
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onPress={onConfirm}
                            mode="contained"
                            style={{
                                backgroundColor:
                                    colors.primary || (isDarkTheme ? "#dc2626" : "#ef4444"),
                                borderRadius: 6,
                            }}
                            labelStyle={{ color: "#ffffff" }}
                        >
                            Excluir
                        </Button>
                    </Dialog.Actions>
                </Animated.View>
            </Dialog>
        </Portal>
    );
}

const styles = StyleSheet.create({
    dialog: {
        marginHorizontal: 20,
        borderWidth: 1,
        borderRadius: 16,
        elevation: 10,
    },
    animatedContainer: {
        paddingBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
    },
    actions: {
        justifyContent: "flex-end",
        paddingHorizontal: 16,
    },
    cancelButton: {
        borderRadius: 6,
        marginRight: 8,
    },
    backdrop: {
        flex: 1,
        backgroundColor: "#00000099",
        position: "absolute",
        width: width,
        height: "100%",
    },
});
