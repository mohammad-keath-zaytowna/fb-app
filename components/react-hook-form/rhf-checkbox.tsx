import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Checkbox } from "../ui/checkbox";

interface RHFCheckboxProps {
  disabled?: boolean;
  name: string;
  label?: string;
}

function RHFCheckbox({
  disabled,
  name,
  label,
}: RHFCheckboxProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Checkbox
          value={field.value || false}
          onValueChange={field.onChange}
          disabled={disabled}
          label={label}
        />
      )}
    />
  );
}

export default RHFCheckbox;

