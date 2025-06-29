import React, { useState, useEffect } from 'react';
import { ScheduleItem } from '../types.ts';

const parseTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
};

export const useSchedule = (schedule: ScheduleItem[]) => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const scheduleWithDates = schedule.map(item => ({
        ...item,
        startDate: parseTime(item.start),
        endDate: parseTime(item.end),
    }));

    const currentBlock = scheduleWithDates.find(item => now >= item.startDate && now < item.endDate) || null;
    
    let timeLeft = 0;
    if (currentBlock) {
        timeLeft = Math.max(0, currentBlock.endDate.getTime() - now.getTime());
    }

    const upcomingBlock = scheduleWithDates.find(item => now < item.startDate) || null;

    let timeUntilNextBlock = 0;
    if (!currentBlock && upcomingBlock) {
        timeUntilNextBlock = Math.max(0, upcomingBlock.startDate.getTime() - now.getTime());
    }

    const completedBlocks = scheduleWithDates
        .filter(item => now >= item.endDate)
        .map(item => item.title);

    return { now, currentBlock, timeLeft, timeUntilNextBlock, completedBlocks };
};