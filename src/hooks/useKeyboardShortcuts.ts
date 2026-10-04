import { useEffect, useCallback, useRef } from 'react';
import { ShortcutHandlers } from '../types/player';

interface UseKeyboardShortcutsOptions {
  enabled: boolean;
  /** Ref to the container element — shortcuts only fire when focused within */
  containerRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Registers keyboard shortcuts for the video player.
 * All shortcuts follow the spec:
 *   Space/K → play/pause
 *   ←/J    → seek back 5s
 *   →/L    → seek forward 5s
 *   J (hold shift) → seek back 10s (handled separately)
 *   L (hold shift) → seek forward 10s (handled separately)
 *   ↑      → volume up
 *   ↓      → volume down
 *   M      → mute toggle
 *   F      → fullscreen toggle
 *   Esc    → exit focus mode
 *   >      → cycle playback speed
 */
export function useKeyboardShortcuts(
  handlers: ShortcutHandlers,
  { enabled, containerRef }: UseKeyboardShortcutsOptions
): void {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    // Don't intercept when user is typing in an input
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable
    ) {
      return;
    }

    const h = handlersRef.current;
    const key = e.key.toLowerCase();
    const isShift = e.shiftKey;

    switch (key) {
      case ' ':
        e.preventDefault();
        h.togglePlay();
        break;

      case 'k':
        e.preventDefault();
        h.togglePlay();
        break;

      case 'arrowleft':
        e.preventDefault();
        if (isShift) {
          h.seekBackward10();
        } else {
          h.seekBackward5();
        }
        break;

      case 'j':
        e.preventDefault();
        if (isShift) {
          h.seekBackward10();
        } else {
          h.seekBackward5();
        }
        break;

      case 'arrowright':
        e.preventDefault();
        if (isShift) {
          h.seekForward10();
        } else {
          h.seekForward5();
        }
        break;

      case 'l':
        e.preventDefault();
        if (isShift) {
          h.seekForward10();
        } else {
          h.seekForward5();
        }
        break;

      case 'arrowup':
        e.preventDefault();
        h.volumeUp();
        break;

      case 'arrowdown':
        e.preventDefault();
        h.volumeDown();
        break;

      case 'm':
        e.preventDefault();
        h.toggleMute();
        break;

      case 'f':
        e.preventDefault();
        h.toggleFullscreen();
        break;

      case 'escape':
        e.preventDefault();
        h.exitFocusMode();
        break;

      case '>':
        // Shift+. produces '>'
        if (isShift) {
          e.preventDefault();
          h.cycleSpeed();
        }
        break;

      case '.':
        // Also support Shift+. for speed cycling
        if (isShift) {
          e.preventDefault();
          h.cycleSpeed();
        }
        break;
    }
  }, [enabled]);

  useEffect(() => {
    const target = containerRef?.current ?? document;
    target.addEventListener('keydown', handleKeyDown as EventListener);
    return () => {
      target.removeEventListener('keydown', handleKeyDown as EventListener);
    };
  }, [handleKeyDown, containerRef]);
}
