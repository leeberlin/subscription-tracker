import React, { useState, useEffect } from 'react';
import {
    Subscription,
    SubscriptionFormData,
    SubscriptionCategory,
    CATEGORY_CONFIG,
    CURRENCY_OPTIONS,
    PRESET_COLORS
} from '../types/subscription';
import { ServiceIcons, PopularServices } from '../data/serviceIcons';
import { getTodayString, getDefaultExpirationDate } from '../utils/dateUtils';
import { X, Search } from 'lucide-react';
import './SubscriptionForm.css';

interface SubscriptionFormProps {
    subscription?: Subscription | null;
    onSubmit: (data: SubscriptionFormData) => void;
    onCancel: () => void;
}

const initialFormData: SubscriptionFormData = {
    appName: '',
    category: 'other',
    purchaseDate: getTodayString(),
    expirationDate: getDefaultExpirationDate(12),
    price: 0,
    currency: 'VND',
    notes: '',
    autoRenew: false,
    notificationDays: 7,
    color: PRESET_COLORS[0],
    isShared: false,
    maxMembers: undefined,
};

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
    subscription,
    onSubmit,
    onCancel,
}) => {
    const [formData, setFormData] = useState<SubscriptionFormData>(initialFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof SubscriptionFormData, string>>>({});
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [iconSearch, setIconSearch] = useState('');

    useEffect(() => {
        if (subscription) {
            setFormData({
                appName: subscription.appName,
                category: subscription.category,
                purchaseDate: subscription.purchaseDate,
                expirationDate: subscription.expirationDate,
                price: subscription.price,
                currency: subscription.currency,
                notes: subscription.notes || '',
                autoRenew: subscription.autoRenew,
                notificationDays: subscription.notificationDays,
                color: subscription.color,
                isShared: subscription.isShared,
                maxMembers: subscription.maxMembers,
            });
        } else {
            setFormData({
                ...initialFormData,
                purchaseDate: getTodayString(),
                expirationDate: getDefaultExpirationDate(12),
            });
        }
    }, [subscription]);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof SubscriptionFormData, string>> = {};

        if (!formData.appName.trim()) {
            newErrors.appName = 'Please enter app name';
        }
        if (!formData.purchaseDate) {
            newErrors.purchaseDate = 'Please select purchase date';
        }
        if (!formData.expirationDate) {
            newErrors.expirationDate = 'Please select expiration date';
        }
        if (formData.purchaseDate && formData.expirationDate && formData.purchaseDate > formData.expirationDate) {
            newErrors.expirationDate = 'Expiration date must be after purchase date';
        }
        if (formData.price < 0) {
            newErrors.price = 'Price cannot be negative';
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

    const handleChange = (field: keyof SubscriptionFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleQuickDuration = (months: number) => {
        const purchaseDate = new Date(formData.purchaseDate || getTodayString());
        const expirationDate = new Date(purchaseDate);
        expirationDate.setMonth(expirationDate.getMonth() + months);
        handleChange('expirationDate', expirationDate.toISOString().split('T')[0]);
    };

    const handleSelectService = (serviceName: string, serviceKey: string) => {
        handleChange('appName', serviceName);
        const service = ServiceIcons[serviceKey];
        if (service) {
            handleChange('color', service.color);
        }
        setShowIconPicker(false);
        setIconSearch('');
    };

    // Filter services based on search
    const filteredServices = Object.entries(ServiceIcons).filter(([key]) => {
        if (key === 'other') return false;
        if (!iconSearch) return true;
        return key.toLowerCase().includes(iconSearch.toLowerCase());
    });

    return (
        <div className="form-overlay" onClick={onCancel}>
            <div className="form-modal" onClick={e => e.stopPropagation()}>
                <div className="form-header">
                    <h2>{subscription ? 'Edit Subscription' : 'Add New Subscription'}</h2>
                    <button className="close-btn" onClick={onCancel}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="form-content">
                    {/* Popular Services Quick Select */}
                    <div className="form-group">
                        <label>Quick Select Popular Services</label>
                        <div className="popular-services">
                            {PopularServices.slice(0, 6).map(service => {
                                const icon = ServiceIcons[service.key];
                                return (
                                    <button
                                        key={service.key}
                                        type="button"
                                        className={`service-btn ${formData.appName === service.name ? 'selected' : ''}`}
                                        onClick={() => handleSelectService(service.name, service.key)}
                                    >
                                        <span
                                            className="service-icon"
                                            style={{ background: icon.gradient }}
                                        >
                                            {icon.icon}
                                        </span>
                                        <span className="service-name">{service.name.split(' ')[0]}</span>
                                    </button>
                                );
                            })}
                            <button
                                type="button"
                                className="service-btn more"
                                onClick={() => setShowIconPicker(true)}
                            >
                                <span className="service-icon">+</span>
                                <span className="service-name">More</span>
                            </button>
                        </div>
                    </div>

                    {/* App Name Input */}
                    <div className="form-group">
                        <label htmlFor="appName">App Name *</label>
                        <input
                            id="appName"
                            type="text"
                            value={formData.appName}
                            onChange={e => handleChange('appName', e.target.value)}
                            placeholder="e.g. Netflix, Spotify, ChatGPT..."
                            className={errors.appName ? 'error' : ''}
                        />
                        {errors.appName && <span className="error-message">{errors.appName}</span>}
                    </div>

                    {/* Category Selection */}
                    <div className="form-group">
                        <label>Category</label>
                        <div className="category-grid">
                            {(Object.entries(CATEGORY_CONFIG) as [SubscriptionCategory, typeof CATEGORY_CONFIG[SubscriptionCategory]][]).map(
                                ([key, config]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        className={`category-option ${formData.category === key ? 'selected' : ''}`}
                                        onClick={() => handleChange('category', key)}
                                    >
                                        <span className="category-emoji">{config.emoji}</span>
                                        <span className="category-name">{config.label}</span>
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="purchaseDate">Start Date *</label>
                            <input
                                id="purchaseDate"
                                type="date"
                                value={formData.purchaseDate}
                                onChange={e => handleChange('purchaseDate', e.target.value)}
                                className={errors.purchaseDate ? 'error' : ''}
                            />
                            {errors.purchaseDate && <span className="error-message">{errors.purchaseDate}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="expirationDate">Expiration Date *</label>
                            <input
                                id="expirationDate"
                                type="date"
                                value={formData.expirationDate}
                                onChange={e => handleChange('expirationDate', e.target.value)}
                                className={errors.expirationDate ? 'error' : ''}
                            />
                            {errors.expirationDate && <span className="error-message">{errors.expirationDate}</span>}
                        </div>
                    </div>

                    {/* Quick Duration */}
                    <div className="form-group">
                        <label>Quick Duration</label>
                        <div className="quick-duration-buttons">
                            {[1, 3, 6, 12].map(months => (
                                <button
                                    key={months}
                                    type="button"
                                    className="quick-duration-btn"
                                    onClick={() => handleQuickDuration(months)}
                                >
                                    {months} month{months > 1 ? 's' : ''}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price */}
                    <div className="form-row">
                        <div className="form-group flex-2">
                            <label htmlFor="price">Price</label>
                            <input
                                id="price"
                                type="number"
                                value={formData.price || ''}
                                onChange={e => {
                                    const val = e.target.value;
                                    handleChange('price', val === '' ? 0 : parseFloat(val));
                                }}
                                min="0"
                                step="any"
                                placeholder="0"
                                className={errors.price ? 'error' : ''}
                            />
                            {errors.price && <span className="error-message">{errors.price}</span>}
                        </div>

                        <div className="form-group flex-1">
                            <label htmlFor="currency">Currency</label>
                            <select
                                id="currency"
                                value={formData.currency}
                                onChange={e => handleChange('currency', e.target.value)}
                            >
                                {CURRENCY_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label htmlFor="notes">Notes</label>
                        <textarea
                            id="notes"
                            value={formData.notes}
                            onChange={e => handleChange('notes', e.target.value)}
                            placeholder="Additional information..."
                            rows={2}
                        />
                    </div>

                    {/* Auto Renew */}
                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.autoRenew}
                                onChange={e => handleChange('autoRenew', e.target.checked)}
                            />
                            <span className="checkmark"></span>
                            <span>Auto-renewal enabled</span>
                        </label>
                    </div>

                    {/* Shared Subscription */}
                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.isShared}
                                onChange={e => handleChange('isShared', e.target.checked)}
                            />
                            <span className="checkmark"></span>
                            <span>Shared subscription (Family plan)</span>
                        </label>
                    </div>

                    {formData.isShared && (
                        <div className="form-group">
                            <label htmlFor="maxMembers">Max Members</label>
                            <input
                                id="maxMembers"
                                type="number"
                                value={formData.maxMembers || ''}
                                onChange={e => handleChange('maxMembers', e.target.value ? parseInt(e.target.value) : undefined)}
                                min="1"
                                placeholder="Unlimited"
                            />
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit">
                            {subscription ? 'Update' : 'Add Subscription'}
                        </button>
                    </div>
                </form>

                {/* Icon Picker Modal */}
                {showIconPicker && (
                    <div className="icon-picker-overlay" onClick={() => setShowIconPicker(false)}>
                        <div className="icon-picker" onClick={e => e.stopPropagation()}>
                            <div className="icon-picker-header">
                                <h3>Select Service</h3>
                                <button onClick={() => setShowIconPicker(false)}>
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="icon-picker-search">
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Search services..."
                                    value={iconSearch}
                                    onChange={e => setIconSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="icon-picker-grid">
                                {filteredServices.map(([key, service]) => (
                                    <button
                                        key={key}
                                        className="icon-picker-item"
                                        onClick={() => handleSelectService(key.charAt(0).toUpperCase() + key.slice(1), key)}
                                    >
                                        <span
                                            className="icon-preview"
                                            style={{ background: service.gradient }}
                                        >
                                            {service.icon}
                                        </span>
                                        <span className="icon-name">{key}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
