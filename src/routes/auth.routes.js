const express = require('express');
const authController = require('../controllers/auth.controller');
const { registerSchema, loginSchema, validateRequest } = require('../validators/auth.validator');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);

module.exports = router;
