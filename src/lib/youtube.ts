/**
 * YouTube IFrame API Loader — Singleton
 *
 * Loads the YouTube IFrame API script exactly once and returns a promise
 * that resolves when the API is ready.
 *
 * Reference: https://developers.google.com/youtube/iframe_api_reference
 */

let apiLoadPromise: Promise<void> | null = null;

/**
 * Load the YouTube IFrame API.
 * Returns a promise that resolves when `window.YT.Player` is available.
 * Subsequent calls return the same promise (singleton).
 */
export function loadYouTubeAPI(): Promise<void> {
  // Already loaded
  if (window.YT && window.YT.Player) {
    return Promise.resolve();
  }

  // Already loading — return existing promise
  if (apiLoadPromise) {
    return apiLoadPromise;
  }

  apiLoadPromise = new Promise<void>((resolve, reject) => {
    // Check if script tag already exists (e.g., added by another instance)
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src*="youtube.com/iframe_api"]'
    );

    if (existingScript) {
      // Script exists but API not ready yet — poll for readiness
      const pollInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(pollInterval);
          resolve();
        }
      }, 50);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(pollInterval);
        if (!(window.YT && window.YT.Player)) {
          apiLoadPromise = null;
          reject(new Error('YouTube API load timeout'));
        }
      }, 10000);
      return;
    }

    // Inject the script tag
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    tag.id = 'youtube-iframe-api';

    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript.parentNode) {
      firstScript.parentNode.insertBefore(tag, firstScript);
    } else {
      document.head.appendChild(tag);
    }

    // Handle script load error
    tag.onerror = () => {
      apiLoadPromise = null;
      reject(new Error('Failed to load YouTube IFrame API script'));
    };

    // YouTube calls this global function when the API is ready
    window.onYouTubeIframeAPIReady = () => {
      resolve();
    };

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!(window.YT && window.YT.Player)) {
        apiLoadPromise = null;
        reject(new Error('YouTube API load timeout'));
      }
    }, 10000);
  });

  return apiLoadPromise;
}

/**
 * Check if the YouTube API is already loaded.
 */
export function isYouTubeAPIReady(): boolean {
  return !!(window.YT && window.YT.Player);
}
