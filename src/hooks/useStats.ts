import { useEffect, useState } from 'react';
import { seedCourses } from '../lib/data/seed';
import { readEnrollments, readProgress } from '../lib/progress';

export interface DashboardStats {
  totalMinutes: number;
  streak: number;
  lessonsCompleted: number;
  coursesInProgress: number;
}

const EMPTY_STATS: DashboardStats = {
  totalMinutes: 0,
  streak: 0,
  lessonsCompleted: 0,
  coursesInProgress: 0,
};

function computeStats(): DashboardStats {
  const enrollments = readEnrollments();
  const progress = readProgress();
  const entries = Object.values(progress);

  let totalSeconds = 0;
  let lessonsCompleted = 0;
  let watchedToday = false;
  const today = new Date().toDateString();

  for (const entry of entries) {
    totalSeconds += entry.positionSec;
    if (entry.isCompleted) lessonsCompleted += 1;
    if (entry.timestamp && new Date(entry.timestamp).toDateString() === today) {
      watchedToday = true;
    }
  }

  const enrolledCourses = seedCourses.filter((course) => enrollments[course.id]);
  let coursesInProgress = 0;
  for (const course of enrolledCourses) {
    const completed = entries.filter(
      (entry) => entry.courseId === course.id && entry.isCompleted
    ).length;
    if (completed > 0 && completed < course.lessonCount) coursesInProgress += 1;
  }

  return {
    totalMinutes: Math.floor(totalSeconds / 60),
    streak: watchedToday ? 1 : 0,
    lessonsCompleted,
    coursesInProgress,
  };
}

export function useStats() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setStats(computeStats());
    setIsLoading(false);
  }, []);

  return { stats, isLoading };
}
