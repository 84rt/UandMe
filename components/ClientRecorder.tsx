'use client';

import dynamic from 'next/dynamic';

// Import RecorderComponent with no SSR
const RecorderComponent = dynamic(
  () => import('./RecorderComponent'),
  { 
    ssr: false,
    loading: () => (
      <div className="max-w-4xl mx-auto p-8">
        <p className="text-center text-gray-600">Loading recorder...</p>
      </div>
    )
  }
);

export default function ClientRecorder() {
  return <RecorderComponent />;
}
