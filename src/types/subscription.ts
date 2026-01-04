// Family Group - Nhóm gia đình trong một subscription
export interface FamilyGroup {
    id: string;
    name: string;           // "Gia đình 1", "Nhà Nguyễn", etc.
    purchaseDate: string;   // Ngày mua gói này
    expirationDate: string; // Ngày hết hạn gói này
    notes?: string;
    members: Member[];
}

export interface Member {
    id: string;
    name: string;
    email: string;
    phone?: string;
    joinDate: string;
    amountPaid: number;
    nextPaymentDate: string;
    status: MemberStatus;
    notes?: string;
}

export type MemberStatus = 'active' | 'pending' | 'overdue' | 'inactive';

export interface Subscription {
    id: string;
    appName: string;
    category: SubscriptionCategory;
    purchaseDate: string;    // Ngày bắt đầu sử dụng dịch vụ tổng
    expirationDate: string;  // Ngày hết hạn chung
    price: number;           // Giá gốc mỗi gói
    currency: string;
    notes?: string;
    autoRenew: boolean;
    notificationDays: number;
    icon?: string;
    color: string;
    // Family/Group subscription support
    isShared: boolean;
    maxMembers?: number;     // Max members per family
    maxFamilies?: number;    // Max families (e.g., YouTube Premium Family = 5 members per family)
    // NEW: Multi-family support
    familyGroups: FamilyGroup[];
    // Legacy: Flat member list (for backwards compatibility)
    members: Member[];
}

export type SubscriptionCategory =
    | 'productivity'
    | 'development'
    | 'design'
    | 'entertainment'
    | 'cloud'
    | 'security'
    | 'other';

export interface SubscriptionFormData {
    appName: string;
    category: SubscriptionCategory;
    purchaseDate: string;
    expirationDate: string;
    price: number;
    currency: string;
    notes?: string;
    autoRenew: boolean;
    notificationDays: number;
    color: string;
    isShared: boolean;
    maxMembers?: number;
    maxFamilies?: number;
}

export interface FamilyGroupFormData {
    name: string;
    purchaseDate: string;
    expirationDate: string;
    notes?: string;
}

export interface MemberFormData {
    name: string;
    email: string;
    phone?: string;
    joinDate: string;
    amountPaid: number;
    nextPaymentDate: string;
    notes?: string;
}

export const CATEGORY_CONFIG: Record<SubscriptionCategory, { label: string; emoji: string; gradient: string }> = {
    productivity: { label: 'Productivity', emoji: '📊', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    development: { label: 'Development', emoji: '💻', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    design: { label: 'Design', emoji: '🎨', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    entertainment: { label: 'Entertainment', emoji: '🎬', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    cloud: { label: 'Cloud', emoji: '☁️', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    security: { label: 'Security', emoji: '🔐', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    other: { label: 'Other', emoji: '📦', gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)' },
};

export const MEMBER_STATUS_CONFIG: Record<MemberStatus, { label: string; color: string; bgColor: string }> = {
    active: { label: 'Active', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' },
    pending: { label: 'Pending', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' },
    overdue: { label: 'Overdue', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
    inactive: { label: 'Inactive', color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
};

export const CURRENCY_OPTIONS = [
    { value: 'VND', label: '₫ VND' },
    { value: 'USD', label: '$ USD' },
    { value: 'EUR', label: '€ EUR' },
    { value: 'NGN', label: '₦ NGN' },
    { value: 'TRY', label: '₺ TRY' },
    { value: 'GBP', label: '£ GBP' },
    { value: 'JPY', label: '¥ JPY' },
];

export const PRESET_COLORS = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DDA0DD',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E9',
];

// Email template for payment reminder
export const EMAIL_TEMPLATES = {
    paymentReminder: {
        subject: (appName: string) => `[Reminder] Renew ${appName} subscription`,
        body: (memberName: string, appName: string, amount: number, currency: string, dueDate: string) =>
            `Hello ${memberName},

This is a reminder about your ${appName} subscription renewal.

📅 Due date: ${dueDate}
💰 Amount: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount)}

Please make your payment before the due date to continue using the service.

Best regards,
Subscription Tracker`
    },
    welcome: {
        subject: (appName: string) => `Welcome to ${appName}`,
        body: (memberName: string, appName: string) =>
            `Hello ${memberName},

Welcome to ${appName} subscription!

You have been added to the member list. The system will automatically send payment reminders when due.

Best regards,
Subscription Tracker`
    }
};
