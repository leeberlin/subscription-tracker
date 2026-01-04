import React, { useState } from 'react';
import { Member, Subscription, MEMBER_STATUS_CONFIG } from '../types/subscription';
import { formatDate, formatCurrency, getDaysUntilExpiration, getExpirationLabel } from '../utils/dateUtils';
import './MemberList.css';

interface MemberListProps {
    subscription: Subscription;
    onEditMember: (member: Member) => void;
    onDeleteMember: (memberId: string) => void;
    onSendReminder: (member: Member) => void;
}

export const MemberList: React.FC<MemberListProps> = ({
    subscription,
    onEditMember,
    onDeleteMember,
    onSendReminder,
}) => {
    const [expandedMember, setExpandedMember] = useState<string | null>(null);

    const handleDelete = (member: Member) => {
        if (window.confirm(`Bạn có chắc muốn xóa thành viên "${member.name}"?`)) {
            onDeleteMember(member.id);
        }
    };

    const handleSendReminder = (member: Member, e: React.MouseEvent) => {
        e.stopPropagation();
        onSendReminder(member);
    };

    const toggleExpand = (memberId: string) => {
        setExpandedMember(prev => prev === memberId ? null : memberId);
    };

    if (subscription.members.length === 0) {
        return (
            <div className="members-empty">
                <span className="empty-icon">👥</span>
                <p>Chưa có thành viên nào</p>
            </div>
        );
    }

    const sortedMembers = [...subscription.members].sort((a, b) => {
        // Sort by status priority: overdue > pending > active > inactive
        const statusPriority = { overdue: 0, pending: 1, active: 2, inactive: 3 };
        return statusPriority[a.status] - statusPriority[b.status];
    });

    return (
        <div className="members-list">
            <div className="members-header">
                <h4>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Thành viên ({subscription.members.length}
                    {subscription.maxMembers ? `/${subscription.maxMembers}` : ''})
                </h4>
            </div>

            <div className="members-grid">
                {sortedMembers.map(member => {
                    const daysUntil = getDaysUntilExpiration(member.nextPaymentDate);
                    const statusConfig = MEMBER_STATUS_CONFIG[member.status];
                    const isExpanded = expandedMember === member.id;
                    const needsReminder = member.status === 'pending' || member.status === 'overdue';

                    return (
                        <div
                            key={member.id}
                            className={`member-card status-${member.status} ${isExpanded ? 'expanded' : ''}`}
                            onClick={() => toggleExpand(member.id)}
                        >
                            <div className="member-main">
                                <div className="member-avatar">
                                    {member.name.charAt(0).toUpperCase()}
                                </div>

                                <div className="member-info">
                                    <div className="member-name">{member.name}</div>
                                    <div className="member-email">{member.email}</div>
                                </div>

                                <div className="member-status-section">
                                    <span
                                        className="member-status-badge"
                                        style={{
                                            color: statusConfig.color,
                                            background: statusConfig.bgColor
                                        }}
                                    >
                                        {statusConfig.label}
                                    </span>

                                    {needsReminder && (
                                        <button
                                            className="notify-btn"
                                            onClick={(e) => handleSendReminder(member, e)}
                                            title="Gửi email nhắc nhở"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" />
                                            </svg>
                                            Nhắc
                                        </button>
                                    )}
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="member-details">
                                    <div className="detail-row">
                                        <div className="detail-item">
                                            <span className="detail-label">Ngày tham gia</span>
                                            <span className="detail-value">{formatDate(member.joinDate)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Đã đóng</span>
                                            <span className="detail-value amount">
                                                {formatCurrency(member.amountPaid, subscription.currency)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="detail-row">
                                        <div className="detail-item">
                                            <span className="detail-label">Ngày thanh toán tiếp</span>
                                            <span className="detail-value">{formatDate(member.nextPaymentDate)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Thời gian còn lại</span>
                                            <span className={`detail-value ${daysUntil <= 7 ? 'warning' : ''} ${daysUntil < 0 ? 'danger' : ''}`}>
                                                {getExpirationLabel(member.nextPaymentDate)}
                                            </span>
                                        </div>
                                    </div>

                                    {member.notes && (
                                        <div className="detail-notes">
                                            <span className="detail-label">Ghi chú</span>
                                            <p>{member.notes}</p>
                                        </div>
                                    )}

                                    <div className="member-actions">
                                        <button
                                            className="action-btn edit"
                                            onClick={(e) => { e.stopPropagation(); onEditMember(member); }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                            Sửa
                                        </button>
                                        <button
                                            className="action-btn delete"
                                            onClick={(e) => { e.stopPropagation(); handleDelete(member); }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                            Xóa
                                        </button>
                                        <button
                                            className="action-btn notify"
                                            onClick={(e) => handleSendReminder(member, e)}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                <polyline points="22,6 12,13 2,6" />
                                            </svg>
                                            Gửi email
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
