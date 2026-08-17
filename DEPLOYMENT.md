# Local Deployment Guide: Rehab Chatbot Assistant

This guide explains how to deploy the AI-powered Rehab Chatbot system on your local system for testing and development.

---

## 1. Prerequisites

Ensure you have the following installed on your system:
- **Node.js**: v18.x or later
- **npm**: v9.x or later
- **PostgreSQL**: v14.x or later
- **pgvector Extension**: Pre-installed on your PostgreSQL server.
  - *If you run PostgreSQL locally on Windows/Linux, you must compile pgvector or install it via your package manager.*
  - *If you use Docker, pgvector is precompiled in our Compose file!*

---

## 2. Environment Configuration

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill out your configurations:
   - Make sure to supply your `GEMINI_API_KEY` to enable the Gemini 2.5 Flash chatbot responses.
   - Adjust database connection details (`MAIN_DB_*` and `CHATBOT_DB_*`) to match your PostgreSQL server.

---

## 3. Database Setups (PostgreSQL)

Before running the application, make sure you have created the two required PostgreSQL databases on your server:
1. `backup_2_july` (The Main Read-Only RPM database)
2. `chatbot_db` (The Chatbot private database)

Run standard PostgreSQL commands to create them:
```sql
CREATE DATABASE backup_2_july;
CREATE DATABASE chatbot_db;
```

---

## 4. Run Locally (Node.js & React Dev Servers)

You can run the frontend and backend in developer watch modes:

### Step A: Install Dependencies & Setup Backend
1. In the project root, install backend packages:
   ```bash
   npm install
   ```
2. Initialize databases and run migrations (this configures the vector extension, creates the schema structure, and seeds initial data):
   ```bash
   npm run start
   ```
   *(On first run, the initialization script seeds default roles and an Admin user: `username: admin` and `password: AdminPassword123!`)*

### Step B: Setup Frontend
1. Change directory to `/frontend` and install packages:
   ```bash
   cd frontend
   npm install
   ```
2. Spin up the Vite client developer server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your web browser.

---

## 5. Run via Docker Compose (Recommended)

Running the entire system inside Docker is the simplest method since it automatically creates the pgvector database and compiles the React frontend:

1. Modify the `GEMINI_API_KEY` in `docker-compose.yml` with your active key.
2. Build and start containers:
   ```bash
   docker-compose up --build -d
   ```
3. Check status:
   ```bash
   docker-compose ps
   ```
4. Access the unified chatbot application at: `http://localhost:5000`

---

## 6. PM2 Production Process Management

If you deploy on a standalone server (such as AWS EC2) without Docker, use PM2 to run the backend in cluster mode:

1. Install PM2 globally:
   ```bash
   npm install pm2 -g
   ```
2. Install dependencies & compile frontend static assets:
   ```bash
   npm run build:prod # Builds UI to /frontend/dist
   ```
3. Launch cluster:
   ```bash
   pm2 start pm2.config.js --env production
   ```
4. Monitor server status:
   ```bash
   pm2 status
   pm2 logs
   ```
