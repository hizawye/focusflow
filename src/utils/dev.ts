/**
 * FocusFlow Development Utilities
 * 
 * This file provides helpful utilities for development, debugging, and testing.
 * These utilities are only available in development mode and help developers
 * understand the application state and debug issues more effectively.
 */

// Development mode check
export const isDevelopment = import.meta.env.DEV;

/**
 * Enhanced logging utility with emoji indicators and context
 * Provides consistent logging throughout the application
 */
const devLog = {
  /**
   * Log successful operations
   * @param message - The success message
   * @param data - Optional data to include
   */
  success: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`✅ ${message}`, data ? data : '');
    }
  },

  /**
   * Log error operations
   * @param message - The error message
   * @param error - The error object
   */
  error: (message: string, error?: any) => {
    if (isDevelopment) {
      console.error(`❌ ${message}`, error ? error : '');
    }
  },

  /**
   * Log in-progress operations
   * @param message - The progress message
   * @param data - Optional data to include
   */
  progress: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`🔄 ${message}`, data ? data : '');
    }
  },

  /**
   * Log informational messages
   * @param message - The info message
   * @param data - Optional data to include
   */
  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`ℹ️ ${message}`, data ? data : '');
    }
  },

  /**
   * Log warnings
   * @param message - The warning message
   * @param data - Optional data to include
   */
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(`⚠️ ${message}`, data ? data : '');
    }
  },

  /**
   * Log debug information (only in development)
   * @param message - The debug message
   * @param data - Optional data to include
   */
  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      console.debug(`🔍 ${message}`, data ? data : '');
    }
  }
};

/**
 * Performance monitoring utility
 * Helps track component render times and operation performance
 */
const devPerf = {
  /**
   * Start a performance timer
   * @param label - The label for the timer
   */
  start: (label: string) => {
    if (isDevelopment) {
      console.time(`⚡ ${label}`);
    }
  },

  /**
   * End a performance timer
   * @param label - The label for the timer
   */
  end: (label: string) => {
    if (isDevelopment) {
      console.timeEnd(`⚡ ${label}`);
    }
  },

  /**
   * Mark a performance point
   * @param label - The label for the mark
   */
  mark: (label: string) => {
    if (isDevelopment && performance.mark) {
      performance.mark(label);
    }
  },

  /**
   * Measure performance between two marks
   * @param name - The name of the measurement
   * @param startMark - The start mark
   * @param endMark - The end mark
   */
  measure: (name: string, startMark: string, endMark: string) => {
    if (isDevelopment && performance.measure) {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      devLog.info(`Performance measurement: ${name}`, `${measure.duration.toFixed(2)}ms`);
    }
  }
};

/**
 * Development state inspector
 * Provides utilities to inspect application state
 */
const devState = {
  /**
   * Log the current state of a component
   * @param componentName - The name of the component
   * @param state - The state object to log
   */
  logState: (componentName: string, state: any) => {
    if (isDevelopment) {
      console.group(`🔍 ${componentName} State`);
      console.log('Current state:', state);
      console.groupEnd();
    }
  },

  /**
   * Log props changes
   * @param componentName - The name of the component
   * @param prevProps - The previous props
   * @param nextProps - The new props
   */
  logPropsChange: (componentName: string, prevProps: any, nextProps: any) => {
    if (isDevelopment) {
      console.group(`📝 ${componentName} Props Changed`);
      console.log('Previous props:', prevProps);
      console.log('New props:', nextProps);
      console.groupEnd();
    }
  },

  /**
   * Log render information
   * @param componentName - The name of the component
   * @param renderCount - The render count
   */
  logRender: (componentName: string, renderCount?: number) => {
    if (isDevelopment) {
      const count = renderCount ? ` (${renderCount} renders)` : '';
      devLog.debug(`${componentName} rendered${count}`);
    }
  }
};

/**
 * Development API utilities
 * Provides utilities to test and debug API calls
 */
const devAPI = {
  /**
   * Log API call start
   * @param operation - The operation name
   * @param params - The parameters
   */
  logCall: (operation: string, params?: any) => {
    if (isDevelopment) {
      devLog.progress(`API Call: ${operation}`, params);
    }
  },

  /**
   * Log API call success
   * @param operation - The operation name
   * @param result - The result
   */
  logSuccess: (operation: string, result?: any) => {
    if (isDevelopment) {
      devLog.success(`API Success: ${operation}`, result);
    }
  },

  /**
   * Log API call error
   * @param operation - The operation name
   * @param error - The error
   */
  logError: (operation: string, error?: any) => {
    if (isDevelopment) {
      devLog.error(`API Error: ${operation}`, error);
    }
  }
};

/**
 * Development data utilities
 * Provides utilities to generate test data and validate data structures
 */
const devData = {
  /**
   * Generate mock schedule items for testing
   * @param count - Number of items to generate
   * @returns Array of mock schedule items
   */
  generateMockSchedule: (count: number = 5) => {
    const titles = [
      'Morning Workout',
      'Team Standup',
      'Code Review',
      'Lunch Break',
      'Project Planning',
      'Deep Work Session',
      'Client Meeting',
      'Documentation',
      'Testing',
      'Wrap-up Tasks'
    ];

    const icons = ['🏃‍♂️', '👥', '🔍', '🍽️', '📋', '💻', '🤝', '📝', '🧪', '✅'];
    const colors = ['blue', 'green', 'yellow', 'red', 'primary-500'];

    const items = [];
    let startHour = 9;

    for (let i = 0; i < count; i++) {
      const duration = Math.floor(Math.random() * 3) + 1; // 1-3 hours
      const endHour = startHour + duration;
      
      items.push({
        title: titles[i % titles.length],
        start: `${startHour.toString().padStart(2, '0')}:00`,
        end: `${endHour.toString().padStart(2, '0')}:00`,
        icon: icons[i % icons.length],
        color: colors[i % colors.length],
        subtasks: [
          { id: `sub-${i}-1`, text: 'Subtask 1', completed: false },
          { id: `sub-${i}-2`, text: 'Subtask 2', completed: Math.random() > 0.5 }
        ],
        remainingDuration: duration * 60, // minutes
        isRunning: false,
        manualStatus: undefined
      });

      startHour = endHour;
    }

    return items;
  },

  /**
   * Validate schedule item structure
   * @param item - The schedule item to validate
   * @returns Validation result
   */
  validateScheduleItem: (item: any) => {
    const required = ['title', 'start', 'end'];
    const missing = required.filter(field => !item[field]);
    
    if (missing.length > 0) {
      devLog.error(`Invalid schedule item: missing ${missing.join(', ')}`, item);
      return false;
    }

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(item.start) || !timeRegex.test(item.end)) {
      devLog.error('Invalid time format', item);
      return false;
    }

    // Validate time logic
    if (item.start >= item.end) {
      devLog.error('Start time must be before end time', item);
      return false;
    }

    devLog.success('Schedule item validation passed', item);
    return true;
  }
};

/**
 * Development testing utilities
 * Provides utilities to test application functionality
 */
const devTest = {
  /**
   * Test real-time sync by creating multiple operations
   * @param operations - Array of test operations
   */
  testRealTimeSync: async (operations: Array<() => Promise<any>>) => {
    if (isDevelopment) {
      devLog.info('🧪 Testing real-time sync with multiple operations');
      
      const results = await Promise.all(
        operations.map(async (op, index) => {
          devLog.progress(`Running operation ${index + 1}/${operations.length}`);
          try {
            const result = await op();
            devLog.success(`Operation ${index + 1} completed`);
            return result;
          } catch (error) {
            devLog.error(`Operation ${index + 1} failed`, error);
            throw error;
          }
        })
      );

      devLog.success('All operations completed', results);
      return results;
    }
  },

  /**
   * Test import/export functionality
   * @param exportFn - Export function to test
   * @param importFn - Import function to test
   */
  testImportExport: async (exportFn: () => string, importFn: (data: string) => Promise<any>) => {
    if (isDevelopment) {
      devLog.info('🧪 Testing import/export functionality');
      
      try {
        // Export data
        const exportedData = exportFn();
        devLog.success('Export completed', exportedData);
        
        // Import data
        const importResult = await importFn(exportedData);
        devLog.success('Import completed', importResult);
        
        return { exportedData, importResult };
      } catch (error) {
        devLog.error('Import/export test failed', error);
        throw error;
      }
    }
  }
};

/**
 * Development keyboard shortcuts
 * Provides keyboard shortcuts for development tasks
 */
const devShortcuts = {
  /**
   * Initialize development keyboard shortcuts
   * Only works in development mode
   */
  init: () => {
    if (isDevelopment) {
      document.addEventListener('keydown', (event) => {
        // Ctrl/Cmd + Shift + D: Toggle debug mode
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
          event.preventDefault();
          const debugMode = localStorage.getItem('focusflow-debug') === 'true';
          localStorage.setItem('focusflow-debug', (!debugMode).toString());
          devLog.info(`Debug mode ${!debugMode ? 'enabled' : 'disabled'}`);
          window.location.reload();
        }

        // Ctrl/Cmd + Shift + C: Clear all data
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
          event.preventDefault();
          if (confirm('Clear all development data? This cannot be undone.')) {
            localStorage.clear();
            devLog.info('All development data cleared');
            window.location.reload();
          }
        }

        // Ctrl/Cmd + Shift + L: Toggle logging
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'L') {
          event.preventDefault();
          const loggingEnabled = localStorage.getItem('focusflow-logging') !== 'false';
          localStorage.setItem('focusflow-logging', (!loggingEnabled).toString());
          devLog.info(`Logging ${!loggingEnabled ? 'enabled' : 'disabled'}`);
        }
      });

      devLog.info('Development shortcuts initialized');
      devLog.info('Shortcuts:');
      devLog.info('  Ctrl+Shift+D: Toggle debug mode');
      devLog.info('  Ctrl+Shift+C: Clear all data');
      devLog.info('  Ctrl+Shift+L: Toggle logging');
    }
  }
};

/**
 * Development environment checker
 * Provides utilities to check development environment
 */
const devEnv = {
  /**
   * Check if all required environment variables are set
   * @returns Environment check result
   */
  checkEnv: () => {
    if (isDevelopment) {
      const required = [
        'VITE_CONVEX_URL'
      ];

      const optional = [
        'VITE_CLERK_FRONTEND_API_URL',
        'VITE_CLERK_PUBLISHABLE_KEY',
        'GEMINI_API_KEY'
      ];

      const missing = required.filter(key => !import.meta.env[key]);
      const missingOptional = optional.filter(key => !import.meta.env[key]);

      if (missing.length > 0) {
        devLog.error('Missing required environment variables', missing);
        return false;
      }

      if (missingOptional.length > 0) {
        devLog.warn('Missing optional environment variables', missingOptional);
      }

      devLog.success('Environment check passed');
      return true;
    }
    return true;
  },

  /**
   * Get current environment info
   * @returns Environment information
   */
  getInfo: () => {
    if (isDevelopment) {
      const info = {
        mode: import.meta.env.MODE,
        dev: import.meta.env.DEV,
        prod: import.meta.env.PROD,
        convexUrl: import.meta.env.VITE_CONVEX_URL,
        hasClerk: !!import.meta.env.VITE_CLERK_FRONTEND_API_URL,
        hasGemini: !!import.meta.env.GEMINI_API_KEY,
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      };

      devLog.info('Environment info', info);
      return info;
    }
    return null;
  }
};

// Initialize development utilities
if (isDevelopment) {
  devShortcuts.init();
  devEnv.checkEnv();
  
  // Add development utilities to window for easy access in console
  (window as any).devUtils = {
    log: devLog,
    perf: devPerf,
    state: devState,
    api: devAPI,
    data: devData,
    test: devTest,
    env: devEnv
  };

  devLog.info('Development utilities loaded');
  devLog.info('Access via window.devUtils in console');
}

// Export all utilities
export {
  devLog,
  devPerf,
  devState,
  devAPI,
  devData,
  devTest,
  devShortcuts,
  devEnv
};
