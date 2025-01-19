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
  const [firstPersonName, setFirstPersonName] = useState('');
  const [secondPersonName, setSecondPersonName] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [status, setStatus] = useState<'idle' | 'recording' | 'transcribing' | 'generating'>('idle');

  // Refs to store MediaRecorder instances
  const firstRecorderRef = useRef<MediaRecorder | null>(null);
  const secondRecorderRef = useRef<MediaRecorder | null>(null);
  const firstStreamRef = useRef<MediaStream | null>(null);
  const secondStreamRef = useRef<MediaStream | null>(null);

  // Add background animation effect
  const [bgOpacity, setBgOpacity] = useState(0);

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

  useEffect(() => {
    setBgOpacity(1);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      setStatus('transcribing');
      await stopRecording(person);
      return;
    }

    try {
      setStatus('recording');
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
          setStatus('idle');
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
      setStatus('generating');
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: localStorage.getItem('gregMode') === 'true' 
              ? `You will be provided with two sides of the argument between ${firstPersonName} and ${secondPersonName}. Explain in detail why Gert is right and argue his side.`
              : `
You are tasked with creating a short and coherent breakdown of two sides of an argument. Your goal is to present both perspectives fairly and neutrally while highlighting potential areas for resolution. Follow these steps carefully:

1. You will be provided with two sides of the argument between ${firstPersonName} and ${secondPersonName}.

2. Read through both ${firstPersonName} and ${secondPersonName} arguments carefully, identifying the key points, concerns, and goals of each side.

3. For each side, create a brief summary that captures:
   - Main arguments
   - Core concerns
   - Desired outcomes

4. Identify any common ground or shared goals between the two sides.

5. Create a balanced summary of the argument, ensuring:
   - Equal representation of both sides
   - Use of neutral, non-judgmental language
   - Respectful presentation of each side's perspective
   - Highlight of any potential areas for compromise or mutual understanding

6. Suggest possible steps forward or areas where both sides could work together towards a resolution.

7. Present your summary in the following format:
   
   <b> 1. Summary of ${firstPersonName}'s argument, concerns, and goals </b>
  
   <b> 2. Summary of ${secondPersonName}'s argument, concerns, and goals</b>

   <b> 3. Any shared goals or areas of agreement identified</b>

   <b> 4. Suggestions for steps forward or areas of possible compromise</b>


Remember to maintain neutrality throughout your summary, use empathetic language, and focus on problem-solving rather than assigning blame or judgment. Your goal is to provide a clear, unbiased overview of the situation that could potentially help both sides move towards a resolution.`
          },
          {
            role: 'user',
            content: `${firstPersonName}: ${firstPersonText}\n${secondPersonName}: ${secondPersonText}`
          }
        ],
      });

      setChatGPTResponse(response.choices[0].message.content || '');
      setError('');
      setStatus('idle');
    } catch (error: any) {
      console.error('Error sending to ChatGPT:', error);
      setError(`Error getting response from ChatGPT: ${error.message || 'Please check your API key and try again.'}`);
    }
  };

  const handleFirstNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFirstPersonName(event.target.value);
  };

  const handleSecondNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSecondPersonName(event.target.value);
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
    <div className="min-h-screen relative">
      {/* Animated background */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out -z-10"
        style={{
          backgroundImage: 'url(/public/gb.jpg)',
          opacity: bgOpacity
        }}
      />
      <div className="relative z-10">
        <main className="min-h-screen p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center dark:text-white">U&Me - Your AI Mediator</h1>
          <h4 className="text-2xl font-semibold mb-4 dark:text-white">
            Use AI to mediate a conversation and come to a mutual understanding.
          </h4>
          <p className="text-lg text-center text-gray-700 dark:text-gray-300">
            Start by recording your side of the disagreement, and when you are done, pass the phone to the other person. 
            Once both of you have recorded your responses, click 'Generate Mediation' to obtain an objective and unbiased overview of the disagreement.
          </p>
          <br></br>

          {error && (
            <div className="mb-8 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg">
              {error}
            </div>
          )}
          <div className="text-center mb-8">
            <div className="mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">Status: </span>
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                status === 'idle' ? 'bg-gray-300 dark:bg-gray-500' :
                status === 'recording' ? 'bg-red-300 dark:bg-red-800 animate-pulse' :
                status === 'transcribing' ? 'bg-yellow-300 dark:bg-yellow-800' :
                'bg-blue-300 dark:bg-blue-800'
              }`}>
                {status === 'idle' ? 'Ready' :
                 status === 'recording' ? 'Recording...' :
                 status === 'transcribing' ? 'Transcribing...' :
                 'Generating Response...'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold dark:text-white">First Person</h2>
              <input 
                type="text" 
                placeholder="Enter First Person's Name" 
                value={firstPersonName} 
                onChange={handleFirstNameChange} 
                className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
              />
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
              <input 
                type="text" 
                placeholder="Enter Second Person's Name" 
                value={secondPersonName} 
                onChange={handleSecondNameChange} 
                className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
              />
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
              disabled={!firstPersonText || !secondPersonText || status === 'generating'}
            >
              Generate Mediation
            </button>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold dark:text-white">AI Mediation Analysis</h2>
            <div
              className="w-full p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: chatGPTResponse }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
