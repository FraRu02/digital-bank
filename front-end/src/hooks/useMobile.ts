
import { useMediaQuery, useTheme } from '@mui/material';
import { useMemo } from 'react';


const defaultSize = {
  xs: false,
  sm: false,
  md: false,
  lg: false,
  xl: false
}

const useMobile = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only("xs"));
  const isSm = useMediaQuery(theme.breakpoints.down("md"));
  const isMd = useMediaQuery(theme.breakpoints.down("lg"));
  const isLg = useMediaQuery(theme.breakpoints.down("xl"));
  const isXl = useMediaQuery(theme.breakpoints.only("xl"));

  const size = useMemo(() => {
    if(isXs) {
      return {
        ...defaultSize,
        xs: true
      }
    }else if(isSm) {
       return {
        ...defaultSize,
        xs: true,
        sm: true
      }
    }else if(isMd) {
       return {
        ...defaultSize,
        xs: true,
        sm: true,
        md: true
      }
    }else if(isLg) {
       return {
        ...defaultSize,
        xs: true,
        sm: true,
        md: true,
        lg: true
      }
    }else if(isXl) {
       return {
        xs: true,
        sm: true,
        md: true,
        lg: true,
        xl: true
      }
    }else {
      return defaultSize;
    }
  }, [isXs, isSm, isMd, isLg, isXl])

  return size;
}

export default useMobile