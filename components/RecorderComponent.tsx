'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Import the media recorder hook dynamically to avoid SSR issues
const useReactMediaRecorder = dynamic(
  () => import('react-media-recorder').then(mod => mod.useReactMediaRecorder),
  { ssr: false }
);

const RecorderComponent = () => {
  const [personAText, setPersonAText] = useState('');
  const [personBText, setPersonBText] = useState('');
  const [currentPerson, setCurrentPerson] = useState<'A' | 'B' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [response, setResponse] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [recorder, setRecorder] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    // Initialize the recorder after component mounts
    const initRecorder = async () => {
      const { status, startRecording, stopRecording, mediaBlobUrl } = (useReactMediaRecorder as any)({ 
        audio: true,
        onStop: async (blobUrl: string) => {
          if (blobUrl && currentPerson) {
            console.log(`Recording stopped for Person ${currentPerson}`);
            setProcessing(true);
            try {
              const audioBlob = await fetch(blobUrl).then((r) => r.blob());
              const reader = new FileReader();
              reader.readAsDataURL(audioBlob);
              
              reader.onloadend = async () => {
                if (!reader.result) {
                  throw new Error('Failed to read audio data');
                }
                
                const base64Audio = reader.result;
                const person = currentPerson;
                console.log(`Processing audio for Person ${person}`);
                
                const response = await fetch('/api/process', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ 
                    audio: base64Audio, 
                    generateResponse: false,
                    person 
                  }),
                });

                if (!response.ok) {
                  throw new Error('Failed to process audio');
                }

                const data = await response.json();
                console.log(`Got response for Person ${person}:`, data);
                
                if (person === 'A') {
                  setPersonAText(data.text);
                } else if (person === 'B') {
                  setPersonBText(data.text);
                }
              };
            } catch (error) {
              console.error(`Error processing audio:`, error);
            } finally {
              setProcessing(false);
              setCurrentPerson(null);
            }
          }
        }
      });
      setRecorder({ status, startRecording, stopRecording, mediaBlobUrl });
    };
    
    initRecorder();
  }, [currentPerson]);

  // Only render the recorder content on the client side
  if (!isClient || !recorder) {
    return <div className="max-w-4xl mx-auto p-8">Loading...</div>;
  }

  const handleRecordClick = (person: 'A' | 'B') => {
    console.log(`Handle record click for Person ${person}`);
    if (recorder.status === 'recording') {
      console.log('Stopping recording');
      recorder.stopRecording();
    } else {
      console.log(`Starting recording for Person ${person}`);
      setCurrentPerson(person);
      recorder.startRecording();
    }
  };

  const generateAnswer = async () => {
    if (!personAText || !personBText) return;
    
    setProcessing(true);
    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personA: personAText,
          personB: personBText,
          generateResponse: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate response');
      }

      const data = await response.json();
      setResponse(data.response);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Person A</h2>
          <button
            onClick={() => handleRecordClick('A')}
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={processing || (recorder.status === 'recording' && currentPerson !== 'A')}
          >
            {recorder.status === 'recording' && currentPerson === 'A' ? 'Stop Recording' : 'Record Person A'}
          </button>
          <div className="mt-4">
            <p>{personAText}</p>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">Person B</h2>
          <button
            onClick={() => handleRecordClick('B')}
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={processing || (recorder.status === 'recording' && currentPerson !== 'B')}
          >
            {recorder.status === 'recording' && currentPerson === 'B' ? 'Stop Recording' : 'Record Person B'}
          </button>
          <div className="mt-4">
            <p>{personBText}</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={generateAnswer}
          className="bg-green-500 text-white px-4 py-2 rounded"
          disabled={!personAText || !personBText || processing}
        >
          Generate Response
        </button>
        {response && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <p>{response}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecorderComponent;
