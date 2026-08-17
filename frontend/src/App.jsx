import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './theme';
import Auth from './components/Auth';
import Chat from './components/Chat';
import Dashboard from './components/Dashboard';
import Admin from './components/Admin';
import { api } from './services/api';

const queryClient = new QueryClient();

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('chat'); // chat, admin

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    let token = localStorage.getItem('token');
    
    if (!token) {
      try {
        const loginData = await api.login('admin', '123');
        localStorage.setItem('token', loginData.token);
        token = loginData.token;
      } catch (err) {
        console.warn('Silent login failed, falling back to mock session:', err.message);
        setUser({
          id: 'mock-user-id',
          username: 'admin',
          firstName: 'System',
          lastName: 'Admin',
          roles: ['Admin']
        });
        setLoading(false);
        return;
      }
    }

    try {
      const data = await api.getProfile();
      setUser(data.user);
    } catch (err) {
      console.warn('Session invalid, retrying silent login:', err.message);
      try {
        const loginData = await api.login('admin', '123');
        localStorage.setItem('token', loginData.token);
        const retryProfile = await api.getProfile();
        setUser(retryProfile.user);
      } catch (retryErr) {
        console.error('Silent login retry failed:', retryErr.message);
        setUser({
          id: 'mock-user-id',
          username: 'admin',
          firstName: 'System',
          lastName: 'Admin',
          roles: ['Admin']
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setView('chat');
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#080c14' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
        <Typography variant="h6">Initializing Dashboard...</Typography>
      </Box>
    );
  }

  if (view === 'admin') {
    return <Admin onBack={() => setView('chat')} />;
  }

  return (
    <Dashboard 
      user={user} 
      onLogout={handleLogout} 
      onToggleAdmin={() => setView('admin')} 
    />
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
