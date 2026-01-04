// Internationalization translations
export type Language = 'en' | 'vi';

export interface Translations {
    // Navigation
    nav: {
        dashboard: string;
        subscriptions: string;
        statistics: string;
        settings: string;
    };
    // Dashboard
    dashboard: {
        title: string;
        totalSubscriptions: string;
        monthlySpending: string;
        expiringSoon: string;
        totalMembers: string;
        subscriptionList: string;
        recentSubscriptions: string;
        viewAll: string;
        addNew: string;
        paymentAlerts: string;
        noAlerts: string;
        families: string;
        members: string;
        expiryDate: string;
        active: string;
        expired: string;
        expiringSoonLabel: string;
        daysLeft: string;
        daysOverdue: string;
    };
    // Settings
    settings: {
        title: string;
        subtitle: string;
        appearance: string;
        appearanceDesc: string;
        theme: string;
        themeDesc: string;
        light: string;
        dark: string;
        preferences: string;
        preferencesDesc: string;
        currency: string;
        currencyDesc: string;
        language: string;
        languageDesc: string;
        defaultReminder: string;
        reminderDesc: string;
        days: string;
        dataManagement: string;
        dataManagementDesc: string;
        export: string;
        exportDesc: string;
        import: string;
        importDesc: string;
        unsavedChanges: string;
        saveChanges: string;
        savedSuccess: string;
        // Email reminder settings
        emailReminders: string;
        emailRemindersDesc: string;
        autoSendReminders: string;
        autoSendRemindersDesc: string;
        reminderEmail: string;
        reminderEmailDesc: string;
        testEmail: string;
        emailSent: string;
    };
    // Common
    common: {
        edit: string;
        delete: string;
        save: string;
        cancel: string;
        add: string;
        confirm: string;
        search: string;
        filter: string;
        noData: string;
        loading: string;
        perMonth: string;
    };
    // Members
    members: {
        addMember: string;
        editMember: string;
        name: string;
        email: string;
        paymentDate: string;
        amount: string;
        status: string;
        paid: string;
        pending: string;
        overdue: string;
    };
    // Families
    families: {
        addFamily: string;
        editFamily: string;
        familyName: string;
        purchaseDate: string;
        expirationDate: string;
        notes: string;
        members: string;
        noMembers: string;
    };
}

export const translations: Record<Language, Translations> = {
    en: {
        nav: {
            dashboard: 'Dashboard',
            subscriptions: 'Subscriptions',
            statistics: 'Statistics',
            settings: 'Settings',
        },
        dashboard: {
            title: 'Dashboard',
            totalSubscriptions: 'Total Subscriptions',
            monthlySpending: 'Monthly Spending',
            expiringSoon: 'Expiring Soon',
            totalMembers: 'Total Members',
            subscriptionList: 'Subscription List',
            recentSubscriptions: 'Recent Subscriptions',
            viewAll: 'View All',
            addNew: 'Add New',
            paymentAlerts: 'Payment Alerts',
            noAlerts: 'No payment alerts at this time',
            families: 'Families',
            members: 'Members',
            expiryDate: 'Expiry Date',
            active: 'Active',
            expired: 'Expired',
            expiringSoonLabel: 'Expiring Soon',
            daysLeft: 'days left',
            daysOverdue: 'days overdue',
        },
        settings: {
            title: 'Settings',
            subtitle: 'Customize your experience and manage your data',
            appearance: 'Appearance',
            appearanceDesc: 'Customize the look and feel',
            theme: 'Theme',
            themeDesc: 'Choose your preferred color scheme',
            light: 'Light',
            dark: 'Dark',
            preferences: 'Preferences',
            preferencesDesc: 'Set your default preferences',
            currency: 'Currency',
            currencyDesc: 'Default currency for subscriptions',
            language: 'Language',
            languageDesc: 'App interface language',
            defaultReminder: 'Default Reminder',
            reminderDesc: 'Days before expiration to notify',
            days: 'days',
            dataManagement: 'Data Management',
            dataManagementDesc: 'Backup and restore your data',
            export: 'Export Backup',
            exportDesc: 'Download your data as JSON',
            import: 'Import Backup',
            importDesc: 'Restore from a backup file',
            unsavedChanges: 'You have unsaved changes',
            saveChanges: 'Save Changes',
            savedSuccess: 'Settings saved successfully!',
            emailReminders: 'Email Reminders',
            emailRemindersDesc: 'Get notified about upcoming payments',
            autoSendReminders: 'Auto Send Reminders',
            autoSendRemindersDesc: 'Automatically send email reminders',
            reminderEmail: 'Reminder Email',
            reminderEmailDesc: 'Email address for notifications',
            testEmail: 'Send Test Email',
            emailSent: 'Test email sent!',
        },
        common: {
            edit: 'Edit',
            delete: 'Delete',
            save: 'Save',
            cancel: 'Cancel',
            add: 'Add',
            confirm: 'Confirm',
            search: 'Search',
            filter: 'Filter',
            noData: 'No data available',
            loading: 'Loading...',
            perMonth: '/month',
        },
        members: {
            addMember: 'Add Member',
            editMember: 'Edit Member',
            name: 'Name',
            email: 'Email',
            paymentDate: 'Payment Date',
            amount: 'Amount',
            status: 'Status',
            paid: 'Paid',
            pending: 'Pending',
            overdue: 'Overdue',
        },
        families: {
            addFamily: 'Add Family',
            editFamily: 'Edit Family',
            familyName: 'Family Name',
            purchaseDate: 'Purchase Date',
            expirationDate: 'Expiration Date',
            notes: 'Notes',
            members: 'members',
            noMembers: 'No members in this family yet',
        },
    },
    vi: {
        nav: {
            dashboard: 'Tổng quan',
            subscriptions: 'Gói đăng ký',
            statistics: 'Thống kê',
            settings: 'Cài đặt',
        },
        dashboard: {
            title: 'Tổng quan',
            totalSubscriptions: 'Tổng subscription',
            monthlySpending: 'Chi phí/tháng',
            expiringSoon: 'Sắp hết hạn',
            totalMembers: 'Thành viên',
            subscriptionList: 'Danh sách đăng ký',
            recentSubscriptions: 'Đăng ký gần đây',
            viewAll: 'Xem tất cả',
            addNew: 'Thêm mới',
            paymentAlerts: 'Cảnh báo thanh toán',
            noAlerts: 'Không có cảnh báo thanh toán',
            families: 'Gia đình',
            members: 'Thành viên',
            expiryDate: 'Ngày hết hạn',
            active: 'Hoạt động',
            expired: 'Đã hết hạn',
            expiringSoonLabel: 'Sắp hết hạn',
            daysLeft: 'ngày còn lại',
            daysOverdue: 'ngày quá hạn',
        },
        settings: {
            title: 'Cài đặt',
            subtitle: 'Tùy chỉnh trải nghiệm và quản lý dữ liệu',
            appearance: 'Giao diện',
            appearanceDesc: 'Tùy chỉnh giao diện ứng dụng',
            theme: 'Chủ đề',
            themeDesc: 'Chọn giao diện sáng hoặc tối',
            light: 'Sáng',
            dark: 'Tối',
            preferences: 'Tùy chọn',
            preferencesDesc: 'Thiết lập mặc định',
            currency: 'Tiền tệ',
            currencyDesc: 'Đơn vị tiền tệ mặc định',
            language: 'Ngôn ngữ',
            languageDesc: 'Ngôn ngữ hiển thị',
            defaultReminder: 'Nhắc nhở mặc định',
            reminderDesc: 'Số ngày trước khi hết hạn để thông báo',
            days: 'ngày',
            dataManagement: 'Quản lý dữ liệu',
            dataManagementDesc: 'Sao lưu và khôi phục dữ liệu',
            export: 'Xuất dữ liệu',
            exportDesc: 'Tải xuống dữ liệu dạng JSON',
            import: 'Nhập dữ liệu',
            importDesc: 'Khôi phục từ file sao lưu',
            unsavedChanges: 'Bạn có thay đổi chưa lưu',
            saveChanges: 'Lưu thay đổi',
            savedSuccess: 'Đã lưu cài đặt thành công!',
            emailReminders: 'Nhắc nhở qua Email',
            emailRemindersDesc: 'Nhận thông báo về thanh toán sắp tới',
            autoSendReminders: 'Tự động gửi nhắc nhở',
            autoSendRemindersDesc: 'Tự động gửi email nhắc nhở',
            reminderEmail: 'Email nhận thông báo',
            reminderEmailDesc: 'Địa chỉ email nhận thông báo',
            testEmail: 'Gửi email test',
            emailSent: 'Đã gửi email test!',
        },
        common: {
            edit: 'Sửa',
            delete: 'Xóa',
            save: 'Lưu',
            cancel: 'Hủy',
            add: 'Thêm',
            confirm: 'Xác nhận',
            search: 'Tìm kiếm',
            filter: 'Lọc',
            noData: 'Không có dữ liệu',
            loading: 'Đang tải...',
            perMonth: '/tháng',
        },
        members: {
            addMember: 'Thêm thành viên',
            editMember: 'Sửa thành viên',
            name: 'Tên',
            email: 'Email',
            paymentDate: 'Ngày thanh toán',
            amount: 'Số tiền',
            status: 'Trạng thái',
            paid: 'Đã thanh toán',
            pending: 'Đang chờ',
            overdue: 'Quá hạn',
        },
        families: {
            addFamily: 'Thêm gia đình',
            editFamily: 'Sửa gia đình',
            familyName: 'Tên gia đình',
            purchaseDate: 'Ngày mua',
            expirationDate: 'Ngày hết hạn',
            notes: 'Ghi chú',
            members: 'thành viên',
            noMembers: 'Chưa có thành viên trong gia đình này',
        },
    },
};

// Get translation function
export const getTranslation = (language: Language): Translations => {
    return translations[language] || translations.en;
};
