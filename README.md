# 🎯 FocusFlow - AI-Powered Daily Scheduler

A beautiful, modern task scheduler with real-time synchronization, AI-powered schedule generation, and responsive design. Built with React, TypeScript, Convex, and Tailwind CSS.

## ✨ Features

- 📅 **Interactive Schedule Management** - Create, edit, and organize your daily tasks
- 🤖 **AI-Powered Schedule Generation** - Use Gemini AI to generate schedules from natural language
- ☁️ **Real-time Sync** - Your data syncs instantly across all devices with Convex
- 🌙 **Dark/Light Mode** - Toggle between beautiful themes
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- ⏱️ **Task Timer** - Track time spent on tasks with built-in timers
- ✅ **Subtasks & Completion Tracking** - Break down tasks and track progress
- 📊 **Statistics Dashboard** - Visualize your productivity with charts
- 🔒 **Authentication Ready** - Clerk integration for user management (optional)

## 🏗️ Architecture

```
FocusFlow/
├── 📂 components/          # React components
│   ├── Header.tsx         # App header with navigation
│   ├── ScheduleList.tsx   # Main schedule interface
│   ├── TaskModal.tsx      # Task details modal
│   ├── StatsPage.tsx      # Analytics dashboard
│   └── SettingsPage.tsx   # App settings
├── 📂 convex/             # Backend database & functions
│   ├── schema.ts          # Database schema
│   ├── scheduleItems.ts   # Schedule CRUD operations
│   ├── subtasks.ts        # Subtask management
│   └── completionStatus.ts # Task completion tracking
├── 📂 hooks/              # Custom React hooks
│   ├── useSchedule.ts     # Legacy schedule hook
│   ├── useConvexSchedule.ts # Convex integration hooks
│   └── useMigrationHelper.ts # Data migration utilities
├── 📂 types/              # TypeScript definitions
├── 📂 constants/          # App constants
└── 📂 docs/              # Documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Git** for version control
- **Modern browser** (Chrome, Firefox, Safari, Edge)

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd focusflow

# Install dependencies
npm install
```

### 2. Set Up Backend (Convex)

```bash
# Initialize Convex (if not already done)
npx convex dev --once --configure=new

# This will:
# - Create a Convex account (if needed)
# - Set up your database
# - Generate .env.local with your keys
```

### 3. Configure Environment

Create or verify your `.env.local` file:

```bash
# Convex Configuration
CONVEX_DEPLOYMENT=dev:your-deployment-name
VITE_CONVEX_URL=https://your-deployment.convex.cloud

# Optional: Clerk Authentication
VITE_CLERK_FRONTEND_API_URL=https://your-clerk-app.clerk.accounts.dev
CLERK_SECRET_KEY=sk_test_your_secret_key
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key

# Optional: Gemini AI for Schedule Generation
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Start Development

```bash
# Terminal 1: Start Convex backend
npx convex dev

# Terminal 2: Start React app
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser!

## Usage
- **Add/Edit/Delete/Reorder Blocks:** Use the schedule view and editor to manage your time blocks. Customize with sub-tasks, icons, and colors. Drag-and-drop reordering coming soon.
- **Expandable Blocks:** Click a block to expand and view sub-tasks, progress, and details.
- **Live Timeline:** See a real-time indicator of your current position in the day.
- **Import/Export/Start Blank:** Use the schedule editor to back up, restore, or clear your schedule as a JSON file.
- **Stats:** View your completion stats in the Stats tab.
- **Settings:** Toggle dark mode and alarms.

## Personal Schedule
- Your personal schedule is stored in your browser and never uploaded.
- If you want to keep a backup, use the Export button. To restore, use Import.
- For advanced users: you can keep a `my_schedule.json` (gitignored) for your own backup.

## Customization
- To change the default schedule for new users, edit `DEFAULT_SCHEDULE` in `constants.ts`.
- To provide a template for others, share a JSON file.

## Contributing
Pull requests are welcome! For major changes, please open an issue first.

## License
MIT

## 💻 Development Experience

### Code Quality & Documentation

This project emphasizes **developer experience** with:

- **📝 Comprehensive JSDoc comments** on all functions
- **🪵 Consistent logging** with emoji indicators for easy debugging
- **🛡️ TypeScript** throughout the codebase
- **🔄 Real-time error handling** with user-friendly messages
- **📚 Detailed inline documentation** explaining complex logic

### Logging Convention

We use emoji-based logging for quick visual scanning:

```typescript
console.log('🔄 Processing...'); // In progress
console.log('✅ Success!');      // Success
console.log('❌ Error:');        // Error
console.log('ℹ️ Info:');         // Information
console.log('⚠️ Warning:');      // Warning
```

### Error Handling Pattern

All async operations follow this pattern:

```typescript
const handleOperation = async () => {
  console.log('🔄 Starting operation...');
  try {
    const result = await someAsyncOperation();
    console.log('✅ Operation completed successfully');
    return result;
  } catch (error) {
    console.error('❌ Operation failed:', error);
    // Show user-friendly error message
    alert('Operation failed. Please try again.');
    throw error;
  }
};
```

## 🧪 Testing Your Changes

### Development Checklist

Before submitting changes, verify:

- [ ] **Build succeeds**: `npm run build`
- [ ] **TypeScript compiles**: `npx tsc --noEmit`
- [ ] **No console errors** in browser dev tools
- [ ] **Real-time sync works** (test with multiple tabs)
- [ ] **Import/Export functions** work correctly
- [ ] **Mobile responsive** on different screen sizes
- [ ] **Dark mode** toggles correctly
- [ ] **All CRUD operations** work (Create, Read, Update, Delete)

### Common Test Scenarios

1. **Empty State**: What happens with no schedule items?
2. **Large Dataset**: Performance with many items?
3. **Network Issues**: Behavior when Convex is offline?
4. **Invalid Data**: Handling malformed import data?

## 🐛 Debugging Guide

### Common Issues & Solutions

1. **"Property does not exist on type '{}'"**
   ```bash
   # Regenerate Convex types
   npx convex dev --once
   ```

2. **Real-time updates not working**
   - Check Convex dev server is running
   - Verify WebSocket connection in Network tab
   - Ensure query parameters match mutation parameters

3. **Import errors**
   - Check file paths are correct
   - Ensure proper TypeScript imports
   - Verify Convex generated files exist

### Debugging Tools

- **Browser DevTools**: Network tab for Convex connections
- **React DevTools**: Component state inspection
- **Convex Dashboard**: Database contents and function calls
- **VS Code**: TypeScript error highlighting

## 📱 Features Overview

### Current Features

- **📅 Schedule Management**: Create, edit, delete, and reorder tasks
- **☁️ Real-time Sync**: Instant updates across all devices
- **📊 Statistics**: Track completion rates and productivity
- **🌙 Dark Mode**: Beautiful light/dark theme switching
- **📱 Mobile Responsive**: Works on all screen sizes
- **📤 Import/Export**: Backup and restore schedules as JSON
- **✅ Subtasks**: Break down tasks into manageable pieces
- **⏱️ Timer**: Track time spent on tasks
- **🤖 AI Integration**: Generate schedules with Gemini AI

### Technical Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Convex (real-time database)
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Authentication**: Clerk (optional)
- **AI**: Google Gemini (optional)

## 🚀 Performance Optimizations

### Built-in Optimizations

- **Real-time subscriptions** instead of polling
- **Optimistic updates** for better UX
- **Memoized components** and calculations
- **Efficient sorting** and filtering
- **Lazy loading** for large datasets

### Memory Management

- **Automatic cleanup** of subscriptions
- **Efficient state updates** with Convex
- **Proper event listener cleanup**
- **Optimized re-renders** with React.memo

## 🔐 Security Considerations

### Data Privacy

- **User data** stored securely in Convex
- **Authentication** handled by Clerk
- **No sensitive data** in localStorage
- **Secure API communications**

### Development Security

- **Environment variables** for sensitive keys
- **No hardcoded credentials**
- **Secure development practices**
- **Regular dependency updates**

## 📈 Monitoring & Analytics

### Development Monitoring

- **Console logging** for debugging
- **Error tracking** with try-catch blocks
- **Performance monitoring** with browser tools
- **Real-time connection status**

### Production Considerations

- **Error boundaries** for graceful failures
- **Performance metrics** tracking
- **User feedback** collection
- **Crash reporting** integration

## 🤝 Contributing Guidelines

### Code Style

- **TypeScript** for all new code
- **Functional components** with hooks
- **Consistent naming** conventions
- **Comprehensive JSDoc** comments

### Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch
3. **Add** comprehensive tests
4. **Update** documentation
5. **Submit** pull request with description

### Code Review Checklist

- [ ] TypeScript types are correct
- [ ] Error handling is comprehensive
- [ ] Logging follows conventions
- [ ] Code is well-documented
- [ ] Tests cover new functionality
- [ ] Performance impact is considered

## 📚 Additional Resources

### Documentation

- **[CONTRIBUTING.md](./CONTRIBUTING.md)**: Detailed contributor guide
- **[CONVEX_INTEGRATION.md](./CONVEX_INTEGRATION.md)**: Convex setup guide
- **[Architecture](./docs/ARCHITECTURE.md)**: Technical architecture
- **[API Reference](./docs/API.md)**: Function documentation

### Learning Resources

- **[React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)**
- **[Convex Documentation](https://docs.convex.dev/)**
- **[Tailwind CSS Docs](https://tailwindcss.com/docs)**
- **[Vite Documentation](https://vitejs.dev/)**

### Community

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and ideas
- **Discord**: Real-time community chat
- **Email**: Direct contact with maintainers

## 🔄 Continuous Improvement

This project is continuously evolving with:

- **Regular updates** to dependencies
- **Performance improvements**
- **New feature additions**
- **Bug fixes** and stability improvements
- **Documentation updates**
- **Community feedback** integration

## 🙏 Acknowledgments

Thanks to all contributors who make FocusFlow better:

- **Core developers** for architecture and features
- **Community contributors** for bug fixes and improvements
- **Beta testers** for feedback and testing
- **Documentation contributors** for better guides

---

**Ready to contribute?** Check out our [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines!

**Need help?** Open an issue or join our community discussions!
