import { Typography, type TypographyProps } from '@mui/material';
import React, { useMemo } from 'react';

type SecretTypographyProps = Omit<TypographyProps, "children"> & {
  hide?: boolean;
  start?: number;
  end?: number;
  children?: string|number|null;
}

const SecretTypography:React.FC<SecretTypographyProps> = ({hide=false, children, start, end}) => {
  const newText = useMemo(() => {
    if(!hide || !children) return children;
    children = children.toString();
    let startIndex:number = 0, endIndex:number = 0;
    if(start !== undefined) {
      if(start > children.length) {
        startIndex = start%children.length;
      }else if(start < 0) {
        startIndex = children.length - (Math.abs(start)%children.length)
      }else startIndex = start;
    }
    if(end !== undefined) {
      if(end > children.length) {
        endIndex = end%children.length;
      }else if(end < 0) {
        endIndex = children.length - (Math.abs(end)%children.length) - 1;
      }else endIndex = end;
    }else endIndex = children.length-1;
    let text:string = "";
    for (let i = 0; i < children.length; i++) {
      if(i >= startIndex && i<= endIndex) {
        text += "*";
      }else if(i >= endIndex && i<= startIndex) {
        text += "*";
      }else {
        text += children[i];
      }
    }
    return text;
  }, [children, hide, start, end]);

  return (
    <Typography>
      {newText}
    </Typography>
  )
}

export default SecretTypography