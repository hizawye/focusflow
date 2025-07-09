import React, { useState } from 'react';
import type { ScheduleItem as ScheduleItemType } from '../types.ts';
import { ChevronDown, ChevronUp, Play, Pause, Square } from 'lucide-react';

interface ScheduleItemProps {
    item: ScheduleItemType;
    isActive: boolean;
    isCompleted: boolean;
    onSubTaskToggle: (subIdx: number) => void;
    onStart: () => void;
    onStop: () => void;
    onPause?: () => void;
    onResume?: () => void;
    onSelect?: () => void;
}

const ICONS: Record<string, React.ReactNode> = {
    brain: <span role="img" aria-label="Deep Work">🧠</span>,
    coffee: <span role="img" aria-label="Break">☕</span>,
    book: <span role="img" aria-label="Study">📚</span>,
    check: <span role="img" aria-label="General">✅</span>,
    // Add more as needed
};

export const ScheduleItem: React.FC<ScheduleItemProps> = ({ item, isActive, isCompleted, onSubTaskToggle, onStart, onStop, onPause, onResume, onSelect }) => {
    const [expanded, setExpanded] = useState(false);
    const icon = item.icon && ICONS[item.icon] ? ICONS[item.icon] : ICONS['check'];
    const subtasks = item.subtasks || [];
    const completedCount = subtasks.filter(t => t.completed).length;
    const progress = subtasks.length > 0 ? `${completedCount}/${subtasks.length}` : null;

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
    };

    const handleMainClick = (e: React.MouseEvent) => {
        // Don't trigger selection if clicking on interactive elements
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
            return;
        }
        
        // Stop event propagation to prevent outside click handler
        e.stopPropagation();
        
        // Expand/collapse subtasks
        setExpanded(prev => !prev);
        
        // Trigger selection for sidebar - this will keep the panel open if same task is clicked
        if (onSelect) {
            onSelect();
        }
    };

    const handleStartStop = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        e.preventDefault();
        action();
    };

    return (
        <div 
            className={`rounded-xl shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 mb-2 schedule-item \
            ${isActive ? 'ring-2 ring-primary-400 bg-primary-50 dark:bg-primary-900/30' : ''} \
            ${isCompleted ? 'bg-gray-200 dark:bg-gray-800 opacity-60 grayscale text-gray-400' : 'bg-white dark:bg-gray-800'} \
            ${item.isRunning && !item.isPaused ? 'ring-2 ring-green-400 bg-green-50 dark:bg-green-900/30 animate-pulse' : ''} \
            ${item.isPaused ? 'ring-2 ring-yellow-400 bg-yellow-50 dark:bg-yellow-900/30' : ''}`}
            data-task-item
        >
            <div className="flex items-center p-4 cursor-pointer" onClick={handleMainClick}>
                <div className={`mr-3 text-2xl ${item.isRunning && !item.isPaused ? 'animate-bounce' : ''} ${item.isPaused ? 'animate-pulse' : ''}`}>
                    {icon}
                </div>
                <div className="flex-grow">
                    <div className="flex items-center gap-2">
                        <h3 className={`font-bold text-lg ${isCompleted ? 'line-through' : ''} ${item.isRunning && !item.isPaused ? 'text-green-600 dark:text-green-400' : ''} ${item.isPaused ? 'text-yellow-600 dark:text-yellow-400' : ''}`}>
                            {item.title}
                        </h3>
                        {progress && <span className="text-xs bg-gray-200 dark:bg-gray-700 rounded px-2 py-0.5 font-semibold">{progress}</span>}
                        {isActive && <span className="ml-2 text-xs bg-primary-600 text-white rounded px-2 py-0.5">Now</span>}
                        {item.isRunning && !item.isPaused && <span className="ml-2 text-xs bg-green-600 text-white rounded px-2 py-0.5 animate-pulse">Running</span>}
                        {item.isPaused && <span className="ml-2 text-xs bg-yellow-600 text-white rounded px-2 py-0.5">Paused</span>}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.start} – {item.end}</p>
                    {item.remainingDuration !== undefined && (
                        <>
                            <p className={`text-sm font-mono ${item.isRunning && !item.isPaused ? 'text-green-600 dark:text-green-400 font-bold' : ''} ${item.isPaused ? 'text-yellow-600 dark:text-yellow-400 font-bold' : 'text-gray-600 dark:text-gray-300'}`}>
                                Time left: {formatDuration(item.remainingDuration)}
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                                <div 
                                    className={`h-2.5 rounded-full transition-all duration-1000 ${item.isRunning && !item.isPaused ? 'bg-green-500 animate-pulse' : ''} ${item.isPaused ? 'bg-yellow-500' : 'bg-blue-600'}`}
                                    style={{ width: `${(item.remainingDuration / ((new Date(`1970-01-01T${item.end}:00Z`).getTime() - new Date(`1970-01-01T${item.start}:00Z`).getTime()) / 1000)) * 100}%` }}
                                ></div>
                            </div>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2 ml-2">
                    {/* Timer Controls */}
                    {!item.isRunning && !item.isPaused ? (
                        // Start button
                        <button onClick={(e) => handleStartStop(e, onStart)} className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors">
                            <Play size={16} />
                        </button>
                    ) : item.isRunning && !item.isPaused ? (
                        // Running state - show pause and stop buttons
                        <div className="flex gap-1">
                            <button onClick={(e) => handleStartStop(e, onPause || (() => {}))} className="p-2 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition-colors">
                                <Pause size={16} />
                            </button>
                            <button onClick={(e) => handleStartStop(e, onStop)} className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors animate-pulse">
                                <Square size={16} />
                            </button>
                        </div>
                    ) : item.isPaused ? (
                        // Paused state - show resume and stop buttons
                        <div className="flex gap-1">
                            <button onClick={(e) => handleStartStop(e, onResume || (() => {}))} className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                                <Play size={16} />
                            </button>
                            <button onClick={(e) => handleStartStop(e, onStop)} className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">
                                <Square size={16} />
                            </button>
                        </div>
                    ) : null}
                    
                    {/* Subtask toggle */}
                    {subtasks.length > 0 && (
                        <button
                            className="text-gray-400 hover:text-primary-500"
                            aria-label={expanded ? 'Collapse' : 'Expand'}
                            onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
                        >
                            {expanded ? <ChevronUp /> : <ChevronDown />}
                        </button>
                    )}
                </div>
            </div>
            {expanded && subtasks.length > 0 && (
                <div className="px-6 pb-4">
                    <ul className="space-y-2">
                        {subtasks.map((sub, subIdx) => (
                            <li key={sub.id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={sub.completed}
                                    onChange={e => { e.stopPropagation(); onSubTaskToggle(subIdx); }}
                                    className="accent-primary-500 w-4 h-4 rounded"
                                />
                                <span className={sub.completed ? 'line-through text-gray-400' : ''}>{sub.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};