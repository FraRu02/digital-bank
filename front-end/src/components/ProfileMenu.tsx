import React, { useCallback, useMemo, useState } from 'react';
import { Avatar, Button, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import { logout } from '@/src/store/auth/authActions';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { StoreProps } from '@/src/store/rootReducer';
import { useTranslation } from 'react-i18next';


type MenuItemProps = {
  label: string;
  callback?: () => Promise<unknown>|unknown;
  color?: string;
}

const ProfileMenu:React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const user = useSelector((state:StoreProps) => state.auth.user);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const settings = useMemo(():MenuItemProps[] => [
    {
      label: t("profile"),
      callback: () => navigate("profile")
    },
    {
      label: t("logout"),
      color: "error",
      callback: logout
    }
  ], [t])

  const handleClickItem = useCallback(async(menuItem: MenuItemProps) => {
    setAnchorEl(null);
    await menuItem.callback?.();
  }, [])

  return (
    <>
    <Tooltip title="Open settings">
      <Button onClick={(e) => setAnchorEl(e.currentTarget)} >
        <Typography sx={{mr: 1, textTransform: "none"}} variant='caption'>{user?.name}</Typography>
        <Avatar src="/static/images/avatar/2.jpg" />
      </Button>
      {/* <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0 }}>
      </IconButton> */}
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
        <MenuItem key={e.label} onClick={() => handleClickItem(e)}>
          <Typography sx={{ textAlign: 'center' }} color={e.color}>{e.label}</Typography>
        </MenuItem>
      ))}
    </Menu>
    </>
  )
}

export default ProfileMenu