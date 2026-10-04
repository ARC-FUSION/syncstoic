import { useState, useEffect, useRef, useCallback } from 'react';
import { loadYouTubeAPI } from '../lib/youtube';

/**
 * Player status enum — maps to YouTube's PlayerState
 */
export enum PlayerStatus {
  LOADING = 'LOADING',
  UNSTARTED = 'UNSTARTED',
  ENDED = 'ENDED',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  BUFFERING = 'BUFFERING',
  CUED = 'CUED',
  ERROR = 'ERROR',
}

/**
 * Player error type
 */
export interface PlayerError {
  code: number;
  message: string;
}

/**
 * Hook options
 */
interface UseYouTubePlayerOptions {
  videoId: string;
  startSeconds?: number;
  onStateChange?: (status: PlayerStatus) => void;
  onError?: (error: PlayerError) => void;
}

/**
 * Hook return type
 */
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
  playbackRate: number;
  buffered: number;
  error: PlayerError | null;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seekTo: (seconds: number) => void;
  seekBy: (offset: number) => void;
  setVolume: (level: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  cyclePlaybackRate: () => void;
}

/**
 * Map YouTube PlayerState to our PlayerStatus
 */
function mapYTState(state: number): PlayerStatus {
  switch (state) {
    case YT.PlayerState.UNSTARTED:
      return PlayerStatus.UNSTARTED;
    case YT.PlayerState.ENDED:
      return PlayerStatus.ENDED;
    case YT.PlayerState.PLAYING:
      return PlayerStatus.PLAYING;
    case YT.PlayerState.PAUSED:
      return PlayerStatus.PAUSED;
    case YT.PlayerState.BUFFERING:
      return PlayerStatus.BUFFERING;
    case YT.PlayerState.CUED:
      return PlayerStatus.CUED;
    default:
      return PlayerStatus.UNSTARTED;
  }
}

/**
 * Map YouTube error codes to human-readable messages
 */
function getErrorMessage(code: number): string {
  switch (code) {
    case 2:
      return 'Invalid video ID';
    case 5:
      return 'HTML5 player error';
    case 100:
      return 'Video not found';
    case 101:
    case 150:
      return 'Video owner does not allow embedding';
    default:
      return 'Unknown player error';
  }
}

/**
 * YouTube Player Hook
 *
 * Manages the lifecycle of a YouTube IFrame Player instance.
 * Handles loading the API, creating the player, polling state,
 * and providing control methods.
 */
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
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [buffered, setBuffered] = useState(0);
  const [error, setError] = useState<PlayerError | null>(null);

  /**
   * Poll player state every 250ms
   */
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
          setPlaybackRateState(playerRef.current.getPlaybackRate());
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

  /**
   * Initialize player on mount
   */
  useEffect(() => {
    let destroyed = false;

    const initPlayer = async () => {
      if (!containerRef.current) return;

      // Load YouTube API
      try {
        await loadYouTubeAPI();
      } catch (err) {
        if (!destroyed) {
          const error: PlayerError = {
            code: -1,
            message: err instanceof Error ? err.message : 'Failed to load YouTube API',
          };
          setError(error);
          setStatus(PlayerStatus.ERROR);
          onError?.(error);
        }
        return;
      }

      if (destroyed || !containerRef.current) return;

      // Destroy existing player if any
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Ignore
        }
        playerRef.current = null;
      }

      setStatus(PlayerStatus.LOADING);
      setError(null);

      // Create new player
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
          onReady: (event: YT.PlayerEvent) => {
            if (destroyed) return;
            setIsReady(true);
            setStatus(PlayerStatus.CUED);
            setDuration(event.target.getDuration());
            setVolumeState(event.target.getVolume());
            setIsMuted(event.target.isMuted());
            startPolling();

            // Seek to start position if needed
            if (startSeconds > 0) {
              event.target.seekTo(startSeconds, true);
            }
          },
          onStateChange: (event: YT.PlayerEvent) => {
            if (destroyed) return;
            const newStatus = mapYTState(event.data);
            setStatus(newStatus);
            setIsPlaying(newStatus === PlayerStatus.PLAYING);
            onStateChange?.(newStatus);
          },
          onError: (event: YT.OnErrorEvent) => {
            if (destroyed) return;
            const playerError: PlayerError = {
              code: event.data,
              message: getErrorMessage(event.data),
            };
            setError(playerError);
            setStatus(PlayerStatus.ERROR);
            onError?.(playerError);
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

  /**
   * Control methods
   */
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

  const seekTo = useCallback(
    (seconds: number) => {
      if (!playerRef.current) return;
      const clamped = Math.max(0, Math.min(seconds, duration));
      playerRef.current.seekTo(clamped, true);
      setCurrentTime(clamped);
    },
    [duration]
  );

  const seekBy = useCallback(
    (offset: number) => {
      seekTo(currentTime + offset);
    },
    [currentTime, seekTo]
  );

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

  const setPlaybackRate = useCallback((rate: number) => {
    playerRef.current?.setPlaybackRate(rate);
    setPlaybackRateState(rate);
  }, []);

  const cyclePlaybackRate = useCallback(() => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const nextRate = rates[nextIndex];
    setPlaybackRate(nextRate);
  }, [playbackRate, setPlaybackRate]);

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
  };
}
