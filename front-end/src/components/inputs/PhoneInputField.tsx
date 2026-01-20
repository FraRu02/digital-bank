import { PatternFormat, type PatternFormatProps } from "react-number-format";
import TextField, { type TextFieldProps } from "@mui/material/TextField";
import type React from "react";

type PhoneInputFieldProps = Omit<PatternFormatProps, "customInput"|"format"> & TextFieldProps;

const PhoneInputField:React.FC<PhoneInputFieldProps> = ({ ...otherProps }) => {
  return (
    <PatternFormat
      customInput={TextField}
      label="Telefono"
      format="(+##) ### ### ####"
      allowEmptyFormatting
      mask="_"
      {...otherProps}
    />
  );
}

export default PhoneInputField;
