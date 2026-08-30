import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { User } from '@/lib/api/types';

// Web port of the mobile app's zustand auth store. Persists to localStorage
// (mobile persists to AsyncStorage) so the axios interceptor can read the token
// synchronously via useAuthStore.getState().

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  /** Called after verifyOtp/register/login return an accessToken + user. */
  setSession: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

// SSR-safe: on the server there is no localStorage, so persist gets a noop.
const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setSession: (token, user) => set({ token, user, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'servesaathi-auth',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : noopStorage
      ),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
