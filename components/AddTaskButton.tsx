import React from 'react';

// AddTaskButton: Floating or inline add button
export function AddTaskButton({ onClick, variant = 'floating' }: { onClick: () => void, variant?: 'floating' | 'inline' }) {
  if (variant === 'inline') {
    return (
      <button
        className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl shadow-lg text-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition focus:outline-none focus:ring-4 focus:ring-primary-300"
        onClick={onClick}
        aria-label="Add Block"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Task
      </button>
    );
  }
  // Default: floating circle
  return (
    <button
      className="mt-8 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg w-12 h-12 flex items-center justify-center text-3xl transition-transform transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary-300"
      onClick={onClick}
      aria-label="Add Block"
      title="Add Block"
      style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)' }}
    >
      <span className="sr-only">Add Task</span>
      +
    </button>
  );
}
