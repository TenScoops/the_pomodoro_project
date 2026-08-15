import { useEffect, useState } from "react";
import { waitForImage } from "../lib/waitForImage";

// Types
export type ThemeBackgroundState = {
  displayedBackgroundUrl: string | null;
  themeSwitchLoading: boolean;
};

// Constants
/** Keep the overlay up long enough that a fast decode does not flash. */
const THEME_SWITCH_MIN_MS = 1000;

// Helpers
function waitRemainingMinDuration(elapsedMs: number): Promise<void> {
  if (elapsedMs >= THEME_SWITCH_MIN_MS) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    window.setTimeout(resolve, THEME_SWITCH_MIN_MS - elapsedMs);
  });
}

// Hook
/**
 * Paints the previous theme until the next image has decoded,
 * so the background never flashes an unloaded asset.
 */
export function useThemeBackground(themeUrl: string): ThemeBackgroundState {
  const [displayedBackgroundUrl, setDisplayedBackgroundUrl] = useState<string | null>(null);
  const [themeSwitchLoading, setThemeSwitchLoading] = useState(false);

  useEffect(() => {
    if (displayedBackgroundUrl === themeUrl) {
      setThemeSwitchLoading(false);
      return;
    }

    let cancelled = false;

    const loadThemeImage = async () => {
      if (displayedBackgroundUrl === null) {
        await waitForImage(themeUrl);
        if (!cancelled) {
          setDisplayedBackgroundUrl(themeUrl);
        }
        return;
      }

      setThemeSwitchLoading(true);
      const startedAt = Date.now();
      await waitForImage(themeUrl);
      await waitRemainingMinDuration(Date.now() - startedAt);
      if (!cancelled) {
        setDisplayedBackgroundUrl(themeUrl);
        setThemeSwitchLoading(false);
      }
    };

    void loadThemeImage();

    return () => {
      cancelled = true;
    };
  }, [themeUrl, displayedBackgroundUrl]);

  return { displayedBackgroundUrl, themeSwitchLoading };
}
