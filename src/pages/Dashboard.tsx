import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Flame,
  Play,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useEnrollment } from '../hooks/useEnrollment';
import { useStats } from '../hooks/useStats';
import { seedCourses } from '../lib/data/seed';
import { latestEntry, readProgress, type ProgressStore } from '../lib/progress';
import { formatDuration, getYouTubeThumbnail } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';

function StatCard({
  icon: Icon,
  value,
  label,
  accent,
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
  accent: string;
}) {
  return (
    <Card className="gap-3 border-white/10 bg-surface-light/50 p-6 text-white ring-white/10 backdrop-blur-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-white/60">{label}</div>
      </div>
    </Card>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const circumference = 2 * Math.PI * 24;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div className="relative h-14 w-14">
      <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
        <circle
          cx="28"
          cy="28"
          r="24"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-white/20"
        />
        <circle
          cx="28"
          cy="28"
          r="24"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          className="text-primary-500"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-white">{percent}%</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { enrollments } = useEnrollment();
  const { stats, isLoading } = useStats();
  const [progress, setProgress] = useState<ProgressStore>({});

  useEffect(() => {
    setProgress(readProgress());
  }, []);

  const enrolledCourses = useMemo(
    () => seedCourses.filter((course) => enrollments[course.id]),
    [enrollments]
  );

  const entries = useMemo(() => Object.values(progress), [progress]);
  const lastEntry = latestEntry(entries);
  const continueCourse = lastEntry
    ? seedCourses.find((course) => course.id === lastEntry.courseId)
    : undefined;
  const continueLesson =
    continueCourse && lastEntry
      ? continueCourse.modules.flatMap((module) => module.lessons).find(
          (lesson) => lesson.id === lastEntry.lessonId
        )
      : undefined;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const completedByCourse = (courseId: string) =>
    entries.filter((entry) => entry.courseId === courseId && entry.isCompleted).length;

  return (
    <div className="min-h-screen bg-surface pb-28 lg:pb-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user?.name || 'Learner'}
          </h1>
          <p className="mt-2 text-white/60">{today}</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card
                key={index}
                className="gap-3 border-white/10 bg-surface-light/50 p-6 ring-white/10"
              >
                <Skeleton className="h-10 w-10 rounded-lg bg-white/10" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-16 bg-white/10" />
                  <Skeleton className="h-4 w-24 bg-white/10" />
                </div>
              </Card>
            ))
          ) : (
            <>
              <StatCard
                icon={Clock}
                value={stats.totalMinutes}
                label="Minutes studied"
                accent="bg-primary-500/10 text-primary-400"
              />
              <StatCard
                icon={Flame}
                value={stats.streak}
                label="Day streak"
                accent="bg-orange-500/10 text-orange-400"
              />
              <StatCard
                icon={Trophy}
                value={stats.lessonsCompleted}
                label="Lessons completed"
                accent="bg-green-500/10 text-green-400"
              />
              <StatCard
                icon={TrendingUp}
                value={stats.coursesInProgress}
                label="Courses in progress"
                accent="bg-blue-500/10 text-blue-400"
              />
            </>
          )}
        </div>

        {/* Continue watching / Start learning */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-white">Continue Watching</h2>
          {continueCourse && continueLesson && lastEntry ? (
            <Card className="overflow-hidden border-white/10 bg-surface-light/50 text-white ring-white/10 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row">
                <div className="relative h-48 md:h-auto md:w-80">
                  <img
                    src={getYouTubeThumbnail(continueLesson.youtubeVideoId)}
                    alt={continueLesson.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-600">
                      <Play className="ml-1 h-8 w-8 text-white" fill="white" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-6">
                  <div className="mb-2 text-sm font-medium text-primary-400">
                    {continueCourse.title}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-white">{continueLesson.title}</h3>
                  <div className="mb-4 flex items-center gap-4 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(continueLesson.durationSec)}
                    </span>
                    <span>
                      {lastEntry.durationSec > 0
                        ? Math.floor((lastEntry.positionSec / lastEntry.durationSec) * 100)
                        : 0}
                      % complete
                    </span>
                  </div>

                  <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-primary-500 transition-all"
                      style={{
                        width: `${
                          lastEntry.durationSec > 0
                            ? Math.min(100, (lastEntry.positionSec / lastEntry.durationSec) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <Button asChild className="bg-primary-600 text-white hover:bg-primary-500">
                    <Link to={`/learn/${continueCourse.slug}/${continueLesson.id}`}>
                      <Play className="h-5 w-5" fill="currentColor" />
                      Resume
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border-white/10 bg-surface-light/50 p-8 text-center text-white ring-white/10 backdrop-blur-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500/10">
                <Play className="ml-1 h-6 w-6 text-primary-400" fill="currentColor" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Start learning</h3>
              <p className="mx-auto mb-6 max-w-sm text-sm text-white/60">
                Pick a course and your progress will show up here.
              </p>
              <Button asChild className="bg-primary-600 text-white hover:bg-primary-500">
                <Link to="/courses">Browse courses</Link>
              </Button>
            </Card>
          )}
        </div>

        {/* My courses */}
        {enrolledCourses.length > 0 ? (
          <div>
            <h2 className="mb-4 text-xl font-bold text-white">My Courses</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.map((course) => {
                const lessons = course.modules.flatMap((module) => module.lessons);
                const completed = completedByCourse(course.id);
                const percent = course.lessonCount
                  ? Math.round((completed / course.lessonCount) * 100)
                  : 0;
                const lastLessonEntry = latestEntry(
                  entries.filter((entry) => entry.courseId === course.id)
                );
                const lastLesson = lastLessonEntry
                  ? lessons.find((lesson) => lesson.id === lastLessonEntry.lessonId)
                  : undefined;

                return (
                  <Link
                    key={course.id}
                    to={`/course/${course.slug}`}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-surface-light/50 backdrop-blur-sm transition-all hover:border-primary-500/50"
                  >
                    <div className="relative h-48">
                      <img
                        src={getYouTubeThumbnail(
                          lessons[0]?.youtubeVideoId || 'dQw4w9WgXcQ'
                        )}
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute right-4 top-4">
                        <ProgressRing percent={percent} />
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="mb-2 text-lg font-bold text-white transition-colors group-hover:text-primary-400">
                        {course.title}
                      </h3>
                      <p className="mb-4 text-sm text-white/60">{course.instructor}</p>

                      {lastLesson && (
                        <p className="mb-4 text-sm text-white/40">
                          Last watched: {lastLesson.title}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">
                          {completed} / {course.lessonCount} lessons
                        </span>
                        <span className="font-medium text-primary-400">{percent}%</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/10">
              <BookOpen className="h-10 w-10 text-primary-400" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-white">
              You haven&apos;t enrolled in any courses yet
            </h2>
            <p className="mx-auto mb-8 max-w-md text-white/60">
              Start your learning journey by enrolling in your first course.
            </p>
            <Button asChild className="bg-primary-600 text-white hover:bg-primary-500">
              <Link to="/courses">
                <BookOpen className="h-5 w-5" />
                Browse Courses
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
