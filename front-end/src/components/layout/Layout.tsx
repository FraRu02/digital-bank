import React, { createContext, useContext, useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import MuiAppBar, { type AppBarProps } from "@mui/material/AppBar";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AppBarContent from "./AppBarContent";
import useMobile from "@/src/hooks/useMobile";
import { Stack } from "@mui/material";
import DrawerList from "./DrawerList";
// import LogoEvocsWhite from "src/app/asset/images/logoEvocsWhite.png";
// import LogoEvocsBlack from "src/app/asset/images/logoEvocsBlack.png";

type LayoutProps = {
  children?: React.ReactNode;
};

type LayoutContextProps = {
  openDrawer: boolean;
  setOpenDrawer: React.Dispatch<React.SetStateAction<boolean>>;
};

type MainProps = {
  open?: boolean;
}

type AppBarStyledProps = AppBarProps & {
  open?: boolean;
}

const drawerWidth = 300;
const appBarHeight = 70;

const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "open",
})<MainProps>(({ theme, open }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  background: theme.palette.background.default,
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: 0,
  [theme.breakpoints.up("lg")]: {
    marginLeft: `-${drawerWidth}px`,
  },
  ...(open && {
    [theme.breakpoints.up("lg")]: {
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: 0,
    },
  }),
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarStyledProps>(({ theme, open }) => ({
  height: appBarHeight,
  zIndex: 100,
  background: theme.palette.background.paper,
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    [theme.breakpoints.up("lg")]: {
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
    },
  }),
}));

const ResponsiveDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  [theme.breakpoints.down("lg")]: {
    zIndex: 3200,
  },
  "& .MuiDrawer-paper": {
    width: drawerWidth,
    boxSizing: "border-box",
    background: theme.palette.background.paper,
    borderRight: "none",
  },
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  minHeight: appBarHeight,
  justifyContent: "space-between",
}));

const LayoutContext = createContext<LayoutContextProps | undefined>(undefined);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const {md, lg} = useMobile();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const responsiveDrawer = () =>
    !lg ? (
      <ResponsiveDrawer
        variant="temporary"
        onClose={() => setOpen(false)}
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <DrawerList />
      </ResponsiveDrawer>
    ) : (
      <ResponsiveDrawer variant="persistent" anchor="left" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <DrawerList />
      </ResponsiveDrawer>
    );

  return (
    <LayoutContext.Provider value={{ openDrawer: open, setOpenDrawer: setOpen }}>
      <Box sx={{ display: "flex", width: "100vw", height: "100vh" }}>
        <AppBar position="fixed" elevation={1} open={open}>
          <Stack
            direction={"row"}
            alignItems={"center"}
            spacing={1}
            sx={{
              height: "100%",
              width: "100%",
              p: 1,
              alignItems: "center",
            }}
          >
            <IconButton
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              sx={[open && { display: "none" }]}
            >
              <MenuIcon />
            </IconButton>
            <AppBarContent />
          </Stack>
        </AppBar>
        {responsiveDrawer()}
        <Main open={open}>
          <DrawerHeader />
          {children}
        </Main>
      </Box>
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const layoutContext = useContext(LayoutContext);
  return layoutContext;
};

export default Layout;
