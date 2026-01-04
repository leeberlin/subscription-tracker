import React, { useState, useEffect } from 'react';
import { Member, MemberFormData } from '../types/subscription';
import { getTodayString, getDefaultExpirationDate } from '../utils/dateUtils';
import { X, Mail, User, Calendar, Wallet, FileText, Sparkles, UserPlus, Edit3, ChevronDown } from 'lucide-react';
import './MemberForm.css';

interface MemberFormProps {
    member?: Member | null;
    subscriptionName?: string;
    defaultAmount?: number;
    currency?: string;
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
    joinDate: getTodayString(),
    amountPaid: 0,
    nextPaymentDate: getDefaultExpirationDate(1),
    notes: '',
};

export const MemberForm: React.FC<MemberFormProps> = ({
    member,
    subscriptionName = 'Subscription',
    defaultAmount = 0,
    currency = 'VND',
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

    useEffect(() => {
        if (member) {
            setFormData({
                name: member.name,
                email: member.email,
                joinDate: member.joinDate,
                amountPaid: member.amountPaid,
                nextPaymentDate: member.nextPaymentDate,
                notes: member.notes || '',
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
