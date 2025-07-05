import React from 'react';

// App header component
export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex items-center gap-4">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex-1">FocusFlow</h1>
      <span className="hidden md:inline text-md text-gray-600 dark:text-gray-400">Your daily command center</span>
    </header>
  );
}
