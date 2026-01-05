import React, { useState, useEffect } from 'react';
import { Member, MemberFormData } from '../types/subscription';
import { getTodayString, getDefaultExpirationDate } from '../utils/dateUtils';
import { X, Mail, User, Calendar, Wallet, FileText, Sparkles, UserPlus, Edit3, ChevronDown, Link2, Phone } from 'lucide-react';
import './MemberForm.css';

// Custom SVG Icons for Social Platforms
const ZaloIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 17.024c-.063.047-.168.094-.316.094H6.455c-.252 0-.394-.11-.394-.363 0-.11.063-.221.126-.331l4.646-6.551H6.77c-.379 0-.568-.189-.568-.568s.189-.568.568-.568h4.898c.284 0 .473.126.473.41 0 .126-.063.252-.158.379l-4.772 6.677h4.993c.473 0 .631.284.631.568-.063.126-.158.189-.347.253zm3.152-3.849c-.063.379-.442.631-.82.568l-1.262-.221c-.063.347-.126.694-.221 1.041-.063.252-.221.442-.473.505-.063.016-.126.016-.189.016-.284 0-.536-.189-.599-.473-.095-.41-.158-.82-.221-1.23l-1.23-.221c-.379-.063-.631-.442-.568-.82.063-.379.442-.631.82-.568l1.073.189c.031-.252.063-.505.126-.757.063-.252.252-.442.505-.473h.031c.284 0 .536.189.599.473.063.347.126.694.158 1.041l1.104.189c.379.063.631.442.568.82v-.079z" />
    </svg>
);

const DiscordIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
);

const TelegramIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
);

// Billing Cycle Options
const BILLING_CYCLE_OPTIONS = [
    { value: 'monthly' as const, label: 'Theo tháng', shortLabel: '/tháng' },
    { value: 'yearly' as const, label: 'Theo năm', shortLabel: '/năm' },
];

interface MemberFormProps {
    member?: Member | null;
    subscriptionName?: string;
    defaultAmount?: number;
    currency?: string;
    billingCycle?: 'monthly' | 'yearly';
    onSubmit: (data: MemberFormData) => void;
    onCancel: () => void;
}

const CURRENCY_OPTIONS = [
    { code: 'VND', symbol: '₫', name: 'Việt Nam Đồng' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
    { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

const initialFormData: MemberFormData = {
    name: '',
    email: '',
    phone: '',
    joinDate: getTodayString(),
    amountPaid: 0,
    nextPaymentDate: getDefaultExpirationDate(1),
    notes: '',
    socialLinks: {
        zalo: '',
        discord: '',
        telegram: '',
    },
};

export const MemberForm: React.FC<MemberFormProps> = ({
    member,
    subscriptionName = 'Subscription',
    defaultAmount = 0,
    currency = 'VND',
    billingCycle: defaultBillingCycle = 'monthly',
    onSubmit,
    onCancel,
}) => {
    const [formData, setFormData] = useState<MemberFormData>({
        ...initialFormData,
        amountPaid: defaultAmount,
    });
    const [errors, setErrors] = useState<Partial<Record<keyof MemberFormData, string>>>({});
    const [selectedCurrency, setSelectedCurrency] = useState(currency);
    const [amountString, setAmountString] = useState(defaultAmount.toString());
    const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
    const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'yearly'>(defaultBillingCycle);

    useEffect(() => {
        if (member) {
            setFormData({
                name: member.name,
                email: member.email,
                phone: member.phone || '',
                joinDate: member.joinDate,
                amountPaid: member.amountPaid,
                nextPaymentDate: member.nextPaymentDate,
                notes: member.notes || '',
                socialLinks: {
                    zalo: member.socialLinks?.zalo || '',
                    discord: member.socialLinks?.discord || '',
                    telegram: member.socialLinks?.telegram || '',
                },
            });
            setAmountString(member.amountPaid.toString());
        } else {
            setFormData({
                ...initialFormData,
                amountPaid: defaultAmount,
                joinDate: getTodayString(),
                nextPaymentDate: getDefaultExpirationDate(1),
            });
            setAmountString(defaultAmount > 0 ? defaultAmount.toString() : '');
        }
    }, [member, defaultAmount]);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof MemberFormData, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Vui lòng nhập tên thành viên';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }
        if (!formData.joinDate) {
            newErrors.joinDate = 'Vui lòng chọn ngày tham gia';
        }
        if (!formData.nextPaymentDate) {
            newErrors.nextPaymentDate = 'Vui lòng chọn ngày thanh toán tiếp theo';
        }
        if (formData.amountPaid < 0) {
            newErrors.amountPaid = 'Số tiền không thể âm';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const handleChange = (field: keyof MemberFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleAmountChange = (value: string) => {
        // Remove all non-numeric characters except decimal point
        let cleanValue = value.replace(/[^0-9.]/g, '');

        // Prevent leading zeros (except for "0." decimal cases)
        if (cleanValue.length > 1 && cleanValue.startsWith('0') && !cleanValue.startsWith('0.')) {
            cleanValue = cleanValue.replace(/^0+/, '');
        }

        // Ensure only one decimal point
        const parts = cleanValue.split('.');
        if (parts.length > 2) {
            cleanValue = parts[0] + '.' + parts.slice(1).join('');
        }

        // Limit decimal places to 2
        if (parts.length === 2 && parts[1].length > 2) {
            cleanValue = parts[0] + '.' + parts[1].slice(0, 2);
        }

        setAmountString(cleanValue);
        const numValue = parseFloat(cleanValue) || 0;
        handleChange('amountPaid', numValue);
    };

    const handleQuickPaymentDate = (months: number) => {
        const date = new Date();
        date.setMonth(date.getMonth() + months);
        handleChange('nextPaymentDate', date.toISOString().split('T')[0]);
        // Auto-update billing cycle based on selection
        if (months >= 12) {
            setSelectedBillingCycle('yearly');
        } else {
            setSelectedBillingCycle('monthly');
        }
    };

    const handleSocialLinkChange = (platform: 'zalo' | 'discord' | 'telegram', value: string) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [platform]: value,
            },
        }));
    };

    const getDisplayPrice = () => {
        const amount = formData.amountPaid;
        if (selectedBillingCycle === 'yearly') {
            return `${getCurrencySymbol(selectedCurrency)}${amount.toLocaleString()}/năm`;
        }
        return `${getCurrencySymbol(selectedCurrency)}${amount.toLocaleString()}/tháng`;
    };

    const getCurrencySymbol = (curr: string) => {
        const found = CURRENCY_OPTIONS.find(c => c.code === curr);
        return found ? found.symbol : curr;
    };

    const handleCurrencySelect = (currencyCode: string) => {
        setSelectedCurrency(currencyCode);
        setShowCurrencyDropdown(false);
    };

    return (
        <div className="member-form-overlay" onClick={onCancel}>
            <div className="member-form-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="member-form-header">
                    <div className="header-content">
                        <div className={`header-icon ${member ? 'edit' : 'add'}`}>
                            {member ? <Edit3 size={24} /> : <UserPlus size={24} />}
                        </div>
                        <div className="header-text">
                            <h2>{member ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}</h2>
                            <p className="subscription-badge">
                                <Sparkles size={12} />
                                {subscriptionName}
                            </p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onCancel} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="member-form-body">
                    {/* Name Field */}
                    <div className={`form-field ${errors.name ? 'has-error' : ''}`}>
                        <label htmlFor="memberName">
                            <User size={14} />
                            <span>Họ và tên</span>
                            <span className="required">*</span>
                        </label>
                        <div className="input-wrapper">
                            <input
                                id="memberName"
                                type="text"
                                value={formData.name}
                                onChange={e => handleChange('name', e.target.value)}
                                placeholder="Nguyễn Văn A"
                            />
                        </div>
                        {errors.name && <span className="field-error">{errors.name}</span>}
                    </div>

                    {/* Email Field */}
                    <div className={`form-field ${errors.email ? 'has-error' : ''}`}>
                        <label htmlFor="memberEmail">
                            <Mail size={14} />
                            <span>Email</span>
                            <span className="required">*</span>
                        </label>
                        <div className="input-wrapper">
                            <input
                                id="memberEmail"
                                type="email"
                                value={formData.email}
                                onChange={e => handleChange('email', e.target.value)}
                                placeholder="email@example.com"
                            />
                        </div>
                        {errors.email && <span className="field-error">{errors.email}</span>}
                    </div>

                    {/* Date & Amount Row */}
                    <div className="form-row">
                        <div className={`form-field ${errors.joinDate ? 'has-error' : ''}`}>
                            <label htmlFor="joinDate">
                                <Calendar size={14} />
                                <span>Ngày tham gia</span>
                                <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <input
                                    id="joinDate"
                                    type="date"
                                    value={formData.joinDate}
                                    onChange={e => handleChange('joinDate', e.target.value)}
                                />
                            </div>
                            {errors.joinDate && <span className="field-error">{errors.joinDate}</span>}
                        </div>

                        <div className={`form-field ${errors.amountPaid ? 'has-error' : ''}`}>
                            <label htmlFor="amountPaid">
                                <Wallet size={14} />
                                <span>Số tiền đã trả</span>
                            </label>
                            <div className="input-wrapper amount-input-group">
                                {/* Currency Selector */}
                                <div className="currency-selector">
                                    <button
                                        type="button"
                                        className="currency-btn"
                                        onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                                    >
                                        <span className="currency-symbol">{getCurrencySymbol(selectedCurrency)}</span>
                                        <span className="currency-code">{selectedCurrency}</span>
                                        <ChevronDown size={12} />
                                    </button>
                                    {showCurrencyDropdown && (
                                        <div className="currency-dropdown">
                                            {CURRENCY_OPTIONS.map(curr => (
                                                <button
                                                    key={curr.code}
                                                    type="button"
                                                    className={`currency-option ${selectedCurrency === curr.code ? 'active' : ''}`}
                                                    onClick={() => handleCurrencySelect(curr.code)}
                                                >
                                                    <span className="curr-symbol">{curr.symbol}</span>
                                                    <span className="curr-code">{curr.code}</span>
                                                    <span className="curr-name">{curr.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* Amount Input */}
                                <input
                                    id="amountPaid"
                                    type="text"
                                    inputMode="numeric"
                                    className="amount-field"
                                    value={amountString}
                                    onChange={e => handleAmountChange(e.target.value.replace(/[^0-9.]/g, ''))}
                                    placeholder="0"
                                />
                            </div>
                            {errors.amountPaid && <span className="field-error">{errors.amountPaid}</span>}

                            {/* Billing Cycle Toggle */}
                            <div className="billing-cycle-toggle">
                                {BILLING_CYCLE_OPTIONS.map(option => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`cycle-btn ${selectedBillingCycle === option.value ? 'active' : ''}`}
                                        onClick={() => setSelectedBillingCycle(option.value)}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            <div className="price-display">
                                <span className="price-label">Giá hiển thị:</span>
                                <span className="price-value">{getDisplayPrice()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Next Payment Date */}
                    <div className={`form-field ${errors.nextPaymentDate ? 'has-error' : ''}`}>
                        <label htmlFor="nextPaymentDate">
                            <Calendar size={14} />
                            <span>Ngày thanh toán tiếp theo</span>
                            <span className="required">*</span>
                        </label>
                        <div className="input-wrapper">
                            <input
                                id="nextPaymentDate"
                                type="date"
                                value={formData.nextPaymentDate}
                                onChange={e => handleChange('nextPaymentDate', e.target.value)}
                            />
                        </div>
                        {errors.nextPaymentDate && <span className="field-error">{errors.nextPaymentDate}</span>}

                        {/* Quick Duration Buttons */}
                        <div className="quick-duration">
                            <span className="quick-label">Chu kỳ nhanh:</span>
                            <div className="quick-buttons">
                                {[
                                    { months: 1, label: '1 tháng' },
                                    { months: 3, label: '3 tháng' },
                                    { months: 6, label: '6 tháng' },
                                    { months: 12, label: '1 năm' },
                                ].map(({ months, label }) => (
                                    <button
                                        key={months}
                                        type="button"
                                        className="quick-btn"
                                        onClick={() => handleQuickPaymentDate(months)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div className="form-field">
                        <label htmlFor="memberPhone">
                            <Phone size={14} />
                            <span>Số điện thoại</span>
                        </label>
                        <div className="input-wrapper">
                            <input
                                id="memberPhone"
                                type="tel"
                                value={formData.phone || ''}
                                onChange={e => handleChange('phone', e.target.value)}
                                placeholder="0912 345 678"
                            />
                        </div>
                    </div>

                    {/* Social Links Section */}
                    <div className="form-field social-links-section">
                        <label>
                            <Link2 size={14} />
                            <span>Liên kết mạng xã hội</span>
                        </label>
                        <div className="social-links-grid">
                            {/* Zalo */}
                            <div className="social-input-group">
                                <div className="social-icon zalo">
                                    <ZaloIcon />
                                </div>
                                <input
                                    type="text"
                                    value={formData.socialLinks?.zalo || ''}
                                    onChange={e => handleSocialLinkChange('zalo', e.target.value)}
                                    placeholder="Số điện thoại Zalo hoặc link"
                                />
                            </div>

                            {/* Discord */}
                            <div className="social-input-group">
                                <div className="social-icon discord">
                                    <DiscordIcon />
                                </div>
                                <input
                                    type="text"
                                    value={formData.socialLinks?.discord || ''}
                                    onChange={e => handleSocialLinkChange('discord', e.target.value)}
                                    placeholder="Discord username (e.g., user#1234)"
                                />
                            </div>

                            {/* Telegram */}
                            <div className="social-input-group">
                                <div className="social-icon telegram">
                                    <TelegramIcon />
                                </div>
                                <input
                                    type="text"
                                    value={formData.socialLinks?.telegram || ''}
                                    onChange={e => handleSocialLinkChange('telegram', e.target.value)}
                                    placeholder="@username hoặc số điện thoại"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="form-field">
                        <label htmlFor="memberNotes">
                            <FileText size={14} />
                            <span>Ghi chú</span>
                        </label>
                        <div className="input-wrapper">
                            <textarea
                                id="memberNotes"
                                value={formData.notes}
                                onChange={e => handleChange('notes', e.target.value)}
                                placeholder="Thêm ghi chú về thành viên này..."
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onCancel}>
                            <X size={16} />
                            <span>Hủy</span>
                        </button>
                        <button type="submit" className="btn-submit">
                            {member ? (
                                <>
                                    <Edit3 size={16} />
                                    <span>Cập nhật</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus size={16} />
                                    <span>Thêm thành viên</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
