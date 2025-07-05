import React from 'react';
import { Calendar, PieChart, Settings } from 'lucide-react';

// Mobile bottom navigation/footer
export function MobileNavBar({ view, setView, NavItem }: any) {
  return (
    <footer className="fixed md:hidden bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 z-40">
      <nav className="max-w-2xl mx-auto flex justify-around p-2">
        <NavItem icon={Calendar} label="Schedule" activeView={view} targetView="schedule" />
        <NavItem icon={PieChart} label="Stats" activeView={view} targetView="stats" dynamicIcon />
        <NavItem icon={Settings} label="Settings" activeView={view} targetView="settings" />
      </nav>
    </footer>
  );
}
