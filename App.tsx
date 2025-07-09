import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View } from './types.ts';
import { useScheduleFromConvex, useCompletionStatusFromConvex } from './hooks/useConvexSchedule.ts';

import { Header } from './components/Header';
import { PieChart } from 'lucide-react';
import { DesktopNavBar } from './components/DesktopNavBar';
import { TaskDetailsSidebar } from './components/TaskDetailsSidebar';
import { TaskModal } from './components/TaskModal';
import { MobileNavBar } from './components/MobileNavBar';
import { ScheduleList } from './components/ScheduleList';
import { SettingsPage } from './components/SettingsPage';
import { StatsPage } from './components/StatsPage';

export default function App() {
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
        clearSchedule 
    } = useScheduleFromConvex(today);
    const { completionStatus } = useCompletionStatusFromConvex(today);

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
        if (scheduleEditorRef.current && typeof scheduleEditorRef.current.addItem === 'function') {
            scheduleEditorRef.current.addItem();
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

    return (
        <div className="fixed inset-0 min-h-screen min-w-full font-sans antialiased text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
            {/* Mobile Task Details Modal */}
            <TaskModal
                selectedTask={selectedTask}
                setSelectedTaskIdx={setSelectedTaskIdx}
                selectedTaskIdx={selectedTaskIdx}
            />
            {/* Responsive layout: sidebar (desktop), header, main, right pane */}
            <div className={`w-full max-w-[1800px] mx-auto transition-filter duration-300 h-full flex flex-col`} style={{height: '100vh'}}>
                {/* App header */}
                <Header />
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
                    />
                </div>
                {/* Bottom nav (mobile) */}
                <MobileNavBar view={view} setView={setView} NavItem={NavItem} />
                <div className="h-24 md:hidden"></div> {/* Spacer for fixed mobile footer */}
            </div>
        </div>
    );
}