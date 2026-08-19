const { chatbotDbConnection, mainDbConnection } = require('./database');
const { ChatRole, ChatUser, ChatUserRole } = require('../models/chatbot');
const bcrypt = require('bcryptjs');

async function initializeDatabases() {
  console.log('--- Initializing Databases ---');

  // 1. Verify connection to Main RPM Database
  try {
    await mainDbConnection.authenticate();
    console.log('✔ Successfully connected to Main RPM Database (backup_2_july)');
  } catch (err) {
    console.error('✘ Failed to connect to Main RPM Database:', err.message);
    console.log('Ensure Database #1 exists and environment variables are set correctly.');
  }

  // 2. Setup Chatbot Database
  try {
    await chatbotDbConnection.authenticate();
    console.log('✔ Successfully connected to Chatbot Database (chatbot_db)');

    // Enable pgvector extension
    console.log('Enabling pgvector extension on chatbot_db...');
    let hasPgvector = true;
    try {
      await chatbotDbConnection.query('CREATE EXTENSION IF NOT EXISTS vector;');
      console.log('✔ Vector extension ensured.');
    } catch (err) {
      console.warn('⚠ WARNING: pgvector extension is not installed in local PostgreSQL. Falling back to JavaScript vector matching.');
      hasPgvector = false;
      process.env.HAS_PGVECTOR = 'false';
    }

    // Sync models (this creates tables if they do not exist)
    console.log('Syncing chatbot models...');
    try {
      await chatbotDbConnection.sync();
    } catch (syncErr) {
      console.warn('⚠️ Warning during chatbotDbConnection.sync:', syncErr.message);
    }
    console.log('✔ Chatbot models synced.');

    if (hasPgvector) {
      console.log('Ensuring document_embeddings.embedding is vector(768)...');
      try {
        await chatbotDbConnection.query('ALTER TABLE document_embeddings DROP COLUMN IF EXISTS embedding;');
        await chatbotDbConnection.query('ALTER TABLE document_embeddings ADD COLUMN embedding vector(768) NOT NULL;');
        console.log('✔ Column document_embeddings.embedding set to type vector(768).');
        process.env.HAS_PGVECTOR = 'true';
      } catch (vectorErr) {
        console.error('⚠ Error configuring vector(768) column. Falling back to TEXT:', vectorErr.message);
        process.env.HAS_PGVECTOR = 'false';
      }
    } else {
      process.env.HAS_PGVECTOR = 'false';
    }

    // 3. Seed Default Roles
    const roles = [
      { name: 'Admin', description: 'System administrator with full privileges' },
      { name: 'Project Manager', description: 'Manages projects, milestones, tasks, and updates' },
      { name: 'Finance Manager', description: 'Manages budgets, cost reports, and invoices' },
      { name: 'Vendor Manager', description: 'Manages vendors and licensing details' },
      { name: 'Homeowner', description: 'Accesses updates for their specific home' },
      { name: 'Viewer', description: 'Read-only access to chatbot capabilities' }
    ];

    for (const role of roles) {
      await ChatRole.findOrCreate({
        where: { name: role.name },
        defaults: role
      });
    }
    console.log('✔ Default roles seeded.');

    // 4. Seed Default Admin User
    const adminUsername = 'admin';
    const adminEmail = 'admin@rehabtracker.com';
    const adminPassword = '123';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const [adminUser, created] = await ChatUser.findOrCreate({
      where: { username: adminUsername },
      defaults: {
        email: adminEmail,
        passwordHash: passwordHash,
        firstName: 'System',
        lastName: 'Admin',
        status: 'active'
      }
    });

    if (created) {
      console.log(`✔ Default administrator created: Username = ${adminUsername}, Password = ${adminPassword}`);
      const adminRole = await ChatRole.findOne({ where: { name: 'Admin' } });
      if (adminRole) {
        await ChatUserRole.create({
          userId: adminUser.id,
          roleId: adminRole.id
        });
        console.log('✔ Admin role associated to admin user.');
      }
    } else {
      console.log('✔ Admin user already exists. Updating password to default...');
      await adminUser.update({ passwordHash: passwordHash });
    }

    // 5. Seed Requirement 6.11 Sample Documents for RAG Knowledge Base
    const { RagDocument, DocumentChunk } = require('../models/chatbot');
    const docCount = await RagDocument.count();
    if (docCount === 0) {
      console.log('Seeding Requirement 6.11 sample RAG documents...');
      const geminiService = require('../services/gemini.service');
      const ragRepository = require('../repositories/chatbot/rag.repository');

      const sampleDocs = [
        {
          fileName: 'Inspection_Report_P1025.pdf',
          fileType: 'application/pdf',
          documentType: 'Inspection Report',
          content: 'Property Inspection Report for Project P-1025 (899 Rehab St):\nInspector Note: The inspector noted severe hardwood flooring damage in the living room and master bedroom caused by a historical plumbing leak. Recommended Action: Subfloor joist reinforcement, 400 sq ft oak hardwood replacement, and water barrier installation. Environmental Status: Asbestos inspection cleared.'
        },
        {
          fileName: 'Kitchen_Repair_Delay_Notes.txt',
          fileType: 'text/plain',
          documentType: 'Notes & Communication',
          content: 'Project Communication Note - Kitchen Repair Delay:\nRegarding the kitchen repair delay for Project P-1025, cabinet installation is delayed by 14 days due to backordered custom quartz countertops. Notes indicate the project manager approved the schedule adjustment while framing continues.'
        },
        {
          fileName: 'Vendor_Agreement_ABC_Flooring.pdf',
          fileType: 'application/pdf',
          documentType: 'Contractor Agreement',
          content: 'Contractor Agreement & Terms with ABC Flooring:\nAgreement Details for Project P-1025: What was agreed with ABC Flooring is a total scope cost of $4,500 for subfloor replacement and tile installation. ABC Flooring agreed to complete work by July 25, 2025 with a 2-year installation warranty.'
        }
      ];

      for (const item of sampleDocs) {
        const docRecord = await RagDocument.create({
          fileName: item.fileName,
          filePath: `/uploads/${item.fileName}`,
          fileType: item.fileType,
          documentType: item.documentType,
          fileSize: 1024,
          uploadedBy: adminUser.id,
          status: 'processed'
        });

        const chunkRecord = await DocumentChunk.create({
          documentId: docRecord.id,
          chunkIndex: 0,
          content: item.content
        });

        const embedding = await geminiService.generateEmbedding(item.content);
        await ragRepository.createEmbedding(chunkRecord.id, embedding);
      }
      console.log('✔ Requirement 6.11 sample RAG documents seeded.');
    }

    console.log('✔ Database initialization complete.');
  } catch (err) {
    console.error('✘ Failed to initialize Chatbot Database:', err);
    process.exit(1);
  }
}

// Support running directly from command line
if (require.main === module) {
  initializeDatabases().then(() => process.exit(0));
}

module.exports = initializeDatabases;
