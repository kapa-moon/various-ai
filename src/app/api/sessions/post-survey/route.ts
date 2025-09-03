import { NextRequest, NextResponse } from 'next/server';
import { updateSessionPostSurvey, logInteraction } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { 
      sessionId, 
      postItem1, 
      postItem2, 
      postItem3, 
      postItem4, 
      postItem5, 
      postItem6, 
      openResponse,
      panasData
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
      postItem4 === undefined || 
      postItem5 === undefined || 
      postItem6 === undefined ||
      !openResponse ||
      openResponse.length < 20
    ) {
      return NextResponse.json(
        { error: 'All post-survey items are required, including open response (minimum 20 characters)' },
        { status: 400 }
      );
    }

    // Validate PANAS data if provided
    if (panasData) {
      const panasValues = Object.values(panasData) as number[];
      if (panasValues.some((value: number) => value < 1 || value > 5 || !Number.isInteger(value))) {
        return NextResponse.json(
          { error: 'PANAS responses must be integers between 1 and 5' },
          { status: 400 }
        );
      }
    }

    // Update session with post-survey responses
    await updateSessionPostSurvey(sessionId, postItem1, postItem2, postItem3, postItem4, postItem5, postItem6, openResponse, panasData);

    // Log the post-survey completion interaction
    await logInteraction(sessionId, 'post_survey_completed', {
      post_item_1: postItem1,
      post_item_2: postItem2,
      post_item_3: postItem3,
      post_item_4: postItem4,
      post_item_5: postItem5,
      post_item_6: postItem6,
      panas_data: panasData || null,
      open_response: openResponse,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating session with post-survey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
