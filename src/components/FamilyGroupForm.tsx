import React, { useState, useEffect } from 'react';
import { FamilyGroup, FamilyGroupFormData } from '../types/subscription';
import { getTodayString, getDefaultExpirationDate } from '../utils/dateUtils';
import { X, Home, Calendar } from 'lucide-react';
import './FamilyGroupForm.css';

interface FamilyGroupFormProps {
    familyGroup?: FamilyGroup | null;
    onSubmit: (data: FamilyGroupFormData) => void;
    onCancel: () => void;
}

const initialFormData: FamilyGroupFormData = {
    name: '',
    purchaseDate: getTodayString(),
    expirationDate: getDefaultExpirationDate(12),
    notes: '',
};

export const FamilyGroupForm: React.FC<FamilyGroupFormProps> = ({
    familyGroup,
    onSubmit,
    onCancel,
}) => {
    const [formData, setFormData] = useState<FamilyGroupFormData>(initialFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof FamilyGroupFormData, string>>>({});

    useEffect(() => {
        if (familyGroup) {
            setFormData({
                name: familyGroup.name,
                purchaseDate: familyGroup.purchaseDate,
                expirationDate: familyGroup.expirationDate,
                notes: familyGroup.notes || '',
            });
        } else {
            setFormData(initialFormData);
        }
    }, [familyGroup]);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof FamilyGroupFormData, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Please enter family name';
        }
        if (!formData.purchaseDate) {
            newErrors.purchaseDate = 'Please select purchase date';
        }
        if (!formData.expirationDate) {
            newErrors.expirationDate = 'Please select expiration date';
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

    const handleChange = (field: keyof FamilyGroupFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleQuickDuration = (months: number) => {
        const date = new Date();
        date.setMonth(date.getMonth() + months);
        handleChange('expirationDate', date.toISOString().split('T')[0]);
    };

    return (
        <div className="family-form-overlay" onClick={onCancel}>
            <div className="family-form-modal" onClick={e => e.stopPropagation()}>
                <div className="family-form-header">
                    <div className="family-form-title">
                        <div className="family-icon-box">
                            <Home size={20} />
                        </div>
                        <h2>{familyGroup ? 'Edit Family' : 'Add New Family'}</h2>
                    </div>
                    <button className="close-btn" onClick={onCancel}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="family-form-content">
                    <div className="form-group">
                        <label htmlFor="familyName">Family Name *</label>
                        <input
                            id="familyName"
                            type="text"
                            value={formData.name}
                            onChange={e => handleChange('name', e.target.value)}
                            placeholder="e.g., Nhà Nguyễn, Family 1, etc."
                            className={errors.name ? 'error' : ''}
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="purchaseDate">Purchase Date *</label>
                            <div className="input-with-icon">
                                <Calendar size={16} />
                                <input
                                    id="purchaseDate"
                                    type="date"
                                    value={formData.purchaseDate}
                                    onChange={e => handleChange('purchaseDate', e.target.value)}
                                    className={errors.purchaseDate ? 'error' : ''}
                                />
                            </div>
                            {errors.purchaseDate && <span className="error-message">{errors.purchaseDate}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="expirationDate">Expiration Date *</label>
                            <div className="input-with-icon">
                                <Calendar size={16} />
                                <input
                                    id="expirationDate"
                                    type="date"
                                    value={formData.expirationDate}
                                    onChange={e => handleChange('expirationDate', e.target.value)}
                                    className={errors.expirationDate ? 'error' : ''}
                                />
                            </div>
                            {errors.expirationDate && <span className="error-message">{errors.expirationDate}</span>}
                        </div>
                    </div>

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

                    <div className="form-group">
                        <label htmlFor="familyNotes">Notes</label>
                        <textarea
                            id="familyNotes"
                            value={formData.notes}
                            onChange={e => handleChange('notes', e.target.value)}
                            placeholder="Additional notes about this family..."
                            rows={2}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit">
                            {familyGroup ? 'Update' : 'Add Family'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
