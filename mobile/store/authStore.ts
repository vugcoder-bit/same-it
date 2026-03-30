import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: number;
    username: string;
    role: 'ADMIN' | 'USER';
}

interface AuthState {
    token: string | null;
    user: User | null;
    _hasHydrated: boolean;
    isDeviceSynced: boolean;
    setHasHydrated: (state: boolean) => void;
    setAuth: (token: string, user: User) => void;
    setIsDeviceSynced: (state: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            _hasHydrated: false,
            isDeviceSynced: false,
            setHasHydrated: (state) => set({ _hasHydrated: state }),
            setAuth: (token, user) => set({ token, user, isDeviceSynced: false }),
            setIsDeviceSynced: (state) => set({ isDeviceSynced: state }),
            logout: () => set({ token: null, user: null, isDeviceSynced: false }),
        }),
        {
            name: 'sameit-auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
