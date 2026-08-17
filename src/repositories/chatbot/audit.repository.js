const { ChatAuditLog, AiUsageLog, ChatUser } = require('../../models/chatbot');

class ChatAuditRepository {
  async logChatAudit(auditData) {
    return await ChatAuditLog.create(auditData);
  }

  async logAiUsage(usageData) {
    return await AiUsageLog.create(usageData);
  }

  async getAuditLogs(limit = 100, offset = 0) {
    return await ChatAuditLog.findAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
  }

  async getAiUsageMetrics() {
    return await AiUsageLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100
    });
  }
}

module.exports = new ChatAuditRepository();
