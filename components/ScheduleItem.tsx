import React, { useState } from 'react';
import type { ScheduleItem } from '../types.ts';
import { ChevronDown, ChevronUp, Play, Pause } from 'lucide-react';

interface ScheduleItemProps {
    item: ScheduleItem;
    isActive: boolean;
    isCompleted: boolean;
    onSubTaskToggle: (subIdx: number) => void;
    onStart: () => void;
    onStop: () => void;
    onSelect?: () => void;
}

const ICONS: Record<string, React.ReactNode> = {
    brain: <span role="img" aria-label="Deep Work">🧠</span>,
    coffee: <span role="img" aria-label="Break">☕</span>,
    book: <span role="img" aria-label="Study">📚</span>,
    check: <span role="img" aria-label="General">✅</span>,
    // Add more as needed
};

export const ScheduleItem: React.FC<ScheduleItemProps> = ({ item, isActive, isCompleted, onSubTaskToggle, onStart, onStop, onSelect }) => {
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
        
        // Expand/collapse subtasks
        setExpanded(prev => !prev);
        
        // Trigger selection for sidebar - this will keep the panel open if same task is clicked
        if (onSelect) {
            onSelect();
        }
    };

    const handleStartStop = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    return (
        <div className={`rounded-xl shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 mb-2 \
            ${isActive ? 'ring-2 ring-primary-400 bg-primary-50 dark:bg-primary-900/30' : ''} \
            ${isCompleted ? 'bg-gray-200 dark:bg-gray-800 opacity-60 grayscale text-gray-400' : 'bg-white dark:bg-gray-800'}`}
        >
            <div className="flex items-center p-4 cursor-pointer" onClick={handleMainClick}>
                <div className={`mr-3 text-2xl`}>
                    {icon}
                </div>
                <div className="flex-grow">
                    <div className="flex items-center gap-2">
                        <h3 className={`font-bold text-lg ${isCompleted ? 'line-through' : ''}`}>{item.title}</h3>
                        {progress && <span className="text-xs bg-gray-200 dark:bg-gray-700 rounded px-2 py-0.5 font-semibold">{progress}</span>}
                        {isActive && <span className="ml-2 text-xs bg-primary-600 text-white rounded px-2 py-0.5">Now</span>}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.start} – {item.end}</p>
                    {item.remainingDuration !== undefined && (
                        <>
                            <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">Time left: {formatDuration(item.remainingDuration)}</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(item.remainingDuration / ((new Date(`1970-01-01T${item.end}:00Z`).getTime() - new Date(`1970-01-01T${item.start}:00Z`).getTime()) / 1000)) * 100}%` }}></div>
                            </div>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2 ml-2">
                    {!item.isRunning ? (
                        <button onClick={(e) => handleStartStop(e, onStart)} className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600">
                            <Play size={16} />
                        </button>
                    ) : (
                        <button onClick={(e) => handleStartStop(e, onStop)} className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600">
                            <Pause size={16} />
                        </button>
                    )}
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