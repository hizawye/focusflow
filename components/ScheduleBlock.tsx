import React from 'react';
import { ScheduleItem } from '../types.ts';

interface ScheduleBlockProps {
    item: ScheduleItem;
    isActive: boolean;
    isCompleted: boolean;
    onToggleComplete: () => void;
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
    </svg>
);


export const ScheduleBlock: React.FC<ScheduleBlockProps> = ({ item, isActive, isCompleted, onToggleComplete }) => {
    const baseClasses = "flex items-center p-4 rounded-lg shadow-sm transition-all duration-300";
    const statusClasses = isActive
        ? 'bg-primary-500 text-white shadow-lg ring-2 ring-primary-300'
        : isCompleted
        ? 'bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-500'
        : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700';

    return (
        <div className={`${baseClasses} ${statusClasses}`}>
            <div className="flex-grow">
                <h3 className={`font-bold text-lg ${isCompleted ? 'line-through' : ''}`}>{item.title}</h3>
                <p className={`text-sm ${isActive ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {item.start} – {item.end}
                </p>
            </div>
            <button
                onClick={onToggleComplete}
                aria-label={`Mark ${item.title} as ${isCompleted ? 'incomplete' : 'complete'}`}
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-primary-500 ${
                    isCompleted ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-400'
                }`}
            >
                {isCompleted && <CheckIcon />}
            </button>
        </div>
    );
};