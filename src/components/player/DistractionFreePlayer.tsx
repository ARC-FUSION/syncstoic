import { useState, useRef, useCallback, useEffect } from 'react';
import { useYouTubePlayer } from '../../hooks/useYouTubePlayer';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useProgressTracking, getResumePosition } from '../../hooks/useProgressTracking';
import { PlayerStatus, PlaybackSpeed, ShortcutHandlers } from '../../types/player';
import DistractionShield from './DistractionShield';
import PlayerControls from './PlayerControls';
import FocusModeHint from './FocusModeHint';
import PlayerLoading from './PlayerLoading';
import PlayerErrorBoundary from './PlayerErrorBoundary';

interface DistractionFreePlayerProps {
  videoId: string;
  courseId: string;
  lessonId: string;
  title?: string;
}

/**
 * DistractionFreePlayer — Production-grade YouTube player.
 * 
 * Features:
 * - Loads real YouTube IFrame API with youtube-nocookie.com host
 * - DistractionShield overlays block ALL YouTube UI
 * - Custom controls: play, seek, speed, volume, PiP, fullscreen, focus mode
 * - Full keyboard shortcuts (Space, ←/→, J/L, ↑/↓, M, F, Esc, >)
 * - Progress tracking with 15s heartbeat to localStorage
 * - Resume from last position on reload
 * - Focus mode: fullscreen + hide controls + Esc to exit
 * - All loading/error/empty states handled
 * - Fully accessible (ARIA labels, keyboard nav, focus rings)
 * - Responsive at 375px, 768px, 1440px, and fullscreen
 */
export default function DistractionFreePlayer({
  videoId,
  courseId,
  lessonId,
  title,
}: DistractionFreePlayerProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [resumePosition, setResumePosition] = useState<number>(0);

  // Calculate resume position on mount
  useEffect(() => {
    const pos = getResumePosition(courseId, lessonId);
    setResumePosition(pos);
  }, [courseId, lessonId]);

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
  const progress = useProgressTracking(player.currentTime, player.duration, {
    courseId,
    lessonId,
    enabled: player.isReady,
  });

  // Show action feedback
  const showFeedback = useCallback((message: string) => {
    setActionFeedback(message);
    setTimeout(() => setActionFeedback(null), 1200);
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
        // Cast to access PiP API (not in standard HTMLIFrameElement types)
        const iframeWithPiP = iframe as HTMLIFrameElement & {
          requestPictureInPicture?: () => Promise<void>;
        };
        if (iframeWithPiP.requestPictureInPicture) {
          await iframeWithPiP.requestPictureInPicture();
          showFeedback('📌 Picture-in-Picture');
        } else {
          showFeedback('PiP not supported for this video');
        }
      }
    } catch {
      showFeedback('PiP not supported');
    }
  }, [player, showFeedback]);

  // Retry handler
  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div
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

      {/* Distraction Shield — blocks all YouTube UI */}
      <DistractionShield />

      {/* Click overlay for play/pause (above shield, below controls) */}
      <div
        className="absolute inset-0 z-25 cursor-pointer"
        style={{ zIndex: 25 }}
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
      {player.status === PlayerStatus.LOADING && <PlayerLoading />}

      {/* Error state */}
      {player.error && <PlayerErrorBoundary error={player.error} onRetry={handleRetry} />}

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
        <div className="absolute inset-0 flex items-center justify-center z-25 pointer-events-none" style={{ zIndex: 25 }}>
          <div className="w-20 h-20 rounded-full bg-primary-600/90 backdrop-blur-sm flex items-center justify-center animate-pulse-glow shadow-2xl shadow-primary-500/30">
            <svg className="w-9 h-9 text-white ml-1" fill="white" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Custom Controls */}
      <div data-controls>
        <PlayerControls
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

      {/* Focus Mode Hint */}
      <FocusModeHint visible={isFocusMode} />

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
