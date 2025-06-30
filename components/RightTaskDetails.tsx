import React, { useState, useEffect } from 'react';
import { ScheduleItem, SubTask } from '../types';

interface RightTaskDetailsProps {
  task: ScheduleItem;
  onDelete: () => void;
  onUpdate: (updated: ScheduleItem) => void;
  onClose: () => void;
}

export const RightTaskDetails: React.FC<RightTaskDetailsProps> = ({ task, onDelete, onUpdate, onClose }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ScheduleItem>(task);
  const [note, setNote] = useState(''); // Placeholder for notes, could be part of ScheduleItem

  // Sync form state with task prop when task changes
  useEffect(() => {
    setForm(task);
  }, [task]);

  // Handle field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle subtask add
  const [subtaskInput, setSubtaskInput] = useState('');
  const handleSubtaskAdd = () => {
    if (subtaskInput.trim()) {
      const newSub: SubTask = { id: Date.now().toString(), text: subtaskInput.trim(), completed: false };
      setForm({ ...form, subtasks: [...(form.subtasks || []), newSub] });
      setSubtaskInput('');
    }
  };
  // Handle subtask remove
  const handleSubtaskRemove = (idx: number) => {
    setForm({ ...form, subtasks: (form.subtasks || []).filter((_, i) => i !== idx) });
  };
  // Handle subtask toggle
  const handleSubtaskToggle = (idx: number) => {
    setForm({
      ...form,
      subtasks: (form.subtasks || []).map((s, i) => i === idx ? { ...s, completed: !s.completed } : s)
    });
  };

  // Save edits
  const handleSave = () => {
    onUpdate(form);
    setEditing(false);
  };

  // Cancel edits
  const handleCancel = () => {
    setForm(task);
    setEditing(false);
  };

  // Helper: is task finished?
  const isFinished = (() => {
    if (!form.end) return false;
    const [h, m] = form.end.split(":").map(Number);
    const endDate = new Date();
    endDate.setHours(h, m, 0, 0);
    return new Date() > endDate;
  })();

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-block w-4 h-4 rounded-full" style={{background: form.color}}></span>
        {editing ? (
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="text-xl font-bold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary-500 text-gray-900 dark:text-white"
          />
        ) : (
          <span className="text-xl font-bold">{form.title}</span>
        )}
        {form.icon && <span className="ml-2 text-2xl">{form.icon}</span>}
        <button onClick={onClose} className="ml-auto text-gray-400 hover:text-primary-500 text-xl" title="Close">×</button>
      </div>
      <div className="flex gap-2 mb-2">
        {editing ? (
          <>
            <input
              type="time"
              name="start"
              value={form.start}
              onChange={handleChange}
              className="p-1 rounded border text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            />
            <input
              type="time"
              name="end"
              value={form.end}
              onChange={handleChange}
              className="p-1 rounded border text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            />
            <select
              name="icon"
              value={form.icon || ''}
              onChange={handleChange}
              className="rounded border p-1 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            >
              <option value="">No icon</option>
              <option value="brain">🧠</option>
              <option value="coffee">☕</option>
              <option value="book">📚</option>
              <option value="check">✅</option>
            </select>
            <input
              type="color"
              name="color"
              value={/^#([0-9A-Fa-f]{6})$/.test(form.color || '') ? form.color : '#3b82f6'}
              onChange={handleChange}
              className="w-8 h-8 p-0 border-none bg-transparent"
            />
          </>
        ) : (
          <span className="text-gray-500 text-sm">{form.start} - {form.end}</span>
        )}
      </div>
      {/* Notes section */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Notes</label>
        {editing ? (
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full p-2 rounded border text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            rows={2}
            placeholder="Add notes..."
          />
        ) : (
          <div className="text-gray-600 dark:text-gray-300 min-h-[2em]">{note || <span className="italic text-gray-400">No notes</span>}</div>
        )}
      </div>
      {/* Subtasks management */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold">Subtasks</span>
          <span className="text-xs text-gray-400 font-normal">({(form.subtasks || []).filter(s => s.completed).length}/{form.subtasks?.length || 0} done)</span>
        </div>
        <ul className="list-disc pl-5 mb-2">
          {(form.subtasks || []).map((sub, i) => (
            <li key={sub.id} className="flex items-center gap-2">
              <input type="checkbox" checked={sub.completed} onChange={() => handleSubtaskToggle(i)} />
              {editing ? (
                <input
                  value={sub.text}
                  onChange={e => {
                    setForm({
                      ...form,
                      subtasks: (form.subtasks || []).map((s, idx) => idx === i ? { ...s, text: e.target.value } : s)
                    });
                  }}
                  className="p-1 rounded border text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                />
              ) : (
                <span className={sub.completed ? 'line-through text-gray-400' : ''}>{sub.text}</span>
              )}
              {editing && (
                <button onClick={() => handleSubtaskRemove(i)} className="text-xs text-red-500 ml-2">Remove</button>
              )}
            </li>
          ))}
        </ul>
        {editing && (
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
        )}
      </div>
      {/* Edit/Delete controls */}
      <div className="flex flex-col gap-2 mt-4">
        {/* Manual status controls - always show on mobile, only show on desktop if not editing */}
        <div className="mb-2 block md:hidden">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-400">Mark as:</span>
            <button
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors duration-150 border border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-green-400 ${form.manualStatus === 'done' ? 'bg-green-500 text-white' : 'bg-gray-800 text-green-300 hover:bg-green-600/20'}`}
              onClick={() => { setForm({ ...form, manualStatus: 'done' }); onUpdate({ ...form, manualStatus: 'done' }); }}
              disabled={!isFinished}
            >Done</button>
            <button
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors duration-150 border-2 border-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 ${form.manualStatus === 'missed' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-800 text-red-400 hover:bg-red-600/20'}`}
              onClick={() => { setForm({ ...form, manualStatus: 'missed' }); onUpdate({ ...form, manualStatus: 'missed' }); }}
              disabled={!isFinished}
            > Missed</button>
            <button
              className="px-3 py-1 rounded text-xs font-semibold bg-gray-700 text-gray-300 border border-gray-600/20 hover:bg-gray-600/80 focus:outline-none focus:ring-2 focus:ring-gray-400"
              onClick={() => { setForm({ ...form, manualStatus: undefined }); onUpdate({ ...form, manualStatus: undefined }); }}
              disabled={!form.manualStatus || !isFinished}
            >Clear</button>
          </div>
          {form.manualStatus && (
            <span className={`block mt-1 text-xs font-bold flex items-center gap-1 ${form.manualStatus === 'done' ? 'text-green-400' : 'text-red-500'}`}>{form.manualStatus === 'done' ? '✔ Marked as: Done' : <><svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="inline mr-1"><circle cx="10" cy="10" r="10"/></svg>Marked as: Missed</>}</span>
          )}
          {!isFinished && (
            <span className="block mt-1 text-xs text-yellow-400">You can mark status after the task ends.</span>
          )}
        </div>
        {/* Desktop controls (existing) */}
        {!editing && (
          <div className="mb-2 hidden md:block">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-400">Mark as:</span>
              <button
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors duration-150 border border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-green-400 ${form.manualStatus === 'done' ? 'bg-green-500 text-white' : 'bg-gray-800 text-green-300 hover:bg-green-600/20'}`}
                onClick={() => { setForm({ ...form, manualStatus: 'done' }); onUpdate({ ...form, manualStatus: 'done' }); }}
                disabled={!isFinished}
              >Done</button>
              <button
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors duration-150 border-2 border-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 ${form.manualStatus === 'missed' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-800 text-red-400 hover:bg-red-600/20'}`}
                onClick={() => { setForm({ ...form, manualStatus: 'missed' }); onUpdate({ ...form, manualStatus: 'missed' }); }}
                disabled={!isFinished}
              > Missed</button>
              <button
                className="px-3 py-1 rounded text-xs font-semibold bg-gray-700 text-gray-300 border border-gray-600/20 hover:bg-gray-600/80 focus:outline-none focus:ring-2 focus:ring-gray-400"
                onClick={() => { setForm({ ...form, manualStatus: undefined }); onUpdate({ ...form, manualStatus: undefined }); }}
                disabled={!form.manualStatus || !isFinished}
              >Clear</button>
            </div>
            {form.manualStatus && (
              <span className={`block mt-1 text-xs font-bold flex items-center gap-1 ${form.manualStatus === 'done' ? 'text-green-400' : 'text-red-500'}`}>{form.manualStatus === 'done' ? '✔ Marked as: Done' : <><svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="inline mr-1"><circle cx="10" cy="10" r="10"/></svg>Marked as: Missed</>}</span>
            )}
            {!isFinished && (
              <span className="block mt-1 text-xs text-yellow-400">You can mark status after the task ends.</span>
            )}
          </div>
        )}
        <div className="flex gap-2 w-full">
          {editing ? (
            <>
              <button onClick={handleSave} className="flex-1 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition">Save</button>
              <button onClick={handleCancel} className="flex-1 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Edit</button>
              <button onClick={onDelete} className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Delete</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RightTaskDetails;
