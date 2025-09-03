import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { 
      sessionId,
      generatedStartPhrase,
      generatedEndPhrase,
      editedStartPhrase,
      editedEndPhrase,
      journeyProgress,
      willingnessToContinue
    } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!generatedStartPhrase || !generatedEndPhrase || journeyProgress === undefined) {
      return NextResponse.json(
        { error: 'Generated phrases and journey progress are required' },
        { status: 400 }
      );
    }

    // Update session with pre-landscape assessment data
    await sql`
      UPDATE sessions 
      SET pre_generated_start_phrase = ${generatedStartPhrase}, 
          pre_generated_end_phrase = ${generatedEndPhrase}, 
          pre_edited_start_phrase = ${editedStartPhrase || null}, 
          pre_edited_end_phrase = ${editedEndPhrase || null}, 
          pre_journey_progress = ${journeyProgress}, 
          pre_willingness_to_continue = ${willingnessToContinue || null}
      WHERE id = ${sessionId}
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error saving pre-landscape data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
