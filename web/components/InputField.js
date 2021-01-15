import React, { InputHTMLAttributes } from "react";
import { useField } from "formik";
import {
  FormControl,
  FormLabel,
  Input,
  TextField,
} from "@material-ui/core";

// '' => false
// 'error message stuff' => true

export const InputField = ({
  label,
  size: _,
  ...props
}) => {
  const [field, { error }] = useField(props);
  return (
    <FormControl error={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      {error ? 
        <TextField error helperText={error} {...field} {...props} id={field.name} />
       : 
        <TextField {...field} {...props} id={field.name} />
      }
    </FormControl>
  );
};