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
        post_item_1 INTEGER,
        post_item_2 INTEGER,
        post_item_3 INTEGER,
        post_item_4 INTEGER,
        post_item_5 INTEGER,
        post_item_6 INTEGER,
        pre_active INTEGER,
        pre_alert INTEGER,
        pre_attentive INTEGER,
        pre_determined INTEGER,
        pre_inspired INTEGER,
        pre_afraid INTEGER,
        pre_ashamed INTEGER,
        pre_hostile INTEGER,
        pre_nervous INTEGER,
        pre_upset INTEGER,
        post_active INTEGER,
        post_alert INTEGER,
        post_attentive INTEGER,
        post_determined INTEGER,
        post_inspired INTEGER,
        post_afraid INTEGER,
        post_ashamed INTEGER,
        post_hostile INTEGER,
        post_nervous INTEGER,
        post_upset INTEGER,
        completed_at TIMESTAMP,
        open_response TEXT,
        pre_generated_start_phrase TEXT,
        pre_generated_end_phrase TEXT,
        pre_edited_start_phrase TEXT,
        pre_edited_end_phrase TEXT,
        pre_journey_progress INTEGER,
        pre_willingness_to_continue INTEGER,
        generated_start_phrase TEXT,
        generated_end_phrase TEXT,
        edited_start_phrase TEXT,
        edited_end_phrase TEXT,
        journey_progress INTEGER,
        willingness_to_continue INTEGER,
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
