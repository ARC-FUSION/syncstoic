import { useEffect, useState } from 'react';

interface FocusModeHintProps {
  visible: boolean;
}

/**
 * Subtle hint shown when entering focus mode.
 * Fades out after 3 seconds.
 */
export default function FocusModeHint({ visible }: FocusModeHintProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [visible]);

  if (!show) return null;

  return (
    <div className="absolute top-4 left-4 z-40 animate-fade-in pointer-events-none">
      <div className="bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2 shadow-lg">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-white/90 text-xs font-medium">Focus Mode Active</span>
        <span className="text-white/40 text-xs ml-2">Press Esc to exit</span>
      </div>
    </div>
  );
}
