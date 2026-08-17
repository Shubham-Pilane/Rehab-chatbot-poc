const { VertexAI } = require('@google-cloud/vertexai');
const winston = require('../utils/logger'); // We will define this logger soon

class GeminiService {
  constructor() {
    this.projectId = process.env.GCP_PROJECT_ID;
    this.location = process.env.GCP_LOCATION || 'us-central1';
    this.hasCredentials = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
    this.isDummyKey = !this.hasCredentials || !this.projectId;
    
    // Support MOCK_AI environment variable to force 100% offline mock mode for fast catalog testing
    this.isMockMode = process.env.MOCK_AI === 'true' || this.isDummyKey;

    // Circuit Breaker State to bypass 429 quota retries
    this.circuitOpen = false;
    this.circuitCooldownUntil = 0;
    this.cooldownDurationMs = 5 * 60 * 1000; // 5 minutes

    if (this.isMockMode) {
      console.warn('⚠️ WARNING: Chatbot running in 100% MOCK mode (Offline/Bypassed). Vertex AI is disabled.');
    } else {
      try {
        // Instantiate the Google Cloud Vertex AI client
        this.client = new VertexAI({
          project: this.projectId,
          location: this.location
        });
      } catch (err) {
        console.error('Error instantiating Google Vertex AI SDK. Will run in mock mode.', err.message);
        this.isMockMode = true;
      }
    }
  }

  isCircuitActive() {
    if (this.isMockMode) return false;
    if (this.circuitOpen) {
      if (Date.now() > this.circuitCooldownUntil) {
        console.log('🔄 Circuit Breaker: Cooldown expired. Testing live connection (half-open).');
        this.circuitOpen = false;
        return true;
      }
      return false; // Circuit is open (skip Vertex AI API calls)
    }
    return true; // Live connection enabled
  }

  triggerCircuitBreaker(errorMsg) {
    if (errorMsg && (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('Too Many Requests') || errorMsg.includes('quota'))) {
      console.warn('🚨 Circuit Breaker Triggered: Rate limit (429) hit. Bypassing live Vertex AI for 5 minutes to avoid delay.');
      this.circuitOpen = true;
      this.circuitCooldownUntil = Date.now() + this.cooldownDurationMs;
    }
  }

  async generateChatResponse(systemPrompt, userPrompt, temperature = 0.2) {
    const startTime = Date.now();
    
    if (!this.isCircuitActive()) {
      const responseText = this.getMockResponse(systemPrompt, userPrompt);
      const latency = Date.now() - startTime;
      return {
        text: responseText,
        tokensPrompt: 50,
        tokensCompletion: responseText.split(' ').length,
        tokensTotal: 50 + responseText.split(' ').length,
        latencyMs: latency,
        model: 'gemini-1.5-flash (Mocked)'
      };
    }

    try {
      // Get the model
      const model = this.client.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { temperature }
      });

      const result = await model.generateContent({
        contents: [
          { role: 'user', parts: [{ text: `System Instruction: ${systemPrompt}\n\nUser Input: ${userPrompt}` }] }
        ]
      });

      const response = await result.response;
      const text = response.candidates[0].content.parts[0].text;
      const latency = Date.now() - startTime;
      
      // Approximate tokens if not provided by response metadata
      const tokensPrompt = Math.ceil(systemPrompt.length / 4 + userPrompt.length / 4);
      const tokensCompletion = Math.ceil(text.length / 4);
      
      return {
        text,
        tokensPrompt,
        tokensCompletion,
        tokensTotal: tokensPrompt + tokensCompletion,
        latencyMs: latency,
        model: 'gemini-2.5-flash (Vertex AI)'
      };
    } catch (err) {
      this.triggerCircuitBreaker(err.message);
      console.warn('⚠️ WARNING: Live Vertex AI chat API failed. Running in Mock fallback mode. Error:', err.message);
      const responseText = this.getMockResponse(systemPrompt, userPrompt);
      const latency = Date.now() - startTime;
      return {
        text: `${responseText}\n\n*(Note: Running in Mock fallback mode because Vertex AI API returned an error: "${err.message}")*`,
        tokensPrompt: 50,
        tokensCompletion: responseText.split(' ').length,
        tokensTotal: 50 + responseText.split(' ').length,
        latencyMs: latency,
        model: 'gemini-2.5-flash (Mock Fallback)'
      };
    }
  }

  async generateJsonResponse(systemPrompt, userPrompt, schemaName = '') {
    if (!this.isCircuitActive()) {
      return this.getMockJsonResponse(schemaName, userPrompt);
    }

    try {
      const model = this.client.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });

      const combinedPrompt = `System: ${systemPrompt}\n\nUser Query: ${userPrompt}\n\nRespond in JSON format.`;
      const result = await model.generateContent(combinedPrompt);
      const response = await result.response;
      const text = response.candidates[0].content.parts[0].text;
      
      return JSON.parse(text.trim());
    } catch (err) {
      this.triggerCircuitBreaker(err.message);
      console.warn('⚠️ WARNING: Live Vertex AI JSON API failed. Running in Mock fallback mode. Error:', err.message);
      return this.getMockJsonResponse(schemaName, userPrompt);
    }
  }

  async generateEmbedding(text) {
    if (this.isMockMode) {
      // Return a dummy 768-dimension vector
      const mockVector = Array.from({ length: 768 }, () => Math.random() - 0.5);
      // Normalize vector
      const magnitude = Math.sqrt(mockVector.reduce((sum, val) => sum + val * val, 0));
      return mockVector.map(val => val / magnitude);
    }

    try {
      const embeddingModel = this.client.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await embeddingModel.embedContent({
        content: {
          role: 'user',
          parts: [{ text }]
        }
      });
      return result.embedding.values;
    } catch (err) {
      this.triggerCircuitBreaker(err.message);
      console.warn('⚠️ WARNING: Live Vertex AI embedding API failed. Running in Mock fallback mode. Error:', err.message);
      const mockVector = Array.from({ length: 768 }, () => Math.random() - 0.5);
      const magnitude = Math.sqrt(mockVector.reduce((sum, val) => sum + val * val, 0));
      return mockVector.map(val => val / magnitude);
    }
  }

  getMockResponse(systemPrompt, userPrompt) {
    let query = userPrompt;
    if (userPrompt.includes('=== USER QUERY ===')) {
      const parts = userPrompt.split('=== USER QUERY ===');
      if (parts.length > 1) {
        const afterQueryHeader = parts[1].trim();
        const queryLines = afterQueryHeader.split('\n');
        query = queryLines[0].trim();
      }
    }
    const prompt = query.toLowerCase();
    if (prompt.includes('status')) {
      return 'According to the supplied records, Project P-1025 is currently Delayed. There is an active milestone "Inspections" that is overdue by 5 days. General plumbing tasks are in progress and are currently at 60% completion.';
    }
    if (prompt.includes('invoice')) {
      return 'Based on the context, there are 2 pending invoices. Invoice INV-9021 for $4,500.00 is awaiting approval from Finance. Invoice INV-8843 for $1,200.00 belongs to Vendor ABC and is pending.';
    }
    if (prompt.includes('vendor')) {
      return 'The assigned vendors for the project are "ABC Flooring" (status: active, license expires on 2026-09-15) and "XYZ Plumbing" (status: active). ABC Flooring has 1 pending invoice for $3,200.00.';
    }
    if (prompt.includes('budget')) {
      return 'Project budget report: The overall budget is $50,000.00. Total actual spent to date is $54,500.00. The project is over budget by $4,500.00 (9.0% cost variance) due to unexpected site remediation requirements.';
    }
    if (prompt.includes('homeowner')) {
      return 'Homeowner Update (Project P-1025):\nDear Mr. Smith, we have completed the structural reinforcement work. Plumbing routing is underway. Inspections are scheduled for next week. Current expected completion is 2026-08-30.';
    }
    return `Hello! I am your AI Repair Project Management Assistant. You asked: "${query}". Since the Gemini API is in Mock Mode, I am returning this simulated message. Please configure a valid GOOGLE_APPLICATION_CREDENTIALS and GCP_PROJECT_ID in the .env file to enable live AI responses.`;
  }

  getMockJsonResponse(schemaName, userPrompt) {
    const prompt = userPrompt.toLowerCase();
    
    if (schemaName === 'intent') {
      let intent = 'UNKNOWN';
      let confidence = 0.50;
      
      if (prompt.includes('status') && prompt.includes('project')) {
        intent = 'PROJECT_STATUS';
        confidence = 0.98;
      } else if (prompt.includes('delay') && prompt.includes('project')) {
        intent = 'PROJECT_DELAY';
        confidence = 0.95;
      } else if (prompt.includes('invoice')) {
        if (prompt.includes('pending') || prompt.includes('approval')) {
          intent = 'INVOICE_PENDING';
          confidence = 0.94;
        } else {
          intent = 'INVOICE_STATUS';
          confidence = 0.92;
        }
      } else if (prompt.includes('vendor')) {
        intent = 'VENDOR_INFORMATION';
        confidence = 0.96;
      } else if (prompt.includes('budget') || prompt.includes('cost') || prompt.includes('variance')) {
        intent = 'PROJECT_BUDGET';
        confidence = 0.97;
      } else if (prompt.includes('update') || prompt.includes('summary')) {
        intent = 'HOMEOWNER_UPDATE';
        confidence = 0.90;
      } else if (prompt.includes('search') || prompt.includes('plumbing') || prompt.includes('mention')) {
        intent = 'DOCUMENT_SEARCH';
        confidence = 0.88;
      }

      return { intent, confidence };
    }

    if (schemaName === 'entity') {
      const entities = {};
      
      // Match project numbers like P-1025
      const projectMatch = userPrompt.match(/P-\d+/i);
      if (projectMatch) {
        entities.projectNumber = projectMatch[0].toUpperCase();
      }

      // Match invoice numbers like INV-1234
      const invoiceMatch = userPrompt.match(/INV-\d+/i);
      if (invoiceMatch) {
        entities.invoiceNumber = invoiceMatch[0].toUpperCase();
      }

      // Match specific vendor names
      if (prompt.includes('abc flooring') || prompt.includes('abc')) {
        entities.vendorName = 'ABC Flooring';
      } else if (prompt.includes('xyz plumbing') || prompt.includes('xyz')) {
        entities.vendorName = 'XYZ Plumbing';
      }

      // Default values to return
      return entities;
    }

    if (schemaName === 'sql') {
      const q = userPrompt.toLowerCase();
      if (q.includes('project group') && q.includes('crash')) {
        return {
          sql: `SELECT p.id, p.project_number, p.status, p.project_state, pg.name AS project_group_name 
                FROM project p 
                JOIN project_project_group ppg ON p.id = ppg.project_id 
                JOIN project_group pg ON ppg.project_group_id = pg.id 
                WHERE pg.name ILIKE 'crash'`
        };
      }
      if (q.includes('actual cost') && q.includes('crash')) {
        return {
          sql: `SELECT SUM(i.amount) AS total_actual_cost 
                FROM project p 
                JOIN project_project_group ppg ON p.id = ppg.project_id 
                JOIN project_group pg ON ppg.project_group_id = pg.id 
                JOIN invoice i ON p.id = i.project_id 
                WHERE pg.name ILIKE 'crash'`
        };
      }
      if (q.includes('tahoe') && q.includes('gto')) {
        return {
          sql: `SELECT i.amount, addr.street_address, v.name AS vendor_name 
                FROM invoice i 
                JOIN project p ON i.project_id = p.id 
                JOIN home h ON p.home_id = h.id 
                JOIN address addr ON h.address_id = addr.id 
                JOIN vendor v ON i.vendor_id = v.id 
                WHERE addr.street_address ILIKE '%Tahoe%' AND v.name ILIKE '%GTO%'`
        };
      }
      if (q.includes('years at residence') || q.includes('asbestos')) {
        return {
          sql: `SELECT id FROM project WHERE project_number = 'P-1025' LIMIT 1`
        };
      }
      return {
        sql: `SELECT id FROM project LIMIT 1`
      };
    }

    return {};
  }
}

module.exports = new GeminiService();

