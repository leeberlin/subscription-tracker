import React, { useState } from 'react';
import { Subscription, FamilyGroup, Member, MemberFormData, FamilyGroupFormData } from '../types/subscription';
import { formatDate, formatCurrency, getDaysUntilExpiration, getExpirationStatus } from '../utils/dateUtils';
import { getServiceIcon } from '../data/serviceIcons';
import { ConfirmDialog } from './ConfirmDialog';
import { MemberForm } from './MemberForm';
import { FamilyGroupForm } from './FamilyGroupForm';
import {
    Trash2, Edit3, Users, ChevronDown, ChevronUp, UserPlus,
    AlertCircle, Home, Plus, Calendar, DollarSign
} from 'lucide-react';
import './SubscriptionRow.css';

interface SubscriptionRowProps {
    subscription: Subscription;
    onEdit: (subscription: Subscription) => void;
    onDelete: (id: string) => void;
    onAddFamilyGroup: (subscriptionId: string, data: FamilyGroupFormData) => void;
    onEditFamilyGroup: (subscriptionId: string, groupId: string, data: Partial<FamilyGroupFormData>) => void;
    onDeleteFamilyGroup: (subscriptionId: string, groupId: string) => void;
    onAddMember: (subscriptionId: string, groupId: string, data: MemberFormData) => void;
    onEditMember: (subscriptionId: string, groupId: string, memberId: string, data: Partial<MemberFormData>) => void;
    onDeleteMember: (subscriptionId: string, groupId: string, memberId: string) => void;
}

export const SubscriptionRow: React.FC<SubscriptionRowProps> = ({
    subscription,
    onEdit,
    onDelete,
    onAddFamilyGroup,
    onEditFamilyGroup,
    onDeleteFamilyGroup,
    onAddMember,
    onEditMember,
    onDeleteMember,
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [showFamilyForm, setShowFamilyForm] = useState(false);
    const [editingFamily, setEditingFamily] = useState<FamilyGroup | null>(null);
    const [showMemberForm, setShowMemberForm] = useState<string | null>(null);
    const [editingMember, setEditingMember] = useState<{ groupId: string; member: Member } | null>(null);

    const status = getExpirationStatus(subscription.expirationDate);
    const serviceIcon = getServiceIcon(subscription.appName);

    // Count totals
    const totalFamilies = subscription.familyGroups?.length || 0;
    const totalMembers = (subscription.familyGroups || []).reduce(
        (sum, g) => sum + g.members.length, 0
    ) + (subscription.members?.length || 0);

    // Count members needing payment
    const membersNeedingPayment = (subscription.familyGroups || []).flatMap(g =>
        g.members.filter(m => {
            const days = getDaysUntilExpiration(m.nextPaymentDate);
            return days <= 7 && days >= 0;
        })
    ).length;

    const getStatusClass = () => {
        if (status === 'expired') return 'expired';
        if (status === 'expiring-soon') return 'expiring';
        return 'active';
    };

    const getStatusLabel = () => {
        if (status === 'expired') return 'Expired';
        if (status === 'expiring-soon') return 'Expiring Soon';
        return 'Active';
    };

    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(groupId)) {
                next.delete(groupId);
            } else {
                next.add(groupId);
            }
            return next;
        });
    };

    const handleAddFamily = (data: FamilyGroupFormData) => {
        onAddFamilyGroup(subscription.id, data);
        setShowFamilyForm(false);
    };

    const handleEditFamily = (data: FamilyGroupFormData) => {
        if (editingFamily) {
            onEditFamilyGroup(subscription.id, editingFamily.id, data);
            setEditingFamily(null);
        }
    };

    const handleAddMember = (groupId: string, data: MemberFormData) => {
        onAddMember(subscription.id, groupId, data);
        setShowMemberForm(null);
    };

    const handleEditMember = (data: MemberFormData) => {
        if (editingMember) {
            onEditMember(subscription.id, editingMember.groupId, editingMember.member.id, data);
            setEditingMember(null);
        }
    };

    return (
        <>
            <div className={`sub-row ${getStatusClass()}`}>
                {/* Main Row Content */}
                <div className="row-content">
                    {/* Service info */}
                    <div className="row-service">
                        <div
                            className="service-icon"
                            style={{ background: serviceIcon.gradient }}
                        >
                            <span>{serviceIcon.icon}</span>
                        </div>
                        <div className="service-details">
                            <h3 className="service-name">{subscription.appName}</h3>
                            <span className="service-price">
                                {formatCurrency(subscription.price, subscription.currency)}/tháng
                            </span>
                        </div>
                    </div>

                    {/* Expiry date */}
                    <div className="row-expiry">
                        <span className="expiry-label">Expiry date</span>
                        <span className="expiry-value">{formatDate(subscription.expirationDate)}</span>
                    </div>

                    {/* Families & Members */}
                    <div className="row-stats">
                        {subscription.isShared && totalFamilies > 0 && (
                            <button
                                className="stats-btn families"
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                <Home size={14} />
                                <span>{totalFamilies} Families</span>
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                        )}
                        <button
                            className="stats-btn members"
                            onClick={() => subscription.isShared && setIsExpanded(!isExpanded)}
                            disabled={!subscription.isShared}
                        >
                            <Users size={14} />
                            <span>{totalMembers} Members</span>
                            {membersNeedingPayment > 0 && (
                                <span className="payment-alert" title={`${membersNeedingPayment} need payment`}>
                                    <AlertCircle size={12} />
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Status */}
                    <div className="row-status">
                        <span className={`status-badge ${getStatusClass()}`}>
                            {getStatusLabel()}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="row-actions">
                        <button className="action-btn edit" onClick={() => onEdit(subscription)} title="Edit">
                            <Edit3 size={16} />
                        </button>
                        <button className="action-btn delete" onClick={() => setShowDeleteConfirm(true)} title="Delete">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                {/* Expanded: Family Groups Section */}
                {isExpanded && subscription.isShared && (
                    <div className="families-section">
                        <div className="families-header">
                            <h4>
                                <Home size={16} />
                                <span>Family Groups ({totalFamilies})</span>
                            </h4>
                            <button className="add-family-btn" onClick={() => setShowFamilyForm(true)}>
                                <Plus size={14} />
                                <span>Add Family</span>
                            </button>
                        </div>

                        {(subscription.familyGroups || []).length === 0 ? (
                            <div className="empty-families">
                                <p>No family groups yet. Add a family to start tracking members.</p>
                            </div>
                        ) : (
                            <div className="families-list">
                                {(subscription.familyGroups || []).map(group => {
                                    const groupStatus = getExpirationStatus(group.expirationDate);
                                    const groupDays = getDaysUntilExpiration(group.expirationDate);
                                    const isGroupExpanded = expandedGroups.has(group.id);
                                    const membersWarning = group.members.filter(m =>
                                        getDaysUntilExpiration(m.nextPaymentDate) <= 7
                                    ).length;

                                    return (
                                        <div key={group.id} className={`family-card ${groupStatus}`}>
                                            <div className="family-header" onClick={() => toggleGroup(group.id)}>
                                                <div className="family-info">
                                                    <span className="family-icon">🏠</span>
                                                    <div>
                                                        <h5 className="family-name">{group.name}</h5>
                                                        <div className="family-meta">
                                                            <span className="meta-item">
                                                                <Calendar size={12} />
                                                                Expires: {formatDate(group.expirationDate)}
                                                            </span>
                                                            <span className={`meta-item days ${groupStatus}`}>
                                                                {groupDays < 0 ? 'Expired' : `${groupDays}d left`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="family-stats">
                                                    <span className="member-count">
                                                        <Users size={14} />
                                                        {group.members.length}
                                                    </span>
                                                    {membersWarning > 0 && (
                                                        <span className="warning-badge">
                                                            {membersWarning} ⚠️
                                                        </span>
                                                    )}
                                                    <div className="family-actions">
                                                        <button
                                                            className="action-btn-sm"
                                                            onClick={(e) => { e.stopPropagation(); setEditingFamily(group); }}
                                                        >
                                                            <Edit3 size={12} />
                                                        </button>
                                                        <button
                                                            className="action-btn-sm delete"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteFamilyGroup(subscription.id, group.id);
                                                            }}
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                    {isGroupExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </div>
                                            </div>

                                            {/* Expanded Members */}
                                            {isGroupExpanded && (
                                                <div className="family-members">
                                                    <div className="members-toolbar">
                                                        <span className="members-count">{group.members.length} members</span>
                                                        <button
                                                            className="add-member-btn-sm"
                                                            onClick={() => setShowMemberForm(group.id)}
                                                        >
                                                            <UserPlus size={12} />
                                                            Add
                                                        </button>
                                                    </div>

                                                    {group.members.length === 0 ? (
                                                        <p className="no-members">No members in this family yet.</p>
                                                    ) : (
                                                        <div className="members-grid">
                                                            {group.members.map(member => {
                                                                const memberDays = getDaysUntilExpiration(member.nextPaymentDate);
                                                                const needsPayment = memberDays <= 7 && memberDays >= 0;
                                                                const isOverdue = memberDays < 0;

                                                                return (
                                                                    <div
                                                                        key={member.id}
                                                                        className={`member-card clickable ${needsPayment ? 'warning' : ''} ${isOverdue ? 'overdue' : ''}`}
                                                                        onClick={() => setEditingMember({ groupId: group.id, member })}
                                                                    >
                                                                        <div className="member-info">
                                                                            <span className="member-name">{member.name}</span>
                                                                            <span className="member-email">{member.email}</span>
                                                                        </div>
                                                                        <div className="member-payment-info">
                                                                            <div className="payment-date">
                                                                                <Calendar size={12} />
                                                                                <span>{formatDate(member.nextPaymentDate)}</span>
                                                                            </div>
                                                                            <div className="payment-amount">
                                                                                <DollarSign size={12} />
                                                                                <span>{formatCurrency(member.amountPaid, subscription.currency)}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="member-status-row">
                                                                            <span className={`member-status ${member.status}`}>
                                                                                {member.status}
                                                                            </span>
                                                                            {(needsPayment || isOverdue) && (
                                                                                <span className="days-badge">
                                                                                    {isOverdue ? `${Math.abs(memberDays)}d overdue` : `${memberDays}d left`}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="member-actions">
                                                                            <button
                                                                                className="action-btn-sm delete"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    onDeleteMember(subscription.id, group.id, member.id);
                                                                                }}
                                                                                title="Delete member"
                                                                            >
                                                                                <Trash2 size={12} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Subscription Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Subscription"
                message={`Are you sure you want to delete "${subscription.appName}"? This will remove all ${totalFamilies} families and ${totalMembers} members.`}
                confirmText="Delete"
                cancelText="Cancel"
                confirmType="danger"
                onConfirm={() => { onDelete(subscription.id); setShowDeleteConfirm(false); }}
                onCancel={() => setShowDeleteConfirm(false)}
            />

            {/* Add Family Form */}
            {showFamilyForm && (
                <FamilyGroupForm
                    onSubmit={handleAddFamily}
                    onCancel={() => setShowFamilyForm(false)}
                />
            )}

            {/* Edit Family Form */}
            {editingFamily && (
                <FamilyGroupForm
                    familyGroup={editingFamily}
                    onSubmit={handleEditFamily}
                    onCancel={() => setEditingFamily(null)}
                />
            )}

            {/* Add Member Form */}
            {showMemberForm && (
                <MemberForm
                    subscriptionName={subscription.appName}
                    currency={subscription.currency}
                    onSubmit={(data) => handleAddMember(showMemberForm, data)}
                    onCancel={() => setShowMemberForm(null)}
                />
            )}

            {/* Edit Member Form */}
            {editingMember && (
                <MemberForm
                    member={editingMember.member}
                    subscriptionName={subscription.appName}
                    currency={subscription.currency}
                    onSubmit={handleEditMember}
                    onCancel={() => setEditingMember(null)}
                />
            )}
        </>
    );
};
