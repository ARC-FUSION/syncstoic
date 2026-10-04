import { useEffect, useRef, useCallback } from 'react';

/**
 * Keyboard shortcut handlers
 */
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

/**
 * Hook options
 */
interface UseKeyboardShortcutsOptions {
  enabled: boolean;
  containerRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Keyboard Shortcuts Hook
 *
 * Registers keyboard shortcuts for the video player.
 * Only fires when enabled and not focused in an input/textarea.
 *
 * Key bindings:
 * - Space / K → togglePlay
 * - ← / J → seekBackward5 (Shift: seekBackward10)
 * - → / L → seekForward5 (Shift: seekForward10)
 * - ↑ → volumeUp
 * - ↓ → volumeDown
 * - M → toggleMute
 * - F → toggleFullscreen
 * - Esc → exitFocusMode
 * - Shift + > → cycleSpeed
 */
export function useKeyboardShortcuts(
  handlers: ShortcutHandlers,
  { enabled, containerRef }: UseKeyboardShortcutsOptions
): void {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
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
        case '.':
          if (isShift) {
            e.preventDefault();
            h.cycleSpeed();
          }
          break;
      }
    },
    [enabled]
  );

  useEffect(() => {
    const target = containerRef?.current ?? document;
    target.addEventListener('keydown', handleKeyDown as EventListener);
    return () => {
      target.removeEventListener('keydown', handleKeyDown as EventListener);
    };
  }, [handleKeyDown, containerRef]);
}
