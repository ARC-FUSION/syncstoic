import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, User, Zap, StickyNote, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

export default function Navigation() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Don't show nav on auth, landing, or course detail pages
  if (
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname.startsWith('/course/')
  ) {
    return null;
  }

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', protected: true },
    { path: '/courses', icon: BookOpen, label: 'Catalog', protected: false },
    { path: '/notes', icon: StickyNote, label: 'Notes', protected: true },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-surface/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-all">
                <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-white font-bold text-lg hidden sm:block">SyncFocus</span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                    location.pathname === path
                      ? 'bg-primary-600/10 text-primary-400'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  aria-label={label}
                  aria-current={location.pathname === path ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* User */}
              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors min-h-[44px]"
                  aria-label="Profile"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-white/10"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center ring-2 ring-white/10">
                      <User className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                  )}
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-lg transition-all min-h-[44px] shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 rounded-lg hover:bg-white/5 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-white" strokeWidth={2} />
                ) : (
                  <Menu className="w-6 h-6 text-white" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-surface/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-1">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all min-h-[48px] ${
                    location.pathname === path
                      ? 'bg-primary-600/10 text-primary-400'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  aria-label={label}
                  aria-current={location.pathname === path ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                  <span>{label}</span>
                </Link>
              ))}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg transition-all min-h-[48px] mt-3"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
