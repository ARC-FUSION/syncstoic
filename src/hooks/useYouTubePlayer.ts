import { useState, useEffect, useRef, useCallback } from 'react';

interface UseYouTubePlayerOptions {
  videoId: string;
  startSeconds?: number;
  onProgress?: (currentTime: number, duration: number) => void;
  onStateChange?: (state: PlayerState) => void;
}

export enum PlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}

export function useYouTubePlayer({ videoId, startSeconds = 0, onProgress, onStateChange }: UseYouTubePlayerOptions) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  }, []);

  // Initialize player
  useEffect(() => {
    if (!containerRef.current) return;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          origin: window.location.origin,
          start: startSeconds,
        },
        events: {
          onReady: (event: any) => {
            setIsReady(true);
            setIsLoaded(true);
            const dur = event.target.getDuration();
            setDuration(dur);
            event.target.setVolume(100);
          },
          onStateChange: (event: any) => {
            const state = event.data as PlayerState;
            setIsPlaying(state === PlayerState.PLAYING);
            onStateChange?.(state);

            if (state === PlayerState.PLAYING) {
              startProgressTracking();
            } else {
              stopProgressTracking();
            }

            if (state === PlayerState.ENDED) {
              stopProgressTracking();
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      stopProgressTracking();
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  const startProgressTracking = useCallback(() => {
    stopProgressTracking();
    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current && isReady) {
        const time = playerRef.current.getCurrentTime();
        const dur = playerRef.current.getDuration();
        setCurrentTime(time);
        setDuration(dur);
        onProgress?.(time, dur);
      }
    }, 1000);
  }, [isReady, onProgress]);

  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

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

  const seek = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true);
    setCurrentTime(seconds);
  }, []);

  const seekBy = useCallback((offset: number) => {
    if (!playerRef.current) return;
    const newTime = Math.max(0, Math.min(currentTime + offset, duration));
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  }, [currentTime, duration]);

  const setVolumeLevel = useCallback((level: number) => {
    playerRef.current?.setVolume(level);
    setVolume(level);
    if (level > 0 && isMuted) {
      playerRef.current?.unMute();
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      playerRef.current?.unMute();
      setIsMuted(false);
    } else {
      playerRef.current?.mute();
      setIsMuted(true);
    }
  }, [isMuted]);

  const changePlaybackRate = useCallback((rate: number) => {
    playerRef.current?.setPlaybackRate(rate);
    setPlaybackRate(rate);
  }, []);

  const cyclePlaybackRate = useCallback(() => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    changePlaybackRate(rates[nextIndex]);
  }, [playbackRate, changePlaybackRate]);

  return {
    containerRef,
    isReady,
    isPlaying,
    isLoaded,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    play,
    pause,
    togglePlay,
    seek,
    seekBy,
    setVolume: setVolumeLevel,
    toggleMute,
    changePlaybackRate,
    cyclePlaybackRate,
  };
}
