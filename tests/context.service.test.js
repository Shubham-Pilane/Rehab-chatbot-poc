const contextService = require('../src/services/context.service');
const { ChatAuditLog, ChatMessage } = require('../src/models/chatbot');

jest.mock('../src/models/chatbot', () => {
  return {
    ChatAuditLog: {
      findOne: jest.fn()
    },
    ChatMessage: {
      findAll: jest.fn()
    }
  };
});

describe('ContextService Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should propagate previous entities when current query entities are missing them', async () => {
    // Mock last audit log containing projectNumber P-1025
    ChatAuditLog.findOne.mockResolvedValue({
      entities: {
        projectNumber: 'P-1025',
        vendorName: 'ABC Flooring'
      }
    });

    // Mock message history
    ChatMessage.findAll.mockResolvedValue([
      { sender: 'user', content: 'Status of Project P-1025' },
      { sender: 'assistant', content: 'It is delayed' }
    ]);

    const currentEntities = { vendorName: 'XYZ Plumbing' };
    const { mergedEntities, contextText } = await contextService.buildSessionContext(
      'some-session-uuid',
      currentEntities
    );

    // projectNumber from history should be merged, but vendorName from current should override the previous one
    expect(mergedEntities.projectNumber).toBe('P-1025');
    expect(mergedEntities.vendorName).toBe('XYZ Plumbing');
    expect(contextText).toContain('Active Project Context: P-1025');
    expect(contextText).toContain('Active Vendor Context: XYZ Plumbing');
  });

  it('should return default values when session id is not provided', async () => {
    const currentEntities = { projectNumber: 'P-9999' };
    const result = await contextService.buildSessionContext(null, currentEntities);
    expect(result.mergedEntities).toEqual({ projectNumber: 'P-9999' });
    expect(result.contextText).toBe('');
  });
});
