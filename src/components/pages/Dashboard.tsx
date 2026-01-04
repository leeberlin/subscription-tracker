import React, { useState, useMemo } from 'react';
import { Plus, Search, CreditCard, DollarSign, Clock, Users, AlertTriangle } from 'lucide-react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { SubscriptionRow } from '../SubscriptionRow';
import { SubscriptionForm } from '../SubscriptionForm';
import { Subscription, SubscriptionFormData, MemberFormData, FamilyGroupFormData } from '../../types/subscription';
import { formatCurrency, getDaysUntilExpiration } from '../../utils/dateUtils';
import { useI18n } from '../../i18n';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const { t } = useI18n();
    const {
        subscriptions,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        addFamilyGroup,
        updateFamilyGroup,
        deleteFamilyGroup,
        addMember,
        updateMember,
        deleteMember,
        getExpiringSubscriptions,
        getTotalMonthlySpend,
        getMembersNeedingPayment,
    } = useSubscriptions();

    const [showForm, setShowForm] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Stats
    const totalSubscriptions = subscriptions.length;
    const monthlySpend = getTotalMonthlySpend();
    const expiringCount = getExpiringSubscriptions().length;
    const totalFamilies = subscriptions.reduce((sum, s) => sum + (s.familyGroups?.length || 0), 0);
    const totalMembers = subscriptions.reduce((sum, s) =>
        sum + (s.familyGroups || []).reduce((fsum, g) => fsum + g.members.length, 0), 0
    );
    const membersNeedingPayment = getMembersNeedingPayment();

    // Filter subscriptions
    const filteredSubscriptions = useMemo(() => {
        if (!searchQuery.trim()) return subscriptions;
        const query = searchQuery.toLowerCase();
        return subscriptions.filter(sub =>
            sub.appName.toLowerCase().includes(query)
        );
    }, [subscriptions, searchQuery]);

    // Handlers
    const handleAddNew = () => {
        setEditingSubscription(null);
        setShowForm(true);
    };

    const handleEdit = (subscription: Subscription) => {
        setEditingSubscription(subscription);
        setShowForm(true);
    };

    const handleFormSubmit = (data: SubscriptionFormData) => {
        if (editingSubscription) {
            updateSubscription(editingSubscription.id, data);
        } else {
            addSubscription(data);
        }
        setShowForm(false);
        setEditingSubscription(null);
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingSubscription(null);
    };

    // Family Group handlers
    const handleAddFamilyGroup = (subscriptionId: string, data: FamilyGroupFormData) => {
        addFamilyGroup(subscriptionId, data);
    };

    const handleEditFamilyGroup = (subscriptionId: string, groupId: string, data: Partial<FamilyGroupFormData>) => {
        updateFamilyGroup(subscriptionId, groupId, data);
    };

    const handleDeleteFamilyGroup = (subscriptionId: string, groupId: string) => {
        deleteFamilyGroup(subscriptionId, groupId);
    };

    // Member handlers
    const handleAddMember = (subscriptionId: string, groupId: string, data: MemberFormData) => {
        addMember(subscriptionId, groupId, data);
    };

    const handleEditMember = (subscriptionId: string, groupId: string, memberId: string, data: Partial<MemberFormData>) => {
        updateMember(subscriptionId, groupId, memberId, data);
    };

    const handleDeleteMember = (subscriptionId: string, groupId: string, memberId: string) => {
        deleteMember(subscriptionId, groupId, memberId);
    };

    return (
        <div className="dashboard-page">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-left">
                    <h1 className="page-title">Subscription Tracker</h1>
                </div>
                <div className="header-right">
                    <button className="add-btn" onClick={handleAddNew}>
                        <Plus size={18} />
                        <span>{t.dashboard.addNew}</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card blue">
                    <div className="stat-icon">
                        <CreditCard size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{totalSubscriptions}</span>
                        <span className="stat-label">{t.dashboard.totalSubscriptions}</span>
                    </div>
                </div>
                <div className="stat-card cyan">
                    <div className="stat-icon">
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{formatCurrency(monthlySpend, 'VND')}</span>
                        <span className="stat-label">{t.dashboard.monthlySpending}</span>
                    </div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-icon">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{expiringCount}</span>
                        <span className="stat-label">{t.dashboard.expiringSoon}</span>
                    </div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-icon">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{totalMembers}</span>
                        <span className="stat-label">{t.dashboard.totalMembers}</span>
                    </div>
                </div>
            </div>

            {/* Payment Alerts */}
            {membersNeedingPayment.length > 0 && (
                <div className="payment-alerts">
                    <div className="alert-header">
                        <AlertTriangle size={18} />
                        <span>{membersNeedingPayment.length} {t.dashboard.members.toLowerCase()} {t.members.pending.toLowerCase()}</span>
                    </div>
                    <div className="alert-list">
                        {membersNeedingPayment.slice(0, 8).map(({ subscription, familyGroup, member }) => {
                            const days = getDaysUntilExpiration(member.nextPaymentDate);
                            return (
                                <div key={`${subscription.id}-${familyGroup.id}-${member.id}`} className="alert-item">
                                    <span className="alert-name">{member.name}</span>
                                    <span className="alert-sub">({subscription.appName} - {familyGroup.name})</span>
                                    <span className={`alert-days ${days < 0 ? 'overdue' : ''}`}>
                                        {days < 0
                                            ? `${Math.abs(days)}d ${t.dashboard.daysOverdue.split(' ')[0]}`
                                            : `${days}d ${t.dashboard.daysLeft.split(' ')[0]}`}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Subscription List */}
            <div className="subscription-section">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">{t.dashboard.subscriptionList}</h2>
                        <p className="section-subtitle">{totalFamilies} {t.dashboard.families.toLowerCase()} • {totalMembers} {t.dashboard.members.toLowerCase()}</p>
                    </div>
                    <div className="section-actions">
                        <div className="search-box">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder={`${t.common.search}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Subscription Rows */}
                {filteredSubscriptions.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📦</div>
                        <h3>{t.common.noData}</h3>
                        <p>Start tracking your subscriptions by adding your first one.</p>
                        <button className="add-btn" onClick={handleAddNew}>
                            <Plus size={18} />
                            <span>{t.dashboard.addNew}</span>
                        </button>
                    </div>
                ) : (
                    <div className="subscription-list">
                        {filteredSubscriptions.map(subscription => (
                            <SubscriptionRow
                                key={subscription.id}
                                subscription={subscription}
                                onEdit={handleEdit}
                                onDelete={deleteSubscription}
                                onAddFamilyGroup={handleAddFamilyGroup}
                                onEditFamilyGroup={handleEditFamilyGroup}
                                onDeleteFamilyGroup={handleDeleteFamilyGroup}
                                onAddMember={handleAddMember}
                                onEditMember={handleEditMember}
                                onDeleteMember={handleDeleteMember}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Add Button */}
            <button className="floating-add-btn" onClick={handleAddNew}>
                <Plus size={24} />
                <span>{t.dashboard.addNew}</span>
            </button>

            {/* Subscription Form Modal */}
            {showForm && (
                <SubscriptionForm
                    subscription={editingSubscription}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                />
            )}
        </div>
    );
};

export default Dashboard;
