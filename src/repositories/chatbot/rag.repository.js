const { RagDocument, DocumentChunk, DocumentEmbedding } = require('../../models/chatbot');
const { chatbotDbConnection } = require('../../config/database');
const { QueryTypes } = require('sequelize');

class RagRepository {
  async createDocument(docData) {
    return await RagDocument.create(docData);
  }

  async getDocumentById(docId) {
    return await RagDocument.findByPk(docId);
  }

  async getAllDocuments() {
    return await RagDocument.findAll({
      order: [['createdAt', 'DESC']]
    });
  }

  async updateDocumentStatus(docId, status) {
    const doc = await RagDocument.findByPk(docId);
    if (doc) {
      doc.status = status;
      await doc.save();
    }
    return doc;
  }

  async createChunk(chunkData) {
    return await DocumentChunk.create(chunkData);
  }

  async createEmbedding(chunkId, embeddingArray) {
    if (process.env.HAS_PGVECTOR !== 'false') {
      // We format the array to postgres vector format: '[1.2,3.4,...]'
      const vectorString = `[${embeddingArray.join(',')}]`;
      
      const [result] = await chatbotDbConnection.query(
        `INSERT INTO document_embeddings (id, chunk_id, embedding, created_at, updated_at)
         VALUES (gen_random_uuid(), :chunkId, :vectorString::vector, NOW(), NOW())
         RETURNING id;`,
        {
          replacements: { chunkId, vectorString },
          type: QueryTypes.INSERT
        }
      );
      return result;
    } else {
      // Fallback: save vector as stringified JSON in the TEXT column
      const result = await DocumentEmbedding.create({
        chunkId,
        embedding: JSON.stringify(embeddingArray)
      });
      return result;
    }
  }

  async searchChunksByFileName(queryText, limit = 5) {
    try {
      const words = queryText.split(/\s+/).filter(w => w.length > 2 && !['what', 'whats', 'inside', 'pdf', 'file', 'document', 'the', 'for', 'show', 'tell', 'read'].includes(w.toLowerCase()));
      if (words.length === 0) return [];

      const ilikeConditions = words.map(w => `rd.file_name ILIKE '%${w.replace(/'/g, "''")}%'`).join(' OR ');

      const results = await chatbotDbConnection.query(
        `SELECT 
          dc.id as "chunkId",
          dc.content as content,
          dc.chunk_index as "chunkIndex",
          rd.id as "documentId",
          rd.file_name as "fileName",
          rd.file_type as "fileType",
          rd.document_type as "documentType",
          rd.project_id as "projectId",
          0.0 as distance
         FROM document_chunks dc
         JOIN rag_documents rd ON dc.document_id = rd.id
         WHERE rd.status = 'processed' AND (${ilikeConditions})
         LIMIT :limit;`,
        {
          replacements: { limit },
          type: QueryTypes.SELECT
        }
      );
      return results;
    } catch (err) {
      return [];
    }
  }

  async searchSimilarChunks(embeddingArray, limit = 5) {
    if (process.env.HAS_PGVECTOR === 'true') {
      try {
        const vectorString = `[${embeddingArray.join(',')}]`;

        const results = await chatbotDbConnection.query(
          `SELECT 
            dc.id as "chunkId",
            dc.content as content,
            dc.chunk_index as "chunkIndex",
            rd.id as "documentId",
            rd.file_name as "fileName",
            rd.file_type as "fileType",
            rd.document_type as "documentType",
            rd.project_id as "projectId",
            (de.embedding <=> :vectorString::vector) as distance
           FROM document_chunks dc
           JOIN document_embeddings de ON dc.id = de.chunk_id
           JOIN rag_documents rd ON dc.document_id = rd.id
           WHERE rd.status = 'processed'
           ORDER BY de.embedding <=> :vectorString::vector ASC
           LIMIT :limit;`,
          {
            replacements: { vectorString, limit },
            type: QueryTypes.SELECT
          }
        );

        if (results && results.length > 0) {
          return results;
        }
      } catch (pgErr) {
        console.warn('⚠ pgvector native query unavailable/failed. Using Node.js vector search fallback:', pgErr.message);
      }
    }

    // Fallback: Fetch all chunks + embeddings from DB and calculate cosine similarity in Node.js
    const rawRecords = await chatbotDbConnection.query(
      `SELECT 
        dc.id as "chunkId",
        dc.content as content,
        dc.chunk_index as "chunkIndex",
        rd.id as "documentId",
        rd.file_name as "fileName",
        rd.file_type as "fileType",
        rd.document_type as "documentType",
        rd.project_id as "projectId",
        de.embedding as embedding
       FROM document_chunks dc
       JOIN document_embeddings de ON dc.id = de.chunk_id
       JOIN rag_documents rd ON dc.document_id = rd.id
       WHERE rd.status = 'processed';`,
      { type: QueryTypes.SELECT }
    );

      // Node.js helper to calculate cosine similarity
      const getCosineDistance = (vecA, vecB) => {
        let dotProduct = 0.0;
        let normA = 0.0;
        let normB = 0.0;
        for (let i = 0; i < vecA.length; i++) {
          dotProduct += vecA[i] * vecB[i];
          normA += vecA[i] * vecA[i];
          normB += vecB[i] * vecB[i];
        }
        if (normA === 0 || normB === 0) return 1.0; // Max distance
        const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        return 1.0 - similarity; // Cosine distance is 1 - similarity
      };

      const scored = rawRecords.map(rec => {
        let recordVector;
        try {
          recordVector = JSON.parse(rec.embedding);
        } catch (err) {
          recordVector = [];
        }

        const distance = recordVector.length === embeddingArray.length
          ? getCosineDistance(embeddingArray, recordVector)
          : 1.0;

        return {
          chunkId: rec.chunkId,
          content: rec.content,
          chunkIndex: rec.chunkIndex,
          documentId: rec.documentId,
          fileName: rec.fileName,
          distance
        };
      });

      // Sort by distance ascending (closest first)
      scored.sort((a, b) => a.distance - b.distance);
      return scored.slice(0, limit);
    }

  async deleteDocument(docId) {
    // Delete cascade will clear document_chunks and document_embeddings in DB, 
    // but we can also handle it explicitly
    const doc = await RagDocument.findByPk(docId);
    if (doc) {
      // Find chunks and delete them
      const chunks = await DocumentChunk.findAll({ where: { documentId: docId } });
      const chunkIds = chunks.map(c => c.id);
      
      if (chunkIds.length > 0) {
        await DocumentEmbedding.destroy({ where: { chunkId: chunkIds } });
        await DocumentChunk.destroy({ where: { documentId: docId } });
      }
      
      await doc.destroy();
      return true;
    }
    return false;
  }
}

module.exports = new RagRepository();
