import type { Enrollment } from './types';

export const ENROLLMENT_KEY = 'syncfocus_enrollments';
export const PROGRESS_KEY = 'syncfocus_progress';

export interface ProgressEntry {
  lessonId: string;
  courseId: string;
  positionSec: number;
  durationSec: number;
  isCompleted: boolean;
  timestamp: number;
}

export type ProgressStore = Record<string, ProgressEntry>;
export type EnrollmentMap = Record<string, Enrollment>;

interface RawProgressEntry {
  lessonId?: string;
  courseId?: string;
  positionSec?: number;
  lastPositionSec?: number;
  watchedSec?: number;
  durationSec?: number;
  isCompleted?: boolean;
  timestamp?: number;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeEntry(key: string, raw: RawProgressEntry): ProgressEntry {
  const [keyCourseId, keyLessonId] = key.split('::');
  return {
    courseId: raw.courseId ?? keyCourseId ?? '',
    lessonId: raw.lessonId ?? keyLessonId ?? '',
    positionSec: raw.positionSec ?? raw.lastPositionSec ?? raw.watchedSec ?? 0,
    durationSec: raw.durationSec ?? 0,
    isCompleted: raw.isCompleted ?? false,
    timestamp: raw.timestamp ?? 0,
  };
}

export function readEnrollments(): EnrollmentMap {
  return readJson<EnrollmentMap>(ENROLLMENT_KEY, {});
}

export function readProgress(): ProgressStore {
  const raw = readJson<Record<string, RawProgressEntry>>(PROGRESS_KEY, {});
  const store: ProgressStore = {};
  for (const [key, entry] of Object.entries(raw)) {
    store[key] = normalizeEntry(key, entry);
  }
  return store;
}

export function latestEntry(entries: ProgressEntry[]): ProgressEntry | undefined {
  return entries.reduce<ProgressEntry | undefined>((latest, entry) => {
    if (!latest) return entry;
    return entry.timestamp >= latest.timestamp ? entry : latest;
  }, undefined);
}
