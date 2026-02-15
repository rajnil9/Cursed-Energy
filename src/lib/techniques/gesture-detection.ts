/**
 * Hand gesture detection helpers - improved accuracy with stricter thresholds
 */

type Landmark = { x: number; y: number };

// Stricter thresholds to reduce cross-detection between similar gestures
const EXTENSION_THRESHOLD = 0.04; // Finger must extend this far above PIP to count as "up"
const CURL_DISTANCE = 0.20;      // Fingertip must be this close to wrist to count as "curled"
const PINCH_MAX = 0.055;         // Tighter pinch threshold for Hollow Purple

/**
 * Finger is CLEARLY extended up - tip is significantly above PIP joint
 */
function isFingerUp(lm: Landmark[], tip: number, pip: number): boolean {
  const extension = lm[pip].y - lm[tip].y; // positive when tip is above pip
  return extension > EXTENSION_THRESHOLD;
}

/**
 * Finger is CLEARLY curled down - tip is close to wrist (palm)
 */
function isFingerDown(lm: Landmark[], tip: number, wrist: Landmark): boolean {
  const d = Math.hypot(lm[tip].x - wrist.x, lm[tip].y - wrist.y);
  return d < CURL_DISTANCE;
}

/**
 * Finger is clearly NOT up (either curled or neutral) - avoids ambiguous half-extended state
 */
function isFingerNotUp(lm: Landmark[], tip: number, pip: number): boolean {
  const extension = lm[pip].y - lm[tip].y;
  return extension <= EXTENSION_THRESHOLD;
}

export function isFist(lm: Landmark[]) {
  const wrist = lm[0];
  const allCurled =
    isFingerDown(lm, 8, wrist) &&
    isFingerDown(lm, 12, wrist) &&
    isFingerDown(lm, 16, wrist) &&
    isFingerDown(lm, 20, wrist);
  const indexUp = isFingerUp(lm, 8, 6);
  const middleUp = isFingerUp(lm, 12, 10);
  const ringUp = isFingerUp(lm, 16, 14);
  const pinkyUp = isFingerUp(lm, 20, 18);
  return allCurled && !indexUp && !middleUp && !ringUp && !pinkyUp;
}

export function isDismantleGesture(lm: Landmark[]): boolean {
  return (
    isFingerUp(lm, 8, 6) &&
    isFingerUp(lm, 12, 10) &&
    isFingerUp(lm, 16, 14) &&
    isFingerNotUp(lm, 20, 18) // Pinky must be clearly down
  );
}

export function isShrineGesture(lm: Landmark[]): boolean {
  return (
    isFingerUp(lm, 8, 6) &&
    isFingerUp(lm, 12, 10) &&
    isFingerUp(lm, 16, 14) &&
    isFingerUp(lm, 20, 18)
  );
}

export function isVoidGesture(lm: Landmark[]): boolean {
  // Peace sign - index and middle up, ring and pinky clearly down
  return (
    isFingerUp(lm, 8, 6) &&
    isFingerUp(lm, 12, 10) &&
    isFingerNotUp(lm, 16, 14) &&
    isFingerNotUp(lm, 20, 18)
  );
}

export function isRedGesture(lm: Landmark[]): boolean {
  // Index only - middle, ring, pinky must be clearly down
  return (
    isFingerUp(lm, 8, 6) &&
    isFingerNotUp(lm, 12, 10) &&
    isFingerNotUp(lm, 16, 14) &&
    isFingerNotUp(lm, 20, 18)
  );
}

export function isMegumiGesture(lm: Landmark[]): boolean {
  // Horns - index and pinky up, middle and ring down
  return (
    isFingerUp(lm, 8, 6) &&
    isFingerNotUp(lm, 12, 10) &&
    isFingerNotUp(lm, 16, 14) &&
    isFingerUp(lm, 20, 18)
  );
}

export function isHakariGesture(lm: Landmark[]): boolean {
  // Thumb only
  const thumbUp = lm[4].y < lm[3].y - 0.02 && lm[4].y < lm[2].y;
  const indexUp = isFingerUp(lm, 8, 6);
  const middleUp = isFingerUp(lm, 12, 10);
  const ringUp = isFingerUp(lm, 16, 14);
  const pinkyUp = isFingerUp(lm, 20, 18);
  return thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp;
}

export function isMahitoGesture(lm: Landmark[]): boolean {
  // Thumb + Pinky
  const thumbUp = lm[4].y < lm[3].y - 0.02 && lm[4].y < lm[2].y;
  const indexUp = isFingerUp(lm, 8, 6);
  const middleUp = isFingerUp(lm, 12, 10);
  const ringUp = isFingerUp(lm, 16, 14);
  const pinkyUp = isFingerUp(lm, 20, 18);
  return thumbUp && !indexUp && !middleUp && !ringUp && pinkyUp;
}

export function isPinchGesture(lm: Landmark[]): boolean {
  const dist = Math.hypot(lm[8].x - lm[4].x, lm[8].y - lm[4].y);
  return dist < PINCH_MAX;
}
