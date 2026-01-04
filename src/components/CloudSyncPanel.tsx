import React, { useState, useEffect } from 'react';
import { isAuthenticated, getAuthUrl, disconnectGoogle } from '../utils/googleDrive';
import './CloudSyncPanel.css';

interface CloudSyncPanelProps {
    isOpen: boolean;
    onClose: () => void;
    // Cloud sync state
    isSyncing: boolean;
    lastSyncTimeFormatted: string;
    lastCloudBackupTimeFormatted: string;
    syncError: string | null;
    autoSyncEnabled: boolean;
    // Actions
    onUpload: () => Promise<boolean>;
    onDownload: () => Promise<{ success: boolean; data?: any; error?: string }>;
    onToggleAutoSync: (enabled: boolean) => void;
    onClearError: () => void;
    onRestoreData: (data: { subscriptions: any[]; settings: any }) => void;
}

export const CloudSyncPanel: React.FC<CloudSyncPanelProps> = ({
    isOpen,
    onClose,
    isSyncing,
    lastSyncTimeFormatted,
    lastCloudBackupTimeFormatted,
    syncError,
    autoSyncEnabled,
    onUpload,
    onDownload,
    onToggleAutoSync,
    onClearError,
    onRestoreData,
}) => {
    const [actionResult, setActionResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [showConfirmRestore, setShowConfirmRestore] = useState(false);
    const [isGoogleConnected, setIsGoogleConnected] = useState(false);

    useEffect(() => {
        setIsGoogleConnected(isAuthenticated());
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConnectGoogle = () => {
        const authUrl = getAuthUrl();
        // Open in a popup window
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        window.open(
            authUrl,
            'google-oauth',
            `width=${width},height=${height},left=${left},top=${top},popup=1`
        );
    };

    const handleDisconnectGoogle = () => {
        disconnectGoogle();
        setIsGoogleConnected(false);
        setActionResult({ type: 'success', message: 'Đã ngắt kết nối tài khoản Google' });
    };

    const handleUpload = async () => {
        if (!isGoogleConnected) {
            setActionResult({ type: 'error', message: 'Vui lòng kết nối tài khoản Google trước' });
            return;
        }

        setActionResult(null);
        const success = await onUpload();
        if (success) {
            setActionResult({ type: 'success', message: 'Đã tải lên Google Drive thành công!' });
        } else {
            setActionResult({ type: 'error', message: 'Tải lên thất bại. Vui lòng thử lại.' });
        }
    };

    const handleDownload = async () => {
        if (!isGoogleConnected) {
            setActionResult({ type: 'error', message: 'Vui lòng kết nối tài khoản Google trước' });
            return;
        }

        setActionResult(null);
        setShowConfirmRestore(false);

        const result = await onDownload();
        if (result.success && result.data) {
            onRestoreData(result.data);
            setActionResult({ type: 'success', message: 'Đã khôi phục dữ liệu từ Google Drive!' });
        } else {
            setActionResult({ type: 'error', message: result.error || 'Khôi phục thất bại.' });
        }
    };

    return (
        <div className="cloud-sync-overlay" onClick={onClose}>
            <div className="cloud-sync-modal" onClick={e => e.stopPropagation()}>
                <div className="cloud-sync-header">
                    <h2>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                        </svg>
                        Google Drive Sync
                    </h2>
                    <button className="cloud-sync-close" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="cloud-sync-content">
                    {/* Google Account Connection */}
                    <div className="google-account-section">
                        {isGoogleConnected ? (
                            <div className="google-connected">
                                <div className="google-status">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                        <polyline points="22 4 12 14.01 9 11.01" />
                                    </svg>
                                    <div>
                                        <h4>Đã kết nối Google</h4>
                                        <p>cloud.storage.center14@gmail.com</p>
                                    </div>
                                </div>
                                <button className="disconnect-btn" onClick={handleDisconnectGoogle}>
                                    Ngắt kết nối
                                </button>
                            </div>
                        ) : (
                            <div className="google-not-connected">
                                <div className="google-status">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="15" y1="9" x2="9" y2="15" />
                                        <line x1="9" y1="9" x2="15" y2="15" />
                                    </svg>
                                    <div>
                                        <h4>Chưa kết nối Google</h4>
                                        <p>Kết nối để đồng bộ dữ liệu</p>
                                    </div>
                                </div>
                                <button className="connect-btn" onClick={handleConnectGoogle}>
                                    <svg width="18" height="18" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Kết nối Google
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Status */}
                    <div className="sync-status-card">
                        <div className="sync-status-icon">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                                <polyline points="8 12 12 16 16 12" />
                                <line x1="12" y1="8" x2="12" y2="16" />
                            </svg>
                        </div>
                        <div className="sync-status-info">
                            <h3>Trạng thái đồng bộ</h3>
                            <div className="sync-status-row">
                                <span className="label">Đồng bộ cuối:</span>
                                <span className="value">{lastSyncTimeFormatted}</span>
                            </div>
                            <div className="sync-status-row">
                                <span className="label">Backup trên cloud:</span>
                                <span className="value">{lastCloudBackupTimeFormatted}</span>
                            </div>
                        </div>
                        <div className={`sync-indicator ${isSyncing ? 'syncing' : 'idle'}`}>
                            {isSyncing ? (
                                <>
                                    <div className="sync-spinner"></div>
                                    <span>Đang đồng bộ...</span>
                                </>
                            ) : (
                                <>
                                    <div className="sync-dot"></div>
                                    <span>Sẵn sàng</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Error */}
                    {syncError && (
                        <div className="sync-error">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            <span>{syncError}</span>
                            <button onClick={onClearError}>Đóng</button>
                        </div>
                    )}

                    {/* Action Result */}
                    {actionResult && (
                        <div className={`sync-result ${actionResult.type}`}>
                            {actionResult.type === 'success' ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                            )}
                            <span>{actionResult.message}</span>
                        </div>
                    )}

                    {/* Auto Sync Toggle */}
                    <div className="sync-option">
                        <div className="sync-option-info">
                            <h4>Tự động đồng bộ</h4>
                            <p>Tự động tải lên Google Drive mỗi 5 phút</p>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={autoSyncEnabled}
                                onChange={e => onToggleAutoSync(e.target.checked)}
                                disabled={!isGoogleConnected}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="sync-actions">
                        <button
                            className="sync-action-btn upload"
                            onClick={handleUpload}
                            disabled={isSyncing || !isGoogleConnected}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <span>Tải lên Cloud</span>
                        </button>

                        <button
                            className="sync-action-btn download"
                            onClick={() => setShowConfirmRestore(true)}
                            disabled={isSyncing || !isGoogleConnected}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            <span>Khôi phục từ Cloud</span>
                        </button>
                    </div>

                    {/* Confirm Restore */}
                    {showConfirmRestore && (
                        <div className="sync-confirm">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            <div className="confirm-content">
                                <h4>Xác nhận khôi phục</h4>
                                <p>Dữ liệu hiện tại sẽ bị ghi đè bởi dữ liệu từ Google Drive. Bạn có chắc chắn?</p>
                            </div>
                            <div className="confirm-actions">
                                <button className="btn-cancel" onClick={() => setShowConfirmRestore(false)}>Hủy</button>
                                <button className="btn-confirm" onClick={handleDownload}>Khôi phục</button>
                            </div>
                        </div>
                    )}

                    {/* Info */}
                    <div className="sync-info">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        <p>Dữ liệu được lưu vào folder trên Google Drive của bạn. Bạn có thể truy cập và quản lý backup từ Google Drive.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
