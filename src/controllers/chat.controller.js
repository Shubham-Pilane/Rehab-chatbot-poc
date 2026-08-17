const chatSessionRepository = require('../repositories/chatbot/session.repository');
const chatMessageRepository = require('../repositories/chatbot/message.repository');
const chatAuditRepository = require('../repositories/chatbot/audit.repository');
const projectRepository = require('../repositories/main/project.repository');
const invoiceRepository = require('../repositories/main/invoice.repository');
const vendorRepository = require('../repositories/main/vendor.repository');
const homeownerRepository = require('../repositories/main/homeowner.repository');

const intentService = require('../services/intent.service');
const entityService = require('../services/entity.service');
const contextService = require('../services/context.service');
const promptService = require('../services/prompt.service');
const geminiService = require('../services/gemini.service');
const ragService = require('../services/rag.service');
const sqlService = require('../services/sql.service');
const summaryService = require('../services/summary.service');
const { checkIntentPermission } = require('../middleware/rbac');

class ChatController {
  constructor() {
    this.createSession = this.createSession.bind(this);
    this.getSessions = this.getSessions.bind(this);
    this.getSessionById = this.getSessionById.bind(this);
    this.deleteSession = this.deleteSession.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.submitFeedback = this.submitFeedback.bind(this);
    this.uploadDocument = this.uploadDocument.bind(this);
    this.searchDocuments = this.searchDocuments.bind(this);
    this.getDocuments = this.getDocuments.bind(this);
    this.deleteDocument = this.deleteDocument.bind(this);
    this.getAuditLogs = this.getAuditLogs.bind(this);
    this.retrieveBusinessData = this.retrieveBusinessData.bind(this);
    this.sanitizeResponse = this.sanitizeResponse.bind(this);
  }
  // POST /api/chat/session
  async createSession(req, res) {
    try {
      const { title } = req.validatedBody;
      const session = await chatSessionRepository.createSession(req.user.id, title);
      return res.status(201).json(session);
    } catch (err) {
      console.error('Create session error:', err);
      return res.status(500).json({ error: 'Failed to create chat session.' });
    }
  }

  // GET /api/chat/history
  async getSessions(req, res) {
    try {
      const sessions = await chatSessionRepository.getSessionsByUser(req.user.id);
      return res.status(200).json(sessions);
    } catch (err) {
      console.error('Fetch sessions error:', err);
      return res.status(500).json({ error: 'Failed to fetch session history.' });
    }
  }

  // GET /api/chat/session/:id
  async getSessionById(req, res) {
    try {
      const { id } = req.params;
      const session = await chatSessionRepository.getSessionById(id, true);
      if (!session || session.userId !== req.user.id || !session.isActive) {
        return res.status(404).json({ error: 'Session not found.' });
      }
      return res.status(200).json(session);
    } catch (err) {
      console.error('Fetch session error:', err);
      return res.status(500).json({ error: 'Failed to retrieve session details.' });
    }
  }

  // DELETE /api/chat/session/:id
  async deleteSession(req, res) {
    try {
      const { id } = req.params;
      const session = await chatSessionRepository.getSessionById(id);
      if (!session || session.userId !== req.user.id) {
        return res.status(404).json({ error: 'Session not found.' });
      }
      await chatSessionRepository.deleteSession(id);
      return res.status(200).json({ message: 'Session deleted successfully.' });
    } catch (err) {
      console.error('Delete session error:', err);
      return res.status(500).json({ error: 'Failed to delete session.' });
    }
  }

  // POST /api/chat/message
  async sendMessage(req, res) {
    const startTime = Date.now();
    const { sessionId, content } = req.validatedBody;
    
    try {
      // 1. Verify session belongs to user
      const session = await chatSessionRepository.getSessionById(sessionId, true);
      if (!session || session.userId !== req.user.id || !session.isActive) {
        return res.status(404).json({ error: 'Chat session not found or inactive.' });
      }

      // 2. Save user message to database
      const userMessage = await chatMessageRepository.createMessage(sessionId, 'user', content);

      // 3. Build Conversation Context using Summary + Recent 2 Messages
      let contextText = '';
      if (session) {
        const prevMessages = (session.messages || []).filter(m => m.id !== userMessage.id);
        const recentMessages = prevMessages.slice(-2);
        const recentText = recentMessages.map(m => `${m.sender === 'user' ? 'user' : 'assistant'}: ${m.content}`).join('\n');

        if (session.summary) {
          contextText = `Background Conversation Context (CSV Format):\n${session.summary}\n\nRecent Turn:\n${recentText}`;
        } else {
          contextText = recentText;
        }
      }

      // Fast casual query check to save Gemini API quota and prevent 429 errors
      const cleanContent = content.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"]/g,"").toLowerCase();
      const simpleGreetings = ['hi', 'hii', 'hello', 'hey', 'yo', 'greetings', 'gm', 'gn', 'good morning', 'good afternoon', 'good evening'];
      const casualKeywords = ['sad', 'happy', 'joke', 'poem', 'story', 'funny', 'feel', 'feeling', 'chat', 'talk', 'how are you', 'who are you', 'what can you do', 'write a', 'write me'];
      
      const isCasualQuery = simpleGreetings.includes(cleanContent) || 
                            casualKeywords.some(kw => cleanContent.includes(kw)) ||
                            cleanContent.split(/\s+/).length <= 2;

      let intent = 'UNKNOWN';
      let extractedEntities = {};
      let mergedEntities = {};
      let intentConfidence = 1.0;

      if (isCasualQuery) {
        // Direct greeting instant response to save API calls
        if (simpleGreetings.includes(cleanContent)) {
          const greetingResponse = "Hello! I am your friendly AI Repair Project Management Assistant. How can I help you with your projects today?";
          const botMsg = await chatMessageRepository.createMessage(sessionId, 'assistant', greetingResponse);
          
          await chatAuditRepository.logChatAudit({
            userId: req.user.id,
            sessionId,
            prompt: content,
            response: greetingResponse,
            intent: 'UNKNOWN',
            entities: {},
            model: 'gemini-2.5-flash (Mock Fallback)',
            tokensPrompt: 10,
            tokensCompletion: 20,
            tokensTotal: 30,
            latencyMs: Date.now() - startTime
          });
          
          return res.status(200).json({
            message: botMsg,
            intent: 'UNKNOWN',
            entities: {},
            ragRetrieved: false,
            latencyMs: Date.now() - startTime
          });
        }
        
        // For other casual queries (like "im feeling sad" or "write a poem"), we skip intent/entity API calls
        console.log(`[Casual Query Detected] Bypassing intent/entity API calls for: "${content}"`);
      }

      let businessData = null;
      let executedSql = null;

      if (!isCasualQuery) {
        // Try dynamic SQL first to bypass redundant classification/entity extraction API calls (saves API quota)
        try {
          const sqlQuery = await sqlService.generateQuery(content, contextText);
          if (sqlQuery) {
            console.log(`[Dynamic SQL Generated]: ${sqlQuery}`);
            const sqlUpper = sqlQuery.toUpperCase();
            const userRoles = req.user.roles.map(r => r.name);
            
            let roleBlocked = false;
            // RBAC validation: if the query targets invoices, only Admin & Finance Manager are allowed
            if (sqlUpper.includes('"INVOICE"') || sqlUpper.includes('INVOICE ')) {
              if (!userRoles.includes('Admin') && !userRoles.includes('Finance Manager')) {
                roleBlocked = true;
                intent = 'INVOICE_STATUS';
              }
            }
            // RBAC validation: if the query targets budgets, only Admin & Finance Manager are allowed
            if (sqlUpper.includes('BUDGET') || sqlUpper.includes('SPENT')) {
              if (!userRoles.includes('Admin') && !userRoles.includes('Finance Manager')) {
                roleBlocked = true;
                intent = 'PROJECT_BUDGET';
              }
            }
            
            if (roleBlocked) {
              const warningResponse = `Access Denied: Your user role (${userRoles.join(', ')}) does not have permission to view this financial database information.`;
              const botMsg = await chatMessageRepository.createMessage(sessionId, 'assistant', warningResponse);
              return res.status(200).json({
                message: botMsg,
                intent,
                entities: {},
                securityNotice: 'Access blocked by Role-Based Access Control.'
              });
            }

            const { mainDbConnection } = require('../config/database');
            const { QueryTypes } = require('sequelize');
            
            businessData = await mainDbConnection.query(sqlQuery, { type: QueryTypes.SELECT });
            executedSql = sqlQuery;
            console.log(`[Dynamic SQL Executed Successfully]. Row count: ${businessData.length}`);
            
            // Map intent for audit logs based on tables queried
            if (sqlUpper.includes('FROM BRAND') || sqlUpper.includes('JOIN BRAND') || sqlUpper.includes('"BRAND"')) {
              intent = 'HOMEOWNER_LIST';
            } else if (sqlUpper.includes('FROM HOMEOWNER') || sqlUpper.includes('JOIN HOMEOWNER') || sqlUpper.includes('"HOMEOWNER"')) {
              intent = 'HOMEOWNER_LIST';
            } else if (sqlUpper.includes('FROM INVOICE') || sqlUpper.includes('JOIN INVOICE') || sqlUpper.includes('"INVOICE"')) {
              intent = 'INVOICE_STATUS';
            } else if (sqlUpper.includes('FROM PROJECT') || sqlUpper.includes('JOIN PROJECT') || sqlUpper.includes('"PROJECT"')) {
              intent = 'PROJECT_STATUS';
            }
          }
        } catch (sqlErr) {
          console.error('⚠️ Dynamic SQL Generation/Execution failed, will fallback to intent pipeline. Error:', sqlErr.message);
        }
      }

      // If casual query or SQL generation/execution failed, fall back to default intent pipeline
      if (!businessData) {
        if (!isCasualQuery) {
          // Detect Intent and Extract Entities in parallel to optimize latency
          const [intentResult, entityResult] = await Promise.all([
            intentService.detectIntent(content),
            entityService.extractEntities(content)
          ]);
          intent = intentResult.intent;
          intentConfidence = intentResult.confidence;
          extractedEntities = entityResult;
          console.log(`Fallback Pipeline - Detected Intent: ${intent} (${intentConfidence})`);
          console.log(`Fallback Pipeline - Extracted Entities:`, extractedEntities);
          
          // Validate Role Authorization
          const isAuthorized = checkIntentPermission(intent, req.user.roles);
          if (!isAuthorized) {
            const warningResponse = `Access Denied: Your user role (${req.user.roles.map(r => r.name).join(', ')}) does not have permission to request information for the detected intent: ${intent}.`;
            const botMsg = await chatMessageRepository.createMessage(sessionId, 'assistant', warningResponse);
            
            await chatAuditRepository.logChatAudit({
              userId: req.user.id,
              sessionId,
              prompt: content,
              response: warningResponse,
              intent,
              entities: { accessViolation: true },
              model: 'system-gate',
              latencyMs: Date.now() - startTime
            });

            return res.status(200).json({
              message: botMsg,
              intent,
              entities: {},
              securityNotice: 'Access blocked by Role-Based Access Control.'
            });
          }

          // Build Context & Propagate past variables (pronoun resolution)
          const contextResult = await contextService.buildSessionContext(sessionId, extractedEntities);
          mergedEntities = contextResult.mergedEntities;
          extractedEntities = contextResult.mergedEntities;
          contextText = contextResult.contextText;
        }

        try {
          businessData = await this.retrieveBusinessData(intent, extractedEntities, req.user);
        } catch (dataErr) {
          console.error('Error fetching business data:', dataErr.message);
        }
      }

      // Optimize prompt size and LLM latency if database returns a large list of records
      if (businessData && Array.isArray(businessData) && businessData.length > 15) {
        const totalCount = businessData.length;
        let totalAmount = 0;
        const firstItem = businessData[0];
        const isInvoiceList = firstItem && (typeof firstItem.amount !== 'undefined' || typeof firstItem.dataValues?.amount !== 'undefined');
        
        if (isInvoiceList) {
          totalAmount = businessData.reduce((sum, inv) => {
            const amt = inv.amount || inv.dataValues?.amount || 0;
            return sum + Number(amt);
          }, 0);
        }

        let recordType = 'records';
        if (executedSql) {
          const sqlUpper = executedSql.toUpperCase();
          if (sqlUpper.includes('FROM BRAND') || sqlUpper.includes('JOIN BRAND') || sqlUpper.includes('"BRAND"')) {
            recordType = 'tenants';
          } else if (sqlUpper.includes('FROM HOMEOWNER') || sqlUpper.includes('JOIN HOMEOWNER') || sqlUpper.includes('"HOMEOWNER"')) {
            recordType = 'homeowners';
          } else if (sqlUpper.includes('FROM INVOICE') || sqlUpper.includes('JOIN INVOICE') || sqlUpper.includes('"INVOICE"')) {
            recordType = 'invoices';
          } else if (sqlUpper.includes('FROM PROJECT') || sqlUpper.includes('JOIN PROJECT') || sqlUpper.includes('"PROJECT"')) {
            recordType = 'projects';
          } else if (sqlUpper.includes('FROM VENDOR') || sqlUpper.includes('JOIN VENDOR') || sqlUpper.includes('"VENDOR"')) {
            recordType = 'vendors';
          }
        } else {
          recordType = intent === 'HOMEOWNER_LIST' ? 'homeowners' : (isInvoiceList ? 'invoices' : 'records');
        }

        const sample = businessData.slice(0, 10).map(item => {
          if (executedSql) {
            // For dynamic SQL queries, preserve all returned columns (e.g. organization_name)
            const cleanObj = {};
            const itemObj = item.dataValues || item;
            for (const key of Object.keys(itemObj)) {
              if (itemObj[key] !== null && itemObj[key] !== 'UNKNOWN') {
                cleanObj[key] = itemObj[key];
              }
            }
            return cleanObj;
          }

          const cleanItem = { id: item.id || item.dataValues?.id };
          const projNum = item.projectNumber || item.dataValues?.projectNumber || item.Project?.projectNumber || item.Project?.dataValues?.projectNumber;
          if (projNum) cleanItem.projectNumber = projNum;
          
          const statusVal = item.status || item.dataValues?.status;
          if (statusVal) cleanItem.status = statusVal;
          
          const amtVal = item.amount || item.dataValues?.amount;
          if (amtVal) cleanItem.amount = amtVal;
          
          const nameVal = item.name || item.dataValues?.name;
          if (nameVal) cleanItem.name = nameVal;

          const fName = item.firstName || item.dataValues?.firstName;
          if (fName) cleanItem.firstName = fName;

          const lName = item.lastName || item.dataValues?.lastName;
          if (lName) cleanItem.lastName = lName;

          const emailVal = item.email || item.dataValues?.email;
          if (emailVal) cleanItem.email = emailVal;

          const phoneVal = item.phone || item.dataValues?.phone;
          if (phoneVal && phoneVal !== 'UNKNOWN') cleanItem.phone = phoneVal;
          
          const vendName = item.vendor?.name || item.vendor?.dataValues?.name;
          if (vendName) cleanItem.vendorName = vendName;
          
          const budgetsVal = item.budgets;
          if (budgetsVal) cleanItem.budgets = budgetsVal;
          
          return cleanItem;
        });

        businessData = {
          recordType,
          summary: {
            totalCount,
            ...(isInvoiceList ? { totalAmount: totalAmount.toFixed(2) } : {})
          },
          sampleItems: sample,
          notice: `These items are ${recordType} fetched from the database. Only a sample of up to 10 items is shown here to optimize performance. The total number of items is ${totalCount}. Use these summary values and sample names to answer.`
        };
      }

      // 8. Dynamic Homeowner Application and ER JSON mock data loader for offline catalog compatibility
      let projectId = null;
      if (businessData) {
        const checkItemForProjectId = (item) => {
          if (!item) return null;
          const itemObj = item.dataValues || item;
          if (itemObj.projectId) return itemObj.projectId;
          if (itemObj.project_id) return itemObj.project_id;
          if (itemObj.Project && (itemObj.Project.id || itemObj.Project.dataValues?.id)) {
            return itemObj.Project.id || itemObj.Project.dataValues?.id;
          }
          if (itemObj.projectNumber || itemObj.project_number || itemObj.hudNumber || itemObj.hud_number) {
            if (itemObj.id) return itemObj.id;
          }
          return null;
        };

        if (Array.isArray(businessData)) {
          for (const item of businessData) {
            const foundId = checkItemForProjectId(item);
            if (foundId) {
              projectId = foundId;
              break;
            }
          }
        } else {
          projectId = checkItemForProjectId(businessData);
        }
      }

      // Fallback: lookup project in DB by number or address name in query if not found in records
      if (!projectId && !isCasualQuery) {
        const queryLower = content.toLowerCase();
        if (queryLower.includes('er') || queryLower.includes('environmental') || queryLower.includes('application') || queryLower.includes('tad') || queryLower.includes('residence') || queryLower.includes('race') || queryLower.includes('ethnicity') || queryLower.includes('veteran') || queryLower.includes('asbestos') || queryLower.includes('zoning')) {
          const projNumMatch = content.match(/P-\d+/i) || content.match(/\b\d{4}\b/);
          const { mainDbConnection } = require('../config/database');
          const { QueryTypes } = require('sequelize');
          
          if (projNumMatch) {
            const projNum = projNumMatch[0].toUpperCase();
            try {
              const [proj] = await mainDbConnection.query(
                `SELECT id FROM project WHERE project_number = :projNum OR project_number LIKE :projNumLike LIMIT 1`,
                { replacements: { projNum, projNumLike: `%${projNum}%` }, type: QueryTypes.SELECT }
              );
              if (proj) projectId = proj.id;
            } catch (err) {
              console.error('Failed to lookup project by number:', err.message);
            }
          } else {
            const words = content.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"]/g,"").split(/\s+/);
            const streetWord = words.find(w => w.length > 3 && !['project', 'status', 'what', 'where', 'how', 'many', 'years', 'residence', 'race', 'ethnicity', 'veteran', 'disabled', 'asbestos', 'zoning'].includes(w.toLowerCase()));
            if (streetWord) {
              try {
                const [proj] = await mainDbConnection.query(
                  `SELECT project.id FROM project 
                   JOIN home ON project.home_id = home.id 
                   JOIN address ON home.address_id = address.id 
                   WHERE address.street_address ILIKE :search LIMIT 1`,
                  { replacements: { search: `%${streetWord}%` }, type: QueryTypes.SELECT }
                );
                if (proj) projectId = proj.id;
              } catch (err) {
                console.error('Failed to lookup project by address word:', err.message);
              }
            }
          }
        }
      }

      if (projectId) {
        const { loadProjectJsonData } = require('../helpers/jsonLoader');
        const { applicationData, erData } = loadProjectJsonData(projectId);
        if (applicationData || erData) {
          console.log(`[Offline JSON Loaded] for Project ID: ${projectId}`);
          if (typeof businessData === 'object' && businessData !== null && !Array.isArray(businessData)) {
            if (applicationData) businessData.applicationData = applicationData;
            if (erData) businessData.erData = erData;
          } else {
            businessData = {
              records: businessData,
              applicationData,
              erData
            };
          }
        }
      }

      // 8. Load RAG data (vector search) for document queries or file questions
      let ragChunks = [];
      const queryLower = content.toLowerCase();
      if (
        intent === 'DOCUMENT_SEARCH' || 
        queryLower.includes('document') || 
        queryLower.includes('file') ||
        queryLower.includes('pdf') ||
        queryLower.includes('excel') ||
        queryLower.includes('xlsx') ||
        queryLower.includes('xls') ||
        queryLower.includes('spreadsheet') ||
        queryLower.includes('delga') ||
        queryLower.includes('inside') ||
        queryLower.includes('inspector') ||
        queryLower.includes('inspection') ||
        queryLower.includes('flooring') ||
        queryLower.includes('note') ||
        queryLower.includes('kitchen') ||
        queryLower.includes('agreed') ||
        queryLower.includes('communication') ||
        queryLower.includes('missing') ||
        queryLower.includes('report') ||
        queryLower.includes('attachment') ||
        queryLower.includes('upload')
      ) {
        ragChunks = await ragService.searchKnowledgeBase(content, 3);
      }

      // 9. Build LLM prompt
      const systemPrompt = promptService.getSystemPrompt();
      const userPrompt = promptService.buildPrompt(content, businessData, ragChunks, contextText, intent, executedSql);

      // 10. Send to Google Gemini API
      const geminiResponse = await geminiService.generateChatResponse(systemPrompt, userPrompt);
      
      // 10b. Parse suggested follow-ups if present
      let suggestedFollowUps = [];
      let sanitizedResponseText = geminiResponse.text;
      
      const followUpMatch = sanitizedResponseText.match(/\[SUGGESTED_FOLLOW_UPS:\s*(.*?)\]/i);
      if (followUpMatch) {
        const followUpsStr = followUpMatch[1];
        suggestedFollowUps = followUpsStr.split('|').map(q => q.trim()).filter(q => q.length > 0);
        // Remove the follow-up tag from the response text
        sanitizedResponseText = sanitizedResponseText.replace(/\[SUGGESTED_FOLLOW_UPS:\s*(.*?)\]/gi, '').trim();
      }
      
      // 11. Validate Response for Security Rules (never leak schemas, raw queries, or internal database keys)
      const sanitizedResponse = this.sanitizeResponse(sanitizedResponseText);

      // 12. Save Assistant Message to database
      const assistantMessage = await chatMessageRepository.createMessage(sessionId, 'assistant', sanitizedResponse);

      // 13. Write audit log and usage metrics
      const latencyMs = Date.now() - startTime;
      await chatAuditRepository.logChatAudit({
        userId: req.user.id,
        sessionId,
        prompt: content,
        response: sanitizedResponse,
        intent,
        entities: mergedEntities,
        model: geminiResponse.model,
        tokensPrompt: geminiResponse.tokensPrompt,
        tokensCompletion: geminiResponse.tokensCompletion,
        tokensTotal: geminiResponse.tokensTotal,
        latencyMs
      });

      await chatAuditRepository.logAiUsage({
        userId: req.user.id,
        modelName: geminiResponse.model,
        action: 'chat',
        tokensUsed: geminiResponse.tokensTotal
      });

      // 14. Return response to UI along with debugging context
      // 14. Asynchronously update running conversation summary in background
      summaryService.updateSummary(sessionId, session.summary, content, sanitizedResponse).catch(err => {
        console.error('Async summary update failed:', err.message);
      });

      return res.status(200).json({
        message: assistantMessage,
        intent,
        entities: mergedEntities,
        ragRetrieved: ragChunks.length > 0,
        suggestedFollowUps,
        latencyMs
      });

    } catch (err) {
      console.error('Error processing chat message:', err);
      return res.status(500).json({ error: 'An error occurred while generating the chatbot response.' });
    }
  }

  // POST /api/chat/feedback
  async submitFeedback(req, res) {
    try {
      const { messageId, rating, comment } = req.validatedBody;
      
      // Double check message belongs to user's sessions
      const message = await chatMessageRepository.createMessage; // Just double check mapping
      await chatMessageRepository.submitFeedback(messageId, req.user.id, rating, comment);
      
      return res.status(200).json({ message: 'Feedback submitted successfully.' });
    } catch (err) {
      console.error('Submit feedback error:', err);
      return res.status(500).json({ error: 'Failed to submit feedback.' });
    }
  }

  // POST /api/chat/document-upload
  async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No document file uploaded.' });
      }

      const docRecord = await ragService.processAndStoreDocument(req.file, req.user.id);
      return res.status(201).json({
        message: 'Document uploaded and vector database indexing complete.',
        document: docRecord
      });
    } catch (err) {
      console.error('Document upload processing error:', err);
      return res.status(500).json({ error: err.message || 'Failed to process document.' });
    }
  }

  // POST /api/chat/search-document
  async searchDocuments(req, res) {
    try {
      const { query, limit } = req.validatedBody;
      const results = await ragService.searchKnowledgeBase(query, limit);
      return res.status(200).json(results);
    } catch (err) {
      console.error('Document vector search error:', err);
      return res.status(500).json({ error: 'Failed to execute vector search.' });
    }
  }

  // GET /api/chat/documents (List all documents, for admin UI)
  async getDocuments(req, res) {
    try {
      const docs = await ragService.listDocuments();
      return res.status(200).json(docs);
    } catch (err) {
      console.error('List documents error:', err);
      return res.status(500).json({ error: 'Failed to list documents.' });
    }
  }

  // DELETE /api/chat/document/:id
  async deleteDocument(req, res) {
    try {
      const { id } = req.params;
      await ragService.deleteDocument(id);
      return res.status(200).json({ message: 'Document deleted successfully.' });
    } catch (err) {
      console.error('Delete document error:', err);
      return res.status(500).json({ error: 'Failed to delete document.' });
    }
  }

  // GET /api/chat/audit-logs (For admin panel)
  async getAuditLogs(req, res) {
    try {
      const logs = await chatAuditRepository.getAuditLogs(100, 0);
      return res.status(200).json(logs);
    } catch (err) {
      console.error('Fetch audit logs error:', err);
      return res.status(500).json({ error: 'Failed to retrieve audit logs.' });
    }
  }

  // Helper: Retrieve Business Data from RPM database depending on Intent and Entities
  async retrieveBusinessData(intent, entities, currentUser) {
    const { projectNumber, vendorName } = entities;

    // Homeowner data security isolation check
    const isHomeownerUser = currentUser.roles.map(r => r.name).includes('Homeowner');
    
    // If user is a Homeowner, check if we have a project number or need to resolve their project.
    if (isHomeownerUser) {
      // Find the homeowner's designated project from their records in database
      const homeownerRecord = await homeownerRepository.getHomeownerByName(currentUser.firstName);
      const userProjects = homeownerRecord.flatMap(h => h.Homes.map(home => home.Project.projectNumber));
      
      if (projectNumber) {
        if (!userProjects.includes(projectNumber)) {
          throw new Error('Access denied: You are not authorized to view details for this project.');
        }
      } else {
        // Automatically default projectNumber to their assigned project if they didn't specify one
        if (userProjects.length > 0) {
          entities.projectNumber = userProjects[0];
        } else {
          throw new Error('No associated project found for this homeowner account.');
        }
      }
    }

    const targetProjectNum = entities.projectNumber;

    switch (intent) {
      case 'PROJECT_STATUS':
      case 'PROJECT_SUMMARY':
      case 'PROJECT_TIMELINE':
        if (targetProjectNum) {
          return await projectRepository.getByProjectNumber(targetProjectNum);
        }
        return { notice: 'Please specify a project number (e.g. P-1025) to view its status.' };

      case 'PROJECT_DELAY':
      case 'PROJECT_RISK':
        if (targetProjectNum) {
          const details = await projectRepository.getByProjectNumber(targetProjectNum);
          return {
            project: details,
            notes: details ? details.notes : []
          };
        }
        return await projectRepository.getDelayedProjects();

      case 'PROJECT_BUDGET':
      case 'PROJECT_COST':
        if (targetProjectNum) {
          const details = await projectRepository.getByProjectNumber(targetProjectNum);
          return details ? details.budgets : [];
        }
        return await projectRepository.getBudgetVsActualSummary();

      case 'TASK_STATUS':
      case 'TASK_DELAY':
        if (targetProjectNum) {
          const details = await projectRepository.getByProjectNumber(targetProjectNum);
          return details ? details.tasks : [];
        }
        return { notice: 'Please specify a project number to list tasks.' };

      case 'MILESTONE_STATUS':
      case 'MILESTONE_DELAY':
        if (targetProjectNum) {
          const details = await projectRepository.getByProjectNumber(targetProjectNum);
          return details ? details.milestones : [];
        }
        return await projectRepository.getOverdueMilestones();

      case 'INVOICE_STATUS':
      case 'INVOICE_PENDING':
        if (targetProjectNum) {
          return await invoiceRepository.getInvoicesByProjectNumber(targetProjectNum);
        }
        if (vendorName) {
          return await invoiceRepository.getInvoicesByVendorName(vendorName);
        }
        if (intent === 'INVOICE_PENDING') {
          return await invoiceRepository.getPendingInvoices();
        }
        return await invoiceRepository.getInvoicesAwaitingApproval();

      case 'VENDOR_INFORMATION':
      case 'VENDOR_ASSIGNMENT':
        if (vendorName) {
          return await vendorRepository.getVendorDetailsByName(vendorName);
        }
        return await vendorRepository.getAssignedVendors();

      case 'HOMEOWNER_UPDATE':
        if (targetProjectNum) {
          return await homeownerRepository.getHomeownerUpdateByProjectNumber(targetProjectNum);
        }
        return { notice: 'Specify a project number to generate a homeowner update.' };

      case 'HOMEOWNER_LIST':
        return await homeownerRepository.getAllHomeowners();

      case 'MANAGEMENT_SUMMARY':
        return await projectRepository.getManagementSummary();

      default:
        // For general or RAG intent, we pull base projects or return null
        if (targetProjectNum) {
          return await projectRepository.getByProjectNumber(targetProjectNum);
        }
        return null;
    }
  }

  // Security layer response sanitizer:
  // Redacts SQL snippets, credentials, system variables, or database table schema layouts
  sanitizeResponse(text) {
    if (!text) return '';

    let cleanText = text;

    // Strip Source References footer block if generated by LLM
    cleanText = cleanText.replace(/\n*\*\*Source References:\*\*[\s\S]*$/gi, '').replace(/\n*Source References:[\s\S]*$/gi, '').trim();

    // Redact SQL Query patterns (e.g. SELECT * FROM ...)
    const sqlRegex = /SELECT\s+[\s\S]*?\s+FROM\s+\w+/gi;
    cleanText = cleanText.replace(sqlRegex, '[SQL QUERY HIDDEN]');

    // Redact database table creations
    const schemaRegex = /CREATE\s+TABLE\s+[\s\S]*?\(?/gi;
    cleanText = cleanText.replace(schemaRegex, '[SCHEMA STRUCTURE HIDDEN]');

    // Redact internal configuration/variables exposure
    const credentialKeywords = /(db_password|jwt_secret|gemini_api_key|aws_secret_access_key)/gi;
    cleanText = cleanText.replace(credentialKeywords, '[REDACTED_CONFIDENTIAL_KEY]');

    return cleanText;
  }
}

module.exports = new ChatController();
