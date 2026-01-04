export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
}

export function formatShortDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

export function getDaysUntilExpiration(expirationDate: string): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);
    const diffTime = expDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getExpirationStatus(expirationDate: string): 'expired' | 'expiring-soon' | 'active' {
    const daysLeft = getDaysUntilExpiration(expirationDate);
    if (daysLeft < 0) return 'expired';
    if (daysLeft <= 7) return 'expiring-soon';
    return 'active';
}

export function getExpirationLabel(expirationDate: string): string {
    const daysLeft = getDaysUntilExpiration(expirationDate);

    if (daysLeft < 0) {
        const daysAgo = Math.abs(daysLeft);
        return daysAgo === 1 ? 'Đã hết hạn 1 ngày trước' : `Đã hết hạn ${daysAgo} ngày trước`;
    }
    if (daysLeft === 0) return 'Hết hạn hôm nay';
    if (daysLeft === 1) return 'Hết hạn ngày mai';
    if (daysLeft <= 7) return `Còn ${daysLeft} ngày`;
    if (daysLeft <= 30) return `Còn ${daysLeft} ngày`;

    const monthsLeft = Math.floor(daysLeft / 30);
    if (monthsLeft === 1) return 'Còn khoảng 1 tháng';
    return `Còn khoảng ${monthsLeft} tháng`;
}

export function formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function getTodayString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

export function getDefaultExpirationDate(months: number = 12): string {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
}
