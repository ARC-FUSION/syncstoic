import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, Play } from 'lucide-react';
import { getCourseBySlug } from '../lib/data/seed';
import { formatDuration } from '../lib/utils';
import { Button } from '../components/ui/button';
import YouTubePlayer from '../components/player/YouTubePlayer';

export default function Learn() {
  const { courseSlug, lessonId } = useParams<{ courseSlug: string; lessonId: string }>();
  const course = courseSlug ? getCourseBySlug(courseSlug) : undefined;
  const lessons = course ? course.modules.flatMap((module) => module.lessons) : [];
  const lesson = lessons.find((item) => item.id === lessonId);

  if (!course || !lesson) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
          <BookOpen className="h-9 w-9 text-white/20" />
        </div>
        <h1 className="text-xl font-semibold text-white">Lesson not found</h1>
        <p className="max-w-sm text-sm text-white/40">
          This lesson doesn&apos;t exist or may have been removed.
        </p>
        <Button asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-16">
      <div className="sticky top-0 z-40 border-b border-white/5 bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            to="/dashboard"
            aria-label="Back to dashboard"
            className="rounded-lg p-2 transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft className="h-5 w-5 text-white/60" />
          </Link>
          <div className="min-w-0">
            <p className="truncate text-xs text-white/40">{course.title}</p>
            <h1 className="truncate text-sm font-semibold text-white">{lesson.title}</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <YouTubePlayer
            videoId={lesson.youtubeVideoId}
            courseId={course.id}
            lessonId={lesson.id}
            title={lesson.title}
          />

          <aside>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/40">
              Lessons
            </h2>
            <div className="space-y-1">
              {lessons.map((item) => {
                const active = item.id === lesson.id;
                return (
                  <Link
                    key={item.id}
                    to={`/learn/${course.slug}/${item.id}`}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                      active ? 'bg-primary-600/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
                      <Play
                        className={`ml-0.5 h-3.5 w-3.5 ${
                          active ? 'text-primary-300' : 'text-white/40'
                        }`}
                        fill="currentColor"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-sm ${
                          active ? 'text-primary-200' : 'text-white/80'
                        }`}
                      >
                        {item.title}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-white/40">
                        <Clock className="h-3 w-3" />
                        {formatDuration(item.durationSec)}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
