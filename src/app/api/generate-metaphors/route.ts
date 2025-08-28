import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('Generate metaphors API called');
    
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { situation } = body;
    console.log('Received situation:', situation);

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    if (!situation || typeof situation !== 'string' || situation.trim().length === 0) {
      console.error('Invalid situation provided:', situation);
      return NextResponse.json(
        { error: 'Situation description is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const prompt = `Based on this personal situation: "${situation}"

Generate two metaphoric phrases that represent an emotional journey:

1. STARTING POINT: How the person likely feels now (current emotional state)
2. DESIRED DESTINATION: Where they want to be emotionally

Each phrase should combine:
- One emotion adjective (e.g., lonely, confident, anxious, peaceful, overwhelmed, empowered)
- One geography/landscape term (e.g., valley, hill, river, mountain, desert, meadow, peak, cliff, forest, bridge)

Examples:
- "anxious valley" → "confident peak"
- "lonely river" → "connected meadow"
- "overwhelmed forest" → "peaceful clearing"

Return only a JSON object with this exact format:
{
  "startMetaphor": {
    "emotion": "word",
    "geography": "word", 
    "phrase": "emotion word + geography word"
  },
  "endMetaphor": {
    "emotion": "word",
    "geography": "word",
    "phrase": "emotion word + geography word"
  }
}`;

    console.log('Calling OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a creative assistant that generates metaphoric phrases for emotional journeys. Always respond with valid JSON in the exact requested format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    console.log('OpenAI API response received');
    const content = completion.choices[0]?.message?.content;
    console.log('OpenAI response content:', content);
    
    if (!content) {
      console.error('No content in OpenAI response');
      throw new Error('No response from OpenAI');
    }

    let metaphors;
    try {
      // Parse the JSON response
      metaphors = JSON.parse(content);
      console.log('Parsed metaphors:', metaphors);
    } catch (parseError) {
      console.error('Error parsing OpenAI response JSON:', parseError);
      console.error('Raw content:', content);
      throw new Error('Invalid JSON response from OpenAI');
    }
    
    // Validate the response structure
    if (!metaphors.startMetaphor || !metaphors.endMetaphor ||
        !metaphors.startMetaphor.phrase || !metaphors.endMetaphor.phrase) {
      console.error('Invalid metaphor structure:', metaphors);
      throw new Error('Invalid metaphor structure received');
    }

    console.log('Returning valid metaphors');
    return NextResponse.json(metaphors);

  } catch (error) {
    console.error('Error generating metaphors:', error);
    
    // Determine if this is a client error or server error
    const isClientError = error instanceof Error && (
      error.message.includes('Invalid JSON') ||
      error.message.includes('Invalid metaphor structure') ||
      error.message.includes('required')
    );
    
    const statusCode = isClientError ? 400 : 500;
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate metaphors',
        fallback: {
          startMetaphor: {
            emotion: 'uncertain',
            geography: 'valley',
            phrase: 'uncertain valley'
          },
          endMetaphor: {
            emotion: 'confident',
            geography: 'peak',
            phrase: 'confident peak'
          }
        }
      },
      { status: statusCode }
    );
  }
}
