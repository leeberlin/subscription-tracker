import { useState, useCallback, useEffect } from 'react';
import {
    uploadBackupToDrive,
    downloadBackupFromDrive,
    checkDriveBackup,
    createBackupData
} from '../utils/googleDrive';

interface CloudSyncState {
    isSyncing: boolean;
    lastSyncTime: string | null;
    lastCloudBackupTime: string | null;
    syncError: string | null;
    autoSyncEnabled: boolean;
}

const CLOUD_SYNC_SETTINGS_KEY = 'subscription-tracker-cloud-sync';
const AUTO_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

function loadSyncSettings(): Partial<CloudSyncState> {
    try {
        const stored = localStorage.getItem(CLOUD_SYNC_SETTINGS_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch {
        // ignore
    }
    return {};
}

function saveSyncSettings(settings: Partial<CloudSyncState>): void {
    localStorage.setItem(CLOUD_SYNC_SETTINGS_KEY, JSON.stringify(settings));
}

export function useCloudSync(subscriptions: any[], settings: any) {
    const [state, setState] = useState<CloudSyncState>(() => {
        const saved = loadSyncSettings();
        return {
            isSyncing: false,
            lastSyncTime: saved.lastSyncTime || null,
            lastCloudBackupTime: saved.lastCloudBackupTime || null,
            syncError: null,
            autoSyncEnabled: saved.autoSyncEnabled ?? true,
        };
    });

    // Save settings when they change
    useEffect(() => {
        saveSyncSettings({
            lastSyncTime: state.lastSyncTime,
            lastCloudBackupTime: state.lastCloudBackupTime,
            autoSyncEnabled: state.autoSyncEnabled,
        });
    }, [state.lastSyncTime, state.lastCloudBackupTime, state.autoSyncEnabled]);

    // Upload to Google Drive
    const uploadToCloud = useCallback(async (): Promise<boolean> => {
        setState(prev => ({ ...prev, isSyncing: true, syncError: null }));

        try {
            const backupData = createBackupData(subscriptions, settings);
            const result = await uploadBackupToDrive(backupData);

            if (result.success) {
                const now = new Date().toISOString();
                setState(prev => ({
                    ...prev,
                    isSyncing: false,
                    lastSyncTime: now,
                    lastCloudBackupTime: now,
                    syncError: null,
                }));
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    isSyncing: false,
                    syncError: result.error || 'Upload failed',
                }));
                return false;
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                isSyncing: false,
                syncError: error instanceof Error ? error.message : 'Unknown error',
            }));
            return false;
        }
    }, [subscriptions, settings]);

    // Download from Google Drive
    const downloadFromCloud = useCallback(async (): Promise<{
        success: boolean;
        data?: { subscriptions: any[]; settings: any };
        error?: string;
    }> => {
        setState(prev => ({ ...prev, isSyncing: true, syncError: null }));

        try {
            const result = await downloadBackupFromDrive();

            if (result.success && result.data) {
                setState(prev => ({
                    ...prev,
                    isSyncing: false,
                    lastCloudBackupTime: result.lastModified || null,
                    syncError: null,
                }));
                return {
                    success: true,
                    data: {
                        subscriptions: result.data.subscriptions,
                        settings: result.data.settings,
                    },
                };
            } else {
                setState(prev => ({
                    ...prev,
                    isSyncing: false,
                    syncError: result.error || 'Download failed',
                }));
                return { success: false, error: result.error };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setState(prev => ({
                ...prev,
                isSyncing: false,
                syncError: errorMessage,
            }));
            return { success: false, error: errorMessage };
        }
    }, []);

    // Check cloud backup status
    const checkCloudStatus = useCallback(async (): Promise<void> => {
        try {
            const result = await checkDriveBackup();
            if (result.exists && result.lastModified) {
                setState(prev => ({
                    ...prev,
                    lastCloudBackupTime: result.lastModified || null,
                }));
            }
        } catch (error) {
            console.error('Check cloud status error:', error);
        }
    }, []);

    // Toggle auto-sync
    const toggleAutoSync = useCallback((enabled: boolean): void => {
        setState(prev => ({ ...prev, autoSyncEnabled: enabled }));
    }, []);

    // Clear sync error
    const clearError = useCallback((): void => {
        setState(prev => ({ ...prev, syncError: null }));
    }, []);

    // Auto-sync effect
    useEffect(() => {
        if (!state.autoSyncEnabled || subscriptions.length === 0) {
            return;
        }

        // Initial check
        checkCloudStatus();

        // Set up interval for auto-sync
        const interval = setInterval(() => {
            if (!state.isSyncing) {
                uploadToCloud();
            }
        }, AUTO_SYNC_INTERVAL);

        return () => clearInterval(interval);
    }, [state.autoSyncEnabled, subscriptions.length, checkCloudStatus, uploadToCloud, state.isSyncing]);

    // Format last sync time
    const formatSyncTime = (isoString: string | null): string => {
        if (!isoString) return 'Chưa đồng bộ';

        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} giờ trước`;

        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays} ngày trước`;

        return date.toLocaleDateString('vi-VN');
    };

    return {
        // State
        isSyncing: state.isSyncing,
        lastSyncTime: state.lastSyncTime,
        lastCloudBackupTime: state.lastCloudBackupTime,
        syncError: state.syncError,
        autoSyncEnabled: state.autoSyncEnabled,

        // Formatted
        lastSyncTimeFormatted: formatSyncTime(state.lastSyncTime),
        lastCloudBackupTimeFormatted: formatSyncTime(state.lastCloudBackupTime),

        // Actions
        uploadToCloud,
        downloadFromCloud,
        checkCloudStatus,
        toggleAutoSync,
        clearError,
    };
}
