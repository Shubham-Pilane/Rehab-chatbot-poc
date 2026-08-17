import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, IconButton, Fab, Zoom, Tooltip } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import AddHomeWorkIcon from '@mui/icons-material/AddHome';
import EngineeringIcon from '@mui/icons-material/Engineering';
import PeopleIcon from '@mui/icons-material/People';
import ConstructionIcon from '@mui/icons-material/Construction';
import GroupsIcon from '@mui/icons-material/Groups';
import BusinessIcon from '@mui/icons-material/Business';
import Chat from './Chat';

const DashboardCard = ({ title, icon: Icon, bgColor, onClick }) => {
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Paper
        onClick={onClick}
        elevation={2}
        sx={{
          height: '180px',
          backgroundColor: bgColor,
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          borderRadius: 0, // Matches flat layout from screenshot
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            opacity: 0.95
          }
        }}
      >
        <Icon sx={{ fontSize: '3.5rem', mb: 1.5 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: '0.03em' }}>
          {title}
        </Typography>
      </Paper>
    </Grid>
  );
};

export default function Dashboard({ user, onLogout, onToggleAdmin }) {
  const [chatOpen, setChatOpen] = useState(false);

  const cards = [
    { title: 'Projects', icon: HomeWorkIcon, bgColor: '#00a8e8' },
    { title: 'New Project', icon: AddHomeWorkIcon, bgColor: '#84bd00' },
    { title: 'Contacts', icon: EngineeringIcon, bgColor: '#ff6c2f' },
    { title: 'Team', icon: PeopleIcon, bgColor: '#2f4858' },
    { title: 'Tasks & Pricing', icon: ConstructionIcon, bgColor: '#84bd00' },
    { title: 'Project Groups', icon: GroupsIcon, bgColor: '#00a8e8' },
    { title: 'Brand Management', icon: BusinessIcon, bgColor: '#2f4858' }
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', position: 'relative' }}>
      {/* Top Header bar matching screenshot */}
      <Paper
        square
        elevation={3}
        sx={{
          background: '#1b365d', // Dark blue brand color
          color: '#ffffff',
          px: 3,
          py: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10
        }}
      >
        {/* Left Side Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HomeWorkIcon sx={{ color: '#84bd00', fontSize: '2rem' }} />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              variant="body2"
              sx={{
                color: '#00a8e8',
                fontWeight: 900,
                fontSize: '0.75rem',
                lineHeight: 1,
                letterSpacing: '0.05em',
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
                fontSize: '1.1rem',
                lineHeight: 1,
                letterSpacing: '0.02em'
              }}
            >
              Habitat
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#bbbbbb',
                fontSize: '0.55rem',
                lineHeight: 1,
                mt: 0.2
              }}
            >
              for Humanity®
            </Typography>
          </Box>
        </Box>

        {/* Center Title */}
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '0.1em', fontSize: '1.2rem' }}>
          DASHBOARD
        </Typography>

        {/* Right Action Icons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton color="inherit" sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
            <HomeIcon />
          </IconButton>
          <IconButton color="inherit" sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
            <MenuIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Main Grid Content */}
      <Box sx={{ flexGrow: 1, p: 4, display: 'flex', alignItems: 'flex-start' }}>
        <Grid container spacing={3}>
          {cards.map((card, idx) => (
            <DashboardCard
              key={idx}
              title={card.title}
              icon={card.icon}
              bgColor={card.bgColor}
              onClick={() => alert(`Dummy click for ${card.title}`)}
            />
          ))}
          {/* Empty box to complete grid spacing */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ height: '180px' }} />
          </Grid>
        </Grid>
      </Box>

      {/* Floating Action Button for Chat */}
      <Zoom in={!chatOpen}>
        <Tooltip title="Chat with Rehab Assistant">
          <Fab
            color="primary"
            onClick={() => setChatOpen(!chatOpen)}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              backgroundColor: '#00a8e8',
              '&:hover': {
                backgroundColor: '#0284c7',
                transform: 'scale(1.1)'
              },
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
              zIndex: 1001
            }}
          >
            {chatOpen ? <CloseIcon /> : <ChatIcon />}
          </Fab>
        </Tooltip>
      </Zoom>

      {/* Floating Compact Chat Window */}
      {chatOpen && (
        <Paper
          elevation={12}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: { xs: 'calc(100vw - 48px)', sm: '420px' },
            height: { xs: 'calc(100vh - 48px)', sm: 'calc(100vh - 120px)' },
            maxHeight: '720px',
            borderRadius: 3,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #e2e8f0',
            boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
            zIndex: 1000,
            animation: 'fadeInUp 0.3s ease-out'
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

      {/* Add sliding animation keyframe */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}} />
    </Box>
  );
}
