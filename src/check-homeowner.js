require('dotenv').config();
const { mainDbConnection } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function testSample() {
  try {
    const sample = await mainDbConnection.query(
      "SELECT id, first_name, last_name, email, phone_number FROM homeowner LIMIT 5",
      { type: QueryTypes.SELECT }
    );
    console.log('SAMPLE_HOMEOWNERS_FOUND:', sample);
    process.exit(0);
  } catch (err) {
    console.error('ERR:', err.message);
    process.exit(1);
  }
}

testSample();
