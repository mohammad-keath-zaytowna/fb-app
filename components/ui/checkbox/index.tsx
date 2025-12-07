'use client';
import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { CheckIcon } from 'lucide-react-native';

interface CheckboxProps {
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Checkbox = React.forwardRef<View, CheckboxProps>(
  function Checkbox(
    { value = false, onValueChange, label, disabled = false, size = 'md', className },
    ref
  ) {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    return (
      <Pressable
        onPress={() => !disabled && onValueChange?.(!value)}
        disabled={disabled}
        className={`flex-row items-center gap-2 ${disabled ? 'opacity-50' : ''} ${className || ''}`}
      >
        <View
          ref={ref}
          className={`${sizeClasses[size]} border-2 rounded items-center justify-center ${
            value ? 'bg-primary-600 border-primary-600' : 'border-gray-300 bg-white'
          }`}
        >
          {value && <CheckIcon size={size === 'sm' ? 12 : size === 'md' ? 16 : 20} color="#ffffff" />}
        </View>
        {label && (
          <Text className="text-base text-gray-900">{label}</Text>
        )}
      </Pressable>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };

