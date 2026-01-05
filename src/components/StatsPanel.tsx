import React from 'react';
import { Subscription, Member, CATEGORY_CONFIG, SubscriptionCategory } from '../types/subscription';
import { formatCurrency, getDaysUntilExpiration, formatShortDate } from '../utils/dateUtils';
import './StatsPanel.css';

interface StatsPanelProps {
    subscriptions: Subscription[];
    activeCount: number;
    expiringCount: number;
    expiredCount: number;
    monthlySpend: number;
    membersNeedingPayment: { subscription: Subscription; member: Member }[];
    onSendReminder: (subscription: Subscription, member: Member) => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
    subscriptions,
    activeCount,
    expiringCount,
    expiredCount,
    monthlySpend,
    membersNeedingPayment,
    onSendReminder,
}) => {
    const totalSpend = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
    const totalMembers = subscriptions.reduce((sum, sub) => sum + sub.members.length, 0);
    const totalMemberRevenue = subscriptions.reduce((sum, sub) =>
        sum + sub.members.reduce((mSum, m) => mSum + m.amountPaid, 0), 0
    );

    const categoryStats = Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
        const count = subscriptions.filter(sub => sub.category === key).length;
        const spend = subscriptions
            .filter(sub => sub.category === key)
            .reduce((sum, sub) => sum + sub.price, 0);
        return { key: key as SubscriptionCategory, ...config, count, spend };
    }).filter(cat => cat.count > 0);

    return (
        <div className="stats-panel">
            <div className="stats-grid">
                <div className="stat-card primary">
                    <div className="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <line x1="3" y1="9" x2="21" y2="9" />
                            <line x1="9" y1="21" x2="9" y2="9" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{subscriptions.length}</span>
                        <span className="stat-label">Tổng số</span>
                    </div>
                </div>

                <div className="stat-card success">
                    <div className="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{activeCount}</span>
                        <span className="stat-label">Đang hoạt động</span>
                    </div>
                </div>

                <div className="stat-card warning">
                    <div className="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{expiringCount}</span>
                        <span className="stat-label">Sắp hết hạn</span>
                    </div>
                </div>

                <div className="stat-card error">
                    <div className="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{expiredCount}</span>
                        <span className="stat-label">Đã hết hạn</span>
                    </div>
                </div>
            </div>

            <div className="financial-stats">
                <div className="financial-card">
                    <div className="financial-header">
                        <span className="financial-label">Tổng đầu tư</span>
                        <span className="financial-value">{formatCurrency(totalSpend, 'VND')}</span>
                    </div>
                    <div className="financial-bar">
                        <div className="financial-bar-fill" style={{ width: '100%' }} />
                    </div>
                </div>

                <div className="financial-card">
                    <div className="financial-header">
                        <span className="financial-label">Ước tính/tháng</span>
                        <span className="financial-value secondary">{formatCurrency(monthlySpend, 'VND')}</span>
                    </div>
                    <p className="financial-note">Dựa trên thời hạn của các subscription</p>
                </div>

                {totalMembers > 0 && (
                    <div className="financial-card members">
                        <div className="financial-header">
                            <span className="financial-label">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                Tổng thành viên
                            </span>
                            <span className="financial-value members-count">{totalMembers}</span>
                        </div>
                        <div className="member-revenue">
                            <span>Thu từ thành viên:</span>
                            <span className="revenue-amount">{formatCurrency(totalMemberRevenue, 'VND')}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Members needing payment alert */}
            {membersNeedingPayment.length > 0 && (
                <div className="payment-alerts">
                    <div className="alerts-header">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" />
                        </svg>
                        <h3>Thành viên cần thanh toán ({membersNeedingPayment.length})</h3>
                    </div>
                    <div className="alerts-list">
                        {membersNeedingPayment.slice(0, 5).map(({ subscription, member }) => {
                            const daysUntil = getDaysUntilExpiration(member.nextPaymentDate);
                            const isOverdue = daysUntil < 0;

                            return (
                                <div key={`${subscription.id}-${member.id}`} className={`alert-item ${isOverdue ? 'overdue' : ''}`}>
                                    <div className="alert-info">
                                        <span className="alert-name">{member.name}</span>
                                        <span className="alert-app">{subscription.appName}</span>
                                    </div>
                                    <div className="alert-date">
                                        <span className={isOverdue ? 'overdue' : ''}>
                                            {isOverdue ? `Quá hạn ${Math.abs(daysUntil)} ngày` : `Còn ${daysUntil} ngày`}
                                        </span>
                                        <span className="date-text">{formatShortDate(member.nextPaymentDate)}</span>
                                    </div>
                                    <button
                                        className="alert-notify-btn"
                                        onClick={() => onSendReminder(subscription, member)}
                                        title="Gửi email nhắc nhở"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    {membersNeedingPayment.length > 5 && (
                        <div className="alerts-more">
                            +{membersNeedingPayment.length - 5} thành viên khác
                        </div>
                    )}
                </div>
            )}

            {categoryStats.length > 0 && (
                <div className="category-breakdown">
                    <h3 className="breakdown-title">Phân loại theo danh mục</h3>
                    <div className="category-list">
                        {categoryStats.map(cat => (
                            <div key={cat.key} className="category-item">
                                <div className="category-info">
                                    <span className="category-emoji">{cat.emoji}</span>
                                    <span className="category-name">{cat.label}</span>
                                </div>
                                <div className="category-stats">
                                    <span className="category-count">{cat.count} ứng dụng</span>
                                    <span className="category-spend">{formatCurrency(cat.spend, 'VND')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
