import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ScheduleItem, CompletionStatus, View } from './types.ts';
import { DEFAULT_SCHEDULE } from './constants.ts';
import { useSchedule } from './hooks/useSchedule.ts';
import { TimerDisplay } from './components/TimerDisplay.tsx';
import { StatsView } from './components/StatsView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { PieChart, Calendar, Settings, PlayCircle } from 'lucide-react';
import { ScheduleEditor } from './components/ScheduleEditor.tsx';
import { RightTaskDetails } from './components/RightTaskDetails.tsx';

const usePersistentState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
        try {
            const storedValue = localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : defaultValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, state]);

    return [state, setState];
};

export default function App() {
    const rightPaneRef = useRef<HTMLDivElement | null>(null);
    const scheduleEditorRef = useRef<any>(null);

    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 10000); // update every 10s
        return () => clearInterval(interval);
    }, []);

    const [view, setView] = usePersistentState<View>('app-view', 'schedule');
    const [isDarkMode, setIsDarkMode] = usePersistentState<boolean>('app-dark-mode', false);
    const [isAlarmEnabled, setIsAlarmEnabled] = usePersistentState<boolean>('app-alarm-enabled', true);
    
    // Persist userInteracted state so welcome popup only shows once
    const [userInteracted, setUserInteracted] = usePersistentState<boolean>('app-user-interacted', false);

    // Replace static DAILY_BLOCKS with persistent, user-editable schedule
    // Load schedule from localStorage, or use defaultSchedule, or blank
    const [schedule, setSchedule] = usePersistentState<ScheduleItem[]>(
        'app-schedule',
        DEFAULT_SCHEDULE
    );

    // --- COMPLETION LOGIC ---
    // A block is complete if now > block.end
    const getBlockEndDate = (block: ScheduleItem) => {
        const [h, m] = block.end.split(":").map(Number);
        const d = new Date(now);
        d.setHours(h, m, 0, 0);
        return d;
    };
    const completionStatus: CompletionStatus = useMemo(() => {
        const status: CompletionStatus = {};
        schedule.forEach(block => {
            // Use manualStatus if set, otherwise fallback to time-based
            if (block.manualStatus === 'done') status[block.title] = true;
            else if (block.manualStatus === 'missed') status[block.title] = false;
            else status[block.title] = now > getBlockEndDate(block);
        });
        return status;
    }, [schedule, now]);

    // ---

    const { currentBlock, timeLeft, timeUntilNextBlock, completedBlocks } = useSchedule(schedule);
    
    const alarmSound = useMemo(() => 
        typeof Audio !== 'undefined' ? new Audio('https://cdn.freesound.org/previews/411/411132_5121236-lq.mp3') : null,
    []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
        document.body.classList.toggle('dark:bg-gray-900', isDarkMode);
    }, [isDarkMode]);

    useEffect(() => {
      // Only play sound if user has interacted, alarms are enabled, and there's a current block.
      if (isAlarmEnabled && currentBlock && userInteracted) {
        alarmSound?.play().catch(e => console.error("Error playing sound:", e));
      }
    }, [currentBlock?.title, isAlarmEnabled, userInteracted, alarmSound]);

    const handleInteraction = () => {
        // This is the key: unlock audio playback by playing a sound in a user-initiated event.
        // We play and immediately pause so the user doesn't hear it now, but this allows future plays.
        if (alarmSound) {
            alarmSound.play().then(() => {
                alarmSound.pause();
                alarmSound.currentTime = 0;
            }).catch(e => {
                console.info("Audio context could not be initialized on interaction:", e);
            });
        }
        setUserInteracted(true);
    };

    // Import schedule from JSON file
    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target?.result as string);
                if (Array.isArray(imported)) {
                    setSchedule(imported);
                }
            } catch (err) {
                alert('Invalid schedule file.');
            }
        };
        reader.readAsText(file);
    };

    // Export schedule to JSON file (without progress)
    const handleExport = () => {
        const exportData = schedule.map(({subtasks, ...rest}) => ({
            ...rest,
            ...(subtasks ? {subtasks: subtasks.map(({completed, ...s}) => ({...s}))} : {})
        }));
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my_schedule.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    // Start with blank schedule
    const handleStartBlank = () => {
        if (window.confirm('Start with a blank schedule? This will erase your current schedule.')) {
            setSchedule([]);
        }
    };

    // Handler to toggle subtask completion
    const handleSubTaskToggle = (blockIdx: number, subIdx: number) => {
        setSchedule(prev => {
            const updated = prev.map((block, i) => {
                if (i !== blockIdx) return block;
                if (!block.subtasks) return block;
                const newSubtasks = block.subtasks.map((sub, j) =>
                    j === subIdx ? { ...sub, completed: !sub.completed } : sub
                );
                return { ...block, subtasks: newSubtasks };
            });
            return updated;
        });
    };

    // --- Sort schedule by start time for display ---
    const sortedSchedule = useMemo(() => {
        return [...schedule].sort((a, b) => {
            const [ah, am] = a.start.split(":").map(Number);
            const [bh, bm] = b.start.split(":").map(Number);
            return ah !== bh ? ah - bh : am - bm;
        });
    }, [schedule]);

    // --- Add selected task state ---
    const [selectedTaskIdx, setSelectedTaskIdx] = useState<number | null>(null);
    const selectedTask = selectedTaskIdx !== null ? sortedSchedule[selectedTaskIdx] : null;

    // --- Right pane stats ---
    const totalTasks = schedule.length;
    const completedTasks = Object.values(completionStatus).filter(Boolean).length;
    const notCompletedTasks = totalTasks - completedTasks;
    const totalMinutes = schedule.reduce((total, block) => {
        const [startH, startM] = block.start.split(':').map(Number);
        const [endH, endM] = block.end.split(':').map(Number);
        const start = startH * 60 + startM;
        const end = endH * 60 + endM;
        return total + Math.max(0, end - start);
    }, 0);

    const renderView = () => {
        switch (view) {
            case 'stats':
                return <StatsView schedule={schedule} completionStatus={completionStatus} />;
            case 'settings':
                return <SettingsView 
                    isDarkMode={isDarkMode} 
                    onToggleDarkMode={setIsDarkMode}
                    isAlarmEnabled={isAlarmEnabled}
                    onToggleAlarm={setIsAlarmEnabled}
                    onImportSchedule={handleImport}
                    onExportSchedule={handleExport}
                    onClearSchedule={handleStartBlank}
                />;
            case 'schedule':
            default:
                return (
                    <div className="relative">
                        <div className="flex relative">
                            {/* Timeline bar */}
                            <div className="w-6 flex flex-col items-center relative">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-1 bg-primary-200 dark:bg-primary-800 rounded-full z-0" style={{height: '100%'}}></div>
                                {/* You are here marker */}
                                {schedule.length > 0 && (() => {
                                    const first = schedule[0];
                                    const last = schedule[schedule.length - 1];
                                    const parse = (t: string) => { const [h, m] = t.split(':').map(Number); const d = new Date(); d.setHours(h, m, 0, 0); return d; };
                                    const start = parse(first.start).getTime();
                                    const end = parse(last.end).getTime();
                                    const pct = Math.min(1, Math.max(0, (now.getTime() - start) / (end - start)));
                                    return (
                                        <div className="absolute left-1/2 -translate-x-1/2 z-10" style={{top: `calc(${pct * 100}% - 10px)`}}>
                                            <div className="w-5 h-5 bg-primary-500 rounded-full border-4 border-white dark:border-gray-900 shadow-lg animate-pulse"></div>
                                            <div className="text-xs text-primary-600 mt-1 text-center">You are here</div>
                                        </div>
                                    );
                                })()}
                            </div>
                            {/* Schedule blocks */}
                            <div className="flex-1">
                                <ScheduleEditor 
                                    ref={scheduleEditorRef}
                                    schedule={sortedSchedule} 
                                    setSchedule={setSchedule} 
                                    completionStatus={completionStatus}
                                    currentBlock={currentBlock}
                                    onSubTaskToggle={handleSubTaskToggle}
                                    onSelectTask={setSelectedTaskIdx}
                                    selectedTaskIdx={selectedTaskIdx}
                                />
                            </div>
                        </div>
                    </div>
                );
        }
    };
    
    // Calculate completion percentage for dynamic stats icon
    const totalBlocks = schedule.length;
    const completedCount = Object.values(completionStatus).filter(Boolean).length;
    const percentComplete = totalBlocks > 0 ? completedCount / totalBlocks : 0;

    // Dynamic Stats Icon
    const DynamicStatsIcon = () => (
        <span className="relative inline-block">
            <PieChart className="w-6 h-6 mb-1" />
            <svg className="absolute top-0 left-0 w-6 h-6" viewBox="0 0 24 24">
                <circle
                    cx="12" cy="12" r="10"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                />
                <circle
                    cx="12" cy="12" r="10"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray={2 * Math.PI * 10}
                    strokeDashoffset={(1 - percentComplete) * 2 * Math.PI * 10}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s' }}
                />
            </svg>
            {percentComplete === 1 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] rounded-full px-1">✔</span>
            )}
        </span>
    );

    const NavItem = ({ icon: Icon, label, activeView, targetView, dynamicIcon }: {icon: React.ElementType, label: string, activeView: View, targetView: View, dynamicIcon?: boolean}) => (
        <button
            onClick={() => setView(targetView)}
            className={`flex flex-col items-center justify-center w-full py-2 px-1 rounded-md transition-colors duration-200 ${
                activeView === targetView ? 'bg-primary-500 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
            {dynamicIcon ? <DynamicStatsIcon /> : <Icon className="w-6 h-6 mb-1" />}
            <span className="text-xs font-medium">{label}</span>
        </button>
    )

    // Add handler to trigger add form in ScheduleEditor
    const handleSidebarAdd = () => {
        if (scheduleEditorRef.current && typeof scheduleEditorRef.current.handleAdd === 'function') {
            scheduleEditorRef.current.handleAdd();
        }
    };

    // --- Layout Skeleton ---
    return (
        <div className="fixed inset-0 min-h-screen min-w-full font-sans antialiased text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
            {!userInteracted && (
                <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
                    <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-sm mx-4">
                        <PlayCircle className="mx-auto h-16 w-16 text-primary-500 mb-4" />
                        <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Welcome to FocusFlow</h2>
                        <p className="mb-6 text-gray-600 dark:text-gray-300">
                            Click to start your session. This will enable audio alerts for task changes.
                        </p>
                        <button 
                            onClick={handleInteraction}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-300"
                        >
                            Start Session
                        </button>
                    </div>
                </div>
            )}

            {/* Responsive layout: sidebar (desktop), header, main, right pane */}
            <div className={`w-full max-w-7xl mx-auto transition-filter duration-300 ${!userInteracted ? 'blur-md pointer-events-none' : ''} h-full flex flex-col`} style={{height: '100vh'}}>
                <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex items-center gap-4">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex-1">FocusFlow</h1>
                    <span className="hidden md:inline text-md text-gray-600 dark:text-gray-400">Your daily command center</span>
                </header>
                <div className="flex flex-col md:flex-row min-h-0 flex-1" style={{height: '100%'}}>
                    {/* Sidebar nav (desktop) */}
                    <nav className="hidden md:flex flex-col w-20 bg-white/90 dark:bg-gray-900/90 border-r border-gray-200 dark:border-gray-800 py-6 items-center gap-4 relative">
                        <NavItem icon={Calendar} label="Schedule" activeView={view} targetView="schedule" />
                        {/* Hide Stats tab on desktop */}
                        {/* <NavItem icon={PieChart} label="Stats" activeView={view} targetView="stats" dynamicIcon /> */}
                        <NavItem icon={Settings} label="Settings" activeView={view} targetView="settings" />
                        {/* Add task button below tabs */}
                        <button
                            className="mt-8 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg w-12 h-12 flex items-center justify-center text-3xl transition-transform transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary-300"
                            onClick={handleSidebarAdd}
                            aria-label="Add Block"
                            title="Add Block"
                            style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)' }}
                        >
                            <span className="sr-only">Add Task</span>
                            +
                        </button>
                    </nav>
                    {/* Main content: make scrollable, fill available height */}
                    <main className="flex-1 px-0 md:px-8 py-6 md:py-10 max-w-full md:max-w-3xl mx-auto overflow-y-auto h-full min-h-0">
                        {renderView()}
                    </main>
                    {/* Right details pane (desktop) */}
                    <aside
                        ref={rightPaneRef}
                        tabIndex={-1}
                        className="hidden md:flex flex-col w-80 bg-white/80 dark:bg-gray-900/80 border-l border-gray-200 dark:border-gray-800 p-6 relative focus:outline-none"
                    >
                        {/* Stats summary */}
                        <div className="mb-4 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800 text-sm">
                            <div className="font-bold mb-1">Today's Stats</div>
                            <div>Total scheduled: <span className="font-semibold">{Math.floor(totalMinutes/60)}h {totalMinutes%60}m</span></div>
                            <div>Tasks: <span className="font-semibold">{totalTasks}</span></div>
                            <div>Completed: <span className="font-semibold text-green-600">{completedTasks}</span></div>
                            <div>Not completed: <span className="font-semibold text-red-600">{notCompletedTasks}</span></div>
                        </div>
                        {/* Move TimerDisplay here */}
                        <div className="mb-6">
                            <TimerDisplay 
                                timeLeft={timeLeft} 
                                taskName={currentBlock?.title || null} 
                                timeUntilNextBlock={timeUntilNextBlock}
                            />
                        </div>
                        {/* Show details if a task is selected, else show placeholder */}
                        {selectedTask ? (
                            <RightTaskDetails
                                task={selectedTask}
                                onDelete={() => {
                                    setSchedule(schedule => schedule.filter((_, i) => i !== selectedTaskIdx));
                                    setSelectedTaskIdx(null);
                                }}
                                onUpdate={updated => {
                                    setSchedule(schedule => schedule.map((t, i) => i === selectedTaskIdx ? updated : t));
                                }}
                                onClose={() => setSelectedTaskIdx(null)}
                            />
                        ) : (
                            <div className="text-gray-500 dark:text-gray-400 text-center mt-20">
                                <span className="text-lg">click a task to see details</span>
                            </div>
                        )}
                    </aside>
                </div>
                {/* Bottom nav (mobile) */}
                <footer className="fixed md:hidden bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 z-40">
                    <nav className="max-w-2xl mx-auto flex justify-around p-2">
                        <NavItem icon={Calendar} label="Schedule" activeView={view} targetView="schedule" />
                        <NavItem icon={PieChart} label="Stats" activeView={view} targetView="stats" dynamicIcon />
                        <NavItem icon={Settings} label="Settings" activeView={view} targetView="settings" />
                    </nav>
                </footer>
                <div className="h-24 md:hidden"></div> {/* Spacer for fixed mobile footer */}
            </div>
        </div>
    );
}