import { useEffect, useCallback } from 'react';

interface KeyboardShortcutHandlers {
  togglePlay: () => void;
  seekForward: (seconds?: number) => void;
  seekBackward: (seconds?: number) => void;
  volumeUp: () => void;
  volumeDown: () => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  nextSpeed: () => void;
  skipForward10: () => void;
  skipBackward10: () => void;
}

export function useKeyboardShortcuts(
  handlers: KeyboardShortcutHandlers,
  enabled: boolean = true,
  containerRef?: React.RefObject<HTMLElement>
) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    
    // Don't trigger if user is typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (e.key.toLowerCase()) {
      case ' ':
      case 'k':
        e.preventDefault();
        handlers.togglePlay();
        break;
      case 'arrowright':
      case 'l':
        e.preventDefault();
        handlers.seekForward(5);
        break;
      case 'arrowleft':
      case 'j':
        e.preventDefault();
        handlers.seekBackward(5);
        break;
      case 'arrowup':
        e.preventDefault();
        handlers.volumeUp();
        break;
      case 'arrowdown':
        e.preventDefault();
        handlers.volumeDown();
        break;
      case 'm':
        e.preventDefault();
        handlers.toggleMute();
        break;
      case 'f':
        e.preventDefault();
        handlers.toggleFullscreen();
        break;
      case '>':
        if (e.shiftKey) {
          e.preventDefault();
          handlers.nextSpeed();
        }
        break;
      case '0':
        e.preventDefault();
        handlers.skipBackward10();
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        // Could seek to percentage - not implementing for now
        break;
    }
  }, [handlers, enabled]);

  useEffect(() => {
    const target = containerRef?.current || document;
    target.addEventListener('keydown', handleKeyDown as EventListener);
    return () => target.removeEventListener('keydown', handleKeyDown as EventListener);
  }, [handleKeyDown, containerRef]);
}
