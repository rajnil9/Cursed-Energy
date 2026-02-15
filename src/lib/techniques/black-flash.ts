/**
 * Black Flash (Yuji) - Particle effect
 * Explosive punch impact — black lightning, red-black shockwave, warped space
 * Gesture: ✊ Fist (all fingers closed)
 */

export function getBlackFlash(i: number, count: number) {
  const t = i / count;
  if (i < count * 0.12) {
    const r = 2 + Math.random() * 3;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    return { x: r * Math.sin(phi) * Math.cos(theta), y: r * Math.sin(phi) * Math.sin(theta), z: r * Math.cos(phi), r: 0.08, g: 0.0, b: 0.0, s: 3.5 };
  }
  if (i < count * 0.28) {
    const bolt = i % 12;
    const boltAngle = (bolt / 12) * Math.PI * 2 + Math.random() * 0.3;
    const dist = (t - 0.12) * 6.25 * 45;
    const jag = Math.sin(dist * 1.5 + bolt * 7) * (3 + Math.random() * 4);
    const jagY = Math.cos(dist * 2.1 + bolt * 5) * 3;
    return {
      x: dist * Math.cos(boltAngle) + jag,
      y: jagY,
      z: dist * Math.sin(boltAngle) + jag * 0.6,
      r: 0.12 + Math.random() * 0.08,
      g: 0.0,
      b: 0.02,
      s: 2.0 + Math.random(),
    };
  }
  if (i < count * 0.45) {
    const ringPhase = (t - 0.28) * 5.88;
    const ringR = 8 + ringPhase * 50;
    const angle = Math.random() * Math.PI * 2;
    const thickness = 1.5 + Math.random() * 2;
    return {
      x: ringR * Math.cos(angle) + (Math.random() - 0.5) * thickness,
      y: (Math.random() - 0.5) * thickness,
      z: ringR * Math.sin(angle) + (Math.random() - 0.5) * thickness,
      r: 0.7,
      g: 0.02,
      b: 0.05,
      s: 1.4,
    };
  }
  if (i < count * 0.65) {
    const radius = 5 + Math.random() * 55;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const dark = Math.random();
    return {
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.sin(phi) * Math.sin(theta),
      z: radius * Math.cos(phi),
      r: dark > 0.5 ? 0.6 : 0.04,
      g: 0.0,
      b: dark > 0.7 ? 0.08 : 0.0,
      s: 0.6 + Math.random() * 0.8,
    };
  }
  if (i < count * 0.82) {
    const radius = 15 + Math.random() * 40;
    const theta = Math.random() * Math.PI * 2;
    const spark = Math.random() > 0.6;
    return {
      x: radius * Math.cos(theta) + (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 50,
      z: radius * Math.sin(theta) + (Math.random() - 0.5) * 10,
      r: spark ? 0.9 : 0.06,
      g: spark ? 0.1 : 0.0,
      b: spark ? 0.15 : 0.03,
      s: spark ? 1.8 : 0.3,
    };
  }
  return { x: 0, y: 0, z: 0, r: 0, g: 0, b: 0, s: 0 };
}

export const BLACK_FLASH_CONFIG = {
  /** UI text/glow color – bright red so "Black Flash" is visible on dark background */
  color: "#ff3333",
  name: "Black Flash",
  bloom: 4.5,
};
