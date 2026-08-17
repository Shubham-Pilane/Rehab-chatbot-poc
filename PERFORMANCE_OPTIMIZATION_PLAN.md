# 🚀 Ultra-Fast Chatbot Performance Optimization Plan (Sub-Second SSE Streaming)

This document contains the complete technical specification to optimize the Rehab Chatbot Assistant from **6–7 seconds response time down to ~0.5s first-word streaming latency**.

---

## 🎯 Target Latency & Benchmarks

| Metric | Current State | Target State | Optimization Applied |
| :--- | :--- | :--- | :--- |
| **First Word Latency** | ~6.0 seconds | **~0.5 seconds** 🚀 | SSE Real-time Token Streaming |
| **Complete Response Latency** | 6.0 – 7.0 seconds | **1.2 – 1.8 seconds** | Consolidated Single-Call Extraction + Flash-Lite Model |
| **Gemini API Round-trips** | 3 Sequential Calls | **1 Streaming Call** | Consolidated Intent + Entity + Text-to-SQL JSON Payload |
| **Database Query Latency** | ~50 ms | **< 5 ms** | B-Tree Indexes on Addresses, Tenants, and Homes |

---

## 🏗️ Technical Architecture Breakdown

```
[ User Submits Question ]
          │
          ▼ (Single API Network Call - Consolidated Extraction & Stream)
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: CONSOLIDATED JSON EXTRACTION (Gemini 2.5 Flash-Lite)                │
│ Single call returns: { intent, entities, sql }                             │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: FAST POSTGRESQL QUERY EXECUTION (<5ms via B-Tree Indexes)           │
│ Runs SQL query against PostgreSQL `backup_2_july`                           │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: REAL-TIME SSE STREAMING GENERATION (`streamGenerateContent`)        │
│ Streams text tokens immediately over Server-Sent Events (SSE)               │
│ -> First word appears in Chat UI within ~500ms!                             │
└─────────────────────────────────────┬───────────────────────────────────────┘
```

---

## 📋 Implementation Steps for AI Agent Execution

### Step 1: Consolidated Single-Call Extraction
- Modify `src/services/sql.service.js` to add `extractQueryContextAndSql(userQuery, contextText)`.
- Combines Intent Classification, Entity Extraction, and PostgreSQL SELECT generation into a single JSON call, saving 1–2 sequential network calls.

### Step 2: Gemini Streaming Engine
- Update `src/services/gemini.service.js` to add `streamChatResponse(systemPrompt, userPrompt, onChunkCallback)`.
- Uses `model.generateContentStream()` from Google Gen AI SDK to stream output text chunks in real time as they are generated.

### Step 3: Server-Sent Events (SSE) Controller Endpoint
- Add `sendMessageStream` method in `src/controllers/chat.controller.js`.
- Sets Express response headers for SSE:
  ```javascript
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  ```
- Expose route `POST /api/chat/message-stream` in `src/routes/chat.routes.js`.

### Step 4: Frontend Real-Time Stream Reader
- Update `frontend/src/components/Chat.jsx` to consume `fetch('/api/chat/message-stream')` using `response.body.getReader()`.
- Renders incoming text chunks live on the chat screen with a ChatGPT-style smooth typing effect.

### Step 5: PostgreSQL Database Indexing
- Run index creation on `backup_2_july` database:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_address_street_address ON address (street_address);
  CREATE INDEX IF NOT EXISTS idx_project_tenant_id ON project (tenant_id);
  CREATE INDEX IF NOT EXISTS idx_project_home_id ON project (home_id);
  CREATE INDEX IF NOT EXISTS idx_home_homeowner_id ON home (homeowner_id);
  CREATE INDEX IF NOT EXISTS idx_home_address_id ON home (address_id);
  CREATE INDEX IF NOT EXISTS idx_brand_tenant_id ON brand (tenant_id);
  ```

---

## 📌 Instructions for AI Agent
When requested by the user to *"implement PERFORMANCE_OPTIMIZATION_PLAN.md"*, the AI agent should execute Steps 1 through 5 sequentially without asking for confirmation.
