/** A tiny vibration on devices that support it (most Android phones). */
export function tapFeedback(pattern: number | number[] = 10): void {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}
