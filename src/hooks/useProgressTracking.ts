import { useState, useEffect, useRef, useCallback } from 'react';
import { ProgressEntry, ProgressStore } from '../types/player';

const STORAGE_KEY = 'syncfocus_progress';
const HEARTBEAT_INTERVAL_MS = 15000; // 15 seconds
const COMPLETION_THRESHOLD_SEC = 3; // Complete when within 3s of end
const RESUME_MIN_SEC = 5; // Only resume if past 5 seconds
const RESUME_MAX_FROM_END_SEC = 10; // Don't resume if within 10s of end

/** Load progress store from localStorage */
function loadStore(): ProgressStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProgressStore;
  } catch {
    return {};
  }
}

/** Save progress store to localStorage */
function saveStore(store: ProgressStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

/** Generate a unique key for a course+lesson combo */
function makeKey(courseId: string, lessonId: string): string {
  return `${courseId}::${lessonId}`;
}

/**
 * Get the resume position for a lesson.
 * Returns 0 if no valid resume point exists.
 */
export function getResumePosition(courseId: string, lessonId: string): number {
  const store = loadStore();
  const key = makeKey(courseId, lessonId);
  const entry = store[key];

  if (!entry) return 0;
  if (entry.isCompleted) return 0;
  if (entry.currentTimeSec < RESUME_MIN_SEC) return 0;
  if (entry.durationSec > 0 && entry.currentTimeSec > entry.durationSec - RESUME_MAX_FROM_END_SEC) return 0;

  return entry.currentTimeSec;
}

/**
 * Check if a lesson is marked as completed.
 */
export function isLessonCompleted(courseId: string, lessonId: string): boolean {
  const store = loadStore();
  const key = makeKey(courseId, lessonId);
  return store[key]?.isCompleted ?? false;
}

interface UseProgressTrackingOptions {
  courseId: string;
  lessonId: string;
  enabled: boolean;
}

interface UseProgressTrackingReturn {
  /** Current saved progress entry (if any) */
  entry: ProgressEntry | null;
  /** Whether the lesson is completed */
  isCompleted: boolean;
  /** Whether tracking is active */
  isActive: boolean;
  /** Manually save current progress */
  save: () => void;
  /** Mark lesson as completed */
  markCompleted: () => void;
  /** Clear progress for this lesson */
  clearProgress: () => void;
}

export function useProgressTracking(
  currentTime: number,
  duration: number,
  { courseId, lessonId, enabled }: UseProgressTrackingOptions
): UseProgressTrackingReturn {
  const [entry, setEntry] = useState<ProgressEntry | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const lastSavedTimeRef = useRef<number>(0);

  // Load initial entry
  useEffect(() => {
    const store = loadStore();
    const key = makeKey(courseId, lessonId);
    setEntry(store[key] ?? null);
  }, [courseId, lessonId]);

  // Heartbeat: save progress every 15 seconds
  useEffect(() => {
    if (!enabled || !lessonId || duration <= 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      // Only save if time has actually changed
      if (Math.abs(currentTime - lastSavedTimeRef.current) < 0.5) return;

      const isCompleted = currentTime >= duration - COMPLETION_THRESHOLD_SEC;
      const newEntry: ProgressEntry = {
        lessonId,
        courseId,
        currentTimeSec: currentTime,
        durationSec: duration,
        isCompleted,
        lastUpdated: now,
      };

      const store = loadStore();
      const key = makeKey(courseId, lessonId);
      store[key] = newEntry;
      saveStore(store);

      setEntry(newEntry);
      lastSavedTimeRef.current = currentTime;
      lastSaveTimeRef.current = now;
    }, HEARTBEAT_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [enabled, lessonId, courseId, currentTime, duration]);

  // Save on unmount or when video ends
  useEffect(() => {
    return () => {
      if (!enabled || !lessonId || duration <= 0 || currentTime <= 0) return;

      const isCompleted = currentTime >= duration - COMPLETION_THRESHOLD_SEC;
      const newEntry: ProgressEntry = {
        lessonId,
        courseId,
        currentTimeSec: currentTime,
        durationSec: duration,
        isCompleted,
        lastUpdated: Date.now(),
      };

      const store = loadStore();
      const key = makeKey(courseId, lessonId);
      store[key] = newEntry;
      saveStore(store);
    };
  }, [enabled, lessonId, courseId, currentTime, duration]);

  const save = useCallback(() => {
    if (!lessonId || duration <= 0 || currentTime <= 0) return;

    const isCompleted = currentTime >= duration - COMPLETION_THRESHOLD_SEC;
    const newEntry: ProgressEntry = {
      lessonId,
      courseId,
      currentTimeSec: currentTime,
      durationSec: duration,
      isCompleted,
      lastUpdated: Date.now(),
    };

    const store = loadStore();
    const key = makeKey(courseId, lessonId);
    store[key] = newEntry;
    saveStore(store);
    setEntry(newEntry);
  }, [lessonId, courseId, currentTime, duration]);

  const markCompleted = useCallback(() => {
    const newEntry: ProgressEntry = {
      lessonId,
      courseId,
      currentTimeSec: duration,
      durationSec: duration,
      isCompleted: true,
      lastUpdated: Date.now(),
    };

    const store = loadStore();
    const key = makeKey(courseId, lessonId);
    store[key] = newEntry;
    saveStore(store);
    setEntry(newEntry);
  }, [lessonId, courseId, duration]);

  const clearProgress = useCallback(() => {
    const store = loadStore();
    const key = makeKey(courseId, lessonId);
    delete store[key];
    saveStore(store);
    setEntry(null);
  }, [courseId, lessonId]);

  return {
    entry,
    isCompleted: entry?.isCompleted ?? false,
    isActive: enabled,
    save,
    markCompleted,
    clearProgress,
  };
}

/**
 * Get overall course progress (percentage of completed lessons).
 */
export function getCourseProgress(courseId: string, lessonIds: string[]): number {
  if (lessonIds.length === 0) return 0;
  const store = loadStore();
  const completed = lessonIds.filter(id => {
    const key = makeKey(courseId, id);
    return store[key]?.isCompleted ?? false;
  }).length;
  return Math.round((completed / lessonIds.length) * 100);
}
