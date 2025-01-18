import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { audio } = await req.json();

    // Convert base64 to buffer
    const buffer = Buffer.from(audio.split(',')[1], 'base64');

    // Create a temporary file with the audio data
    const file = new File([buffer], 'audio.webm', { type: 'audio/webm' });

    // Transcribe the audio
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
    });

    // Process the transcribed text with GPT
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Respond to the user\'s message concisely and professionally.',
        },
        {
          role: 'user',
          content: transcription.text,
        },
      ],
    });

    return NextResponse.json({
      text: transcription.text,
      aiResponse: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Error processing audio' },
      { status: 500 }
    );
  }
}
