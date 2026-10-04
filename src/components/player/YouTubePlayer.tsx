import { useState, useRef, useCallback, useEffect } from 'react';
import { useYouTubePlayer, PlayerStatus } from '../../hooks/useYouTubePlayer';
import { useProgressSync, getResumePosition } from '../../hooks/useProgressSync';
import { useKeyboardShortcuts, ShortcutHandlers } from '../../hooks/useKeyboardShortcuts';
import { useFocusTracking } from '../../hooks/useFocusTracking';
import { useSettingsStore } from '../../lib/stores/settingsStore';
import DistractionShield from './DistractionShield';
import CustomControls from './CustomControls';
import FocusModeToggle from './FocusModeToggle';
import NotesDrawer from './NotesDrawer';
import PomodoroTimer from './PomodoroTimer';
import { Loader2, AlertCircle, RefreshCw, StickyNote } from 'lucide-react';

/**
 * YouTubePlayer props
 */
interface YouTubePlayerProps {
  videoId: string;
  courseId: string;
  lessonId: string;
  title?: string;
}

/**
 * YouTubePlayer — Main orchestrator component
 *
 * Composes all player components and hooks:
 * - YouTube IFrame API player
 * - Distraction shields
 * - Custom controls
 * - Focus mode
 * - Progress tracking
 * - Keyboard shortcuts
 *
 * Handles fullscreen, PiP, and auto-hide controls.
 */
export default function YouTubePlayer({ videoId, courseId, lessonId, title }: YouTubePlayerProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [showPomodoro, setShowPomodoro] = useState(false);

  const { focus } = useSettingsStore();

  // Calculate resume position
  const resumePosition = getResumePosition(courseId, lessonId);

  // YouTube player hook
  const player = useYouTubePlayer({
    videoId,
    startSeconds: resumePosition,
    onStateChange: (status) => {
      if (status === PlayerStatus.ENDED) {
        progress.markCompleted();
      }
    },
  });

  // Progress tracking hook
  const progress = useProgressSync({
    courseId,
    lessonId,
    currentTime: player.currentTime,
    duration: player.duration,
    enabled: player.isReady,
  });

  // Show action feedback
  const showFeedback = useCallback((message: string) => {
    setActionFeedback(message);
    setTimeout(() => setActionFeedback(null), 1200);
  }, []);

  // Focus tracking hook
  const { stats: focusStats } = useFocusTracking({
    isPlaying: player.isPlaying,
    onTabHidden: () => {
      if (focus.autoPauseOnTabSwitch && player.isPlaying) {
        player.pause();
        showFeedback('⏸ Paused (tab switched)');
      }
    },
    onTabVisible: () => {
      // Optional: could auto-resume here
    },
  });

  // Pomodoro callbacks
  const handlePomodoroBreakStart = useCallback(() => {
    player.pause();
    showFeedback('☕ Break time!');
  }, [player, showFeedback]);

  const handlePomodoroBreakEnd = useCallback(() => {
    showFeedback('🔥 Back to work!');
  }, [showFeedback]);

  // Auto-hide controls
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
    if (!wrapperRef.current) return;
    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen();
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

  // Exit focus mode
  const exitFocusMode = useCallback(() => {
    if (isFocusMode) {
      setIsFocusMode(false);
      showFeedback('Focus Mode OFF');
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }, [isFocusMode, showFeedback]);

  // Volume controls
  const volumeUp = useCallback(() => {
    const newVol = Math.min(100, player.volume + 5);
    player.setVolume(newVol);
    showFeedback(`🔊 ${newVol}%`);
  }, [player, showFeedback]);

  const volumeDown = useCallback(() => {
    const newVol = Math.max(0, player.volume - 5);
    player.setVolume(newVol);
    showFeedback(`🔉 ${newVol}%`);
  }, [player, showFeedback]);

  // Seek controls
  const seekForward5 = useCallback(() => {
    player.seekBy(5);
    showFeedback('⏩ +5s');
  }, [player, showFeedback]);

  const seekBackward5 = useCallback(() => {
    player.seekBy(-5);
    showFeedback('⏪ -5s');
  }, [player, showFeedback]);

  const seekForward10 = useCallback(() => {
    player.seekBy(10);
    showFeedback('⏩ +10s');
  }, [player, showFeedback]);

  const seekBackward10 = useCallback(() => {
    player.seekBy(-10);
    showFeedback('⏪ -10s');
  }, [player, showFeedback]);

  // Speed control
  const cycleSpeed = useCallback(() => {
    player.cyclePlaybackRate();
    showFeedback(`⚡ ${player.playbackRate}x`);
  }, [player, showFeedback]);

  // Keyboard shortcuts
  const shortcutHandlers: ShortcutHandlers = {
    togglePlay: () => {
      player.togglePlay();
      showFeedback(player.isPlaying ? '⏸ Paused' : '▶ Playing');
    },
    seekForward5,
    seekBackward5,
    seekForward10,
    seekBackward10,
    volumeUp,
    volumeDown,
    toggleMute: () => {
      player.toggleMute();
      showFeedback(player.isMuted ? '🔇 Muted' : '🔊 Unmuted');
    },
    toggleFullscreen,
    exitFocusMode,
    cycleSpeed,
  };

  useKeyboardShortcuts(shortcutHandlers, {
    enabled: true,
    containerRef: wrapperRef,
  });

  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // PiP request
  const requestPiP = useCallback(async () => {
    try {
      const iframe = player.playerRef.current?.getIframe();
      if (iframe && document.pictureInPictureEnabled) {
        const iframeWithPiP = iframe as HTMLIFrameElement & {
          requestPictureInPicture?: () => Promise<void>;
        };
        if (iframeWithPiP.requestPictureInPicture) {
          await iframeWithPiP.requestPictureInPicture();
          showFeedback('📌 Picture-in-Picture');
        } else {
          showFeedback('PiP not supported');
        }
      }
    } catch {
      showFeedback('PiP not supported');
    }
  }, [player, showFeedback]);

  // Retry handler
  const handleRetry = useCallback(() => {
    setRetryKey((k) => k + 1);
  }, []);

  return (
    <div
      key={retryKey}
      ref={wrapperRef}
      className={`relative w-full bg-black overflow-hidden select-none group ${
        isFullscreen ? 'h-screen' : 'aspect-video'
      }`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (player.isPlaying && !isFocusMode) setShowControls(false);
      }}
      tabIndex={0}
      role="application"
      aria-label="Video player"
    >
      {/* YouTube iframe container */}
      <div className="absolute inset-0">
        <div ref={player.containerRef as React.RefObject<HTMLDivElement>} className="w-full h-full" />
      </div>

      {/* Distraction shields */}
      <DistractionShield />

      {/* Click overlay for play/pause */}
      <div
        className="absolute inset-0 z-[25] cursor-pointer"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('[data-controls], [data-shield]')) return;
          player.togglePlay();
          showFeedback(player.isPlaying ? '⏸' : '▶');
        }}
        onDoubleClick={(e) => {
          if ((e.target as HTMLElement).closest('[data-controls], [data-shield]')) return;
          toggleFullscreen();
        }}
      />

      {/* Loading state */}
      {player.status === PlayerStatus.LOADING && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-10">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-3" />
          <p className="text-white/40 text-sm">Loading player...</p>
        </div>
      )}

      {/* Error state */}
      {player.error && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-10 px-4">
          <div className="max-w-md text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">Player Error</h3>
            <p className="text-white/60 text-sm mb-6">{player.error.message}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-medium px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-primary-500/20 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              aria-label="Retry loading video"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
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
      {!player.isPlaying && player.isReady && player.status !== PlayerStatus.BUFFERING && (
        <div className="absolute inset-0 flex items-center justify-center z-[25] pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-primary-600/90 backdrop-blur-sm flex items-center justify-center animate-pulse-glow shadow-2xl shadow-primary-500/30">
            <svg className="w-9 h-9 text-white ml-1" fill="white" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Custom controls */}
      <div data-controls>
        <CustomControls
          isPlaying={player.isPlaying}
          isMuted={player.isMuted}
          isFullscreen={isFullscreen}
          isFocusMode={isFocusMode}
          currentTime={player.currentTime}
          duration={player.duration}
          volume={player.volume}
          playbackRate={player.playbackRate}
          buffered={player.buffered}
          visible={showControls || !player.isPlaying || isFocusMode}
          onTogglePlay={player.togglePlay}
          onSeek={player.seekTo}
          onSetVolume={player.setVolume}
          onToggleMute={player.toggleMute}
          onSetPlaybackRate={player.setPlaybackRate}
          onToggleFullscreen={toggleFullscreen}
          onToggleFocusMode={toggleFocusMode}
          onRequestPiP={requestPiP}
        />
      </div>

      {/* Focus mode toggle + hint */}
      <FocusModeToggle isFocusMode={isFocusMode} onToggle={toggleFocusMode} />

      {/* Pomodoro Timer */}
      {showPomodoro && (
        <PomodoroTimer
          onBreakStart={handlePomodoroBreakStart}
          onBreakEnd={handlePomodoroBreakEnd}
        />
      )}

      {/* Notes Drawer */}
      <NotesDrawer
        isOpen={showNotes}
        onClose={() => setShowNotes(false)}
        lessonId={lessonId}
        courseId={courseId}
        currentTime={player.currentTime}
        onSeekTo={player.seekTo}
      />

      {/* Toggle buttons for notes and pomodoro */}
      {(showControls || !player.isPlaying) && (
        <div className="absolute top-4 left-4 z-40 flex gap-2">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`p-2 rounded-lg backdrop-blur-sm transition-colors ${
              showNotes
                ? 'bg-primary-600 text-white'
                : 'bg-black/60 text-white/60 hover:text-white hover:bg-black/80'
            }`}
            aria-label="Toggle notes"
            title="Notes"
          >
            <StickyNote className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowPomodoro(!showPomodoro)}
            className={`p-2 rounded-lg backdrop-blur-sm transition-colors ${
              showPomodoro
                ? 'bg-primary-600 text-white'
                : 'bg-black/60 text-white/60 hover:text-white hover:bg-black/80'
            }`}
            aria-label="Toggle pomodoro timer"
            title="Pomodoro Timer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>
        </div>
      )}

      {/* Title overlay (top) */}
      {(showControls || !player.isPlaying) && title && (
        <div className="absolute inset-x-0 top-0 z-30 pointer-events-none">
          <div className="bg-gradient-to-b from-black/70 to-transparent px-4 py-4">
            <p className="text-white/80 text-sm font-medium truncate">{title}</p>
          </div>
        </div>
      )}
    </div>
  );
}
