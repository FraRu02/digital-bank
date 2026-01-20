import { routes, type RouteProps } from '@/src/routesConfig';
import type { StoreProps } from '@/src/store/rootReducer';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, styled, type ListItemProps } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

type CustomListItemProps = ListItemProps & {
  isSelected?: boolean;
}

const CustomListItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== "isSelected",
})<CustomListItemProps>(({ theme, isSelected }) => ({
  background: "none",
  ...(isSelected && {
    background: theme.palette.background.default,
    "& .MuiListItemButton-root": {
      background: "none"
    },
  }),
}));


const DrawerList:React.FC = () => {
  const {t} = useTranslation();
  const user = useSelector((state:StoreProps) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
  const list = useMemo(() => {
    const ls:RouteProps[] = [];
    routes.forEach((e) => {
      if(e.showInDrawer) {
        if(Array.isArray(e.protected)) {
          if(e.protected.includes(user!.role)) ls.push(e);
        }else if(e.protected) ls.push(e);
      }
    });

    return ls;
  }, [user])

  const isSelected = useCallback((path:string) => {
    if(location.pathname === "/") {
      return path === "/";
    }
    if (path.includes(location.pathname)) return true;
    return false;
  },[location.pathname]);

  const handleClick = useCallback((path:string) => {
    navigate(path)
  }, [])

  return (
    <List>
      {list.map((e, index) => (
        <CustomListItem key={index} disablePadding isSelected={isSelected(e.path!)}>
          <ListItemButton disableRipple onClick={() => handleClick(e.path!)}>
            <ListItemIcon>
              {e.icon}
            </ListItemIcon>
            <ListItemText primary={t(e.label ?? "")} />
          </ListItemButton>
        </CustomListItem>
      ))}
    </List>
  )
}

export default DrawerList