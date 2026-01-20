import type React from "react";
import { NumericFormat, type NumericFormatProps } from "react-number-format";
import { TextField, InputAdornment, type TextFieldProps } from "@mui/material";

type ImportFieldProps = Omit<
  NumericFormatProps,
  "customInput" | "size"
> & TextFieldProps;

const ImportField:React.FC<ImportFieldProps> = ({...otherProps}) => {

  return (
    <NumericFormat
    customInput={TextField}
    label="Importo"
    thousandSeparator="."
    decimalSeparator=","
    decimalScale={2}
    fixedDecimalScale
    allowNegative={false}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">€</InputAdornment>
      ),
    }}
    {...otherProps}
    />
  );
}

export default ImportField;
