'use client';

import { useState } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { Analytics } from '@vercel/analytics/react';

export default function Home() {
  const [text, setText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [response, setResponse] = useState('');

  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({ audio: true });

  const handleStopRecording = async () => {
    if (mediaBlobUrl) {
      setProcessing(true);
      try {
        // Convert audio blob to base64
        const audioBlob = await fetch(mediaBlobUrl).then((r) => r.blob());
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result;
          
          // Send to API route for processing
          const response = await fetch('/api/process', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ audio: base64Audio }),
          });

          const data = await response.json();
          setText(data.text);
          setResponse(data.aiResponse);
        };
      } catch (error) {
        console.error('Error processing audio:', error);
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <main className="min-h-screen p-8">
      <Analytics />
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center">Voice to AI Assistant</h1>
        
        <div className="space-y-4">
          <div className="flex justify-center gap-4">
            <button
              onClick={startRecording}
              disabled={status === 'recording'}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              Start Recording
            </button>
            <button
              onClick={() => {
                stopRecording();
                handleStopRecording();
              }}
              disabled={status !== 'recording'}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              Stop Recording
            </button>
          </div>

          <div className="text-center text-gray-600">
            Status: {status}
            {processing && ' (Processing...)'}
          </div>

          {text && (
            <div className="p-4 bg-gray-100 rounded-lg">
              <h2 className="font-semibold mb-2">Transcribed Text:</h2>
              <p>{text}</p>
            </div>
          )}

          {response && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h2 className="font-semibold mb-2">AI Response:</h2>
              <p>{response}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
