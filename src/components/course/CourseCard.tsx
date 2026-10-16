import { Link } from 'react-router-dom';
import { Clock, Star, BookOpen } from 'lucide-react';
import type { Course, Difficulty } from '../../lib/types';
import { formatDuration, formatNumber } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';

export const difficultyBadgeClass: Record<Difficulty, string> = {
  BEGINNER: 'border-green-500/30 bg-green-500/15 text-green-300',
  INTERMEDIATE: 'border-amber-500/30 bg-amber-500/15 text-amber-300',
  ADVANCED: 'border-red-500/30 bg-red-500/15 text-red-300',
};

export const difficultyLabel: Record<Difficulty, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      to={`/course/${course.slug}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`View ${course.title}`}
    >
      <Card className="h-full gap-0 overflow-hidden border-white/5 bg-surface-light pt-0 text-white ring-white/5 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-primary-500/40 group-hover:shadow-lg group-hover:shadow-primary-500/10">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          <Badge
            variant="outline"
            className={`absolute left-3 top-3 backdrop-blur-sm ${difficultyBadgeClass[course.difficulty]}`}
          >
            {difficultyLabel[course.difficulty]}
          </Badge>

          <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 text-xs text-white/90 backdrop-blur-sm">
            <Clock className="h-3 w-3" />
            {formatDuration(course.totalDurationSec)}
          </span>
        </div>

        <CardContent className="space-y-3 pt-4">
          <div>
            <h3 className="line-clamp-2 font-semibold text-white transition-colors group-hover:text-primary-300">
              {course.title}
            </h3>
            <p className="mt-1 text-sm text-white/50">{course.instructor}</p>
          </div>

          <p className="line-clamp-2 text-xs text-white/40">{course.description}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/5 pt-3 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {course.lessonCount} lessons
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {course.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              {formatNumber(course.enrolledCount)} enrolled
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {course.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/40"
              >
                {tag}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
