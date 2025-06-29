import React, { useState } from 'react';
import { ScheduleItem } from '../types.ts';
import { ScheduleBlock } from './ScheduleBlock.tsx';
import { Plus, Edit2, Trash2 } from 'lucide-react';

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
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

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
        setDeleteIndex(idx);
    };
    const confirmDelete = () => {
        if (deleteIndex !== null) {
            const newSchedule = schedule.slice();
            newSchedule.splice(deleteIndex, 1);
            setSchedule(newSchedule);
            setDeleteIndex(null);
        }
    };
    const cancelDelete = () => setDeleteIndex(null);

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
                {schedule.length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                        <Plus className="mx-auto mb-2 w-10 h-10 text-primary-400" />
                        <div className="text-lg">No blocks yet. Click the <span className='inline-block align-middle'><Plus className='inline w-5 h-5' /></span> button to add your first block!</div>
                    </div>
                )}
                {schedule.map((item, idx) => (
                    <div key={item.title + item.start} className="relative group">
                        {editingIndex === idx ? (
                            <form onSubmit={handleFormSubmit} className="mb-2 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col gap-2 border border-primary-200 dark:border-primary-700 animate-fade-in">
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleInputChange}
                                    placeholder="Title"
                                    className="w-full p-2 rounded border focus:ring-2 focus:ring-primary-400"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="time"
                                        name="start"
                                        value={form.start}
                                        onChange={handleInputChange}
                                        className="w-1/2 p-2 rounded border focus:ring-2 focus:ring-primary-400"
                                    />
                                    <input
                                        type="time"
                                        name="end"
                                        value={form.end}
                                        onChange={handleInputChange}
                                        className="w-1/2 p-2 rounded border focus:ring-2 focus:ring-primary-400"
                                    />
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <button type="submit" className="flex-1 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition">Save</button>
                                    <button type="button" className="flex-1 bg-gray-300 px-4 py-2 rounded" onClick={handleCancel}>Cancel</button>
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
                                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                                        onClick={() => handleEdit(idx)}
                                        title="Edit"
                                    ><Edit2 className="w-4 h-4" /> Edit</button>
                                    <button
                                        className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 flex items-center gap-1"
                                        onClick={() => handleDelete(idx)}
                                        title="Delete"
                                    ><Trash2 className="w-4 h-4" /> Delete</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {adding && (
                    <form onSubmit={handleFormSubmit} className="mb-2 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col gap-2 border border-primary-200 dark:border-primary-700 animate-fade-in">
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleInputChange}
                            placeholder="Title"
                            className="w-full p-2 rounded border focus:ring-2 focus:ring-primary-400"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <input
                                type="time"
                                name="start"
                                value={form.start}
                                onChange={handleInputChange}
                                className="w-1/2 p-2 rounded border focus:ring-2 focus:ring-primary-400"
                            />
                            <input
                                type="time"
                                name="end"
                                value={form.end}
                                onChange={handleInputChange}
                                className="w-1/2 p-2 rounded border focus:ring-2 focus:ring-primary-400"
                            />
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button type="submit" className="flex-1 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition">Add</button>
                            <button type="button" className="flex-1 bg-gray-300 px-4 py-2 rounded" onClick={handleCancel}>Cancel</button>
                        </div>
                    </form>
                )}
            </div>
            <button
                className="fixed bottom-24 right-8 z-40 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-3xl transition-transform transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary-300"
                onClick={handleAdd}
                disabled={adding || editingIndex !== null}
                aria-label="Add Block"
                title="Add Block"
            >
                <Plus className="w-8 h-8" />
            </button>
            {deleteIndex !== null && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-xs w-full text-center animate-fade-in">
                        <Trash2 className="mx-auto mb-2 w-10 h-10 text-red-500" />
                        <div className="text-lg font-semibold mb-2">Delete this block?</div>
                        <div className="text-gray-500 mb-4">This action cannot be undone.</div>
                        <div className="flex gap-2 justify-center">
                            <button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Delete</button>
                            <button onClick={cancelDelete} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleEditor;
