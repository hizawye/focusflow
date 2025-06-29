import React, { useState } from 'react';

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
    onImportSchedule: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onExportSchedule: () => void;
    onClearSchedule: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ isDarkMode, onToggleDarkMode, isAlarmEnabled, onToggleAlarm, onImportSchedule, onExportSchedule, onClearSchedule }) => {
    const [showClearModal, setShowClearModal] = useState(false);
    const handleClear = () => setShowClearModal(true);
    const confirmClear = () => {
        setShowClearModal(false);
        onClearSchedule();
    };
    const cancelClear = () => setShowClearModal(false);
    return (
        <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
             <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">Settings</h2>
             <div className="space-y-4 max-w-md mx-auto">
                <Switch label="Dark Mode" enabled={isDarkMode} onChange={onToggleDarkMode} />
                <Switch label="Enable Alarms" enabled={isAlarmEnabled} onChange={onToggleAlarm} />
             </div>
             <div className="mt-8 max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Schedule Management</h3>
                <div className="flex gap-2 mb-2">
                    <button onClick={onExportSchedule} className="bg-primary-600 text-white px-3 py-1 rounded">Export</button>
                    <label className="bg-primary-600 text-white px-3 py-1 rounded cursor-pointer">
                        Import
                        <input type="file" accept="application/json" onChange={onImportSchedule} className="hidden" />
                    </label>
                    <button onClick={handleClear} className="bg-gray-400 text-white px-3 py-1 rounded">Clear Schedule</button>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Import/export your schedule as JSON. Clearing will erase your current schedule.</div>
             </div>
             {showClearModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-xs w-full text-center animate-fade-in">
                        <div className="text-lg font-semibold mb-2">Clear your schedule?</div>
                        <div className="text-gray-500 mb-4">This will erase all your current schedule blocks. This action cannot be undone.</div>
                        <div className="flex gap-2 justify-center">
                            <button onClick={confirmClear} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Clear</button>
                            <button onClick={cancelClear} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
                        </div>
                    </div>
                </div>
             )}
        </div>
    );
};
