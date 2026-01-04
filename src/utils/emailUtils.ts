import emailjs from '@emailjs/browser';

// Get EmailJS configuration from localStorage (user-configurable)
const getEmailJSConfig = (): { serviceId: string; templateId: string; publicKey: string } | null => {
    try {
        const settingsStr = localStorage.getItem('subscription-tracker-settings');
        if (!settingsStr) return null;

        const settings = JSON.parse(settingsStr);
        const { emailjsServiceId, emailjsTemplateId, emailjsPublicKey } = settings;

        if (!emailjsServiceId || !emailjsTemplateId || !emailjsPublicKey) {
            return null;
        }

        return {
            serviceId: emailjsServiceId,
            templateId: emailjsTemplateId,
            publicKey: emailjsPublicKey
        };
    } catch (error) {
        console.error('Failed to get EmailJS config:', error);
        return null;
    }
};

export interface MemberAlert {
    name: string;
    email: string;
    daysLeft: number;
    subscription: string;
    family: string;
}

// Initialize EmailJS with user's config
let initialized = false;
let currentPublicKey = '';
export const initEmailJS = () => {
    const config = getEmailJSConfig();
    if (!config) {
        console.warn('EmailJS not configured. Please set up credentials in Settings.');
        return false;
    }

    // Re-initialize if public key changed
    if (!initialized || currentPublicKey !== config.publicKey) {
        emailjs.init(config.publicKey);
        currentPublicKey = config.publicKey;
        initialized = true;
        console.log('EmailJS initialized with user config');
    }
    return true;
};

// Format current time
const formatCurrentTime = (): string => {
    const now = new Date();
    return now.toLocaleString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Send test email
export const sendTestEmail = async (
    toEmail: string,
    language: string = 'vi'
): Promise<{ success: boolean; message: string }> => {
    try {
        const config = getEmailJSConfig();
        if (!config) {
            return {
                success: false,
                message: language === 'vi'
                    ? 'EmailJS chưa được cấu hình. Vui lòng vào Settings để thiết lập.'
                    : 'EmailJS not configured. Please go to Settings to set up.'
            };
        }

        initEmailJS();

        const isVi = language === 'vi';

        const templateParams = {
            to_email: toEmail,
            name: 'Admin',
            subject: isVi
                ? 'Test Email - Hệ thống hoạt động bình thường'
                : 'Test Email - System Working Correctly',
            message: isVi
                ? 'Đây là email test từ Subscription Tracker.\n\nHệ thống thông báo đang hoạt động bình thường! Bạn sẽ nhận được nhắc nhở tự động khi có thành viên sắp đến hạn thanh toán.'
                : 'This is a test email from Subscription Tracker.\n\nThe notification system is working correctly! You will receive automatic reminders when members are due for payment.',
            members_list: isVi
                ? '✅ Không có thành viên nào cần thanh toán ngay lúc này.'
                : '✅ No members need payment at this time.',
            time: formatCurrentTime(),
        };

        console.log('Sending test email to:', toEmail);

        const response = await emailjs.send(
            config.serviceId,
            config.templateId,
            templateParams,
            config.publicKey
        );

        console.log('Email sent successfully:', response);
        return {
            success: true,
            message: isVi ? 'Email đã được gửi thành công!' : 'Email sent successfully!'
        };
    } catch (error: any) {
        console.error('Failed to send email:', error);
        return {
            success: false,
            message: error?.text || error?.message || 'Failed to send email'
        };
    }
};

// Send reminder email with member list
export const sendReminderEmail = async (
    toEmail: string,
    members: MemberAlert[],
    language: string = 'vi'
): Promise<{ success: boolean; message: string }> => {
    try {
        const config = getEmailJSConfig();
        if (!config) {
            return {
                success: false,
                message: language === 'vi'
                    ? 'EmailJS chưa được cấu hình. Vui lòng vào Settings để thiết lập.'
                    : 'EmailJS not configured. Please go to Settings to set up.'
            };
        }

        initEmailJS();

        const isVi = language === 'vi';

        // Format members list with better styling
        const membersList = members
            .map(m => {
                const statusIcon = m.daysLeft < 0 ? '🔴' : m.daysLeft <= 3 ? '🟠' : '🟡';
                const daysText = m.daysLeft < 0
                    ? (isVi ? `QUÁ HẠN ${Math.abs(m.daysLeft)} ngày` : `${Math.abs(m.daysLeft)} days OVERDUE`)
                    : m.daysLeft === 0
                        ? (isVi ? 'HÔM NAY' : 'TODAY')
                        : (isVi ? `còn ${m.daysLeft} ngày` : `${m.daysLeft} days left`);
                return `${statusIcon} ${m.name}\n   📦 ${m.subscription} / ${m.family}\n   ⏰ ${daysText}`;
            })
            .join('\n\n');

        // Count by urgency
        const overdue = members.filter(m => m.daysLeft < 0).length;
        const urgent = members.filter(m => m.daysLeft >= 0 && m.daysLeft <= 3).length;
        const upcoming = members.filter(m => m.daysLeft > 3).length;

        const summaryText = isVi
            ? `📊 Tổng quan: ${overdue > 0 ? `🔴 ${overdue} quá hạn • ` : ''}${urgent > 0 ? `🟠 ${urgent} cấp bách • ` : ''}${upcoming > 0 ? `🟡 ${upcoming} sắp tới` : ''}`
            : `📊 Summary: ${overdue > 0 ? `🔴 ${overdue} overdue • ` : ''}${urgent > 0 ? `🟠 ${urgent} urgent • ` : ''}${upcoming > 0 ? `🟡 ${upcoming} upcoming` : ''}`;

        const templateParams = {
            to_email: toEmail,
            name: 'Admin',
            subject: isVi
                ? `${members.length} thành viên cần thanh toán`
                : `${members.length} members need payment`,
            message: isVi
                ? `Bạn có ${members.length} thành viên cần thanh toán trong 7 ngày tới.\n\n${summaryText}\n\nVui lòng kiểm tra và xử lý kịp thời!`
                : `You have ${members.length} members needing payment within 7 days.\n\n${summaryText}\n\nPlease review and process in time!`,
            members_list: membersList || (isVi ? 'Không có thành viên nào.' : 'No members.'),
            time: formatCurrentTime(),
        };

        console.log('Sending reminder email to:', toEmail);
        console.log('Members:', members);

        const response = await emailjs.send(
            config.serviceId,
            config.templateId,
            templateParams,
            config.publicKey
        );

        console.log('Reminder email sent:', response);
        return {
            success: true,
            message: isVi ? 'Email nhắc nhở đã được gửi!' : 'Reminder email sent!'
        };
    } catch (error: any) {
        console.error('Failed to send reminder email:', error);
        return {
            success: false,
            message: error?.text || error?.message || 'Failed to send email'
        };
    }
};

// Get members needing payment from localStorage
export const getMembersNeedingPaymentForEmail = (reminderDays: number = 7): MemberAlert[] => {
    try {
        const data = localStorage.getItem('subscription-tracker-data');
        if (!data) return [];

        const subscriptions = JSON.parse(data);
        const alertMembers: MemberAlert[] = [];

        subscriptions.forEach((sub: any) => {
            (sub.familyGroups || []).forEach((group: any) => {
                (group.members || []).forEach((member: any) => {
                    const nextPayment = new Date(member.nextPaymentDate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    nextPayment.setHours(0, 0, 0, 0);
                    const diffTime = nextPayment.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays <= reminderDays && diffDays >= -7) {
                        alertMembers.push({
                            name: member.name,
                            email: member.email || '',
                            daysLeft: diffDays,
                            subscription: sub.appName,
                            family: group.name
                        });
                    }
                });
            });
        });

        return alertMembers.sort((a, b) => a.daysLeft - b.daysLeft);
    } catch (error) {
        console.error('Error getting members:', error);
        return [];
    }
};

// Email config interface for bulk email
export interface EmailConfig {
    to: string;
    subject: string;
    body: string;
}

// Generate payment reminder email content
export const generatePaymentReminderEmail = (subscription: any, member: any): EmailConfig => {
    const daysLeft = Math.ceil(
        (new Date(member.nextPaymentDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    const isOverdue = daysLeft < 0;
    const statusText = isOverdue
        ? `quá hạn ${Math.abs(daysLeft)} ngày`
        : daysLeft === 0
            ? 'hôm nay'
            : `còn ${daysLeft} ngày`;

    const subject = `[Nhắc nhở] Thanh toán ${subscription.appName} - ${statusText}`;

    const body = `Xin chào ${member.name},

Đây là email nhắc nhở về việc thanh toán gói đăng ký ${subscription.appName}.

📦 Gói: ${subscription.appName}
💰 Số tiền: ${member.amountPaid} ${subscription.currency || 'VND'}
📅 Ngày thanh toán: ${new Date(member.nextPaymentDate).toLocaleDateString('vi-VN')}
⏰ Trạng thái: ${statusText}

Vui lòng thanh toán đúng hạn để duy trì dịch vụ.

Trân trọng,
Subscription Tracker`;

    return {
        to: member.email,
        subject,
        body
    };
};

// Copy email content to clipboard
export const copyEmailToClipboard = async (emailConfig: EmailConfig): Promise<boolean> => {
    try {
        const content = `To: ${emailConfig.to}
Subject: ${emailConfig.subject}

${emailConfig.body}`;

        await navigator.clipboard.writeText(content);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
};

