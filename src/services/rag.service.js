const fs = require('fs');
const path = require('path');
const ragRepository = require('../repositories/chatbot/rag.repository');
const geminiService = require('./gemini.service');
const { extractTextFromFile } = require('../helpers/extractor');

class RagService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  // Splits text into overlapping chunks
  chunkText(text, chunkSize = 800, overlap = 150) {
    if (!text || text.trim() === '') return [];
    
    const chunks = [];
    let start = 0;
    while (start < text.length) {
      const chunk = text.substring(start, start + chunkSize).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }
      start += chunkSize - overlap;
    }
    return chunks;
  }

  async processAndStoreDocument(file, userId) {
    // 1. Determine destination (Local Storage / AWS S3 simulation)
    const fileName = file.originalname;
    const filePath = file.path;
    const fileSize = file.size;
    const fileType = file.mimetype;

    console.log(`Processing uploaded document: ${fileName} (${fileSize} bytes)`);

    // 2. Create document record in Chatbot DB
    const docRecord = await ragRepository.createDocument({
      fileName,
      filePath,
      fileType,
      fileSize,
      uploadedBy: userId,
      status: 'processing'
    });

    try {
      // 3. Extract text content
      const extractedText = await extractTextFromFile(filePath, fileType);
      
      if (!extractedText || extractedText.trim() === '') {
        throw new Error('No readable text could be extracted from document.');
      }

      // 4. Create chunks
      const chunks = this.chunkText(extractedText);
      console.log(`Split document into ${chunks.length} chunks.`);

      // 5. Generate embeddings and save to DB
      for (let i = 0; i < chunks.length; i++) {
        const chunkContent = chunks[i];
        
        // Save the chunk text
        const chunkRecord = await ragRepository.createChunk({
          documentId: docRecord.id,
          chunkIndex: i,
          content: chunkContent
        });

        // Generate vector embedding
        const embeddingVector = await geminiService.generateEmbedding(chunkContent);

        // Save embedding vector linked to chunk
        await ragRepository.createEmbedding(chunkRecord.id, embeddingVector);
      }

      // Update status to processed
      await ragRepository.updateDocumentStatus(docRecord.id, 'processed');
      console.log(`Successfully indexed document: ${fileName}`);
      
      return await ragRepository.getDocumentById(docRecord.id);
    } catch (err) {
      console.error(`Failed to process document ${fileName}:`, err.message);
      await ragRepository.updateDocumentStatus(docRecord.id, 'failed');
      throw err;
    }
  }

  async searchKnowledgeBase(queryText, limit = 5) {
    try {
      console.log(`Searching RAG knowledge base for: "${queryText}"`);
      
      // 1. Check direct filename match
      const fileMatchChunks = await ragRepository.searchChunksByFileName(queryText, limit);

      // 2. Vector embedding search
      const queryEmbedding = await geminiService.generateEmbedding(queryText);
      const similarChunks = await ragRepository.searchSimilarChunks(queryEmbedding, limit);
      
      // 3. Combine and deduplicate
      const combined = [...fileMatchChunks, ...similarChunks];
      const unique = [];
      const seenIds = new Set();
      for (const item of combined) {
        if (item && item.chunkId && !seenIds.has(item.chunkId)) {
          seenIds.add(item.chunkId);
          unique.push(item);
        }
      }
      return unique.slice(0, limit);
    } catch (err) {
      console.error('Error during vector search in RAG service:', err.message);
      return [];
    }
  }

  async listDocuments() {
    return await ragRepository.getAllDocuments();
  }

  async deleteDocument(docId) {
    // Optional: delete actual file from disk if stored locally
    const doc = await ragRepository.getDocumentById(docId);
    if (doc && fs.existsSync(doc.filePath)) {
      try {
        fs.unlinkSync(doc.filePath);
      } catch (err) {
        console.warn(`Could not delete file on disk: ${doc.filePath}`, err.message);
      }
    }
    return await ragRepository.deleteDocument(docId);
  }
}

module.exports = new RagService();
