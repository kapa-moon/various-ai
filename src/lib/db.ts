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
        metadata JSONB DEFAULT '{}'
      )
    `;
    console.log('Sessions table created successfully');
  } catch (error) {
    console.error('Error creating sessions table:', error);
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