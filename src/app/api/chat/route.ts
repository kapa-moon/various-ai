import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, systemPrompt, situationDescription, conversationCount } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Prepare the system message with context
    const systemMessage = {
      role: 'system' as const,
      content: `${systemPrompt}

CONTEXT: The user has described their situation as: "${situationDescription}"

This is conversation exchange ${conversationCount}/10. ${conversationCount >= 10 ? 'This is the final exchange - provide a thoughtful conclusion.' : `You have ${10 - conversationCount} exchanges remaining.`}

Stay in character and respond according to your defined persona and approach.`
    };

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using the more cost-effective model
      messages: [
        systemMessage,
        ...messages
      ],
      max_tokens: 300, // Limit response length to keep conversations focused
      temperature: 0.8, // Some creativity but not too much
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return NextResponse.json({ content });

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Return a fallback response instead of exposing the error
    return NextResponse.json({
      content: "I'm having trouble responding right now. Could you try rephrasing your message?"
    });
  }
}
