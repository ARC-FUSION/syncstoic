import { AlertCircle, RefreshCw } from 'lucide-react';
import { PlayerError } from '../../types/player';

interface PlayerErrorBoundaryProps {
  error: PlayerError;
  onRetry: () => void;
}

/**
 * Error state shown when player fails to load or video is unavailable.
 */
export default function PlayerErrorBoundary({ error, onRetry }: PlayerErrorBoundaryProps) {
  return (
    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-10 px-4">
      <div className="max-w-md text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-white font-semibold text-lg mb-2">Player Error</h3>
        <p className="text-white/60 text-sm mb-6">{error.message}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-medium px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-primary-500/20 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
          aria-label="Retry loading video"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    </div>
  );
}
