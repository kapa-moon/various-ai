import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { 
      sessionId, 
      postItem1, 
      postItem2, 
      postItem3, 
      openResponse 
    } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Validate that all required fields are provided
    if (
      postItem1 === undefined || 
      postItem2 === undefined || 
      postItem3 === undefined ||
      !openResponse ||
      openResponse.length < 20
    ) {
      return NextResponse.json(
        { error: 'All post-survey items are required, including open response (minimum 20 characters)' },
        { status: 400 }
      );
    }

    // Update session with post-survey responses
    await sql`
      UPDATE sessions 
      SET post_item_1 = ${postItem1}, 
          post_item_2 = ${postItem2}, 
          post_item_3 = ${postItem3}, 
          open_response = ${openResponse}, 
          completed_at = CURRENT_TIMESTAMP
      WHERE id = ${sessionId}
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating session with post-survey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
