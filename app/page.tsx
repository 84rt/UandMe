'use client';

import { useState, useEffect, useRef } from 'react';
import OpenAI from 'openai';

let openai: OpenAI | null = null;

export default function Home() {
  const [firstPersonText, setFirstPersonText] = useState('');
  const [secondPersonText, setSecondPersonText] = useState('');
  const [chatGPTResponse, setChatGPTResponse] = useState('');
  const [isRecordingFirst, setIsRecordingFirst] = useState(false);
  const [isRecordingSecond, setIsRecordingSecond] = useState(false);
  const [error, setError] = useState<string>('');

  // Refs to store MediaRecorder instances
  const firstRecorderRef = useRef<MediaRecorder | null>(null);
  const secondRecorderRef = useRef<MediaRecorder | null>(null);
  const firstStreamRef = useRef<MediaStream | null>(null);
  const secondStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      setError('OpenAI API key is missing. Please add it to your .env.local file.');
      return;
    }
    openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
  }, []);

  const stopRecording = async (person: 'first' | 'second') => {
    const recorder = person === 'first' ? firstRecorderRef.current : secondRecorderRef.current;
    const stream = person === 'first' ? firstStreamRef.current : secondStreamRef.current;

    if (recorder && recorder.state === 'recording') {
      recorder.stop();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (person === 'first') {
        setIsRecordingFirst(false);
        firstRecorderRef.current = null;
        firstStreamRef.current = null;
      } else {
        setIsRecordingSecond(false);
        secondRecorderRef.current = null;
        secondStreamRef.current = null;
      }
    }
  };

  const toggleRecording = async (person: 'first' | 'second') => {
    if (!openai) {
      setError('OpenAI client is not initialized. Please check your API key.');
      return;
    }

    // If already recording, stop it
    if ((person === 'first' && isRecordingFirst) || (person === 'second' && isRecordingSecond)) {
      await stopRecording(person);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      // Store the recorder and stream in refs
      if (person === 'first') {
        firstRecorderRef.current = mediaRecorder;
        firstStreamRef.current = stream;
      } else {
        secondRecorderRef.current = mediaRecorder;
        secondStreamRef.current = stream;
      }

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
          const audioFile = new File([audioBlob], 'audio.mp3', {
            type: 'audio/mp3',
            lastModified: Date.now(),
          });

          const response = await openai!.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
            language: 'en',
          });

          if (person === 'first') {
            setFirstPersonText(prev => prev + (prev ? '\n' : '') + response.text);
          } else {
            setSecondPersonText(prev => prev + (prev ? '\n' : '') + response.text);
          }
          setError('');
        } catch (error: any) {
          console.error('Error transcribing audio:', error);
          setError(`Error transcribing audio: ${error.message || 'Unknown error occurred'}`);
        }
      };

      // Start recording
      mediaRecorder.start();
      if (person === 'first') {
        setIsRecordingFirst(true);
      } else {
        setIsRecordingSecond(true);
      }

      // Request data every 5 seconds to avoid large chunks
      mediaRecorder.addEventListener('start', () => {
        const interval = setInterval(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.requestData();
          } else {
            clearInterval(interval);
          }
        }, 5000);
      });

    } catch (error: any) {
      console.error('Error accessing microphone:', error);
      setError(`Error accessing microphone: ${error.message || 'Please make sure you have granted microphone permissions.'}`);
    }
  };

  const sendToChatGPT = async () => {
    if (!openai) {
      setError('OpenAI client is not initialized. Please check your API key.');
      return;
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant analyzing a conversation between two people.'
          },
          {
            role: 'user',
            content: `First person: ${firstPersonText}\nSecond person: ${secondPersonText}`
          }
        ],
      });

      setChatGPTResponse(response.choices[0].message.content || '');
      setError('');
    } catch (error: any) {
      console.error('Error sending to ChatGPT:', error);
      setError(`Error getting response from ChatGPT: ${error.message || 'Please check your API key and try again.'}`);
    }
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      if (firstStreamRef.current) {
        firstStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (secondStreamRef.current) {
        secondStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center dark:text-white">U&Me - AI Mediator</h1>
      <p className="text-lg text-center text-gray-700 dark:text-gray-300">
        A tool for two people to communicate and come to a mutual understanding.
        Record a conversation and get a generated response based on the conversation.
      </p>
      <br></br>

      {error && (
        <div className="mb-8 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold dark:text-white">First Person</h2>
          <button
            onClick={() => toggleRecording('first')}
            className={`w-full p-3 rounded-lg ${
              isRecordingFirst 
                ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700' 
                : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
            } text-white transition-colors`}
            disabled={isRecordingSecond}
          >
            {isRecordingFirst ? 'Stop Recording' : 'Start Recording'}
          </button>
          <textarea
            value={firstPersonText}
            onChange={(e) => setFirstPersonText(e.target.value)}
            className="w-full h-40 p-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
            placeholder="First person's text will appear here..."
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold dark:text-white">Second Person</h2>
          <button
            onClick={() => toggleRecording('second')}
            className={`w-full p-3 rounded-lg ${
              isRecordingSecond 
                ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700' 
                : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
            } text-white transition-colors`}
            disabled={isRecordingFirst}
          >
            {isRecordingSecond ? 'Stop Recording' : 'Start Recording'}
          </button>
          <textarea
            value={secondPersonText}
            onChange={(e) => setSecondPersonText(e.target.value)}
            className="w-full h-40 p-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
            placeholder="Second person's text will appear here..."
          />
        </div>
      </div>

      <div className="text-center mb-8">
        <button
          onClick={sendToChatGPT}
          className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-8 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!firstPersonText || !secondPersonText}
        >
          Analyze Conversation
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold dark:text-white">ChatGPT Analysis</h2>
        <textarea
          value={chatGPTResponse}
          readOnly
          className="w-full h-48 p-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
          placeholder="ChatGPT's analysis will appear here..."
        />
      </div>
    </main>
  );
}
