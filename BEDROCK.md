# Amazon Bedrock Integration - Quick Reference

For the complete architectural design, diagrams, and end-to-end integration details, please refer to:
[BEDROCK_AGENT_ARCHITECTURE.md](file:///c:/Users/ShubhamP/Desktop/Rehab-Chatbot-POC/BEDROCK_AGENT_ARCHITECTURE.md)

---

## Active Configuration: Option A (AgentCore Harness & Tools)

* **Mode:** **Option A: Bedrock AgentCore Harness** (`BEDROCK_MODE=harness`)
* **Harness Name:** `rehab_management_agent`
* **Harness ARN:** `arn:aws:bedrock-agentcore:ap-southeast-2:472855497187:harness/rehab_management_agent-G3rKCZU6zN`
* **Foundation Model:** **Amazon Nova 2 Lite** (`global.amazon.nova-2-lite-v1:0`)
* **Tool Gateway:** `rehab-db-gateway-v2` (MCP Target)
* **Tool Function:** AWS Lambda `rehab_db_tool` (Node.js 22.x)
* **Local Database Link:** `ngrok` TCP forwarding to port `5433` (`backup_2_july`)
* **Region:** `ap-southeast-2` (Sydney)

---

## Key Files

1. [src/services/bedrock.service.js](file:///c:/Users/ShubhamP/Desktop/Rehab-Chatbot-POC/src/services/bedrock.service.js) - Handles `sendMessage` via `@aws-sdk/client-bedrock-agentcore` (`InvokeHarnessCommand`) for Option A, plus `generateChatResponse` for Option B.
2. [src/controllers/chat.controller.js](file:///c:/Users/ShubhamP/Desktop/Rehab-Chatbot-POC/src/controllers/chat.controller.js) - Orchestrates user messages directly to Bedrock AgentCore Harness in Option A mode.
3. [lambda_tool/index.mjs](file:///c:/Users/ShubhamP/Desktop/Rehab-Chatbot-POC/lambda_tool/index.mjs) - AWS Lambda tool handling database queries for vendor, project, tasks, and invoice records.
4. [.env](file:///c:/Users/ShubhamP/Desktop/Rehab-Chatbot-POC/.env) - Controls `USE_BEDROCK=true`, `BEDROCK_MODE=harness`, and `BEDROCK_HARNESS_ARN`.
