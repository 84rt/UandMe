'use client';

import { useState } from 'react';

interface SideMenuProps {
  darkMode: boolean;
  gregMode: boolean;
  founderMode: boolean;
  onDarkModeToggle: () => void;
  onGregModeToggle: () => void;
  onFounderModeToggle: () => void;
}

export function SideMenu({ darkMode, gregMode, founderMode, onDarkModeToggle, onGregModeToggle, onFounderModeToggle }: SideMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed right-0 top-0 h-full z-50">
      {/* Menu Button - Now outside the sliding panel */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-4 right-4 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors z-50`}
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6 text-gray-700 dark:text-gray-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Menu Content */}
      <div
        className={`fixed right-0 top-0 h-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${
          isOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="pt-16 px-4">
          <div className="space-y-4">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-200">Dark Mode</span>
              <button
                onClick={() => {
                  console.log('Dark mode toggle clicked. Current darkMode:', darkMode);
                  onDarkModeToggle();
                }}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Founder Mode Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-200">Founder Mode</span>
              <button
                onClick={onFounderModeToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  founderMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    founderMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {/* Gert Mode Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-200">Gert Mode</span>
              <button
                onClick={onGregModeToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  gregMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    gregMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
