import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ToastType = 'success' | 'error' | 'info';

interface ToastConfig {
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (config: ToastConfig) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toast, setToast] = useState<ToastConfig | null>(null);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(-100));

    const showToast = useCallback((config: ToastConfig) => {
        setToast(config);

        // Animate in
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto hide
        const duration = config.duration || 3000;
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: -100,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setToast(null);
                fadeAnim.setValue(0);
                slideAnim.setValue(-100);
            });
        }, duration);
    }, [fadeAnim, slideAnim]);

    const success = useCallback((message: string) => {
        showToast({ message, type: 'success' });
    }, [showToast]);

    const error = useCallback((message: string) => {
        showToast({ message, type: 'error' });
    }, [showToast]);

    const info = useCallback((message: string) => {
        showToast({ message, type: 'info' });
    }, [showToast]);

    const getToastColors = (type: ToastType) => {
        switch (type) {
            case 'success':
                return { backgroundColor: '#10B981', icon: '✓' };
            case 'error':
                return { backgroundColor: '#EF4444', icon: '✕' };
            case 'info':
                return { backgroundColor: '#3B82F6', icon: 'ℹ' };
            default:
                return { backgroundColor: '#6B7280', icon: 'ℹ' };
        }
    };

    return (
        <ToastContext.Provider value={{ showToast, success, error, info }}>
            {children}
            {toast && (
                <SafeAreaView style={styles.toastContainer} edges={['top']} pointerEvents="none">
                    <Animated.View
                        style={[
                            styles.toast,
                            {
                                backgroundColor: getToastColors(toast.type).backgroundColor,
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <Text style={styles.toastIcon}>{getToastColors(toast.type).icon}</Text>
                        <Text style={styles.toastText}>{toast.message}</Text>
                    </Animated.View>
                </SafeAreaView>
            )}
        </ToastContext.Provider>
    );
};

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 9999,
        paddingHorizontal: 16,
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        minWidth: 200,
        maxWidth: Dimensions.get('window').width - 32,
    },
    toastIcon: {
        fontSize: 18,
        color: '#FFFFFF',
        marginRight: 8,
        fontWeight: 'bold',
    },
    toastText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
});
