import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { courses } from '../data/courses';
import { Play, BookOpen, Clock, TrendingUp, ChevronRight, Flame } from 'lucide-react';

interface ProgressEntry {
  lessonId: string;
  courseId: string;
  currentTime: number;
  duration: number;
  completed: boolean;
  lastUpdated: number;
}

export default function Dashboard() {
  const [recentActivity, setRecentActivity] = useState<ProgressEntry[]>([]);
  
  useEffect(() => {
    try {
      const saved = localStorage.getItem('syncfocus_progress');
      if (saved) {
        const entries = Object.values(JSON.parse(saved)) as ProgressEntry[];
        setRecentActivity(entries.sort((a, b) => b.lastUpdated - a.lastUpdated).slice(0, 5));
      }
    } catch {}
  }, []);

  const enrolledCourses = courses.filter(c => c.enrolled);
  const continueWatching = enrolledCourses.filter(c => c.progress > 0 && c.progress < 100);

  const getNextLesson = (course: typeof courses[0]) => {
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        if (!lesson.completed) return { module: mod.title, lesson };
      }
    }
    return null;
  };

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-surface to-surface" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-6 pt-8 pb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <h1 className="text-2xl font-bold text-white">SyncFocus</h1>
          </div>
          <p className="text-white/60 text-lg mt-4">Welcome back! Ready to learn?</p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { icon: BookOpen, label: 'Enrolled', value: enrolledCourses.length, color: 'text-primary-400' },
              { icon: Play, label: 'In Progress', value: continueWatching.length, color: 'text-green-400' },
              { icon: Clock, label: 'Hours Learned', value: '12.5', color: 'text-amber-400' },
              { icon: TrendingUp, label: 'Streak', value: '7 days', color: 'text-rose-400' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-surface-light/50 backdrop-blur-sm border border-white/5 rounded-2xl p-4">
                <Icon className={`w-5 h-5 ${color} mb-2`} />
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-sm text-white/50">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Play className="w-5 h-5 text-primary-400" />
            Continue Watching
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {continueWatching.map(course => {
              const next = getNextLesson(course);
              return (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="group bg-surface-light border border-white/5 rounded-2xl overflow-hidden hover:border-primary-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                        </div>
                        <span className="text-white/80 text-sm">Resume</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                      <div
                        className="h-full bg-primary-500 transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-primary-300 transition-colors">
                      {course.title}
                    </h3>
                    {next && (
                      <p className="text-white/40 text-xs mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Next: {next.lesson.title}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-primary-400 text-xs font-medium">{course.progress}% complete</span>
                      <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-primary-400 transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-4">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            Recent Activity
          </h2>
          <div className="bg-surface-light/30 border border-white/5 rounded-2xl divide-y divide-white/5">
            {recentActivity.map((activity) => {
              const course = courses.find(c => c.id === activity.courseId);
              const lesson = course?.modules.flatMap(m => m.lessons).find(l => l.id === activity.lessonId);
              if (!course || !lesson) return null;
              const percent = activity.duration > 0 ? Math.round((activity.currentTime / activity.duration) * 100) : 0;
              return (
                <Link
                  key={`${activity.courseId}:${activity.lessonId}`}
                  to={`/course/${activity.courseId}`}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-600/10 flex items-center justify-center flex-shrink-0">
                    {activity.completed ? (
                      <span className="text-green-400 text-lg">✓</span>
                    ) : (
                      <Play className="w-4 h-4 text-primary-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm truncate">{lesson.title}</p>
                    <p className="text-white/30 text-xs">{course.title}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-primary-400 text-xs font-medium">{percent}%</p>
                    <p className="text-white/20 text-xs">
                      {Math.floor(activity.currentTime / 60)}:{String(Math.floor(activity.currentTime % 60)).padStart(2, '0')}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* My Courses */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-400" />
            My Courses
          </h2>
          <Link to="/catalog" className="text-primary-400 text-sm hover:text-primary-300 transition-colors flex items-center gap-1">
            Browse catalog <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map(course => (
            <Link
              key={course.id}
              to={`/course/${course.id}`}
              className="group bg-surface-light border border-white/5 rounded-2xl overflow-hidden hover:border-primary-500/30 transition-all duration-300"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white/90 text-xs px-2 py-1 rounded-lg">
                  {formatDuration(course.totalDuration)}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-primary-300 transition-colors">
                  {course.title}
                </h3>
                <p className="text-white/40 text-xs mt-1">{course.instructor}</p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-white/50">{course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons</span>
                    <span className="text-primary-400 font-medium">{course.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
