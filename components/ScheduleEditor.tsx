import React, { useState } from 'react';
import { ScheduleItem } from '../types.ts';
import { ScheduleBlock } from './ScheduleBlock.tsx';

interface ScheduleEditorProps {
    schedule: ScheduleItem[];
    setSchedule: (schedule: ScheduleItem[]) => void;
    completionStatus: { [key: string]: boolean };
    currentBlock: ScheduleItem | null;
    onToggleComplete: (title: string) => void;
}

const emptyBlock: ScheduleItem = { title: '', start: '', end: '' };

export const ScheduleEditor: React.FC<ScheduleEditorProps> = ({
    schedule,
    setSchedule,
    completionStatus,
    currentBlock,
    onToggleComplete,
}) => {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [form, setForm] = useState<ScheduleItem>(emptyBlock);
    const [adding, setAdding] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAdd = () => {
        setForm(emptyBlock);
        setEditingIndex(null);
        setAdding(true);
    };

    const handleEdit = (idx: number) => {
        setForm(schedule[idx]);
        setEditingIndex(idx);
        setAdding(false);
    };

    const handleDelete = (idx: number) => {
        if (window.confirm('Delete this block?')) {
            const newSchedule = schedule.slice();
            newSchedule.splice(idx, 1);
            setSchedule(newSchedule);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.start || !form.end) return;
        const newSchedule = schedule.slice();
        if (editingIndex !== null) {
            newSchedule[editingIndex] = form;
        } else {
            newSchedule.push(form);
        }
        setSchedule(newSchedule);
        setEditingIndex(null);
        setAdding(false);
        setForm(emptyBlock);
    };

    const handleCancel = () => {
        setEditingIndex(null);
        setAdding(false);
        setForm(emptyBlock);
    };

    return (
        <div>
            <div className="space-y-3">
                {schedule.map((item, idx) => (
                    <div key={item.title + item.start} className="relative group">
                        {editingIndex === idx ? (
                            <form onSubmit={handleFormSubmit} className="mb-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col gap-2">
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleInputChange}
                                    placeholder="Title"
                                    className="w-full p-2 rounded border"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="time"
                                        name="start"
                                        value={form.start}
                                        onChange={handleInputChange}
                                        className="w-1/2 p-2 rounded border"
                                    />
                                    <input
                                        type="time"
                                        name="end"
                                        value={form.end}
                                        onChange={handleInputChange}
                                        className="w-1/2 p-2 rounded border"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">Save</button>
                                    <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={handleCancel}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <ScheduleBlock
                                    item={item}
                                    isActive={currentBlock?.title === item.title}
                                    isCompleted={completionStatus[item.title] || false}
                                    onToggleComplete={() => onToggleComplete(item.title)}
                                />
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                        onClick={() => handleEdit(idx)}
                                    >Edit</button>
                                    <button
                                        className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                        onClick={() => handleDelete(idx)}
                                    >Delete</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {adding && (
                    <form onSubmit={handleFormSubmit} className="mb-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col gap-2">
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleInputChange}
                            placeholder="Title"
                            className="w-full p-2 rounded border"
                        />
                        <div className="flex gap-2">
                            <input
                                type="time"
                                name="start"
                                value={form.start}
                                onChange={handleInputChange}
                                className="w-1/2 p-2 rounded border"
                            />
                            <input
                                type="time"
                                name="end"
                                value={form.end}
                                onChange={handleInputChange}
                                className="w-1/2 p-2 rounded border"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">Add</button>
                            <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={handleCancel}>Cancel</button>
                        </div>
                    </form>
                )}
            </div>
            <div className="flex justify-end mt-2">
                <button
                    className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                    onClick={handleAdd}
                    disabled={adding || editingIndex !== null}
                >
                    + Add Block
                </button>
            </div>
        </div>
    );
};

export default ScheduleEditor;
