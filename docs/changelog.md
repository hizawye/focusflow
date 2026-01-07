# Changelog

All notable changes to FocusFlow are documented here.

## [Unreleased]

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
