const { ChatSession, ChatMessage } = require('../../models/chatbot');

class ChatSessionRepository {
  async createSession(userId, title = 'New Chat') {
    return await ChatSession.create({
      userId,
      title,
      isActive: true
    });
  }

  async getSessionsByUser(userId) {
    return await ChatSession.findAll({
      where: { userId, isActive: true },
      order: [['createdAt', 'DESC']]
    });
  }

  async getSessionById(sessionId, includeMessages = false) {
    const options = {};
    if (includeMessages) {
      options.include = [{
        model: ChatMessage,
        as: 'messages'
      }];
      options.order = [[{ model: ChatMessage, as: 'messages' }, 'createdAt', 'ASC']];
    }
    return await ChatSession.findByPk(sessionId, options);
  }

  async updateSessionTitle(sessionId, newTitle) {
    const session = await ChatSession.findByPk(sessionId);
    if (session) {
      session.title = newTitle;
      await session.save();
    }
    return session;
  }

  async updateSessionSummary(sessionId, summary) {
    const session = await ChatSession.findByPk(sessionId);
    if (session) {
      session.summary = summary;
      await session.save();
    }
    return session;
  }

  async deleteSession(sessionId) {
    const session = await ChatSession.findByPk(sessionId);
    if (session) {
      // Soft or hard delete, let's mark isActive = false
      session.isActive = false;
      await session.save();
      return true;
    }
    return false;
  }
}

module.exports = new ChatSessionRepository();
