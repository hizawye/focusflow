import React from 'react';
import { RightTaskDetails } from './RightTaskDetails';
import { AddTaskButton } from './AddTaskButton';

// RightAside: The right details pane for desktop view
export function RightAside({
  totalMinutes,
  totalTasks,
  completedTasks,
  notCompletedTasks,
  selectedTask,
  setSchedule,
  setSelectedTaskIdx,
  selectedTaskIdx,
  handleSidebarAdd,
  showGeminiInput,
  setShowGeminiInput,
  aiMessage,
  setAiMessage,
  aiLoading,
  handleGeminiMessageSubmit
}: any) {
  return (
    <aside
      tabIndex={-1}
      className="md:flex flex-col w-[28rem] min-w-[28rem] max-w-[28rem] bg-white/80 dark:bg-gray-900/80 border-l border-gray-200 dark:border-gray-800 p-6 relative focus:outline-none"
      style={{ paddingBottom: '140px' }}
    >
      {/* Stats summary */}
      <div className="mb-4 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800 text-sm">
        <div className="font-bold mb-1">Today's Stats</div>
        <div>Total scheduled: <span className="font-semibold">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</span></div>
        <div>Tasks: <span className="font-semibold">{totalTasks}</span></div>
        <div>Completed: <span className="font-semibold text-green-600">{completedTasks}</span></div>
        <div>Not completed: <span className="font-semibold text-red-600">{notCompletedTasks}</span></div>
      </div>
      {/* Task details or placeholder */}
      {selectedTask ? (
        <RightTaskDetails
          task={selectedTask}
          onDelete={() => {
            setSchedule((schedule: any) => schedule.filter((_: any, i: number) => i !== selectedTaskIdx));
            setSelectedTaskIdx(null);
          }}
          onUpdate={(updated: any) => {
            setSchedule((schedule: any) => schedule.map((t: any, i: number) => i === selectedTaskIdx ? updated : t));
          }}
          onClose={() => setSelectedTaskIdx(null)}
        />
      ) : (
        <div className="text-gray-500 dark:text-gray-400 text-center mt-20">
          <span className="text-lg">click a task to see details</span>
        </div>
      )}
      {/* Gemini controls at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 w-full bg-white/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-800 p-4 z-40 flex flex-col gap-2"
        style={{ boxShadow: "0 -2px 16px 0 rgba(0,0,0,0.04)" }}>
        {/* Add Task and Gemini button row */}
        <div className="flex flex-row gap-2 w-full mb-2">
          <AddTaskButton onClick={handleSidebarAdd} variant="inline" />
          {!showGeminiInput && (
            <button
              className="flex-1 max-w-full bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 text-lg font-semibold hover:from-blue-600 hover:to-green-600 transition focus:outline-none focus:ring-4 focus:ring-blue-300 z-30"
              onClick={() => setShowGeminiInput(true)}
              aria-label="Generate with Gemini"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Generate with Gemini
            </button>
          )}
        </div>
        {/* Gemini input form */}
        <form onSubmit={handleGeminiMessageSubmit} className="w-full bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900 border-t border-gray-200 dark:border-gray-800 flex gap-2 z-20 shadow-xl rounded-b-lg p-2">
          <input
            type="text"
            className="flex-1 rounded-full border px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-sm"
            placeholder="Ask Gemini to add, edit, or remove tasks... (e.g. 'Add Trading 21:00-00:00')"
            value={aiMessage}
            onChange={e => setAiMessage(e.target.value)}
            disabled={aiLoading}
            autoComplete="off"
          />
          <button
            type="submit"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-green-500 text-white px-5 py-2 rounded-full shadow hover:from-blue-600 hover:to-green-600 transition disabled:opacity-50 font-semibold text-base min-w-0 max-w-full overflow-hidden"
            disabled={aiLoading || !aiMessage.trim()}
          >
            {aiLoading ? (
              <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full flex-shrink-0"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
            <span className="truncate">{aiLoading ? 'Sending...' : 'Send'}</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
