'use client';

import { useState, useEffect } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { Analytics } from '@vercel/analytics/react';

const RecorderComponent = () => {
  const [personAText, setPersonAText] = useState('');
  const [personBText, setPersonBText] = useState('');
  const [currentPerson, setCurrentPerson] = useState<'A' | 'B' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [response, setResponse] = useState('');

  const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({ 
    audio: true,
    onStop: async (blobUrl) => {
      if (blobUrl) {
        setProcessing(true);
        try {
          const audioBlob = await fetch(blobUrl).then((r) => r.blob());
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result;
            
            const response = await fetch('/api/process', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                audio: base64Audio, 
                generateResponse: false,
                person: currentPerson  
              }),
            });

            const data = await response.json();
            if (currentPerson === 'A') {
              setPersonAText(data.text);
            } else {
              setPersonBText(data.text);
            }
            setCurrentPerson(null);
          };
        } catch (error) {
          console.error('Error processing audio:', error);
        } finally {
          setProcessing(false);
        }
      }
    }
  });

  const handleRecordClick = (person: 'A' | 'B') => {
    if (status === 'recording') {
      stopRecording();
    } else {
      setCurrentPerson(person);
      startRecording();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold text-center">Voice to AI Assistant</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Person A Section */}
        <div className={`p-4 rounded-lg border-2 ${
          currentPerson === 'A' && status === 'recording'
            ? 'border-red-500'
            : personAText 
              ? 'bg-gray-100 border-gray-300' 
              : 'bg-gray-50 border-dashed border-gray-200'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-gray-700">
              Person A {currentPerson === 'A' && status === 'recording' && '(Recording...)'}
            </h2>
            <button
              onClick={() => handleRecordClick('A')}
              disabled={processing || (status === 'recording' && currentPerson !== 'A')}
              className={`px-3 py-1 rounded ${
                currentPerson === 'A' && status === 'recording'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white text-sm disabled:opacity-50`}
            >
              {currentPerson === 'A' && status === 'recording' ? 'Stop' : 'Record'}
            </button>
          </div>
          <p className="min-h-[100px] whitespace-pre-wrap">
            {personAText || 'Waiting for recording...'}
          </p>
        </div>

        {/* Person B Section */}
        <div className={`p-4 rounded-lg border-2 ${
          currentPerson === 'B' && status === 'recording'
            ? 'border-red-500'
            : personBText 
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-gray-50 border-dashed border-gray-200'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-blue-700">
              Person B {currentPerson === 'B' && status === 'recording' && '(Recording...)'}
            </h2>
            <button
              onClick={() => handleRecordClick('B')}
              disabled={processing || (status === 'recording' && currentPerson !== 'B')}
              className={`px-3 py-1 rounded ${
                currentPerson === 'B' && status === 'recording'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white text-sm disabled:opacity-50`}
            >
              {currentPerson === 'B' && status === 'recording' ? 'Stop' : 'Record'}
            </button>
          </div>
          <p className="min-h-[100px] whitespace-pre-wrap">
            {personBText || 'Waiting for recording...'}
          </p>
        </div>
      </div>

      {(personAText || personBText) && (
        <div className="text-center">
          <button
            onClick={async () => {
              setProcessing(true);
              try {
                const response = await fetch('/api/process', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ 
                    personAText, 
                    personBText,
                    generateResponse: true 
                  }),
                });

                const data = await response.json();
                setResponse(data.aiResponse);
              } catch (error) {
                console.error('Error generating response:', error);
              } finally {
                setProcessing(false);
              }
            }}
            disabled={processing || !personAText || !personBText}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Generate Response
          </button>
        </div>
      )}

      {response && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h2 className="font-semibold mb-2">AI Response:</h2>
          <p className="whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  );
};

import ClientRoot from './client';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <ClientRoot />
    </main>
  );
}
