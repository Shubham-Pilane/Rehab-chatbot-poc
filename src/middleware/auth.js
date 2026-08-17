const jwt = require('jsonwebtoken');
const { ChatUser, ChatRole } = require('../models/chatbot');

const JWT_SECRET = process.env.JWT_SECRET || 'rehab_chatbot_jwt_secret_dev_key_2026';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await ChatUser.findByPk(decoded.userId, {
      include: [{ model: ChatRole, as: 'roles' }]
    });

    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'User is inactive or does not exist.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = {
  authenticate,
  JWT_SECRET
};
