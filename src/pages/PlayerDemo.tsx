import { Link } from 'react-router-dom';
import { ArrowLeft, Keyboard, Info } from 'lucide-react';
import YouTubePlayer from '../components/player/YouTubePlayer';

/**
 * PlayerDemo — Isolated test page for the distraction-free player.
 * Used for verifying player behavior at all breakpoints.
 */
export default function PlayerDemo() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="border-b border-white/5 bg-surface/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-white/5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none">
              <ArrowLeft className="w-5 h-5 text-white/60" />
            </Link>
            <div>
              <h1 className="text-white font-semibold">Player Demo</h1>
              <p className="text-white/40 text-xs">Distraction-free YouTube player test</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-white/40 text-xs bg-white/5 px-3 py-1.5 rounded-lg">
              <Keyboard className="w-3.5 h-3.5" />
              Press ? for shortcuts
            </span>
          </div>
        </div>
      </div>

      {/* Player */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <YouTubePlayer
          videoId="dQw4w9WgXcQ"
          courseId="demo"
          lessonId="demo-lesson-1"
          title="Demo Video — Test the Distraction-Free Player"
        />

        {/* Info panel */}
        <div className="mt-6 bg-surface-light/50 border border-white/5 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-medium mb-2">Testing Checklist</h3>
              <ul className="space-y-1.5 text-sm text-white/60">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                  No YouTube UI visible (title, channel, logo, suggestions)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                  Custom controls: Play, Seek, Speed, Volume, PiP, Fullscreen, Focus
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                  Keyboard: Space, ←/→, J/L, ↑/↓, M, F, Esc, Shift+&gt;
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                  Progress saves every 15s to localStorage
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                  Resume from last position on reload
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                  Focus mode: fullscreen + hide controls + Esc to exit
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                  Test at 375px, 768px, 1440px, and fullscreen
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Keyboard shortcuts reference */}
        <div className="mt-4 bg-surface-light/50 border border-white/5 rounded-xl p-5">
          <h3 className="text-white font-medium mb-3 flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-primary-400" />
            Keyboard Shortcuts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {[
              ['Space / K', 'Play / Pause'],
              ['← / J', 'Rewind 5s'],
              ['→ / L', 'Forward 5s'],
              ['Shift + ← / J', 'Rewind 10s'],
              ['Shift + → / L', 'Forward 10s'],
              ['↑', 'Volume up'],
              ['↓', 'Volume down'],
              ['M', 'Mute / Unmute'],
              ['F', 'Fullscreen'],
              ['Esc', 'Exit focus mode'],
              ['Shift + >', 'Cycle speed'],
            ].map(([key, action]) => (
              <div key={key} className="flex items-center justify-between py-1">
                <kbd className="bg-white/5 border border-white/10 text-white/70 px-2 py-0.5 rounded text-xs font-mono">
                  {key}
                </kbd>
                <span className="text-white/40 text-xs">{action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
