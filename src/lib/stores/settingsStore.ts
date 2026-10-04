import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  pomodoro: {
    workDuration: number; // minutes
    breakDuration: number; // minutes
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
  };
  focus: {
    autoPauseOnTabSwitch: boolean;
    trackDistractions: boolean;
  };
  player: {
    defaultPlaybackSpeed: number;
    autoHideControls: boolean;
  };
  theme: 'light' | 'dark' | 'system';

  updatePomodoro: (updates: Partial<SettingsState['pomodoro']>) => void;
  updateFocus: (updates: Partial<SettingsState['focus']>) => void;
  updatePlayer: (updates: Partial<SettingsState['player']>) => void;
  setTheme: (theme: SettingsState['theme']) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      pomodoro: {
        workDuration: 25,
        breakDuration: 5,
        autoStartBreaks: true,
        autoStartPomodoros: false,
      },
      focus: {
        autoPauseOnTabSwitch: true,
        trackDistractions: true,
      },
      player: {
        defaultPlaybackSpeed: 1,
        autoHideControls: true,
      },
      theme: 'dark',

      updatePomodoro: (updates) =>
        set((state) => ({
          pomodoro: { ...state.pomodoro, ...updates },
        })),

      updateFocus: (updates) =>
        set((state) => ({
          focus: { ...state.focus, ...updates },
        })),

      updatePlayer: (updates) =>
        set((state) => ({
          player: { ...state.player, ...updates },
        })),

      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'syncfocus-settings',
    }
  )
);
