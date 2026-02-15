/**
 * Dismantle (Sukuna) - Particle effect
 * Invisible slashing force, red-black cursed energy cracks, razor slash lines
 * Gesture: 🤟 Index + Middle + Ring up (3 fingers / knife hand)
 */

export function getDismantle(i: number, count: number) {
  const t = i / count;
  if (i < count * 0.2) {
    const slash = i % 7;
    const slashAngle = (slash / 7) * Math.PI + Math.random() * 0.2;
    const dist = (t / 0.2) * 50 - 25;
    const offset = (slash - 3) * 6;
    return {
      x: dist * Math.cos(slashAngle) + (Math.random() - 0.5) * 0.3,
      y: offset + (Math.random() - 0.5) * 0.5,
      z: dist * Math.sin(slashAngle) * 0.4,
      r: 0.85, g: 0.02, b: 0.05, s: 2.8,
    };
  }
  if (i < count * 0.38) {
    const crack = i % 15;
    const cx = (Math.random() - 0.5) * 60;
    const cy = (Math.random() - 0.5) * 40;
    const branch = Math.sin(crack * 3.7 + cx * 0.2) * 8;
    return {
      x: cx + branch * 0.3,
      y: cy + Math.sin(cx * 0.5) * 3,
      z: (Math.random() - 0.5) * 15,
      r: 0.5 + Math.random() * 0.3, g: 0.0, b: 0.0, s: 1.6,
    };
  }
  if (i < count * 0.55) {
    const radius = 5 + Math.random() * 35;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const warp = Math.sin(radius * 0.3) * 5;
    return {
      x: radius * Math.sin(phi) * Math.cos(theta) + warp,
      y: radius * Math.sin(phi) * Math.sin(theta),
      z: radius * Math.cos(phi) + warp * 0.5,
      r: 0.08, g: 0.0, b: 0.04, s: 0.5,
    };
  }
  if (i < count * 0.7) {
    const side = i % 2 === 0 ? 1 : -1;
    const px = (Math.random() - 0.5) * 50;
    const py = (Math.random() - 0.5) * 30;
    return {
      x: px + side * (2 + Math.random() * 3),
      y: py + side * Math.random() * 1.5,
      z: (Math.random() - 0.5) * 20,
      r: 0.15, g: 0.05, b: 0.05, s: 0.9,
    };
  }
  if (i < count * 0.85) {
    const radius = 20 + Math.random() * 50;
    const theta = Math.random() * Math.PI * 2;
    return {
      x: radius * Math.cos(theta),
      y: (Math.random() - 0.5) * 45,
      z: radius * Math.sin(theta),
      r: 0.12, g: 0.0, b: 0.02, s: 0.3,
    };
  }
  return { x: 0, y: 0, z: 0, r: 0, g: 0, b: 0, s: 0 };
}

export const DISMANTLE_CONFIG = {
  color: "#8b0000",
  name: "Cursed Technique: Dismantle",
  bloom: 2.8,
};
