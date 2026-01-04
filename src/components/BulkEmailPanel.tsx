import React, { useState } from 'react';
import { Subscription, Member, MEMBER_STATUS_CONFIG } from '../types/subscription';
import { formatCurrency, getDaysUntilExpiration } from '../utils/dateUtils';
import { generatePaymentReminderEmail, copyEmailToClipboard } from '../utils/emailUtils';
import './BulkEmailPanel.css';

interface BulkEmailPanelProps {
    isOpen: boolean;
    onClose: () => void;
    membersNeedingPayment: { subscription: Subscription; member: Member }[];
    onSendReminder: (subscription: Subscription, member: Member) => void;
}

export const BulkEmailPanel: React.FC<BulkEmailPanelProps> = ({
    isOpen,
    onClose,
    membersNeedingPayment,
    onSendReminder,
}) => {
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
    const [sendingStatus, setSendingStatus] = useState<Record<string, 'pending' | 'sent' | 'error'>>({});
    const [copiedEmails, setCopiedEmails] = useState<string[]>([]);

    const getMemberKey = (subscriptionId: string, memberId: string) => `${subscriptionId}-${memberId}`;

    const toggleMember = (subscriptionId: string, memberId: string) => {
        const key = getMemberKey(subscriptionId, memberId);
        setSelectedMembers(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    const toggleAll = () => {
        if (selectedMembers.size === membersNeedingPayment.length) {
            setSelectedMembers(new Set());
        } else {
            const allKeys = membersNeedingPayment.map(({ subscription, member }) =>
                getMemberKey(subscription.id, member.id)
            );
            setSelectedMembers(new Set(allKeys));
        }
    };

    const handleSendSelected = async () => {
        for (const { subscription, member } of membersNeedingPayment) {
            const key = getMemberKey(subscription.id, member.id);
            if (selectedMembers.has(key)) {
                setSendingStatus(prev => ({ ...prev, [key]: 'pending' }));
                try {
                    onSendReminder(subscription, member);
                    setSendingStatus(prev => ({ ...prev, [key]: 'sent' }));
                } catch {
                    setSendingStatus(prev => ({ ...prev, [key]: 'error' }));
                }
                // Small delay between emails
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
    };

    const handleCopyEmail = async (subscription: Subscription, member: Member) => {
        const emailConfig = generatePaymentReminderEmail(subscription, member);
        const success = await copyEmailToClipboard(emailConfig);
        if (success) {
            const key = getMemberKey(subscription.id, member.id);
            setCopiedEmails(prev => [...prev, key]);
            setTimeout(() => {
                setCopiedEmails(prev => prev.filter(k => k !== key));
            }, 2000);
        }
    };

    const handleCopyAllEmails = async () => {
        const selectedItems = membersNeedingPayment.filter(({ subscription, member }) =>
            selectedMembers.has(getMemberKey(subscription.id, member.id))
        );

        const emailList = selectedItems.map(({ member }) => member.email).join(', ');
        try {
            await navigator.clipboard.writeText(emailList);
        } catch (err) {
            console.error('Failed to copy emails:', err);
        }
    };

    if (!isOpen) return null;

    const overdueCount = membersNeedingPayment.filter(({ member }) =>
        getDaysUntilExpiration(member.nextPaymentDate) < 0
    ).length;

    const pendingCount = membersNeedingPayment.length - overdueCount;

    return (
        <div className="bulk-email-overlay" onClick={onClose}>
            <div className="bulk-email-panel" onClick={e => e.stopPropagation()}>
                <div className="bulk-email-header">
                    <div className="header-info">
                        <h2>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                            Gửi email nhắc nhở hàng loạt
                        </h2>
                        <p className="header-subtitle">
                            {membersNeedingPayment.length} thành viên cần thanh toán
                            {overdueCount > 0 && <span className="overdue-count"> ({overdueCount} quá hạn)</span>}
                        </p>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="bulk-email-stats">
                    <div className="stat overdue">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                        <span>{overdueCount} quá hạn</span>
                    </div>
                    <div className="stat pending">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{pendingCount} sắp đến hạn</span>
                    </div>
                    <div className="stat selected">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <span>{selectedMembers.size} đã chọn</span>
                    </div>
                </div>

                <div className="bulk-email-actions">
                    <button className="select-all-btn" onClick={toggleAll}>
                        {selectedMembers.size === membersNeedingPayment.length ? (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                </svg>
                                Bỏ chọn tất cả
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9 11 12 14 22 4" />
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                </svg>
                                Chọn tất cả
                            </>
                        )}
                    </button>
                    <button
                        className="copy-emails-btn"
                        onClick={handleCopyAllEmails}
                        disabled={selectedMembers.size === 0}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copy danh sách email
                    </button>
                </div>

                <div className="members-list">
                    {membersNeedingPayment.map(({ subscription, member }) => {
                        const key = getMemberKey(subscription.id, member.id);
                        const daysUntil = getDaysUntilExpiration(member.nextPaymentDate);
                        const isOverdue = daysUntil < 0;
                        const isSelected = selectedMembers.has(key);
                        const status = sendingStatus[key];
                        const isCopied = copiedEmails.includes(key);

                        return (
                            <div
                                key={key}
                                className={`member-item ${isOverdue ? 'overdue' : ''} ${isSelected ? 'selected' : ''}`}
                            >
                                <label className="member-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleMember(subscription.id, member.id)}
                                    />
                                    <span className="checkbox-custom">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </span>
                                </label>

                                <div className="member-info">
                                    <div className="member-name">
                                        <span>{member.name}</span>
                                        <span className={`status-badge ${member.status}`}>
                                            {MEMBER_STATUS_CONFIG[member.status].label}
                                        </span>
                                    </div>
                                    <div className="member-meta">
                                        <span className="meta-item">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                <polyline points="22,6 12,13 2,6" />
                                            </svg>
                                            {member.email}
                                        </span>
                                        <span className="meta-item app">
                                            {subscription.appName}
                                        </span>
                                    </div>
                                </div>

                                <div className="member-payment">
                                    <span className="amount">{formatCurrency(member.amountPaid, subscription.currency)}</span>
                                    <span className={`due-date ${isOverdue ? 'overdue' : ''}`}>
                                        {isOverdue ? `Quá hạn ${Math.abs(daysUntil)} ngày` : `Còn ${daysUntil} ngày`}
                                    </span>
                                </div>

                                <div className="member-actions">
                                    <button
                                        className="action-btn copy"
                                        onClick={() => handleCopyEmail(subscription, member)}
                                        title="Copy nội dung email"
                                    >
                                        {isCopied ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        ) : (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                            </svg>
                                        )}
                                    </button>
                                    <button
                                        className={`action-btn send ${status || ''}`}
                                        onClick={() => onSendReminder(subscription, member)}
                                        title="Gửi email"
                                        disabled={status === 'pending'}
                                    >
                                        {status === 'sent' ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        ) : status === 'pending' ? (
                                            <div className="spinner" />
                                        ) : (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="22" y1="2" x2="11" y2="13" />
                                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="bulk-email-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        Đóng
                    </button>
                    <button
                        className="send-all-btn"
                        onClick={handleSendSelected}
                        disabled={selectedMembers.size === 0}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                        Gửi email ({selectedMembers.size})
                    </button>
                </div>
            </div>
        </div>
    );
};
