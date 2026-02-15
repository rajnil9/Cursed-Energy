/**
 * Blood Manipulation (Choso) - Particle effect
 * High-pressure blood stream from palm, oriented by wrist/palm normal.
 * Trigger: One hand, all five fingers extended, palm facing camera.
 */

export type BloodOrigin = { x: number; y: number; z: number };
export type BloodDirection = { x: number; y: number; z: number };

const CRIMSON = { r: 0.55, g: 0.0, b: 0.05 };
const STREAM_BRIGHT = { r: 0.75, g: 0.05, b: 0.1 };
const MIST = { r: 0.25, g: 0.0, b: 0.03 };

const STREAM_LENGTH = 55;
const STREAM_WIDTH = 0.35;
const MIST_SPREAD = 3;

/** Deterministic jitter from particle index */
function jitter(i: number, axis: number): number {
  const s = (i * 7 + axis * 13) % 100 / 100;
  return (s - 0.5) * 2;
}

function cross(a: BloodDirection, b: BloodDirection): BloodDirection {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function normalize(d: BloodDirection): BloodDirection {
  const len = Math.sqrt(d.x * d.x + d.y * d.y + d.z * d.z) || 1;
  return { x: d.x / len, y: d.y / len, z: d.z / len };
}

/**
 * Pure focused pressurized blood stream from origin along direction.
 * - Condensed blood at palm center (first 5%)
 * - Narrow high-pressure stream along palm normal (next 40%)
 * - Small trailing mist (next 8%)
 * - Rest invisible (smooth fade when switching away)
 */
export function getBlood(
  i: number,
  count: number,
  origin: BloodOrigin,
  dir: BloodDirection
): { x: number; y: number; z: number; r: number; g: number; b: number; s: number } {
  const ti = i / count;

  if (ti < 0.05) {
    const r = 1.5 + jitter(i, 0) * 0.8;
    const theta = (i * 0.7) % (Math.PI * 2);
    const phi = (i * 0.3) % Math.PI;
    return {
      x: origin.x + r * Math.sin(phi) * Math.cos(theta),
      y: origin.y + r * Math.sin(phi) * Math.sin(theta),
      z: origin.z + r * Math.cos(phi),
      ...CRIMSON,
      s: 1.2,
    };
  }

  if (ti < 0.45) {
    const t = (ti - 0.05) / 0.4;
    const dist = t * STREAM_LENGTH;
    const width = STREAM_WIDTH * (1 + (1 - t) * 0.5);
    const d = normalize(dir);
    const up = { x: 0, y: 1, z: 0 };
    let perp1 = cross(d, up);
    const perp1Len = Math.sqrt(perp1.x * perp1.x + perp1.y * perp1.y + perp1.z * perp1.z);
    if (perp1Len < 0.01) perp1 = cross(d, { x: 1, y: 0, z: 0 });
    perp1 = normalize(perp1);
    const perp2 = normalize(cross(d, perp1));
    const j1 = jitter(i, 0) * width;
    const j2 = jitter(i, 1) * width;
    return {
      x: origin.x + d.x * dist + perp1.x * j1 + perp2.x * j2,
      y: origin.y + d.y * dist + perp1.y * j1 + perp2.y * j2,
      z: origin.z + d.z * dist + perp1.z * j1 + perp2.z * j2,
      ...STREAM_BRIGHT,
      s: 0.9 + (1 - t) * 0.4,
    };
  }

  if (ti < 0.53) {
    const t = (ti - 0.45) / 0.08;
    const d = normalize(dir);
    const dist = STREAM_LENGTH * (0.7 + t * 0.3) + jitter(i, 0) * MIST_SPREAD;
    const spread = MIST_SPREAD * (1 + jitter(i, 1));
    return {
      x: origin.x + d.x * dist + jitter(i, 2) * spread,
      y: origin.y + d.y * dist + jitter(i, 0) * spread,
      z: origin.z + d.z * dist + jitter(i, 1) * spread,
      ...MIST,
      s: 0.4,
    };
  }

  return { x: 0, y: 0, z: 0, r: 0, g: 0, b: 0, s: 0 };
}

export const BLOOD_CONFIG = {
  color: "#6B0F1A",
  name: "Blood Manipulation",
  bloom: 2.2,
};
