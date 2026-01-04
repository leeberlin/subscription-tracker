import React, { useState, useEffect } from 'react';
import { Download, Upload, Save, FolderOpen, Moon, Sun, Globe, Mail, Send, CheckCircle, XCircle, Loader, HelpCircle, X, ExternalLink } from 'lucide-react';
import { useI18n } from '../../i18n';
import { sendTestEmail, getMembersNeedingPaymentForEmail, sendReminderEmail, initEmailJS } from '../../utils/emailUtils';
import './Settings.css';

export interface AppSettings {
    theme: 'light' | 'dark' | 'system';
    defaultReminderDays: number;
    currency: string;
    language: string;
    autoSendReminders: boolean;
    reminderEmail: string;
    // EmailJS Configuration - allows each user to use their own EmailJS account
    emailjsServiceId: string;
    emailjsTemplateId: string;
    emailjsPublicKey: string;
}

const DEFAULT_SETTINGS: AppSettings = {
    theme: 'dark',
    defaultReminderDays: 7,
    currency: 'VND',
    language: 'vi',
    autoSendReminders: false,
    reminderEmail: '',
    // Default empty - user must configure their own EmailJS account
    emailjsServiceId: '',
    emailjsTemplateId: '',
    emailjsPublicKey: '',
};

const Settings: React.FC = () => {
    const { t, setLanguage } = useI18n();
    const [settings, setSettings] = useState<AppSettings>(() => {
        const saved = localStorage.getItem('subscription-tracker-settings');
        return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    });
    const [hasChanges, setHasChanges] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [emailMessage, setEmailMessage] = useState('');
    const [showEmailJSGuide, setShowEmailJSGuide] = useState(false);

    // Initialize EmailJS on mount
    useEffect(() => {
        initEmailJS();
    }, []);

    const handleChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
        setSaveSuccess(false);

        // Immediately update language in context
        if (key === 'language') {
            setLanguage(value as 'en' | 'vi');
        }
    };

    const handleSave = () => {
        localStorage.setItem('subscription-tracker-settings', JSON.stringify(settings));

        // Apply theme
        if (settings.theme !== 'system') {
            document.documentElement.setAttribute('data-theme', settings.theme);
            localStorage.setItem('theme', settings.theme);
        }

        setHasChanges(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const handleExport = async () => {
        try {
            // Get subscription data
            const data = localStorage.getItem('subscription-tracker-data') || '[]';
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            // Create download link
            const a = document.createElement('a');
            a.href = url;
            a.download = `subscription-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                try {
                    const text = await file.text();
                    const data = JSON.parse(text);
                    localStorage.setItem('subscription-tracker-data', JSON.stringify(data));
                    window.location.reload();
                } catch (error) {
                    console.error('Import failed:', error);
                    alert('Invalid backup file');
                }
            }
        };
        input.click();
    };

    const handleSendTestEmail = async () => {
        if (!settings.reminderEmail) {
            alert(settings.language === 'vi' ? 'Vui lòng nhập email!' : 'Please enter an email!');
            return;
        }

        setEmailStatus('sending');
        setEmailMessage('');

        try {
            const result = await sendTestEmail(settings.reminderEmail, settings.language);

            if (result.success) {
                setEmailStatus('success');
                setEmailMessage(result.message);
            } else {
                setEmailStatus('error');
                setEmailMessage(result.message);
            }
        } catch (error: any) {
            setEmailStatus('error');
            setEmailMessage(error?.message || 'Failed to send email');
        }

        // Reset after 5 seconds
        setTimeout(() => {
            setEmailStatus('idle');
            setEmailMessage('');
        }, 5000);
    };

    // Auto-send reminders check
    useEffect(() => {
        if (!settings.autoSendReminders || !settings.reminderEmail) return;

        const checkAndSendReminders = async () => {
            const members = getMembersNeedingPaymentForEmail(settings.defaultReminderDays);

            if (members.length > 0) {
                // Check if we already sent today
                const lastSent = localStorage.getItem('last-reminder-sent');
                const today = new Date().toDateString();

                if (lastSent !== today) {
                    console.log('Auto-sending reminder email for', members.length, 'members');
                    const result = await sendReminderEmail(settings.reminderEmail, members, settings.language);

                    if (result.success) {
                        localStorage.setItem('last-reminder-sent', today);
                        console.log('Reminder email sent successfully');
                    }
                }
            }
        };

        // Check on mount and every hour
        checkAndSendReminders();
        const interval = setInterval(checkAndSendReminders, 60 * 60 * 1000);

        return () => clearInterval(interval);
    }, [settings.autoSendReminders, settings.reminderEmail, settings.defaultReminderDays, settings.language]);

    return (
        <div className="settings-page">
            <div className="page-header">
                <h1 className="page-title">{t.settings.title}</h1>
                <p className="page-subtitle">{t.settings.subtitle}</p>
            </div>

            <div className="settings-container">
                {/* Appearance Section */}
                <section className="settings-section">
                    <div className="section-header">
                        <div className="section-icon">
                            {settings.theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                        </div>
                        <div>
                            <h2 className="section-title">{t.settings.appearance}</h2>
                            <p className="section-desc">{t.settings.appearanceDesc}</p>
                        </div>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <span className="setting-label">{t.settings.theme}</span>
                            <span className="setting-desc">{t.settings.themeDesc}</span>
                        </div>
                        <div className="theme-selector">
                            <button
                                className={`theme-btn ${settings.theme === 'light' ? 'active' : ''}`}
                                onClick={() => handleChange('theme', 'light')}
                            >
                                <Sun size={16} />
                                <span>{t.settings.light}</span>
                            </button>
                            <button
                                className={`theme-btn ${settings.theme === 'dark' ? 'active' : ''}`}
                                onClick={() => handleChange('theme', 'dark')}
                            >
                                <Moon size={16} />
                                <span>{t.settings.dark}</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Preferences Section */}
                <section className="settings-section">
                    <div className="section-header">
                        <div className="section-icon">
                            <Globe size={20} />
                        </div>
                        <div>
                            <h2 className="section-title">{t.settings.preferences}</h2>
                            <p className="section-desc">{t.settings.preferencesDesc}</p>
                        </div>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <span className="setting-label">{t.settings.currency}</span>
                            <span className="setting-desc">{t.settings.currencyDesc}</span>
                        </div>
                        <select
                            value={settings.currency}
                            onChange={(e) => handleChange('currency', e.target.value)}
                            className="setting-select"
                        >
                            <option value="VND">₫ VND</option>
                            <option value="USD">$ USD</option>
                            <option value="EUR">€ EUR</option>
                            <option value="NGN">₦ NGN</option>
                            <option value="TRY">₺ TRY</option>
                            <option value="GBP">£ GBP</option>
                            <option value="JPY">¥ JPY</option>
                        </select>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <span className="setting-label">{t.settings.language}</span>
                            <span className="setting-desc">{t.settings.languageDesc}</span>
                        </div>
                        <select
                            value={settings.language}
                            onChange={(e) => handleChange('language', e.target.value)}
                            className="setting-select"
                        >
                            <option value="en">English</option>
                            <option value="vi">Tiếng Việt</option>
                        </select>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <span className="setting-label">{t.settings.defaultReminder}</span>
                            <span className="setting-desc">{t.settings.reminderDesc}</span>
                        </div>
                        <div className="number-input">
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={settings.defaultReminderDays}
                                onChange={(e) => handleChange('defaultReminderDays', parseInt(e.target.value) || 7)}
                            />
                            <span>{t.settings.days}</span>
                        </div>
                    </div>
                </section>

                {/* Email Reminders Section */}
                <section className="settings-section">
                    <div className="section-header">
                        <div className="section-icon email-icon">
                            <Mail size={20} />
                        </div>
                        <div>
                            <h2 className="section-title">{t.settings.emailReminders}</h2>
                            <p className="section-desc">{t.settings.emailRemindersDesc}</p>
                        </div>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <span className="setting-label">{t.settings.autoSendReminders}</span>
                            <span className="setting-desc">{t.settings.autoSendRemindersDesc}</span>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.autoSendReminders}
                                onChange={(e) => handleChange('autoSendReminders', e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <span className="setting-label">{t.settings.reminderEmail}</span>
                            <span className="setting-desc">{t.settings.reminderEmailDesc}</span>
                        </div>
                        <div className="email-input-group">
                            <input
                                type="email"
                                value={settings.reminderEmail}
                                onChange={(e) => handleChange('reminderEmail', e.target.value)}
                                placeholder="email@example.com"
                                className="setting-input"
                            />
                            <button
                                className={`test-email-btn ${emailStatus}`}
                                onClick={handleSendTestEmail}
                                disabled={!settings.reminderEmail || emailStatus === 'sending'}
                            >
                                {emailStatus === 'sending' ? (
                                    <><Loader size={14} className="spin" /> <span>Đang gửi...</span></>
                                ) : emailStatus === 'success' ? (
                                    <><CheckCircle size={14} /> <span>Đã gửi!</span></>
                                ) : emailStatus === 'error' ? (
                                    <><XCircle size={14} /> <span>Thất bại</span></>
                                ) : (
                                    <><Send size={14} /> <span>{t.settings.testEmail}</span></>
                                )}
                            </button>
                        </div>
                    </div>

                    {emailStatus !== 'idle' && emailMessage && (
                        <div className={`email-status-banner ${emailStatus}`}>
                            {emailStatus === 'success' && <CheckCircle size={16} />}
                            {emailStatus === 'error' && <XCircle size={16} />}
                            {emailStatus === 'sending' && <Loader size={16} className="spin" />}
                            <span>{emailMessage}</span>
                        </div>
                    )}

                    {/* EmailJS Configuration */}
                    <div className="emailjs-config">
                        <div className="config-header">
                            <div className="config-header-row">
                                <span className="config-title">
                                    {settings.language === 'vi' ? '⚙️ Cấu hình EmailJS' : '⚙️ EmailJS Configuration'}
                                </span>
                                <button
                                    className="guide-btn"
                                    onClick={() => setShowEmailJSGuide(true)}
                                    title={settings.language === 'vi' ? 'Xem hướng dẫn' : 'View guide'}
                                >
                                    <HelpCircle size={16} />
                                    <span>{settings.language === 'vi' ? 'Hướng dẫn' : 'Guide'}</span>
                                </button>
                            </div>
                            <span className="config-desc">
                                {settings.language === 'vi'
                                    ? 'Đăng ký tại emailjs.com để lấy credentials riêng của bạn'
                                    : 'Register at emailjs.com to get your own credentials'}
                            </span>
                        </div>

                        <div className="config-row">
                            <label className="config-label">Service ID</label>
                            <input
                                type="text"
                                value={settings.emailjsServiceId}
                                onChange={(e) => handleChange('emailjsServiceId', e.target.value)}
                                placeholder="service_xxxxxxx"
                                className="config-input"
                            />
                        </div>

                        <div className="config-row">
                            <label className="config-label">Template ID</label>
                            <input
                                type="text"
                                value={settings.emailjsTemplateId}
                                onChange={(e) => handleChange('emailjsTemplateId', e.target.value)}
                                placeholder="template_xxxxxxx"
                                className="config-input"
                            />
                        </div>

                        <div className="config-row">
                            <label className="config-label">Public Key</label>
                            <input
                                type="text"
                                value={settings.emailjsPublicKey}
                                onChange={(e) => handleChange('emailjsPublicKey', e.target.value)}
                                placeholder="xxxxxxxxxxxxxx"
                                className="config-input"
                            />
                        </div>

                        {(!settings.emailjsServiceId || !settings.emailjsTemplateId || !settings.emailjsPublicKey) && (
                            <div className="config-warning">
                                ⚠️ {settings.language === 'vi'
                                    ? 'Chưa cấu hình EmailJS. Email sẽ không hoạt động cho đến khi bạn nhập đủ thông tin.'
                                    : 'EmailJS not configured. Email will not work until you enter all credentials.'}
                            </div>
                        )}
                    </div>
                </section>

                {/* Data Management Section */}
                <section className="settings-section">
                    <div className="section-header">
                        <div className="section-icon">
                            <FolderOpen size={20} />
                        </div>
                        <div>
                            <h2 className="section-title">{t.settings.dataManagement}</h2>
                            <p className="section-desc">{t.settings.dataManagementDesc}</p>
                        </div>
                    </div>

                    <div className="data-actions">
                        <button className="data-btn export" onClick={handleExport}>
                            <Download size={18} />
                            <div className="data-btn-text">
                                <span className="data-btn-title">{t.settings.export}</span>
                                <span className="data-btn-desc">{t.settings.exportDesc}</span>
                            </div>
                        </button>
                        <button className="data-btn import" onClick={handleImport}>
                            <Upload size={18} />
                            <div className="data-btn-text">
                                <span className="data-btn-title">{t.settings.import}</span>
                                <span className="data-btn-desc">{t.settings.importDesc}</span>
                            </div>
                        </button>
                    </div>
                </section>

                {/* Save Changes */}
                {hasChanges && (
                    <div className="save-banner">
                        <span>{t.settings.unsavedChanges}</span>
                        <button className="save-btn" onClick={handleSave}>
                            <Save size={16} />
                            <span>{t.settings.saveChanges}</span>
                        </button>
                    </div>
                )}

                {saveSuccess && (
                    <div className="success-banner">
                        ✓ {t.settings.savedSuccess}
                    </div>
                )}
            </div>

            {/* EmailJS Setup Guide Modal */}
            {showEmailJSGuide && (
                <div className="guide-overlay" onClick={() => setShowEmailJSGuide(false)}>
                    <div className="guide-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="guide-header">
                            <h2>
                                {settings.language === 'vi' ? '📧 Hướng dẫn cài đặt EmailJS' : '📧 EmailJS Setup Guide'}
                            </h2>
                            <button className="guide-close" onClick={() => setShowEmailJSGuide(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="guide-content">
                            <div className="guide-step">
                                <div className="step-number">1</div>
                                <div className="step-content">
                                    <h3>{settings.language === 'vi' ? 'Đăng ký tài khoản' : 'Create an account'}</h3>
                                    <p>
                                        {settings.language === 'vi'
                                            ? 'Truy cập EmailJS và đăng ký tài khoản miễn phí (200 emails/tháng)'
                                            : 'Visit EmailJS and create a free account (200 emails/month)'}
                                    </p>
                                    <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="guide-link">
                                        <ExternalLink size={14} />
                                        emailjs.com
                                    </a>
                                </div>
                            </div>

                            <div className="guide-step">
                                <div className="step-number">2</div>
                                <div className="step-content">
                                    <h3>{settings.language === 'vi' ? 'Tạo Email Service' : 'Create Email Service'}</h3>
                                    <p>
                                        {settings.language === 'vi'
                                            ? 'Vào "Email Services" → "Add New Service" → Chọn Gmail/Outlook → Kết nối tài khoản email của bạn'
                                            : 'Go to "Email Services" → "Add New Service" → Choose Gmail/Outlook → Connect your email'}
                                    </p>
                                    <p className="step-note">
                                        {settings.language === 'vi'
                                            ? '💡 Sau khi tạo, copy "Service ID" (ví dụ: service_abc123)'
                                            : '💡 After creation, copy the "Service ID" (e.g., service_abc123)'}
                                    </p>
                                </div>
                            </div>

                            <div className="guide-step">
                                <div className="step-number">3</div>
                                <div className="step-content">
                                    <h3>{settings.language === 'vi' ? 'Tạo Email Template' : 'Create Email Template'}</h3>
                                    <p>
                                        {settings.language === 'vi'
                                            ? 'Vào "Email Templates" → "Create New Template" → Thiết kế template với các biến sau:'
                                            : 'Go to "Email Templates" → "Create New Template" → Design using these variables:'}
                                    </p>
                                    <div className="template-vars">
                                        <code>{'{{to_email}}'}</code> - {settings.language === 'vi' ? 'Email nhận' : 'Recipient email'}
                                        <code>{'{{name}}'}</code> - {settings.language === 'vi' ? 'Tên người nhận' : 'Recipient name'}
                                        <code>{'{{subject}}'}</code> - {settings.language === 'vi' ? 'Tiêu đề' : 'Subject'}
                                        <code>{'{{message}}'}</code> - {settings.language === 'vi' ? 'Nội dung chính' : 'Main message'}
                                        <code>{'{{members_list}}'}</code> - {settings.language === 'vi' ? 'Danh sách thành viên' : 'Members list'}
                                        <code>{'{{time}}'}</code> - {settings.language === 'vi' ? 'Thời gian gửi' : 'Send time'}
                                    </div>
                                    <p className="step-note">
                                        {settings.language === 'vi'
                                            ? '💡 Copy "Template ID" (ví dụ: template_xyz789)'
                                            : '💡 Copy the "Template ID" (e.g., template_xyz789)'}
                                    </p>
                                </div>
                            </div>

                            <div className="guide-step">
                                <div className="step-number">4</div>
                                <div className="step-content">
                                    <h3>{settings.language === 'vi' ? 'Lấy Public Key' : 'Get Public Key'}</h3>
                                    <p>
                                        {settings.language === 'vi'
                                            ? 'Vào "Account" → "General" → Copy "Public Key"'
                                            : 'Go to "Account" → "General" → Copy "Public Key"'}
                                    </p>
                                </div>
                            </div>

                            <div className="guide-step">
                                <div className="step-number">5</div>
                                <div className="step-content">
                                    <h3>{settings.language === 'vi' ? 'Nhập vào app' : 'Enter in app'}</h3>
                                    <p>
                                        {settings.language === 'vi'
                                            ? 'Dán Service ID, Template ID và Public Key vào các ô tương ứng ở trên → Lưu → Test email!'
                                            : 'Paste Service ID, Template ID and Public Key in the fields above → Save → Test email!'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="guide-footer">
                            <a href="https://www.emailjs.com/docs/" target="_blank" rel="noopener noreferrer" className="guide-docs-link">
                                <ExternalLink size={14} />
                                {settings.language === 'vi' ? 'Xem tài liệu EmailJS đầy đủ' : 'View full EmailJS documentation'}
                            </a>
                            <button className="guide-done-btn" onClick={() => setShowEmailJSGuide(false)}>
                                {settings.language === 'vi' ? 'Đã hiểu' : 'Got it'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
