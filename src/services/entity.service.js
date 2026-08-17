const geminiService = require('./gemini.service');

class EntityService {
  async extractEntities(userQuery) {
    const systemPrompt = `
You are an entity extraction assistant. Your task is to extract relevant entities from the user's project management query.
Extract the following entity types and map them to the corresponding camelCase keys:
- projectNumber: Project identifier (in this database, project numbers are typically 5 or 6-digit numbers like "876643", alphanumeric strings like "CTBU S2025 12", or codes starting with P- like "P-1025")
- projectName: Name of the project
- vendorName: Name of the vendor, company, contractor or subcontractor (e.g. "ABC Flooring", "XYZ Plumbing")
- invoiceNumber: Invoice identifier (usually starts with "INV-" followed by numbers, e.g. "INV-9021")
- taskName: Name of a task or activity (e.g. "drywall", "painting", "foundation check")
- milestoneName: Name of a milestone (e.g. "Inspections", "Closeout")
- dateRange: Mention of timeframes, dates or ranges (e.g. "last week", "Q1", "next month")
- homeownerName: Name of the homeowner (e.g. "Mr. Smith", "Jane Doe")
- grantNumber: Grant reference number (e.g. "GR-405")
- budgetType: Categorization of budget (e.g. "plumbing budget", "general budget")
- priority: Mention of priority (e.g. "urgent", "high", "low")

Respond ONLY with a JSON object containing the extracted fields. Do not include null or empty fields in the final output. If no entities are found, return empty JSON "{}".

Example Output:
{
  "projectNumber": "P-1025",
  "vendorName": "ABC Flooring"
}
`;

    try {
      const result = await geminiService.generateJsonResponse(systemPrompt, userQuery, 'entity');
      
      // Clean result: keep only non-null, non-empty properties
      const cleaned = {};
      if (result) {
        Object.keys(result).forEach(key => {
          if (result[key] !== null && result[key] !== undefined && result[key] !== '') {
            cleaned[key] = result[key];
          }
        });
      }
      return cleaned;
    } catch (err) {
      console.error('Error in EntityService:', err.message);
      return {};
    }
  }
}

module.exports = new EntityService();
