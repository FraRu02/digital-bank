import { ThemeProvider } from '@mui/material';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { StoreProps } from '@/src/store/rootReducer';
import { darkTheme, lightTheme } from '@/src/theme';


const CustomThemeContext:React.FC<{children:React.ReactNode}> = ({children}) => {
  const themeMode = useSelector((state:StoreProps) => state.theme.mode);

  const theme = useMemo(() => themeMode === "light" ? lightTheme : darkTheme, [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  )
}

export default CustomThemeContext