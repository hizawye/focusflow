import React from 'react';

// AddTaskButton: Floating or inline add button
export function TaskAddButton({ onClick, onAiClick, variant = 'floating' }: { onClick: () => void, onAiClick?: () => void, variant?: 'floating' | 'inline' }) {
  if (variant === 'inline') {
    return (
      <div className="flex gap-2">
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
        {onAiClick && (
          <button
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg text-lg font-semibold hover:from-indigo-600 hover:to-indigo-700 transition focus:outline-none focus:ring-4 focus:ring-indigo-300"
            onClick={onAiClick}
            aria-label="Use AI"
            type="button"
          >
            <span role="img" aria-label="AI" className="text-2xl">🤖</span>
            Use AI
          </button>
        )}
      </div>
    );
  }
  // Default: floating circle
  return (
    <div className="flex gap-4" style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)' }}>
      <button
        className="mt-8 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg w-12 h-12 flex items-center justify-center text-3xl transition-transform transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary-300"
        onClick={onClick}
        aria-label="Add Block"
        title="Add Block"
      >
        <span className="sr-only">Add Task</span>
        +
      </button>
      {onAiClick && (
        <button
          className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg w-12 h-12 flex items-center justify-center transition-transform transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-indigo-300"
          onClick={onAiClick}
          aria-label="Use AI"
          title="Use AI"
        >
          <span role="img" aria-label="AI" className="text-2xl">🤖</span>
        </button>
      )}
    </div>
  );
}
