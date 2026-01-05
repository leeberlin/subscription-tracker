import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { SubscriptionCard } from '../SubscriptionCard';
import { SubscriptionForm } from '../SubscriptionForm';
import { ImportExcel, ImportedMemberData } from '../ImportExcel';
import { Subscription, SubscriptionFormData, Member, CATEGORY_CONFIG, SubscriptionCategory } from '../../types/subscription';
import './Subscriptions.css';

type SortBy = 'name' | 'price' | 'expiration' | 'created';
type FilterStatus = 'all' | 'active' | 'expiring' | 'expired';

const Subscriptions: React.FC = () => {
    const {
        subscriptions,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        addFamilyGroup,
        addMember,
        updateMember,
        deleteMember,
    } = useSubscriptions();

    const [showForm, setShowForm] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [filterCategory, setFilterCategory] = useState<SubscriptionCategory | 'all'>('all');
    const [sortBy, setSortBy] = useState<SortBy>('name');
    const [sortAsc, setSortAsc] = useState(true);
    const [showImport, setShowImport] = useState(false);
    const [importTargetSub, setImportTargetSub] = useState<Subscription | null>(null);

    // Filter and sort subscriptions
    const filteredSubscriptions = useMemo(() => {
        let result = [...subscriptions];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(sub =>
                sub.appName.toLowerCase().includes(query)
            );
        }

        // Status filter
        if (filterStatus !== 'all') {
            const now = new Date();
            const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            result = result.filter(sub => {
                const expDate = new Date(sub.expirationDate);
                if (filterStatus === 'active') return expDate >= sevenDays;
                if (filterStatus === 'expiring') return expDate >= now && expDate < sevenDays;
                if (filterStatus === 'expired') return expDate < now;
                return true;
            });
        }

        // Category filter
        if (filterCategory !== 'all') {
            result = result.filter(sub => sub.category === filterCategory);
        }

        // Sort
        result.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = a.appName.localeCompare(b.appName);
                    break;
                case 'price':
                    comparison = a.price - b.price;
                    break;
                case 'expiration':
                    comparison = new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
                    break;
                case 'created':
                    comparison = new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime();
                    break;
            }
            return sortAsc ? comparison : -comparison;
        });

        return result;
    }, [subscriptions, searchQuery, filterStatus, filterCategory, sortBy, sortAsc]);

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

    const handleSendReminder = (subscription: Subscription, member: Member) => {
        console.log('Send reminder to:', member.email, 'for:', subscription.appName);
    };

    const toggleSort = (newSortBy: SortBy) => {
        if (sortBy === newSortBy) {
            setSortAsc(!sortAsc);
        } else {
            setSortBy(newSortBy);
            setSortAsc(true);
        }
    };

    const handleImportMembers = (subscription: Subscription) => {
        setImportTargetSub(subscription);
        setShowImport(true);
    };

    const handleImportComplete = (members: ImportedMemberData[]) => {
        if (!importTargetSub) return;

        // Group members by family name
        const membersByFamily: Map<string, ImportedMemberData[]> = new Map();
        const DEFAULT_FAMILY = '__default__';

        members.forEach(memberData => {
            const familyKey = memberData.familyName?.trim() || DEFAULT_FAMILY;
            if (!membersByFamily.has(familyKey)) {
                membersByFamily.set(familyKey, []);
            }
            membersByFamily.get(familyKey)!.push(memberData);
        });

        // Get existing family groups for this subscription
        const existingFamilies = new Map(
            (importTargetSub.familyGroups || []).map(fg => [fg.name.toLowerCase(), fg.id])
        );

        // Process each family group
        membersByFamily.forEach((familyMembers, familyName) => {
            let targetGroupId: string;

            if (familyName === DEFAULT_FAMILY) {
                // Use the first existing group or create a default one
                if (importTargetSub.familyGroups?.length > 0) {
                    targetGroupId = importTargetSub.familyGroups[0].id;
                } else {
                    // Create default family group
                    const today = new Date().toISOString().split('T')[0];
                    const nextYear = new Date();
                    nextYear.setFullYear(nextYear.getFullYear() + 1);

                    const newGroup = addFamilyGroup(importTargetSub.id, {
                        name: 'Nhóm mặc định',
                        purchaseDate: today,
                        expirationDate: nextYear.toISOString().split('T')[0],
                    });
                    targetGroupId = newGroup?.id || 'default';
                }
            } else {
                // Check if family exists (case-insensitive)
                const existingGroupId = existingFamilies.get(familyName.toLowerCase());

                if (existingGroupId) {
                    targetGroupId = existingGroupId;
                } else {
                    // Create new family group with this name
                    const today = new Date().toISOString().split('T')[0];
                    const nextYear = new Date();
                    nextYear.setFullYear(nextYear.getFullYear() + 1);

                    const newGroup = addFamilyGroup(importTargetSub.id, {
                        name: familyName,
                        purchaseDate: today,
                        expirationDate: nextYear.toISOString().split('T')[0],
                    });

                    if (newGroup) {
                        targetGroupId = newGroup.id;
                        existingFamilies.set(familyName.toLowerCase(), newGroup.id);
                    } else {
                        // Fallback to first group
                        targetGroupId = importTargetSub.familyGroups?.[0]?.id || 'default';
                    }
                }
            }

            // Add all members to the target group
            familyMembers.forEach(memberData => {
                const { familyName: _, ...memberFormData } = memberData;
                addMember(importTargetSub.id, targetGroupId, memberFormData);
            });
        });
    };

    return (
        <div className="subscriptions-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Subscription Management</h1>
                    <p className="page-subtitle">Manage all your subscriptions in one place</p>
                </div>
                <button className="add-btn" onClick={handleAddNew}>
                    <Plus size={18} />
                    <span>Add Subscription</span>
                </button>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search subscriptions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <Filter size={16} />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="expiring">Expiring Soon</option>
                        <option value="expired">Expired</option>
                    </select>
                </div>

                <div className="filter-group">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value as SubscriptionCategory | 'all')}
                    >
                        <option value="all">All Categories</option>
                        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                            <option key={key} value={key}>{config.emoji} {config.label}</option>
                        ))}
                    </select>
                </div>

                <div className="sort-group">
                    <button
                        className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`}
                        onClick={() => toggleSort('name')}
                    >
                        Name
                        {sortBy === 'name' && (sortAsc ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                    </button>
                    <button
                        className={`sort-btn ${sortBy === 'price' ? 'active' : ''}`}
                        onClick={() => toggleSort('price')}
                    >
                        Price
                        {sortBy === 'price' && (sortAsc ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                    </button>
                    <button
                        className={`sort-btn ${sortBy === 'expiration' ? 'active' : ''}`}
                        onClick={() => toggleSort('expiration')}
                    >
                        Expiration
                        {sortBy === 'expiration' && (sortAsc ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                    </button>
                </div>
            </div>

            {/* Results count */}
            <div className="results-count">
                Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
            </div>

            {/* Subscription Grid */}
            {filteredSubscriptions.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🔍</div>
                    <h3>No subscriptions found</h3>
                    <p>Try adjusting your filters or add a new subscription.</p>
                </div>
            ) : (
                <div className="subscription-grid">
                    {filteredSubscriptions.map(subscription => {
                        // Get first family group ID for legacy compatibility
                        const defaultGroupId = subscription.familyGroups?.[0]?.id || 'default';
                        return (
                            <SubscriptionCard
                                key={subscription.id}
                                subscription={subscription}
                                onEdit={handleEdit}
                                onDelete={deleteSubscription}
                                onAddMember={(subId, data) => addMember(subId, defaultGroupId, data)}
                                onEditMember={(subId, memberId, data) => updateMember(subId, defaultGroupId, memberId, data)}
                                onDeleteMember={(subId, memberId) => deleteMember(subId, defaultGroupId, memberId)}
                                onSendReminder={handleSendReminder}
                                onImportMembers={() => handleImportMembers(subscription)}
                            />
                        );
                    })}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <SubscriptionForm
                    subscription={editingSubscription}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                />
            )}

            {/* Import Excel Modal */}
            {showImport && importTargetSub && (
                <ImportExcel
                    subscriptionName={importTargetSub.appName}
                    existingFamilies={(importTargetSub.familyGroups || []).map(fg => fg.name)}
                    onImport={handleImportComplete}
                    onClose={() => {
                        setShowImport(false);
                        setImportTargetSub(null);
                    }}
                />
            )}
        </div>
    );
};

export default Subscriptions;
