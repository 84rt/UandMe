'use client';

import dynamic from 'next/dynamic';

const DynamicRecorder = dynamic(
  () => import('../components/RecorderComponent'),
  { 
    ssr: false,
    loading: () => (
      <div className="max-w-4xl mx-auto p-8">
        <p className="text-center text-gray-600">Loading recorder...</p>
      </div>
    ),
  }
);

export default function RecorderPage() {
  return <DynamicRecorder />;
}
