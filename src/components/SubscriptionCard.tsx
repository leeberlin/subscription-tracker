import React, { useState } from 'react';
import { Subscription, Member, MemberFormData, CATEGORY_CONFIG } from '../types/subscription';
import { formatDate, getExpirationStatus, formatCurrency, getDaysUntilExpiration } from '../utils/dateUtils';
import { getServiceIcon } from '../data/serviceIcons';
import { ConfirmDialog } from './ConfirmDialog';
import { Trash2, Edit3, Users, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import './SubscriptionCard.css';

interface SubscriptionCardProps {
    subscription: Subscription;
    onEdit: (subscription: Subscription) => void;
    onDelete: (id: string) => void;
    onAddMember?: (subscriptionId: string, data: MemberFormData) => void;
    onEditMember?: (subscriptionId: string, memberId: string, data: Partial<MemberFormData>) => void;
    onDeleteMember?: (subscriptionId: string, memberId: string) => void;
    onSendReminder?: (subscription: Subscription, member: Member) => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
    subscription,
    onEdit,
    onDelete,
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const status = getExpirationStatus(subscription.expirationDate);
    const daysLeft = getDaysUntilExpiration(subscription.expirationDate);
    const serviceIcon = getServiceIcon(subscription.appName);
    const categoryConfig = CATEGORY_CONFIG[subscription.category];

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        onDelete(subscription.id);
        setShowDeleteConfirm(false);
    };

    const getStatusBadge = () => {
        if (status === 'expired') {
            return <span className="status-badge expired">Expired</span>;
        }
        if (status === 'expiring-soon') {
            return <span className="status-badge expiring">{daysLeft}d left</span>;
        }
        return <span className="status-badge active">{daysLeft}d left</span>;
    };

    return (
        <>
            <div className={`sub-card ${status === 'expiring-soon' ? 'expiring' : status}`}>
                {/* Card Header */}
                <div className="sub-card-header">
                    <div
                        className="service-icon"
                        style={{ background: serviceIcon.gradient }}
                    >
                        <span>{serviceIcon.icon}</span>
                    </div>
                    <div className="service-info">
                        <h3 className="service-name">{subscription.appName}</h3>
                        <span className="service-category">
                            {categoryConfig.emoji} {categoryConfig.label}
                        </span>
                    </div>
                    <div className="card-actions">
                        <button
                            className="action-btn edit"
                            onClick={() => onEdit(subscription)}
                            title="Edit"
                        >
                            <Edit3 size={16} />
                        </button>
                        <button
                            className="action-btn delete"
                            onClick={handleDeleteClick}
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                {/* Card Body */}
                <div className="sub-card-body">
                    <div className="price-row">
                        <span className="price">
                            {formatCurrency(subscription.price, subscription.currency)}
                        </span>
                        {getStatusBadge()}
                    </div>

                    <div className="dates-row">
                        <div className="date-item">
                            <span className="date-label">Start</span>
                            <span className="date-value">{formatDate(subscription.purchaseDate)}</span>
                        </div>
                        <div className="date-separator">→</div>
                        <div className="date-item">
                            <span className="date-label">Expires</span>
                            <span className="date-value">{formatDate(subscription.expirationDate)}</span>
                        </div>
                    </div>

                    {/* Auto Renew Badge */}
                    {subscription.autoRenew && (
                        <div className="auto-renew-badge">
                            <RefreshCw size={12} />
                            <span>Auto-renewal enabled</span>
                        </div>
                    )}

                    {/* Members indicator */}
                    {subscription.isShared && subscription.members.length > 0 && (
                        <button
                            className="members-toggle"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            <Users size={14} />
                            <span>{subscription.members.length} members</span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    )}

                    {/* Expanded members list */}
                    {isExpanded && subscription.members.length > 0 && (
                        <div className="members-list">
                            {subscription.members.map(member => (
                                <div key={member.id} className="member-item">
                                    <span className="member-name">{member.name}</span>
                                    <span className="member-status" data-status={member.status}>
                                        {member.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Notes */}
                    {subscription.notes && (
                        <p className="notes">{subscription.notes}</p>
                    )}
                </div>

                {/* Status overlay for expired */}
                {status === 'expired' && (
                    <div className="expired-overlay" />
                )}
            </div>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Subscription"
                message={`Are you sure you want to delete "${subscription.appName}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                confirmType="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </>
    );
};
