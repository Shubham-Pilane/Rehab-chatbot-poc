if (!global.fetch || !global.Headers) {
  const fetch = require('node-fetch');
  global.fetch = fetch;
  global.Headers = fetch.Headers;
  global.Request = fetch.Request;
  global.Response = fetch.Response;
}

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

require('dotenv').config();
const app = require('./app');
const initializeDatabases = require('./config/init-chatbot-db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1. Prepare databases, create schemas, run pgvector migrations, seed roles/admin user
    await initializeDatabases();

    // 2. Start Express listener
    app.listen(PORT, () => {
      console.log(`🚀 Chatbot Backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Ignore DB migrations/server initialization in test environments
if (process.env.NODE_ENV !== 'test') {
  startServer();
}
