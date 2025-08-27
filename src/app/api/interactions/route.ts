import { NextRequest, NextResponse } from 'next/server';
import { logInteraction } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, interactionType, data = {} } = await request.json();
    
    if (!sessionId || !interactionType) {
      return NextResponse.json(
        { error: 'Session ID and interaction type are required' },
        { status: 400 }
      );
    }
    
    // Log the interaction
    await logInteraction(sessionId, interactionType, data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging interaction:', error);
    return NextResponse.json(
      { error: 'Failed to log interaction' },
      { status: 500 }
    );
  }
}
