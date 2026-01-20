import React from "react";
import { Box } from "@mui/material";
import ProfileMenu from "@/src/components/ProfileMenu";
import LanguageSwitch from "../LanguageSwitch";
import ThemeSwitch from "@/src/components/ThemeSwitch";


const AppBarContent: React.FC = () => {


  return (
    <Box style={{marginLeft: "auto"}}>
      <ThemeSwitch />
      <LanguageSwitch />
      <ProfileMenu />
    </Box>
  );
};

export default AppBarContent;
