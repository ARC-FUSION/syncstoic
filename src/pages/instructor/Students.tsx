import { useInstructorStore } from '../../lib/stores/instructorStore';
import { Users, Clock } from 'lucide-react';

export default function Students() {
  const { courses, students } = useInstructorStore();

  // Flatten all students across all courses
  const allStudents = courses.flatMap((course) => {
    const courseStudents = students[course.id] || [];
    return courseStudents.map((student) => ({
      ...student,
      courseTitle: course.title,
      courseId: course.id,
    }));
  });

  // Group by student ID to show all courses per student
  const studentsByUser = allStudents.reduce((acc, student) => {
    if (!acc[student.userId]) {
      acc[student.userId] = [];
    }
    acc[student.userId].push(student);
    return acc;
  }, {} as Record<string, typeof allStudents>);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Students</h1>
        <p className="text-white/60 mt-1">
          {Object.keys(studentsByUser).length} student{Object.keys(studentsByUser).length !== 1 ? 's' : ''} enrolled
        </p>
      </div>

      {Object.keys(studentsByUser).length === 0 ? (
        <div className="bg-surface-light border border-white/10 rounded-lg p-12 text-center">
          <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Students Yet</h3>
          <p className="text-white/60">
            Students will appear here when they enroll in your courses.
          </p>
        </div>
      ) : (
        <div className="bg-surface-light border border-white/10 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface border-b border-white/10">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Student</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Courses</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Progress</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {Object.entries(studentsByUser).map(([userId, studentCourses]) => {
                const avgProgress =
                  studentCourses.reduce((sum, s) => sum + s.progress, 0) / studentCourses.length;
                const lastActive = studentCourses.reduce((latest, s) => {
                  const date = new Date(s.lastActive);
                  return date > latest ? date : latest;
                }, new Date(0));

                return (
                  <tr key={userId} className="hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                          <span className="text-primary-400 font-medium">
                            {userId.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">Student {userId.slice(0, 8)}</div>
                          <div className="text-xs text-white/60">{userId.slice(0, 16)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">{studentCourses.length}</div>
                      <div className="text-xs text-white/60 mt-1">
                        {studentCourses.map((s) => s.courseTitle).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[100px]">
                          <div className="w-full bg-surface rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-primary-500 to-primary-400 h-2 rounded-full transition-all"
                              style={{ width: `${avgProgress}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium text-white">{avgProgress.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Clock className="w-4 h-4" />
                        {lastActive.toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
