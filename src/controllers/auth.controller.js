const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const chatUserRepository = require('../repositories/chatbot/user.repository');
const { JWT_SECRET } = require('../middleware/auth');

class AuthController {
  async register(req, res) {
    try {
      const { username, email, password, firstName, lastName, roles } = req.validatedBody;

      // Check if username/email exists
      const existingUser = await chatUserRepository.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username is already taken.' });
      }

      const existingEmail = await chatUserRepository.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: 'Email is already registered.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await chatUserRepository.createChatUser(
        {
          username,
          email,
          passwordHash,
          firstName,
          lastName,
          status: 'active'
        },
        roles || ['Viewer']
      );

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        message: 'Registration successful.',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles.map(r => r.name)
        }
      });
    } catch (err) {
      console.error('Registration error:', err);
      return res.status(500).json({ error: 'An unexpected error occurred during registration.' });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.validatedBody;

      const user = await chatUserRepository.findByUsername(username);
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password.' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid username or password.' });
      }

      if (user.status !== 'active') {
        return res.status(401).json({ error: 'Account is deactivated.' });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(200).json({
        message: 'Login successful.',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles.map(r => r.name)
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'An unexpected error occurred during login.' });
    }
  }

  async me(req, res) {
    try {
      const user = req.user;
      return res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles.map(r => r.name)
        }
      });
    } catch (err) {
      console.error('Profile fetch error:', err);
      return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  }
}

module.exports = new AuthController();
