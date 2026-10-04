import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BookOpen, BarChart3, Users, Plus, ArrowLeft } from 'lucide-react';

export default function InstructorLayout() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || user.role !== 'INSTRUCTOR') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-white/60 mb-6">You need instructor privileges to access this area.</p>
          <Link to="/dashboard" className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-500">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { path: '/instructor/courses', icon: BookOpen, label: 'My Courses' },
    { path: '/instructor/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/instructor/students', icon: Users, label: 'Students' },
  ];

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-light border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Link to="/dashboard" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <h1 className="text-xl font-bold text-white">Instructor</h1>
          <p className="text-sm text-white/60 mt-1">{user.name}</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
              return (
                <li key={path}>
                  <Link
                    to={path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link
            to="/instructor/courses/new"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Course</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
