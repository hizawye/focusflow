# 🚀 FocusFlow Developer Guide

Welcome to the FocusFlow developer guide! This comprehensive document will help you understand the architecture, set up your development environment, and contribute effectively to the project.

## 🎯 Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Development Setup](#development-setup)
4. [Code Structure](#code-structure)
5. [Development Workflow](#development-workflow)
6. [Debugging Guide](#debugging-guide)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Contributing](#contributing)

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Git** for version control
- **VS Code** (recommended IDE)

### 5-Minute Setup

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/focusflow.git
cd focusflow

# 2. Install dependencies
npm install

# 3. Set up Convex backend
npx convex dev --once --configure=new

# 4. Start development servers
# Terminal 1: Convex backend
npx convex dev

# Terminal 2: React frontend
npm run dev

# 5. Open in browser
# Visit: http://localhost:5173
```

🎉 **You're ready to go!** The app should be running with real-time sync.

## 🏗️ Architecture Overview

### Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
├─────────────────────────────────────────────────────────────┤
│ • React 18 with TypeScript                                  │
│ • Tailwind CSS for styling                                  │
│ • Vite for build tooling                                    │
│ • Lucide React for icons                                    │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   Custom Hooks Layer                        │
├─────────────────────────────────────────────────────────────┤
│ • useConvexSchedule.ts - Main data operations               │
│ • useSchedule.ts - Legacy hook (deprecated)                 │
│ • useMigrationHelper.ts - Data migration utilities          │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   Convex Backend                            │
├─────────────────────────────────────────────────────────────┤
│ • Real-time database with WebSocket sync                    │
│ • Server-side functions for CRUD operations                 │
│ • Automatic type generation                                 │
│ • Built-in authentication ready                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action → Component → Custom Hook → Convex Mutation → Database
    ↑                                                        ↓
User Interface ← Real-time Update ← Convex Query ← Real-time Sync
```

### Key Design Principles

1. **Real-time First**: All data updates are synchronized instantly
2. **Type Safety**: Full TypeScript coverage with generated types
3. **Developer Experience**: Comprehensive logging and error handling
4. **Component Composition**: Small, focused, reusable components
5. **Performance**: Optimized with React.memo and efficient queries

## 🛠️ Development Setup

### Environment Configuration

Create your `.env.local` file:

```bash
# Convex Configuration (generated automatically)
CONVEX_DEPLOYMENT=dev:your-deployment-name
VITE_CONVEX_URL=https://your-deployment.convex.cloud

# Optional: Clerk Authentication
VITE_CLERK_FRONTEND_API_URL=https://your-clerk-app.clerk.accounts.dev
CLERK_SECRET_KEY=sk_test_your_secret_key
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key

# Optional: Gemini AI for Schedule Generation
GEMINI_API_KEY=your_gemini_api_key
```

### VS Code Setup

Recommended extensions:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "formulahendry.auto-close-tag"
  ]
}
```

### Development Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Convex
npx convex dev       # Start Convex backend
npx convex deploy    # Deploy to production

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checking
```

## 📁 Code Structure

### Directory Overview

```
focusflow/
├── 📂 src/
│   ├── 📂 components/           # React components
│   │   ├── Header.tsx          # App header with navigation
│   │   ├── ScheduleList.tsx    # Main schedule interface
│   │   ├── ScheduleItem.tsx    # Individual schedule item
│   │   ├── TaskModal.tsx       # Task editing modal
│   │   ├── TaskDetailsSidebar.tsx # Task details sidebar
│   │   ├── StatsPage.tsx       # Analytics dashboard
│   │   ├── SettingsPage.tsx    # App settings
│   │   └── ...                 # Other components
│   ├── 📂 hooks/               # Custom React hooks
│   │   ├── useConvexSchedule.ts # Main Convex integration
│   │   ├── useSchedule.ts      # Legacy hook (deprecated)
│   │   └── useMigrationHelper.ts # Data migration
│   ├── 📂 convex/              # Backend functions
│   │   ├── schema.ts           # Database schema
│   │   ├── scheduleItems.ts    # Schedule CRUD operations
│   │   ├── subtasks.ts         # Subtask management
│   │   ├── completionStatus.ts # Task completion tracking
│   │   └── _generated/         # Auto-generated types
│   ├── types.ts                # TypeScript definitions
│   ├── constants.ts            # App constants
│   ├── gemini.ts              # AI integration
│   └── App.tsx                # Main app component
├── 📂 docs/                   # Documentation
├── 📂 public/                 # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### Key Files Explained

#### `hooks/useConvexSchedule.ts`
The main data layer that handles all schedule operations:

```typescript
/**
 * Main hook for schedule management
 * Provides real-time data and mutation functions
 */
export const useScheduleFromConvex = (date: string) => {
  // Real-time queries
  const scheduleItems = useQuery(api.scheduleItems.getScheduleItems, {
    userId: MOCK_USER_ID,
    date,
  });

  // Mutation functions
  const addScheduleItem = async (item) => { /* ... */ };
  const updateItem = async (id, updates) => { /* ... */ };
  const deleteItem = async (id) => { /* ... */ };
  
  // Export/Import functionality
  const exportSchedule = () => { /* ... */ };
  const importSchedule = async (jsonString) => { /* ... */ };
  
  return {
    scheduleItems,
    addScheduleItem,
    updateItem,
    deleteItem,
    exportSchedule,
    importSchedule,
    // ... other functions
  };
};
```

#### `convex/schema.ts`
Database schema definitions:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  scheduleItems: defineTable({
    userId: v.string(),
    date: v.string(),
    title: v.string(),
    start: v.string(),
    end: v.string(),
    // ... other fields
  }).index("by_user_date", ["userId", "date"]),
  
  subtasks: defineTable({
    scheduleItemId: v.id("scheduleItems"),
    text: v.string(),
    completed: v.boolean(),
  }).index("by_schedule_item", ["scheduleItemId"]),
  
  // ... other tables
});
```

#### `components/ScheduleList.tsx`
Main schedule interface with comprehensive documentation:

```typescript
/**
 * ScheduleList Component
 * 
 * The main schedule management component that provides:
 * - Display of schedule items in chronological order
 * - Add/Edit/Delete functionality with inline forms
 * - Real-time synchronization with Convex database
 * - Subtask management for each schedule item
 * - AI-powered schedule generation via Gemini
 * - Mobile-responsive design
 */
export const ScheduleList = forwardRef<any, ScheduleListProps>(({ 
    schedule,
    completionStatus,
    onSubTaskToggle,
    onSelectTask,
    selectedTaskIdx,
    onAddTask,
    onStart,
    onStop,
}, ref) => {
  // Component implementation with detailed comments
});
```

## 🔄 Development Workflow

### 1. Making Changes

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes with proper logging
console.log('🔄 Starting operation...');
try {
  const result = await operation();
  console.log('✅ Operation completed successfully');
} catch (error) {
  console.error('❌ Operation failed:', error);
}

# Test changes
npm run build
npm run type-check
```

### 2. Code Quality Standards

#### TypeScript
- All functions must have proper type annotations
- Use interfaces for component props
- Leverage Convex generated types

#### Comments
- JSDoc for all exported functions
- Inline comments for complex logic
- TODO comments for future improvements

#### Error Handling
- Always wrap async operations in try-catch
- Log errors with emoji indicators
- Provide user-friendly error messages

### 3. Commit Convention

```bash
# Feature additions
git commit -m "feat: add export functionality to schedule items"

# Bug fixes
git commit -m "fix: resolve schedule item deletion issue"

# Documentation
git commit -m "docs: update developer guide with new API"

# Refactoring
git commit -m "refactor: improve error handling in schedule hooks"
```

## 🐛 Debugging Guide

### Common Issues

#### 1. "Property does not exist on type '{}'"
```bash
# Solution: Regenerate Convex types
npx convex dev --once
```

#### 2. Real-time updates not working
- Check Convex dev server is running
- Verify WebSocket connection in Network tab
- Ensure query parameters match mutation parameters

#### 3. Import/Export errors
- Validate JSON structure
- Check file permissions
- Verify browser file API support

### Debugging Tools

#### Browser DevTools
```javascript
// Check Convex connection
console.log('Convex client:', convex);

// Monitor real-time updates
convex.watchQuery(api.scheduleItems.getScheduleItems, args)
  .subscribe(result => console.log('📡 Real-time update:', result));

// Check WebSocket status
// Network tab → WS → Messages
```

#### Logging Conventions
```typescript
// Success operations
console.log('✅ Schedule item added successfully');

// Error operations
console.error('❌ Error adding schedule item:', error);

// In-progress operations
console.log('🔄 Processing schedule item...');

// Information
console.log('ℹ️ Current user:', userId);

// Warnings
console.warn('⚠️ Deprecated function used');
```

#### VS Code Debug Configuration
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug React App",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

## 🧪 Testing

### Manual Testing Checklist

Before submitting changes:

- [ ] **Build succeeds**: `npm run build`
- [ ] **TypeScript compiles**: `npx tsc --noEmit`
- [ ] **No console errors** in browser
- [ ] **Real-time sync works** (test with multiple tabs)
- [ ] **CRUD operations work** (Create, Read, Update, Delete)
- [ ] **Import/Export functions** work correctly
- [ ] **Mobile responsive** on different screen sizes
- [ ] **Dark mode** toggles correctly
- [ ] **Error handling** shows appropriate messages

### Test Scenarios

#### 1. Basic Functionality
```typescript
// Test schedule item creation
const newItem = {
  title: 'Test Task',
  start: '09:00',
  end: '10:00'
};

// Test real-time sync
// Open multiple browser tabs
// Add item in one tab
// Verify it appears in other tabs
```

#### 2. Edge Cases
```typescript
// Test empty states
// - No schedule items
// - No subtasks
// - Empty import file

// Test error conditions
// - Invalid time ranges
// - Network disconnection
// - Malformed JSON import
```

#### 3. Performance
```typescript
// Test with large datasets
// - 100+ schedule items
// - Multiple subtasks per item
// - Fast consecutive operations
```

## 🚀 Deployment

### Production Build

```bash
# Build frontend
npm run build

# Deploy Convex backend
npx convex deploy

# Deploy frontend (example with Vercel)
vercel --prod
```

### Environment Variables

Production `.env.local`:
```bash
CONVEX_DEPLOYMENT=prod:your-production-deployment
VITE_CONVEX_URL=https://your-production.convex.cloud
# ... other production variables
```

### Monitoring

```typescript
// Add production error tracking
window.addEventListener('error', (error) => {
  console.error('💥 Production error:', error);
  // Send to error tracking service
});

// Monitor performance
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log('⚡ Performance:', entry);
  });
});
observer.observe({ entryTypes: ['navigation', 'resource'] });
```

## 🤝 Contributing

### Code Review Checklist

- [ ] Code follows TypeScript best practices
- [ ] Functions have JSDoc comments
- [ ] Error handling is comprehensive
- [ ] Logging follows emoji conventions
- [ ] Tests pass (manual checklist)
- [ ] Documentation is updated
- [ ] No breaking changes or migration path provided

### Getting Help

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community chat
- **Discord**: Real-time developer support
- **Email**: Direct contact with maintainers

### Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- Community showcases
- Annual contributor awards

## 📚 Additional Resources

### Learning Materials

- **[React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)**
- **[Convex Documentation](https://docs.convex.dev/)**
- **[Tailwind CSS Guide](https://tailwindcss.com/docs)**
- **[Vite Documentation](https://vitejs.dev/guide/)**

### Community

- **GitHub Discussions**: Project discussions
- **Discord Server**: Real-time chat
- **Twitter**: @FocusFlowApp
- **Blog**: Technical articles and tutorials

### Roadmap

- [ ] **Q1 2025**: Drag-and-drop reordering
- [ ] **Q2 2025**: Collaborative scheduling
- [ ] **Q3 2025**: Mobile app (React Native)
- [ ] **Q4 2025**: Advanced analytics and AI features

---

## 🙏 Thank You

Thank you for contributing to FocusFlow! Your efforts help make productivity tools more accessible and effective for everyone. 

**Happy coding!** 🚀

---

*Last updated: July 2025*
*Version: 1.0.0*
