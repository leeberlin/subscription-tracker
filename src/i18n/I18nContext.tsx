import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translations, getTranslation } from './translations';

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        // Get from settings in localStorage
        try {
            const settings = localStorage.getItem('subscription-tracker-settings');
            if (settings) {
                const parsed = JSON.parse(settings);
                return (parsed.language as Language) || 'en';
            }
        } catch {
            // ignore
        }
        return 'en';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        // Also update settings
        try {
            const settings = localStorage.getItem('subscription-tracker-settings');
            const parsed = settings ? JSON.parse(settings) : {};
            parsed.language = lang;
            localStorage.setItem('subscription-tracker-settings', JSON.stringify(parsed));
        } catch {
            // ignore
        }
    };

    // Listen for settings changes
    useEffect(() => {
        const handleStorageChange = () => {
            try {
                const settings = localStorage.getItem('subscription-tracker-settings');
                if (settings) {
                    const parsed = JSON.parse(settings);
                    if (parsed.language && parsed.language !== language) {
                        setLanguageState(parsed.language as Language);
                    }
                }
            } catch {
                // ignore
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Also check periodically for same-tab changes
        const interval = setInterval(handleStorageChange, 500);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [language]);

    const t = getTranslation(language);

    return (
        <I18nContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = (): I18nContextType => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
};
