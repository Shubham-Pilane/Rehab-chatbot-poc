const intentService = require('../src/services/intent.service');
const geminiService = require('../src/services/gemini.service');

// Mock Gemini connection
jest.mock('../src/services/gemini.service');

describe('IntentService Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully detect PROJECT_STATUS intent', async () => {
    geminiService.generateJsonResponse.mockResolvedValue({
      intent: 'PROJECT_STATUS',
      confidence: 0.98
    });

    const result = await intentService.detectIntent('Show status of Project P-1025');
    expect(geminiService.generateJsonResponse).toHaveBeenCalledTimes(1);
    expect(result.intent).toBe('PROJECT_STATUS');
    expect(result.confidence).toBe(0.98);
  });

  it('should fallback to UNKNOWN if Gemini returns unsupported intent name', async () => {
    geminiService.generateJsonResponse.mockResolvedValue({
      intent: 'MAKE_COFFEE_INTENT',
      confidence: 0.88
    });

    const result = await intentService.detectIntent('Make me a cup of espresso');
    expect(result.intent).toBe('UNKNOWN');
  });

  it('should catch exceptions and return UNKNOWN intent with 0.0 confidence', async () => {
    geminiService.generateJsonResponse.mockRejectedValue(new Error('API Key invalid'));

    const result = await intentService.detectIntent('What is the invoice status?');
    expect(result.intent).toBe('UNKNOWN');
    expect(result.confidence).toBe(0.0);
  });
});
