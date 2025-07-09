import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View } from './types.ts';
import { useScheduleFromConvex, useCompletionStatusFromConvex } from './hooks/useConvexSchedule.ts';
import { useTimerFromConvex } from './hooks/useTimerFromConvex.ts';
import { Id } from './convex/_generated/dataModel.ts';

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
    
    // Timer management with Convex
    const { 
        runningTimer, 
        startTimer, 
        stopTimer, 
        pauseTimer, 
        resumeTimer, 
        updateTimerDuration 
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

    // Timer state management - now with Convex persistence
    const [runningTaskTitle, setRunningTaskTitle] = useState<string | null>(null);
    const [timers, setTimers] = useState<{[key: string]: number}>({});

    // Sync local state with Convex running timer
    useEffect(() => {
        if (runningTimer) {
            setRunningTaskTitle(runningTimer.title);
        } else {
            setRunningTaskTitle(null);
        }
    }, [runningTimer]);

    // Timer effect - runs every second for active timers
    useEffect(() => {
        if (!runningTaskTitle) return;

        const interval = setInterval(() => {
            setTimers(prev => {
                const newTimers = { ...prev };
                if (newTimers[runningTaskTitle] > 0) {
                    newTimers[runningTaskTitle] -= 1;
                    
                    // Update Convex with new duration (throttled to avoid too many calls)
                    if (newTimers[runningTaskTitle] % 10 === 0) { // Every 10 seconds
                        const runningTask = sortedSchedule.find(task => task.title === runningTaskTitle);
                        if (runningTask && runningTask._id) {
                            updateTimerDuration(runningTask._id as Id<"scheduleItems">, newTimers[runningTaskTitle]);
                        }
                    }
                } else {
                    // Timer finished
                    setRunningTaskTitle(null);
                    const runningTask = sortedSchedule.find(task => task.title === runningTaskTitle);
                    if (runningTask && runningTask._id) {
                        stopTimer(runningTask._id as Id<"scheduleItems">);
                    }
                    console.log('⏰ Timer finished for:', runningTaskTitle);
                }
                return newTimers;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [runningTaskTitle, sortedSchedule, updateTimerDuration, stopTimer]);

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
            setTimers(newTimers);
        }
    }, [schedule]);

    // Handle timer start/stop/pause/resume with Convex
    const handleStartTimer = async (title: string) => {
        console.log('🟢 Starting timer for:', title);
        const task = sortedSchedule.find(t => t.title === title);
        if (task && task._id) {
            try {
                await startTimer(task._id as Id<"scheduleItems">);
                setRunningTaskTitle(title);
            } catch (error) {
                console.error('❌ Error starting timer:', error);
            }
        }
    };

    const handleStopTimer = async (title: string) => {
        console.log('🔴 Stopping timer for:', title);
        const task = sortedSchedule.find(t => t.title === title);
        if (task && task._id) {
            try {
                await stopTimer(task._id as Id<"scheduleItems">);
                setRunningTaskTitle(null);
            } catch (error) {
                console.error('❌ Error stopping timer:', error);
            }
        }
    };

    const handlePauseTimer = async (title: string) => {
        console.log('⏸️ Pausing timer for:', title);
        const task = sortedSchedule.find(t => t.title === title);
        if (task && task._id) {
            try {
                await pauseTimer(task._id as Id<"scheduleItems">);
            } catch (error) {
                console.error('❌ Error pausing timer:', error);
            }
        }
    };

    const handleResumeTimer = async (title: string) => {
        console.log('▶️ Resuming timer for:', title);
        const task = sortedSchedule.find(t => t.title === title);
        if (task && task._id) {
            try {
                await resumeTimer(task._id as Id<"scheduleItems">);
            } catch (error) {
                console.error('❌ Error resuming timer:', error);
            }
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

    // Rest of the component remains the same...
    // (Export/Import/Clear handlers, renderView, etc.)
    
    return (
        <div>Enhanced App with Convex Timer Integration</div>
    );
}
