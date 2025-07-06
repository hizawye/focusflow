import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ScheduleItem } from '../types.ts';
import { ScheduleItem } from './ScheduleItem.tsx';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { generateScheduleWithGemini } from '../gemini';

interface ScheduleListProps {
    schedule: ScheduleItem[];
    setSchedule: (schedule: ScheduleItem[]) => void;
    completionStatus: { [key: string]: boolean };
    currentBlock: ScheduleItem | null;
    onSubTaskToggle: (blockIdx: number, subIdx: number) => void;
    onSelectTask?: (idx: number) => void;
    selectedTaskIdx?: number | null;
    onAddTask?: () => void; // new prop
    onStart: (title: string) => void;
    onStop: (title: string) => void;
}

const emptyBlock: ScheduleItem = { title: '', start: '', end: '' };

const ICON_OPTIONS = [
  { value: 'brain', label: '🧠' },
  { value: 'coffee', label: '☕' },
  { value: 'book', label: '📚' },
  { value: 'check', label: '✅' },
];
const COLOR_OPTIONS = [
  { value: 'blue', label: 'Blue', className: 'bg-blue-500' },
  { value: 'green', label: 'Green', className: 'bg-green-500' },
  { value: 'yellow', label: 'Yellow', className: 'bg-yellow-400' },
  { value: 'red', label: 'Red', className: 'bg-red-500' },
  { value: 'primary-500', label: 'Default', className: 'bg-primary-500' },
];

export const ScheduleList = forwardRef<any, ScheduleListProps>(({ 
    schedule,
    setSchedule,
    completionStatus,
    onSubTaskToggle,
    onSelectTask,
    selectedTaskIdx,
    onAddTask,
    onStart,
    onStop,
}, ref) => {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [form, setForm] = useState<ScheduleItem>(emptyBlock);
    const [adding, setAdding] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

    // Add subtask management state
    const [subtaskInput, setSubtaskInput] = useState('');
    const [subtasks, setSubtasks] = useState(form.subtasks || []);
    // Gemini integration
    const [loadingGemini, setLoadingGemini] = useState(false);
    const [showGeminiInput, setShowGeminiInput] = useState(false);
    const [geminiPrompt, setGeminiPrompt] = useState('');

    const addFormRef = useRef<HTMLFormElement | null>(null);
    const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Scroll to selected block on desktop when selectedTaskIdx changes
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth >= 768 && selectedTaskIdx !== null && blockRefs.current[selectedTaskIdx]) {
            blockRefs.current[selectedTaskIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [selectedTaskIdx]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAdd = () => {
        setForm(emptyBlock);
        setEditingIndex(null);
        setAdding(true);
        if (onAddTask) onAddTask(); // notify parent if needed
        setTimeout(() => {
            addFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            addFormRef.current?.querySelector('input[name="title"]')?.focus();
        }, 50);
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
        const blockWithSubtasks = { ...form, subtasks };
        if (editingIndex !== null) {
            newSchedule[editingIndex] = blockWithSubtasks;
        } else {
            newSchedule.push(blockWithSubtasks);
        }
        setSchedule(newSchedule);
        setEditingIndex(null);
        setAdding(false);
        setForm(emptyBlock);
        setSubtasks([]);
    };

    const handleCancel = () => {
        setEditingIndex(null);
        setAdding(false);
        setForm(emptyBlock);
    };

    const handleSubtaskAdd = () => {
      if (subtaskInput.trim()) {
        setSubtasks([...subtasks, { id: uuidv4(), text: subtaskInput.trim(), completed: false }]);
        setSubtaskInput('');
      }
    };
    const handleSubtaskRemove = (idx: number) => {
      setSubtasks(subtasks.filter((_, i) => i !== idx));
    };
    const handleSubtaskToggle = (idx: number) => {
      setSubtasks(subtasks.map((s, i) => i === idx ? { ...s, completed: !s.completed } : s));
    };
    const handleIconChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setForm({ ...form, icon: e.target.value });
    };
    const handleColorChange = (color: string) => {
      setForm({ ...form, color });
    };

    const handleGeminiGenerate = async () => {
        if (!geminiPrompt.trim()) return;
        setLoadingGemini(true);
        const prompt = `${geminiPrompt}\n\nReply with a JSON array of schedule blocks, each with: title, start, end, and notes. Example:\n[\n  {"title": "Wake up + Prep", "start": "07:00", "end": "07:30", "notes": "Light breakfast, music"},\n  {"title": "Trading (Live / Analysis)", "start": "07:30", "end": "11:30", "notes": "Focused session"}\n]`;
        try {
            const newSchedule = await generateScheduleWithGemini(prompt);
            setSchedule(newSchedule);
            setShowGeminiInput(false);
            setGeminiPrompt('');
        } catch (e: any) {
            alert('Gemini error: ' + (e.message || e));
        }
 finally {
            setLoadingGemini(false);
        }
    };

    useImperativeHandle(ref, () => ({
        handleAdd
    }));

    return (
        <div className="space-y-3">
            {schedule.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                    <Plus className="mx-auto mb-2 w-10 h-10 text-primary-400" />
                    <div className="text-lg">No blocks yet. Click the <span className='inline-block align-middle'><Plus className='inline w-5 h-5' /></span> button to add your first block!</div>
                </div>
            )}
            {schedule.map((item, idx) => {
                // Only allow inline editing on mobile (md:hidden)
                const isEditing = editingIndex === idx && typeof window !== 'undefined' && window.innerWidth < 768;
                return (
                    <div
                        key={item.title + item.start}
                        ref={el => blockRefs.current[idx] = el}
                        className={`relative group ${selectedTaskIdx === idx ? 'ring-2 ring-primary-500 ring-offset-2 z-10 bg-primary-50 dark:bg-primary-900/30' : ''}`}
                        onClick={() => onSelectTask && editingIndex === null && !adding ? onSelectTask(idx) : undefined}
                        tabIndex={0}
                        aria-selected={selectedTaskIdx === idx}
                        role="button"
                        aria-label={`Open details for ${item.title}`}
                    >
                        {isEditing ? (
                            <form onSubmit={handleFormSubmit} className="mb-2 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col gap-2 border border-primary-200 dark:border-primary-700 animate-fade-in md:hidden">
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleInputChange}
                                    placeholder="Title"
                                    className="w-full p-2 rounded border focus:ring-2 focus:ring-primary-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="time"
                                        name="start"
                                        value={form.start}
                                        onChange={handleInputChange}
                                        className="w-1/2 p-2 rounded border focus:ring-2 focus:ring-primary-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                                    />
                                    <input
                                        type="time"
                                        name="end"
                                        value={form.end}
                                        onChange={handleInputChange}
                                        className="w-1/2 p-2 rounded border focus:ring-2 focus:ring-primary-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                                    />
                                </div>
                                <div className="flex gap-2 items-center mt-2">
                                    <label className="text-sm">Icon:</label>
                                    <select value={form.icon || ''} onChange={handleIconChange} className="rounded border p-1 text-gray-900 dark:text-white bg-white dark:bg-gray-800">
                                        <option value="">None</option>
                                        {ICON_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    <label className="text-sm ml-4">Color:</label>
                                    <div className="flex gap-1">
                                        {COLOR_OPTIONS.map(opt => (
                                            <button type="button" key={opt.value} className={`w-6 h-6 rounded-full border-2 ${form.color === opt.value ? 'border-black' : 'border-transparent'} ${opt.className}`} onClick={() => handleColorChange(opt.value)} aria-label={opt.label}></button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <label className="text-sm font-medium">Sub-tasks:</label>
                                    <div className="flex gap-2 mt-1">
                                        <input
                                            type="text"
                                            value={subtaskInput}
                                            onChange={e => setSubtaskInput(e.target.value)}
                                            placeholder="Add sub-task"
                                            className="flex-1 p-2 rounded border text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                                        />
                                        <button type="button" onClick={handleSubtaskAdd} className="bg-primary-500 text-white px-3 py-1 rounded hover:bg-primary-600">Add</button>
                                    </div>
                                    <ul className="mt-2 space-y-1">
                                        {subtasks.map((sub, i) => (
                                            <li key={sub.id} className="flex items-center gap-2">
                                                <input type="checkbox" checked={sub.completed} onChange={e => { e.stopPropagation(); handleSubtaskToggle(i); }} />
                                                <span className={sub.completed ? 'line-through text-gray-400' : ''}>{sub.text}</span>
                                                <button type="button" onClick={() => handleSubtaskRemove(i)} className="text-xs text-red-500 ml-2">Remove</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <button type="submit" className="flex-1 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition">Save</button>
                                    <button type="button" className="flex-1 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded" onClick={handleCancel}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <ScheduleItem
                                    item={item}
                                    isActive={item.isRunning || false}
                                    isCompleted={completionStatus[item.title] || false}
                                    onSubTaskToggle={subIdx => onSubTaskToggle(idx, subIdx)}
                                    onStart={() => onStart(item.title)}
                                    onStop={() => onStop(item.title)}
                                />
                            </>
                        )}
                    </div>
                );
            })}
            {adding && (
                <form ref={addFormRef} onSubmit={handleFormSubmit} className="mb-2 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col gap-2 border border-primary-200 dark:border-primary-700 animate-fade-in">
                    <input
                        name="title"
                        value={form.title}
                        onChange={handleInputChange}
                        placeholder="Title"
                        className="w-full p-2 rounded border focus:ring-2 focus:ring-primary-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <input
                            type="time"
                            name="start"
                            value={form.start}
                            onChange={handleInputChange}
                            className="w-1/2 p-2 rounded border focus:ring-2 focus:ring-primary-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                        />
                        <input
                            type="time"
                            name="end"
                            value={form.end}
                            onChange={handleInputChange}
                            className="w-1/2 p-2 rounded border focus:ring-2 focus:ring-primary-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                        />
                    </div>
                    <div className="flex gap-2 items-center mt-2">
                        <label className="text-sm">Icon:</label>
                        <select value={form.icon || ''} onChange={handleIconChange} className="rounded border p-1 text-gray-900 dark:text-white bg-white dark:bg-gray-800">
                            <option value="">None</option>
                            {ICON_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <label className="text-sm ml-4">Color:</label>
                        <div className="flex gap-1">
                            {COLOR_OPTIONS.map(opt => (
                                <button type="button" key={opt.value} className={`w-6 h-6 rounded-full border-2 ${form.color === opt.value ? 'border-black' : 'border-transparent'} ${opt.className}`} onClick={() => handleColorChange(opt.value)} aria-label={opt.label}></button>
                            ))}
                        </div>
                    </div>
                    <div className="mt-2">
                        <label className="text-sm font-medium">Sub-tasks:</label>
                        <div className="flex gap-2 mt-1">
                            <input
                                type="text"
                                value={subtaskInput}
                                onChange={e => setSubtaskInput(e.target.value)}
                                placeholder="Add sub-task"
                                className="flex-1 p-2 rounded border text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                            />
                            <button type="button" onClick={handleSubtaskAdd} className="bg-primary-500 text-white px-3 py-1 rounded hover:bg-primary-600">Add</button>
                        </div>
                        <ul className="mt-2 space-y-1">
                            {subtasks.map((sub, i) => (
                                <li key={sub.id} className="flex items-center gap-2">
                                    <input type="checkbox" checked={sub.completed} onChange={e => { e.stopPropagation(); handleSubtaskToggle(i); }} />
                                    <span className={sub.completed ? 'line-through text-gray-400' : ''}>{sub.text}</span>
                                    <button type="button" onClick={() => handleSubtaskRemove(i)} className="text-xs text-red-500 ml-2">Remove</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex gap-2 mt-2">
                        <button type="submit" className="flex-1 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition">Add</button>
                        <button type="button" className="flex-1 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded" onClick={handleCancel}>Cancel</button>
                    </div>
                </form>
            )}
            {/* Only show add button on mobile */}
            <button
                className="fixed bottom-20 right-4 left-auto md:hidden z-40 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-3xl transition-transform transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary-300"
                onClick={handleAdd}
                disabled={adding || editingIndex !== null}
                aria-label="Add Block"
                title="Add Block"
                style={{maxWidth: '100vw'}}>
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
                            <button onClick={cancelDelete} className="bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default ScheduleList;