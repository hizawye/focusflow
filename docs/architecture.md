# FocusFlow Architecture

## System Overview

FocusFlow follows a modern real-time web application architecture with React frontend and Convex backend, connected via WebSocket for live data synchronization.

### Architecture Diagram
```
┌─────────────────────────────────────────────────┐
│                  Browser                        │
│  ┌───────────────────────────────────────────┐ │
│  │          React Application               │ │
│  │  ┌─────────────┐  ┌──────────────────┐  │ │
│  │  │   App.tsx   │  │   Components/    │  │ │
│  │  │ (613 lines) │  │  - Header        │  │ │
│  │  │             │  │  - ScheduleList  │  │ │
│  │  │  State Mgmt │  │  - TaskDetails   │  │ │
│  │  │  Timer Loop │  │  - StatsPage     │  │ │
│  │  └─────────────┘  └──────────────────┘  │ │
│  │         ▲                  ▲             │ │
│  │         │                  │             │ │
│  │  ┌──────┴──────────────────┴──────────┐ │ │
│  │  │         Custom Hooks               │ │ │
│  │  │  - useScheduleFromConvex           │ │ │
│  │  │  - useTimerFromConvex              │ │ │
│  │  │  - useCompletionStatusFromConvex   │ │ │
│  │  └────────────────┬───────────────────┘ │ │
│  └───────────────────┼─────────────────────┘ │
│                      │                        │
│              ┌───────▼───────┐                │
│              │ Convex Client │                │
│              │  (WebSocket)  │                │
│              └───────┬───────┘                │
└──────────────────────┼────────────────────────┘
                       │ Real-time Sync
                       │
┌──────────────────────▼────────────────────────┐
│              Convex Backend                   │
│  ┌─────────────────────────────────────────┐ │
│  │         Database Schema                 │ │
│  │  - scheduleItems (by_user_and_date)    │ │
│  │  - subtasks (by_schedule_item)         │ │
│  │  - completionStatus (by_user_and_date) │ │
│  └─────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────┐ │
│  │      Mutations & Queries                │ │
│  │  - createScheduleItem                   │ │
│  │  - updateScheduleItem                   │ │
│  │  - deleteScheduleItem                   │ │
│  │  - startTimer / stopTimer               │ │
│  │  - pauseTimer / resumeTimer             │ │
│  │  - getScheduleItems                     │ │
│  │  - getRunningTimer                      │ │
│  │  - batchUpdateDurations                 │ │
│  └─────────────────────────────────────────┘ │
└───────────────────────────────────────────────┘
                       │
                       │ HTTP API
                       │
          ┌────────────▼────────────┐
          │   Clerk Authentication  │
          │   (User Management)     │
          └─────────────────────────┘
```

---

## Frontend Architecture

### Component Hierarchy

```
App.tsx (Root Orchestrator)
│
├── Header (Top Bar)
│   ├── Logo
│   ├── User Profile
│   └── Sign Out Button
│
├── [Unauthenticated State]
│   └── Landing Page with Sign In/Sign Up
│
├── [Authenticated Layout]
│   │
│   ├── DesktopNavBar (Sidebar)
│   │   ├── Schedule NavItem
│   │   ├── Stats NavItem (with dynamic completion ring)
│   │   └── Settings NavItem
│   │
│   ├── Main Content Area
│   │   │
│   │   ├── [Schedule View] (default)
│   │   │   ├── Timeline Bar (vertical with "You are here" marker)
│   │   │   └── ScheduleList
│   │   │       └── ScheduleItem (×N)
│   │   │           ├── Task Info (title, time, icon)
│   │   │           ├── Timer Controls (start/pause/resume/stop)
│   │   │           ├── Progress Bar
│   │   │           └── Subtasks List
│   │   │
│   │   ├── [Stats View]
│   │   │   └── StatsPage
│   │   │       ├── Summary Cards (total/completed/incomplete)
│   │   │       └── Charts (Recharts)
│   │   │
│   │   └── [Settings View]
│   │       └── SettingsPage
│   │           ├── Dark Mode Toggle
│   │           ├── Alarm Toggle
│   │           ├── Import/Export Buttons
│   │           └── Clear Schedule Button
│   │
│   ├── TaskDetailsSidebar (Right Panel - Desktop)
│   │   ├── Daily Stats Summary
│   │   ├── Add Task Button
│   │   ├── Gemini AI Button
│   │   └── Selected Task Details
│   │       ├── Edit Form
│   │       ├── Subtasks Manager
│   │       └── Delete Button
│   │
│   ├── TaskModal (Mobile Only)
│   │   └── Full-screen modal with task details
│   │
│   └── MobileNavBar (Bottom Navigation)
│       ├── Schedule Tab
│       ├── Stats Tab
│       └── Settings Tab
```

### State Management

#### Component State (App.tsx)
```typescript
// View state
view: 'schedule' | 'stats' | 'settings'
isDarkMode: boolean
isAlarmEnabled: boolean

// Selection state
selectedTaskIdx: number | null

// Timer state (local)
timers: Record<string, number>          // Task ID → remaining seconds
runningTaskTitle: string | null
runningTaskId: Id<"scheduleItems"> | null

// Real-time updates
now: Date  // Updated every 10 seconds
```

#### Convex Real-time Subscriptions
```typescript
// From useScheduleFromConvex hook
scheduleItems: ScheduleItem[]  // Live array of tasks
exportSchedule: () => string
importSchedule: (json: string) => Promise<void>
clearSchedule: () => Promise<void>
updateItem: (id, updates) => Promise<void>
deleteItem: (id) => Promise<void>

// From useCompletionStatusFromConvex hook
completionStatus: Record<string, boolean>  // Task ID → completed

// From useTimerFromConvex hook
runningTimer: ScheduleItem | null  // Currently running task
startTimer: (id) => Promise<void>
stopTimer: (id) => Promise<void>
pauseTimer: (id) => Promise<void>
resumeTimer: (id) => Promise<void>
```

#### State Flow
1. User interacts with UI component
2. Component calls handler function in App.tsx
3. Handler calls Convex mutation via custom hook
4. Convex updates database
5. Real-time subscription triggers re-render with new data
6. All connected clients receive update simultaneously

### Custom Hooks

#### `useScheduleFromConvex(date: string)`
**Purpose:** Manage schedule items for a specific date.

**Returns:**
- `scheduleItems`: Array of tasks with subtasks
- `exportSchedule()`: Generate JSON export
- `importSchedule(json)`: Import from JSON
- `clearSchedule()`: Delete all items
- `updateItem(id, updates)`: Patch single item
- `deleteItem(id)`: Delete item and subtasks

**Implementation:**
- Uses `useQuery(api.scheduleItems.getScheduleItems)`
- Uses `useMutation` for create/update/delete operations
- Handles subtask embedding from separate table

#### `useTimerFromConvex(date: string)`
**Purpose:** Track running timer state from server.

**Returns:**
- `runningTimer`: Currently active timer (or null)
- `startTimer(id)`: Start timer (stops others)
- `stopTimer(id)`: Stop timer, save elapsed
- `pauseTimer(id)`: Pause without stopping
- `resumeTimer(id)`: Resume from pause
- `updateTimerDuration(id, duration)`: Sync duration
- `isLoading`: Query loading state

**Implementation:**
- Uses `useQuery(api.scheduleItems.getRunningTimer)`
- Uses `useMutation` for timer control operations
- Provides real-time timer state sync

#### `useCompletionStatusFromConvex(date: string)`
**Purpose:** Track task completion status.

**Returns:**
- `completionStatus`: Map of task ID to boolean
- `setCompletion(id, status)`: Update completion

---

## Backend Architecture (Convex)

### Database Schema

#### Indexes Strategy
All queries use indexed lookups for performance:
- `scheduleItems.by_user_and_date` on `[userId, date]`
- `subtasks.by_schedule_item` on `[scheduleItemId]`
- `completionStatus.by_user_and_date` on `[userId, date]`

This enables efficient filtering without full table scans.

#### Data Partitioning
- Horizontal partitioning by `userId` (multi-tenant)
- Temporal partitioning by `date` (daily schedules)
- Foreign key relationships via Convex IDs

### Mutations (Write Operations)

#### Schedule Management
```typescript
createScheduleItem(args) → Id<"scheduleItems">
  - Inserts new task with timestamp
  - Validates required fields
  - Returns auto-generated ID

updateScheduleItem(args) → void
  - Patches existing task
  - Updates updatedAt timestamp
  - Merges partial updates

deleteScheduleItem(id) → void
  - Cascade deletes subtasks first
  - Then deletes schedule item
  - Ensures referential integrity

setScheduleItems(userId, date, items) → Id[]
  - Bulk replace: delete all + insert new
  - Used for import functionality
  - Atomic operation
```

#### Timer Operations
```typescript
startTimer(id, userId, date) → void
  - Stop all other running timers for user
  - Calculate elapsed time for stopped timers
  - Update remainingDuration accurately
  - Set isRunning=true, startedAt=now

stopTimer(id) → void
  - Calculate session elapsed time
  - Add to totalElapsed
  - Deduct from remainingDuration
  - Set isRunning=false, clear timestamps

pauseTimer(id) → void
  - Calculate elapsed time since startedAt
  - Update totalElapsed
  - Set isPaused=true, pausedAt=now
  - Keep isRunning=true

resumeTimer(id) → void
  - Set isPaused=false
  - Reset startedAt to now (for accurate calculation)
  - Keep isRunning=true

batchUpdateDurations(updates[]) → void
  - Bulk update remainingDuration for multiple tasks
  - Used by client-side batch sync (every 30s)
  - Reduces server round-trips
```

### Queries (Read Operations)

```typescript
getScheduleItems(userId, date) → ScheduleItem[]
  - Fetch all tasks for user on date
  - Join with subtasks (via separate query)
  - Return enriched objects

getRunningTimer(userId, date) → ScheduleItem | null
  - Filter by isRunning=true
  - Returns first match (only one should exist)
  - Used for client-side timer sync

getScheduleItemsSince(userId, date, since?) → ScheduleItem[]
  - Delta query: only items updated after timestamp
  - Optimizes re-fetching
  - Used for efficient polling
```

---

## Timer System Architecture

### Multi-layered Timer Design

The timer system uses a hybrid client-server approach:

#### Layer 1: Server-side State (Authoritative)
- **Storage:** Convex database fields
- **Fields:** `isRunning`, `isPaused`, `startedAt`, `pausedAt`, `totalElapsed`, `remainingDuration`
- **Purpose:** Single source of truth, survives page refresh
- **Updates:** Via mutations (start/stop/pause/resume)

#### Layer 2: Client-side Countdown (Display)
- **Storage:** React state (`timers` map in App.tsx)
- **Update Frequency:** Every 1 second (setInterval)
- **Purpose:** Smooth UI countdown without server round-trips
- **Sync:** Reads from server on mount, syncs every 30s

#### Layer 3: Batch Synchronization
- **Mechanism:** `pendingDurationsRef` + `batchUpdateDurations` mutation
- **Frequency:** Every 30 seconds
- **Purpose:** Reduce server load, save duration updates in bulk
- **Data:** Queue of `{id, remainingDuration}` updates

### Timer Lifecycle

```
[User Clicks Start]
        ↓
App.handleStartTimer(id)
        ↓
useTimerFromConvex.startTimer(id)
        ↓
Convex Mutation: startTimer
  - Stops other running timers
  - Sets isRunning=true, startedAt=now
        ↓
Real-time Update: runningTimer changed
        ↓
App.useEffect (runningTimer dependency)
  - Sets runningTaskId state
        ↓
App.useEffect (runningTaskId dependency)
  - Starts setInterval (1s)
  - Decrements timers[id] every second
  - Queues duration updates
        ↓
Every 30s: batchUpdateDurations mutation
  - Syncs queued updates to server
        ↓
On Visibility Change:
  - Re-sync timers from server state
  - Prevents drift when tab backgrounded
```

### Edge Cases Handled

1. **Tab backgrounded:** Visibility change listener re-syncs on focus
2. **Multiple tabs:** Server state ensures consistency
3. **Page refresh:** Timer state restored from Convex
4. **Network disconnect:** Client countdown continues, syncs when reconnected
5. **Concurrent updates:** Server-side state is authoritative
6. **Timer reaches zero:** Automatically calls stopTimer, shows notification

---

## Authentication Flow

### Clerk Integration

```
[User Visits App]
        ↓
Clerk Loads (isLoaded=false → show spinner)
        ↓
Check Authentication
        ↓
    ┌───┴───┐
    │       │
 NO │       │ YES
    │       │
    ▼       ▼
[UnauthenticatedState]  [AuthGuard Wrapper]
  - Landing page              ↓
  - Sign In/Sign Up    Extract userId from Clerk
                              ↓
                       Pass userId to all Convex queries
                              ↓
                       Fetch user-specific data
                              ↓
                       Render authenticated UI
```

### User ID Propagation

```typescript
// In every Convex hook
const { user } = useUser();  // Clerk hook
const userId = user?.id;

// Pass to Convex queries
useQuery(api.scheduleItems.getScheduleItems, {
  userId: userId!,
  date: todayLocalISO()
});

// Pass to Convex mutations
useMutation(api.scheduleItems.createScheduleItem, {
  userId: userId!,
  title: "New Task",
  date: todayLocalISO()
});
```

All data automatically scoped to authenticated user.

---

## Data Flow Examples

### Creating a Task

```
User clicks "Add Task" button
        ↓
TaskDetailsSidebar.handleSidebarAdd()
        ↓
ScheduleList.addItem() (via ref)
        ↓
Shows add form in ScheduleList
        ↓
User enters title, times, saves
        ↓
Calls createScheduleItem mutation
        ↓
Convex inserts into database
        ↓
Real-time subscription updates scheduleItems array
        ↓
App.tsx re-renders with new task
        ↓
All connected clients see new task immediately
```

### Starting a Timer

```
User clicks Start button on task
        ↓
ScheduleItem onClick → App.handleStartTimer(id)
        ↓
useTimerFromConvex.startTimer(id)
        ↓
Convex mutation: startTimer
  - Loops through all tasks for user/date
  - Stops currently running timer (if any)
  - Calculates and saves elapsed time
  - Sets new task as isRunning=true
        ↓
Real-time update: runningTimer changes
        ↓
App.useEffect detects runningTimer change
  - Updates runningTaskId state
  - Starts 1-second interval countdown
        ↓
Every second:
  - Decrements local timers[id]
  - Queues update in pendingDurationsRef
        ↓
Every 30 seconds:
  - Flushes pendingDurationsRef to server
  - Calls batchUpdateDurations mutation
```

---

## Performance Optimizations

### Frontend Optimizations

1. **Memoization:**
   ```typescript
   const sortedSchedule = useMemo(() => {
     return [...schedule].sort((a, b) => /* ... */);
   }, [schedule]);
   ```

2. **Debounced Updates:**
   - Batch duration updates every 30s
   - Reduces server calls from 60/min to 2/min per active timer

3. **Conditional Effects:**
   ```typescript
   useEffect(() => {
     // Only run when schedule actually changes
   }, [JSON.stringify(schedule.map(item => ({
     id: item._id,
     remainingDuration: item.remainingDuration
   })))]);
   ```

4. **Early Returns:**
   - Skip processing if no schedule items
   - Skip timer updates if paused

### Backend Optimizations

1. **Indexed Queries:**
   - All queries use `by_user_and_date` index
   - O(log n) lookups instead of O(n) scans

2. **Batch Operations:**
   - `batchUpdateDurations` updates multiple items in one transaction
   - Reduces round-trips

3. **Delta Queries:**
   - `getScheduleItemsSince` only fetches changed items
   - Reduces payload size

---

## Security Considerations

### Authentication
- All Convex functions receive userId from Clerk
- No way to access other users' data (enforced by indexes)

### Data Validation
- Convex validators ensure type safety
- Required fields enforced at database level

### XSS Prevention
- React escapes all user input by default
- No `dangerouslySetInnerHTML` usage

### CSRF Protection
- Convex uses secure WebSocket connection
- Clerk handles session management

---

## Deployment Architecture

### Development
```
Developer Machine
  ├── Vite Dev Server (localhost:5173)
  │   └── React App with HMR
  └── Convex Dev (npx convex dev)
      └── Local Convex instance
```

### Production
```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  CDN / Hosting  │  (e.g., Vercel, Netlify)
│  Static Assets  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Convex Cloud    │
│  - Database     │
│  - Functions    │
│  - WebSocket    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Clerk Cloud     │
│  - Auth         │
│  - User Mgmt    │
└─────────────────┘
```

---

## File Structure

```
focusflow/
├── components/               # React components (14 files)
│   ├── AuthComponents.tsx   # Clerk auth UI
│   ├── Header.tsx           # Top header bar
│   ├── DesktopNavBar.tsx    # Sidebar navigation
│   ├── MobileNavBar.tsx     # Bottom mobile nav
│   ├── ScheduleList.tsx     # Task list view
│   ├── ScheduleItem.tsx     # Individual task component
│   ├── TaskDetailsSidebar.tsx  # Right panel
│   ├── TaskModal.tsx        # Mobile task details
│   ├── TaskDetailsPanel.tsx # Shared details UI
│   ├── TaskAddButton.tsx    # Add task button
│   ├── StatsPage.tsx        # Statistics view
│   ├── SettingsPage.tsx     # Settings view
│   └── ConvexClientProvider.tsx  # Convex wrapper
│
├── convex/                  # Backend functions
│   ├── schema.ts            # Database schema
│   ├── scheduleItems.ts     # Task CRUD + timer (446 lines)
│   ├── subtasks.ts          # Subtask operations
│   ├── completionStatus.ts  # Completion tracking
│   └── _generated/          # Auto-generated types
│
├── hooks/                   # Custom React hooks
│   ├── useConvexSchedule.ts    # Schedule data hook
│   ├── useTimerFromConvex.ts   # Timer state hook
│   ├── useSchedule.ts          # Legacy hook
│   └── useMigrationHelper.ts   # Data migration
│
├── src/
│   └── utils/
│       └── date.ts          # Date utilities
│
├── App.tsx                  # Main app (613 lines)
├── index.tsx                # React entry point
├── types.ts                 # TypeScript definitions
├── constants.ts             # App constants
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript config
├── package.json             # Dependencies
└── CLAUDE.md                # Project documentation
```
