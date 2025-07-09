# Convex Integration Guide for FocusFlow

## ✅ Completed Steps

### 1. Dependencies Installed
- ✅ `convex` - Core Convex database and real-time functionality
- ✅ `@clerk/clerk-react` - Authentication (ready for future use)

### 2. Convex Setup
- ✅ Initialized Convex project with `npx convex dev --once --configure=new`
- ✅ Created database schema in `convex/schema.ts`
- ✅ Generated environment variables in `.env.local`

### 3. Database Schema
- ✅ `scheduleItems` table for tasks/schedule items
- ✅ `subtasks` table for task subtasks
- ✅ `completionStatus` table for tracking completion

### 4. Convex Functions
- ✅ `convex/scheduleItems.ts` - CRUD operations for schedule items
- ✅ `convex/subtasks.ts` - CRUD operations for subtasks
- ✅ `convex/completionStatus.ts` - Completion status management

### 5. React Integration
- ✅ Created `ConvexClientProvider` component
- ✅ Wrapped app with ConvexProvider in `index.tsx`
- ✅ Created React hooks in `hooks/useConvexSchedule.ts`

### 6. Migration Helper
- ✅ Created `hooks/useMigrationHelper.ts` for localStorage migration

## 🔄 Next Steps (Your Action Items)

### Step 1: Replace localStorage with Convex
You need to update your main `App.tsx` to use Convex instead of localStorage:

```tsx
// Replace this in App.tsx:
import { useSchedule } from './hooks/useSchedule.ts';

// With this:
import { useScheduleFromConvex, useCompletionStatusFromConvex } from './hooks/useConvexSchedule.ts';
```

### Step 2: Update App State Management
In your `App.tsx`, replace the localStorage-based state with Convex:

```tsx
// Replace the localStorage state:
const [schedule, setSchedule] = usePersistentState<ScheduleItem[]>('schedule', DEFAULT_SCHEDULE);
const [completionStatus, setCompletionStatus] = usePersistentState<CompletionStatus>('completion-status', {});

// With Convex hooks:
const today = new Date().toISOString().split('T')[0];
const { scheduleItems, setAllItems, updateItem, isLoading: scheduleLoading } = useScheduleFromConvex(today);
const { completionStatus, setStatus, toggleStatus, isLoading: statusLoading } = useCompletionStatusFromConvex(today);
```

### Step 3: Update useSchedule Hook
Update your `hooks/useSchedule.ts` to work with Convex data:

```tsx
// The current useSchedule hook will need to be updated to work with the new Convex-based data
// Or you can create a new hook that bridges the gap
```

### Step 4: Authentication (Optional but Recommended)
Currently using a mock user ID. To add proper authentication:

1. Set up Clerk authentication
2. Replace `MOCK_USER_ID` in `hooks/useConvexSchedule.ts` with actual user ID
3. Add authentication UI components

### Step 5: Data Migration
Run the migration to move existing localStorage data to Convex:

```tsx
// Add this to your app temporarily:
import { useMigrationHelper } from './hooks/useMigrationHelper';

// In your component:
const { migrateFromLocalStorage, clearLocalStorageData } = useMigrationHelper();

// Call migrateFromLocalStorage() once to migrate data
// Then call clearLocalStorageData() to clean up
```

## 🏃 Running the Application

1. **Start Convex Development Server:**
   ```bash
   npx convex dev
   ```

2. **Start Your App:**
   ```bash
   npm run dev
   ```

3. **Access Convex Dashboard:**
   Visit: https://dashboard.convex.dev/d/brilliant-starfish-555

## 📝 Database Schema Overview

### scheduleItems
- `userId`: User identifier
- `title`: Task title
- `start`/`end`: Time strings
- `date`: ISO date string
- `remainingDuration`: Remaining time in seconds
- `isRunning`: Whether task is currently running
- `icon`/`color`: Visual styling
- `manualStatus`: 'done' or 'missed'

### subtasks
- `scheduleItemId`: Reference to parent schedule item
- `text`: Subtask description
- `completed`: Boolean completion status

### completionStatus
- `userId`: User identifier
- `scheduleItemId`: Reference to schedule item
- `completed`: Boolean completion status
- `date`: ISO date string

## 🔧 Available Convex Functions

### Schedule Items
- `getScheduleItems(userId, date)` - Get all items for a date
- `createScheduleItem(...)` - Create new item
- `updateScheduleItem(id, ...)` - Update existing item
- `deleteScheduleItem(id)` - Delete item
- `setScheduleItems(userId, date, items)` - Bulk set items

### Subtasks
- `getSubtasks(scheduleItemId)` - Get all subtasks
- `createSubtask(scheduleItemId, text)` - Create new subtask
- `updateSubtask(id, ...)` - Update subtask
- `deleteSubtask(id)` - Delete subtask
- `toggleSubtaskCompletion(id)` - Toggle completion

### Completion Status
- `getCompletionStatus(userId, date)` - Get completion status
- `setCompletionStatus(userId, scheduleItemId, completed, date)` - Set status
- `toggleCompletionStatus(userId, scheduleItemId, date)` - Toggle status

## 🎯 Benefits of Convex Integration

1. **Real-time Updates**: Changes sync instantly across devices
2. **Offline Support**: Convex handles offline/online synchronization
3. **Type Safety**: Full TypeScript support with generated types
4. **Scalable**: Ready for multi-user with proper authentication
5. **Backup**: Your data is safely stored in the cloud
6. **Version Control**: Built-in versioning and rollback capabilities

## 🚀 Production Deployment

When ready for production:
1. Run `npx convex deploy` to deploy to production
2. Update environment variables for production
3. Set up proper authentication with Clerk
4. Configure domain and SSL if needed

Your Convex database is now ready to use! The next step is to update your React components to use the new Convex hooks instead of localStorage.
