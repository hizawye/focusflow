# Changelog

All notable changes to FocusFlow are documented here.

## [Unreleased]

### 2026-01-07 - Sprint 2: Timer Refactoring + Codebase Cleanup
**Type:** Refactoring, Cleanup

#### Added
- **Timer Context System** (`contexts/TimerContext.tsx`)
  - Created React Context for timer state management
  - Provides `useTimer()` hook for accessing timer state throughout component tree
  - Centralizes all timer control functions (start, stop, pause, resume)
  - Eliminates prop drilling for timer-related state

- **Timer Manager Hook** (`hooks/useTimerManager.ts`)
  - Extracted all timer logic from App.tsx (~150 lines)
  - Manages local timer countdown (every 1 second)
  - Handles batch duration updates (every 30 seconds)
  - Implements visibility sync (prevents timer drift on tab switch)
  - Initializes timer durations from Convex

#### Deleted (Cleanup)
- **Unused Files Removed** (7 files, ~700 lines):
  - `App_enhanced.tsx` - Old/duplicate version of App.tsx
  - `components/ConvexScheduleExample.tsx` - Unused example component
  - `hooks/useSchedule.ts` - Deprecated local schedule hook
  - `hooks/useMigrationHelper.ts` - Old migration utility
  - `flexible-scheduling-examples.ts` - Example file
  - `gemini-test.ts` - Test file not in active suite
  - `test-timeless-tasks.ts` - Test file not in active suite

#### Changed
- **App.tsx Refactoring**
  - Reduced from 609 lines to ~454 lines (~25% reduction)
  - Removed all timer-related useEffect hooks (5 hooks extracted)
  - Created `AppContent` component that consumes TimerContext
  - Wrapped authenticated content with `TimerProvider`
  - Removed duplicate `renderView` function

- **DesktopNavBar.tsx**
  - Removed unused `PieChart` import from lucide-react

#### Technical Details
- **Architecture Improvement**: Timer logic now follows React best practices with Context + Hook pattern
- **State Management**: Single source of truth for timer state via TimerContext
- **Performance**: Reduced prop drilling, cleaner component hierarchy
- **Bundle Size**: Smaller due to removed unused files and imports
- **TypeScript**: Fixed type issues in timer functions (Promise<null> to Promise<void>)

---

### 2026-01-07 - Sprint 1 Refactoring: Foundation
**Type:** Refactoring

#### Added
- **Constants Module** (`constants/`)
  - Created `constants/intervals.ts` - Centralized timer intervals, breakpoints, and layout constants
  - Created `constants/defaults.ts` - Default values for tasks, time slots, and configurations
  - Eliminates magic numbers throughout codebase (replaced `10000`, `30000`, `1000` with named constants)

- **Time Utilities** (`utils/timeUtils.ts`)
  - `parseTime()` - Parse HH:MM time strings (eliminates duplicate parsing code)
  - `calculateDuration()` - Calculate duration between start/end times
  - `calculateRemainingTime()` - Calculate remaining time for fixed tasks
  - `formatTime()` - Format seconds into human-readable time
  - Additional helpers: `minutesToSeconds()`, `secondsToMinutes()`, `isTaskActive()`, `createDateWithTime()`
  - Removes code duplication (3+ instances of time parsing logic consolidated)

- **Toast Notification System**
  - Created `hooks/useToast.ts` - Custom hook for managing toast notifications
  - Created `components/ToastContainer.tsx` - Toast UI component with animations
  - Created `index.css` - Global CSS with slide-in animation for toasts
  - Supports 4 types: success, error, info, warning
  - Auto-dismisses after 5 seconds (configurable via TIMER_INTERVALS.TOAST_DISMISS)
  - Better UX than browser alert() dialogs

#### Changed
- **App.tsx Improvements**
  - Replaced all `alert()` calls with `showToast()` (5 instances)
  - Replaced magic numbers with constants from `TIMER_INTERVALS`:
    - `10000` → `TIMER_INTERVALS.NOW_UPDATE`
    - `1000` → `TIMER_INTERVALS.TIMER_TICK`
    - `30000` → `TIMER_INTERVALS.DURATION_BATCH`
  - Replaced duplicate time parsing with `parseTime()` utility (3 locations)
  - Replaced complex remaining time calculation with `calculateRemainingTime()` utility
  - Line count reduced: 613 lines → 609 lines (cleaner, more maintainable code)

#### Technical Details
- **Code Quality Improvements**:
  - DRY principle applied: eliminated duplicate time parsing logic
  - Magic numbers removed: all intervals now use named constants
  - Better error handling: toast notifications instead of blocking alerts
  - TypeScript errors reduced (removed unused LAYOUT import)
  - Improved code organization with dedicated utility modules

- **Files Modified**:
  - `App.tsx` - 55 lines changed (24 insertions, 31 deletions)

- **Files Added**:
  - `constants/intervals.ts` (46 lines)
  - `constants/defaults.ts` (58 lines)
  - `utils/timeUtils.ts` (162 lines)
  - `hooks/useToast.ts` (67 lines)
  - `components/ToastContainer.tsx` (110 lines)
  - `index.css` (19 lines)

#### Next Steps
- Sprint 2: Timer refactoring (extract to dedicated hook/context)
- Sprint 3: State & performance optimization
- Sprint 4: Type safety improvements & cleanup
- Sprint 5: Component refactoring

---

### 2026-01-07 - Timer Visibility Sync Fix
**Type:** Bug Fix

#### Fixed
- **Timer Reset Bug on Tab Switch**
  - Fixed issue where timers would reset to full duration when switching browser tabs
  - Changed visibility sync to merge timer state instead of replacing entire timers object
  - Timer now correctly preserves countdown progress across tab switches
  - Location: `App.tsx:169` - Changed `setTimers({ ... })` to `setTimers(prev => ({ ...prev, ... }))`

#### Technical Details
- Previous behavior: `setTimers({ [runningTimer._id]: duration })` replaced entire state
- New behavior: `setTimers(prev => ({ ...prev, [runningTimer._id]: duration }))` merges state
- Fixes issue where non-running timer durations were lost on visibility change

---

### 2026-01-07 - Environment Configuration Fix
**Type:** Bug Fix

#### Fixed
- **Clerk Authentication Error**
  - Renamed `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` to `VITE_CLERK_PUBLISHABLE_KEY`
  - Fixed "Missing Clerk Publishable Key" error on app load
  - Vite requires `VITE_` prefix for environment variables, not `NEXT_PUBLIC_`

---

### 2026-01-07 - Documentation Initialization
**Type:** Documentation

#### Added
- **Project Documentation Structure**
  - Created `CLAUDE.md` with developer guidelines and project overview
  - Created `docs/` directory with comprehensive documentation
  - Added `docs/changelog.md` for tracking development history
  - Added `docs/project-spec.md` with complete feature specifications
  - Added `docs/architecture.md` with detailed technical architecture
  - Added `docs/project-status.md` with current status and roadmap

#### Documentation Highlights
- Documented all three task types (Fixed, Flexible, Timeless)
- Explained timer system architecture (client-server hybrid)
- Documented Convex database schema and indexes
- Outlined authentication flow with Clerk
- Identified known issues and future roadmap
- Included code style guidelines and logging conventions

---

### 2026-01-07 - Scheduling and Timer Refactoring
**Commit:** `14e824e`

#### Changed
- Refactored scheduling and timer logic for improved reliability
- Enhanced timer state management and synchronization
- Improved countdown accuracy and performance

---

## 2025 Development History

### 2025-12 - Flexible and Timeless Task System
**Commits:** `b5afb7e`, `7ad3449`

#### Added
- **Timeless Tasks:** Tasks without specific start/end times (pure todos)
  - New `isTimeless` boolean field in schema
  - Tasks can now exist without time constraints
  - Useful for daily todos that don't require specific time blocks
- **Flexible Task Documentation:** Comprehensive docs for flexible scheduling system
  - Explained three task types: Fixed, Flexible, Timeless
  - Documented `isFlexible`, `duration`, `preferredTimeSlots`, `earliestStart`, `latestEnd` fields

#### Technical Details
- Updated `convex/schema.ts` with optional `isTimeless` field
- Modified `convex/scheduleItems.ts` mutations to handle timeless tasks
- Updated `types.ts` interface with timeless properties
- Enhanced UI to support tasks without time display

---

### 2025-11 - Authentication Integration
**Commits:** `5c7cad0`, `1ba7c26`, `eafdb3b`, `656b9a9`, `23e833c`, `09d09bc`

#### Added
- **Clerk Authentication Integration**
  - Full user authentication system
  - User-specific schedules and data isolation
  - Authentication-aware UI components
  - Sign in/Sign up flow
- **Authentication Components:**
  - `AuthGuard` - Protects authenticated routes
  - `UnauthenticatedState` - Landing page for logged-out users
  - `Header` - Shows user profile and sign out

#### Changed
- Replaced mock user IDs with real Clerk user IDs
- Updated all Convex queries/mutations to use `userId` from Clerk
- Task detail components now authentication-aware
- Schema updated with `userId: v.string()` for all user data

#### Technical Details
- Added `@clerk/clerk-react` and `@convex-dev/auth` dependencies
- Integrated Clerk provider with Convex client
- Updated database indexes to filter by `userId`
- All schedule items now scoped to authenticated user

---

## Schema Evolution

### Current Schema (v3)
```typescript
scheduleItems {
  userId: string              // Clerk user ID
  title: string
  start?: string              // Optional (HH:MM)
  end?: string                // Optional (HH:MM)
  isFlexible?: boolean        // Task can be scheduled flexibly
  isTimeless?: boolean        // Task has no specific time
  duration?: number           // Duration in minutes (flexible)
  preferredTimeSlots?: string[] // ['morning', 'afternoon', 'evening']
  earliestStart?: string      // Earliest start time (flexible)
  latestEnd?: string          // Latest end time (flexible)
  remainingDuration?: number  // Remaining time in seconds
  isRunning?: boolean         // Timer running
  isPaused?: boolean          // Timer paused
  pausedAt?: number           // Pause timestamp
  startedAt?: number          // Start timestamp
  totalElapsed?: number       // Total elapsed seconds
  icon?: string
  color?: string
  manualStatus?: 'done' | 'missed'
  date: string                // ISO date (YYYY-MM-DD)
  createdAt: number
  updatedAt: number
}
```

### Migration Notes
- **v1 → v2:** Added authentication (userId field, updated indexes)
- **v2 → v3:** Added flexible and timeless task support (isFlexible, isTimeless, duration fields)

---

## Feature History

### Core Features Timeline
1. **Initial Release:** Basic schedule management, timers, dark mode
2. **Real-time Sync:** Convex integration for multi-device sync
3. **Authentication:** Clerk integration for multi-user support
4. **Flexible Tasks:** Duration-based scheduling with preferences
5. **Timeless Tasks:** Todo-style tasks without time constraints
6. **Timer Refactoring:** Improved accuracy and state management

### Breaking Changes
- **Authentication Update:** All existing schedules now require user authentication
  - Data migration needed for existing users
  - Mock user ID replaced with Clerk authentication

---

## Development Patterns

### Commit Message Convention
- `feat:` - New features
- `refactor:` - Code restructuring without behavior change
- `docs:` - Documentation updates
- `fix:` - Bug fixes

### Logging Convention
All code uses emoji-based logging:
- 🔄 Processing/In progress
- ✅ Success
- ❌ Error
- ℹ️ Information
- ⚠️ Warning
