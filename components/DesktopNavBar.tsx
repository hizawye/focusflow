import React from 'react';
import { Calendar, Settings } from 'lucide-react';

// Sidebar navigation for desktop
export function DesktopNavBar({ view, setView, NavItem }: any) {
  return (
    <nav className="hidden md:flex flex-col w-20 bg-white/90 dark:bg-gray-900/90 border-r border-gray-200 dark:border-gray-800 py-6 items-center gap-4 relative">
      <NavItem icon={Calendar} label="Schedule" activeView={view} targetView="schedule" />
      {/* <NavItem icon={PieChart} label="Stats" activeView={view} targetView="stats" dynamicIcon /> */}
      <NavItem icon={Settings} label="Settings" activeView={view} targetView="settings" />
    </nav>
  );
}
