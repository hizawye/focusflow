import React from 'react';
import { Toast, ToastType } from '../hooks/useToast';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

/**
 * Toast icon mapping based on type
 */
const ToastIcon: React.FC<{ type: ToastType }> = ({ type }) => {
  const iconClass = "w-5 h-5";

  switch (type) {
    case 'success':
      return <CheckCircle className={`${iconClass} text-green-500`} />;
    case 'error':
      return <XCircle className={`${iconClass} text-red-500`} />;
    case 'warning':
      return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
    case 'info':
    default:
      return <Info className={`${iconClass} text-blue-500`} />;
  }
};

/**
 * Individual toast notification component
 */
const ToastItem: React.FC<{
  toast: Toast;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  const { id, message, type } = toast;

  const bgColorClass = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  }[type];

  const textColorClass = {
    success: 'text-green-800 dark:text-green-200',
    error: 'text-red-800 dark:text-red-200',
    warning: 'text-yellow-800 dark:text-yellow-200',
    info: 'text-blue-800 dark:text-blue-200',
  }[type];

  return (
    <div
      className={`
        ${bgColorClass} ${textColorClass}
        border rounded-lg shadow-lg p-4 mb-3
        flex items-start gap-3
        animate-slide-in-right
        max-w-md w-full
      `}
      role="alert"
      aria-live="polite"
    >
      <ToastIcon type={type} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

/**
 * Toast notification container
 *
 * Displays toast notifications in the top-right corner of the screen.
 * Auto-dismisses after 5 seconds, or user can manually dismiss.
 *
 * @example
 * <ToastContainer toasts={toasts} onDismiss={dismissToast} />
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="
        fixed top-20 right-4 z-50
        flex flex-col items-end
        pointer-events-none
      "
      aria-label="Notifications"
    >
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
};
