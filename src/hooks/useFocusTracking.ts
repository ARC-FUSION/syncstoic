import { useState, useEffect, useRef, useCallback } from 'react';
import { useSettingsStore } from '../lib/stores/settingsStore';

interface FocusStats {
  totalWatchTime: number; // seconds of focused watching
  distractions: number; // number of tab switches
  focusScore: number; // percentage of time focused
  sessionStart: number;
}

interface UseFocusTrackingOptions {
  isPlaying: boolean;
  onTabHidden?: () => void;
  onTabVisible?: () => void;
}

interface UseFocusTrackingReturn {
  stats: FocusStats;
  isTabVisible: boolean;
  resetStats: () => void;
}

export function useFocusTracking(
  { isPlaying, onTabHidden, onTabVisible }: UseFocusTrackingOptions
): UseFocusTrackingReturn {
  const { focus } = useSettingsStore();
  const [stats, setStats] = useState<FocusStats>({
    totalWatchTime: 0,
    distractions: 0,
    focusScore: 100,
    sessionStart: Date.now(),
  });

  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);
  const watchTimeRef = useRef(0);
  const lastUpdateRef = useRef(Date.now());
  const onTabHiddenRef = useRef(onTabHidden);
  const onTabVisibleRef = useRef(onTabVisible);

  // Keep refs updated
  useEffect(() => {
    onTabHiddenRef.current = onTabHidden;
    onTabVisibleRef.current = onTabVisible;
  }, [onTabHidden, onTabVisible]);

  // Track watch time when playing and visible
  useEffect(() => {
    if (!isPlaying || !isTabVisible) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastUpdateRef.current) / 1000;
      watchTimeRef.current += elapsed;
      lastUpdateRef.current = now;

      setStats((prev) => {
        const totalTime = (now - prev.sessionStart) / 1000;
        const focusScore = totalTime > 0 ? (watchTimeRef.current / totalTime) * 100 : 100;
        return {
          ...prev,
          totalWatchTime: watchTimeRef.current,
          focusScore: Math.min(100, Math.max(0, focusScore)),
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isTabVisible]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsTabVisible(visible);
      lastUpdateRef.current = Date.now();

      if (!visible && isPlaying && focus.autoPauseOnTabSwitch) {
        onTabHiddenRef.current?.();
        setStats((prev) => ({
          ...prev,
          distractions: prev.distractions + 1,
        }));
      } else if (visible) {
        onTabVisibleRef.current?.();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying, focus.autoPauseOnTabSwitch]);

  const resetStats = useCallback(() => {
    watchTimeRef.current = 0;
    lastUpdateRef.current = Date.now();
    setStats({
      totalWatchTime: 0,
      distractions: 0,
      focusScore: 100,
      sessionStart: Date.now(),
    });
  }, []);

  return {
    stats,
    isTabVisible,
    resetStats,
  };
}
