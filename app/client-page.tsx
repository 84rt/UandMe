'use client';

import { RecorderComponent } from '../components/RecorderComponent';
import { Analytics } from '@vercel/analytics/react';

export default function ClientPage() {
  return (
    <main className="min-h-screen p-8">
      <Analytics />
      <RecorderComponent />
    </main>
  );
}
