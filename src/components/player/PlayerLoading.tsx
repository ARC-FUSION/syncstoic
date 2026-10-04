import { Loader2 } from 'lucide-react';

/**
 * Loading state shown while YouTube IFrame API loads.
 */
export default function PlayerLoading() {
  return (
    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-10">
      <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-3" />
      <p className="text-white/40 text-sm">Loading player...</p>
    </div>
  );
}
