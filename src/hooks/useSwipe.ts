import { useEffect, type RefObject } from "react";

type SwipeHandlers = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
};

const MIN_DISTANCE_PX = 60;
const MAX_DURATION_MS = 700;
/** How much more horizontal than vertical a gesture must be to count. */
const DIRECTION_RATIO = 1.5;
/** Touches that start inside these never trigger a swipe. */
const IGNORE_SELECTOR = "dialog, input, textarea, [data-no-swipe]";

/** Calls a handler when the user swipes horizontally across the element. */
export function useSwipe(
  ref: RefObject<HTMLElement | null>,
  { onSwipeLeft, onSwipeRight }: SwipeHandlers
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let start: { x: number; y: number; time: number } | null = null;

    const handleTouchStart = (event: TouchEvent) => {
      const target = event.target as Element | null;
      const touch = event.touches[0];

      start =
        event.touches.length === 1 && !target?.closest(IGNORE_SELECTOR)
          ? { x: touch.clientX, y: touch.clientY, time: event.timeStamp }
          : null;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (!start) return;

      const touch = event.changedTouches[0];
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      const isSwipe =
        event.timeStamp - start.time <= MAX_DURATION_MS &&
        Math.abs(dx) >= MIN_DISTANCE_PX &&
        Math.abs(dx) >= Math.abs(dy) * DIRECTION_RATIO;

      start = null;
      if (!isSwipe) return;

      if (dx < 0) {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }
    };

    const handleTouchCancel = () => {
      start = null;
    };

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });
    element.addEventListener("touchcancel", handleTouchCancel);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [ref, onSwipeLeft, onSwipeRight]);
}
