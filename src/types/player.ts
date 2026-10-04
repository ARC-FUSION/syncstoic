/**
 * Player-related types for SyncFocus.
 * Strictly typed — no `any` allowed.
 */

/** Configuration for initializing a YouTube player */
export interface PlayerConfig {
  videoId: string;
  startSeconds?: number;
  courseId: string;
  lessonId: string;
}

/** State of the YouTube player, derived from YT.PlayerState */
export enum PlayerStatus {
  UNSTARTED = 'UNSTARTED',
  ENDED = 'ENDED',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  BUFFERING = 'BUFFERING',
  CUED = 'CUED',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
}

/** Progress entry stored in localStorage */
export interface ProgressEntry {
  lessonId: string;
  courseId: string;
  currentTimeSec: number;
  durationSec: number;
  isCompleted: boolean;
  lastUpdated: number;
}

/** Shape of the progress store in localStorage */
export type ProgressStore = Record<string, ProgressEntry>;

/** Keyboard shortcut handler map */
export interface ShortcutHandlers {
  togglePlay: () => void;
  seekForward5: () => void;
  seekBackward5: () => void;
  seekForward10: () => void;
  seekBackward10: () => void;
  volumeUp: () => void;
  volumeDown: () => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  exitFocusMode: () => void;
  cycleSpeed: () => void;
}

/** Player action feedback messages */
export type FeedbackAction =
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'seek'; direction: 'forward' | 'backward'; seconds: number }
  | { type: 'volume'; level: number }
  | { type: 'mute'; isMuted: boolean }
  | { type: 'speed'; rate: number }
  | { type: 'focus'; enabled: boolean }
  | { type: 'pip'; enabled: boolean };

/** Available playback speeds */
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

/** Shield overlay positions */
export interface ShieldConfig {
  top: { height: string; width: string };
  bottomRight: { width: string; height: string };
  center: { inset: string };
}

/** Default shield dimensions matching YouTube's UI regions */
export const DEFAULT_SHIELD_CONFIG: ShieldConfig = {
  top: { height: '64px', width: '100%' },
  bottomRight: { width: '160px', height: '48px' },
  center: { inset: '0' },
};

/** Player error types */
export enum PlayerErrorType {
  API_LOAD_FAILED = 'API_LOAD_FAILED',
  VIDEO_NOT_FOUND = 'VIDEO_NOT_FOUND',
  EMBED_DISABLED = 'EMBED_DISABLED',
  UNKNOWN = 'UNKNOWN',
}

export interface PlayerError {
  type: PlayerErrorType;
  message: string;
  videoId: string;
}
