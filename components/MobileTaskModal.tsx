import React from 'react';
import { RightTaskDetails } from './RightTaskDetails';

// Mobile modal for task details
export function MobileTaskModal({ selectedTask, setSelectedTaskIdx, setSchedule, selectedTaskIdx }: any) {
  if (!selectedTask) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end md:hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedTaskIdx(null)}></div>
      {/* Modal */}
      <div className="relative w-full max-w-none h-[65vh] bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl px-4 pt-4 pb-8 flex flex-col overflow-y-auto animate-slideUp z-10" style={{ minWidth: 0 }}>
        {/* Drag handle */}
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-3 mt-1"></div>
        <button
          className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center z-20"
          onClick={() => setSelectedTaskIdx(null)}
          aria-label="Close details"
        >
          ×
        </button>
        <div className="mt-4 mb-2 w-full" style={{ minWidth: 0 }}>
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
            mobile
            hideClose
          />
        </div>
      </div>
    </div>
  );
}
