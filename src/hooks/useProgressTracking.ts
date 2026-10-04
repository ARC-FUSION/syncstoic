import { useState, useEffect, useCallback, useRef } from 'react';

interface ProgressEntry {
  lessonId: string;
  courseId: string;
  currentTime: number;
  duration: number;
  completed: boolean;
  lastUpdated: number;
}

interface ProgressStore {
  [key: string]: ProgressEntry;
}

const STORAGE_KEY = 'syncfocus_progress';
const HEARTBEAT_INTERVAL = 15000; // 15 seconds

export function useProgressTracking(courseId: string, lessonId: string | null) {
  const [store, setStore] = useState<ProgressStore>({});
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSavedRef = useRef<number>(0);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setStore(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load progress:', e);
    }
  }, []);

  // Save to localStorage
  const saveToStorage = useCallback((data: ProgressStore) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  }, []);

  // Update progress
  const updateProgress = useCallback((currentTime: number, duration: number) => {
    if (!lessonId) return;

    const now = Date.now();
    const completed = duration > 0 && currentTime >= duration * 0.95;

    setStore(prev => {
      const key = `${courseId}:${lessonId}`;
      const updated = {
        ...prev,
        [key]: {
          lessonId,
          courseId,
          currentTime,
          duration,
          completed,
          lastUpdated: now,
        }
      };
      
      // Save every heartbeat interval
      if (now - lastSavedRef.current >= HEARTBEAT_INTERVAL || completed) {
        saveToStorage(updated);
        lastSavedRef.current = now;
      }
      
      return updated;
    });
  }, [courseId, lessonId, saveToStorage]);

  // Start heartbeat
  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) return;
    heartbeatRef.current = setInterval(() => {
      // Force save on heartbeat
      setStore(prev => {
        saveToStorage(prev);
        lastSavedRef.current = Date.now();
        return prev;
      });
    }, HEARTBEAT_INTERVAL);
  }, [saveToStorage]);

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    // Final save
    setStore(prev => {
      saveToStorage(prev);
      return prev;
    });
  }, [saveToStorage]);

  // Get progress for a specific lesson
  const getLessonProgress = useCallback((cId: string, lId: string): ProgressEntry | null => {
    const key = `${cId}:${lId}`;
    return store[key] || null;
  }, [store]);

  // Get course progress
  const getCourseProgress = useCallback((cId: string): { completed: number; total: number; percent: number } => {
    const entries = Object.values(store).filter(e => e.courseId === cId);
    const completed = entries.filter(e => e.completed).length;
    return { completed, total: entries.length, percent: entries.length > 0 ? Math.round((completed / entries.length) * 100) : 0 };
  }, [store]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopHeartbeat();
    };
  }, [stopHeartbeat]);

  return {
    store,
    updateProgress,
    startHeartbeat,
    stopHeartbeat,
    getLessonProgress,
    getCourseProgress,
  };
}

// Helper to get resume position for a lesson
export function getResumePosition(courseId: string, lessonId: string): number {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return 0;
    const store: ProgressStore = JSON.parse(saved);
    const key = `${courseId}:${lessonId}`;
    const entry = store[key];
    if (!entry || entry.completed) return 0;
    // Resume from 3 seconds before current position
    return Math.max(0, entry.currentTime - 3);
  } catch {
    return 0;
  }
}
