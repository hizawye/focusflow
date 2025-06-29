# FocusFlow

A customizable daily schedule and productivity app. Stay focused, track your tasks, and visualize your progress with a beautiful, modern interface.

## Features
- Fully customizable daily schedule (add, edit, delete, and reorder time blocks)
- Sub-tasks, icons, and color selection for each block
- Expandable/collapsible blocks with progress tracking
- Live timeline and "You are here" marker
- Persistent storage in your browser (localStorage, private by default)
- Import/export your schedule as JSON (in the schedule editor)
- Start with a blank schedule or a default template
- Visual stats and completion tracking
- Dark mode and alarm options
- Modern, responsive UI/UX

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)

### Install & Run
```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

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
