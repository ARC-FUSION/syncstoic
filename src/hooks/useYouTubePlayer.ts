import { useState, useEffect, useRef, useCallback } from 'react';
import { PlayerStatus, PlayerError, PlayerErrorType, PlaybackSpeed, PLAYBACK_SPEEDS } from '../types/player';

interface UseYouTubePlayerOptions {
  videoId: string;
  startSeconds?: number;
  onStateChange?: (status: PlayerStatus) => void;
  onError?: (error: PlayerError) => void;
}

interface UseYouTubePlayerReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  playerRef: React.RefObject<YT.Player | null>;
  status: PlayerStatus;
  isReady: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: PlaybackSpeed;
  buffered: number;
  error: PlayerError | null;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seekTo: (seconds: number) => void;
  seekBy: (offset: number) => void;
  setVolume: (level: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: PlaybackSpeed) => void;
  cyclePlaybackRate: () => void;
  getPlayer: () => YT.Player | null;
}

/** Load the YouTube IFrame API script exactly once */
function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
    if (existingScript) {
      const checkReady = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkReady);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkReady);
        reject(new Error('YouTube API load timeout'));
      }, 10000);
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;

    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript.parentNode) {
      firstScript.parentNode.insertBefore(tag, firstScript);
    }

    tag.onerror = () => reject(new Error('Failed to load YouTube IFrame API'));

    window.onYouTubeIframeAPIReady = () => {
      resolve();
    };
  });
}

/** Map YT.PlayerState to our PlayerStatus */
function mapYTState(state: number): PlayerStatus {
  switch (state) {
    case YT.PlayerState.UNSTARTED: return PlayerStatus.UNSTARTED;
    case YT.PlayerState.ENDED: return PlayerStatus.ENDED;
    case YT.PlayerState.PLAYING: return PlayerStatus.PLAYING;
    case YT.PlayerState.PAUSED: return PlayerStatus.PAUSED;
    case YT.PlayerState.BUFFERING: return PlayerStatus.BUFFERING;
    case YT.PlayerState.CUED: return PlayerStatus.CUED;
    default: return PlayerStatus.UNSTARTED;
  }
}

/** Map YT error codes to our error types */
function mapYTError(code: number): PlayerErrorType {
  switch (code) {
    case 2: return PlayerErrorType.VIDEO_NOT_FOUND;
    case 5: return PlayerErrorType.EMBED_DISABLED;
    case 100: return PlayerErrorType.VIDEO_NOT_FOUND;
    case 101: return PlayerErrorType.EMBED_DISABLED;
    case 150: return PlayerErrorType.EMBED_DISABLED;
    default: return PlayerErrorType.UNKNOWN;
  }
}

function getErrorMessage(type: PlayerErrorType): string {
  switch (type) {
    case PlayerErrorType.VIDEO_NOT_FOUND:
      return 'This video is unavailable or has been removed.';
    case PlayerErrorType.EMBED_DISABLED:
      return 'The video owner has disabled embedding.';
    case PlayerErrorType.API_LOAD_FAILED:
      return 'Failed to load the video player. Please check your connection.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

export function useYouTubePlayer({
  videoId,
  startSeconds = 0,
  onStateChange,
  onError,
}: UseYouTubePlayerOptions): UseYouTubePlayerReturn {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [status, setStatus] = useState<PlayerStatus>(PlayerStatus.LOADING);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [playbackRate, setPlaybackRateState] = useState<PlaybackSpeed>(1);
  const [buffered, setBuffered] = useState(0);
  const [error, setError] = useState<PlayerError | null>(null);

  // Polling for time/duration updates (since YT API doesn't have events for these)
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return;
    pollIntervalRef.current = setInterval(() => {
      if (playerRef.current && isReady) {
        try {
          setCurrentTime(playerRef.current.getCurrentTime());
          setDuration(playerRef.current.getDuration());
          setBuffered(playerRef.current.getVideoLoadedFraction());
          setIsMuted(playerRef.current.isMuted());
          setVolumeState(playerRef.current.getVolume());
          setPlaybackRateState(playerRef.current.getPlaybackRate() as PlaybackSpeed);
        } catch {
          // Player might be destroyed
        }
      }
    }, 250);
  }, [isReady]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Initialize player
  useEffect(() => {
    let destroyed = false;

    const initPlayer = async () => {
      if (!containerRef.current) return;

      try {
        await loadYouTubeAPI();
      } catch {
        if (!destroyed) {
          const err: PlayerError = {
            type: PlayerErrorType.API_LOAD_FAILED,
            message: getErrorMessage(PlayerErrorType.API_LOAD_FAILED),
            videoId,
          };
          setError(err);
          setStatus(PlayerStatus.ERROR);
          onError?.(err);
        }
        return;
      }

      if (destroyed || !containerRef.current) return;

      // Destroy existing player if any
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Ignore destroy errors
        }
        playerRef.current = null;
      }

      setStatus(PlayerStatus.LOADING);
      setError(null);

      const player = new window.YT.Player(containerRef.current, {
        width: '100%',
        height: '100%',
        videoId,
        playerVars: {
          controls: 0,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          fs: 0,
          disablekb: 1,
          playsinline: 1,
          autoplay: 0,
          origin: window.location.origin,
          host: 'https://www.youtube-nocookie.com',
          start: startSeconds > 0 ? startSeconds : undefined,
        },
        events: {
          onReady: (event) => {
            if (destroyed) return;
            setIsReady(true);
            setStatus(PlayerStatus.CUED);
            setDuration(event.target.getDuration());
            setVolumeState(event.target.getVolume());
            setIsMuted(event.target.isMuted());
            startPolling();

            // Resume from start position if needed
            if (startSeconds > 5) {
              event.target.seekTo(startSeconds, true);
            }
          },
          onStateChange: (event) => {
            if (destroyed) return;
            const newStatus = mapYTState(event.data);
            setStatus(newStatus);
            setIsPlaying(newStatus === PlayerStatus.PLAYING);
            onStateChange?.(newStatus);
          },
          onError: (event) => {
            if (destroyed) return;
            const errorType = mapYTError(event.data);
            const err: PlayerError = {
              type: errorType,
              message: getErrorMessage(errorType),
              videoId,
            };
            setError(err);
            setStatus(PlayerStatus.ERROR);
            onError?.(err);
          },
        },
      });

      playerRef.current = player;
    };

    initPlayer();

    return () => {
      destroyed = true;
      stopPolling();
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Ignore
        }
        playerRef.current = null;
      }
    };
  }, [videoId, startSeconds, onStateChange, onError, startPolling, stopPolling]);

  // Player control methods
  const play = useCallback(() => {
    playerRef.current?.playVideo();
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo();
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seekTo = useCallback((seconds: number) => {
    if (!playerRef.current) return;
    const clamped = Math.max(0, Math.min(seconds, duration));
    playerRef.current.seekTo(clamped, true);
    setCurrentTime(clamped);
  }, [duration]);

  const seekBy = useCallback((offset: number) => {
    seekTo(currentTime + offset);
  }, [currentTime, seekTo]);

  const setVolume = useCallback((level: number) => {
    if (!playerRef.current) return;
    const clamped = Math.max(0, Math.min(100, level));
    playerRef.current.setVolume(clamped);
    setVolumeState(clamped);
    if (clamped > 0 && playerRef.current.isMuted()) {
      playerRef.current.unMute();
      setIsMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    if (playerRef.current.isMuted()) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  }, []);

  const setPlaybackRate = useCallback((rate: PlaybackSpeed) => {
    playerRef.current?.setPlaybackRate(rate);
    setPlaybackRateState(rate);
  }, []);

  const cyclePlaybackRate = useCallback(() => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
    const nextRate = PLAYBACK_SPEEDS[nextIndex];
    setPlaybackRate(nextRate);
  }, [playbackRate, setPlaybackRate]);

  const getPlayer = useCallback(() => playerRef.current, []);

  return {
    containerRef,
    playerRef,
    status,
    isReady,
    isPlaying,
    isMuted,
    currentTime,
    duration,
    volume,
    playbackRate,
    buffered,
    error,
    play,
    pause,
    togglePlay,
    seekTo,
    seekBy,
    setVolume,
    toggleMute,
    setPlaybackRate,
    cyclePlaybackRate,
    getPlayer,
  };
}
