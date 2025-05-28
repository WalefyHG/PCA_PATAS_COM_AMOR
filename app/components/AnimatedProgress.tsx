import { View, Text, StyleSheet, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';

interface AnimatedProgressBarProps {
    progress: number; // 0 a 100
}

const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({ progress }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: progress,
            duration: 400,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const widthInterpolated = animatedValue.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Upload da imagem: {Math.round(progress)}%</Text>
            <View style={styles.barBackground}>
                <Animated.View style={[styles.barFill, { width: widthInterpolated }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: 8,
    },
    label: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
        textAlign: 'left',
    },
    barBackground: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 9999,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        backgroundColor: '#3B82F6',
    },
});

export default AnimatedProgressBar;
