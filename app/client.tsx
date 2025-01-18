'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const DynamicRecorder = dynamic(
  () => import('../components/RecorderComponent'),
  { ssr: false }
);

export default function ClientRoot() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <DynamicRecorder />;
}
