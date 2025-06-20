import { createTheme } from "@mui/material/styles";

// Define your theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Your primary color
      light: "#42a5f5",
      dark: "#1565c0",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#d32f2f", // Your secondary color
      light: "#ef5350",
      dark: "#c62828",
      contrastText: "#ffffff",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Arial', sans-serif",
  },
});

export default theme;
