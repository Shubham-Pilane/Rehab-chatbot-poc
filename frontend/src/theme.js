import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0284c7', // Ocean Blue
      light: '#38bdf8',
      dark: '#0369a1',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#4f46e5', // Deep Indigo
      light: '#6366f1',
      dark: '#3730a3',
      contrastText: '#ffffff'
    },
    background: {
      default: '#f8fafc', // Light slate gray background
      paper: '#ffffff' // Crisp white card background
    },
    text: {
      primary: '#0f172a', // Dark slate text
      secondary: '#475569', // Muted gray text
      disabled: '#94a3b8'
    },
    divider: '#e2e8f0' // Light gray divider lines
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
    h4: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Outfit", sans-serif', fontWeight: 500 },
    subtitle1: { fontWeight: 500 },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)'
          }
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: '#ffffff'
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
          color: '#ffffff'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 8px -1px rgba(15, 23, 42, 0.04)',
          border: '1px solid #e2e8f0',
          borderRadius: 12
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: '#cbd5e1'
            },
            '&:hover fieldset': {
              borderColor: '#94a3b8'
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0284c7'
            }
          }
        }
      }
    }
  }
});

export default theme;
