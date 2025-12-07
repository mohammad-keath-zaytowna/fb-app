'use client';
import { createButton } from '@gluestack-ui/core/button/creator';
import { tva, useStyleContext, VariantProps, withStyleContext } from '@gluestack-ui/utils/nativewind-utils';
import { cssInterop } from 'nativewind';
import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';

const SCOPE = 'BUTTON';

const UIButton = createButton({
  Root: withStyleContext(Pressable, SCOPE),
  Text: Text,
  Spinner: ActivityIndicator,
  Group: View,
});

const buttonStyle = tva({
  base: 'flex-row items-center justify-center rounded-md',
  variants: {
    action: {
      primary: 'bg-primary-600 data-[hover=true]:bg-primary-700 data-[active=true]:bg-primary-800',
      secondary: 'bg-secondary-600 data-[hover=true]:bg-secondary-700 data-[active=true]:bg-secondary-800',
      positive: 'bg-success-600 data-[hover=true]:bg-success-700 data-[active=true]:bg-success-800',
      negative: 'bg-error-600 data-[hover=true]:bg-error-700 data-[active=true]:bg-error-800',
    },
    variant: {
      solid: '',
      outline: 'border-2 bg-transparent',
      link: 'bg-transparent',
    },
    size: {
      xs: 'px-2 py-1',
      sm: 'px-3 py-1.5',
      md: 'px-4 py-2',
      lg: 'px-6 py-3',
      xl: 'px-8 py-4',
    },
  },
  compoundVariants: [
    {
      variant: 'outline',
      action: 'primary',
      class: 'border-primary-600',
    },
    {
      variant: 'outline',
      action: 'secondary',
      class: 'border-secondary-600',
    },
  ],
  defaultVariants: {
    action: 'primary',
    variant: 'solid',
    size: 'md',
  },
});

const buttonTextStyle = tva({
  base: 'font-semibold text-white',
  variants: {
    action: {
      primary: '',
      secondary: '',
      positive: '',
      negative: '',
    },
    variant: {
      solid: '',
      outline: '',
      link: 'underline',
    },
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    },
  },
  defaultVariants: {
    action: 'primary',
    variant: 'solid',
    size: 'md',
  },
});

type IButtonProps = React.ComponentProps<typeof UIButton> &
  VariantProps<typeof buttonStyle> & { 
    className?: string;
    isLoading?: boolean;
  };

const Button = React.forwardRef<
  React.ComponentRef<typeof UIButton>,
  IButtonProps
>(function Button(
  { 
    className, 
    action = 'primary', 
    variant = 'solid', 
    size = 'md',
    isLoading = false,
    disabled,
    children,
    ...props 
  },
  ref
) {
  return (
    <UIButton
      ref={ref}
      {...props}
      disabled={disabled || isLoading}
      className={buttonStyle({ action, variant, size, class: className })}
      context={{ action, variant, size }}
    >
      {isLoading && <UIButton.Spinner size="small" color="#ffffff" />}
      {typeof children === 'string' ? (
        <UIButton.Text
          className={buttonTextStyle({ action, variant, size })}
        >
          {children}
        </UIButton.Text>
      ) : (
        children
      )}
    </UIButton>
  );
});

Button.displayName = 'Button';

export { Button, UIButton };

