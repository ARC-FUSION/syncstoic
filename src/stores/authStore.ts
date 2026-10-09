import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

export type { User };

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const MOCK_DELAY_MS = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function displayNameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? 'Learner';
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, _password: string) => {
        set({ isLoading: true });
        await delay(MOCK_DELAY_MS);
        const user: User = {
          id: createId(),
          name: displayNameFromEmail(email) || 'Learner',
          email,
          role: 'STUDENT',
        };
        set({ user, isAuthenticated: true, isLoading: false });
        return user;
      },

      register: async (name: string, email: string, _password: string) => {
        set({ isLoading: true });
        await delay(MOCK_DELAY_MS);
        const user: User = {
          id: createId(),
          name: name.trim() || displayNameFromEmail(email) || 'Learner',
          email,
          role: 'STUDENT',
        };
        set({ user, isAuthenticated: true, isLoading: false });
        return user;
      },

      loginWithGoogle: async () => {
        set({ isLoading: true });
        await delay(MOCK_DELAY_MS);
        const user: User = {
          id: createId(),
          name: 'Google User',
          email: 'user@gmail.com',
          avatarUrl:
            'https://ui-avatars.com/api/?name=Google+User&background=6366f1&color=fff',
          role: 'STUDENT',
        };
        set({ user, isAuthenticated: true, isLoading: false });
        return user;
      },

      logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),

      updateUser: (updates: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'syncfocus_user',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
