import React, { useState } from 'react';
import { ScheduleItem } from '../types.ts';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ScheduleBlockProps {
    item: ScheduleItem;
    isActive: boolean;
    isCompleted: boolean;
    onSubTaskToggle: (subIdx: number) => void;
}

const ICONS: Record<string, React.ReactNode> = {
    brain: <span role="img" aria-label="Deep Work">🧠</span>,
    coffee: <span role="img" aria-label="Break">☕</span>,
    book: <span role="img" aria-label="Study">📚</span>,
    check: <span role="img" aria-label="General">✅</span>,
    // Add more as needed
};

export const ScheduleBlock: React.FC<ScheduleBlockProps> = ({ item, isActive, isCompleted, onSubTaskToggle }) => {
    const [expanded, setExpanded] = useState(false);
    const color = item.color || 'primary-500';
    const icon = item.icon && ICONS[item.icon] ? ICONS[item.icon] : ICONS['check'];
    const subtasks = item.subtasks || [];
    const completedCount = subtasks.filter(t => t.completed).length;
    const progress = subtasks.length > 0 ? `${completedCount}/${subtasks.length}` : null;

    return (
        <div className={`rounded-xl shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 mb-2 ${isActive ? 'ring-2 ring-primary-400 bg-primary-50 dark:bg-primary-900/30' : 'bg-white dark:bg-gray-800'}`}>
            <div className="flex items-center p-4 cursor-pointer" onClick={() => setExpanded(e => !e)}>
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
                </div>
                {subtasks.length > 0 && (
                    <button
                        className="ml-2 text-gray-400 hover:text-primary-500"
                        aria-label={expanded ? 'Collapse' : 'Expand'}
                        onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
                    >
                        {expanded ? <ChevronUp /> : <ChevronDown />}
                    </button>
                )}
            </div>
            {/* Only show subtasks if expanded (peek), not just because selected */}
            {expanded && subtasks.length > 0 && (
                <div className="px-6 pb-4">
                    <ul className="space-y-2">
                        {subtasks.map((sub, subIdx) => (
                            <li key={sub.id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={sub.completed}
                                    onChange={() => onSubTaskToggle(subIdx)}
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