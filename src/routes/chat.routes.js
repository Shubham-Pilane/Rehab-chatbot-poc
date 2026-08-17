const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const chatController = require('../controllers/chat.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { 
  createSessionSchema, 
  messageSchema, 
  feedbackSchema, 
  searchSchema, 
  validateRequest 
} = require('../validators/chat.validator');

const router = express.Router();

// Configure Multer for RAG uploads
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.pdf', '.docx', '.txt', '.csv', '.xlsx', '.xls', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, TXT, CSV, XLSX/XLS Excel, and JPG/PNG Images are supported.'));
    }
  }
});

// Chat session endpoints
router.post('/session', authenticate, validateRequest(createSessionSchema), chatController.createSession);
router.get('/history', authenticate, chatController.getSessions);
router.get('/session/:id', authenticate, chatController.getSessionById);
router.delete('/session/:id', authenticate, chatController.deleteSession);

// Messaging endpoint (the 11-step chatbot pipeline)
router.post('/message', authenticate, validateRequest(messageSchema), chatController.sendMessage);

// Feedback endpoint
router.post('/feedback', authenticate, validateRequest(feedbackSchema), chatController.submitFeedback);

// RAG Upload and Vector Search endpoints
router.post(
  '/document-upload', 
  authenticate, 
  authorize(['Admin', 'Project Manager', 'Finance Manager']), 
  upload.single('document'), 
  chatController.uploadDocument
);
router.post('/search-document', authenticate, validateRequest(searchSchema), chatController.searchDocuments);
router.get('/documents', authenticate, authorize(['Admin', 'Project Manager', 'Finance Manager']), chatController.getDocuments);
router.delete('/document/:id', authenticate, authorize(['Admin']), chatController.deleteDocument);

// Audit and usage endpoints
router.get('/audit-logs', authenticate, authorize(['Admin', 'Project Manager']), chatController.getAuditLogs);

module.exports = router;
