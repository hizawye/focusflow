
import React from 'react';

interface TimerDisplayProps {
    timeLeft: number;
    taskName: string | null;
    timeUntilNextBlock: number;
}

const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft, taskName, timeUntilNextBlock }) => {
    const isBreak = taskName?.toLowerCase().includes('break') || taskName?.toLowerCase().includes('down');

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center mb-8">
            {taskName ? (
                 <>
                    <p className="text-sm font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                        {isBreak ? "Next Up After Break" : "Current Task"}
                    </p>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1 mb-2">{taskName}</h2>
                    <div className="text-5xl font-mono font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg py-2 px-4 inline-block">
                        {formatTime(timeLeft)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Time remaining in block</p>
                 </>
            ) : timeUntilNextBlock > 0 ? (
                <>
                    <p className="text-sm font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                        Schedule Starts Soon
                    </p>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1 mb-2">Day hasn't started</h2>
                    <div className="text-5xl font-mono font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg py-2 px-4 inline-block">
                        {formatTime(timeUntilNextBlock)}
                    </div>
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">until first task</p>
                </>
            ) : (
                 <>
                    <p className="text-sm font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                        All Done!
                    </p>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1 mb-2">Day Complete</h2>
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Great work today!</p>
                </>
            )}

        </div>
    );
};
