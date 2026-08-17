const { Sequelize } = require('sequelize');
require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';

// Configuration for Main RPM Database (Read-Only)
const mainDbConnection = new Sequelize(
  process.env.MAIN_DB_NAME || 'backup_2_july',
  process.env.MAIN_DB_USER || 'postgres',
  process.env.MAIN_DB_PASSWORD || 'postgres',
  {
    host: process.env.MAIN_DB_HOST || '127.0.0.1',
    port: parseInt(process.env.MAIN_DB_PORT || '5432', 10),
    dialect: 'postgres',
    logging: false, // Avoid cluttering logs, can set to console.log for debugging
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

// Configuration for Chatbot Database (Read-Write)
const chatbotDbConnection = new Sequelize(
  process.env.CHATBOT_DB_NAME || 'chatbot_db',
  process.env.CHATBOT_DB_USER || 'postgres',
  process.env.CHATBOT_DB_PASSWORD || 'postgres',
  {
    host: process.env.CHATBOT_DB_HOST || '127.0.0.1',
    port: parseInt(process.env.CHATBOT_DB_PORT || '5432', 10),
    dialect: 'postgres',
    logging: isTest ? false : console.log,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

module.exports = {
  mainDbConnection,
  chatbotDbConnection
};
