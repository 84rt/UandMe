'use client';

import { useEffect, useState } from 'react';
import { SideMenu } from './components/side-menu';

export function DarkModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(false);
  const [gregMode, setGregMode] = useState(false);

  useEffect(() => {
    // Check if user has dark mode preference
    if (typeof window !== 'undefined') {
      const isDark = localStorage.getItem('darkMode') === 'true' ||
        (!('darkMode' in localStorage) && 
          window.matchMedia('(prefers-color-scheme: dark)').matches);
      setDarkMode(isDark);
      
      // Check if user has Greg mode preference
      const isGreg = localStorage.getItem('gregMode') === 'true';
      setGregMode(isGreg);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('gregMode', gregMode.toString());
  }, [gregMode]);

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <SideMenu
          darkMode={darkMode}
          gregMode={gregMode}
          onDarkModeToggle={() => setDarkMode(!darkMode)}
          onGregModeToggle={() => setGregMode(!gregMode)}
        />
        {children}
      </div>
    </div>
  );
}
