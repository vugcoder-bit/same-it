import { useLocaleStore } from '@/store/localeStore';

/**
 * Returns a style object with the Arabic font applied when the current language is Arabic.
 * Usage: <Text style={[styles.text, arabicFont]}>...</Text>
 */
export function useArabicFont() {
    const language = useLocaleStore(state => state.language);
    const arabicFont = language === 'ar' ? { fontFamily: 'CoconNextArabic' } : {};
    return { arabicFont, isArabic: language === 'ar' };
}
