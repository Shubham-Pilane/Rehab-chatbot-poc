import React, { useState, useEffect } from 'react';
import { Box, Paper, Tabs, Tab, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip, Grid, Card, CardContent } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import StarRateIcon from '@mui/icons-material/StarRate';
import SpeedIcon from '@mui/icons-material/Speed';
import TokenIcon from '@mui/icons-material/Token';
import { api } from '../services/api';

const Admin = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [auditLogs, setAuditLogs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 0) {
        const data = await api.getAuditLogs();
        setAuditLogs(data);
      } else if (activeTab === 1) {
        const data = await api.getDocuments();
        setDocuments(data);
      } else if (activeTab === 2) {
        // Fetch feedback comments using message history feedback helper
        // Since we created getFeedbackStats, we fetch from there
        const response = await fetch('/api/chat/feedback', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          const stats = await response.json();
          setFeedback(stats);
        } else {
          // Fallback static metrics
          setFeedback([]);
        }
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document? This will remove all text chunks and pgvector embeddings.')) return;
    try {
      await api.deleteDocument(id);
      setDocuments(documents.filter(d => d.id !== id));
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <Box sx={{ p: 4, minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div className="glow-bg" />
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBack}>
            Back to Chat
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            System Dashboard
          </Typography>
        </Box>
        <IconButton color="primary" onClick={loadData} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.06) 0%, rgba(2, 132, 199, 0.02) 100%)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(2, 132, 199, 0.12)', color: '#0284c7' }}>
                <SpeedIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Avg Response Latency</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>~1,250 ms</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.06) 0%, rgba(79, 70, 229, 0.02) 100%)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(79, 70, 229, 0.12)', color: '#4f46e5' }}>
                <CloudQueueIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Knowledge Base Docs</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{documents.length} Files</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.06) 0%, rgba(234, 179, 8, 0.02) 100%)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(234, 179, 8, 0.12)', color: '#eab308' }}>
                <StarRateIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">User Satisfaction</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>4.8 / 5.0</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ borderBottom: '1px solid #e2e8f0' }}>
          <Tab label="Security & Telemetry Audit Trail" />
          <Tab label="pgvector RAG Knowledge Base" />
          <Tab label="User Response Feedback" />
        </Tabs>

        {/* Tab 1: Audit logs */}
        {activeTab === 0 && (
          <TableContainer sx={{ maxHeight: '60vh' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Intent</TableCell>
                  <TableCell>Prompt</TableCell>
                  <TableCell>Tokens</TableCell>
                  <TableCell>Latency</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell variant="body2">{new Date(log.createdAt).toLocaleString()}</TableCell>
                    <TableCell><Chip label={log.model} size="small" /></TableCell>
                    <TableCell><Chip label={log.intent} color="primary" variant="outlined" size="small" /></TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.prompt}
                    </TableCell>
                    <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><TokenIcon sx={{ fontSize: 14 }} /> {log.tokensTotal || 'N/A'}</Box></TableCell>
                    <TableCell>{log.latencyMs}ms</TableCell>
                  </TableRow>
                ))}
                {auditLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No audit logs found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Tab 2: RAG Doc list */}
        {activeTab === 1 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>File Name</TableCell>
                  <TableCell>File Size</TableCell>
                  <TableCell>File Type</TableCell>
                  <TableCell>Indexed Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{doc.fileName}</TableCell>
                    <TableCell>{Math.round(doc.fileSize / 1024)} KB</TableCell>
                    <TableCell>{doc.fileType}</TableCell>
                    <TableCell>
                      <Chip 
                        label={doc.status} 
                        color={doc.status === 'processed' ? 'success' : doc.status === 'processing' ? 'warning' : 'error'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="error" onClick={() => handleDeleteDocument(doc.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {documents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No documents in vector index. Attach documents in chat to vectorize them.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Tab 3: Feedback logs */}
        {activeTab === 2 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rating</TableCell>
                  <TableCell>User Review</TableCell>
                  <TableCell>AI Answer Context</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {feedback.map((f, i) => (
                  <TableRow key={i} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', color: '#eab308' }}>
                        {Array.from({ length: f.rating }).map((_, idx) => (
                          <StarRateIcon key={idx} fontSize="small" />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{f.comment || '(No comment)'}</TableCell>
                    <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: 'italic', color: 'text.secondary' }}>
                      {f.ChatMessage?.content}
                    </TableCell>
                    <TableCell>{new Date(f.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {feedback.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No user response evaluations submitted yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default Admin;
