import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Box, Grid, Paper, List, ListItem, ListItemButton, ListItemText, Typography, TextField, IconButton, Button, Avatar, Chip, Tooltip, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Dialog, DialogTitle, DialogContent, DialogActions, Rating, Divider } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import SecurityIcon from '@mui/icons-material/Security';
import InfoIcon from '@mui/icons-material/Info';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { api } from '../services/api';

const formatMessageTimestamp = (timestamp) => {
  const dateObj = timestamp ? new Date(timestamp) : new Date();
  if (isNaN(dateObj.getTime())) {
    const now = new Date();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    let h = now.getHours();
    const min = String(now.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${m}/${d} ${h}:${min} ${ampm}`;
  }
  const m = dateObj.getMonth() + 1;
  const d = dateObj.getDate();
  let h = dateObj.getHours();
  const min = String(dateObj.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${m}/${d} ${h}:${min} ${ampm}`;
};

const formatSessionTitle = (session) => {
  if (session.title && !session.title.startsWith('New Chat') && !session.title.startsWith('Chat -')) {
    return session.title;
  }
  const dateObj = session.createdAt ? new Date(session.createdAt) : new Date();
  const dateFormatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const timeFormatted = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `Chat - ${dateFormatted}, ${timeFormatted}`;
};

const getNewSessionTitle = () => {
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const timeFormatted = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `Chat - ${dateFormatted}, ${timeFormatted}`;
};

const renderMarkdown = (text) => {
  if (!text) return '';
  const lines = text.split('\n');
  return lines.map((line, index) => {
    let isBullet = false;
    let cleanLine = line;
    
    if (line.trim().startsWith('* ')) {
      isBullet = true;
      cleanLine = line.trim().substring(2);
    } else if (line.trim().startsWith('- ')) {
      isBullet = true;
      cleanLine = line.trim().substring(2);
    }
    
    const parts = [];
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    let lastIndex = 0;
    
    while ((match = boldRegex.exec(cleanLine)) !== null) {
      if (match.index > lastIndex) {
        parts.push(cleanLine.substring(lastIndex, match.index));
      }
      parts.push(<strong key={match.index}>{match[1]}</strong>);
      lastIndex = boldRegex.lastIndex;
    }
    
    if (lastIndex < cleanLine.length) {
      parts.push(cleanLine.substring(lastIndex));
    }
    
    if (isBullet) {
      return (
        <Box key={index} sx={{ display: 'flex', ml: 2, mb: 0.5, gap: 1, alignItems: 'flex-start', color: 'inherit' }}>
          <Typography variant="body1" color="inherit" sx={{ userSelect: 'none' }}>•</Typography>
          <Typography variant="body1" color="inherit" sx={{ flexGrow: 1, lineHeight: 1.6, fontSize: '0.95rem' }}>
            {parts.length > 0 ? parts : cleanLine}
          </Typography>
        </Box>
      );
    }
    
    return (
      <Typography key={index} variant="body1" color="inherit" sx={{ minHeight: '1.2em', lineHeight: 1.6, fontSize: '0.95rem', mb: 0.5 }}>
        {parts.length > 0 ? parts : cleanLine}
      </Typography>
    );
  });
};

const Chat = ({ user, onLogout, onToggleAdmin, compact = false, onClose }) => {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState('');
  
  // Pagination & Scroll State
  const INITIAL_BATCH_SIZE = 10;
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollContainerRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  const previousScrollHeightRef = useRef(0);
  const isPrependingRef = useRef(false);

  // Debug / Intent metadata
  const [latestIntent, setLatestIntent] = useState('');
  const [latestEntities, setLatestEntities] = useState({});
  const [latestLatency, setLatestLatency] = useState(0);

  // Feedback State
  const [feedbackMessageId, setFeedbackMessageId] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState([]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const isAdminOrManager = user.roles.some(r => ['Admin', 'Project Manager', 'Finance Manager'].includes(r));

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    setSuggestedFollowUps([]);
    setVisibleCount(INITIAL_BATCH_SIZE);
    isInitialLoadRef.current = true;
    if (activeSessionId) {
      loadSessionMessages(activeSessionId);
    } else {
      setMessages([]);
    }
  }, [activeSessionId]);

  useLayoutEffect(() => {
    if (!scrollContainerRef.current) return;

    if (isInitialLoadRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      isInitialLoadRef.current = false;
    } else if (isPrependingRef.current) {
      const newScrollHeight = scrollContainerRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - previousScrollHeightRef.current;
      scrollContainerRef.current.scrollTop = scrollDiff;
      isPrependingRef.current = false;
    } else {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, visibleCount, loading]);

  const loadMoreMessages = () => {
    if (visibleCount >= messages.length || loadingMore) return;
    setLoadingMore(true);
    if (scrollContainerRef.current) {
      previousScrollHeightRef.current = scrollContainerRef.current.scrollHeight;
      isPrependingRef.current = true;
    }
    setVisibleCount(prev => Math.min(prev + 10, messages.length));
    setLoadingMore(false);
  };

  const handleScroll = (e) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop < 30 && visibleCount < messages.length && !loadingMore) {
      loadMoreMessages();
    }
  };

  const loadSessions = async () => {
    try {
      const data = await api.getSessions();
      if (data && data.length > 0) {
        setSessions(data);
        setActiveSessionId(data[0].id);
      } else {
        const newSession = await api.createSession(getNewSessionTitle());
        setSessions([newSession]);
        setActiveSessionId(newSession.id);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  const loadSessionMessages = async (id) => {
    try {
      const data = await api.getSession(id);
      const msgs = data.messages || [];
      setMessages(msgs);
      setVisibleCount(Math.max(20, msgs.length));
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const handleCreateSession = async () => {
    try {
      const newSession = await api.createSession(getNewSessionTitle());
      setSessions([newSession, ...sessions]);
      setActiveSessionId(newSession.id);
    } catch (err) {
      console.error('Error creating session:', err);
    }
  };

  const handleDeleteSession = async (id, e) => {
    e.stopPropagation();
    try {
      await api.deleteSession(id);
      const filtered = sessions.filter(s => s.id !== id);
      setSessions(filtered);
      if (activeSessionId === id) {
        setActiveSessionId(filtered.length > 0 ? filtered[0].id : null);
      }
    } catch (err) {
      console.error('Error deleting session:', err);
    }
  };

  const streamAssistantResponse = (data, userText) => {
    return new Promise((resolve) => {
      const fullText = data.message?.content || data.response || '';
      if (!fullText) {
        loadSessionMessages(activeSessionId);
        resolve();
        return;
      }

      const assistantMsgId = data.message?.id || `temp-assistant-${Date.now()}`;
      const words = fullText.split(' ');
      const totalWords = words.length;

      // Set user message & empty assistant placeholder
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'temp-user'),
        { id: `user-${Date.now()}`, sender: 'user', content: userText },
        { id: assistantMsgId, sender: 'assistant', content: '' }
      ]);

      // Balanced word streaming (~0.6s total duration, 1-2 words per frame)
      const wordsPerFrame = Math.max(1, Math.ceil(totalWords / 35));
      let currentWordIndex = 0;

      const animate = () => {
        currentWordIndex = Math.min(currentWordIndex + wordsPerFrame, totalWords);
        const currentText = words.slice(0, currentWordIndex).join(' ');

        setMessages(prev => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (updated[lastIndex].id === assistantMsgId) {
            updated[lastIndex] = { ...updated[lastIndex], content: currentText };
            return updated;
          }
          return updated.map(msg => msg.id === assistantMsgId ? { ...msg, content: currentText } : msg);
        });

        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }

        if (currentWordIndex < totalWords) {
          requestAnimationFrame(animate);
        } else {
          setSuggestedFollowUps(data.suggestedFollowUps || []);
          loadSessionMessages(activeSessionId);
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeSessionId || loading) return;

    const userText = input;
    setInput('');
    setSuggestedFollowUps([]);
    setLoading(true);
    isPrependingRef.current = false;
    setVisibleCount(prev => prev + 2);

    // Optimistically add user message
    setMessages(prev => [...prev, { id: 'temp-user', sender: 'user', content: userText }]);

    try {
      const data = await api.sendMessage(activeSessionId, userText);
      setLatestIntent(data.intent);
      setLatestEntities(data.entities);
      setLatestLatency(data.latencyMs);

      setLoading(false);
      await streamAssistantResponse(data, userText);
    } catch (err) {
      console.error('Send message error:', err);
      setMessages(prev => [...prev, { 
        id: 'temp-err', 
        sender: 'assistant', 
        content: `Error: ${err.message || 'Failed to generate response. Please check backend.'}` 
      }]);
      setLoading(false);
    }
  };

  const handleSendSuggestedMessage = async (question) => {
    if (!activeSessionId || loading) return;
    setInput('');
    setSuggestedFollowUps([]);
    setLoading(true);
    isPrependingRef.current = false;
    setVisibleCount(prev => prev + 2);

    // Optimistically add user message
    setMessages(prev => [...prev, { id: 'temp-user', sender: 'user', content: question }]);

    try {
      const data = await api.sendMessage(activeSessionId, question);
      setLatestIntent(data.intent);
      setLatestEntities(data.entities);
      setLatestLatency(data.latencyMs);

      setLoading(false);
      await streamAssistantResponse(data, question);
    } catch (err) {
      console.error('Send message error:', err);
      setMessages(prev => [...prev, { 
        id: 'temp-err', 
        sender: 'assistant', 
        content: `Error: ${err.message || 'Failed to generate response.'}` 
      }]);
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setFileError('');
    try {
      await api.uploadDocument(file);
      alert(`✔ "${file.name}" uploaded and embedded via pgvector search successfully!`);
    } catch (err) {
      setFileError(err.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openFeedbackDialog = (messageId) => {
    setFeedbackMessageId(messageId);
    setFeedbackRating(5);
    setFeedbackComment('');
    setFeedbackOpen(true);
  };

  const handleSubmitFeedback = async () => {
    try {
      await api.submitFeedback(feedbackMessageId, feedbackRating, feedbackComment);
      setFeedbackOpen(false);
      alert('Thank you for your feedback rating!');
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  return (
    <Box sx={{ height: compact ? '100%' : '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* Header bar */}
      <Paper square sx={{ p: compact ? 1.5 : 2, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', zIndex: 10 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Chat History">
            <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} color="primary" size="small" sx={{ mr: 0.5 }}>
              <MenuIcon />
            </IconButton>
          </Tooltip>
          <Typography variant={compact ? 'subtitle1' : 'h5'} sx={{ color: '#0284c7', fontWeight: 800, letterSpacing: '0.02em' }}>
            HABI - REHAB TRACKER AI
          </Typography>
          <Chip 
            size="small" 
            label="Google Vertex AI" 
            sx={{ 
              height: 20, 
              fontSize: '0.65rem', 
              bgcolor: '#eff6ff', 
              color: '#1e40af', 
              border: '1px solid #bfdbfe', 
              fontWeight: 700,
              ml: 1
            }} 
          />
        </Box>
        <Box sx={{ display: 'flex', gap: compact ? 0.5 : 1.5, alignItems: 'center' }}>
          {!compact && (
            <Typography variant="body2" sx={{ color: '#475569', display: { xs: 'none', sm: 'block' } }}>
              Welcome, <b>{user.firstName || user.username}</b>
            </Typography>
          )}
          {!compact && isAdminOrManager && (
            <Button variant="outlined" color="secondary" startIcon={<SettingsIcon />} size="small" onClick={onToggleAdmin}>
              Dashboard
            </Button>
          )}
          {!compact && (
            <Tooltip title="Logout">
              <IconButton color="error" onClick={onLogout} size="small">
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          )}
          {compact && onClose && (
            <IconButton onClick={onClose} size="small" sx={{ color: '#64748b' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Paper>

      {/* Compact History Overlay Drawer */}
      {compact && sidebarOpen && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#ffffff',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}
        >
          <Box
            sx={{
              p: 1.5,
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
              Chat History
            </Typography>
            <IconButton size="small" onClick={() => setSidebarOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ p: 1.5 }}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                handleCreateSession();
                setSidebarOpen(false);
              }}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Start New Chat
            </Button>
          </Box>

          <Divider />

          <List sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
            {sessions.map((session) => (
              <ListItem
                key={session.id}
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    size="small"
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
                sx={{ mb: 0.5 }}
              >
                <ListItemButton
                  selected={activeSessionId === session.id}
                  onClick={() => {
                    setActiveSessionId(session.id);
                    setSidebarOpen(false);
                  }}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(2, 132, 199, 0.1)',
                      borderLeft: '3px solid #0284c7'
                    }
                  }}
                >
                  <ListItemText
                    primary={formatSessionTitle(session)}
                    primaryTypographyProps={{
                      noWrap: true,
                      variant: 'body2',
                      fontWeight: activeSessionId === session.id ? 700 : 400
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            {sessions.length === 0 && (
              <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', mt: 4 }}>
                No previous conversations
              </Typography>
            )}
          </List>
        </Box>
      )}

      {/* Main content grid */}
      <Grid container sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {/* Sidebar for full-screen mode */}
        <Grid item xs={12} md={3} sx={{ borderRight: '1px solid #e2e8f0', display: (!compact && sidebarOpen) ? 'flex' : 'none', flexDirection: 'column', height: '100%', background: '#f1f5f9' }}>
          <Box sx={{ p: 2 }}>
            <Button fullWidth variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleCreateSession}>
              New Chat Session
            </Button>
          </Box>
          <Divider />
          <List sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
            {sessions.map((session) => (
              <ListItem 
                key={session.id} 
                disablePadding 
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" size="small" onClick={(e) => handleDeleteSession(session.id, e)} sx={{ color: '#64748b', '&:hover': { color: '#f43f5e' } }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
                sx={{ mb: 0.5 }}
              >
                <ListItemButton 
                  selected={activeSessionId === session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(2, 132, 199, 0.08)',
                      borderLeft: '3px solid #0284c7',
                      '&:hover': { backgroundColor: 'rgba(2, 132, 199, 0.12)' }
                    }
                  }}
                >
                  <ListItemText 
                    primary={formatSessionTitle(session)} 
                    primaryTypographyProps={{ noWrap: true, variant: 'body2', fontWeight: activeSessionId === session.id ? 600 : 400 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            {sessions.length === 0 && (
              <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', mt: 4 }}>
                No active conversations
              </Typography>
            )}
          </List>
        </Grid>

        {/* Chat box container */}
        <Grid item xs={12} md={sidebarOpen ? 9 : 12} sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
          {!compact && <div className="glow-bg" />}

          {/* Messages scroll box */}
          <Box 
            ref={scrollContainerRef} 
            onScroll={handleScroll}
            sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            {messages.length > visibleCount && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
                <Button
                  size="small"
                  variant="text"
                  onClick={loadMoreMessages}
                  disabled={loadingMore}
                  sx={{ color: '#0284c7', fontSize: '0.75rem', textTransform: 'none', fontWeight: 600 }}
                >
                  {loadingMore ? 'Loading earlier messages...' : `▲ Load earlier messages (${messages.length - visibleCount} hidden)`}
                </Button>
              </Box>
            )}

            {messages.slice(-visibleCount).map((msg) => (
              <Box 
                key={msg.id}
                sx={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5
                }}
              >
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', mb: 0.2 }}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: '11px', bgcolor: msg.sender === 'user' ? 'primary.main' : 'secondary.main' }}>
                    {msg.sender === 'user' ? 'U' : 'AI'}
                  </Avatar>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    {msg.sender === 'user' ? 'You' : 'Assistant'}
                  </Typography>
                </Box>
                <Paper 
                  sx={{
                    p: 2, 
                    borderRadius: msg.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                    background: msg.sender === 'user' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : '#ffffff',
                    border: msg.sender === 'user' ? '1px solid #0284c7' : '1px solid #e2e8f0',
                    color: msg.sender === 'user' ? '#ffffff' : '#0f172a',
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {renderMarkdown(msg.content)}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.6, opacity: 0.85 }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: '0.65rem', 
                          color: msg.sender === 'user' ? 'rgba(255,255,255,0.85)' : '#64748b',
                          fontWeight: 500,
                          letterSpacing: '0.02em'
                        }}
                      >
                        {formatMessageTimestamp(msg.createdAt || msg.created_at)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Response Rating Action (only for AI) */}
                {msg.sender === 'assistant' && msg.id !== 'temp-err' && (
                  <Box sx={{ display: 'flex', gap: 1, alignSelf: 'flex-start', mt: 0.5 }}>
                    <Tooltip title="Provide response rating">
                      <IconButton size="small" onClick={() => openFeedbackDialog(msg.id)} sx={{ color: '#64748b', '&:hover': { color: '#38bdf8' } }}>
                        <ThumbUpIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>
            ))}

            {loading && (
              <Box sx={{ display: 'flex', gap: 1.5, alignSelf: 'flex-start', alignItems: 'center' }}>
                <CircularProgress size={18} color="secondary" />
                <Typography variant="caption" sx={{ color: '#64748b', fontStyle: 'italic', fontWeight: 500 }}>
                  Thinking...
                </Typography>
              </Box>
            )}
            {suggestedFollowUps && suggestedFollowUps.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, ml: 4, alignSelf: 'flex-start' }}>
                {suggestedFollowUps.map((q, idx) => (
                  <Button
                    key={idx}
                    variant="outlined"
                    size="small"
                    onClick={() => handleSendSuggestedMessage(q)}
                    sx={{
                      borderRadius: '16px',
                      textTransform: 'none',
                      borderColor: '#0284c7',
                      color: '#0284c7',
                      fontSize: '12px',
                      fontWeight: 500,
                      backgroundColor: 'rgba(2, 132, 199, 0.02)',
                      '&:hover': {
                        backgroundColor: 'rgba(2, 132, 199, 0.08)',
                        borderColor: '#0369a1'
                      }
                    }}
                  >
                    {q}
                  </Button>
                ))}
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>



          {/* Chat message input tray */}
          <Paper square sx={{ p: 2, background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
            <form onSubmit={handleSendMessage}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                {/* RAG Upload Trigger (Temporarily commented out) */}
                {/* 
                {isAdminOrManager && (
                  <>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                      accept=".pdf,.docx,.txt,.csv,.xlsx,.xls,.jpg,.jpeg,.png"
                    />
                    <Tooltip title="Upload doc for pgvector RAG indexing">
                      <span>
                        <IconButton 
                          color="secondary" 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading || !activeSessionId}
                        >
                          {uploading ? <CircularProgress size={20} color="secondary" /> : <AttachFileIcon />}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </>
                )}
                */}

                <TextField
                  fullWidth
                  placeholder={activeSessionId ? "Ask about project statuses, invoices, or homeowner details..." : "Please select or create a session..."}
                  variant="outlined"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={!activeSessionId || loading || uploading}
                  size="small"
                />
                
                <IconButton 
                  type="submit" 
                  color="primary" 
                  disabled={!input.trim() || !activeSessionId || loading}
                >
                  <SendIcon />
                </IconButton>
              </Box>
              {fileError && (
                <Typography variant="caption" color="error" display="block" sx={{ mt: 1, ml: 6 }}>
                  {fileError}
                </Typography>
              )}
            </form>
          </Paper>
        </Grid>
      </Grid>

      {/* Response Rating Feedback Dialog */}
      <Dialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Evaluate Assistant Response</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Help us improve the RAG prompts and database mappings by rating this response.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            <Rating
              value={feedbackRating}
              onChange={(event, newValue) => setFeedbackRating(newValue)}
              size="large"
            />
          </Box>
          <TextField
            label="Comments / Suggested corrections"
            multiline
            rows={3}
            value={feedbackComment}
            onChange={(e) => setFeedbackComment(e.target.value)}
            fullWidth
            placeholder="e.g. 'Correct budget is actually GR-405, and invoices are still pending...'"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitFeedback} variant="contained" color="primary">Submit Feedback</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Chat;
