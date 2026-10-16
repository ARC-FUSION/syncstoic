import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { seedCourses } from '../lib/data/seed';
import { formatDuration, getYouTubeThumbnail } from '../lib/utils';
import { Play, Clock, BookOpen, Trophy, Flame, TrendingUp, Target, ArrowRight } from 'lucide-react';
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
    const storedEnrollments = localStorage.getItem('syncfocus_enrollments');
    if (storedEnrollments) {
      setEnrollments(JSON.parse(storedEnrollments));
    }

    const storedProgress = localStorage.getItem('syncfocus_progress');
    if (storedProgress) {
      setProgress(JSON.parse(storedProgress));
    }
  }, []);

  const enrolledCourses = seedCourses.filter((course) => enrollments[course.id]);

  const stats = {
    totalMinutes: 0,
    streak: 0,
    lessonsCompleted: 0,
    coursesInProgress: 0,
    focusScore: 100,
  };

  Object.values(progress).forEach((entry) => {
    stats.totalMinutes += Math.floor(entry.positionSec / 60);
  });

  Object.values(progress).forEach((entry) => {
    if (entry.isCompleted) {
      stats.lessonsCompleted++;
    }
  });

  enrolledCourses.forEach((course) => {
    const courseProgress = Object.values(progress).filter(
      (p) => p.courseId === course.id && p.isCompleted
    ).length;
    if (courseProgress > 0 && courseProgress < course.lessonCount) {
      stats.coursesInProgress++;
    }
  });

  const today = new Date().toDateString();
  const watchedToday = Object.values(progress).some((entry) => {
    const entryDate = new Date(entry.timestamp).toDateString();
    return entryDate === today;
  });
  stats.streak = watchedToday ? 1 : 0;

  const storedFocusStats = localStorage.getItem('syncfocus_focus_stats');
  if (storedFocusStats) {
    try {
      const focusData = JSON.parse(storedFocusStats);
      stats.focusScore = focusData.focusScore || 100;
    } catch (e) {
      // Ignore parse errors
    }
  }

  const lastWatched = Object.values(progress).sort((a, b) => b.timestamp - a.timestamp)[0];
  const continueWatchingCourse = lastWatched
    ? seedCourses.find((c) => c.id === lastWatched.courseId)
    : null;
  const continueWatchingLesson = continueWatchingCourse
    ? continueWatchingCourse.modules
        .flatMap((m) => m.lessons)
        .find((l) => l.id === lastWatched?.lessonId)
    : null;

  if (enrolledCourses.length === 0) {
    return (
      <div className="min-h-screen bg-surface pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center py-16 sm:py-20">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-primary-500/10 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-primary-400" strokeWidth={2} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">No courses yet</h2>
            <p className="text-white/60 mb-8 max-w-md mx-auto px-4">
              Start your learning journey by enrolling in your first course
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl transition-all min-h-[48px] shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40"
            >
              <BookOpen className="w-5 h-5" strokeWidth={2} />
              Browse Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
            Welcome back, {user?.name || 'Learner'}!
          </h1>
          <p className="text-white/60 text-sm sm:text-base">Continue your learning journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-surface-light/50 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-primary-500/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" strokeWidth={2} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">{stats.totalMinutes}</div>
            <div className="text-xs sm:text-sm text-white/60">Minutes studied</div>
          </div>

          <div className="bg-surface-light/50 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-orange-500/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" strokeWidth={2} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">{stats.streak}</div>
            <div className="text-xs sm:text-sm text-white/60">Day streak</div>
          </div>

          <div className="bg-surface-light/50 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-green-500/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" strokeWidth={2} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">{stats.lessonsCompleted}</div>
            <div className="text-xs sm:text-sm text-white/60">Lessons completed</div>
          </div>

          <div className="bg-surface-light/50 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-blue-500/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" strokeWidth={2} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">{stats.coursesInProgress}</div>
            <div className="text-xs sm:text-sm text-white/60">Courses in progress</div>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-surface-light/50 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-purple-500/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" strokeWidth={2} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">{Math.round(stats.focusScore)}%</div>
            <div className="text-xs sm:text-sm text-white/60">Focus score</div>
          </div>
        </div>

        {/* Continue Watching */}
        {continueWatchingCourse && continueWatchingLesson && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Continue Watching</h2>
            <div className="bg-surface-light/50 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden hover:border-primary-500/30 transition-all">
              <div className="flex flex-col md:flex-row">
                {/* Thumbnail */}
                <div className="md:w-80 h-48 md:h-auto relative group">
                  <img
                    src={getYouTubeThumbnail(continueWatchingLesson.youtubeVideoId)}
                    alt={continueWatchingLesson.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-all">
                    <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary-500/30">
                      <Play className="w-8 h-8 text-white ml-1" fill="white" strokeWidth={2} />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 sm:p-6">
                  <div className="text-xs sm:text-sm text-primary-400 font-medium mb-2">
                    {continueWatchingCourse.title}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3">
                    {continueWatchingLesson.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/60 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" strokeWidth={2} />
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
                      className="bg-gradient-to-r from-primary-500 to-primary-400 h-2 rounded-full transition-all"
                      style={{
                        width: `${(lastWatched!.positionSec / lastWatched!.durationSec) * 100}%`,
                      }}
                    />
                  </div>

                  <Link
                    to={`/course/${continueWatchingCourse.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl transition-all min-h-[44px] shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40"
                  >
                    <Play className="w-5 h-5" fill="white" strokeWidth={2} />
                    Resume Lesson
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Courses */}
        <div>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">My Courses</h2>
            <Link
              to="/courses"
              className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors min-h-[44px] px-2"
            >
              View All
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {enrolledCourses.map((course) => {
              const courseLessons = course.modules.flatMap((m) => m.lessons);
              const completedLessons = Object.values(progress).filter(
                (p) => p.courseId === course.id && p.isCompleted
              ).length;
              const progressPercent = Math.round(
                (completedLessons / course.lessonCount) * 100
              );

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
                  className="bg-surface-light/50 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden hover:border-primary-500/50 transition-all group"
                >
                  {/* Thumbnail */}
                  <div className="relative h-40 sm:h-48">
                    <img
                      src={getYouTubeThumbnail(
                        course.modules[0]?.lessons[0]?.youtubeVideoId || 'dQw4w9WgXcQ'
                      )}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                    {/* Progress Ring */}
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14">
                        <svg className="w-12 h-12 sm:w-14 sm:h-14 transform -rotate-90">
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            className="text-white/20"
                          />
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            className="text-primary-500"
                            strokeDasharray={`${(progressPercent / 100) * 125.6} 125.6`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs sm:text-sm font-bold text-white">{progressPercent}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-white/60 mb-3 sm:mb-4">{course.instructor}</p>

                    {lastLessonData && (
                      <div className="text-xs sm:text-sm text-white/40 mb-3 sm:mb-4 line-clamp-1">
                        Last: {lastLessonData.title}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs sm:text-sm">
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
