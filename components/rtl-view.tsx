import React from 'react';
import { View, ViewProps } from 'react-native';
import { useDirection } from './direction-provider';

interface RTLViewProps extends ViewProps {
  children: React.ReactNode;
}

/**
 * RTLView component that handles RTL layout dynamically using CSS flexDirection
 * without requiring app restart or I18nManager
 */
export function RTLView({ children, style, ...props }: RTLViewProps) {
  const { applyDirection } = useDirection();

  return (
    <View
      style={applyDirection(style)}
      {...props}
    >
      {children}
    </View>
  );
}

/**
 * Hook to check if current language is RTL
 */
export function useRTL() {
  const { isRTL } = useDirection();
  return isRTL;
}

/**
 * Hook to get text alignment based on language
 */
export function useTextAlign(): 'left' | 'right' {
  const isRTL = useRTL();
  return isRTL ? 'right' : 'left';
}

/**
 * Hook to get flex direction based on language
 */
export function useFlexDirection(): 'row' | 'row-reverse' {
  const isRTL = useRTL();
  return isRTL ? 'row-reverse' : 'row';
}
