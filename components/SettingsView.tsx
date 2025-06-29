
import React from 'react';

interface SwitchProps {
    label: string;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

const Switch: React.FC<SwitchProps> = ({ label, enabled, onChange }) => (
    <div
        onClick={() => onChange(!enabled)}
        className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-lg cursor-pointer shadow-sm"
    >
        <span className="font-medium text-gray-700 dark:text-gray-200">{label}</span>
        <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${enabled ? 'translate-x-6' : 'translate-x-1'}`} style={{top: '4px'}} />
        </div>
    </div>
);

interface SettingsViewProps {
    isDarkMode: boolean;
    onToggleDarkMode: (value: boolean) => void;
    isAlarmEnabled: boolean;
    onToggleAlarm: (value: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ isDarkMode, onToggleDarkMode, isAlarmEnabled, onToggleAlarm }) => {
    return (
        <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
             <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">Settings</h2>
             <div className="space-y-4 max-w-md mx-auto">
                <Switch label="Dark Mode" enabled={isDarkMode} onChange={onToggleDarkMode} />
                <Switch label="Enable Alarms" enabled={isAlarmEnabled} onChange={onToggleAlarm} />
             </div>
        </div>
    );
};
