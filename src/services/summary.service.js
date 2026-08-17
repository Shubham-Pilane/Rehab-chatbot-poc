const geminiService = require('./gemini.service');
const chatSessionRepository = require('../repositories/chatbot/session.repository');

class SummaryService {
  /**
   * Asynchronously update the running conversation summary for a session as a structured CSV string.
   */
  async updateSummary(sessionId, currentSummary, userText, assistantText) {
    try {
      const systemPrompt = `You are an AI conversation summarizer for a Repair Project Management chatbot.
Your task is to maintain a structured CSV summary string of key entities and facts extracted from the conversation.

Instructions:
1. Format your output strictly as CSV with the following exact header on line 1:
Turn,Sender,Entity_Or_Topic,Value_Or_Details

2. Extract and track key entities: Project IDs/Numbers, Street Addresses, Cities, Homeowner Names, Vendor Names, Dates, Milestones, Budgets, and Invoices.
3. Incorporate the new turn into the CSV summary by appending or updating rows.
4. Output ONLY the raw CSV string. Do NOT include markdown code blocks (like \`\`\`csv) or extra introductory/explanatory text.`;

      const prompt = `Existing CSV Summary:
${currentSummary || 'Turn,Sender,Entity_Or_Topic,Value_Or_Details'}

Latest Turn:
User: "${userText}"
Assistant: "${assistantText}"

Provide the updated CSV summary:`;

      const geminiResponse = await geminiService.generateChatResponse(systemPrompt, prompt);
      let newSummary = geminiResponse && geminiResponse.text ? geminiResponse.text : '';
      
      if (newSummary && newSummary.trim()) {
        let cleanSummary = newSummary.trim()
          .replace(/```csv/gi, '')
          .replace(/```/g, '')
          .trim();

        if (!cleanSummary.startsWith('Turn,Sender')) {
          cleanSummary = `Turn,Sender,Entity_Or_Topic,Value_Or_Details\n${cleanSummary}`;
        }

        await chatSessionRepository.updateSessionSummary(sessionId, cleanSummary);
        console.log(`\n==================================================`);
        console.log(`📊 [Updated CSV Conversation Summary for Session ${sessionId}]:`);
        console.log(cleanSummary);
        console.log(`==================================================\n`);
        return cleanSummary;
      }
    } catch (err) {
      console.error('Error generating CSV conversation summary:', err.message);
    }
    return currentSummary;
  }
}

module.exports = new SummaryService();
