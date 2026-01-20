import React, { useCallback, useMemo, useState } from 'react';
import { Avatar, Button, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { StoreProps } from '@/src/store/rootReducer';
import { useTranslation } from 'react-i18next';
import LanguageIcon from '@mui/icons-material/Language';



type MenuItemProps = {
  value: string;
  label: string;
  callback?: () => Promise<unknown>|unknown;
  color?: string;
}

const LanguageSwitch:React.FC = () => {
  const navigate = useNavigate();
  const {i18n} = useTranslation();
  const user = useSelector((state:StoreProps) => state.auth.user);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const settings = useMemo(():MenuItemProps[] => [
    {
      value: "it",
      label: "it",
    },
    {
      value: "en",
      label: "en",
    }
  ], [])

  const handleClickItem = useCallback((menuItem: MenuItemProps) => {
    i18n.changeLanguage(menuItem.value);
  }, [])

  return (
    <>
    <Tooltip title="Open settings">
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <LanguageIcon />
      </IconButton>
    </Tooltip>
    <Menu
      sx={{ mt: '45px', zIndex: 101}}
      id="menu-appbar"
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={Boolean(anchorEl)}
      onClose={() => setAnchorEl(null)}
    >
      {settings.map((e) => (
        <MenuItem key={e.label} selected={i18n.language === e.value} onClick={() => handleClickItem(e)}>
          <Typography sx={{ textAlign: 'center', textTransform: "uppercase" }} color={e.color}>{e.label}</Typography>
        </MenuItem>
      ))}
    </Menu>
    </>
  )
}

export default LanguageSwitch