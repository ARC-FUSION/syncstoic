/**
 * Utility functions for SyncFocus LMS
 */

import { cn } from 'cn';
import type { Course } from './types';

export { cn };

/**
 * Format duration in seconds to human-readable string
 * Examples:
 *   formatDuration(125) => "2:05"
 *   formatDuration(3930) => "1:05:30"
 *   formatDuration(7200) => "2:00:00"
 */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get YouTube thumbnail URL for a video ID
 * Returns the highest quality available thumbnail
 */
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

/**
 * Convert a string to a URL-friendly slug
 * Examples:
 *   slugify("React Fundamentals") => "react-fundamentals"
 *   slugify("Next.js 14: Masterclass") => "nextjs-14-masterclass"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Sum the duration of every lesson in every module of a course
 */
export function calculateCourseDuration(course: Course): number {
  return course.modules.reduce(
    (total, module) =>
      total + module.lessons.reduce((sum, lesson) => sum + lesson.durationSec, 0),
    0
  );
}

/**
 * Format a date string to relative time
 * Examples:
 *   formatRelativeTime("2024-01-15") => "2 months ago"
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

/**
 * Format a number with commas for readability
 * Examples:
 *   formatNumber(15420) => "15,420"
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Calculate course progress percentage
 */
export function calculateProgress(completedLessons: number, totalLessons: number): number {
  if (totalLessons === 0) return 0;
  return Math.round((completedLessons / totalLessons) * 100);
}
