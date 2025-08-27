const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Create sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        situation_description TEXT,
        current_step VARCHAR(50) DEFAULT 'landing',
        pre_item_1 INTEGER,
        pre_item_2 INTEGER,
        pre_item_3 INTEGER,
        metadata JSONB DEFAULT '{}'
      )
    `;
    console.log('✅ Sessions table created');
    
    // Create interactions table
    await sql`
      CREATE TABLE IF NOT EXISTS interactions (
        id SERIAL PRIMARY KEY,
        session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
        interaction_type VARCHAR(50) NOT NULL,
        data JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Interactions table created');
    
    // Test connection
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    
    console.log('🎉 Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
