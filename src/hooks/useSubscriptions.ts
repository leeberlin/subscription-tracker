import { useState, useEffect, useCallback } from 'react';
import {
    Subscription, SubscriptionFormData,
    FamilyGroup, FamilyGroupFormData,
    Member, MemberFormData, PRESET_COLORS
} from '../types/subscription';
import { getDaysUntilExpiration } from '../utils/dateUtils';

const STORAGE_KEY = 'subscription-tracker-data';

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function loadFromStorage(): Subscription[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return getSampleSubscriptions();
        }
        const data = JSON.parse(stored);
        if (data.length === 0) {
            return getSampleSubscriptions();
        }
        // Migrate old data
        return data.map((sub: Subscription) => ({
            ...sub,
            isShared: sub.isShared ?? false,
            members: sub.members ?? [],
            familyGroups: sub.familyGroups ?? [],
            billingCycle: sub.billingCycle ?? 'monthly',
        }));
    } catch {
        return getSampleSubscriptions();
    }
}

function getSampleSubscriptions(): Subscription[] {
    const today = new Date();
    const futureDate = (months: number) => {
        const d = new Date(today);
        d.setMonth(d.getMonth() + months);
        return d.toISOString().split('T')[0];
    };
    const pastDate = (months: number) => {
        const d = new Date(today);
        d.setMonth(d.getMonth() - months);
        return d.toISOString().split('T')[0];
    };

    return [
        {
            id: 'demo-youtube',
            appName: 'YouTube Premium',
            category: 'entertainment',
            purchaseDate: pastDate(12),
            expirationDate: futureDate(12),
            price: 179000,
            currency: 'VND',
            billingCycle: 'monthly',
            notes: 'Multiple family groups',
            autoRenew: true,
            notificationDays: 7,
            color: '#FF0000',
            isShared: true,
            maxMembers: 5,
            maxFamilies: 10,
            members: [],
            familyGroups: [
                {
                    id: 'fam-1',
                    name: 'Nhà Nguyễn',
                    purchaseDate: pastDate(10),
                    expirationDate: futureDate(2),
                    notes: 'Family 1',
                    members: [
                        { id: 'm1', name: 'Nguyễn Văn A', email: 'a@email.com', joinDate: pastDate(10), amountPaid: 40000, nextPaymentDate: futureDate(0.5), status: 'pending' },
                        { id: 'm2', name: 'Nguyễn Thị B', email: 'b@email.com', joinDate: pastDate(8), amountPaid: 40000, nextPaymentDate: futureDate(1), status: 'active' },
                        { id: 'm3', name: 'Nguyễn Văn C', email: 'c@email.com', joinDate: pastDate(6), amountPaid: 40000, nextPaymentDate: futureDate(1), status: 'active' },
                    ],
                },
                {
                    id: 'fam-2',
                    name: 'Nhà Trần',
                    purchaseDate: pastDate(8),
                    expirationDate: futureDate(4),
                    members: [
                        { id: 'm4', name: 'Trần Văn D', email: 'd@email.com', joinDate: pastDate(8), amountPaid: 40000, nextPaymentDate: futureDate(2), status: 'active' },
                        { id: 'm5', name: 'Trần Thị E', email: 'e@email.com', joinDate: pastDate(6), amountPaid: 40000, nextPaymentDate: futureDate(-2), status: 'overdue' },
                    ],
                },
                {
                    id: 'fam-3',
                    name: 'Nhà Lê',
                    purchaseDate: pastDate(3),
                    expirationDate: futureDate(9),
                    members: [
                        { id: 'm6', name: 'Lê Văn F', email: 'f@email.com', joinDate: pastDate(3), amountPaid: 40000, nextPaymentDate: futureDate(3), status: 'active' },
                    ],
                },
            ],
        },
        {
            id: 'demo-netflix',
            appName: 'Netflix Premium',
            category: 'entertainment',
            purchaseDate: pastDate(10),
            expirationDate: futureDate(2),
            price: 260000,
            currency: 'VND',
            billingCycle: 'monthly',
            notes: 'Family plan shared',
            autoRenew: true,
            notificationDays: 7,
            color: '#E50914',
            isShared: true,
            maxMembers: 4,
            members: [],
            familyGroups: [
                {
                    id: 'netflix-fam-1',
                    name: 'Main Family',
                    purchaseDate: pastDate(10),
                    expirationDate: futureDate(2),
                    members: [
                        { id: 'nf1', name: 'User 1', email: 'user1@email.com', joinDate: pastDate(10), amountPaid: 65000, nextPaymentDate: futureDate(1), status: 'active' },
                        { id: 'nf2', name: 'User 2', email: 'user2@email.com', joinDate: pastDate(8), amountPaid: 65000, nextPaymentDate: futureDate(0.2), status: 'pending' },
                    ],
                },
            ],
        },
        {
            id: 'demo-spotify',
            appName: 'Spotify Premium',
            category: 'entertainment',
            purchaseDate: pastDate(8),
            expirationDate: futureDate(4),
            price: 59000,
            currency: 'VND',
            billingCycle: 'monthly',
            autoRenew: true,
            notificationDays: 7,
            color: '#1DB954',
            isShared: false,
            members: [],
            familyGroups: [],
        },
        {
            id: 'demo-chatgpt',
            appName: 'ChatGPT Plus',
            category: 'productivity',
            purchaseDate: pastDate(3),
            expirationDate: futureDate(9),
            price: 500000,
            currency: 'VND',
            billingCycle: 'monthly',
            autoRenew: true,
            notificationDays: 7,
            color: '#10A37F',
            isShared: false,
            members: [],
            familyGroups: [],
        },
    ];
}

function saveToStorage(subscriptions: Subscription[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
}

function getMemberStatus(nextPaymentDate: string): Member['status'] {
    const daysUntil = getDaysUntilExpiration(nextPaymentDate);
    if (daysUntil < 0) return 'overdue';
    if (daysUntil <= 7) return 'pending';
    return 'active';
}

export function useSubscriptions() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const data = loadFromStorage();
        setSubscriptions(data);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (!isLoading) {
            saveToStorage(subscriptions);
        }
    }, [subscriptions, isLoading]);

    // === Subscription CRUD ===
    const addSubscription = useCallback((formData: SubscriptionFormData): Subscription => {
        const newSubscription: Subscription = {
            ...formData,
            id: generateId(),
            color: formData.color || PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)],
            members: [],
            familyGroups: [],
        };
        setSubscriptions(prev => [...prev, newSubscription]);
        return newSubscription;
    }, []);

    const updateSubscription = useCallback((id: string, formData: Partial<SubscriptionFormData>): void => {
        setSubscriptions(prev =>
            prev.map(sub => (sub.id === id ? { ...sub, ...formData } : sub))
        );
    }, []);

    const deleteSubscription = useCallback((id: string): void => {
        setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    }, []);

    // === Family Group CRUD ===
    const addFamilyGroup = useCallback((subscriptionId: string, data: FamilyGroupFormData): FamilyGroup | null => {
        const newGroup: FamilyGroup = {
            id: generateId(),
            ...data,
            members: [],
        };

        setSubscriptions(prev =>
            prev.map(sub => {
                if (sub.id === subscriptionId) {
                    return { ...sub, familyGroups: [...(sub.familyGroups || []), newGroup] };
                }
                return sub;
            })
        );

        return newGroup;
    }, []);

    const updateFamilyGroup = useCallback((subscriptionId: string, groupId: string, data: Partial<FamilyGroupFormData>): void => {
        setSubscriptions(prev =>
            prev.map(sub => {
                if (sub.id === subscriptionId) {
                    return {
                        ...sub,
                        familyGroups: (sub.familyGroups || []).map(g =>
                            g.id === groupId ? { ...g, ...data } : g
                        ),
                    };
                }
                return sub;
            })
        );
    }, []);

    const deleteFamilyGroup = useCallback((subscriptionId: string, groupId: string): void => {
        setSubscriptions(prev =>
            prev.map(sub => {
                if (sub.id === subscriptionId) {
                    return {
                        ...sub,
                        familyGroups: (sub.familyGroups || []).filter(g => g.id !== groupId),
                    };
                }
                return sub;
            })
        );
    }, []);

    // === Member CRUD (within Family Group) ===
    const addMember = useCallback((subscriptionId: string, groupId: string, memberData: MemberFormData): Member | null => {
        const newMember: Member = {
            id: generateId(),
            ...memberData,
            status: getMemberStatus(memberData.nextPaymentDate),
        };

        setSubscriptions(prev =>
            prev.map(sub => {
                if (sub.id === subscriptionId) {
                    return {
                        ...sub,
                        familyGroups: (sub.familyGroups || []).map(g => {
                            if (g.id === groupId) {
                                return { ...g, members: [...g.members, newMember] };
                            }
                            return g;
                        }),
                    };
                }
                return sub;
            })
        );

        return newMember;
    }, []);

    const updateMember = useCallback((subscriptionId: string, groupId: string, memberId: string, memberData: Partial<MemberFormData>): void => {
        setSubscriptions(prev =>
            prev.map(sub => {
                if (sub.id === subscriptionId) {
                    return {
                        ...sub,
                        familyGroups: (sub.familyGroups || []).map(g => {
                            if (g.id === groupId) {
                                return {
                                    ...g,
                                    members: g.members.map(m => {
                                        if (m.id === memberId) {
                                            const updated = { ...m, ...memberData };
                                            if (memberData.nextPaymentDate) {
                                                updated.status = getMemberStatus(memberData.nextPaymentDate);
                                            }
                                            return updated;
                                        }
                                        return m;
                                    }),
                                };
                            }
                            return g;
                        }),
                    };
                }
                return sub;
            })
        );
    }, []);

    const deleteMember = useCallback((subscriptionId: string, groupId: string, memberId: string): void => {
        setSubscriptions(prev =>
            prev.map(sub => {
                if (sub.id === subscriptionId) {
                    return {
                        ...sub,
                        familyGroups: (sub.familyGroups || []).map(g => {
                            if (g.id === groupId) {
                                return { ...g, members: g.members.filter(m => m.id !== memberId) };
                            }
                            return g;
                        }),
                    };
                }
                return sub;
            })
        );
    }, []);

    // === Computed Values ===
    const getExpiringSubscriptions = useCallback((days: number = 7): Subscription[] => {
        const now = new Date();
        const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        return subscriptions.filter(sub => {
            const expDate = new Date(sub.expirationDate);
            return expDate >= now && expDate <= futureDate;
        });
    }, [subscriptions]);

    const getExpiredSubscriptions = useCallback((): Subscription[] => {
        const now = new Date();
        return subscriptions.filter(sub => new Date(sub.expirationDate) < now);
    }, [subscriptions]);

    const getActiveSubscriptions = useCallback((): Subscription[] => {
        const now = new Date();
        return subscriptions.filter(sub => new Date(sub.expirationDate) >= now);
    }, [subscriptions]);

    const getTotalMonthlySpend = useCallback((): number => {
        return subscriptions.reduce((sum, sub) => {
            // Convert yearly prices to monthly for estimation
            if (sub.billingCycle === 'yearly') {
                return sum + (sub.price / 12);
            }
            return sum + sub.price;
        }, 0);
    }, [subscriptions]);

    const getMembersNeedingPayment = useCallback((days: number = 7): { subscription: Subscription; familyGroup: FamilyGroup; member: Member }[] => {
        const results: { subscription: Subscription; familyGroup: FamilyGroup; member: Member }[] = [];

        subscriptions.forEach(sub => {
            (sub.familyGroups || []).forEach(group => {
                group.members.forEach(member => {
                    if (member.status !== 'inactive') {
                        const daysUntil = getDaysUntilExpiration(member.nextPaymentDate);
                        if (daysUntil <= days) {
                            results.push({ subscription: sub, familyGroup: group, member });
                        }
                    }
                });
            });
        });

        return results.sort((a, b) =>
            getDaysUntilExpiration(a.member.nextPaymentDate) - getDaysUntilExpiration(b.member.nextPaymentDate)
        );
    }, [subscriptions]);

    return {
        subscriptions,
        isLoading,
        // Subscription
        addSubscription,
        updateSubscription,
        deleteSubscription,
        // Family Group
        addFamilyGroup,
        updateFamilyGroup,
        deleteFamilyGroup,
        // Member
        addMember,
        updateMember,
        deleteMember,
        // Computed
        getActiveSubscriptions,
        getExpiringSubscriptions,
        getExpiredSubscriptions,
        getTotalMonthlySpend,
        getMembersNeedingPayment,
    };
}
