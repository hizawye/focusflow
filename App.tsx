import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ScheduleItem, CompletionStatus, View } from './types.ts';
import { DEFAULT_SCHEDULE } from './constants.ts';
import { useSchedule } from './hooks/useSchedule.ts';
import { generateScheduleWithGemini } from './gemini';

import { Header } from './components/Header';
import { PieChart } from 'lucide-react';
import { SidebarNav } from './components/SidebarNav';
import { RightAside } from './components/RightAside';
import { MobileTaskModal } from './components/MobileTaskModal';
import { MobileFooter } from './components/MobileFooter';
import { AddTaskButton } from './components/AddTaskButton';
import { ScheduleEditor } from './components/ScheduleEditor';
import { SettingsView } from './components/SettingsView';
import { StatsView } from './components/StatsView';

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

    const { startTask, stopTask } = useSchedule(schedule, setSchedule);

    const completionStatus: CompletionStatus = useMemo(() => {
        const status: CompletionStatus = {};
        schedule.forEach(block => {
            if (block.manualStatus === 'done') status[block.title] = true;
            else if (block.manualStatus === 'missed') status[block.title] = false;
            else status[block.title] = (block.remainingDuration !== undefined && block.remainingDuration <= 0);
        });
        return status;
    }, [schedule]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
        document.body.classList.toggle('dark:bg-gray-900', isDarkMode);
    }, [isDarkMode]);

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
                                    onSubTaskToggle={handleSubTaskToggle}
                                    onSelectTask={setSelectedTaskIdx}
                                    selectedTaskIdx={selectedTaskIdx}
                                    onStart={startTask}
                                    onStop={stopTask}
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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (rightPaneRef.current && !rightPaneRef.current.contains(event.target as Node)) {
                setSelectedTaskIdx(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [rightPaneRef]);

    // --- Layout Skeleton ---
    // Mobile modal state
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    useEffect(() => {
        // Prevent background scroll when modal is open
        if (isMobile && selectedTask) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobile, selectedTask]);

    // Gemini AI message input state
    const [aiMessage, setAiMessage] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [showGeminiInput, setShowGeminiInput] = useState(false);

    // Helper to apply Gemini actions to the current schedule
    function applyGeminiActions(schedule: ScheduleItem[], actions: any[]): ScheduleItem[] {
      let updated = [...schedule];
      for (const action of actions) {
        if (action.action === 'add' && action.item) {
          updated.push(action.item);
        } else if (action.action === 'edit' && action.target && action.item) {
          updated = updated.map(item => item.title === action.target ? { ...item, ...action.item } : item);
        } else if (action.action === 'remove' && action.target) {
          updated = updated.filter(item => item.title !== action.target);
        }
      }
      return updated;
    }

    // Handler for Gemini AI message submit
    async function handleGeminiMessageSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!aiMessage.trim()) return;
        setAiLoading(true);
        // Send current schedule and ask for actions
        const prompt = `My current schedule is:\n${JSON.stringify(schedule, null, 2)}\n\nUser request: ${aiMessage}\n\nReply ONLY with a JSON array of actions to add, edit, or remove schedule blocks. Each action should be one of:\n- { \"action\": \"add\", \"item\": { ... } }\n- { \"action\": \"edit\", \"target\": \"title\", \"item\": { ... } }\n- { \"action\": \"remove\", \"target\": \"title\" }\n\nExample:\n[\n  { \"action\": \"add\", \"item\": { \"title\": \"Trading\", \"start\": \"21:00\", \"end\": \"22:00\", \"notes\": \"Trading time\" } }\n]`;
        try {
            const actions = await generateScheduleWithGemini(prompt);
            setSchedule(prev => applyGeminiActions(prev, actions));
            setAiMessage('');
        } catch (e: any) {
            alert('Gemini error: ' + (e.message || e));
        } finally {
            setAiLoading(false);
        }
    }

    // Reset manualStatus for all schedule items at 12:01 AM
    useEffect(() => {
        const now = new Date();
        // Set reset time to 12:01 AM
        const resetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 1, 0, 0);
        const msUntilReset = resetTime.getTime() - now.getTime();
        const resetManualStatus = () => {
            setSchedule(prev => prev.map(item => {
                const { manualStatus, ...rest } = item;
                return rest;
            }));
        };
        const timeout = setTimeout(() => {
            resetManualStatus();
            // Set interval for future days (24h)
            setInterval(resetManualStatus, 24 * 60 * 60 * 1000);
        }, msUntilReset);
        return () => clearTimeout(timeout);
    }, [setSchedule]);

    return (
        <div className="fixed inset-0 min-h-screen min-w-full font-sans antialiased text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
            {/* Mobile Task Details Modal */}
            <MobileTaskModal
                selectedTask={selectedTask}
                setSelectedTaskIdx={setSelectedTaskIdx}
                setSchedule={setSchedule}
                selectedTaskIdx={selectedTaskIdx}
            />
            {/* Responsive layout: sidebar (desktop), header, main, right pane */}
            <div className={`w-full max-w-[1800px] mx-auto transition-filter duration-300 h-full flex flex-col`} style={{height: '100vh'}}>
                {/* App header */}
                <Header />
                <div className="flex flex-col md:flex-row min-h-0 flex-1" style={{height: '100%'}}>
                    {/* Sidebar navigation (desktop) */}
                    <SidebarNav view={view} setView={setView} NavItem={NavItem} />
                    {/* Main content: schedule, stats, or settings */}
                    <main className="flex-1 px-0 md:px-8 py-6 md:py-10 max-w-full md:max-w-3xl mx-auto overflow-y-auto h-full min-h-0">
                        {renderView()}
                    </main>
                    {/* Right details pane (desktop only) */}
                    <RightAside
                        totalMinutes={totalMinutes}
                        totalTasks={totalTasks}
                        completedTasks={completedTasks}
                        notCompletedTasks={notCompletedTasks}
                        selectedTask={selectedTask}
                        setSchedule={setSchedule}
                        setSelectedTaskIdx={setSelectedTaskIdx}
                        selectedTaskIdx={selectedTaskIdx}
                        handleSidebarAdd={handleSidebarAdd}
                        showGeminiInput={showGeminiInput}
                        setShowGeminiInput={setShowGeminiInput}
                        aiMessage={aiMessage}
                        setAiMessage={setAiMessage}
                        aiLoading={aiLoading}
                        handleGeminiMessageSubmit={handleGeminiMessageSubmit}
                    />
                </div>
                {/* Bottom nav (mobile) */}
                <MobileFooter view={view} setView={setView} NavItem={NavItem} />
                <div className="h-24 md:hidden"></div> {/* Spacer for fixed mobile footer */}
            </div>
        </div>
    );
}
