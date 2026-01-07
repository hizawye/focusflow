# FocusFlow Project Specification

## Project Overview

**FocusFlow** is an AI-powered daily task scheduler designed to help users manage their time effectively with real-time synchronization, intelligent scheduling, and comprehensive task tracking.

### Purpose
Provide a beautiful, modern scheduling experience that combines:
- Traditional time-block scheduling
- Flexible duration-based tasks
- Todo-style timeless tasks
- AI-powered schedule generation
- Real-time multi-device sync

### Target Users
- Professionals managing daily schedules
- Students organizing study time
- Anyone wanting to improve time management and productivity

---

## Core Features

### 1. Schedule Management

#### Task Types
FocusFlow supports three distinct task types:

**Fixed Tasks (Time-Blocked)**
- Have specific start and end times (e.g., "9:00 AM - 10:30 AM")
- Display as time blocks in the schedule
- Countdown timer shows remaining time in current slot
- Fields: `title`, `start`, `end`

**Flexible Tasks (Duration-Based)**
- Have duration but flexible scheduling (e.g., "45 minutes, morning preferred")
- Can specify preferences: time slots, earliest/latest bounds
- AI can suggest optimal placement
- Fields: `title`, `duration`, `isFlexible: true`, `preferredTimeSlots`, `earliestStart`, `latestEnd`

**Timeless Tasks (Todos)**
- No specific time, just tasks to complete during the day
- Work as traditional todo items
- Can still use timer to track work duration
- Fields: `title`, `isTimeless: true`, `duration` (optional)

#### Task Operations
- **Create:** Add new tasks with customizable properties
- **Edit:** Update title, times, icon, color, subtasks
- **Delete:** Remove tasks and all associated subtasks
- **Reorder:** Drag-and-drop reordering (coming soon)
- **Import/Export:** Backup and restore schedules as JSON files
- **Clear:** Reset entire schedule for the day

### 2. Task Timers

#### Timer Features
- **Start/Stop:** Begin tracking time on any task
- **Pause/Resume:** Temporarily pause without losing progress
- **Auto-countdown:** Real-time countdown display (updates every second)
- **Completion:** Automatic notification when timer reaches zero
- **Multi-task:** Only one timer can run at a time (starting new timer stops previous)

#### Timer State Tracking
- `isRunning`: Boolean indicating active timer
- `isPaused`: Boolean indicating paused state
- `remainingDuration`: Seconds remaining (for fixed/flexible tasks)
- `totalElapsed`: Total seconds worked on task
- `startedAt`: Timestamp when timer started
- `pausedAt`: Timestamp when timer paused

#### Timer Synchronization
- **Client-side countdown:** 1-second interval updates for smooth UI
- **Server-side state:** Authoritative source in Convex database
- **Batch updates:** Duration synced to server every 30 seconds
- **Visibility sync:** Re-sync when tab becomes visible (prevents drift)
- **Cross-device:** Timer state syncs across all user's devices in real-time

### 3. Subtasks

#### Features
- Break down tasks into smaller actionable items
- Check off subtasks independently
- Track progress (e.g., "2/5 subtasks completed")
- Persisted in separate `subtasks` table with foreign key to schedule item

#### Data Model
```typescript
{
  id: string                    // Unique subtask ID
  scheduleItemId: Id<"scheduleItems">  // Parent task
  text: string                  // Subtask description
  completed: boolean            // Completion status
  createdAt: number
  updatedAt: number
}
```

### 4. Completion Tracking

#### Features
- Mark tasks as done/missed manually
- Visual completion indicators
- Completion statistics by date
- Separate table for historical tracking

#### Data Model
```typescript
{
  userId: string
  scheduleItemId: Id<"scheduleItems">
  completed: boolean
  date: string                  // ISO date (YYYY-MM-DD)
  createdAt: number
  updatedAt: number
}
```

### 5. Statistics Dashboard

#### Metrics Displayed
- Total tasks for the day
- Completed tasks count
- Incomplete tasks count
- Total scheduled time (minutes)
- Completion percentage
- Visual charts (via Recharts library)

#### Visualizations
- Pie chart of completion rates
- Progress indicators
- Dynamic stats icon with completion ring

### 6. AI Schedule Generation

#### Powered by Google Gemini
- Natural language input (e.g., "Plan my day with gym at 6am and 3 work blocks")
- Generates structured schedule JSON
- Respects user preferences and constraints
- Integration status: Implemented but needs Convex mutation update (see TODO in App.tsx:532)

### 7. Real-time Synchronization

#### Convex Backend
- Automatic real-time subscriptions
- Instant updates across all devices
- No manual polling required
- Optimistic updates for better UX
- WebSocket-based connection

### 8. User Interface

#### Views
- **Schedule View:** Main timeline with tasks, current time indicator, and "You are here" marker
- **Stats View:** Analytics and productivity metrics
- **Settings View:** Dark mode toggle, alarm settings, import/export

#### Responsive Design
- **Desktop:** Sidebar navigation, main content, right details panel
- **Mobile:** Bottom navigation, modal task details, full-width content

#### Theme Support
- Light mode (default)
- Dark mode with smooth transitions
- Persisted preference

### 9. Authentication

#### Clerk Integration
- Optional multi-user support
- User-specific schedules by date
- Secure session management
- Sign in/Sign up flow
- User profile display in header

---

## Data Model

### Database Schema (Convex)

#### Table: `scheduleItems`
Primary table for all schedule tasks.

```typescript
{
  _id: Id<"scheduleItems">      // Auto-generated
  userId: string                // Clerk user ID
  title: string                 // Task name
  start?: string                // HH:MM format (optional)
  end?: string                  // HH:MM format (optional)

  // Task type flags
  isFlexible?: boolean          // Duration-based scheduling
  isTimeless?: boolean          // No specific time (todo)

  // Flexible task properties
  duration?: number             // Minutes
  preferredTimeSlots?: string[] // ['morning', 'afternoon', 'evening']
  earliestStart?: string        // HH:MM
  latestEnd?: string            // HH:MM

  // Timer state
  remainingDuration?: number    // Seconds
  isRunning?: boolean
  isPaused?: boolean
  pausedAt?: number             // Unix timestamp
  startedAt?: number            // Unix timestamp
  totalElapsed?: number         // Seconds

  // Customization
  icon?: string                 // Icon name (e.g., 'brain', 'coffee')
  color?: string                // Color name (e.g., 'blue', 'green')

  // Status
  manualStatus?: 'done' | 'missed'

  // Metadata
  date: string                  // ISO date YYYY-MM-DD
  createdAt: number             // Unix timestamp
  updatedAt: number             // Unix timestamp
}

// Index: by_user_and_date on [userId, date]
```

#### Table: `subtasks`
Child tasks for breaking down schedule items.

```typescript
{
  _id: Id<"subtasks">
  scheduleItemId: Id<"scheduleItems">  // Foreign key
  text: string
  completed: boolean
  createdAt: number
  updatedAt: number
}

// Index: by_schedule_item on [scheduleItemId]
```

#### Table: `completionStatus`
Historical completion tracking.

```typescript
{
  _id: Id<"completionStatus">
  userId: string
  scheduleItemId: Id<"scheduleItems">
  completed: boolean
  date: string                  // ISO date YYYY-MM-DD
  createdAt: number
  updatedAt: number
}

// Index: by_user_and_date on [userId, date]
```

---

## Technical Requirements

### Frontend Stack
- React 19
- TypeScript 5.7
- Vite 6.3
- Lucide React (icons)
- Recharts (statistics)
- @hello-pangea/dnd (drag-and-drop)

### Backend Stack
- Convex 1.25+ (real-time database)
- Clerk 5.33+ (authentication)
- Google Gemini API (AI generation)

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ JavaScript features
- WebSocket support required

### Environment Variables
```bash
# Required
CONVEX_DEPLOYMENT=dev:project-name
VITE_CONVEX_URL=https://project.convex.cloud

# Optional
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
GEMINI_API_KEY=...
```

---

## User Workflows

### Creating a Fixed Task
1. Click "Add Task" button
2. Enter title, start time, end time
3. Optionally add icon, color, subtasks
4. Save → Task appears in schedule

### Creating a Timeless Task
1. Click "Add Task" button
2. Enter title
3. Check "Timeless task" option
4. Optionally add duration estimate
5. Save → Task appears at bottom of schedule

### Using Timer
1. Click "Start" on any task
2. Timer begins countdown (or counts up for timeless)
3. Click "Pause" to temporarily stop
4. Click "Resume" to continue
5. Click "Stop" to end session
6. Total elapsed time saved to task

### Importing Schedule
1. Go to Settings view
2. Click "Import Schedule"
3. Select JSON file from disk
4. Existing schedule replaced with imported data

### Viewing Statistics
1. Click "Stats" in navigation
2. View completion charts
3. See daily productivity metrics

---

## Business Rules

### Timer Rules
- Only one timer can run at a time
- Starting a new timer automatically stops the previous one
- Pausing doesn't count toward elapsed time
- Timer state persists across page refreshes
- Timer syncs across all user devices

### Task Validation
- Title is required (cannot be empty)
- Fixed tasks must have both start and end times
- Flexible tasks must have duration
- Timeless tasks don't require any time fields
- Times must be in HH:MM format

### Data Isolation
- All data scoped to `userId` (from Clerk)
- Users can only see/modify their own schedules
- Date-based partitioning (one schedule per day)

### Real-time Updates
- All changes broadcast to connected clients immediately
- Optimistic UI updates for better perceived performance
- Server state is authoritative (client syncs to server)

---

## Future Enhancements

### Planned Features
- Drag-and-drop task reordering
- Calendar view (weekly/monthly)
- Recurring tasks
- Task templates
- Productivity insights
- Mobile app (React Native)
- Notifications and reminders
- Team/shared schedules
- Integration with Google Calendar

### Performance Optimizations
- Virtual scrolling for large schedules
- Memoized components
- Debounced autosave
- Service worker for offline support
