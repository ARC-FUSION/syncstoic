import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { seedCourses } from '../lib/data/seed';
import { formatDuration, getYouTubeThumbnail } from '../lib/utils';
import { Play, Clock, BookOpen, Trophy, Flame, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Enrollment {
  courseId: string;
  enrolledAt: string;
  progress: number;
}

interface ProgressEntry {
  lessonId: string;
  courseId: string;
  positionSec: number;
  durationSec: number;
  isCompleted: boolean;
  timestamp: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Record<string, Enrollment>>({});
  const [progress, setProgress] = useState<Record<string, ProgressEntry>>({});

  useEffect(() => {
    // Load enrollments
    const storedEnrollments = localStorage.getItem('syncfocus_enrollments');
    if (storedEnrollments) {
      setEnrollments(JSON.parse(storedEnrollments));
    }

    // Load progress
    const storedProgress = localStorage.getItem('syncfocus_progress');
    if (storedProgress) {
      setProgress(JSON.parse(storedProgress));
    }
  }, []);

  // Get enrolled courses
  const enrolledCourses = seedCourses.filter((course) => enrollments[course.id]);

  // Calculate stats
  const stats = {
    totalMinutes: 0,
    streak: 0,
    lessonsCompleted: 0,
    coursesInProgress: 0,
  };

  // Calculate total minutes watched
  Object.values(progress).forEach((entry) => {
    stats.totalMinutes += Math.floor(entry.positionSec / 60);
  });

  // Calculate lessons completed
  Object.values(progress).forEach((entry) => {
    if (entry.isCompleted) {
      stats.lessonsCompleted++;
    }
  });

  // Calculate courses in progress
  enrolledCourses.forEach((course) => {
    const courseProgress = Object.values(progress).filter(
      (p) => p.courseId === course.id && p.isCompleted
    ).length;
    if (courseProgress > 0 && courseProgress < course.lessonCount) {
      stats.coursesInProgress++;
    }
  });

  // Calculate streak (simplified - just check if watched anything today)
  const today = new Date().toDateString();
  const watchedToday = Object.values(progress).some((entry) => {
    const entryDate = new Date(entry.timestamp).toDateString();
    return entryDate === today;
  });
  stats.streak = watchedToday ? 1 : 0;

  // Find last watched lesson for "Continue Watching"
  const lastWatched = Object.values(progress).sort((a, b) => b.timestamp - a.timestamp)[0];
  const continueWatchingCourse = lastWatched
    ? seedCourses.find((c) => c.id === lastWatched.courseId)
    : null;
  const continueWatchingLesson = continueWatchingCourse
    ? continueWatchingCourse.modules
        .flatMap((m) => m.lessons)
        .find((l) => l.id === lastWatched?.lessonId)
    : null;

  // If no enrollments, show empty state
  if (enrolledCourses.length === 0) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-primary-500/10 rounded-full flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No courses yet</h2>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              Start your learning journey by enrolling in your first course
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              Browse Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name || 'Learner'}!
          </h1>
          <p className="text-white/60">Continue your learning journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface-light/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stats.totalMinutes}</div>
            <div className="text-sm text-white/60">Minutes studied</div>
          </div>

          <div className="bg-surface-light/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stats.streak}</div>
            <div className="text-sm text-white/60">Day streak</div>
          </div>

          <div className="bg-surface-light/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stats.lessonsCompleted}</div>
            <div className="text-sm text-white/60">Lessons completed</div>
          </div>

          <div className="bg-surface-light/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stats.coursesInProgress}</div>
            <div className="text-sm text-white/60">Courses in progress</div>
          </div>
        </div>

        {/* Continue Watching */}
        {continueWatchingCourse && continueWatchingLesson && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Continue Watching</h2>
            <div className="bg-surface-light/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Thumbnail */}
                <div className="md:w-80 h-48 md:h-auto relative">
                  <img
                    src={getYouTubeThumbnail(continueWatchingLesson.youtubeVideoId)}
                    alt={continueWatchingLesson.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors cursor-pointer">
                      <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="text-sm text-primary-400 font-medium mb-2">
                    {continueWatchingCourse.title}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {continueWatchingLesson.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(continueWatchingLesson.durationSec)}
                    </span>
                    <span>
                      {Math.floor(
                        (lastWatched!.positionSec / lastWatched!.durationSec) * 100
                      )}
                      % complete
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${(lastWatched!.positionSec / lastWatched!.durationSec) * 100}%`,
                      }}
                    />
                  </div>

                  <Link
                    to={`/course/${continueWatchingCourse.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl transition-colors"
                  >
                    <Play className="w-5 h-5" fill="white" />
                    Resume Lesson
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Courses */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">My Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => {
              const courseLessons = course.modules.flatMap((m) => m.lessons);
              const completedLessons = Object.values(progress).filter(
                (p) => p.courseId === course.id && p.isCompleted
              ).length;
              const progressPercent = Math.round(
                (completedLessons / course.lessonCount) * 100
              );

              // Find last watched lesson
              const lastLesson = Object.values(progress)
                .filter((p) => p.courseId === course.id)
                .sort((a, b) => b.timestamp - a.timestamp)[0];
              const lastLessonData = lastLesson
                ? courseLessons.find((l) => l.id === lastLesson.lessonId)
                : null;

              return (
                <Link
                  key={course.id}
                  to={`/course/${course.slug}`}
                  className="bg-surface-light/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-all group"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48">
                    <img
                      src={getYouTubeThumbnail(
                        course.modules[0]?.lessons[0]?.youtubeVideoId || 'dQw4w9WgXcQ'
                      )}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                    {/* Progress Ring */}
                    <div className="absolute top-4 right-4">
                      <div className="relative w-14 h-14">
                        <svg className="w-14 h-14 transform -rotate-90">
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
                            className="text-primary-500"
                            strokeDasharray={`${(progressPercent / 100) * 150.8} 150.8`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-white">{progressPercent}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-white/60 mb-4">{course.instructor}</p>

                    {lastLessonData && (
                      <div className="text-sm text-white/40 mb-4">
                        Last watched: {lastLessonData.title}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">
                        {completedLessons} / {course.lessonCount} lessons
                      </span>
                      <span className="text-primary-400 font-medium">{progressPercent}%</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
