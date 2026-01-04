import React, { useState, useEffect } from 'react';
import './SettingsPanel.css';

export interface AppSettings {
    theme: 'light' | 'dark' | 'system';
    defaultReminderDays: number;
    currency: string;
    language: string;
    autoSendReminders: boolean;
    emailSignature: string;
}

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    settings: AppSettings;
    onSaveSettings: (settings: AppSettings) => void;
    onExportData: () => void;
    onImportData: (file: File) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
    theme: 'system',
    defaultReminderDays: 7,
    currency: 'VND',
    language: 'vi',
    autoSendReminders: false,
    emailSignature: 'Trân trọng,\nSubscription Tracker',
};

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
    isOpen,
    onClose,
    settings,
    onSaveSettings,
    onExportData,
    onImportData,
}) => {
    const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
    const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'backup'>('general');
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setLocalSettings(settings);
        setHasChanges(false);
    }, [settings, isOpen]);

    const handleChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSave = () => {
        onSaveSettings(localSettings);
        setHasChanges(false);
    };

    const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImportData(file);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="settings-overlay" onClick={onClose}>
            <div className="settings-panel" onClick={e => e.stopPropagation()}>
                <div className="settings-header">
                    <h2>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        Cài đặt
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="settings-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                        Chung
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notifications')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" />
                        </svg>
                        Thông báo
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'backup' ? 'active' : ''}`}
                        onClick={() => setActiveTab('backup')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Sao lưu
                    </button>
                </div>

                <div className="settings-content">
                    {activeTab === 'general' && (
                        <div className="settings-section">
                            <div className="setting-group">
                                <label className="setting-label">
                                    <span className="label-text">Giao diện</span>
                                    <span className="label-description">Chọn chế độ hiển thị</span>
                                </label>
                                <div className="theme-options">
                                    <button
                                        className={`theme-btn ${localSettings.theme === 'light' ? 'active' : ''}`}
                                        onClick={() => handleChange('theme', 'light')}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="5" />
                                            <line x1="12" y1="1" x2="12" y2="3" />
                                            <line x1="12" y1="21" x2="12" y2="23" />
                                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                            <line x1="1" y1="12" x2="3" y2="12" />
                                            <line x1="21" y1="12" x2="23" y2="12" />
                                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                        </svg>
                                        <span>Sáng</span>
                                    </button>
                                    <button
                                        className={`theme-btn ${localSettings.theme === 'dark' ? 'active' : ''}`}
                                        onClick={() => handleChange('theme', 'dark')}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                        </svg>
                                        <span>Tối</span>
                                    </button>
                                    <button
                                        className={`theme-btn ${localSettings.theme === 'system' ? 'active' : ''}`}
                                        onClick={() => handleChange('theme', 'system')}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                            <line x1="8" y1="21" x2="16" y2="21" />
                                            <line x1="12" y1="17" x2="12" y2="21" />
                                        </svg>
                                        <span>Hệ thống</span>
                                    </button>
                                </div>
                            </div>

                            <div className="setting-group">
                                <label className="setting-label" htmlFor="currency">
                                    <span className="label-text">Tiền tệ mặc định</span>
                                    <span className="label-description">Đơn vị tiền tệ cho subscription mới</span>
                                </label>
                                <select
                                    id="currency"
                                    className="setting-select"
                                    value={localSettings.currency}
                                    onChange={e => handleChange('currency', e.target.value)}
                                >
                                    <option value="VND">₫ VND - Việt Nam Đồng</option>
                                    <option value="USD">$ USD - US Dollar</option>
                                    <option value="EUR">€ EUR - Euro</option>
                                    <option value="NGN">₦ NGN - Nigerian Naira</option>
                                    <option value="TRY">₺ TRY - Turkish Lira</option>
                                    <option value="GBP">£ GBP - British Pound</option>
                                    <option value="JPY">¥ JPY - Japanese Yen</option>
                                </select>
                            </div>

                            <div className="setting-group">
                                <label className="setting-label" htmlFor="language">
                                    <span className="label-text">Ngôn ngữ</span>
                                    <span className="label-description">Ngôn ngữ hiển thị</span>
                                </label>
                                <select
                                    id="language"
                                    className="setting-select"
                                    value={localSettings.language}
                                    onChange={e => handleChange('language', e.target.value)}
                                >
                                    <option value="vi">🇻🇳 Tiếng Việt</option>
                                    <option value="en">🇺🇸 English</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="settings-section">
                            <div className="setting-group">
                                <label className="setting-label" htmlFor="reminderDays">
                                    <span className="label-text">Số ngày nhắc nhở trước hạn</span>
                                    <span className="label-description">Mặc định cho subscription mới</span>
                                </label>
                                <div className="input-with-suffix">
                                    <input
                                        type="number"
                                        id="reminderDays"
                                        className="setting-input"
                                        min="1"
                                        max="30"
                                        value={localSettings.defaultReminderDays}
                                        onChange={e => handleChange('defaultReminderDays', parseInt(e.target.value) || 7)}
                                    />
                                    <span className="input-suffix">ngày</span>
                                </div>
                            </div>

                            <div className="setting-group">
                                <label className="setting-label">
                                    <span className="label-text">Chữ ký email</span>
                                    <span className="label-description">Thêm vào cuối email nhắc nhở</span>
                                </label>
                                <textarea
                                    className="setting-textarea"
                                    rows={3}
                                    value={localSettings.emailSignature}
                                    onChange={e => handleChange('emailSignature', e.target.value)}
                                    placeholder="Nhập chữ ký email..."
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'backup' && (
                        <div className="settings-section">
                            {/* Storage Info */}
                            <div className="storage-info-card">
                                <div className="storage-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                    </svg>
                                </div>
                                <div className="storage-details">
                                    <h3>Nơi lưu trữ dữ liệu</h3>
                                    <p>Dữ liệu được lưu tự động trên máy tính của bạn.</p>
                                    <span className="storage-path">📍 ~/Library/Application Support/subscription-tracker/</span>
                                </div>
                            </div>

                            <div className="backup-card">
                                <div className="backup-icon export">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                </div>
                                <div className="backup-info">
                                    <h3>Xuất dữ liệu</h3>
                                    <p>Tải file backup để chia sẻ hoặc upload lên Google Drive, Dropbox...</p>
                                </div>
                                <button className="backup-btn export" onClick={onExportData}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                    Xuất file
                                </button>
                            </div>

                            <div className="backup-card">
                                <div className="backup-icon import">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                </div>
                                <div className="backup-info">
                                    <h3>Nhập dữ liệu</h3>
                                    <p>Khôi phục từ file backup (từ bạn bè hoặc cloud storage)</p>
                                </div>
                                <label className="backup-btn import">
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={handleFileImport}
                                        style={{ display: 'none' }}
                                    />
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    Chọn file
                                </label>
                            </div>

                            <div className="backup-tip">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                                <div>
                                    <strong>Mẹo:</strong> Để chia sẻ dữ liệu giữa các thiết bị, xuất file backup và lưu vào Google Drive hoặc gửi qua email/Telegram.
                                </div>
                            </div>

                            <div className="backup-warning">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                                <span>Lưu ý: Nhập dữ liệu sẽ ghi đè toàn bộ dữ liệu hiện tại</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="settings-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        Hủy bỏ
                    </button>
                    <button
                        className="save-btn"
                        onClick={handleSave}
                        disabled={!hasChanges && activeTab !== 'backup'}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                            <polyline points="17 21 17 13 7 13 7 21" />
                            <polyline points="7 3 7 8 15 8" />
                        </svg>
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
};

export { DEFAULT_SETTINGS };
