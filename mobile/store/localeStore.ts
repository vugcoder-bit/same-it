import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'en' | 'ar';

interface LocaleState {
    language: Language;
    _hasHydrated: boolean;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
    setHasHydrated: (state: boolean) => void;
}

export const useLocaleStore = create<LocaleState>()(
    persist(
        (set) => ({
            language: 'ar',
            _hasHydrated: false,
            setLanguage: (lang) => set({ language: lang }),
            toggleLanguage: () => set((state) => ({ language: state.language === 'en' ? 'ar' : 'en' })),
            setHasHydrated: (state) => set({ _hasHydrated: state }),
        }),
        {
            name: 'locale-storage',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: (state) => {
                return () => {
                   state?.setHasHydrated(true);
                };
            },
        }
    )
);
