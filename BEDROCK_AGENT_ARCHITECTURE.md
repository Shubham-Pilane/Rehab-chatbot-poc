# Amazon Bedrock & Nova 2 Lite - Architecture & Integration Guide

This document provides a comprehensive overview of the **Amazon Bedrock** integration in the Rehab Project Management (RPM) Chatbot Assistant, featuring the **Amazon Nova 2 Lite** (`global.amazon.nova-2-lite-v1:0`) foundation model integrated with the PostgreSQL database (`backup_2_july`).

---

## 1. Overview of Supported Architectures

The application supports two complementary Bedrock architectures:

1. **Option A: AgentCore Harness & Tool Gateway (ACTIVE)**  
   * **Engine:** Amazon Nova 2 Lite configured in AWS Bedrock AgentCore Harness (`rehab_management_agent`).
   * **Execution:** Express backend routes requests directly via `@aws-sdk/client-bedrock-agentcore` (`InvokeHarnessCommand`). Bedrock AgentCore autonomously decides when to query database tools via AgentCore Gateway (`rehab-db-gateway-v2`) and AWS Lambda (`rehab_db_tool`) over the ngrok tunnel.
   * **Benefits:** True cloud-native autonomous agent orchestration, multi-step reasoning, and tool execution directly inside the AWS ecosystem.

2. **Option B: Direct Bedrock Runtime Integration (ALTERNATIVE)**  
   * **Engine:** Amazon Nova 2 Lite (`global.amazon.nova-2-lite-v1:0`) via `@aws-sdk/client-bedrock-runtime`.
   * **Execution:** Node.js Express backend directly coordinates Text-to-SQL generation and queries local PostgreSQL.

---

## 2. Active Architecture: Option A (AgentCore Harness & Tools)

### High-Level Flow Diagram

```mermaid
flowchart TD
    subgraph Client Layer
        React[React.js Frontend\nhttp://localhost:5173]
    end

    subgraph Backend Layer (Node.js / Express)
        Controller[chat.controller.js]
        SqlService[sql.service.js\n600+ Line RPM Schema]
        BedrockService[bedrock.service.js\nAmazon Bedrock Runtime SDK]
    end

    subgraph AWS Bedrock Cloud
        Nova[Amazon Nova 2 Lite\nglobal.amazon.nova-2-lite-v1:0]
    end

    subgraph Data Layer
        Postgres[(PostgreSQL Database\nlocalhost:5433 / backup_2_july)]
    end

    React -->|1. User Prompt (HTTP POST)| Controller
    Controller -->|2. Generate SQL from NL| SqlService
    SqlService -->|3. Prompt + DB Schema| BedrockService
    BedrockService -->|4. ConverseCommand| Nova
    Nova -->|5. Structured JSON { sql }| BedrockService
    BedrockService -->|6. Raw SQL Query| SqlService
    SqlService -->|7. Executes SELECT Query| Postgres
    Postgres -->|8. Returns Database Rows| SqlService
    SqlService -->|9. Business Records| Controller
    Controller -->|10. Prompt + DB Records| BedrockService
    BedrockService -->|11. ConverseCommand| Nova
    Nova -->|12. Synthesized Markdown Answer| BedrockService
    BedrockService -->|13. Final Response + Follow-ups| Controller
    Controller -->|14. Typewriter Word Stream| React
```

---

### Step-by-Step Execution Lifecycle

1. **User asks a question in the UI:**
   * *Example:* `"Show me contact details for vendor Terracon"` or `"How many open projects do we have?"`
2. **Text-to-SQL Generation (Bedrock Nova 2 Lite):**
   * [src/services/sql.service.js](file:///c:/Users/ShubhamP/Desktop/Rehab-Chatbot-POC/src/services/sql.service.js) passes the user question along with the schema for all 20+ tables to [src/services/bedrock.service.js](file:///c:/Users/ShubhamP/Desktop/Rehab-Chatbot-POC/src/services/bedrock.service.js).
   * Bedrock invokes `ConverseCommand` on `global.amazon.nova-2-lite-v1:0`.
   * Nova 2 Lite returns clean, validated PostgreSQL:
     ```sql
     SELECT vendor.name AS vendor_name, vendor.email, vendor.phone_number, vendor.contact_type, 
            address.street_address, address.city, address.state, address.zip 
     FROM vendor 
     JOIN address ON vendor.address_id = address.id 
     WHERE vendor.name ILIKE 'Terracon';
     ```
3. **Safety & Security Filtering:**
   * Query is verified to ensure it begins with `SELECT` (strictly read-only).
   * Forbidden mutation commands (`DROP`, `DELETE`, `UPDATE`, `INSERT`, etc.) are blocked.
   * Role-Based Access Control (RBAC) validates whether the user has permission to view financial tables (e.g., invoices/budgets).
4. **Local Database Execution:**
   * The query is executed directly against PostgreSQL (`localhost:5433 / backup_2_july`).
   * Execution time is ~5ms with zero internet tunneling delay.
5. **Answer Synthesis (Bedrock Nova 2 Lite):**
   * [src/controllers/chat.controller.js](file:///c:/Users/ShubhamP/Desktop/Rehab-Chatbot-POC/src/controllers/chat.controller.js) builds the prompt containing system instructions, conversation context, and retrieved database records.
   * Nova 2 Lite generates formatted markdown with bullet points, mailto links, phone formatting, and suggestion pills (`[SUGGESTED_FOLLOW_UPS: ...]`).
6. **Frontend Delivery:**
   * The React chat UI renders the response using a 60fps word flow typewriter effect.

---

## 3. Alternative Architecture: Option A (AgentCore Cloud Agent)

For reference, the cloud agentic setup you constructed in AWS is also preserved:

```mermaid
flowchart TD
    subgraph Client Layer
        React[React.js Frontend]
    end

    subgraph Backend Layer
        Express[Node.js / Express API]
    end

    subgraph AWS Cloud (ap-southeast-2 - Sydney)
        Harness[AgentCore Harness: rehab_management_agent\nModel: Nova 2 Lite]
        Gateway[AgentCore Gateway: rehab-db-gateway-v2\nProtocol: MCP Target]
        Lambda[AWS Lambda: rehab_db_tool\nRuntime: Node.js 22.x]
    end

    subgraph Local Workstation
        Ngrok[ngrok TCP Tunnel\n0.tcp.in.ngrok.io:16590]
        Postgres[(PostgreSQL Database\nlocalhost:5433 / backup_2_july)]
    end

    React -->|1. User Prompt| Express
    Express -->|2. InvokeHarnessCommand| Harness
    Harness -->|3. Tool Call| Gateway
    Gateway -->|4. Invokes Function| Lambda
    Lambda -->|5. SQL over TCP Tunnel| Ngrok
    Ngrok -->|6. Local Port 5433| Postgres
    Postgres -->|7. Data Rows| Ngrok
    Ngrok -->|8. Tool Result| Lambda
    Lambda -->|9. JSON Response| Gateway
    Gateway -->|10. Context Return| Harness
    Harness -->|11. Formatted Reply| Express
    Express -->|12. Rendered Markdown| React
```

### AWS Cloud Resources Configured:
* **AgentCore Harness:** `rehab_management_agent` (`ap-southeast-2`)
* **Harness ARN:** `arn:aws:bedrock-agentcore:ap-southeast-2:472855497187:harness/rehab_management_agent-G3rKCZU6zN`
* **AgentCore Gateway:** `rehab-db-gateway-v2` (Target: `rehab_db_target`)
* **AWS Lambda Tool:** `rehab_db_tool` (Node.js 22.x, PostgreSQL client packaged in `rehab_db_tool.zip`)
* **Database Tunnel:** `ngrok` TCP forwarding to port `5433`.

---

## 4. Key Components Breakdown

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Foundation Model** | **Amazon Nova 2 Lite** (`global.amazon.nova-2-lite-v1:0`) | High-speed, cost-efficient model generating PostgreSQL SELECT queries and conversational answers. |
| **AWS SDK** | `@aws-sdk/client-bedrock-runtime` | Handles AWS SigV4 signed API calls to Bedrock `ConverseCommand`. |
| **Bedrock Service** | [src/services/bedrock.service.js](file:///c:/Users/ShubhamP/Desktop/Rehab-Chatbot-POC/src/services/bedrock.service.js) | Centralized service providing `generateJsonResponse` and `generateChatResponse`. |
| **Text-to-SQL Service**| [src/services/sql.service.js](file:///c:/Users/ShubhamP/Desktop/Rehab-Chatbot-POC/src/services/sql.service.js) | Contains complete schema definitions for all 20+ tables, join rules, and safety validators. |
| **Chat Controller** | [src/controllers/chat.controller.js](file:///c:/Users/ShubhamP/Desktop/Rehab-Chatbot-POC/src/controllers/chat.controller.js) | Orchestrates the query flow, RBAC access checks, and conversation auditing. |
| **Database** | **PostgreSQL (Local)** | Houses rehab tables (`project`, `vendor`, `assigned_task`, `invoice`, `home`, `address`, `brand`). |
| **Frontend** | **React.js + Tailwind / CSS** | Modern dashboard UI with live chat, follow-up suggestion chips, and typewriter streaming. |

---

## 5. Node.js 16 Compatibility & Polyfills

Because the local environment runs Node.js `v16.20.2`, the AWS SDK v3 requires web stream and cryptographic globals that are standard in Node 18+. 

These are polyfilled early in [src/server.js](file:///c:/Users/ShubhamP/Desktop/Rehab-Chatbot-POC/src/server.js) and [src/services/bedrock.service.js](file:///c:/Users/ShubhamP/Desktop/Rehab-Chatbot-POC/src/services/bedrock.service.js):

```javascript
// Polyfill web streams & crypto for Node 16 AWS SDK v3 support
if (!global.TransformStream) {
  try {
    const { TransformStream, ReadableStream, WritableStream } = require('stream/web');
    global.TransformStream = TransformStream;
    global.ReadableStream = ReadableStream;
    global.WritableStream = WritableStream;
  } catch (e) {}
}
if (!global.crypto) {
  try {
    global.crypto = require('crypto').webcrypto;
  } catch (e) {}
}
```

---

## 6. Environment Variables Reference

In your [.env](file:///c:/Users/ShubhamP/Desktop/Rehab-Chatbot-POC/.env) file:

```env
# AWS Bedrock Configuration
USE_BEDROCK=true
AWS_REGION=ap-southeast-2
BEDROCK_MODEL_ID=global.amazon.nova-2-lite-v1:0
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
BEDROCK_HARNESS_ARN=arn:aws:bedrock-agentcore:ap-southeast-2:472855497187:harness/rehab_management_agent-G3rKCZU6zN

# Local PostgreSQL Configuration
MAIN_DB_HOST=127.0.0.1
MAIN_DB_PORT=5433
MAIN_DB_NAME=backup_2_july
MAIN_DB_USER=postgres
MAIN_DB_PASSWORD=zcon@123
```

---

## 7. Live Verification & Test Queries

The following queries were executed and validated end-to-end with **Amazon Nova 2 Lite**:

### Test 1: Vendor Contact Query
* **User Query:** `"Show me contact details for vendor Terracon"`
* **Generated SQL:**
  ```sql
  SELECT vendor.name AS vendor_name, vendor.email, vendor.phone_number, vendor.contact_type, 
         address.street_address, address.city, address.state, address.zip 
  FROM vendor 
  JOIN address ON vendor.address_id = address.id 
  WHERE vendor.name ILIKE 'Terracon'
  ```
* **Database Result:** `Chad.Champagne@terracon.com` / `8172688600` / `2501 East Loop 820 North, Fort Worth, Texas 76118`
* **Model Latency:** ~2.1 seconds

### Test 2: Aggregate Project Count Query
* **User Query:** `"How many open projects do we have?"`
* **Generated SQL:**
  ```sql
  SELECT COUNT(*) FROM project WHERE project_state = 'OPEN'
  ```
* **Database Result:** `2750` open projects.
* **Model Latency:** ~1.8 seconds

---

## 8. Running the Application

To launch both the Express backend and React frontend concurrently:

```bash
npm run dev
```

* **Frontend:** `http://localhost:5173`
* **Backend API:** `http://localhost:5000`

---

## 9. Production Migration Roadmap (Future AWS Cloud Hosting)

When moving from local POC to AWS cloud hosting:
1. **Amazon Aurora / RDS PostgreSQL:** Migrate `backup_2_july` into an AWS RDS PostgreSQL instance in private VPC subnets.
2. **ECS Fargate / EKS Hosting:** Deploy the Express backend and React frontend into AWS ECS Fargate.
3. **IAM Role Authentication:** Replace hardcoded AWS Access Keys with an **IAM Task Execution Role** allowing `bedrock:InvokeModel` and `bedrock:Converse`.
