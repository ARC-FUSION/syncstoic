import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, User, Zap } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();
  
  // Don't show nav on auth, landing, or course detail pages
  if (location.pathname === '/' || location.pathname === '/auth' || location.pathname.startsWith('/course/')) {
    return null;
  }

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/catalog', icon: BookOpen, label: 'Catalog' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/10">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg hidden sm:block">SyncFocus</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === path
                    ? 'bg-primary-600/10 text-primary-400'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:block">{label}</span>
              </Link>
            ))}
          </div>

          {/* User */}
          <Link to="/auth" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
