import { useEffect, useState } from 'react';
import { useLocaleStore } from '@/store/localeStore';

export function useLocale() {
    const { language, setLanguage, toggleLanguage, _hasHydrated } = useLocaleStore();
    const [translations, setTranslations] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!_hasHydrated) return;
        
        const loadTranslations = async () => {
            try {
                const locale = language === 'ar' ? require('@/locale/ar.json') : require('@/locale/en.json');
                setTranslations(locale);
            } catch (error) {
                console.error('Error loading translations:', error);
            }
        };

        loadTranslations();
    }, [language, _hasHydrated]);

    const t = (key: string): string => {
        return translations[key] || key;
    };

    return {
        language,
        setLanguage,
        t,
        toggleLanguage,
    };
}
