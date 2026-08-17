const entityService = require('../src/services/entity.service');
const geminiService = require('../src/services/gemini.service');

jest.mock('../src/services/gemini.service');

describe('EntityService Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should extract projectNumber and vendorName', async () => {
    geminiService.generateJsonResponse.mockResolvedValue({
      projectNumber: 'P-1025',
      vendorName: 'ABC Flooring',
      invoiceNumber: null
    });

    const result = await entityService.extractEntities('Show details for project P-1025 done by ABC Flooring');
    expect(result).toEqual({
      projectNumber: 'P-1025',
      vendorName: 'ABC Flooring'
    });
  });

  it('should clean up empty or null fields', async () => {
    geminiService.generateJsonResponse.mockResolvedValue({
      projectNumber: '',
      vendorName: undefined,
      invoiceNumber: 'INV-9021'
    });

    const result = await entityService.extractEntities('Invoice INV-9021 details');
    expect(result).toEqual({
      invoiceNumber: 'INV-9021'
    });
  });

  it('should return empty object on error', async () => {
    geminiService.generateJsonResponse.mockRejectedValue(new Error('Connection timeout'));

    const result = await entityService.extractEntities('Show everything');
    expect(result).toEqual({});
  });
});
