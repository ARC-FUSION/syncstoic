/**
 * Core type definitions for SyncFocus LMS
 */

export type UserRole = 'student' | 'instructor' | 'admin';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type SortOption = 'newest' | 'popular' | 'duration';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  instructor: string;
  difficulty: Difficulty;
  tags: string[];
  modules: Module[];
  lessonCount: number;
  totalDuration: number;
  createdAt: string;
  enrollCount: number;
}

export interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  youtubeVideoId: string;
  title: string;
  durationSec: number;
  order: number;
  isPreview: boolean;
  isCompleted: boolean;
}

export interface Enrollment {
  userId: string;
  courseId: string;
  enrolledAt: string;
  progress: number;
}

export interface Progress {
  lessonId: string;
  watchedSec: number;
  lastPositionSec: number;
  isCompleted: boolean;
}

export interface CourseFilters {
  query?: string;
  difficulty?: Difficulty;
  tag?: string;
  sort?: SortOption;
}
