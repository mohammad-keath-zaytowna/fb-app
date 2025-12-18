import React, { createContext, useContext } from 'react';
import { View, ViewStyle, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';

// Set RTL state before any components render
const initializeRTL = () => {
  I18nManager.allowRTL(true);
  // This will be overridden by DirectionProvider based on language
};

initializeRTL();

interface DirectionContextType {
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
  textAlign: 'left' | 'right';
  flexDirection: 'row' | 'row-reverse';
  applyDirection: (style?: any) => any;
  getDirectionAwareStyle: (baseStyle: ViewStyle) => ViewStyle;
}

const DirectionContext = createContext<DirectionContextType>({
  isRTL: false,
  direction: 'ltr',
  textAlign: 'left',
  flexDirection: 'row',
  applyDirection: () => ({}),
  getDirectionAwareStyle: (style) => style,
});

export const useDirection = () => useContext(DirectionContext);

interface DirectionProviderProps {
  children: React.ReactNode;
}

export function DirectionProvider({ children }: DirectionProviderProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  console.log('DirectionProvider: language =', i18n.language, 'isRTL =', isRTL);

  const directionValue: DirectionContextType = {
    isRTL,
    direction: isRTL ? 'rtl' : 'ltr',
    textAlign: isRTL ? 'right' : 'left',
    flexDirection: isRTL ? 'row-reverse' : 'row',
    applyDirection: (style?: ViewStyle) => ({
      ...style,
      flexDirection: isRTL ? 'row-reverse' : 'row',
    }),
    getDirectionAwareStyle: (baseStyle: ViewStyle) => ({
      ...baseStyle,
      flexDirection: baseStyle.flexDirection === 'row' ? (isRTL ? 'row-reverse' : 'row') : baseStyle.flexDirection,
    }),
  };

  return (
    <DirectionContext.Provider value={directionValue}>
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </DirectionContext.Provider>
  );
}