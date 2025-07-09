import React, { useState, useEffect } from 'react';
import { useScheduleFromConvex, useCompletionStatusFromConvex } from '../hooks/useConvexSchedule';
import { ScheduleItem } from '../types';

/**
 * Example component showing how to use Convex in your FocusFlow app
 * This replaces localStorage-based state management with Convex
 */
export const ConvexScheduleExample: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  
  // Use Convex hooks instead of localStorage
  const { 
    scheduleItems, 
    addScheduleItem, 
    updateItem, 
    deleteItem, 
    setAllItems,
    isLoading: scheduleLoading 
  } = useScheduleFromConvex(today);
  
  const { 
    completionStatus, 
    setStatus, 
    toggleStatus,
    isLoading: statusLoading 
  } = useCompletionStatusFromConvex(today);

  // Loading state
  if (scheduleLoading || statusLoading) {
    return <div>Loading...</div>;
  }

  // Example: Add a new schedule item
  const handleAddItem = async () => {
    const newItem: Omit<ScheduleItem, '_id'> = {
      title: 'New Task',
      start: '09:00',
      end: '10:00',
      remainingDuration: 3600,
      isRunning: false,
      icon: 'clock',
      color: 'blue',
    };
    
    await addScheduleItem(newItem);
  };

  // Example: Update an item (start/stop timer)
  const handleStartTask = async (title: string) => {
    const item = scheduleItems.find(item => item.title === title);
    if (item) {
      // Note: You'll need to get the actual Convex ID from your data
      // This is just an example of how the API would work
      // await updateItem(item._id, { isRunning: true });
    }
  };

  // Example: Toggle completion status
  const handleToggleCompletion = async (scheduleItemId: string) => {
    // await toggleStatus(scheduleItemId);
  };

  return (
    <div>
      <h2>Schedule Items from Convex</h2>
      
      <button onClick={handleAddItem}>
        Add New Item
      </button>

      <div>
        {scheduleItems.map((item, index) => (
          <div key={index} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h3>{item.title}</h3>
            <p>Time: {item.start} - {item.end}</p>
            <p>Running: {item.isRunning ? 'Yes' : 'No'}</p>
            <p>Remaining: {item.remainingDuration} seconds</p>
            
            {item.subtasks && item.subtasks.length > 0 && (
              <div>
                <h4>Subtasks:</h4>
                <ul>
                  {item.subtasks.map((subtask) => (
                    <li key={subtask.id}>
                      {subtask.text} - {subtask.completed ? 'Done' : 'Pending'}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button onClick={() => handleStartTask(item.title)}>
              Start Task
            </button>
          </div>
        ))}
      </div>

      <div>
        <h3>Completion Status</h3>
        <pre>{JSON.stringify(completionStatus, null, 2)}</pre>
      </div>
    </div>
  );
};

export default ConvexScheduleExample;
