import { Link } from 'react-router-dom';
import { Zap, Eye, Keyboard, BarChart3, Play, Shield, Sparkles, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-600/10 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-primary-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-24">
          {/* Nav */}
          <div className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-xl">SyncFocus</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-white/60 hover:text-white text-sm transition-colors">
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-primary-500/20"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-600/10 border border-primary-500/20 rounded-full px-4 py-1.5 mb-8">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-primary-300 text-sm font-medium">Distraction-free learning</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              YouTube playlists,{' '}
              <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                transformed
              </span>{' '}
              into courses
            </h1>
            
            <p className="text-white/50 text-lg md:text-xl mt-6 max-w-2xl mx-auto leading-relaxed">
              Turn any YouTube playlist into a structured learning experience. 
              No distractions. Custom controls. Progress tracking. Pure focus.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Link
                to="/courses"
                className="group flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-medium px-8 py-4 rounded-2xl transition-all hover:shadow-xl hover:shadow-primary-500/20 text-lg"
              >
                Start Learning Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/course/react-fundamentals"
                className="flex items-center gap-2 bg-white/5 border border-white/10 text-white font-medium px-8 py-4 rounded-2xl hover:bg-white/10 transition-all"
              >
                <Play className="w-5 h-5" fill="white" />
                Try the Player
              </Link>
            </div>
          </div>

          {/* Player Preview */}
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-primary-500/10">
              <div className="aspect-video relative">
                <img 
                  src="https://image.qwenlm.ai/generated-images/697917ac-1dbe-4c82-b087-2e89b9778564/_result.png" 
                  alt="SyncFocus distraction-free player"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                {/* Play button overlay */}
                <Link to="/course/react-mastery" className="absolute inset-0 flex items-center justify-center group/play">
                  <div className="w-20 h-20 rounded-full bg-primary-600/90 flex items-center justify-center group-hover/play:scale-110 transition-transform animate-pulse-glow">
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </div>
                </Link>

                {/* Focus mode badge */}
                <div className="absolute top-4 left-4 bg-primary-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Focus Mode Active
                </div>

                {/* Keyboard shortcut hint */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white/60 px-3 py-1.5 rounded-lg text-xs">
                  Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded mx-1">Space</kbd> to play
                </div>
              </div>
            </div>
            <p className="text-center text-white/30 text-sm mt-4">↑ Interactive preview — try it in the course player</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Built for deep learning
          </h2>
          <p className="text-white/40 mt-4 text-lg">Every feature designed to keep you in flow</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Eye,
              title: 'Distraction-Free Player',
              description: 'All YouTube UI hidden. No suggested videos, no comments, no channel branding. Just the content.',
              color: 'from-primary-500 to-blue-500',
            },
            {
              icon: Keyboard,
              title: 'Keyboard Shortcuts',
              description: 'Space to pause, J/K to seek, M to mute, F for fullscreen. Navigate without touching your mouse.',
              color: 'from-green-500 to-emerald-500',
            },
            {
              icon: BarChart3,
              title: 'Progress Tracking',
              description: 'Automatic heartbeat tracking. Resume exactly where you left off. Track completion across courses.',
              color: 'from-amber-500 to-orange-500',
            },
            {
              icon: Play,
              title: 'Custom Controls',
              description: 'Play/pause, seek, playback speed (0.5x-2x), volume control. Everything you need, nothing you don\'t.',
              color: 'from-rose-500 to-pink-500',
            },
            {
              icon: Shield,
              title: 'Focus Mode',
              description: 'One click to enter fullscreen with zero chrome. Eliminate every possible distraction.',
              color: 'from-violet-500 to-purple-500',
            },
            {
              icon: Zap,
              title: 'Structured Courses',
              description: 'YouTube playlists become organized courses with modules, lessons, and clear progress indicators.',
              color: 'from-cyan-500 to-blue-500',
            },
          ].map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              className="group bg-surface-light/50 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="relative bg-gradient-to-br from-primary-900/50 to-primary-800/20 border border-primary-500/20 rounded-3xl p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/5 to-transparent" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to learn with focus?
            </h2>
            <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of learners who've transformed their YouTube watching into structured learning.
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 bg-white text-surface font-semibold px-8 py-4 rounded-2xl hover:bg-white/90 transition-all hover:shadow-xl text-lg"
            >
              Get Started — It's Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary-400" />
            <span className="text-white/40 text-sm">SyncFocus © 2024</span>
          </div>
          <p className="text-white/20 text-sm">Learn without distractions</p>
        </div>
      </footer>
    </div>
  );
}
