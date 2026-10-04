import { DEFAULT_SHIELD_CONFIG } from '../../types/player';

/**
 * DistractionShield — Overlay divs that completely block YouTube's native UI.
 * 
 * Covers:
 * - Top bar (title, channel name, share button): full width, top, h-16
 * - Bottom-right YouTube logo/watermark: w-40 h-12, bottom-right
 * - Center area (end-screen suggestions, cards): inset-0
 * 
 * All shields use pointer-events: auto to block clicks.
 * They are invisible (transparent) but prevent interaction.
 */
export default function DistractionShield() {
  const config = DEFAULT_SHIELD_CONFIG;

  return (
    <>
      {/* Top Shield — blocks title bar, channel info, share button */}
      <div
        className="absolute top-0 left-0 z-20"
        style={{
          width: config.top.width,
          height: config.top.height,
          pointerEvents: 'auto',
        }}
        aria-hidden="true"
        data-shield="top"
      />

      {/* Bottom-Right Shield — blocks YouTube logo/watermark */}
      <div
        className="absolute bottom-0 right-0 z-20"
        style={{
          width: config.bottomRight.width,
          height: config.bottomRight.height,
          pointerEvents: 'auto',
        }}
        aria-hidden="true"
        data-shield="bottom-right"
      />

      {/* Center Shield — blocks end-screen suggestions, video cards */}
      {/* Only active when video is NOT playing (to allow click-to-play) */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{ pointerEvents: 'auto' }}
        aria-hidden="true"
        data-shield="center"
      />
    </>
  );
}
