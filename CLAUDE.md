# Project: FocusFlow

## 🧠 System Behaviors
- **Docs Source:** Reference `docs/project-spec.md`, `docs/architecture.md`, `docs/project-status.md`, and `docs/changelog.md` before answering questions.
- **Auto-Update:** You MUST update the relevant `docs/` file after any code change.

## ⚡ Git Command
- **Command:** `/update-docs-and-commit`
- **Rule:** Do not add AI attribution to commits.

## 🛠 Build & Run

### Development
```bash
# Install dependencies
npm install

# Start Convex backend + React frontend (runs both concurrently)
npm run dev

# Alternative: Run separately
# Terminal 1:
npx convex dev

# Terminal 2:
npm run dev
```

### Build & Type Checking
```bash
# Build for production
npm run build

# Type checking
npm run typecheck

# Preview production build
npm run preview
```

### Environment Setup
Required environment variables in `.env.local`:
```bash
# Convex (required)
CONVEX_DEPLOYMENT=dev:your-deployment-name
VITE_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk Authentication (optional)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key

# Gemini AI (optional)
GEMINI_API_KEY=your_gemini_api_key
```

First-time Convex setup:
```bash
npx convex dev --once --configure=new
```

## 📝 Guidelines

### Code Style
- **TypeScript:** Strict typing throughout, no implicit `any`
- **Components:** Functional components with hooks only
- **Naming:** Descriptive names (e.g., `handleStartTimer`, `useScheduleFromConvex`)
- **Modular:** Separate concerns (hooks for logic, components for UI)

### Logging Convention
Use emoji-based logging for visual scanning:
```typescript
console.log('🔄 Processing...');  // In progress
console.log('✅ Success!');       // Success
console.log('❌ Error:');         // Error
console.log('ℹ️ Info:');          // Information
console.log('⚠️ Warning:');       // Warning
```

### Error Handling
Always wrap async operations:
```typescript
try {
  console.log('🔄 Starting operation...');
  const result = await someAsyncOperation();
  console.log('✅ Operation completed');
  return result;
} catch (error) {
  console.error('❌ Operation failed:', error);
  alert('User-friendly error message');
  throw error;
}
```

### Documentation
- Keep `docs/` in sync with code reality
- Update `docs/changelog.md` after feature changes
- Update `docs/project-status.md` when status changes
- Update `docs/architecture.md` for structural changes

## 🏗 Architecture Overview

### Tech Stack
- **Frontend:** React 19, TypeScript, Vite
- **Backend:** Convex (real-time database)
- **Auth:** Clerk (optional)
- **AI:** Google Gemini (optional)
- **UI:** Tailwind CSS (implied), Lucide React icons
- **DnD:** @hello-pangea/dnd

### Key Directories
```
focusflow/
├── components/        # React UI components (14 files)
├── convex/           # Backend database & functions
│   ├── schema.ts     # Database schema (3 tables)
│   ├── scheduleItems.ts  # CRUD + timer mutations
│   ├── subtasks.ts   # Subtask management
│   └── completionStatus.ts  # Completion tracking
├── hooks/            # Custom React hooks (4 files)
├── src/utils/        # Utility functions
├── types.ts          # TypeScript type definitions
└── App.tsx           # Main application orchestrator
```

### Data Flow
1. User interacts with UI components
2. Components call custom hooks (e.g., `useScheduleFromConvex`)
3. Hooks call Convex mutations/queries
4. Convex updates database in real-time
5. Real-time subscriptions update all connected clients

## 🎯 Feature Categories

### Core Features
- Real-time schedule management with Convex sync
- Three task types: Fixed (with times), Flexible (duration-based), Timeless (todos)
- Task timers with start/pause/resume/stop
- Subtasks and completion tracking
- Statistics dashboard with charts
- Import/export schedules (JSON)
- Dark/light mode theming

### AI Integration
- Gemini AI schedule generation from natural language
- Smart task scheduling suggestions

### Authentication
- Clerk integration for multi-user support
- User-specific schedules by date

## 📚 Documentation Files
- **[Project Spec](./docs/project-spec.md)** - Features, requirements, data model
- **[Architecture](./docs/architecture.md)** - Technical architecture, component hierarchy
- **[Project Status](./docs/project-status.md)** - Current status, issues, next steps
- **[Changelog](./docs/changelog.md)** - Development history and changes

## 🔧 Development Notes

### Timer System
- Client-side countdown with `setInterval` (1s)
- Server-side state tracking (`isRunning`, `isPaused`, `totalElapsed`)
- Batch duration updates every 30s to reduce server load
- Visibility change sync to prevent drift across tabs

### Real-time Sync
- Convex provides automatic real-time subscriptions
- No manual polling required
- Optimistic updates for better UX

### Known Patterns
- All times stored as strings (HH:MM format)
- Dates stored as ISO strings (YYYY-MM-DD)
- Durations in seconds (remainingDuration, totalElapsed)
- Flexible task durations in minutes (duration field)
