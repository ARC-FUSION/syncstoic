import { useState } from 'react';
import { PlaybackSpeed, PLAYBACK_SPEEDS } from '../../types/player';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Focus,
  PictureInPicture2,
} from 'lucide-react';

interface PlayerControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  isFocusMode: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: PlaybackSpeed;
  buffered: number;
  visible: boolean;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onSetVolume: (level: number) => void;
  onToggleMute: () => void;
  onSetPlaybackRate: (rate: PlaybackSpeed) => void;
  onToggleFullscreen: () => void;
  onToggleFocusMode: () => void;
  onRequestPiP: () => void;
}

/** Format seconds to M:SS or H:MM:SS */
function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PlayerControls({
  isPlaying,
  isMuted,
  isFullscreen,
  isFocusMode,
  currentTime,
  duration,
  volume,
  playbackRate,
  buffered,
  visible,
  onTogglePlay,
  onSeek,
  onSetVolume,
  onToggleMute,
  onSetPlaybackRate,
  onToggleFullscreen,
  onToggleFocusMode,
  onRequestPiP,
}: PlayerControlsProps) {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isSeekHovering, setIsSeekHovering] = useState(false);
  const [seekPreview, setSeekPreview] = useState<number | null>(null);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = buffered * 100;

  const handleSeekbarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(percent * duration);
  };

  const handleSeekbarHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setSeekPreview(percent * duration);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSetVolume(Number(e.target.value));
  };

  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-30 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {/* Gradient background for visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

      <div className="relative px-3 sm:px-4 pb-3 sm:pb-4 pt-12">
        {/* Seekbar */}
        <div
          className="group/seek relative h-5 sm:h-6 flex items-center cursor-pointer mb-2"
          onClick={handleSeekbarClick}
          onMouseMove={handleSeekbarHover}
          onMouseEnter={() => setIsSeekHovering(true)}
          onMouseLeave={() => {
            setIsSeekHovering(false);
            setSeekPreview(null);
          }}
          role="slider"
          aria-label="Video progress"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={currentTime}
          aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
          tabIndex={0}
        >
          {/* Track */}
          <div className="absolute w-full h-1 group-hover/seek:h-2 transition-all bg-white/20 rounded-full overflow-hidden">
            {/* Buffered */}
            <div
              className="absolute h-full bg-white/30 rounded-full"
              style={{ width: `${bufferedPercent}%` }}
            />
            {/* Progress */}
            <div
              className="absolute h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-[width] duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {/* Thumb */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full shadow-lg transition-opacity ${
              isSeekHovering ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ left: `calc(${progressPercent}% - 7px)` }}
          />
          {/* Seek preview tooltip */}
          {seekPreview !== null && isSeekHovering && (
            <div
              className="absolute -top-8 bg-black/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md transform -translate-x-1/2 pointer-events-none"
              style={{ left: `${(seekPreview / Math.max(duration, 1)) * 100}%` }}
            >
              {formatTime(seekPreview)}
            </div>
          )}
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between gap-2">
          {/* Left controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Play/Pause */}
            <button
              onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              aria-label={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" fill="white" />
              ) : (
                <Play className="w-5 h-5 text-white" fill="white" />
              )}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1 group/vol">
              <button
                onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                aria-label={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              >
                {isMuted || volume === 0 ? (
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
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  onClick={(e) => e.stopPropagation()}
                  className="w-20 h-1 cursor-pointer"
                  aria-label="Volume"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={isMuted ? 0 : volume}
                />
              </div>
            </div>

            {/* Time display */}
            <span className="text-white/70 text-xs sm:text-sm font-mono tabular-nums hidden sm:block">
              {formatTime(currentTime)}
              <span className="text-white/30 mx-1">/</span>
              {formatTime(duration)}
            </span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Speed */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); }}
                className={`px-2 py-1 rounded-lg transition-colors text-xs sm:text-sm font-semibold focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none ${
                  playbackRate !== 1
                    ? 'text-primary-400 bg-primary-500/10 hover:bg-primary-500/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                aria-label={`Playback speed: ${playbackRate}x. Click to change.`}
                title="Playback speed (Shift+>)"
              >
                {playbackRate}x
              </button>
              {showSpeedMenu && (
                <div
                  className="absolute bottom-full right-0 mb-2 bg-surface-light/95 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-2xl min-w-[100px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {PLAYBACK_SPEEDS.map((speed) => (
                    <button
                      key={speed}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetPlaybackRate(speed);
                        setShowSpeedMenu(false);
                      }}
                      className={`block w-full px-3 py-2 text-sm text-left hover:bg-white/5 transition-colors flex items-center justify-between ${
                        playbackRate === speed ? 'text-primary-400 font-medium' : 'text-white/70'
                      }`}
                      aria-label={`Set speed to ${speed}x`}
                    >
                      <span>{speed === 1 ? 'Normal' : `${speed}x`}</span>
                      {playbackRate === speed && <span className="text-primary-400">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PiP */}
            <button
              onClick={(e) => { e.stopPropagation(); onRequestPiP(); }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none hidden sm:block"
              aria-label="Picture-in-Picture"
              title="Picture-in-Picture"
            >
              <PictureInPicture2 className="w-5 h-5" />
            </button>

            {/* Focus Mode */}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFocusMode(); }}
              className={`p-2 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none ${
                isFocusMode
                  ? 'text-primary-400 bg-primary-500/10 hover:bg-primary-500/20'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              aria-label={isFocusMode ? 'Exit focus mode' : 'Enter focus mode'}
              title={isFocusMode ? 'Exit focus mode (Esc)' : 'Focus mode'}
            >
              <Focus className="w-5 h-5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFullscreen(); }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              aria-label={isFullscreen ? 'Exit fullscreen (F)' : 'Enter fullscreen (F)'}
              title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
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
  );
}
