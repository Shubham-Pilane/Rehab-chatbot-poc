import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Fab, 
  Tooltip, 
  Avatar,
  Chip,
  Container,
  Grid,
  Button
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import AddHomeWorkIcon from '@mui/icons-material/AddHome';
import EngineeringIcon from '@mui/icons-material/Engineering';
import ConstructionIcon from '@mui/icons-material/Construction';
import GroupsIcon from '@mui/icons-material/Groups';
import BusinessIcon from '@mui/icons-material/Business';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import Chat from './Chat';

export default function Dashboard({ user, onLogout, onToggleAdmin }) {
  const [chatOpen, setChatOpen] = useState(false);

  const cards = [
    { title: 'Projects', subtitle: '42 Active Projects', icon: HomeWorkIcon, bgColor: '#00a8e8', lightBg: 'rgba(0, 168, 232, 0.08)' },
    { title: 'New Project', subtitle: 'Create Project Record', icon: AddHomeWorkIcon, bgColor: '#84bd00', lightBg: 'rgba(132, 189, 0, 0.08)' },
    { title: 'Contacts', subtitle: 'Vendors & Managers', icon: EngineeringIcon, bgColor: '#ff6c2f', lightBg: 'rgba(255, 108, 47, 0.08)' },
    { title: 'Tasks & Pricing', subtitle: 'Schedules & Estimates', icon: ConstructionIcon, bgColor: '#84bd00', lightBg: 'rgba(132, 189, 0, 0.08)' },
    { title: 'Project Groups', subtitle: 'Affiliate Clusters', icon: GroupsIcon, bgColor: '#00a8e8', lightBg: 'rgba(0, 168, 232, 0.08)' },
    { title: 'Brand Management', subtitle: 'Tenants & Settings', icon: BusinessIcon, bgColor: '#2f4858', lightBg: 'rgba(47, 72, 88, 0.08)' }
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. Header Bar */}
      <Paper
        square
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #1b365d 0%, #0f172a 100%)',
          color: '#ffffff',
          px: { xs: 2, sm: 4 },
          py: 1.8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.15)'
        }}
      >
        {/* Left Brand Identity */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ 
            p: 1, 
            borderRadius: 2, 
            background: 'rgba(132, 189, 0, 0.15)',
            display: 'flex',
            alignItems: 'center'
          }}>
            <HomeWorkIcon sx={{ color: '#84bd00', fontSize: '2.2rem' }} />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              variant="body2"
              sx={{
                color: '#00a8e8',
                fontWeight: 900,
                fontSize: '0.75rem',
                lineHeight: 1,
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
            >
              Trinity
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '1.2rem',
                lineHeight: 1.1,
                letterSpacing: '0.02em'
              }}
            >
              Habitat
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#94a3b8',
                fontSize: '0.6rem',
                lineHeight: 1,
                mt: 0.3
              }}
            >
              for Humanity®
            </Typography>
          </Box>
        </Box>

        {/* Center Title Badge */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
          <Chip 
            label="REHAB TRACKER DASHBOARD" 
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#ffffff',
              fontWeight: 800,
              letterSpacing: '0.12em',
              fontSize: '0.8rem',
              px: 1,
              border: '1px solid rgba(255,255,255,0.15)'
            }} 
          />
        </Box>

        {/* Right User Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton color="inherit" sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
            <NotificationsIcon fontSize="small" />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 1, borderLeft: '1px solid rgba(255,255,255,0.15)' }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: '#00a8e8', fontSize: '0.9rem', fontWeight: 700 }}>
              {user?.username?.[0]?.toUpperCase() || 'A'}
            </Avatar>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 700, color: '#ffffff' }}>
              {user?.firstName || 'System'} {user?.lastName || 'Admin'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* 2. Main Page Container */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 6, flexGrow: 1 }}>
                {/* Welcome Section Banner */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', mb: 0.5 }}>
            Welcome back, {user?.firstName || 'Admin'}! 👋
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.95rem' }}>
            Manage projects, view task estimates, homeowner applications, and query AI insights.
          </Typography>
        </Box>

        {/* 3. Solid Color Flat Card Grid (3 columns on Desktop, 2 on Tablet, 1 on Mobile) */}
        <Grid container spacing={3}>
          {cards.map((card, idx) => {
            const IconComponent = card.icon;
            return (
              <Grid item xs={12} sm={6} md={4} key={idx} sx={{ minWidth: 0 }}>
                <Paper
                  onClick={() => alert(`Selected ${card.title}`)}
                  elevation={2}
                  sx={{
                    p: 2.5,
                    height: '135px',
                    borderRadius: 1.5,
                    backgroundColor: card.bgColor,
                    color: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    minWidth: 0,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      opacity: 0.95
                    }
                  }}
                >
                  <IconComponent sx={{ fontSize: '3rem', color: '#ffffff', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff', fontSize: '1.05rem', letterSpacing: '0.02em', textAlign: 'center' }}>
                    {card.title}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* 4. Floating Chatbot Button (Hidden when chat is open) */}
      {!chatOpen && (
        <Tooltip title="Open Rehab AI Chatbot" placement="left">
          <Fab
            color="primary"
            onClick={() => setChatOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 28,
              right: 28,
              width: 60,
              height: 60,
              background: 'linear-gradient(135deg, #00a8e8 0%, #0284c7 100%)',
              color: '#ffffff',
              boxShadow: '0 8px 30px rgba(0, 168, 232, 0.45)',
              zIndex: 999999,
              transition: 'all 0.25s ease-in-out',
              '&:hover': {
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                transform: 'scale(1.08)'
              }
            }}
          >
            <ChatIcon sx={{ fontSize: '1.8rem' }} />
          </Fab>
        </Tooltip>
      )}

      {/* 5. Floating Popup Chat Window */}
      {chatOpen && (
        <Paper
          elevation={16}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            width: { xs: 'calc(100vw - 32px)', sm: '420px' },
            height: { xs: 'calc(100vh - 64px)', sm: '650px' },
            maxHeight: 'calc(100vh - 64px)',
            borderRadius: 4,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)',
            zIndex: 999998,
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <Chat
            user={user}
            onLogout={onLogout}
            onToggleAdmin={onToggleAdmin}
            compact={true}
            onClose={() => setChatOpen(false)}
          />
        </Paper>
      )}

      {/* Keyframe animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}} />
    </Box>
  );
}
