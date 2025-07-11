import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View } from './types.ts';
import { useScheduleFromConvex, useCompletionStatusFromConvex } from './hooks/useConvexSchedule.ts';
import { useTimerFromConvex } from './hooks/useTimerFromConvex.ts';
import { Id } from './convex/_generated/dataModel.ts';
import { useUser } from '@clerk/clerk-react';

import { Header } from './components/Header';
import { PieChart } from 'lucide-react';
import { DesktopNavBar } from './components/DesktopNavBar';
import { TaskDetailsSidebar } from './components/TaskDetailsSidebar';
import { TaskModal } from './components/TaskModal';
import { MobileNavBar } from './components/MobileNavBar';
import { ScheduleList } from './components/ScheduleList';
import { SettingsPage } from './components/SettingsPage';
import { StatsPage } from './components/StatsPage';
import { AuthGuard, UnauthenticatedState } from './components/AuthComponents';

export default function App() {
    const { isLoaded, user } = useUser();
    const rightPaneRef = useRef<HTMLDivElement | null>(null);
    const scheduleEditorRef = useRef<any>(null);

    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 10000); // update every 10s
        return () => clearInterval(interval);
    }, []);

    const [view, setView] = useState<View>('schedule');
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [isAlarmEnabled, setIsAlarmEnabled] = useState<boolean>(true);

    // Convex hooks for schedule and completion status
    const today = new Date().toISOString().split('T')[0];
    const { 
        scheduleItems: schedule, 
        exportSchedule, 
        importSchedule, 
        clearSchedule, 
        updateItem, 
        deleteItem 
    } = useScheduleFromConvex(today);
    const { completionStatus } = useCompletionStatusFromConvex(today);
    
    // Timer hook from Convex
    const {
        runningTimer,
        startTimer,
        stopTimer,
        pauseTimer,
        resumeTimer,
        updateTimerDuration,
        isLoading: isTimerLoading
    } = useTimerFromConvex(today);

    // --- Sort schedule by start time for display ---
    const sortedSchedule = useMemo(() => {
        return [...(schedule || [])].sort((a, b) => {
            const [ah, am] = a.start.split(":").map(Number);
            const [bh, bm] = b.start.split(":").map(Number);
            return ah !== bh ? ah - bh : am - bm;
        });
    }, [schedule]);

    // --- Add selected task state ---
    const [selectedTaskIdx, setSelectedTaskIdx] = useState<number | null>(null);
    const selectedTask = selectedTaskIdx !== null ? sortedSchedule[selectedTaskIdx] : null;

    // Timer state management
    const [timers, setTimers] = useState<{[key: string]: number}>({});
    // Track the currently running task title for UI updates
    const [runningTaskTitle, setRunningTaskTitle] = useState<string | null>(null);
    const [runningTaskId, setRunningTaskId] = useState<Id<"scheduleItems"> | null>(null);

    // Update local running task state from Convex
    useEffect(() => {
        console.log("⚡ Timer loading state changed:", { isTimerLoading, runningTimer });
        
        if (!isTimerLoading) {
            if (runningTimer) {
                console.log("📱 Found running timer in Convex:", runningTimer);
                
                setRunningTaskTitle(prevTitle => {
                    const newTitle = prevTitle !== runningTimer.title ? runningTimer.title : prevTitle;
                    console.log("⚙️ Setting runningTaskTitle:", { prevTitle, newTitle });
                    return newTitle;
                });
                
                setRunningTaskId(prevId => {
                    const newId = prevId !== runningTimer._id ? runningTimer._id : prevId;
                    console.log("⚙️ Setting runningTaskId:", { prevId, newId });
                    return newId;
                });
            } else {
                console.log("🔄 No running timer found in Convex");
                
                setRunningTaskTitle(prevTitle => {
                    const newTitle = prevTitle !== null ? null : prevTitle;
                    console.log("⚙️ Clearing runningTaskTitle:", { prevTitle, newTitle });
                    return newTitle;
                });
                
                setRunningTaskId(prevId => {
                    const newId = prevId !== null ? null : prevId;
                    console.log("⚙️ Clearing runningTaskId:", { prevId, newId });
                    return newId;
                });
            }
        }
    }, [runningTimer, isTimerLoading]);

    // Timer effect - runs every second for active timers
    useEffect(() => {
        if (!runningTaskTitle || !runningTaskId) return;
        
        // Check if the timer is paused by using runningTimer from Convex
        if (runningTimer?.isPaused) return;

        const interval = setInterval(() => {
            setTimers(prev => {
                const newTimers = { ...prev };
                if (newTimers[runningTaskTitle] > 0) {
                    newTimers[runningTaskTitle] -= 1;
                    
                    // Update Convex with new remaining time every 5 seconds
                    if (newTimers[runningTaskTitle] % 5 === 0) {
                        updateTimerDuration(runningTaskId, newTimers[runningTaskTitle])
                            .catch(err => console.error('Failed to update timer duration:', err));
                    }
                } else {
                    // Timer finished
                    stopTimer(runningTaskId)
                        .catch(err => console.error('Failed to stop timer:', err));
                    // TODO: Show completion notification
                    console.log('⏰ Timer finished for:', runningTaskTitle);
                }
                return newTimers;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [runningTaskTitle, runningTaskId, runningTimer, updateTimerDuration, stopTimer]);

    // Initialize timer durations when schedule changes
    useEffect(() => {
        if (schedule) {
            const newTimers: {[key: string]: number} = {};
            schedule.forEach(item => {
                if (item.remainingDuration !== undefined) {
                    newTimers[item.title] = item.remainingDuration;
                } else {
                    // Calculate duration from start/end times
                    const [startH, startM] = item.start.split(':').map(Number);
                    const [endH, endM] = item.end.split(':').map(Number);
                    const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
                    newTimers[item.title] = durationMinutes * 60; // Convert to seconds
                }
            });
            
            // Use a function form to avoid unnecessary re-renders if values are the same
            setTimers(prev => {
                // Only update if there are actual changes
                const hasChanges = Object.keys(newTimers).some(key => 
                    !prev[key] || prev[key] !== newTimers[key]
                ) || Object.keys(prev).some(key => !newTimers[key]);
                
                return hasChanges ? newTimers : prev;
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(schedule?.map(item => ({
        title: item.title,
        remainingDuration: item.remainingDuration,
        start: item.start,
        end: item.end
    })))]);

    // Handle timer start/stop/pause/resume
    const handleStartTimer = (title: string) => {
        console.log('🟢 Starting timer for:', title);
        const item = schedule.find(item => item.title === title);
        
        console.log('📌 Item found:', item ? {
            id: item._id,
            title: item.title,
            isRunning: item.isRunning,
            isPaused: item.isPaused
        } : 'No item found');
        
        if (item && item._id) {
            console.log('🔄 Calling startTimer with ID:', item._id);
            startTimer(item._id)
                .then(() => console.log('✅ Timer started successfully'))
                .catch(err => console.error('❌ Failed to start timer:', err));
        } else {
            console.error('❌ Cannot start timer: Invalid item or missing ID');
        }
    };

    const handleStopTimer = (title: string) => {
        console.log('🔴 Stopping timer for:', title);
        const item = schedule.find(item => item.title === title);
        
        console.log('📌 Item found:', item ? {
            id: item._id,
            title: item.title,
            isRunning: item.isRunning,
            isPaused: item.isPaused
        } : 'No item found');
        
        if (item && item._id) {
            console.log('🔄 Calling stopTimer with ID:', item._id);
            stopTimer(item._id)
                .then(() => console.log('✅ Timer stopped successfully'))
                .catch(err => console.error('❌ Failed to stop timer:', err));
        } else {
            console.error('❌ Cannot stop timer: Invalid item or missing ID');
        }
    };
    
    const handlePauseTimer = (title: string) => {
        console.log('⏸️ Pausing timer for:', title);
        const item = schedule.find(item => item.title === title);
        if (item && item._id && item.isRunning && !item.isPaused) {
            pauseTimer(item._id)
                .catch(err => console.error('Failed to pause timer:', err));
        }
    };
    
    const handleResumeTimer = (title: string) => {
        console.log('▶️ Resuming timer for:', title);
        const item = schedule.find(item => item.title === title);
        if (item && item._id && item.isRunning && item.isPaused) {
            resumeTimer(item._id)
                .catch(err => console.error('Failed to resume timer:', err));
        }
    };

    // Handle task selection - don't close panel if same task is clicked
    const handleTaskSelection = (idx: number) => {
        // Always keep the task selected, don't toggle off
        // Use setTimeout to ensure this runs after any potential outside click handler
        setTimeout(() => {
            setSelectedTaskIdx(idx);
        }, 0);
    };

    // --- Import/Export/Clear handlers ---
    /**
     * Export current schedule as JSON file
     */
    const handleExportSchedule = () => {
        console.log('📤 Exporting schedule...');
        try {
            const jsonData = exportSchedule();
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `focusflow-schedule-${today}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log('✅ Schedule exported successfully');
        } catch (error) {
            console.error('❌ Error exporting schedule:', error);
            alert('Failed to export schedule. Please try again.');
        }
    };

    /**
     * Import schedule from JSON file
     */
    const handleImportSchedule = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        console.log('📥 Importing schedule from file:', file.name);
        try {
            const text = await file.text();
            await importSchedule(text);
            console.log('✅ Schedule imported successfully');
            // Clear the file input
            e.target.value = '';
        } catch (error) {
            console.error('❌ Error importing schedule:', error);
            alert('Failed to import schedule. Please check the file format and try again.');
        }
    };

    /**
     * Clear all schedule items
     */
    const handleClearSchedule = async () => {
        console.log('🧹 Clearing schedule...');
        try {
            await clearSchedule();
            console.log('✅ Schedule cleared successfully');
        } catch (error) {
            console.error('❌ Error clearing schedule:', error);
            alert('Failed to clear schedule. Please try again.');
        }
    };

    // --- Handlers for TaskDetailsSidebar ---
    const handleDeleteTask = async (task: typeof selectedTask) => {
        if (task && task._id) {
            try {
                await deleteItem(task._id);
                setSelectedTaskIdx(null);
            } catch (e) {
                alert('Failed to delete task.');
            }
        }
    };
    const handleUpdateTask = async (updated: typeof selectedTask) => {
        if (updated && updated._id) {
            try {
                await updateItem(updated._id, updated);
            } catch (e) {
                alert('Failed to update task.');
            }
        }
    };

    // --- Right pane stats ---
    const totalTasks = schedule ? schedule.length : 0;
    const completedTasks = completionStatus ? Object.values(completionStatus).filter(Boolean).length : 0;
    const notCompletedTasks = totalTasks - completedTasks;
    const totalMinutes = schedule ? schedule.reduce((total, block) => {
        const [startH, startM] = block.start.split(':').map(Number);
        const [endH, endM] = block.end.split(':').map(Number);
        const start = startH * 60 + startM;
        const end = endH * 60 + endM;
        return total + Math.max(0, end - start);
    }, 0) : 0;

    const renderView = () => {
        switch (view) {
            case 'stats':
                return <StatsPage schedule={schedule} completionStatus={completionStatus} />;
            case 'settings':
                return <SettingsPage 
                    isDarkMode={isDarkMode} 
                    onToggleDarkMode={setIsDarkMode}
                    isAlarmEnabled={isAlarmEnabled}
                    onToggleAlarm={setIsAlarmEnabled}
                    onImportSchedule={handleImportSchedule}
                    onExportSchedule={handleExportSchedule}
                    onClearSchedule={handleClearSchedule}
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
                                    const parse = (t: string) => { const [h, m] = t.split(':').map(Number); const d = new Date(now); d.setHours(h, m, 0, 0); return d; };
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
                                <ScheduleList 
                                    ref={scheduleEditorRef}
                                    schedule={sortedSchedule} 
                                    completionStatus={completionStatus}
                                    onSelectTask={handleTaskSelection}
                                    selectedTaskIdx={selectedTaskIdx}
                                    onStart={handleStartTimer}
                                    onStop={handleStopTimer}
                                    onPause={handlePauseTimer}
                                    onResume={handleResumeTimer}
                                    runningTaskTitle={runningTaskTitle}
                                    timers={timers}
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

    // Add handler to trigger Gemini AI form in ScheduleEditor
    const handleGeminiAdd = () => {
        if (scheduleEditorRef.current && typeof scheduleEditorRef.current.showGeminiInput === 'function') {
            scheduleEditorRef.current.showGeminiInput();
        }
    };

    // Add handler to trigger add form in ScheduleEditor
    const handleSidebarAdd = () => {
        if (scheduleEditorRef.current && typeof scheduleEditorRef.current.addItem === 'function') {
            scheduleEditorRef.current.addItem();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Don't close if clicking on a task item or any of its children
            if ((event.target as HTMLElement).closest('.schedule-item') || 
                (event.target as HTMLElement).closest('[data-task-item]')) {
                return;
            }
            
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
    // TODO: Implement Gemini integration with Convex
    // The gemini integration needs to be updated to work with Convex mutations
    
    // Reset manualStatus and remainingDuration for all schedule items at 12:01 AM
    useEffect(() => {
        // TODO: Implement Convex mutation to reset schedule for new day
        // This effect previously called setSchedule, which is now removed.
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark:bg-gray-900');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark:bg-gray-900');
        }
    }, [isDarkMode]);

    // Show loading state while Clerk is loading
    if (!isLoaded) {
        return (
            <div className="fixed inset-0 min-h-screen min-w-full font-sans antialiased text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 min-h-screen min-w-full font-sans antialiased text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
            {/* App header - always visible */}
            <Header />
            
            {/* Show unauthenticated state or authenticated content */}
            {!user ? (
                <UnauthenticatedState />
            ) : (
                <AuthGuard>
                    {/* Mobile Task Details Modal */}
                    <TaskModal
                        selectedTask={selectedTask}
                        setSelectedTaskIdx={setSelectedTaskIdx}
                        selectedTaskIdx={selectedTaskIdx}
                    />
                    {/* Responsive layout: sidebar (desktop), header, main, right pane */}
                    <div className={`w-full max-w-[1800px] mx-auto transition-filter duration-300 h-full flex flex-col`} style={{height: 'calc(100vh - 80px)'}}>
                        <div className="flex flex-col md:flex-row min-h-0 flex-1" style={{height: '100%'}}>
                            {/* Sidebar navigation (desktop) */}
                            <DesktopNavBar view={view} setView={setView} NavItem={NavItem} />
                    {/* Main content: schedule, stats, or settings */}
                    <main className="flex-1 px-0 md:px-8 py-6 md:py-10 max-w-full md:max-w-3xl mx-auto overflow-y-auto h-full min-h-0 no-scrollbar">
                        {renderView()}
                    </main>
                    {/* Right details pane (desktop only) */}
                    <TaskDetailsSidebar
                        totalMinutes={totalMinutes}
                        totalTasks={totalTasks}
                        completedTasks={completedTasks}
                        notCompletedTasks={notCompletedTasks}
                        selectedTask={selectedTask}
                        setSelectedTaskIdx={setSelectedTaskIdx}
                        selectedTaskIdx={selectedTaskIdx}
                        handleSidebarAdd={handleSidebarAdd}
                        handleGeminiAdd={handleGeminiAdd}
                        handleDeleteTask={handleDeleteTask}
                        handleUpdateTask={handleUpdateTask}
                    />
                </div>
                        {/* Bottom nav (mobile) */}
                        <MobileNavBar view={view} setView={setView} NavItem={NavItem} />
                        <div className="h-24 md:hidden"></div> {/* Spacer for fixed mobile footer */}
                    </div>
                </AuthGuard>
            )}
        </div>
    );
}