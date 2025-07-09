import { useEffect, useRef } from 'react';
import { TaskDetailsPanel } from './TaskDetailsPanel';
import { TaskAddButton } from './TaskAddButton';

// RightAside: The right details pane for desktop view
export function TaskDetailsSidebar({
  totalMinutes,
  totalTasks,
  completedTasks,
  notCompletedTasks,
  selectedTask,
  setSelectedTaskIdx,
  handleSidebarAdd,
  handleDeleteTask = () => {},
  handleUpdateTask = () => {}
}: any) {
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSelectedTaskIdx(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setSelectedTaskIdx]);

  return (
    <aside
      ref={sidebarRef}
      tabIndex={-1}
      className="hidden md:flex flex-col w-[28rem] min-w-[28rem] max-w-[28rem] bg-white/80 dark:bg-gray-900/80 border-l border-gray-200 dark:border-gray-800 p-6 relative focus:outline-none"
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
        <TaskDetailsPanel
            task={selectedTask}
            onDelete={() => handleDeleteTask(selectedTask.title)}
            onUpdate={handleUpdateTask}
            onClose={() => setSelectedTaskIdx(null)}
            hideClose={true}
        />
      ) : (
        <div className="text-gray-500 dark:text-gray-400 text-center mt-20">
          <span className="text-lg">click a task to see details</span>
        </div>
      )}
      {/* Gemini controls at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 w-full bg-white/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-800 p-4 z-40 flex flex-col gap-2"
        style={{ boxShadow: "0 -2px 16px 0 rgba(0,0,0,0.04)" }}>
        {/* Add Task button */}
        <div className="flex flex-row gap-2 w-full mb-2">
          <TaskAddButton onClick={handleSidebarAdd} variant="inline" />
        </div>
      </div>
    </aside>
  );
}