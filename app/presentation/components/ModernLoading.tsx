import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    withDelay,
    interpolate,
    Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface ModernLoadingProps {
    loading: boolean;
    authReady: boolean;
    colors: {
        primary: string;
        secondary: string;
    };
    isDarkTheme: boolean;
}

export default function ModernLoading({ loading, authReady, colors, isDarkTheme }: ModernLoadingProps) {
    // Animações dos orbs flutuantes
    const orb1Y = useSharedValue(0);
    const orb1X = useSharedValue(0);
    const orb1Scale = useSharedValue(1);

    const orb2Y = useSharedValue(0);
    const orb2X = useSharedValue(0);
    const orb2Scale = useSharedValue(1);

    const orb3Y = useSharedValue(0);
    const orb3X = useSharedValue(0);
    const orb3Scale = useSharedValue(1);

    // Animação do texto
    const textOpacity = useSharedValue(0);
    const textY = useSharedValue(20);

    // Animação dos dots centrais
    const dot1 = useSharedValue(0);
    const dot2 = useSharedValue(0);
    const dot3 = useSharedValue(0);

    // Animação de pulso geral
    const globalPulse = useSharedValue(1);

    useEffect(() => {
        // Animação de entrada do texto
        textOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
        textY.value = withDelay(300, withTiming(0, { duration: 800, easing: Easing.out(Easing.back(1.2)) }));

        // Animações dos orbs flutuantes
        orb1Y.value = withRepeat(
            withSequence(
                withTiming(-30, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
                withTiming(30, { duration: 3000, easing: Easing.inOut(Easing.sin) })
            ),
            -1
        );
        orb1X.value = withRepeat(
            withSequence(
                withTiming(20, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
                withTiming(-20, { duration: 4000, easing: Easing.inOut(Easing.sin) })
            ),
            -1
        );
        orb1Scale.value = withRepeat(
            withSequence(
                withTiming(1.2, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
                withTiming(0.8, { duration: 2500, easing: Easing.inOut(Easing.sin) })
            ),
            -1
        );

        orb2Y.value = withDelay(1000, withRepeat(
            withSequence(
                withTiming(40, { duration: 3500, easing: Easing.inOut(Easing.sin) }),
                withTiming(-40, { duration: 3500, easing: Easing.inOut(Easing.sin) })
            ),
            -1
        ));
        orb2X.value = withDelay(1000, withRepeat(
            withSequence(
                withTiming(-25, { duration: 3800, easing: Easing.inOut(Easing.sin) }),
                withTiming(25, { duration: 3800, easing: Easing.inOut(Easing.sin) })
            ),
            -1
        ));
        orb2Scale.value = withDelay(1000, withRepeat(
            withSequence(
                withTiming(0.7, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
                withTiming(1.3, { duration: 2800, easing: Easing.inOut(Easing.sin) })
            ),
            -1
        ));

        orb3Y.value = withDelay(2000, withRepeat(
            withSequence(
                withTiming(25, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
                withTiming(-35, { duration: 4200, easing: Easing.inOut(Easing.sin) })
            ),
            -1
        ));
        orb3X.value = withDelay(2000, withRepeat(
            withSequence(
                withTiming(30, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
                withTiming(-15, { duration: 3200, easing: Easing.inOut(Easing.sin) })
            ),
            -1
        ));
        orb3Scale.value = withDelay(2000, withRepeat(
            withSequence(
                withTiming(1.1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
                withTiming(0.9, { duration: 3000, easing: Easing.inOut(Easing.sin) })
            ),
            -1
        ));

        // Animação sequencial dos dots centrais
        const dotAnimation = () => {
            dot1.value = withSequence(
                withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.5)) }),
                withTiming(0.3, { duration: 500 })
            );
            dot2.value = withDelay(200, withSequence(
                withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.5)) }),
                withTiming(0.3, { duration: 500 })
            ));
            dot3.value = withDelay(400, withSequence(
                withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.5)) }),
                withTiming(0.3, { duration: 500 })
            ));
        };

        dotAnimation();
        const interval = setInterval(dotAnimation, 1500);

        // Pulso global sutil
        globalPulse.value = withRepeat(
            withSequence(
                withTiming(1.02, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
                withTiming(0.98, { duration: 3000, easing: Easing.inOut(Easing.sin) })
            ),
            -1
        );

        return () => clearInterval(interval);
    }, []);

    // Estilos animados
    const orb1AnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: orb1Y.value },
            { translateX: orb1X.value },
            { scale: orb1Scale.value }
        ],
    }));

    const orb2AnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: orb2Y.value },
            { translateX: orb2X.value },
            { scale: orb2Scale.value }
        ],
    }));

    const orb3AnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: orb3Y.value },
            { translateX: orb3X.value },
            { scale: orb3Scale.value }
        ],
    }));

    const textAnimatedStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: textY.value }],
    }));

    const dot1AnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: dot1.value }],
        opacity: interpolate(dot1.value, [0.3, 1], [0.4, 1]),
    }));

    const dot2AnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: dot2.value }],
        opacity: interpolate(dot2.value, [0.3, 1], [0.4, 1]),
    }));

    const dot3AnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: dot3.value }],
        opacity: interpolate(dot3.value, [0.3, 1], [0.4, 1]),
    }));

    const containerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: globalPulse.value }],
    }));

    if (loading || !authReady) {
        return (
            <View style={[
                styles.loadingContainer,
                { backgroundColor: isDarkTheme ? "#0a0a0a" : "#ffffff" }
            ]}>
                {/* Orbs flutuantes de fundo */}
                <Animated.View style={[styles.orbContainer, orb1AnimatedStyle]}>
                    <LinearGradient
                        colors={[colors.primary + "30", colors.secondary + "20", "transparent"]}
                        style={[styles.orb, styles.orb1]}
                    />
                </Animated.View>

                <Animated.View style={[styles.orbContainer, orb2AnimatedStyle]}>
                    <LinearGradient
                        colors={[colors.secondary + "25", colors.primary + "15", "transparent"]}
                        style={[styles.orb, styles.orb2]}
                    />
                </Animated.View>

                <Animated.View style={[styles.orbContainer, orb3AnimatedStyle]}>
                    <LinearGradient
                        colors={[colors.primary + "20", colors.secondary + "30", "transparent"]}
                        style={[styles.orb, styles.orb3]}
                    />
                </Animated.View>

                {/* Conteúdo central */}
                <Animated.View style={[styles.centerContent, containerAnimatedStyle]}>
                    {/* Dots animados centrais */}
                    <View style={styles.dotsContainer}>
                        <Animated.View style={[styles.modernDot, dot1AnimatedStyle]}>
                            <LinearGradient
                                colors={[colors.primary, colors.secondary]}
                                style={styles.dotGradient}
                            />
                        </Animated.View>
                        <Animated.View style={[styles.modernDot, dot2AnimatedStyle]}>
                            <LinearGradient
                                colors={[colors.secondary, colors.primary]}
                                style={styles.dotGradient}
                            />
                        </Animated.View>
                        <Animated.View style={[styles.modernDot, dot3AnimatedStyle]}>
                            <LinearGradient
                                colors={[colors.primary, colors.secondary]}
                                style={styles.dotGradient}
                            />
                        </Animated.View>
                    </View>

                    {/* Texto com animação */}
                    <Animated.View style={textAnimatedStyle}>
                        <Text style={[
                            styles.loadingText,
                            { color: isDarkTheme ? "#ffffff" : "#1f2937" }
                        ]}>
                            Carregando perfil...
                        </Text>
                        <Text style={[
                            styles.subText,
                            { color: isDarkTheme ? "#9ca3af" : "#6b7280" }
                        ]}>
                            Preparando sua experiência
                        </Text>
                    </Animated.View>
                </Animated.View>

                {/* Partículas flutuantes */}
                <View style={styles.particlesContainer}>
                    {Array.from({ length: 12 }).map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.particle,
                                {
                                    backgroundColor: i % 2 === 0 ? colors.primary + "15" : colors.secondary + "15",
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }
                            ]}
                        />
                    ))}
                </View>
            </View>
        );
    }

    return null;
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    orbContainer: {
        position: 'absolute',
    },
    orb: {
        borderRadius: 200,
    },
    orb1: {
        width: 300,
        height: 300,
        top: -150,
        left: -100,
    },
    orb2: {
        width: 250,
        height: 250,
        top: 100,
        right: -80,
    },
    orb3: {
        width: 200,
        height: 200,
        bottom: -50,
        left: 50,
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        gap: 16,
    },
    modernDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    dotGradient: {
        flex: 1,
        borderRadius: 8,
    },
    loadingText: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    subText: {
        fontSize: 16,
        fontWeight: '400',
        textAlign: 'center',
        opacity: 0.8,
        letterSpacing: 0.3,
    },
    particlesContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 1,
    },
    particle: {
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: 3,
        opacity: 0.6,
    },
});