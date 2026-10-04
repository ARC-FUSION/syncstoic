/**
 * Strict TypeScript declarations for the YouTube IFrame Player API.
 * Reference: https://developers.google.com/youtube/iframe_api_reference
 */

declare namespace YT {
  enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5,
  }

  type PlaybackQuality = 'small' | 'medium' | 'large' | 'hd720' | 'hd1080' | 'highres' | 'default';

  interface PlayerEvent {
    target: Player;
    data: number;
  }

  enum PlayerErrorCode {
    INVALID_VIDEO_ID = 2,
    HTML5_ERROR = 5,
    VIDEO_NOT_FOUND = 100,
    EMBED_NOT_ALLOWED = 101,
    EMBED_NOT_ALLOWED_2 = 150,
  }

  interface OnErrorEvent {
    target: Player;
    data: PlayerErrorCode;
  }

  interface PlayerOptions {
    width?: number | string;
    height?: number | string;
    videoId?: string;
    playerVars?: PlayerVars;
    events?: PlayerEvents;
  }

  interface PlayerVars {
    autoplay?: 0 | 1;
    cc_load_policy?: 0 | 1;
    controls?: 0 | 1;
    disablekb?: 0 | 1;
    end?: number;
    fs?: 0 | 1;
    hl?: string;
    iv_load_policy?: 1 | 3;
    list?: string;
    listType?: 'playlist' | 'user_uploads';
    loop?: 0 | 1;
    modestbranding?: 0 | 1;
    origin?: string;
    playlist?: string;
    playsinline?: 0 | 1;
    rel?: 0 | 1;
    start?: number;
    widget_referrer?: string;
    host?: string;
  }

  interface PlayerEvents {
    onReady?: (event: PlayerEvent) => void;
    onStateChange?: (event: PlayerEvent) => void;
    onPlaybackQualityChange?: (event: PlayerEvent) => void;
    onPlaybackRateChange?: (event: PlayerEvent) => void;
    onError?: (event: OnErrorEvent) => void;
    onApiChange?: (event: PlayerEvent) => void;
  }

  interface Player {
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    getPlayerState(): PlayerState;
    mute(): void;
    unMute(): void;
    isMuted(): boolean;
    setVolume(volume: number): void;
    getVolume(): number;
    setPlaybackRate(suggestedRate: number): void;
    getPlaybackRate(): number;
    getAvailablePlaybackRates(): number[];
    getDuration(): number;
    getCurrentTime(): number;
    getVideoLoadedFraction(): number;
    getVideoUrl(): string;
    getVideoEmbedCode(): string;
    getPlaybackQuality(): PlaybackQuality;
    setPlaybackQuality(suggestedQuality: PlaybackQuality): void;
    getAvailableQualityLevels(): PlaybackQuality[];
    cueVideoById(options: { videoId: string; startSeconds?: number; endSeconds?: number; suggestedQuality?: PlaybackQuality }): void;
    loadVideoById(options: { videoId: string; startSeconds?: number; endSeconds?: number; suggestedQuality?: PlaybackQuality }): void;
    cueVideoByUrl(options: { videoUrl: string; startSeconds?: number; endSeconds?: number; suggestedQuality?: PlaybackQuality }): void;
    loadVideoByUrl(options: { videoUrl: string; startSeconds?: number; endSeconds?: number; suggestedQuality?: PlaybackQuality }): void;
    setSize(width: number, height: number): void;
    destroy(): void;
    getIframe(): HTMLIFrameElement;
    addEventListener(event: string, listener: (event: PlayerEvent) => void): void;
    removeEventListener(event: string, listener: (event: PlayerEvent) => void): void;
  }

  interface PlayerConstructor {
    new (elementId: string | HTMLElement, options: PlayerOptions): Player;
  }
}

interface Window {
  YT: {
    Player: YT.PlayerConstructor;
    PlayerState: typeof YT.PlayerState;
    ready: (callback: () => void) => void;
  };
  onYouTubeIframeAPIReady: (() => void) | undefined;
}
