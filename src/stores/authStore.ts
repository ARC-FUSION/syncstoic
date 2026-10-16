import { create } from 'zustand';
import type { User } from '../lib/types';

export type { User };

const STORAGE_KEY = 'syncfocus_user';
const MOCK_DELAY_MS = 600;

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
  register: (name: string, email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  updateUser: (updates: Partial<User>) => void;
}

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

function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const hasRequiredFields =
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string' &&
    (candidate.role === 'STUDENT' ||
      candidate.role === 'INSTRUCTOR' ||
      candidate.role === 'ADMIN');
  const hasValidAvatar =
    candidate.avatarUrl === undefined || typeof candidate.avatarUrl === 'string';
  return hasRequiredFields && hasValidAvatar;
}

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    return isUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredUser(user: User): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {}
}

function removeStoredUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export const useAuthStore = create<AuthState>()((set, get) => ({
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
    writeStoredUser(user);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    removeStoredUser();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  hydrate: () => {
    const user = readStoredUser();
    set({ user, isAuthenticated: user !== null, isLoading: false });
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
    writeStoredUser(user);
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
    writeStoredUser(user);
    set({ user, isAuthenticated: true, isLoading: false });
    return user;
  },

  updateUser: (updates: Partial<User>) => {
    const current = get().user;
    if (current === null) {
      return;
    }
    const next: User = { ...current, ...updates };
    writeStoredUser(next);
    set({ user: next });
  },
}));

useAuthStore.getState().hydrate();
