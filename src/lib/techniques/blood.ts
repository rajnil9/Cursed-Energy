/**
 * Blood Manipulation (Choso) - Particle effect
 * Cursed blood condensing between two merged palms → Piercing Blood
 * Gesture: Two hands, all fingers extended, palms close together
 */

const CRIMSON = { r: 0.55, g: 0.0, b: 0.05 };
const MAROON = { r: 0.35, g: 0.0, b: 0.08 };
const DARK_MIST = { r: 0.2, g: 0.0, b: 0.03 };
const BRIGHT_BEAM = { r: 0.95, g: 0.1, b: 0.15 };

export function getBlood(i: number, count: number, t: number) {
  const ti = i / count;
  const tLoop = t % 8;
  const phase = getPhase(tLoop);
  const seed = (i * 0.1 + t * 2) % 1;

  if (phase === 0) {
    return phaseMist(i, count, tLoop, ti, seed);
  }
  if (phase === 1) {
    return phaseSphere(i, count, tLoop, ti, seed);
  }
  if (phase === 2) {
    return phaseCompress(i, count, tLoop, ti, seed);
  }
  if (phase === 3) {
    return phaseBeam(i, count, tLoop, ti, seed);
  }
  if (phase === 4) {
    return phaseTrail(i, count, tLoop, ti, seed);
  }
  return phaseIdle(i, count, t, ti, seed);
}

function getPhase(t: number): number {
  if (t < 2) return 0;
  if (t < 4) return 1;
  if (t < 5) return 2;
  if (t < 6) return 3;
  if (t < 8) return 4;
  return 5;
}

function phaseMist(i: number, count: number, t: number, ti: number, seed: number) {
  const progress = t / 2;
  const spread = 25 + (1 - progress) * 20;
  const theta = seed * Math.PI * 2 + t * 0.5;
  const phi = (ti - 0.5) * Math.PI * 0.8;
  const r = spread * (0.3 + 0.7 * progress) * (0.8 + seed * 0.4);
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.sin(phi) * Math.sin(theta) * 0.6,
    z: r * Math.cos(phi),
    ...DARK_MIST,
    s: 0.6 + progress * 0.4,
  };
}

function phaseSphere(i: number, count: number, t: number, ti: number, seed: number) {
  const progress = (t - 2) / 2;
  const radius = 18 - progress * 10;
  const angle = ti * Math.PI * 4 + t * 2;
  const spiral = (1 - progress) * 15;
  const r = spiral + radius * (0.3 + 0.7 * seed);
  const theta = angle + seed * 6.28;
  const phi = Math.acos(2 * (ti + seed) % 1 - 1);
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.sin(phi) * Math.sin(theta),
    z: r * Math.cos(phi),
    ...CRIMSON,
    s: 1.2 + seed * 0.5,
  };
}

function phaseCompress(i: number, count: number, t: number, ti: number, seed: number) {
  const progress = (t - 4) / 1;
  const radius = 8 - progress * 6;
  const theta = ti * Math.PI * 2 + t * 3;
  const phi = Math.acos(2 * seed - 1);
  const r = radius * (0.7 + seed * 0.3);
  const glow = 0.5 + progress * 0.5;
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.sin(phi) * Math.sin(theta),
    z: r * Math.cos(phi),
    r: CRIMSON.r * glow + 0.3,
    g: CRIMSON.g,
    b: CRIMSON.b + 0.05,
    s: 1.5 + progress * 1.2,
  };
}

function phaseBeam(i: number, count: number, t: number, ti: number, seed: number) {
  const progress = (t - 5) / 1;
  const beamLength = 80 * progress;
  const u = (i * 17 + 1) % 100 / 100;
  const v = (i * 31 + 3) % 100 / 100;
  if (i < count * 0.15) {
    const dist = (i / (count * 0.15)) * beamLength;
    const spread = 2 - progress * 1.5;
    const theta = seed * 6.28;
    return {
      x: dist + (u - 0.5) * spread,
      y: (v - 0.5) * spread,
      z: ((u + v) % 1 - 0.5) * spread,
      ...BRIGHT_BEAM,
      s: 2.5,
    };
  }
  if (i < count * 0.25) {
    const core = ((i - count * 0.15) / (count * 0.1)) * beamLength;
    return {
      x: core,
      y: 0,
      z: 0,
      r: 1,
      g: 0.15,
      b: 0.2,
      s: 3,
    };
  }
  return phaseIdle(i, count, t, ti, seed);
}

function phaseTrail(i: number, count: number, t: number, ti: number, seed: number) {
  const progress = (t - 6) / 2;
  const fade = 1 - progress;
  const u = (i * 13) % 100 / 100;
  const v = (i * 7) % 100 / 100;
  if (i < count * 0.08) {
    const dist = 40 + (i / (count * 0.08)) * 50;
    return {
      x: dist,
      y: (u - 0.5) * 3,
      z: (v - 0.5) * 3,
      r: MAROON.r * fade,
      g: MAROON.g,
      b: MAROON.b * fade,
      s: 0.8 * fade,
    };
  }
  return phaseIdle(i, count, t, ti, seed);
}

function phaseIdle(i: number, count: number, t: number, ti: number, seed: number) {
  const radius = 12 + Math.sin(t + ti * 10) * 3;
  const theta = ti * Math.PI * 2 + t * 0.8;
  const phi = Math.acos(2 * (seed + t * 0.2) % 1 - 1);
  const r = radius * (0.6 + seed * 0.4);
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.sin(phi) * Math.sin(theta) * 0.7,
    z: r * Math.cos(phi),
    ...CRIMSON,
    s: 0.8 + seed * 0.4,
  };
}

export const BLOOD_CONFIG = {
  color: "#6B0F1A",
  name: "Blood Manipulation",
  bloom: 2.2,
};
