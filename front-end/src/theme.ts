import { createTheme, type ThemeOptions } from "@mui/material/styles";

const defaultThemeOptions:ThemeOptions = {
  components: {
    MuiButton: {
      defaultProps: {
        size: "small"
      }
    },
    MuiTextField: {
      defaultProps: {
        size: "small"
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none !important",
        }
      }
    }
  }
}

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1565c0",      // blu aziendale
      light: "#5e92f3",
      dark: "#003c8f",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#0288d1",      // accento blu brillante
      light: "#5eb8ff",
      dark: "#005b9f",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f5f7fa",   // grigio chiaro neutro
      paper: "#ffffff",
    },
    text: {
      primary: "#1a1a1a",
      secondary: "#4d4d4d",
    },
  },
  ...defaultThemeOptions,
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",      // blu chiaro per contrasto
      light: "#c3fdff",
      dark: "#5d99c6",
      contrastText: "#0a0a0a",
    },
    secondary: {
      main: "#4fc3f7",      // accento blu freddo
      light: "#8bf6ff",
      dark: "#0093c4",
      contrastText: "#0a0a0a",
    },
    background: {
      default: "#121212",   // dark mode standard
      paper: "#1d1f21",     // quasi nero ma con un tono caldo
    },
    text: {
      primary: "#e0e0e0",
      secondary: "#b3b3b3",
    },
  },
  ...defaultThemeOptions
});

