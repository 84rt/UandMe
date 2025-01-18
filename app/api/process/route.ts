import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { generateResponse } = body;

    if (!generateResponse) {
      // Handle audio transcription only
      const { audio } = body;
      
      // Convert base64 to buffer
      const base64Data = audio.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');

      // Create a Blob from the buffer
      const audioBlob = new Blob([buffer], { type: 'audio/webm' });

      // Create FormData and append the file
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');

      // Make a direct fetch request to OpenAI's API
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const transcription = await response.json();
      return NextResponse.json({ text: transcription.text });
    } else {
      // Handle generating AI response from both texts
      const { personAText, personBText } = body;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. You are mediating a conversation between two people. Consider both perspectives and provide a thoughtful response that addresses both participants\' points.',
          },
          {
            role: 'user',
            content: `Person A said: "${personAText}"\n\nPerson B said: "${personBText}"\n\nPlease provide a response that addresses both perspectives.`,
          },
        ],
      });

      return NextResponse.json({
        aiResponse: completion.choices[0].message.content,
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Error processing request' },
      { status: 500 }
    );
  }
}
