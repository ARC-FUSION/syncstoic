import { useCallback, useEffect, useState } from 'react';
import type { Enrollment, Progress } from '../lib/types';

const ENROLLMENT_KEY = 'syncfocus_enrollments';
const PROGRESS_KEY = 'syncfocus_progress';

type EnrollmentMap = Record<string, Enrollment>;
type ProgressMap = Record<string, Progress>;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function progressKey(courseId: string, lessonId: string): string {
  return `${courseId}::${lessonId}`;
}

export function useEnrollment() {
  const [enrollments, setEnrollments] = useState<EnrollmentMap>({});
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    setEnrollments(readJson<EnrollmentMap>(ENROLLMENT_KEY, {}));
    setProgress(readJson<ProgressMap>(PROGRESS_KEY, {}));
  }, []);

  const isEnrolled = useCallback(
    (courseId: string) => Boolean(enrollments[courseId]),
    [enrollments]
  );

  const enroll = useCallback((courseId: string) => {
    setEnrollments((prev) => {
      if (prev[courseId]) return prev;
      const next: EnrollmentMap = {
        ...prev,
        [courseId]: {
          userId: 'local-user',
          courseId,
          enrolledAt: new Date().toISOString(),
          progress: 0,
        },
      };
      try {
        window.localStorage.setItem(ENROLLMENT_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  const isLessonCompleted = useCallback(
    (courseId: string, lessonId: string) =>
      Boolean(progress[progressKey(courseId, lessonId)]?.isCompleted),
    [progress]
  );

  const markLessonComplete = useCallback((courseId: string, lessonId: string) => {
    setProgress((prev) => {
      const key = progressKey(courseId, lessonId);
      const existing = prev[key];
      if (existing?.isCompleted) return prev;
      const next: ProgressMap = {
        ...prev,
        [key]: {
          lessonId,
          watchedSec: existing?.watchedSec ?? 0,
          lastPositionSec: existing?.lastPositionSec ?? 0,
          isCompleted: true,
        },
      };
      try {
        window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  return {
    enrollments,
    isEnrolled,
    enroll,
    progress,
    isLessonCompleted,
    markLessonComplete,
  };
}

export const enrollmentStorageKeys = { ENROLLMENT_KEY, PROGRESS_KEY };
