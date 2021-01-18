import { createMuiTheme } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';

export const themeOptions = {
  palette: {
    type: 'dark',
    primary: {
      main: '#3f51b5',
      light: '#6573c3',
      dark: '#2c387e',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f50057',
      light: '#f73378',
      dark: '#ab003c',
      contrastText: '#ffffff',
    },
    background: {
      default: '#212121',
      paper: '#424242',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255,255,255,0.7)',
      disabled: 'rgba(255,255,255,0.5)',
      hint: 'rgba(255,255,255,0.5)',
    },
    error: {
      main: '#f44336',
      light: '#f6685e',
      dark: '#aa2e25',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ff9800',
      light: '#ffac33',
      dark: '#b26a00',
      contrastText: 'rgba(0,0,0,0.87)',
    },
    info: {
      main: '#2196f3',
      light: '#4dabf5',
      dark: '#1769aa',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4caf50',
      light: '#6fbf73',
      dark: '#357a38',
      contrastText: 'rgba(0,0,0,0.87)',
    },
    divider: 'rgba(255,255,255,0.12)',
  },
  props: {
    MuiAppBar: {
      color: 'transparent',
    },
  },
};

// Create a theme instance.
const theme = createMuiTheme(themeOptions);

export default theme;
