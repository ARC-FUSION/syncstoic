import { Link } from 'react-router-dom';
import { useInstructorStore } from '../../lib/stores/instructorStore';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

export default function InstructorCourses() {
  const { courses, deleteCourse, publishCourse, unpublishCourse } = useInstructorStore();

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      deleteCourse(id);
    }
  };

  const handleTogglePublish = (id: string, currentStatus: 'draft' | 'published') => {
    if (currentStatus === 'draft') {
      publishCourse(id);
    } else {
      unpublishCourse(id);
    }
  };

  if (courses.length === 0) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-white mb-4">No Courses Yet</h2>
          <p className="text-white/60 mb-8">Create your first course to get started.</p>
          <Link
            to="/instructor/courses/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Courses</h1>
          <p className="text-white/60 mt-2">{courses.length} course{courses.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          to="/instructor/courses/new"
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Course
        </Link>
      </div>

      <div className="grid gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-surface-light border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{course.title}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      course.status === 'published'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {course.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-white/60 text-sm mb-3">{course.description}</p>
                <div className="flex items-center gap-4 text-sm text-white/40">
                  <span>{course.modules.length} module{course.modules.length !== 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span>
                    {course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0)} lessons
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(course.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <Link
                to={`/instructor/courses/${course.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
              <button
                onClick={() => handleTogglePublish(course.id, course.status)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  course.status === 'published'
                    ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                }`}
              >
                {course.status === 'published' ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Publish
                  </>
                )}
              </button>
              <button
                onClick={() => handleDelete(course.id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
