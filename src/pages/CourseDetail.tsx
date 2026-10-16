import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Clock,
  Users,
  Star,
  BookOpen,
  Lock,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import { getCourseBySlug } from '../lib/data/seed';
import type { Lesson, Module } from '../lib/types';
import { formatDuration, formatNumber } from '../lib/utils';
import { useEnrollment } from '../hooks/useEnrollment';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { difficultyBadgeClass, difficultyLabel } from '../components/course/CourseCard';
import { PageTransition } from '../components/ui/PageTransition';

function youtubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const course = useMemo(() => (slug ? getCourseBySlug(slug) : undefined), [slug]);
  const { isEnrolled, enroll, isLessonCompleted } = useEnrollment();

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
          <BookOpen className="h-9 w-9 text-white/20" />
        </div>
        <h1 className="text-xl font-semibold text-white">Course not found</h1>
        <p className="max-w-sm text-sm text-white/40">
          The course you're looking for doesn't exist or may have been removed.
        </p>
        <Button asChild>
          <Link to="/courses">
            <ArrowLeft className="h-4 w-4" />
            Back to catalog
          </Link>
        </Button>
      </div>
    );
  }

  const enrolled = isEnrolled(course.id);
  const firstLesson = course.modules[0]?.lessons[0];
  const completedCount = course.modules.reduce(
    (count, module) =>
      count + module.lessons.filter((lesson) => isLessonCompleted(course.id, lesson.id)).length,
    0
  );
  const progressPercent = course.lessonCount
    ? Math.round((completedCount / course.lessonCount) * 100)
    : 0;

  const instructorAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    course.instructor
  )}&background=6366f1&color=fff&bold=true`;

  const renderLesson = (lesson: Lesson, index: number) => {
    const locked = !lesson.isPreview && !enrolled;
    const completed = isLessonCompleted(course.id, lesson.id);

    const inner = (
      <>
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
          {completed ? (
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          ) : locked ? (
            <Lock className="h-4 w-4 text-white/30" />
          ) : (
            <Play className="ml-0.5 h-3.5 w-3.5 text-primary-300" fill="currentColor" />
          )}
        </span>

        <span className="min-w-0 flex-1 text-left">
          <span className="flex items-center gap-2">
            <span
              className={`truncate text-sm ${
                locked ? 'text-white/40' : completed ? 'text-white/70' : 'text-white/90'
              }`}
            >
              {index + 1}. {lesson.title}
            </span>
            {lesson.isPreview && (
              <Badge
                variant="outline"
                className="border-primary-500/30 bg-primary-500/10 text-primary-300"
              >
                Preview
              </Badge>
            )}
          </span>
          <span className="mt-0.5 flex items-center gap-1 text-xs text-white/40">
            <Clock className="h-3 w-3" />
            {formatDuration(lesson.durationSec)}
          </span>
        </span>
      </>
    );

    const className = `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
      locked
        ? 'cursor-not-allowed opacity-60'
        : 'hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
    }`;

    if (locked) {
      return (
        <div key={lesson.id} className={className} aria-disabled="true">
          {inner}
        </div>
      );
    }

    return (
      <a
        key={lesson.id}
        href={youtubeUrl(lesson.youtubeVideoId)}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={`Play ${lesson.title}`}
      >
        {inner}
      </a>
    );
  };

  const renderModule = (module: Module, moduleIndex: number) => (
    <AccordionItem key={module.id} value={module.id} className="border-white/5">
      <AccordionTrigger className="px-1 text-white hover:no-underline">
        <span className="flex flex-col items-start gap-1 text-left">
          <span className="text-sm font-semibold text-white">
            Module {moduleIndex + 1}: {module.title}
          </span>
          <span className="text-xs font-normal text-white/40">
            {module.lessons.length} lessons ·{' '}
            {formatDuration(
              module.lessons.reduce((sum, lesson) => sum + lesson.durationSec, 0)
            )}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-1">
          {module.lessons.map((lesson, index) => renderLesson(lesson, index))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-surface pb-28 lg:pb-0">
        {/* Top bar */}
        <div className="sticky top-0 z-40 border-b border-white/5 bg-surface/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
            <Link
              to="/courses"
              aria-label="Back to catalog"
              className="rounded-lg p-2 transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ArrowLeft className="h-5 w-5 text-white/60" />
            </Link>
            <h1 className="truncate text-sm font-semibold text-white">{course.title}</h1>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
            {/* Main column */}
            <div className="space-y-8">
              {/* Hero */}
              <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface-light">
                <div className="relative aspect-video">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <Badge
                    variant="outline"
                    className={`absolute left-4 top-4 backdrop-blur-sm ${
                      difficultyBadgeClass[course.difficulty]
                    }`}
                  >
                    {difficultyLabel[course.difficulty]}
                  </Badge>
                </div>

                <div className="space-y-4 p-5 sm:p-6">
                  <h2 className="text-2xl font-bold text-white sm:text-3xl">{course.title}</h2>
                  <p className="text-sm leading-relaxed text-white/60 sm:text-base">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-3">
                    <img
                      src={instructorAvatar}
                      alt={course.instructor}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <p className="text-xs text-white/40">Instructor</p>
                      <p className="text-sm font-medium text-white">{course.instructor}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4 sm:grid-cols-4">
                    <Stat icon={<BookOpen className="h-4 w-4" />} label="Lessons" value={String(course.lessonCount)} />
                    <Stat
                      icon={<Clock className="h-4 w-4" />}
                      label="Duration"
                      value={formatDuration(course.totalDurationSec)}
                    />
                    <Stat
                      icon={<Users className="h-4 w-4" />}
                      label="Enrolled"
                      value={formatNumber(course.enrolledCount)}
                    />
                    <Stat
                      icon={<Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                      label="Rating"
                      value={course.rating.toFixed(1)}
                    />
                  </div>
                </div>
              </div>

              {/* Curriculum */}
              <div>
                <h3 className="mb-3 text-lg font-semibold text-white">Course Content</h3>
                <Card className="border-white/5 bg-surface-light px-4 text-white ring-white/5 sm:px-5">
                  <Accordion
                    type="multiple"
                    defaultValue={course.modules[0] ? [course.modules[0].id] : []}
                    className="w-full"
                  >
                    {course.modules.map((module, index) => renderModule(module, index))}
                  </Accordion>
                </Card>
              </div>
            </div>

            {/* Sidebar (desktop) */}
            <aside className="hidden lg:block">
              <Card className="sticky top-24 border-white/5 bg-surface-light text-white ring-white/5">
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-white">Free</p>
                    <p className="text-xs text-white/40">Full lifetime access</p>
                  </div>

                  {enrolled ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-white/50">
                          <span>Your progress</span>
                          <span>{progressPercent}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-primary-500 transition-all"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                      {firstLesson && (
                        <Button asChild className="w-full">
                          <a
                            href={youtubeUrl(firstLesson.youtubeVideoId)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Play className="h-4 w-4" fill="currentColor" />
                            Continue Learning
                          </a>
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button className="w-full" onClick={() => enroll(course.id)}>
                        <GraduationCap className="h-4 w-4" />
                        Enroll Now
                      </Button>
                      <p className="text-center text-xs text-white/40">
                        Unlock all {course.lessonCount} lessons
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>

        {/* Sticky action bar (mobile) */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-surface/95 p-3 backdrop-blur-sm lg:hidden">
          {enrolled ? (
            firstLesson ? (
              <Button asChild className="w-full">
                <a
                  href={youtubeUrl(firstLesson.youtubeVideoId)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Play className="h-4 w-4" fill="currentColor" />
                  Continue Learning · {progressPercent}%
                </a>
              </Button>
            ) : null
          ) : (
            <Button className="w-full" onClick={() => enroll(course.id)}>
              <GraduationCap className="h-4 w-4" />
              Enroll Now — Free
            </Button>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-primary-300">{icon}</span>
      <span>
        <span className="block text-sm font-semibold text-white">{value}</span>
        <span className="block text-xs text-white/40">{label}</span>
      </span>
    </div>
  );
}
