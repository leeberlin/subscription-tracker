import { useState, useEffect, useCallback } from 'react';

// Check if we're running in Tauri environment
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

interface AppData {
    subscriptions: any[];
    settings: any;
    version: string;
    last_saved: string;
}

// Tauri invoke wrapper
async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
    if (!isTauri) {
        throw new Error('Not running in Tauri environment');
    }
    // @ts-ignore - Tauri types
    return window.__TAURI__.core.invoke(cmd, args);
}

export function useTauriStorage() {
    const [dataPath, setDataPath] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get data path on mount
    useEffect(() => {
        if (isTauri) {
            invoke<string>('get_data_path')
                .then(path => setDataPath(path))
                .catch(err => console.error('Failed to get data path:', err));
        }
    }, []);

    // Save data to local file
    const saveToFile = useCallback(async (subscriptions: any[], settings: any): Promise<boolean> => {
        if (!isTauri) {
            // Fallback to localStorage for web
            try {
                localStorage.setItem('subscription-tracker-data', JSON.stringify(subscriptions));
                localStorage.setItem('subscription-tracker-settings', JSON.stringify(settings));
                return true;
            } catch (err) {
                console.error('LocalStorage save error:', err);
                return false;
            }
        }

        setIsSaving(true);
        setError(null);

        try {
            const path = await invoke<string>('save_data', {
                subscriptions: subscriptions,
                settings: settings
            });
            setDataPath(path);
            setLastSaved(new Date().toISOString());
            setIsSaving(false);
            return true;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            setError(errorMsg);
            setIsSaving(false);
            return false;
        }
    }, []);

    // Load data from local file
    const loadFromFile = useCallback(async (): Promise<{ subscriptions: any[]; settings: any } | null> => {
        if (!isTauri) {
            // Fallback to localStorage for web
            try {
                const subscriptions = JSON.parse(localStorage.getItem('subscription-tracker-data') || '[]');
                const settings = JSON.parse(localStorage.getItem('subscription-tracker-settings') || '{}');
                return { subscriptions, settings };
            } catch (err) {
                console.error('LocalStorage load error:', err);
                return null;
            }
        }

        try {
            const data = await invoke<AppData>('load_data');
            setLastSaved(data.last_saved);
            return {
                subscriptions: data.subscriptions as any[],
                settings: data.settings
            };
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            // Not an error if file doesn't exist yet
            if (!errorMsg.includes('No saved data')) {
                setError(errorMsg);
            }
            return null;
        }
    }, []);

    // Check if has saved data
    const hasSavedData = useCallback(async (): Promise<boolean> => {
        if (!isTauri) {
            return localStorage.getItem('subscription-tracker-data') !== null;
        }

        try {
            return await invoke<boolean>('has_saved_data');
        } catch (err) {
            return false;
        }
    }, []);

    // Format last saved time
    const formatLastSaved = (): string => {
        if (!lastSaved) return 'Chưa lưu';

        const date = new Date(lastSaved);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} giờ trước`;

        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return {
        isTauri,
        dataPath,
        lastSaved,
        lastSavedFormatted: formatLastSaved(),
        isSaving,
        error,
        saveToFile,
        loadFromFile,
        hasSavedData,
    };
}
