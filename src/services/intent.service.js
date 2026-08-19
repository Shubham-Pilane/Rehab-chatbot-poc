const geminiService = require('./gemini.service');

const SUPPORTED_INTENTS = [
  'PROJECT_STATUS',
  'PROJECT_SUMMARY',
  'PROJECT_DELAY',
  'PROJECT_RISK',
  'PROJECT_BUDGET',
  'PROJECT_COST',
  'PROJECT_TIMELINE',
  'TASK_STATUS',
  'TASK_DELAY',
  'MILESTONE_STATUS',
  'MILESTONE_DELAY',
  'INVOICE_STATUS',
  'INVOICE_PENDING',
  'VENDOR_INFORMATION',
  'VENDOR_ASSIGNMENT',
  'DOCUMENT_SEARCH',
  'HOMEOWNER_UPDATE',
  'HOMEOWNER_LIST',
  'MANAGEMENT_SUMMARY',
  'UNKNOWN'
];

class IntentService {
  async detectIntent(userQuery) {
    const q = (userQuery || '').toLowerCase().trim();

    // Fast deterministic intent matching rules
    if (/homeowner\s*list|list\s*(all\s*)?homeowners?|get\s*(all\s*)?homeowners?|show\s*(all\s*)?homeowners?/.test(q)) {
      return { intent: 'HOMEOWNER_LIST', confidence: 0.99 };
    }
    if (/homeowner\s*update|update\s*for\s*homeowner/.test(q)) {
      return { intent: 'HOMEOWNER_UPDATE', confidence: 0.99 };
    }
    if (/vendor\s*list|list\s*(all\s*)?vendors?|get\s*(all\s*)?vendors?|show\s*(all\s*)?vendors?/.test(q)) {
      return { intent: 'VENDOR_INFORMATION', confidence: 0.99 };
    }
    if (/project\s*names?|names?\s*of\s*projects?|project\s*list|list\s*(all\s*)?projects?|get\s*(all\s*)?projects?|show\s*(all\s*)?projects?/.test(q)) {
      return { intent: 'PROJECT_SUMMARY', confidence: 0.99 };
    }
    if (/management\s*summary|total\s*projects|total\s*invoices|overall\s*metrics/.test(q)) {
      return { intent: 'MANAGEMENT_SUMMARY', confidence: 0.99 };
    }

    const systemPrompt = `
You are a language classification assistant. 
Analyze the user's query about repair project management and classify it into EXACTLY ONE of the following intents:
${SUPPORTED_INTENTS.join(', ')}

Here are guidelines for classification:
- PROJECT_STATUS: User asks about how a specific project is doing (e.g., "What is the status of P-1025?")
- PROJECT_SUMMARY: User asks for a general summary of a project.
- PROJECT_DELAY: User asks why a project is delayed.
- PROJECT_RISK: User asks about risks or issues on a project.
- PROJECT_BUDGET / PROJECT_COST: User asks about project financial status, money spent, budgets (e.g. "budget vs actual").
- TASK_STATUS: User asks about individual tasks ("Is the plumbing finished?").
- MILESTONE_STATUS / MILESTONE_DELAY: User asks about project milestones.
- INVOICE_STATUS: User asks about invoice amounts, dates, or specific invoices.
- INVOICE_PENDING: User asks specifically for pending, unpaid, or invoices awaiting approval.
- VENDOR_INFORMATION: User asks about vendor details, contact information, licenses.
- VENDOR_ASSIGNMENT: User asks which vendors are working on what.
- DOCUMENT_SEARCH: User asks questions requiring information from uploaded documents (e.g., "What did the inspector mention?").
- HOMEOWNER_UPDATE: User requests an update message written for the homeowner.
- HOMEOWNER_LIST: User asks for a list of all homeowners in the database (e.g. "can you give me homeowner list", "list all homeowners").
- MANAGEMENT_SUMMARY: User asks for high-level summaries, database metrics, or overall counts of all projects/invoices (e.g. "how many total projects do we have?", "what is our total project count?").
- UNKNOWN: Use if the query is unrelated, a general greeting, or doesn't map to these.

Respond ONLY with a JSON object containing the fields "intent" and "confidence" (number between 0 and 1).
Example output:
{
  "intent": "PROJECT_STATUS",
  "confidence": 0.96
}
`;

    try {
      const result = await geminiService.generateJsonResponse(systemPrompt, userQuery, 'intent');
      
      // Post-process to ensure validity
      let intent = result && result.intent ? result.intent.toUpperCase() : 'UNKNOWN';
      let confidence = result && typeof result.confidence === 'number' ? result.confidence : 0.5;

      if (!SUPPORTED_INTENTS.includes(intent)) {
        intent = 'UNKNOWN';
      }

      return { intent, confidence };
    } catch (err) {
      console.error('Error in IntentService:', err.message);
      return { intent: 'UNKNOWN', confidence: 0.0 };
    }
  }
}

module.exports = new IntentService();
