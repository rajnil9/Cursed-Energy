/**
 * Hand gesture detection helpers for Black Flash and Dismantle
 */

export function isFist(lm: { x: number; y: number }[]) {
  const wrist = lm[0];
  const isCurled = (tip: number) => {
    const d = Math.hypot(lm[tip].x - wrist.x, lm[tip].y - wrist.y);
    return d < 0.22;
  };
  const isUp = (tip: number, pip: number) => lm[tip].y < lm[pip].y;
  const allCurled = isCurled(8) && isCurled(12) && isCurled(16) && isCurled(20);
  const indexUp = isUp(8, 6);
  const middleUp = isUp(12, 10);
  const ringUp = isUp(16, 14);
  const pinkyUp = isUp(20, 18);
  return allCurled && !indexUp && !middleUp && !ringUp && !pinkyUp;
}

export function isDismantleGesture(lm: { x: number; y: number }[]) {
  const isUp = (tip: number, pip: number) => lm[tip].y < lm[pip].y;
  const indexUp = isUp(8, 6);
  const middleUp = isUp(12, 10);
  const ringUp = isUp(16, 14);
  const pinkyUp = isUp(20, 18);
  return indexUp && middleUp && ringUp && !pinkyUp;
}
