const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function setupDatabase() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Database schema created successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    pool.end();
  }
}

setupDatabase();