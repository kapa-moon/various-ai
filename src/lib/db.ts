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
        post_item_4 INTEGER,
        post_item_5 INTEGER,
        post_item_6 INTEGER,
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
      'post_item_6 INTEGER',
      'completed_at TIMESTAMP',
      'open_response TEXT',
      'pre_generated_start_phrase TEXT',
      'pre_generated_end_phrase TEXT',
      'pre_edited_start_phrase TEXT',
      'pre_edited_end_phrase TEXT',
      'pre_journey_progress INTEGER',
      'pre_willingness_to_continue INTEGER',
      'generated_start_phrase TEXT',
      'generated_end_phrase TEXT',
      'edited_start_phrase TEXT',
      'edited_end_phrase TEXT',
      'journey_progress INTEGER',
      'willingness_to_continue INTEGER',
      'pre_active INTEGER',
      'pre_alert INTEGER',
      'pre_attentive INTEGER',
      'pre_determined INTEGER',
      'pre_inspired INTEGER',
      'pre_afraid INTEGER',
      'pre_ashamed INTEGER',
      'pre_hostile INTEGER',
      'pre_nervous INTEGER',
      'pre_upset INTEGER',
      'post_active INTEGER',
      'post_alert INTEGER',
      'post_attentive INTEGER',
      'post_determined INTEGER',
      'post_inspired INTEGER',
      'post_afraid INTEGER',
      'post_ashamed INTEGER',
      'post_hostile INTEGER',
      'post_nervous INTEGER',
      'post_upset INTEGER'
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
  preItem3: number,
  panasData?: Record<string, number>
) {
  try {
    const panasFields = panasData ? {
      pre_active: panasData.active,
      pre_alert: panasData.alert,
      pre_attentive: panasData.attentive,
      pre_determined: panasData.determined,
      pre_inspired: panasData.inspired,
      pre_afraid: panasData.afraid,
      pre_ashamed: panasData.ashamed,
      pre_hostile: panasData.hostile,
      pre_nervous: panasData.nervous,
      pre_upset: panasData.upset
    } : {};

    // Try to update with PANAS data first, fall back to basic update if columns don't exist
    try {
      await sql`
        UPDATE sessions 
        SET pre_item_1 = ${preItem1}, 
            pre_item_2 = ${preItem2}, 
            pre_item_3 = ${preItem3},
            pre_active = ${panasFields.pre_active || null},
            pre_alert = ${panasFields.pre_alert || null},
            pre_attentive = ${panasFields.pre_attentive || null},
            pre_determined = ${panasFields.pre_determined || null},
            pre_inspired = ${panasFields.pre_inspired || null},
            pre_afraid = ${panasFields.pre_afraid || null},
            pre_ashamed = ${panasFields.pre_ashamed || null},
            pre_hostile = ${panasFields.pre_hostile || null},
            pre_nervous = ${panasFields.pre_nervous || null},
            pre_upset = ${panasFields.pre_upset || null},
            current_step = 'pre_survey_completed',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${sessionId}
      `;
    } catch (error) {
      // If PANAS columns don't exist, fall back to basic survey update
      console.warn('PANAS columns not found, updating basic survey only:', error instanceof Error ? error.message : error);
      await sql`
        UPDATE sessions 
        SET pre_item_1 = ${preItem1}, 
            pre_item_2 = ${preItem2}, 
            pre_item_3 = ${preItem3},
            current_step = 'pre_survey_completed',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${sessionId}
      `;
    }
  } catch (error) {
    console.error('Error updating session pre-survey:', error);
    throw error;
  }
}

// Update session with post-survey responses including PANAS
export async function updateSessionPostSurvey(
  sessionId: string,
  postItem1: number,
  postItem2: number,
  postItem3: number,
  postItem4: number,
  postItem5: number,
  postItem6: number,
  openResponse: string,
  panasData?: Record<string, number>
) {
  try {
    const panasFields = panasData ? {
      post_active: panasData.active,
      post_alert: panasData.alert,
      post_attentive: panasData.attentive,
      post_determined: panasData.determined,
      post_inspired: panasData.inspired,
      post_afraid: panasData.afraid,
      post_ashamed: panasData.ashamed,
      post_hostile: panasData.hostile,
      post_nervous: panasData.nervous,
      post_upset: panasData.upset
    } : {};

    // Try to update with PANAS data first, fall back to basic update if columns don't exist
    try {
      await sql`
        UPDATE sessions 
        SET post_item_1 = ${postItem1}, 
            post_item_2 = ${postItem2}, 
            post_item_3 = ${postItem3}, 
            post_item_4 = ${postItem4}, 
            post_item_5 = ${postItem5}, 
            post_item_6 = ${postItem6}, 
            post_active = ${panasFields.post_active || null},
            post_alert = ${panasFields.post_alert || null},
            post_attentive = ${panasFields.post_attentive || null},
            post_determined = ${panasFields.post_determined || null},
            post_inspired = ${panasFields.post_inspired || null},
            post_afraid = ${panasFields.post_afraid || null},
            post_ashamed = ${panasFields.post_ashamed || null},
            post_hostile = ${panasFields.post_hostile || null},
            post_nervous = ${panasFields.post_nervous || null},
            post_upset = ${panasFields.post_upset || null},
            open_response = ${openResponse}, 
            completed_at = CURRENT_TIMESTAMP
        WHERE id = ${sessionId}
      `;
    } catch (error) {
      // If PANAS or additional columns don't exist, try with just the original post items
      console.warn('Some columns not found, updating basic post-survey only:', error instanceof Error ? error.message : error);
      try {
        await sql`
          UPDATE sessions 
          SET post_item_1 = ${postItem1}, 
              post_item_2 = ${postItem2}, 
              post_item_3 = ${postItem3}, 
              open_response = ${openResponse}, 
              completed_at = CURRENT_TIMESTAMP
          WHERE id = ${sessionId}
        `;
      } catch (fallbackError) {
        console.error('Even basic post-survey update failed:', fallbackError);
        throw fallbackError;
      }
    }
  } catch (error) {
    console.error('Error updating session post-survey:', error);
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