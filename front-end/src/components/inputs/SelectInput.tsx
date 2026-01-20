import { FormControl, InputLabel, MenuItem, Select, type SelectProps } from '@mui/material'
import React from 'react'

type OptionProps = {
  label: string;
  value: string;
}

type SelectInputProps = SelectProps & {
  options: Array<string> | Array<OptionProps>;
}

const SelectInput:React.FC<SelectInputProps> = ({options, labelId, label, ...otherProps}) => {
  return (
    <FormControl fullWidth>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        label={label}
        {...otherProps}
      >
        {options.map((element, index) => {
          const value = typeof element === "string" ? element : element.value;
          const label = typeof element === "string" ? element : element.label;
          return (
            <MenuItem key={index} value={value}>{label}</MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}

export default SelectInput