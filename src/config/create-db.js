const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
  console.log('Attempting to create database "chatbot_db"...');

  const config = {
    host: process.env.CHATBOT_DB_HOST || '127.0.0.1',
    port: parseInt(process.env.CHATBOT_DB_PORT || '5432', 10),
    user: process.env.CHATBOT_DB_USER || 'postgres',
    password: process.env.CHATBOT_DB_PASSWORD || 'zcon@123',
    database: 'postgres' // Connect to default database
  };

  const client = new Client(config);

  try {
    await client.connect();
    
    // Check if chatbot_db already exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname='chatbot_db'");
    if (res.rowCount === 0) {
      // Create database
      await client.query("CREATE DATABASE chatbot_db");
      console.log('✔ Successfully created database "chatbot_db"!');
    } else {
      console.log('✔ Database "chatbot_db" already exists.');
    }
  } catch (err) {
    console.error('✘ Error checking or creating database:', err.message);
  } finally {
    await client.end();
  }
}

createDatabase();
