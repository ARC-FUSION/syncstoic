import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../lib/stores/settingsStore';
import { ArrowLeft, Bell, Shield, Palette, Timer, Eye, Play } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pomodoro, focus, player, theme, updatePomodoro, updateFocus, updatePlayer, setTheme } =
    useSettingsStore();

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
          {/* Pomodoro Timer */}
          <div className="bg-surface-light/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Timer className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Pomodoro Timer</h2>
                <p className="text-sm text-white/60">Configure focus sessions and breaks</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-surface/50 rounded-xl">
                <label className="block text-white mb-2">Work Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={pomodoro.workDuration}
                  onChange={(e) => updatePomodoro({ workDuration: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-surface border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="p-4 bg-surface/50 rounded-xl">
                <label className="block text-white mb-2">Break Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={pomodoro.breakDuration}
                  onChange={(e) => updatePomodoro({ breakDuration: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-surface border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <label className="flex items-center justify-between p-4 bg-surface/50 rounded-xl cursor-pointer">
                <span className="text-white">Auto-start breaks</span>
                <input
                  type="checkbox"
                  checked={pomodoro.autoStartBreaks}
                  onChange={(e) => updatePomodoro({ autoStartBreaks: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
              </label>
              <label className="flex items-center justify-between p-4 bg-surface/50 rounded-xl cursor-pointer">
                <span className="text-white">Auto-start pomodoros</span>
                <input
                  type="checkbox"
                  checked={pomodoro.autoStartPomodoros}
                  onChange={(e) => updatePomodoro({ autoStartPomodoros: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
              </label>
            </div>
          </div>

          {/* Focus Tracking */}
          <div className="bg-surface-light/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Focus Tracking</h2>
                <p className="text-sm text-white/60">Manage distraction detection</p>
              </div>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 bg-surface/50 rounded-xl cursor-pointer">
                <div>
                  <div className="text-white">Auto-pause on tab switch</div>
                  <div className="text-white/40 text-xs mt-1">
                    Pause video when you switch to another tab
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={focus.autoPauseOnTabSwitch}
                  onChange={(e) => updateFocus({ autoPauseOnTabSwitch: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
              </label>
              <label className="flex items-center justify-between p-4 bg-surface/50 rounded-xl cursor-pointer">
                <div>
                  <div className="text-white">Track distractions</div>
                  <div className="text-white/40 text-xs mt-1">
                    Count tab switches and show focus score
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={focus.trackDistractions}
                  onChange={(e) => updateFocus({ trackDistractions: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
              </label>
            </div>
          </div>

          {/* Player Defaults */}
          <div className="bg-surface-light/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Player Defaults</h2>
                <p className="text-sm text-white/60">Configure default player behavior</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-surface/50 rounded-xl">
                <label className="block text-white mb-2">Default Playback Speed</label>
                <select
                  value={player.defaultPlaybackSpeed}
                  onChange={(e) => updatePlayer({ defaultPlaybackSpeed: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-surface border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1">1x (Normal)</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="1.75">1.75x</option>
                  <option value="2">2x</option>
                </select>
              </div>
              <label className="flex items-center justify-between p-4 bg-surface/50 rounded-xl cursor-pointer">
                <div>
                  <div className="text-white">Auto-hide controls</div>
                  <div className="text-white/40 text-xs mt-1">
                    Hide player controls after 3 seconds of inactivity
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={player.autoHideControls}
                  onChange={(e) => updatePlayer({ autoHideControls: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
              </label>
            </div>
          </div>

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
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'bg-primary-600 text-white'
                        : 'bg-surface border border-white/10 text-white/60'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      theme === 'light'
                        ? 'bg-primary-600 text-white'
                        : 'bg-surface border border-white/10 text-white/60'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      theme === 'system'
                        ? 'bg-primary-600 text-white'
                        : 'bg-surface border border-white/10 text-white/60'
                    }`}
                  >
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
