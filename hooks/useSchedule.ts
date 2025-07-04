import { useEffect } from 'react';
import { ScheduleItem } from '../types';

const parseTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
};

export const useSchedule = (
    schedule: ScheduleItem[],
    setSchedule: (updater: (prevSchedule: ScheduleItem[]) => ScheduleItem[]) => void
) => {
    useEffect(() => {
        const needsInitialization = schedule.some(item => item.remainingDuration === undefined);
        if (needsInitialization) {
            setSchedule(prevSchedule =>
                prevSchedule.map(item => ({
                    ...item,
                    remainingDuration: item.remainingDuration ?? (parseTime(item.end).getTime() - parseTime(item.start).getTime()) / 1000,
                    isRunning: item.isRunning ?? false,
                }))
            );
        }
    }, [schedule, setSchedule]);

    useEffect(() => {
        const timer = setInterval(() => {
            setSchedule(prevSchedule =>
                prevSchedule.map(item => {
                    if (item.isRunning && item.remainingDuration && item.remainingDuration > 0) {
                        return { ...item, remainingDuration: item.remainingDuration - 1 };
                    }
                    return item;
                })
            );
        }, 1000);
        return () => clearInterval(timer);
    }, [setSchedule]);

    const startTask = (title: string) => {
        setSchedule(prevSchedule =>
            prevSchedule.map(item =>
                item.title === title ? { ...item, isRunning: true } : item
            )
        );
    };

    const stopTask = (title: string) => {
        setSchedule(prevSchedule =>
            prevSchedule.map(item =>
                item.title === title ? { ...item, isRunning: false } : item
            )
        );
    };

    return { startTask, stopTask };
};