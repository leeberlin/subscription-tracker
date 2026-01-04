import React, { useState } from 'react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { DashboardCharts } from '../DashboardCharts';
import { StatsPanel } from '../StatsPanel';
import { Subscription, Member } from '../../types/subscription';
import './Statistics.css';

const Statistics: React.FC = () => {
    const {
        subscriptions,
        getActiveSubscriptions,
        getExpiringSubscriptions,
        getExpiredSubscriptions,
        getTotalMonthlySpend,
        getMembersNeedingPayment,
    } = useSubscriptions();

    const [chartsVisible, setChartsVisible] = useState(true);

    const handleSendReminder = (subscription: Subscription, member: Member) => {
        console.log('Send reminder to:', member.email, 'for:', subscription.appName);
    };

    return (
        <div className="statistics-page">
            <div className="page-header">
                <h1 className="page-title">Statistics</h1>
                <p className="page-subtitle">Overview of your subscription spending and trends</p>
            </div>

            <div className="stats-wrapper">
                <StatsPanel
                    subscriptions={subscriptions}
                    activeCount={getActiveSubscriptions().length}
                    expiringCount={getExpiringSubscriptions().length}
                    expiredCount={getExpiredSubscriptions().length}
                    monthlySpend={getTotalMonthlySpend()}
                    membersNeedingPayment={getMembersNeedingPayment()}
                    onSendReminder={handleSendReminder}
                />
            </div>

            <div className="charts-wrapper">
                <DashboardCharts
                    subscriptions={subscriptions}
                    isVisible={chartsVisible}
                    onToggle={() => setChartsVisible(!chartsVisible)}
                />
            </div>
        </div>
    );
};

export default Statistics;
