import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Mail, Settings } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Card */}
        <div className="bg-surface-light/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-400"></div>

          {/* Avatar and Info */}
          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 mb-6">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full border-4 border-surface-light bg-primary-500/20 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-primary-400" />
                )}
              </div>

              {/* Name and Email */}
              <div className="flex-1 sm:mb-2">
                <h1 className="text-2xl font-bold text-white mb-1">{user.name}</h1>
                <p className="text-white/60">{user.email}</p>
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-surface/50 rounded-xl">
                <User className="w-5 h-5 text-primary-400" />
                <div>
                  <div className="text-sm text-white/60">Name</div>
                  <div className="text-white font-medium">{user.name}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-surface/50 rounded-xl">
                <Mail className="w-5 h-5 text-primary-400" />
                <div>
                  <div className="text-sm text-white/60">Email</div>
                  <div className="text-white font-medium">{user.email}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/settings')}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-surface border border-white/10 text-white font-medium rounded-xl hover:bg-surface-light transition-colors"
              >
                <Settings className="w-5 h-5" />
                Settings
              </button>

              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-400 font-medium rounded-xl hover:bg-red-500/20 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
