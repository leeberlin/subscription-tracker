import React, { useMemo } from 'react';
import { Subscription, CATEGORY_CONFIG, SubscriptionCategory } from '../types/subscription';
import { formatCurrency, getDaysUntilExpiration } from '../utils/dateUtils';
import './DashboardCharts.css';

interface DashboardChartsProps {
    subscriptions: Subscription[];
    isVisible: boolean;
    onToggle: () => void;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
    subscriptions,
    isVisible,
    onToggle,
}) => {
    // Calculate category distribution
    const categoryData = useMemo(() => {
        const data: Record<SubscriptionCategory, { count: number; spend: number }> = {
            productivity: { count: 0, spend: 0 },
            development: { count: 0, spend: 0 },
            design: { count: 0, spend: 0 },
            entertainment: { count: 0, spend: 0 },
            cloud: { count: 0, spend: 0 },
            security: { count: 0, spend: 0 },
            other: { count: 0, spend: 0 },
        };

        subscriptions.forEach(sub => {
            data[sub.category].count++;
            data[sub.category].spend += sub.price;
        });

        return Object.entries(data)
            .filter(([, value]) => value.count > 0)
            .map(([key, value]) => ({
                category: key as SubscriptionCategory,
                ...value,
                config: CATEGORY_CONFIG[key as SubscriptionCategory],
            }))
            .sort((a, b) => b.spend - a.spend);
    }, [subscriptions]);

    // Calculate monthly spending over time
    const monthlySpending = useMemo(() => {
        const months: Record<string, number> = {};
        const now = new Date();

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = d.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' });
            months[key] = 0;
        }

        subscriptions.forEach(sub => {
            const purchaseDate = new Date(sub.purchaseDate);
            const expirationDate = new Date(sub.expirationDate);
            const durationMonths = Math.max(
                1,
                (expirationDate.getFullYear() - purchaseDate.getFullYear()) * 12 +
                (expirationDate.getMonth() - purchaseDate.getMonth())
            );
            const monthlyPrice = sub.price / durationMonths;

            // Add to each month the subscription is active
            Object.keys(months).forEach(monthKey => {
                // Simplified: assume active for all displayed months
                months[monthKey] += monthlyPrice;
            });
        });

        return Object.entries(months).map(([month, amount]) => ({ month, amount }));
    }, [subscriptions]);

    // Calculate member stats
    const memberStats = useMemo(() => {
        let total = 0;
        let active = 0;
        let pending = 0;
        let overdue = 0;
        let revenue = 0;

        subscriptions.forEach(sub => {
            sub.members.forEach(member => {
                total++;
                revenue += member.amountPaid;

                switch (member.status) {
                    case 'active':
                        active++;
                        break;
                    case 'pending':
                        pending++;
                        break;
                    case 'overdue':
                        overdue++;
                        break;
                }
            });
        });

        return { total, active, pending, overdue, revenue };
    }, [subscriptions]);

    // Calculate expiration timeline
    const expirationTimeline = useMemo(() => {
        const timeline = {
            expired: 0,
            thisWeek: 0,
            thisMonth: 0,
            next3Months: 0,
            later: 0,
        };

        subscriptions.forEach(sub => {
            const daysUntil = getDaysUntilExpiration(sub.expirationDate);

            if (daysUntil < 0) timeline.expired++;
            else if (daysUntil <= 7) timeline.thisWeek++;
            else if (daysUntil <= 30) timeline.thisMonth++;
            else if (daysUntil <= 90) timeline.next3Months++;
            else timeline.later++;
        });

        return timeline;
    }, [subscriptions]);

    // maxSpend could be used for bar width normalization if needed
    const maxMonthlySpend = Math.max(...monthlySpending.map(m => m.amount), 1);
    const totalSpend = subscriptions.reduce((sum, sub) => sum + sub.price, 0);

    return (
        <div className={`dashboard-charts ${isVisible ? 'visible' : ''}`}>
            <button className="toggle-charts-btn" onClick={onToggle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                <span>{isVisible ? 'Ẩn biểu đồ' : 'Xem biểu đồ chi tiết'}</span>
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ transform: isVisible ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {isVisible && (
                <div className="charts-container">
                    {/* Category Distribution */}
                    <div className="chart-card">
                        <div className="chart-header">
                            <h3>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                                    <path d="M22 12A10 10 0 0 0 12 2v10z" />
                                </svg>
                                Phân bổ theo danh mục
                            </h3>
                        </div>
                        <div className="chart-content">
                            <div className="donut-chart">
                                <svg viewBox="0 0 100 100" className="donut-svg">
                                    {categoryData.reduce((acc, cat, index) => {
                                        const percentage = (cat.spend / totalSpend) * 100;
                                        const offset = acc.offset;
                                        const strokeDasharray = `${percentage} ${100 - percentage}`;

                                        acc.elements.push(
                                            <circle
                                                key={cat.category}
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="none"
                                                stroke={cat.config.gradient.split('#')[1]?.split(' ')[0] ? `#${cat.config.gradient.split('#')[1].split(' ')[0]}` : `hsl(${index * 50}, 70%, 60%)`}
                                                strokeWidth="20"
                                                strokeDasharray={strokeDasharray}
                                                strokeDashoffset={-offset}
                                                transform="rotate(-90 50 50)"
                                            />
                                        );
                                        acc.offset += percentage;
                                        return acc;
                                    }, { elements: [] as React.ReactNode[], offset: 0 }).elements}
                                </svg>
                                <div className="donut-center">
                                    <span className="donut-total">{subscriptions.length}</span>
                                    <span className="donut-label">Apps</span>
                                </div>
                            </div>
                            <div className="category-legend">
                                {categoryData.map(cat => (
                                    <div key={cat.category} className="legend-item">
                                        <span className="legend-emoji">{cat.config.emoji}</span>
                                        <span className="legend-label">{cat.config.label}</span>
                                        <span className="legend-count">{cat.count}</span>
                                        <span className="legend-value">{formatCurrency(cat.spend, 'VND')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Monthly Spending */}
                    <div className="chart-card">
                        <div className="chart-header">
                            <h3>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="20" x2="18" y2="10" />
                                    <line x1="12" y1="20" x2="12" y2="4" />
                                    <line x1="6" y1="20" x2="6" y2="14" />
                                </svg>
                                Chi phí theo tháng
                            </h3>
                        </div>
                        <div className="chart-content">
                            <div className="bar-chart">
                                {monthlySpending.map((month, index) => (
                                    <div key={month.month} className="bar-item">
                                        <div className="bar-wrapper">
                                            <div
                                                className="bar-fill"
                                                style={{
                                                    height: `${(month.amount / maxMonthlySpend) * 100}%`,
                                                    animationDelay: `${index * 0.1}s`,
                                                }}
                                            />
                                        </div>
                                        <span className="bar-label">{month.month}</span>
                                        <span className="bar-value">{formatCurrency(month.amount, 'VND')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Expiration Timeline */}
                    <div className="chart-card">
                        <div className="chart-header">
                            <h3>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                                Lịch trình hết hạn
                            </h3>
                        </div>
                        <div className="chart-content">
                            <div className="timeline-chart">
                                <div className="timeline-item expired">
                                    <div className="timeline-bar" style={{ width: `${(expirationTimeline.expired / subscriptions.length) * 100}%` }} />
                                    <span className="timeline-label">Đã hết hạn</span>
                                    <span className="timeline-count">{expirationTimeline.expired}</span>
                                </div>
                                <div className="timeline-item this-week">
                                    <div className="timeline-bar" style={{ width: `${(expirationTimeline.thisWeek / subscriptions.length) * 100}%` }} />
                                    <span className="timeline-label">Tuần này</span>
                                    <span className="timeline-count">{expirationTimeline.thisWeek}</span>
                                </div>
                                <div className="timeline-item this-month">
                                    <div className="timeline-bar" style={{ width: `${(expirationTimeline.thisMonth / subscriptions.length) * 100}%` }} />
                                    <span className="timeline-label">Tháng này</span>
                                    <span className="timeline-count">{expirationTimeline.thisMonth}</span>
                                </div>
                                <div className="timeline-item next-3-months">
                                    <div className="timeline-bar" style={{ width: `${(expirationTimeline.next3Months / subscriptions.length) * 100}%` }} />
                                    <span className="timeline-label">3 tháng tới</span>
                                    <span className="timeline-count">{expirationTimeline.next3Months}</span>
                                </div>
                                <div className="timeline-item later">
                                    <div className="timeline-bar" style={{ width: `${(expirationTimeline.later / subscriptions.length) * 100}%` }} />
                                    <span className="timeline-label">Sau đó</span>
                                    <span className="timeline-count">{expirationTimeline.later}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Member Stats */}
                    {memberStats.total > 0 && (
                        <div className="chart-card member-stats">
                            <div className="chart-header">
                                <h3>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                    Thống kê thành viên
                                </h3>
                            </div>
                            <div className="chart-content">
                                <div className="member-stats-grid">
                                    <div className="member-stat-item total">
                                        <span className="stat-value">{memberStats.total}</span>
                                        <span className="stat-label">Tổng thành viên</span>
                                    </div>
                                    <div className="member-stat-item active">
                                        <span className="stat-value">{memberStats.active}</span>
                                        <span className="stat-label">Hoạt động</span>
                                    </div>
                                    <div className="member-stat-item pending">
                                        <span className="stat-value">{memberStats.pending}</span>
                                        <span className="stat-label">Chờ thanh toán</span>
                                    </div>
                                    <div className="member-stat-item overdue">
                                        <span className="stat-value">{memberStats.overdue}</span>
                                        <span className="stat-label">Quá hạn</span>
                                    </div>
                                </div>
                                <div className="member-revenue">
                                    <span className="revenue-label">Tổng thu từ thành viên</span>
                                    <span className="revenue-value">{formatCurrency(memberStats.revenue, 'VND')}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
