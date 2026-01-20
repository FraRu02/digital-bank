import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, type OutlinedInputProps } from '@mui/material'
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import type React from 'react';

type PasswordFieldProps = OutlinedInputProps & {
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

const PasswordField:React.FC<PasswordFieldProps> = ({showPassword=false, onTogglePassword, ...otheProps}) => {
  

  return (
    <FormControl fullWidth variant="outlined">
      <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
      <OutlinedInput
        id="outlined-adornment-password"
        type={showPassword ? 'text' : 'password'}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label={
                showPassword ? 'hide the password' : 'display the password'
              }
              onClick={onTogglePassword}
              onMouseDown={(e) => e.preventDefault()}
              onMouseUp={(e) => e.preventDefault()}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
        label="Password"
        {...otheProps}
      />
    </FormControl>
  )
}

export default PasswordField