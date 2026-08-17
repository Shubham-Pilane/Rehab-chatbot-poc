# AWS Production Deployment Guide: Rehab Chatbot Assistant

This guide explains how to deploy the Rehab Chatbot application to AWS using containerized hosting, RDS PostgreSQL, and S3 for document storage.

---

## 1. Database Infrastructure Setup (AWS RDS)

We will use AWS RDS PostgreSQL to host both database connections. RDS has native out-of-the-box support for the `pgvector` extension.

### Step A: Spin Up RDS Instance
1. Open the **Amazon RDS console** and choose **Create Database**.
2. Select **PostgreSQL** as the engine (version 15.x or later is recommended).
3. Select **Production** or **Dev/Test** template depending on budget.
4. Set DB instance identifier to `repair-tracker-rds`.
5. Configure Master username and password credentials. Save these to your environment config.
6. Enable **Public access** as *No* (deploy inside your private VPC subnets).
7. Complete creation.

### Step B: Enable pgvector on RDS Databases
Connect to your RDS instance using a PostgreSQL client inside your VPC (e.g. EC2 bastion host or VPN link) and execute:
```sql
-- Connect to repair_tracker_prod (Main DB)
CREATE DATABASE repair_tracker_prod;

-- Connect to chatbot_db (Chatbot DB)
CREATE DATABASE chatbot_db;

-- Connect to chatbot_db and run:
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## 2. Storage Setup (AWS S3)

We will host RAG upload files inside an Amazon S3 Bucket.

1. Open the **Amazon S3 console** and select **Create Bucket**.
2. Set bucket name (e.g., `rehab-tracker-chatbot-documents-prod`).
3. Set **Object Ownership** to *Bucket owner enforced*.
4. Enable **Bucket Key** for SSE-KMS encryption.
5. Create IAM Policy permitting write/read operations for S3 and bind it to the ECS Execution Role.

---

## 3. Container Hosting Setup (AWS ECS Fargate)

AWS ECS Fargate allows running serverless Docker containers.

### Step A: Push Docker Image to ECR
1. Create an ECR repository:
   ```bash
   aws ecr create-repository --repository-name rehab-chatbot
   ```
2. Log in, build, and push your Docker image:
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
   
   docker build -t rehab-chatbot .
   
   docker tag rehab-chatbot:latest <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/rehab-chatbot:latest
   
   docker push <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/rehab-chatbot:latest
   ```

### Step B: Define ECS Task Definition
Create an ECS Task Definition using Fargate:
- **Operating system family**: Linux
- **Task memory**: 1 GB
- **Task CPU**: 0.5 vCPU
- **Container image URI**: `<YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/rehab-chatbot:latest`
- **Port mapping**: 5000 (TCP)
- **Environment variables**: Reference database credentials securely via **AWS Secrets Manager** or SSM Parameter Store:
  - `MAIN_DB_HOST` / `MAIN_DB_PASSWORD`
  - `CHATBOT_DB_HOST` / `CHATBOT_DB_PASSWORD`
  - `GEMINI_API_KEY` (Stored as Secret)
  - `AWS_S3_BUCKET` = `rehab-tracker-chatbot-documents-prod`
  - `NODE_ENV` = `production`

---

## 4. Load Balancing & Network Security

1. Deploy an **Application Load Balancer (ALB)** in your public subnets.
2. Direct port `80` (HTTP) and `443` (HTTPS with ACM SSL Certificate) to an ECS Target Group mapped to port `5000` on the Fargate tasks.
3. Configure Security Groups:
   - **ALB Security Group**: Open `80`/`443` to the internet.
   - **ECS Security Group**: Allow inbound `5000` traffic ONLY from the ALB Security Group.
   - **RDS Security Group**: Allow inbound `5432` traffic ONLY from the ECS Security Group.
