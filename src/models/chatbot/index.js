const { DataTypes } = require('sequelize');
const { chatbotDbConnection } = require('../../config/database');

// Define User model for Chatbot
const ChatUser = chatbotDbConnection.define('ChatUser', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false, field: 'password_hash' },
  firstName: { type: DataTypes.STRING, field: 'first_name' },
  lastName: { type: DataTypes.STRING, field: 'last_name' },
  status: { type: DataTypes.STRING, defaultValue: 'active' }
}, { tableName: 'users' });

// Define Role model for Chatbot
const ChatRole = chatbotDbConnection.define('ChatRole', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT }
}, { tableName: 'roles' });

// Define UserRoles cross table
const ChatUserRole = chatbotDbConnection.define('ChatUserRole', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id', references: { model: 'users', key: 'id' } },
  roleId: { type: DataTypes.INTEGER, allowNull: false, field: 'role_id', references: { model: 'roles', key: 'id' } }
}, { tableName: 'user_roles' });

// Define ChatSession model
const ChatSession = chatbotDbConnection.define('ChatSession', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id', references: { model: 'users', key: 'id' } },
  title: { type: DataTypes.STRING, defaultValue: 'New Chat' },
  summary: { type: DataTypes.TEXT, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' }
}, { tableName: 'chat_sessions' });

// Define ChatMessage model
const ChatMessage = chatbotDbConnection.define('ChatMessage', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  sessionId: { type: DataTypes.UUID, allowNull: false, field: 'session_id', references: { model: 'chat_sessions', key: 'id' } },
  sender: { type: DataTypes.ENUM('user', 'assistant'), allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false }
}, { tableName: 'chat_messages' });

// Define ChatAuditLog model
const ChatAuditLog = chatbotDbConnection.define('ChatAuditLog', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  userId: { type: DataTypes.INTEGER, field: 'user_id' },
  sessionId: { type: DataTypes.UUID, field: 'session_id' },
  prompt: { type: DataTypes.TEXT, allowNull: false },
  response: { type: DataTypes.TEXT, allowNull: false },
  intent: { type: DataTypes.STRING },
  entities: { type: DataTypes.JSONB },
  model: { type: DataTypes.STRING },
  tokensPrompt: { type: DataTypes.INTEGER, field: 'tokens_prompt' },
  tokensCompletion: { type: DataTypes.INTEGER, field: 'tokens_completion' },
  tokensTotal: { type: DataTypes.INTEGER, field: 'tokens_total' },
  latencyMs: { type: DataTypes.INTEGER, field: 'latency_ms' }
}, { tableName: 'chat_audit_logs' });

// Define ChatFeedback model
const ChatFeedback = chatbotDbConnection.define('ChatFeedback', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  messageId: { type: DataTypes.UUID, allowNull: false, unique: true, field: 'message_id', references: { model: 'chat_messages', key: 'id' } },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id', references: { model: 'users', key: 'id' } },
  rating: { type: DataTypes.INTEGER, allowNull: false }, // e.g. 1 (dislike), 5 (like)
  comment: { type: DataTypes.TEXT }
}, { tableName: 'chat_feedback' });

// Define AiUsageLog model
const AiUsageLog = chatbotDbConnection.define('AiUsageLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, field: 'user_id' },
  modelName: { type: DataTypes.STRING, field: 'model_name' },
  action: { type: DataTypes.STRING }, // e.g., 'intent', 'entity', 'chat', 'embedding'
  tokensUsed: { type: DataTypes.INTEGER, field: 'tokens_used' },
  cost: { type: DataTypes.DECIMAL(10, 6) }
}, { tableName: 'ai_usage_logs' });

// Define SavedPrompt model
const SavedPrompt = chatbotDbConnection.define('SavedPrompt', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  promptText: { type: DataTypes.TEXT, allowNull: false, field: 'prompt_text' },
  isSystem: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_system' }
}, { tableName: 'saved_prompts' });

// Define RagDocument model
const RagDocument = chatbotDbConnection.define('RagDocument', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  fileName: { type: DataTypes.STRING, allowNull: false, field: 'file_name' },
  filePath: { type: DataTypes.STRING, allowNull: false, field: 'file_path' },
  fileType: { type: DataTypes.STRING, field: 'file_type' },
  documentType: { type: DataTypes.STRING, field: 'document_type', defaultValue: 'Document' },
  projectId: { type: DataTypes.UUID, field: 'project_id', allowNull: true },
  fileSize: { type: DataTypes.INTEGER, field: 'file_size' },
  uploadedBy: { type: DataTypes.INTEGER, field: 'uploaded_by', references: { model: 'users', key: 'id' } },
  status: { type: DataTypes.STRING, defaultValue: 'pending' } // pending, processing, processed, failed
}, { tableName: 'rag_documents' });

// Define DocumentChunk model
const DocumentChunk = chatbotDbConnection.define('DocumentChunk', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  documentId: { type: DataTypes.UUID, allowNull: false, field: 'document_id', references: { model: 'rag_documents', key: 'id' } },
  chunkIndex: { type: DataTypes.INTEGER, allowNull: false, field: 'chunk_index' },
  content: { type: DataTypes.TEXT, allowNull: false }
}, { tableName: 'document_chunks' });

// Define DocumentEmbedding model (uses pgvector column in db)
const DocumentEmbedding = chatbotDbConnection.define('DocumentEmbedding', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  chunkId: { type: DataTypes.UUID, allowNull: false, field: 'chunk_id', references: { model: 'document_chunks', key: 'id' } },
  // Column 'embedding' will be defined in migrations as 'vector(768)' (Gemini text-embedding-004 default)
  // For model representation, we can treat it as a placeholder string/array and run direct SQL calculations
  embedding: { type: DataTypes.TEXT, allowNull: false } 
}, { tableName: 'document_embeddings' });

// Define ChatSetting model
const ChatSetting = chatbotDbConnection.define('ChatSetting', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, field: 'user_id', references: { model: 'users', key: 'id' } },
  settingKey: { type: DataTypes.STRING, allowNull: false, field: 'setting_key' },
  settingValue: { type: DataTypes.TEXT, allowNull: false, field: 'setting_value' }
}, { tableName: 'chat_settings' });

// Set up Associations
ChatUser.belongsToMany(ChatRole, { through: ChatUserRole, foreignKey: 'user_id', otherKey: 'role_id', as: 'roles' });
ChatRole.belongsToMany(ChatUser, { through: ChatUserRole, foreignKey: 'role_id', otherKey: 'user_id', as: 'users' });

ChatUser.hasMany(ChatSession, { foreignKey: 'user_id', as: 'sessions' });
ChatSession.belongsTo(ChatUser, { foreignKey: 'user_id' });

ChatSession.hasMany(ChatMessage, { foreignKey: 'session_id', as: 'messages' });
ChatMessage.belongsTo(ChatSession, { foreignKey: 'session_id' });

ChatMessage.hasOne(ChatFeedback, { foreignKey: 'message_id', as: 'feedback' });
ChatFeedback.belongsTo(ChatMessage, { foreignKey: 'message_id' });

RagDocument.hasMany(DocumentChunk, { foreignKey: 'document_id', as: 'chunks', onDelete: 'CASCADE' });
DocumentChunk.belongsTo(RagDocument, { foreignKey: 'document_id' });

DocumentChunk.hasOne(DocumentEmbedding, { foreignKey: 'chunk_id', as: 'embedding', onDelete: 'CASCADE' });
DocumentEmbedding.belongsTo(DocumentChunk, { foreignKey: 'chunk_id' });

ChatUser.hasMany(ChatSetting, { foreignKey: 'user_id' });
ChatSetting.belongsTo(ChatUser, { foreignKey: 'user_id' });

module.exports = {
  ChatUser,
  ChatRole,
  ChatUserRole,
  ChatSession,
  ChatMessage,
  ChatAuditLog,
  ChatFeedback,
  AiUsageLog,
  SavedPrompt,
  RagDocument,
  DocumentChunk,
  DocumentEmbedding,
  ChatSetting
};
