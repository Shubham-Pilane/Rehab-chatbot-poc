const { ChatAuditLog, ChatMessage } = require('../models/chatbot');

class ContextService {
  async buildSessionContext(sessionId, currentEntities) {
    const mergedEntities = { ...currentEntities };
    const contextObj = {
      projectNumber: null,
      vendorName: null,
      dateRange: null,
      previousConversations: []
    };

    if (!sessionId) {
      return { mergedEntities, contextText: '', previousConversations: [] };
    }

    try {
      // 1. Fetch previous messages in this session to build prompt history
      const previousMessages = await ChatMessage.findAll({
        where: { sessionId },
        order: [['createdAt', 'ASC']],
        limit: 10 // Last 10 exchanges for history
      });

      const conversationHistory = previousMessages.map(msg => ({
        sender: msg.sender,
        content: msg.content
      }));

      // 2. Fetch the most recent audit logs for this session to extract previous entities
      const lastAuditLog = await ChatAuditLog.findOne({
        where: { sessionId },
        order: [['createdAt', 'DESC']]
      });

      if (lastAuditLog && lastAuditLog.entities) {
        const prevEntities = lastAuditLog.entities;
        
        // Propagate entities if they are missing in current extraction
        const entityKeys = ['projectNumber', 'projectName', 'vendorName', 'invoiceNumber', 'dateRange', 'homeownerName', 'grantNumber'];
        entityKeys.forEach(key => {
          if (!mergedEntities[key] && prevEntities[key]) {
            mergedEntities[key] = prevEntities[key];
          }
        });
      }

      // 3. Build a context text summary for injection into prompt
      let contextText = '';
      if (mergedEntities.projectNumber) {
        contextText += `Active Project Context: ${mergedEntities.projectNumber}\n`;
      }
      if (mergedEntities.vendorName) {
        contextText += `Active Vendor Context: ${mergedEntities.vendorName}\n`;
      }
      if (mergedEntities.dateRange) {
        contextText += `Active Date Range Context: ${mergedEntities.dateRange}\n`;
      }

      return {
        mergedEntities,
        contextText,
        previousConversations: conversationHistory
      };
    } catch (err) {
      console.error('Error building session context:', err.message);
      return { mergedEntities, contextText: '', previousConversations: [] };
    }
  }
}

module.exports = new ContextService();
