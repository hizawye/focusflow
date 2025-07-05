import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ScheduleItem, CompletionStatus } from '../types.ts';

interface StatsPageProps {
    schedule: ScheduleItem[];
    completionStatus: CompletionStatus;
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b']; // Green, Red, Orange

export const StatsPage: React.FC<StatsPageProps> = ({ schedule, completionStatus }) => {
    const completedCount = schedule.filter(item => completionStatus[item.title]).length;
    const totalTasks = schedule.length;
    const remainingCount = totalTasks - completedCount;

    const data = [
        { name: 'Completed', value: completedCount },
        { name: 'Remaining', value: remainingCount },
    ];

    const completionPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    return (
        <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">Your Progress Today</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-center">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Completed Tasks</p>
                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{completedCount}</p>
                </div>
                 <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
                    <p className="text-3xl font-bold text-gray-700 dark:text-gray-200">{totalTasks}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{completionPercentage}%</p>
                </div>
            </div>

            <div className="h-80 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ 
                                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                border: 'none',
                                borderRadius: '0.5rem',
                                color: '#ffffff'
                            }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};