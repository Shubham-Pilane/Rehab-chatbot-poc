import React, { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Select, MenuItem, InputLabel, FormControl, Tab, Tabs, Alert, CircularProgress } from '@mui/material';
import { api } from '../services/api';

const Auth = ({ onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedRole, setSelectedRole] = useState('Viewer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username and password are required.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await api.login(username, password);
      localStorage.setItem('token', data.token);
      setSuccess('Login successful!');
      setTimeout(() => {
        onAuthSuccess(data.user);
      }, 1000);
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Username, email, and password are required.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await api.register({
        username,
        email,
        password,
        firstName,
        lastName,
        roles: [selectedRole]
      });
      
      localStorage.setItem('token', data.token);
      setSuccess('Registration successful!');
      setTimeout(() => {
        onAuthSuccess(data.user);
      }, 1000);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, position: 'relative', overflow: 'hidden' }}>
      <div className="glow-bg" />
      
      <Card sx={{ maxWidth: 450, width: '100%', border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 32px 0 rgba(15, 23, 42, 0.08)' }}>
        <Box sx={{ background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.06) 0%, rgba(79, 70, 229, 0.06) 100%)', p: 3, textAlign: 'center', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
          <Typography variant="h4" sx={{ color: '#0284c7', fontWeight: 800, mb: 1, letterSpacing: '0.05em' }}>
            REHAB TRACKER
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            AI-Powered Repair Chatbot Assistant
          </Typography>
        </Box>
        
        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth" sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>
        
        <CardContent sx={{ p: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

          {activeTab === 0 ? (
            <form onSubmit={handleLogin}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="Username"
                  variant="outlined"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  required
                  disabled={loading}
                />
                
                <TextField
                  label="Password"
                  type="password"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  required
                  disabled={loading}
                />
                
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  disabled={loading}
                  sx={{ mt: 1, py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Access Chatbot'}
                </Button>
              </Box>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Username"
                  variant="outlined"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  required
                  disabled={loading}
                />
                
                <TextField
                  label="Email"
                  type="email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  required
                  disabled={loading}
                />
                
                <TextField
                  label="Password"
                  type="password"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  required
                  disabled={loading}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="First Name"
                    variant="outlined"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    fullWidth
                    disabled={loading}
                  />
                  <TextField
                    label="Last Name"
                    variant="outlined"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    fullWidth
                    disabled={loading}
                  />
                </Box>

                <FormControl fullWidth>
                  <InputLabel>Simulated Test Role</InputLabel>
                  <Select
                    value={selectedRole}
                    label="Simulated Test Role"
                    onChange={(e) => setSelectedRole(e.target.value)}
                    disabled={loading}
                  >
                    <MenuItem value="Viewer">Viewer (Read-Only Statuses)</MenuItem>
                    <MenuItem value="Project Manager">Project Manager (Schedules & Write)</MenuItem>
                    <MenuItem value="Finance Manager">Finance Manager (Budgets & Invoices)</MenuItem>
                    <MenuItem value="Vendor Manager">Vendor Manager (Licensing)</MenuItem>
                    <MenuItem value="Homeowner">Homeowner (Isolated updates)</MenuItem>
                    <MenuItem value="Admin">System Manager (Full Access)</MenuItem>
                  </Select>
                </FormControl>
                
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="secondary" 
                  size="large"
                  disabled={loading}
                  sx={{ mt: 1, py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                </Button>
              </Box>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Auth;
