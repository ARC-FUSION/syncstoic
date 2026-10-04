import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Shield, Palette } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Profile
          </button>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-white/60 mt-2">Manage your account preferences</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-surface-light/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Notifications</h2>
                <p className="text-sm text-white/60">Configure notification preferences</p>
              </div>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 bg-surface/50 rounded-xl cursor-pointer">
                <span className="text-white">Email notifications</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
              </label>
              <label className="flex items-center justify-between p-4 bg-surface/50 rounded-xl cursor-pointer">
                <span className="text-white">Course updates</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
              </label>
              <label className="flex items-center justify-between p-4 bg-surface/50 rounded-xl cursor-pointer">
                <span className="text-white">Weekly progress report</span>
                <input type="checkbox" className="w-5 h-5 rounded" />
              </label>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-surface-light/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Privacy</h2>
                <p className="text-sm text-white/60">Manage your privacy settings</p>
              </div>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 bg-surface/50 rounded-xl cursor-pointer">
                <span className="text-white">Show learning activity on profile</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
              </label>
              <label className="flex items-center justify-between p-4 bg-surface/50 rounded-xl cursor-pointer">
                <span className="text-white">Allow course recommendations</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
              </label>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-surface-light/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Appearance</h2>
                <p className="text-sm text-white/60">Customize the look and feel</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-surface/50 rounded-xl">
                <div className="text-white mb-2">Theme</div>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg">
                    Dark
                  </button>
                  <button className="flex-1 px-4 py-2 bg-surface border border-white/10 text-white/60 rounded-lg">
                    Light
                  </button>
                  <button className="flex-1 px-4 py-2 bg-surface border border-white/10 text-white/60 rounded-lg">
                    System
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
