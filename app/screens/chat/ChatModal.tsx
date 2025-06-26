"use client"

import { useState } from "react"
import { Modal, StyleSheet, Animated } from "react-native"
import ChatScreen from "./ChatScreen"

interface ChatModalProps {
    visible: boolean
    chatId: string | null
    onClose: () => void
}

export default function ChatModal({ visible, chatId, onClose }: ChatModalProps) {
    const [fadeAnim] = useState(new Animated.Value(0))

    const handleModalShow = () => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start()
    }

    const handleClose = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            onClose()
        })
    }

    if (!chatId) return null

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onShow={handleModalShow}
            onRequestClose={handleClose}
        >
            <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                <ChatScreen chatId={chatId} onClose={handleClose} />
            </Animated.View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})
