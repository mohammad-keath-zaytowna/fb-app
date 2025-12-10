import React from "react";
import { Controller, useFormContext } from "react-hook-form";
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
import { Input, InputField, InputSlot } from "../ui/input";
import { AlertCircleIcon } from "../ui/icon";
import { EyeIcon, EyeOffIcon } from "lucide-react-native";

interface RHFInputProps {
  disabled?: boolean;
  name: string;
  label?: string;
  placeholder?: string;
  type?: "email" | "password" | "text" | "number";
  helperText?: string;
  showPasswordToggle?: boolean;
}

function RHFInput({
  disabled,
  name,
  label,
  placeholder,
  type = "text",
  helperText,
  showPasswordToggle = false,
}: RHFInputProps) {
  const { control } = useFormContext();
  const [showPassword, setShowPassword] = React.useState(false);

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
          <Input variant="outline" size="xl">
            <InputField
              type={type === "password" && !showPassword ? "password" : "text"}
              placeholder={placeholder}
              value={field.value?.toString() || ""}
              onChangeText={(text) => {
                if (type === "number") {
                  const numValue = text === "" ? "" : Number(text);
                  field.onChange(isNaN(numValue as number) ? text : numValue);
                } else {
                  field.onChange(text);
                }
              }}
              onBlur={field.onBlur}
              editable={!disabled}
              secureTextEntry={type === "password" && !showPassword}
              keyboardType={type === "number" ? "numeric" : type === "email" ? "email-address" : "default"}
              style={{ textAlign: 'left' }}
            />
            {showPasswordToggle && type === "password" && (
              <InputSlot
                onPress={() => setShowPassword(!showPassword)}
                className="pr-3"
              >
                {showPassword ? (
                  <EyeOffIcon size={20} color="#9BA1A6" />
                ) : (
                  <EyeIcon size={20} color="#9BA1A6" />
                )}
              </InputSlot>
            )}
          </Input>
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

export default RHFInput;

