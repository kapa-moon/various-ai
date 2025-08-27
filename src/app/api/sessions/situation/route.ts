import { NextRequest, NextResponse } from 'next/server';
import { updateSessionSituation, logInteraction } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, situationDescription } = await request.json();
    
    if (!sessionId || !situationDescription) {
      return NextResponse.json(
        { error: 'Session ID and situation description are required' },
        { status: 400 }
      );
    }
    
    // Update the session with the situation description
    await updateSessionSituation(sessionId, situationDescription);
    
    // Log the interaction
    await logInteraction(sessionId, 'situation_described', {
      situationDescription,
      characterCount: situationDescription.length,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating situation:', error);
    return NextResponse.json(
      { error: 'Failed to update situation' },
      { status: 500 }
    );
  }
}
