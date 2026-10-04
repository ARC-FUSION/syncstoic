import { useState, useRef, useCallback, useEffect } from 'react';
import { useYouTubePlayer, PlayerState } from '../hooks/useYouTubePlayer';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  SkipForward, SkipBack, Eye, EyeOff, Loader2, X
} from 'lucide-react';

interface DistractionFreePlayerProps {
  videoId: string;
  title?: string;
  startSeconds?: number;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnd?: () => void;
}

export default function DistractionFreePlayer({
  videoId,
  title,
  startSeconds = 0,
  onProgress,
  onEnd,
}: DistractionFreePlayerProps) {
  const [showControls, setShowControls] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [seekPreview, setSeekPreview] = useState<number | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const player = useYouTubePlayer({
    videoId,
    startSeconds,
    onProgress: (time, dur) => {
      onProgress?.(time, dur);
      if (dur > 0 && time >= dur - 1) {
        onEnd?.();
      }
    },
    onStateChange: (state) => {
      setIsBuffering(state === PlayerState.BUFFERING);
      if (state === PlayerState.ENDED) {
        onEnd?.();
      }
    },
  });

  const showFeedback = useCallback((message: string) => {
    setActionFeedback(message);
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => setActionFeedback(null), 1200);
  }, []);

  // Auto-hide controls after inactivity
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (player.isPlaying && !isFocusMode) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [player.isPlaying, isFocusMode]);

  const handleMouseMove = useCallback(() => {
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Focus mode toggle
  const toggleFocusMode = useCallback(() => {
    const newMode = !isFocusMode;
    setIsFocusMode(newMode);
    showFeedback(newMode ? '🎯 Focus Mode ON' : 'Focus Mode OFF');
    if (newMode && !document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen();
      setIsFullscreen(true);
    }
  }, [isFocusMode, showFeedback]);

  // Volume controls
  const volumeUp = useCallback(() => {
    const newVol = Math.min(100, player.volume + 10);
    player.setVolume(newVol);
    showFeedback(`🔊 ${newVol}%`);
  }, [player, showFeedback]);

  const volumeDown = useCallback(() => {
    const newVol = Math.max(0, player.volume - 10);
    player.setVolume(newVol);
    showFeedback(`🔉 ${newVol}%`);
  }, [player, showFeedback]);

  // Seek controls
  const seekForward = useCallback((seconds = 5) => {
    player.seekBy(seconds);
    showFeedback(`⏩ +${seconds}s`);
  }, [player, showFeedback]);

  const seekBackward = useCallback((seconds = 5) => {
    player.seekBy(-seconds);
    showFeedback(`⏪ -${seconds}s`);
  }, [player, showFeedback]);

  const skipForward10 = useCallback(() => {
    player.seekBy(10);
    showFeedback('⏩ +10s');
  }, [player, showFeedback]);

  const skipBackward10 = useCallback(() => {
    player.seekBy(-10);
    showFeedback('⏪ -10s');
  }, [player, showFeedback]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    togglePlay: () => {
      player.togglePlay();
      showFeedback(player.isPlaying ? '⏸ Paused' : '▶ Playing');
    },
    seekForward,
    seekBackward,
    volumeUp,
    volumeDown,
    toggleMute: () => {
      player.toggleMute();
      showFeedback(player.isMuted ? '🔇 Muted' : '🔊 Unmuted');
    },
    toggleFullscreen,
    nextSpeed: () => {
      player.cyclePlaybackRate();
      showFeedback(`⚡ ${player.playbackRate}x`);
    },
    skipForward10,
    skipBackward10,
  }, true, wrapperRef as React.RefObject<HTMLElement>);

  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClick = () => {
      setShowSpeedMenu(false);
    };
    if (showSpeedMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showSpeedMenu]);

  // Format time helper
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = player.duration > 0 ? (player.currentTime / player.duration) * 100 : 0;
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  const handleSeekbarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * player.duration;
    player.seek(newTime);
  };

  const handleSeekbarHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setSeekPreview(percent * player.duration);
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full bg-black overflow-hidden select-none group ${
        isFullscreen ? 'h-screen' : 'aspect-video'
      }`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (player.isPlaying && !isFocusMode) setShowControls(false);
        setSeekPreview(null);
      }}
      tabIndex={0}
    >
      {/* YouTube iframe container */}
      <div className="absolute inset-0 yt-player-wrapper">
        <div ref={player.containerRef} className="w-full h-full" />
      </div>

      {/* Click overlay for play/pause - always present */}
      <div
        className="absolute inset-0 z-[5] cursor-pointer"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('.controls-area, .menu-area')) return;
          player.togglePlay();
          showFeedback(player.isPlaying ? '⏸' : '▶');
        }}
        onDoubleClick={(e) => {
          if ((e.target as HTMLElement).closest('.controls-area, .menu-area')) return;
          toggleFullscreen();
        }}
      />

      {/* Loading state */}
      {!player.isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-[6] pointer-events-none">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-3" />
          <p className="text-white/40 text-sm">Loading player...</p>
        </div>
      )}

      {/* Buffering indicator */}
      {isBuffering && player.isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-[6] pointer-events-none">
          <Loader2 className="w-10 h-10 text-white/60 animate-spin" />
        </div>
      )}

      {/* Action feedback overlay */}
      {actionFeedback && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="bg-black/75 backdrop-blur-md text-white px-8 py-4 rounded-2xl text-xl font-medium animate-fade-in shadow-2xl">
            {actionFeedback}
          </div>
        </div>
      )}

      {/* Center play button when paused */}
      {!player.isPlaying && player.isLoaded && !isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center z-[6] pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-primary-600/90 backdrop-blur-sm flex items-center justify-center animate-pulse-glow shadow-2xl shadow-primary-500/30">
            <Play className="w-9 h-9 text-white ml-1" fill="white" />
          </div>
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={`controls-area absolute inset-x-0 bottom-0 z-20 transition-all duration-300 ${
          showControls || !player.isPlaying || isFocusMode ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />

        <div className="relative px-4 pb-4 pt-16" onClick={(e) => e.stopPropagation()}>
          {/* Seekbar */}
          <div
            className="group/seek relative h-8 flex items-center cursor-pointer mb-1"
            onClick={handleSeekbarClick}
            onMouseMove={handleSeekbarHover}
            onMouseLeave={() => setSeekPreview(null)}
          >
            {/* Track */}
            <div className="absolute w-full h-1 group-hover/seek:h-2 transition-all bg-white/20 rounded-full overflow-hidden">
              {/* Progress fill */}
              <div 
                className="absolute h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-[width] duration-100"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover/seek:opacity-100 transition-opacity shadow-lg shadow-black/30"
              style={{ left: `calc(${progressPercent}% - 8px)` }}
            />
            {/* Seek preview tooltip */}
            {seekPreview !== null && (
              <div
                className="absolute -top-10 bg-black/90 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-lg transform -translate-x-1/2 shadow-lg"
                style={{ left: `${(seekPreview / Math.max(player.duration, 1)) * 100}%` }}
              >
                {formatTime(seekPreview)}
              </div>
            )}
          </div>

          {/* Control buttons row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Play/Pause */}
              <button
                onClick={(e) => { e.stopPropagation(); player.togglePlay(); }}
                className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
                title="Play/Pause (Space/K)"
              >
                {player.isPlaying ? (
                  <Pause className="w-5 h-5 text-white" fill="white" />
                ) : (
                  <Play className="w-5 h-5 text-white" fill="white" />
                )}
              </button>

              {/* Skip Back 10s */}
              <button
                onClick={(e) => { e.stopPropagation(); seekBackward(10); }}
                className="p-2.5 hover:bg-white/10 rounded-xl transition-colors hidden sm:block"
                title="Back 10s (J/←)"
              >
                <SkipBack className="w-4 h-4 text-white" />
              </button>

              {/* Skip Forward 10s */}
              <button
                onClick={(e) => { e.stopPropagation(); seekForward(10); }}
                className="p-2.5 hover:bg-white/10 rounded-xl transition-colors hidden sm:block"
                title="Forward 10s (L/→)"
              >
                <SkipForward className="w-4 h-4 text-white" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1 group/vol">
                <button
                  onClick={(e) => { e.stopPropagation(); player.toggleMute(); }}
                  className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
                  title="Mute (M)"
                >
                  {player.isMuted || player.volume === 0 ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
                <div className="w-0 group-hover/vol:w-20 overflow-hidden transition-all duration-200">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={player.isMuted ? 0 : player.volume}
                    onChange={(e) => { e.stopPropagation(); player.setVolume(Number(e.target.value)); }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-20"
                  />
                </div>
              </div>

              {/* Time display */}
              <span className="text-white/70 text-xs sm:text-sm font-mono ml-2 tabular-nums">
                {formatTime(player.currentTime)} <span className="text-white/30">/</span> {formatTime(player.duration)}
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {/* Speed selector */}
              <div className="relative menu-area">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); }}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors text-sm font-semibold ${
                    player.playbackRate !== 1 
                      ? 'text-primary-400 bg-primary-500/10' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  title="Playback speed (Shift+>)"
                >
                  {player.playbackRate}x
                </button>
                {showSpeedMenu && (
                  <div 
                    className="absolute bottom-full right-0 mb-2 bg-surface-light/95 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-2xl min-w-[120px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-3 py-2 border-b border-white/5">
                      <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Speed</span>
                    </div>
                    {speeds.map(speed => (
                      <button
                        key={speed}
                        onClick={() => { player.changePlaybackRate(speed); setShowSpeedMenu(false); }}
                        className={`block w-full px-4 py-2 text-sm text-left hover:bg-white/5 transition-colors flex items-center justify-between ${
                          player.playbackRate === speed ? 'text-primary-400 font-medium' : 'text-white/70'
                        }`}
                      >
                        <span>{speed === 1 ? 'Normal' : `${speed}x`}</span>
                        {player.playbackRate === speed && <span className="text-primary-400">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Focus Mode */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleFocusMode(); }}
                className={`p-2.5 rounded-xl transition-colors ${
                  isFocusMode ? 'text-primary-400 bg-primary-500/10' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                title="Focus Mode"
              >
                {isFocusMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>

              {/* Shortcuts help */}
              <button
                onClick={(e) => { e.stopPropagation(); setShowShortcuts(!showShortcuts); }}
                className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-white/70 hover:text-white hidden sm:block"
                title="Keyboard shortcuts"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
                </svg>
              </button>

              {/* Fullscreen */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-white/70 hover:text-white"
                title="Fullscreen (F)"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Top gradient for title */}
      {(showControls || !player.isPlaying) && title && (
        <div className="absolute inset-x-0 top-0 z-20 pointer-events-none">
          <div className="bg-gradient-to-b from-black/70 to-transparent px-4 py-4">
            <p className="text-white/80 text-sm font-medium truncate">{title}</p>
          </div>
        </div>
      )}

      {/* Keyboard shortcuts panel */}
      {showShortcuts && (
        <div 
          className="menu-area absolute top-4 right-4 z-30 bg-surface-light/95 backdrop-blur-xl rounded-2xl border border-white/10 p-5 w-80 animate-fade-in shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold">Keyboard Shortcuts</h3>
            <button 
              onClick={() => setShowShortcuts(false)} 
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
          <div className="space-y-2.5 text-sm">
            {[
              ['Space / K', 'Play / Pause'],
              ['J / ←', 'Rewind 5s'],
              ['L / →', 'Forward 5s'],
              ['M', 'Mute / Unmute'],
              ['↑ / ↓', 'Volume'],
              ['F', 'Fullscreen'],
              ['Shift + >', 'Cycle speed'],
            ].map(([key, action]) => (
              <div key={key} className="flex justify-between items-center">
                <kbd className="bg-white/5 border border-white/10 text-white/70 px-2.5 py-1 rounded-lg text-xs font-mono">{key}</kbd>
                <span className="text-white/50 text-xs">{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Focus mode indicator */}
      {isFocusMode && (
        <div className="absolute top-4 left-4 z-30 animate-fade-in">
          <div className="bg-primary-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Focus Mode
          </div>
        </div>
      )}
    </div>
  );
}
