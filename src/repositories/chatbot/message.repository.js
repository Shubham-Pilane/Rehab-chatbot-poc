const { ChatMessage, ChatFeedback } = require('../../models/chatbot');

class ChatMessageRepository {
  async createMessage(sessionId, sender, content) {
    return await ChatMessage.create({
      sessionId,
      sender,
      content
    });
  }

  async getMessagesBySession(sessionId) {
    return await ChatMessage.findAll({
      where: { sessionId },
      order: [['createdAt', 'ASC']]
    });
  }

  async submitFeedback(messageId, userId, rating, comment = '') {
    return await ChatFeedback.upsert({
      messageId,
      userId,
      rating,
      comment
    });
  }

  async getFeedbackStats() {
    return await ChatFeedback.findAll({
      include: [
        {
          model: ChatMessage,
          attributes: ['content', 'sender', 'sessionId']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }
}

module.exports = new ChatMessageRepository();
