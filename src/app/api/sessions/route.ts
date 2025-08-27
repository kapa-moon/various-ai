import { NextResponse } from 'next/server';
import { createSession, logInteraction } from '@/lib/db';

export async function POST() {
  try {
    const sessionId = await createSession();
    
    // Log the session start interaction
    await logInteraction(sessionId, 'session_started');
    
    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
