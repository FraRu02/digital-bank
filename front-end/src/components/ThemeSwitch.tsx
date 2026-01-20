import React, { useCallback } from 'react';
import { IconButton } from '@mui/material';
import { useSelector } from 'react-redux';
import type { StoreProps } from '@/src/store/rootReducer';
import { setThemeMode } from '@/src/store/theme/themeActions';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

const ThemeSwitch:React.FC = () => {
  const themeMode = useSelector((state:StoreProps) => state.theme.mode);

  const handleChangeThemeMode = useCallback(() => {
    if(themeMode === "light") setThemeMode("dark");
    else setThemeMode("light");
  }, [themeMode])

  return (
    <IconButton onClick={handleChangeThemeMode}>
      {themeMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  )
}

export default ThemeSwitch