import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { TextInput, StyleSheet, View, Text } from "react-native";
import {
    FormControl,
    FormControlError,
    FormControlErrorIcon,
    FormControlErrorText,
    FormControlHelper,
    FormControlHelperText,
    FormControlLabel,
    FormControlLabelText,
} from "../ui/form-control";
import { AlertCircleIcon } from "../ui/icon";

interface RHFTextareaProps {
    disabled?: boolean;
    name: string;
    label?: string;
    placeholder?: string;
    helperText?: string;
    numberOfLines?: number;
}

function RHFTextarea({
    disabled,
    name,
    label,
    placeholder,
    helperText,
    numberOfLines = 4,
}: RHFTextareaProps) {
    const { control } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <FormControl
                    isInvalid={fieldState.invalid}
                    size="md"
                    isDisabled={disabled}
                >
                    {label && (
                        <FormControlLabel>
                            <FormControlLabelText>{label}</FormControlLabelText>
                        </FormControlLabel>
                    )}
                    <TextInput
                        style={[
                            styles.textarea,
                            fieldState.invalid && styles.textareaError,
                            disabled && styles.textareaDisabled,
                        ]}
                        placeholder={placeholder}
                        placeholderTextColor="#9CA3AF"
                        value={field.value || ""}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        editable={!disabled}
                        multiline
                        numberOfLines={numberOfLines}
                        textAlignVertical="top"
                    />
                    {helperText && !fieldState.invalid && (
                        <FormControlHelper>
                            <FormControlHelperText>{helperText}</FormControlHelperText>
                        </FormControlHelper>
                    )}
                    {fieldState.invalid && (
                        <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>
                                {fieldState.error?.message}
                            </FormControlErrorText>
                        </FormControlError>
                    )}
                </FormControl>
            )}
        />
    );
}

const styles = StyleSheet.create({
    textarea: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: "#111827",
        backgroundColor: "#FFFFFF",
        minHeight: 100,
        textAlign: "left",
    },
    textareaError: {
        borderColor: "#EF4444",
    },
    textareaDisabled: {
        backgroundColor: "#F3F4F6",
        color: "#9CA3AF",
    },
});

export default RHFTextarea;
