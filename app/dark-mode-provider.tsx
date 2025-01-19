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
  const [founderMode, setFounderMode] = useState(false);

  useEffect(() => {
    // Check if user has dark mode preference
    if (typeof window !== 'undefined') {
      const isDark = localStorage.getItem('darkMode') === 'true' ||
        (!('darkMode' in localStorage) && 
          window.matchMedia('(prefers-color-scheme: dark)').matches);
      console.log('Initial dark mode value:', isDark);
      setDarkMode(isDark);
      
      // Check if user has Greg mode preference
      const isGreg = localStorage.getItem('gregMode') === 'true';
      setGregMode(isGreg);
    }
  }, []);

  useEffect(() => {
    console.log('Dark mode state changed to:', darkMode);
    if (darkMode) {
      console.log('Adding dark class to html element');
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      console.log('Removing dark class from html element');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
    console.log('Current html classes:', document.documentElement.className);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('gregMode', gregMode.toString());
  }, [gregMode]);

  useEffect(() => {
    localStorage.setItem('founderMode', founderMode.toString());
  }, [founderMode]);

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <SideMenu
          darkMode={darkMode}
          gregMode={gregMode}
          founderMode={founderMode}
          onDarkModeToggle={() => {
            console.log('Dark mode toggle callback called');
            setDarkMode(!darkMode);
          }}
          onGregModeToggle={() => setGregMode(!gregMode)}
          onFounderModeToggle={() => setFounderMode(!founderMode)}
        />
        {children}
      </div>
    </>
  );
}
