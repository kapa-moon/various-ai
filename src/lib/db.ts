import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

export const sql = neon(process.env.DATABASE_URL);

// Test database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`;
    return result[0];
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

// Create sessions table for tracking user sessions
export async function createSessionsTable() {
  try {
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
        completed_at TIMESTAMP,
        open_response TEXT,
        generated_start_phrase TEXT,
        generated_end_phrase TEXT,
        edited_start_phrase TEXT,
        edited_end_phrase TEXT,
        journey_progress INTEGER,
        willingness_to_continue INTEGER,
        metadata JSONB DEFAULT '{}'
      )
    `;
    console.log('Sessions table created successfully');
  } catch (error) {
    console.error('Error creating sessions table:', error);
    throw error;
  }
}

// Add missing columns to existing sessions table
export async function updateSessionsTableSchema() {
  try {
    const columnsToAdd = [
      'post_item_1 INTEGER',
      'post_item_2 INTEGER', 
      'post_item_3 INTEGER',
      'post_item_4 INTEGER',
      'post_item_5 INTEGER',
      'completed_at TIMESTAMP',
      'open_response TEXT',
      'generated_start_phrase TEXT',
      'generated_end_phrase TEXT',
      'edited_start_phrase TEXT',
      'edited_end_phrase TEXT',
      'journey_progress INTEGER',
      'willingness_to_continue INTEGER'
    ];

    for (const column of columnsToAdd) {
      try {
        await sql.unsafe(`ALTER TABLE sessions ADD COLUMN ${column}`);
        console.log(`Added column: ${column}`);
      } catch (error) {
        // Column might already exist, ignore error
        console.log(`Column ${column} may already exist:`, error instanceof Error ? error.message : error);
      }
    }
    console.log('Sessions table schema updated successfully');
  } catch (error) {
    console.error('Error updating sessions table schema:', error);
    throw error;
  }
}

// Create interactions table for tracking all user interactions
export async function createInteractionsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS interactions (
        id SERIAL PRIMARY KEY,
        session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
        interaction_type VARCHAR(50) NOT NULL,
        data JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Interactions table created successfully');
  } catch (error) {
    console.error('Error creating interactions table:', error);
    throw error;
  }
}

// Initialize all tables
export async function initializeDatabase() {
  await createSessionsTable();
  await createInteractionsTable();
  await updateSessionsTableSchema();
}

// Create a new session
export async function createSession() {
  try {
    const result = await sql`
      INSERT INTO sessions DEFAULT VALUES
      RETURNING id
    `;
    return result[0].id;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

// Update session with situation description
export async function updateSessionSituation(sessionId: string, situationDescription: string) {
  try {
    await sql`
      UPDATE sessions 
      SET situation_description = ${situationDescription}, 
          current_step = 'situation_described',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${sessionId}
    `;
  } catch (error) {
    console.error('Error updating session situation:', error);
    throw error;
  }
}

// Update session with pre-survey responses
export async function updateSessionPreSurvey(
  sessionId: string, 
  preItem1: number, 
  preItem2: number, 
  preItem3: number
) {
  try {
    await sql`
      UPDATE sessions 
      SET pre_item_1 = ${preItem1}, 
          pre_item_2 = ${preItem2}, 
          pre_item_3 = ${preItem3},
          current_step = 'pre_survey_completed',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${sessionId}
    `;
  } catch (error) {
    console.error('Error updating session pre-survey:', error);
    throw error;
  }
}

// Log an interaction
export async function logInteraction(
  sessionId: string, 
  interactionType: string, 
  data: Record<string, unknown> = {}
) {
  try {
    await sql`
      INSERT INTO interactions (session_id, interaction_type, data)
      VALUES (${sessionId}, ${interactionType}, ${JSON.stringify(data)})
    `;
  } catch (error) {
    console.error('Error logging interaction:', error);
    throw error;
  }
}

// Get session by ID
export async function getSession(sessionId: string) {
  try {
    const result = await sql`
      SELECT * FROM sessions WHERE id = ${sessionId}
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Error fetching session:', error);
    throw error;
  }
}

// Get all interactions for a session
export async function getSessionInteractions(sessionId: string) {
  try {
    return await sql`
      SELECT * FROM interactions 
      WHERE session_id = ${sessionId} 
      ORDER BY created_at ASC
    `;
  } catch (error) {
    console.error('Error fetching session interactions:', error);
    throw error;
  }
}