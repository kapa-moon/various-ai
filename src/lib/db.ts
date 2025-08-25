import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

export const sql = neon(process.env.DATABASE_URL);

// Example function to test database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`;
    return result[0];
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

// Example function to create a simple users table
export async function createUsersTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Users table created successfully');
  } catch (error) {
    console.error('Error creating users table:', error);
    throw error;
  }
}

// Example function to get all users
export async function getUsers() {
  try {
    return await sql`SELECT * FROM users ORDER BY created_at DESC`;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}
