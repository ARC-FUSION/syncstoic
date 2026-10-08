import { useInstructorStore } from '../../lib/stores/instructorStore';
import { Users, BookOpen, Clock, TrendingUp } from 'lucide-react';

export default function Analytics() {
  const { courses, students } = useInstructorStore();

  // Calculate overall stats
  const totalEnrollments = courses.reduce((sum, course) => sum + course.enrolledCount, 0);
  const totalLessons = courses.reduce(
    (sum, course) => sum + course.modules.reduce((modSum, mod) => modSum + mod.lessons.length, 0),
    0
  );
  const publishedCourses = courses.filter((c) => c.status === 'published').length;

  // Calculate average completion rate
  const completionRates = courses.map((course) => {
    const courseStudents = students[course.id] || [];
    if (courseStudents.length === 0) return 0;
    const avgProgress = courseStudents.reduce((sum, s) => sum + s.progress, 0) / courseStudents.length;
    return avgProgress;
  });
  const avgCompletionRate = completionRates.length > 0 
    ? completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length 
    : 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-white/60 mt-1">Overview of your course performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface-light border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{totalEnrollments}</div>
          <div className="text-sm text-white/60">Total Enrollments</div>
        </div>

        <div className="bg-surface-light border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{publishedCourses}</div>
          <div className="text-sm text-white/60">Published Courses</div>
        </div>

        <div className="bg-surface-light border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{totalLessons}</div>
          <div className="text-sm text-white/60">Total Lessons</div>
        </div>

        <div className="bg-surface-light border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{avgCompletionRate.toFixed(1)}%</div>
          <div className="text-sm text-white/60">Avg Completion Rate</div>
        </div>
      </div>

      {/* Course Performance */}
      <div className="bg-surface-light border border-white/10 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-6">Course Performance</h2>
        
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60">No courses yet. Create your first course to see analytics.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => {
              const courseStudents = students[course.id] || [];
              const completionRate = courseStudents.length > 0
                ? courseStudents.reduce((sum, s) => sum + s.progress, 0) / courseStudents.length
                : 0;
              const lessonCount = course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);

              return (
                <div key={course.id} className="bg-surface border border-white/5 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{course.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>{course.enrolledCount} enrollments</span>
                        <span>•</span>
                        <span>{lessonCount} lessons</span>
                        <span>•</span>
                        <span className={course.status === 'published' ? 'text-green-400' : 'text-yellow-400'}>
                          {course.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-white/60">Completion Rate</span>
                      <span className="text-white font-medium">{completionRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-surface-light rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-primary-400 h-2 rounded-full transition-all"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-surface-light border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
        
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60">No activity yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {courses
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .slice(0, 5)
              .map((course) => (
                <div key={course.id} className="flex items-center gap-3 p-3 bg-surface border border-white/5 rounded-lg">
                  <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">{course.title}</div>
                    <div className="text-xs text-white/60">
                      Updated {new Date(course.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm text-white/60">
                    {course.enrolledCount} students
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
