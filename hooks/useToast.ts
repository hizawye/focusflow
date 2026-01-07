import { useState, useCallback } from 'react';
import { TIMER_INTERVALS } from '../constants/intervals';

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Toast notification interface
 */
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  timestamp: number;
}

/**
 * Custom hook for managing toast notifications
 *
 * Replaces alert() calls with a better user experience.
 * Auto-dismisses toasts after 5 seconds.
 *
 * @example
 * const { toasts, showToast, dismissToast } = useToast();
 * showToast('Schedule saved successfully', 'success');
 * showToast('Failed to delete task', 'error');
 */
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  /**
   * Show a new toast notification
   * @param message - Toast message to display
   * @param type - Type of toast (success, error, info, warning)
   */
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = Date.now();

    console.log(`📢 Toast [${type.toUpperCase()}]: ${message}`);

    setToasts(prev => [...prev, { id, message, type, timestamp }]);

    // Auto-dismiss after configured time
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, TIMER_INTERVALS.TOAST_DISMISS);
  }, []);

  /**
   * Manually dismiss a toast notification
   * @param id - Toast ID to dismiss
   */
  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  /**
   * Clear all toast notifications
   */
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    dismissToast,
    clearAllToasts
  };
};
