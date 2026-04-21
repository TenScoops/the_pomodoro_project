/**
 * Resolves when the browser has finished loading the image, or on error
 * (so the UI never waits forever on a missing asset).
 */
export function waitForImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}
