import React, { useState } from "react";
import { Badge, Box, Drawer, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import ProfileMenu from "@/src/components/ProfileMenu";
import LanguageSwitch from "../LanguageSwitch";
import ThemeSwitch from "@/src/components/ThemeSwitch";
import NotificationsIcon from '@mui/icons-material/Notifications';
import AlertsList from "../Alerts/AlertsList";
import { useQuery } from "@tanstack/react-query";
import type { AlertProps } from "@/src/classes/Alert";
import Alert from "@/src/classes/Alert";


const AppBarContent: React.FC = () => {
  const [openAlerts, setOpenAlerts] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const {data, isFetching} = useQuery<AlertProps[]>({
    queryKey: ["alerts"],
    queryFn: Alert.getMe
  });

  return (
    <>
      {isMobile &&
      <Drawer
        sx={{
          width: 300,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 300,
            boxSizing: "border-box",
            bgcolor: "background.paper",
            borderRight: "none",
          },
        }}
        variant="temporary"
        onClose={() => setOpenAlerts(false)}
        anchor="right"
        open={openAlerts}
      >
        <AlertsList.Root alerts={data}>
          <Box sx={{flex: 1, overflowY: "auto"}}>
            <AlertsList.List />
            <AlertsList.Empty 
              sx={{
                display: "flex",
                height: "100%",
                flexDirection: "column",
                gap: "0.5rem",
                width: "100%",
                alignItems: "center",
                justifyContent: "center"
              }}
            />
            
          </Box>
        </AlertsList.Root>
      </Drawer>}
      <Box style={{marginLeft: "auto"}}>
        {isMobile &&
        <IconButton onClick={() => setOpenAlerts(true)}>
          <Badge badgeContent={data?.length} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>}
        <ThemeSwitch />
        <LanguageSwitch />
        <ProfileMenu />
      </Box>
    
    </>
  );
};

export default AppBarContent;
