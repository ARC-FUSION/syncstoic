/**
 * DistractionShield — Overlay masks that block YouTube UI
 *
 * Three absolutely positioned divs that sit above the iframe (z-20)
 * and block all pointer events to prevent interaction with YouTube's
 * native UI elements.
 *
 * Coverage:
 * - Top bar: title, channel name, share button (h-16, full width)
 * - Bottom-right: YouTube logo/watermark (w-40, h-12)
 * - Center: end-screen suggestions when paused (inset-0)
 */
export default function DistractionShield() {
  return (
    <>
      {/* Top bar overlay — covers title, channel, share button */}
      <div
        className="absolute top-0 left-0 right-0 h-16 z-20 pointer-events-auto"
        aria-hidden="true"
        data-shield="top"
      />

      {/* Bottom-right overlay — covers YouTube logo/watermark */}
      <div
        className="absolute bottom-0 right-0 w-40 h-12 z-20 pointer-events-auto"
        aria-hidden="true"
        data-shield="bottom-right"
      />

      {/* Center overlay — covers end-screen suggestions when paused */}
      <div
        className="absolute inset-0 z-20 pointer-events-auto"
        aria-hidden="true"
        data-shield="center"
      />
    </>
  );
}
