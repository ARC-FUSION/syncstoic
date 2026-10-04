import { useEffect, useRef, useCallback } from 'react';

/**
 * Progress entry stored in localStorage
 */
export interface ProgressEntry {
  lessonId: string;
  courseId: string;
  positionSec: number;
  durationSec: number;
  isCompleted: boolean;
  timestamp: number;
}

/**
 * Progress store shape
 */
export type ProgressStore = Record<string, ProgressEntry>;

const STORAGE_KEY = 'syncfocus_progress';
const HEARTBEAT_INTERVAL_MS = 15000; // 15 seconds
const COMPLETION_THRESHOLD = 0.9; // 90% of duration = complete
const RESUME_MIN_SEC = 5; // Only resume if past 5 seconds
const RESUME_MAX_FROM_END_SEC = 10; // Don't resume if within 10s of end

/**
 * Load progress store from localStorage
 */
function loadStore(): ProgressStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProgressStore;
  } catch {
    return {};
  }
}

/**
 * Save progress store to localStorage
 */
function saveStore(store: ProgressStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

/**
 * Generate storage key for a lesson
 */
function makeKey(courseId: string, lessonId: string): string {
  return `${courseId}::${lessonId}`;
}

/**
 * Hook options
 */
interface UseProgressSyncOptions {
  courseId: string;
  lessonId: string;
  currentTime: number;
  duration: number;
  enabled: boolean;
}

/**
 * Hook return type
 */
interface UseProgressSyncReturn {
  isCompleted: boolean;
  save: () => void;
  markCompleted: () => void;
}

/**
 * Progress Sync Hook
 *
 * Saves progress to localStorage every 15 seconds while playing.
 * Marks lesson complete when 90% watched.
 * Provides helpers to get resume position and completion status.
 */
export function useProgressSync({
  courseId,
  lessonId,
  currentTime,
  duration,
  enabled,
}: UseProgressSyncOptions): UseProgressSyncReturn {
  const lastSaveTimeRef = useRef<number>(0);
  const lastSavedPositionRef = useRef<number>(0);

  /**
   * Save current progress to localStorage
   */
  const save = useCallback(() => {
    if (!lessonId || duration <= 0 || currentTime <= 0) return;

    const isCompleted = currentTime >= duration * COMPLETION_THRESHOLD;
    const entry: ProgressEntry = {
      lessonId,
      courseId,
      positionSec: currentTime,
      durationSec: duration,
      isCompleted,
      timestamp: Date.now(),
    };

    const store = loadStore();
    const key = makeKey(courseId, lessonId);
    store[key] = entry;
    saveStore(store);
  }, [lessonId, courseId, currentTime, duration]);

  /**
   * Mark lesson as completed
   */
  const markCompleted = useCallback(() => {
    const entry: ProgressEntry = {
      lessonId,
      courseId,
      positionSec: duration,
      durationSec: duration,
      isCompleted: true,
      timestamp: Date.now(),
    };

    const store = loadStore();
    const key = makeKey(courseId, lessonId);
    store[key] = entry;
    saveStore(store);
  }, [lessonId, courseId, duration]);

  /**
   * Heartbeat: save every 15 seconds
   */
  useEffect(() => {
    if (!enabled || !lessonId || duration <= 0) return;

    const interval = setInterval(() => {
      const now = Date.now();

      // Only save if position has changed significantly
      if (Math.abs(currentTime - lastSavedPositionRef.current) < 0.5) return;

      save();
      lastSavedPositionRef.current = currentTime;
      lastSaveTimeRef.current = now;
    }, HEARTBEAT_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [enabled, lessonId, courseId, currentTime, duration, save]);

  /**
   * Save on unmount
   */
  useEffect(() => {
    return () => {
      if (!enabled || !lessonId || duration <= 0 || currentTime <= 0) return;
      save();
    };
  }, [enabled, lessonId, courseId, currentTime, duration, save]);

  // Check if completed
  const store = loadStore();
  const key = makeKey(courseId, lessonId);
  const isCompleted = store[key]?.isCompleted ?? false;

  return {
    isCompleted,
    save,
    markCompleted,
  };
}

/**
 * Get resume position for a lesson
 *
 * Returns the position to seek to on load.
 * Returns 0 if:
 * - No saved progress
 * - Lesson is completed
 * - Position < 5s (too early to resume)
 * - Position > duration - 10s (too close to end)
 */
export function getResumePosition(courseId: string, lessonId: string): number {
  const store = loadStore();
  const key = makeKey(courseId, lessonId);
  const entry = store[key];

  if (!entry) return 0;
  if (entry.isCompleted) return 0;
  if (entry.positionSec < RESUME_MIN_SEC) return 0;
  if (entry.durationSec > 0 && entry.positionSec > entry.durationSec - RESUME_MAX_FROM_END_SEC) {
    return 0;
  }

  return entry.positionSec;
}

/**
 * Check if a lesson is completed
 */
export function isLessonCompleted(courseId: string, lessonId: string): boolean {
  const store = loadStore();
  const key = makeKey(courseId, lessonId);
  return store[key]?.isCompleted ?? false;
}

/**
 * Get course progress percentage
 */
export function getCourseProgress(courseId: string, lessonIds: string[]): number {
  if (lessonIds.length === 0) return 0;
  const store = loadStore();
  const completed = lessonIds.filter((id) => {
    const key = makeKey(courseId, id);
    return store[key]?.isCompleted ?? false;
  }).length;
  return Math.round((completed / lessonIds.length) * 100);
}
