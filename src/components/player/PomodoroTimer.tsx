import { usePomodoro } from '../../hooks/usePomodoro';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

interface PomodoroTimerProps {
  onBreakStart: () => void;
  onBreakEnd: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function PomodoroTimer({ onBreakStart, onBreakEnd }: PomodoroTimerProps) {
  const { phase, timeLeft, isRunning, completedPomodoros, start, pause, resume, reset, skip } =
    usePomodoro(onBreakStart, onBreakEnd);

  const getPhaseColor = () => {
    switch (phase) {
      case 'work':
        return 'text-primary-400';
      case 'break':
        return 'text-green-400';
      default:
        return 'text-white/60';
    }
  };

  const getPhaseLabel = () => {
    switch (phase) {
      case 'work':
        return 'Focus Time';
      case 'break':
        return 'Break Time';
      default:
        return 'Pomodoro';
    }
  };

  return (
    <div className="absolute top-4 right-4 z-40 bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl p-4 min-w-[200px]">
      {/* Phase Label */}
      <div className="text-center mb-2">
        <div className={`text-xs font-medium ${getPhaseColor()} mb-1`}>{getPhaseLabel()}</div>
        <div className="text-3xl font-bold text-white font-mono">{formatTime(timeLeft)}</div>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center gap-1 mb-3">
        {Array.from({ length: Math.min(completedPomodoros, 4) }).map((_, i) => (
          <div key={i} className="w-2 h-2 bg-primary-500 rounded-full" />
        ))}
        {Array.from({ length: Math.max(0, 4 - completedPomodoros) }).map((_, i) => (
          <div key={i} className="w-2 h-2 bg-white/20 rounded-full" />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        {phase === 'idle' ? (
          <button
            onClick={start}
            className="p-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
            aria-label="Start pomodoro"
          >
            <Play className="w-4 h-4" fill="white" />
          </button>
        ) : (
          <>
            {isRunning ? (
              <button
                onClick={pause}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                aria-label="Pause timer"
              >
                <Pause className="w-4 h-4" fill="white" />
              </button>
            ) : (
              <button
                onClick={resume}
                className="p-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
                aria-label="Resume timer"
              >
                <Play className="w-4 h-4" fill="white" />
              </button>
            )}
            <button
              onClick={skip}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              aria-label="Skip to next phase"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            <button
              onClick={reset}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              aria-label="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Completed Count */}
      {completedPomodoros > 0 && (
        <div className="text-center mt-2 text-xs text-white/40">
          {completedPomodoros} {completedPomodoros === 1 ? 'pomodoro' : 'pomodoros'} completed
        </div>
      )}
    </div>
  );
}
