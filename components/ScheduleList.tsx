import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ScheduleItem as ScheduleItemType } from '../types.ts';
import { ScheduleItem } from './ScheduleItem.tsx';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { generateScheduleWithGemini } from '../gemini';
import { useScheduleFromConvex } from '../hooks/useConvexSchedule';

/**
 * ScheduleList Component Props
 * 
 * This component manages the main schedule interface where users can view,
 * add, edit, and delete schedule items. It integrates with Convex for real-time
 * data synchronization and provides a rich editing experience.
 */
interface ScheduleListProps {
    schedule: ScheduleItemType[];               // Array of schedule items to display
    completionStatus: { [key: string]: boolean }; // Completion status for each item
    currentBlock?: ScheduleItemType | null;     // Currently active/running block
    onSubTaskToggle?: (blockIdx: number, subIdx: number) => void; // Subtask toggle handler
    onSelectTask?: (idx: number) => void;       // Task selection handler
    selectedTaskIdx?: number | null;            // Currently selected task index
    onAddTask?: () => void;                     // Add task button handler
    onStart?: (title: string) => void;          // Start timer handler
    onStop?: (title: string) => void;           // Stop timer handler
    onPause?: (title: string) => void;          // Pause timer handler
    onResume?: (title: string) => void;         // Resume timer handler
    runningTaskTitle?: string | null;           // Title of currently running task
    timers?: {[key: string]: number};           // Timer state for each task
}

// Default empty block template for new schedule items
const emptyBlock: ScheduleItemType = { title: '', start: '', end: '' };

// Available icon options for schedule items
const ICON_OPTIONS = [
  { value: 'brain', label: '🧠' },
  { value: 'coffee', label: '☕' },
  { value: 'book', label: '📚' },
  { value: 'check', label: '✅' },
];

// Available color options for schedule items
const COLOR_OPTIONS = [
  { value: 'blue', label: 'Blue', className: 'bg-blue-500' },
  { value: 'green', label: 'Green', className: 'bg-green-500' },
  { value: 'yellow', label: 'Yellow', className: 'bg-yellow-400' },
  { value: 'red', label: 'Red', className: 'bg-red-500' },
  { value: 'primary-500', label: 'Default', className: 'bg-primary-500' },
];

/**
 * ScheduleList Component
 * 
 * The main schedule management component that provides:
 * - Display of schedule items in chronological order
 * - Add/Edit/Delete functionality with inline forms
 * - Real-time synchronization with Convex database
 * - Subtask management for each schedule item
 * - AI-powered schedule generation via Gemini
 * - Drag-and-drop reordering (planned)
 * - Mobile-responsive design
 * 
 * @param props - ScheduleListProps containing schedule data and handlers
 * @param ref - Forward ref for parent component access
 */
export const ScheduleList = forwardRef<any, ScheduleListProps>(({ 
    schedule,
    completionStatus,
    onSubTaskToggle,
    onSelectTask,
    selectedTaskIdx,
    onAddTask,
    onStart,
    onStop,
    onPause,
    onResume,
    runningTaskTitle,
    timers,
}, ref) => {
    // ===== STATE MANAGEMENT =====
    
    // Form state for editing/adding schedule items
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [form, setForm] = useState<ScheduleItemType>(emptyBlock);
    const [adding, setAdding] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

    // Subtask management state
    const [subtaskInput, setSubtaskInput] = useState('');
    const [subtasks, setSubtasks] = useState(form.subtasks || []);
    
    // Gemini AI integration state
    const [loadingGemini, setLoadingGemini] = useState(false);
    const [showGeminiInput, setShowGeminiInput] = useState(false);
    const [geminiPrompt, setGeminiPrompt] = useState('');

    // ===== CONVEX INTEGRATION =====
    
    // Get current date for data queries
    const today = new Date().toISOString().split('T')[0];
    
    // Convex hooks for real-time database operations
    const { addScheduleItem, updateItem, deleteItem } = useScheduleFromConvex(today);

    // ===== REFS =====
    
    // Form reference for auto-scrolling and focus management
    const addFormRef = useRef<HTMLFormElement | null>(null);
    
    // Block references for smooth scrolling to selected items
    const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

    // ===== EFFECTS =====
    
    /**
     * Auto-scroll to selected block on desktop
     * When a task is selected, smoothly scroll it into view for better UX
     */
    useEffect(() => {
        if (typeof window !== 'undefined' && 
            window.innerWidth >= 768 && 
            selectedTaskIdx !== null && 
            selectedTaskIdx !== undefined &&
            selectedTaskIdx >= 0 &&
            blockRefs.current[selectedTaskIdx]) {
            blockRefs.current[selectedTaskIdx]?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }, [selectedTaskIdx]);

    // ===== FORM HANDLERS =====
    
    /**
     * Handle form input changes
     * Updates the form state when user types in input fields
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    /**
     * Handle adding a new schedule item
     * Shows the add form and scrolls to it for better UX
     */
    const handleAdd = () => {
        console.log('➕ Opening add form');
        setForm(emptyBlock);
        setEditingIndex(null);
        setAdding(true);
        
        // Notify parent component
        if (onAddTask) onAddTask();
        
        // Auto-scroll to form and focus first input
        setTimeout(() => {
            addFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const titleInput = addFormRef.current?.querySelector('input[name="title"]') as HTMLInputElement;
            titleInput?.focus();
        }, 50);
    };

    /**
     * Handle editing an existing schedule item
     * Populates the form with current item data
     */
    const handleEdit = (idx: number) => {
        console.log('✏️ Editing schedule item at index:', idx);
        setForm(schedule[idx]);
        setEditingIndex(idx);
        setAdding(false);
        setSubtasks(schedule[idx].subtasks || []);
    };

    /**
     * Handle delete confirmation
     * Shows confirmation dialog before deleting
     */
    const handleDelete = (idx: number) => {
        console.log('🗑️ Requesting delete for index:', idx);
        setDeleteIndex(idx);
    };

    // Use handlers (for TypeScript)
    void handleEdit;
    void handleDelete;
    
    /**
     * Confirm deletion and execute delete operation
     * Uses Convex mutation to remove item from database
     */
    const confirmDelete = async () => {
        if (deleteIndex !== null) {
            console.log('🔄 Deleting schedule item...');
            try {
                // Use Convex mutation to delete item
                // Note: This assumes schedule items have _id field from Convex
                // @ts-ignore - Temporary ignore for _id field
                await deleteItem(schedule[deleteIndex]._id);
                console.log('✅ Schedule item deleted successfully');
                
                // Reset delete state
                setDeleteIndex(null);
                
                // Clear selection if deleted item was selected
                if (selectedTaskIdx === deleteIndex && onSelectTask) {
                    onSelectTask(-1); // Use -1 to indicate no selection
                }
            } catch (error) {
                console.error('❌ Error deleting schedule item:', error);
                alert('Failed to delete schedule item. Please try again.');
            }
        }
    };

    /**
     * Cancel delete operation
     * Hides the confirmation dialog
     */
    const cancelDelete = () => {
        console.log('❌ Delete cancelled');
        setDeleteIndex(null);
    };

    // ===== SUBTASK HANDLERS =====
    
    /**
     * Add a new subtask to the current form
     * Manages subtasks array in form state
     */
    const handleAddSubtask = () => {
        if (subtaskInput.trim()) {
            console.log('➕ Adding subtask:', subtaskInput);
            const newSubtasks = [...subtasks, { id: uuidv4(), text: subtaskInput.trim(), completed: false }];
            setSubtasks(newSubtasks);
            setForm({ ...form, subtasks: newSubtasks });
            setSubtaskInput('');
        }
    };

    /**
     * Remove a subtask from the current form
     * Filters out the subtask by ID or index
     */
    const handleRemoveSubtask = (indexOrId: string | number) => {
        console.log('🗑️ Removing subtask:', indexOrId);
        let newSubtasks;
        if (typeof indexOrId === 'string') {
            newSubtasks = subtasks.filter(subtask => subtask.id !== indexOrId);
        } else {
            newSubtasks = subtasks.filter((_, index) => index !== indexOrId);
        }
        setSubtasks(newSubtasks);
        setForm({ ...form, subtasks: newSubtasks });
    };

    /**
     * Toggle subtask completion in the form
     * Updates the subtask's completed status
     */
    const handleSubtaskToggle = (index: number) => {
        console.log('🔄 Toggling subtask at index:', index);
        const newSubtasks = [...subtasks];
        if (newSubtasks[index]) {
            newSubtasks[index].completed = !newSubtasks[index].completed;
            setSubtasks(newSubtasks);
            setForm({ ...form, subtasks: newSubtasks });
        }
    };

    /**
     * Save schedule item (add or update)
     * Handles both adding new items and updating existing ones
     */
    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        // Validate required fields
        if (!form.title || !form.start || !form.end) {
            alert('Please fill in all required fields');
            return;
        }

        // Validate time format and logic
        if (form.start >= form.end) {
            alert('Start time must be before end time');
            return;
        }

        console.log('🔄 Saving schedule item...');
        
        try {
            if (editingIndex !== null) {
                // Update existing item
                // @ts-ignore - Temporary ignore for _id field
                await updateItem(schedule[editingIndex]._id, form);
                console.log('✅ Schedule item updated successfully');
            } else {
                // Add new item
                await addScheduleItem(form);
                console.log('✅ Schedule item added successfully');
            }
            
            // Reset form state
            handleCancel();
            
        } catch (error) {
            console.error('❌ Error saving schedule item:', error);
            alert('Failed to save schedule item. Please try again.');
        }
    };

    /**
     * Cancel editing/adding
     * Resets form state and hides forms
     */
    const handleCancel = () => {
        console.log('❌ Form cancelled');
        setForm(emptyBlock);
        setEditingIndex(null);
        setAdding(false);
        setSubtasks([]);
        setSubtaskInput('');
    };

    // ===== GEMINI AI HANDLERS =====
    
    /**
     * Generate a single task using Gemini AI
     * Takes natural language prompt and generates a single schedule item
     */
    const handleGeminiGenerate = async () => {
        if (!geminiPrompt.trim()) return;
        
        console.log('🤖 Generating task with Gemini:', geminiPrompt);
        setLoadingGemini(true);
        
        try {
            const generatedSchedule = await generateScheduleWithGemini(
                `Create a single schedule item based on this description: "${geminiPrompt}". 
                Return only one task in the JSON array format with title, start time, and end time.
                Make sure the times are realistic and in HH:MM format.
                Example format: [{"title": "Study Math", "start": "09:00", "end": "10:30"}]`
            );
            
            console.log('✅ Task generated successfully:', generatedSchedule);
            
            // Take only the first item if multiple were generated
            const taskToAdd = generatedSchedule[0];
            if (taskToAdd) {
                await addScheduleItem(taskToAdd);
            }
            
            // Reset Gemini state
            setGeminiPrompt('');
            setShowGeminiInput(false);
            
        } catch (error) {
            console.error('❌ Error generating task:', error);
            alert('Failed to generate task. Please try again.');
        } finally {
            setLoadingGemini(false);
        }
    };

    /**
     * Use AI to help fill the current form
     * Takes natural language and fills form fields
     */
    const handleAIFormFill = async () => {
        if (!geminiPrompt.trim()) return;
        
        console.log('🤖 Getting AI help for form:', geminiPrompt);
        setLoadingGemini(true);
        
        try {
            const generatedSchedule = await generateScheduleWithGemini(
                `Based on this description: "${geminiPrompt}", create a single task with title, start time, and end time.
                Return only one task in JSON array format with realistic times in HH:MM format.
                Example: [{"title": "Study Math", "start": "09:00", "end": "10:30"}]`
            );
            
            const aiTask = generatedSchedule[0];
            if (aiTask) {
                // Fill the form with AI-generated data
                setForm({
                    ...form,
                    title: aiTask.title || form.title,
                    start: aiTask.start || form.start,
                    end: aiTask.end || form.end
                });
            }
            
            // Reset Gemini state
            setGeminiPrompt('');
            setShowGeminiInput(false);
            
        } catch (error) {
            console.error('❌ Error getting AI help:', error);
            alert('Failed to get AI help. Please try again.');
        } finally {
            setLoadingGemini(false);
        }
    };

    // ===== IMPERATIVE HANDLE =====
    
    /**
     * Expose methods to parent component via ref
     * Allows parent to trigger actions like adding items
     */
    useImperativeHandle(ref, () => ({
        addItem: handleAdd,
        showGeminiInput: () => setShowGeminiInput(true)
    }));

    // ===== RENDER HELPERS =====
    
    /**
     * Render the add/edit form
     * Shows form for creating new items or editing existing ones
     */
    const renderForm = () => (
        <form
            ref={addFormRef}
            onSubmit={(e) => {
                e.preventDefault();
                handleSave();
            }}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-4"
        >
            {/* Form title and AI helper */}
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {editingIndex !== null ? 'Edit Schedule Item' : 'Add New Schedule Item'}
                </h3>
                <button
                    type="button"
                    onClick={() => setShowGeminiInput(true)}
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-1 text-sm"
                >
                    <span role="img" aria-label="AI">🤖</span>
                    AI Help
                </button>
            </div>

            {/* Basic fields */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Title *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleInputChange}
                        placeholder="Enter task title"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Start Time *
                        </label>
                        <input
                            type="time"
                            name="start"
                            value={form.start}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            End Time *
                        </label>
                        <input
                            type="time"
                            name="end"
                            value={form.end}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>
                </div>

                {/* Icon and Color selection */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Icon
                        </label>
                        <select
                            name="icon"
                            value={form.icon || ''}
                            onChange={(e) => setForm({ ...form, icon: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Select icon...</option>
                            {ICON_OPTIONS.map(icon => (
                                <option key={icon.value} value={icon.value}>
                                    {icon.label} {icon.value}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Color
                        </label>
                        <select
                            name="color"
                            value={form.color || ''}
                            onChange={(e) => setForm({ ...form, color: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Select color...</option>
                            {COLOR_OPTIONS.map(color => (
                                <option key={color.value} value={color.value}>
                                    {color.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Subtasks section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subtasks
                    </label>
                    
                    {/* Existing subtasks */}
                    {subtasks.length > 0 && (
                        <div className="space-y-2 mb-3">
                            {subtasks.map((subtask) => (
                                <div key={subtask.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                    <span className="text-gray-700 dark:text-gray-300">{subtask.text}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSubtask(subtask.id)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add subtask input */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={subtaskInput}
                            onChange={(e) => setSubtaskInput(e.target.value)}
                            placeholder="Add a subtask..."
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddSubtask();
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={handleAddSubtask}
                            className="px-3 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Form actions */}
            <div className="flex justify-end gap-2 mt-6">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    {editingIndex !== null ? 'Update' : 'Add'} Schedule Item
                </button>
            </div>
        </form>
    );

    /**
     * Render the Gemini AI input form
     * Shows form for generating schedule items with AI
     */
    const renderGeminiInput = () => {
        const isFormOpen = adding || editingIndex !== null;
        
        return (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-lg w-full animate-fade-in">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                        <span role="img" aria-label="AI">🤖</span> 
                        {isFormOpen ? 'AI Form Helper' : 'Create Task with AI'}
                    </h3>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {isFormOpen ? 'Describe what you want to do with this task' : 'Describe the task you want to create'}
                        </label>
                        <textarea
                            value={geminiPrompt}
                            onChange={(e) => setGeminiPrompt(e.target.value)}
                            placeholder={isFormOpen ? 
                                "Example: Make this a 2-hour study session starting at 2pm" : 
                                "Example: Create a 2-hour study session for math from 2pm to 4pm"
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white min-h-[120px]"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={isFormOpen ? handleAIFormFill : handleGeminiGenerate}
                            disabled={loadingGemini || !geminiPrompt.trim()}
                            className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {loadingGemini ? (
                                <>
                                    <span className="animate-spin">⚡</span>
                                    {isFormOpen ? 'Helping...' : 'Creating...'}
                                </>
                            ) : (
                                <>{isFormOpen ? 'Fill Form' : 'Create Task'}</>
                            )}
                        </button>
                        <button
                            onClick={() => {
                                setShowGeminiInput(false);
                                setGeminiPrompt('');
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ===== MAIN RENDER =====
    return (
        <div className="relative">
            {/* Schedule Items */}
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
                            ref={el => { blockRefs.current[idx] = el; }}
                            className={`relative group ${selectedTaskIdx === idx ? 'ring-2 ring-primary-500 ring-offset-2 z-10 bg-primary-50 dark:bg-primary-900/30' : ''}`}
                            tabIndex={0}
                            aria-selected={selectedTaskIdx === idx}
                            role="button"
                            aria-label={`Open details for ${item.title}`}
                        >
                            {isEditing ? (
                                <form onSubmit={handleSave} className="mb-2 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col gap-2 border border-primary-200 dark:border-primary-700 animate-fade-in md:hidden">
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
                                        <select value={form.icon || ''} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="rounded border p-1 text-gray-900 dark:text-white bg-white dark:bg-gray-800">
                                            <option value="">None</option>
                                            {ICON_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        <label className="text-sm ml-4">Color:</label>
                                        <div className="flex gap-1">
                                            {COLOR_OPTIONS.map(opt => (
                                                <button type="button" key={opt.value} className={`w-6 h-6 rounded-full border-2 ${form.color === opt.value ? 'border-black' : 'border-transparent'} ${opt.className}`} onClick={() => setForm({ ...form, color: opt.value })} aria-label={opt.label}></button>
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
                                            <button type="button" onClick={handleAddSubtask} className="bg-primary-500 text-white px-3 py-1 rounded hover:bg-primary-600">Add</button>
                                        </div>
                                        <ul className="mt-2 space-y-1">
                                            {subtasks.map((sub, i) => (
                                                <li key={sub.id} className="flex items-center gap-2">
                                                    <input type="checkbox" checked={sub.completed} onChange={e => { e.stopPropagation(); handleSubtaskToggle(i); }} />
                                                    <span className={sub.completed ? 'line-through text-gray-400' : ''}>{sub.text}</span>
                                                    <button type="button" onClick={() => handleRemoveSubtask(i)} className="text-xs text-red-500 ml-2">Remove</button>
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
                                        item={{
                                            ...item,
                                            // Force the isRunning state from the runningTaskTitle prop
                                            isRunning: runningTaskTitle === item.title ? true : false,
                                            remainingDuration: timers?.[item.title] || item.remainingDuration
                                        }}
                                        isActive={runningTaskTitle === item.title}
                                        isCompleted={completionStatus[item.title] || false}
                                        onSubTaskToggle={(subIdx: number) => onSubTaskToggle?.(idx, subIdx)}
                                        onStart={() => onStart?.(item.title)}
                                        onStop={() => onStop?.(item.title)}
                                        onPause={() => onPause?.(item.title)}
                                        onResume={() => onResume?.(item.title)}
                                        onSelect={() => onSelectTask && editingIndex === null && !adding ? onSelectTask(idx) : undefined}
                                    />
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Add form */}
            {adding && renderForm()}
            
            {/* Action buttons */}
            <div className="fixed bottom-20 right-4 left-auto md:hidden z-40 flex flex-col gap-4">
                {/* AI Button */}
                <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-3xl transition-transform transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-indigo-300"
                    onClick={() => setShowGeminiInput(true)}
                    disabled={adding || editingIndex !== null}
                    aria-label="Use AI"
                    title="Use AI to generate schedule">
                    <span role="img" aria-label="AI" className="text-2xl">🤖</span>
                </button>
                {/* Add Button */}
                <button
                    className="bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-3xl transition-transform transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary-300"
                    onClick={handleAdd}
                    disabled={adding || editingIndex !== null}
                    aria-label="Add Block"
                    title="Add Block">
                    <Plus className="w-8 h-8" />
                </button>
            </div>

            {/* Delete confirmation modal */}
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

            {/* Gemini AI input modal */}
            {showGeminiInput && renderGeminiInput()}
        </div>
    );
});

export default ScheduleList;