import React from 'react'
import { OtpInput } from 'reactjs-otp-input'

type CustomOtpInputProps = {
  className?: string;
  containerStyle?: React.CSSProperties | string;
  disabledStyle?: React.CSSProperties | string;
  errorStyle?: React.CSSProperties | string;
  focusStyle?: React.CSSProperties | string;
  inputStyle?: React.CSSProperties | string;
  hasErrored?: boolean;
  isDisabled?: boolean;
  isInputNum?: boolean;
  isInputSecure?: boolean;
  numInputs: number;
  onChange: (otp: string) => void;
  placeholder?: string;
  separator?: React.ReactNode | string;
  shouldAutoFocus?: boolean;
  value?: string;
  'data-testid'?: string;
  'data-cy'?: string;
}

const CustomOtpInput:React.FC<CustomOtpInputProps> = ({...otherProps}) => {
  return (
    <OtpInput 
      containerStyle={{
        width: "fit-content",
        gap: "1rem",
        alignSelf: "center",
      }}
      inputStyle={{
        width: 60, height: 60,
        fontSize: 24
      }}
      isInputNum
      {...otherProps}
    />
  )
}

export default CustomOtpInput