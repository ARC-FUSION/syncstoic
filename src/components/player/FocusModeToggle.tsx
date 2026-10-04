import { useEffect, useState } from 'react';

/**
 * FocusModeToggle props
 */
interface FocusModeToggleProps {
  isFocusMode: boolean;
  onToggle: () => void;
}

/**
 * FocusModeToggle — Focus mode button + hint overlay
 *
 * Shows a "Focus Mode Active" badge when enabled.
 * Displays "Press Esc to exit" hint for 3 seconds, then fades out.
 */
export default function FocusModeToggle({ isFocusMode }: FocusModeToggleProps) {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (isFocusMode) {
      setShowHint(true);
      const timer = setTimeout(() => setShowHint(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowHint(false);
    }
  }, [isFocusMode]);

  if (!isFocusMode) return null;

  return (
    <>
      {/* Focus Mode Badge — top-left */}
      <div className="absolute top-4 left-4 z-40 animate-fade-in pointer-events-none">
        <div className="bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2 shadow-lg">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white/90 text-xs font-medium">Focus Mode Active</span>
        </div>
      </div>

      {/* "Press Esc to exit" hint — fades after 3s */}
      {showHint && (
        <div className="absolute top-16 left-4 z-40 animate-fade-in pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white/60 text-xs">
            Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded mx-1 font-mono">Esc</kbd> to exit
          </div>
        </div>
      )}
    </>
  );
}
