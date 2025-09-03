import { NextRequest, NextResponse } from 'next/server';
import { updateSessionPreSurvey, logInteraction } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, preItem1, preItem2, preItem3, panasData } = body;

    // Validate input
    if (!sessionId || !preItem1 || !preItem2 || !preItem3) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Validate survey responses are within valid range (1-7)
    const responses = [preItem1, preItem2, preItem3];
    if (responses.some(response => response < 1 || response > 7 || !Number.isInteger(response))) {
      return NextResponse.json(
        { error: 'Survey responses must be integers between 1 and 7' },
        { status: 400 }
      );
    }

    // Update session with survey responses
    await updateSessionPreSurvey(sessionId, preItem1, preItem2, preItem3, panasData);

    // Log the survey completion interaction
    await logInteraction(sessionId, 'pre_survey_completed', {
      pre_item_1: preItem1,
      pre_item_2: preItem2,
      pre_item_3: preItem3,
      panas_data: panasData || null,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating session survey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
