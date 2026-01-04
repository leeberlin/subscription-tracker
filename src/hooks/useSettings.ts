import { useState, useEffect, useCallback } from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '../components/SettingsPanel';

const SETTINGS_KEY = 'subscription-tracker-settings';

export function useSettings() {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setSettings({ ...DEFAULT_SETTINGS, ...parsed });
            } catch {
                setSettings(DEFAULT_SETTINGS);
            }
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

            // Apply theme
            applyTheme(settings.theme);
        }
    }, [settings, isLoading]);

    const updateSettings = useCallback((newSettings: AppSettings) => {
        setSettings(newSettings);
    }, []);

    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
    }, []);

    return {
        settings,
        isLoading,
        updateSettings,
        resetSettings,
    };
}

function applyTheme(theme: 'light' | 'dark' | 'system') {
    const root = document.documentElement;

    if (theme === 'system') {
        // Remove the forced theme attribute, let CSS media query handle it
        root.removeAttribute('data-theme');
    } else {
        root.setAttribute('data-theme', theme);
    }
}
