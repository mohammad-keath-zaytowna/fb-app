import { useDirection } from '@/components/direction-provider';

/**
 * Global CSS styles for RTL support
 * This file provides global style utilities for handling RTL layouts
 */

/**
 * Usage: Import these in components that need RTL-aware styling
 * Apply .rtl class to container when Arabic is selected
 */

export const rtlStyles = {
  // Text alignment
  textAlignStart: () => {
    const { textAlign } = useDirection();
    return { textAlign };
  },

  textAlignEnd: () => {
    const { textAlign } = useDirection();
    return { textAlign: textAlign === 'left' ? 'right' : 'left' };
  },

  // Flex direction
  flexRow: () => {
    const { flexDirection } = useDirection();
    return { flexDirection };
  },

  // Padding
  paddingStart: (value: number) => {
    const { isRTL } = useDirection();
    return {
      paddingLeft: isRTL ? 0 : value,
      paddingRight: isRTL ? value : 0,
    };
  },

  paddingEnd: (value: number) => {
    const { isRTL } = useDirection();
    return {
      paddingLeft: isRTL ? value : 0,
      paddingRight: isRTL ? 0 : value,
    };
  },

  // Margin
  marginStart: (value: number) => {
    const { isRTL } = useDirection();
    return {
      marginLeft: isRTL ? 0 : value,
      marginRight: isRTL ? value : 0,
    };
  },

  marginEnd: (value: number) => {
    const { isRTL } = useDirection();
    return {
      marginLeft: isRTL ? value : 0,
      marginRight: isRTL ? 0 : value,
    };
  },

  // Position
  start: (value: number) => {
    const { isRTL } = useDirection();
    return {
      left: isRTL ? undefined : value,
      right: isRTL ? value : undefined,
    };
  },

  end: (value: number) => {
    const { isRTL } = useDirection();
    return {
      left: isRTL ? value : undefined,
      right: isRTL ? undefined : value,
    };
  },
};
