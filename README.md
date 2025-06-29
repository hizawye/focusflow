# FocusFlow

A customizable daily schedule and productivity app. Stay focused, track your tasks, and visualize your progress with a beautiful, modern interface.

## Features
- Customizable daily schedule (add, edit, delete time blocks)
- Persistent storage in your browser (localStorage)
- Import/export your schedule as JSON
- Start with a blank schedule or a default template
- Visual stats and completion tracking
- Dark mode and alarm options

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
- **Add/Edit/Delete Blocks:** Use the schedule view to manage your time blocks. Time pickers make setup easy.
- **Import/Export:** Use the buttons to back up or restore your schedule as a JSON file.
- **Start Blank:** Click 'Start Blank' to clear your schedule and begin fresh.
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
