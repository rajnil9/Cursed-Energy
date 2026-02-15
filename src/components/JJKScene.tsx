import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { getBlackFlash, BLACK_FLASH_CONFIG } from "@/lib/techniques/black-flash";
import { getBlood, BLOOD_CONFIG } from "@/lib/techniques/blood";
import { getDismantle, DISMANTLE_CONFIG } from "@/lib/techniques/dismantle";
declare global {
  interface Window {
    Hands: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
    HAND_CONNECTIONS: any;
  }
}

const COUNT = 20000;

const DEBUG_MODE = true;

// ─── Particle Shape Functions ────────────────────────────────
function getRed(i: number) {
  if (i < COUNT * 0.1) {
    const r = Math.random() * 9;
    const theta = Math.random() * 6.28;
    const phi = Math.acos(2 * Math.random() - 1);
    return { x: r * Math.sin(phi) * Math.cos(theta), y: r * Math.sin(phi) * Math.sin(theta), z: r * Math.cos(phi), r: 2.5, g: 0.15, b: 0.2, s: 2.5 };
  }
  const armCount = 3;
  const t = i / COUNT;
  const angle = t * 15 + (i % armCount) * ((Math.PI * 2) / armCount);
  const radius = 2 + t * 40;
  return { x: radius * Math.cos(angle), y: radius * Math.sin(angle), z: (Math.random() - 0.5) * (10 * t), r: 0.9, g: 0.05, b: 0.1, s: 1.0 };
}

function getVoid(i: number) {
  if (i < COUNT * 0.15) {
    const angle = Math.random() * Math.PI * 2;
    return { x: 26 * Math.cos(angle), y: 26 * Math.sin(angle), z: (Math.random() - 0.5) * 1, r: 0.9, g: 0.95, b: 1, s: 2.5 };
  }
  const radius = 30 + Math.random() * 90;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  return { x: radius * Math.sin(phi) * Math.cos(theta), y: radius * Math.sin(phi) * Math.sin(theta), z: radius * Math.cos(phi), r: 0.05, g: 0.5, b: 0.9, s: 0.7 };
}

function getPurple(i: number) {
  if (Math.random() > 0.8) return { x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100, z: (Math.random() - 0.5) * 100, r: 0.45, g: 0.4, b: 0.65, s: 0.8 };
  const r = 20;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  return { x: r * Math.sin(phi) * Math.cos(theta), y: r * Math.sin(phi) * Math.sin(theta), z: r * Math.cos(phi), r: 0.55, g: 0.35, b: 0.95, s: 2.5 };
}

function getShrine(i: number) {
  if (i < COUNT * 0.3) return { x: (Math.random() - 0.5) * 80, y: -15, z: (Math.random() - 0.5) * 80, r: 0.4, g: 0, b: 0, s: 0.8 };
  if (i < COUNT * 0.4) {
    const px = (i % 4 < 2 ? 1 : -1) * 12;
    const pz = (i % 4) % 2 == 0 ? 8 : -8;
    return { x: px + (Math.random() - 0.5) * 2, y: -15 + Math.random() * 30, z: pz + (Math.random() - 0.5) * 2, r: 0.2, g: 0.2, b: 0.2, s: 0.6 };
  }
  if (i < COUNT * 0.6) {
    const t = Math.random() * Math.PI * 2;
    const rad = Math.random() * 30;
    const curve = Math.pow(rad / 30, 2) * 10;
    return { x: rad * Math.cos(t), y: 15 - curve + Math.random() * 2, z: rad * Math.sin(t) * 0.6, r: 0.6, g: 0, b: 0, s: 0.6 };
  }
  return { x: 0, y: 0, z: 0, r: 0, g: 0, b: 0, s: 0 };
}

// ─── Mahito - Self-Embodiment of Perfection ─────────────
// Organic, morphing body-like shapes - teal/dark blue pulsing mass
function getMahito(i: number) {
  const t = i / COUNT;
  if (i < COUNT * 0.25) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 8 + Math.sin(t * 20) * 4 + Math.random() * 3;
    const stretch = 1 + Math.sin(t * 15) * 0.5;
    return { x: r * Math.sin(phi) * Math.cos(theta), y: r * Math.sin(phi) * Math.sin(theta) * stretch, z: r * Math.cos(phi), r: 0.05, g: 0.65, b: 0.55, s: 2.0 };
  }
  if (i < COUNT * 0.5) {
    const arm = i % 6;
    const armAngle = (arm / 6) * Math.PI * 2;
    const dist = (t - 0.25) * 4 * 35;
    const wave = Math.sin(dist * 0.3 + arm) * 5;
    return { x: dist * Math.cos(armAngle) + wave, y: wave * 0.5, z: dist * Math.sin(armAngle) + wave * 0.3, r: 0.05, g: 0.45, b: 0.45, s: 1.2 };
  }
  if (i < COUNT * 0.7) {
    const radius = 20 + Math.random() * 25;
    const theta = Math.random() * Math.PI * 2;
    return { x: radius * Math.cos(theta), y: (Math.random() - 0.5) * 30, z: radius * Math.sin(theta), r: 0.15, g: 0.75, b: 0.65, s: 0.5 };
  }
  return { x: 0, y: 0, z: 0, r: 0, g: 0, b: 0, s: 0 };
}

// ─── NEW: Hakari - Idle Death Gamble ─────────────────────────
// Flashy pachinko/slot machine - gold, rainbow sparkles, spinning rings
function getHakari(i: number) {
  const t = i / COUNT;
  if (i < COUNT * 0.15) {
    // Central jackpot core - bright gold sphere
    const r = 6 + Math.random() * 2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    return { x: r * Math.sin(phi) * Math.cos(theta), y: r * Math.sin(phi) * Math.sin(theta), z: r * Math.cos(phi), r: 1, g: 0.75, b: 0.05, s: 3.0 };
  }
  if (i < COUNT * 0.35) {
    // Spinning rings (like pachinko wheels)
    const ring = i % 3;
    const ringR = 15 + ring * 8;
    const angle = t * 50 + ring * 2;
    const y = (ring - 1) * 5;
    return { x: ringR * Math.cos(angle), y: y + (Math.random() - 0.5) * 2, z: ringR * Math.sin(angle), r: 1, g: 0.55 + Math.random() * 0.35, b: Math.random() * 0.2, s: 1.5 };
  }
  if (i < COUNT * 0.6) {
    // Rainbow sparkle burst
    const radius = 10 + Math.random() * 40;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const hueShift = Math.random();
    return {
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.sin(phi) * Math.sin(theta),
      z: radius * Math.cos(phi),
      r: hueShift > 0.5 ? 1 : hueShift * 2,
      g: hueShift > 0.3 && hueShift < 0.7 ? 1 : 0.3,
      b: hueShift < 0.5 ? 1 : (1 - hueShift) * 2,
      s: 0.8 + Math.random(),
    };
  }
  if (i < COUNT * 0.75) {
    // Falling coins/tokens
    const x = (Math.random() - 0.5) * 60;
    const y = 30 - Math.random() * 60;
    return { x, y, z: (Math.random() - 0.5) * 20, r: 1, g: 0.85, b: 0, s: 1.2 };
  }
  return { x: 0, y: 0, z: 0, r: 0, g: 0, b: 0, s: 0 };
}

// Megumi - Chimera Shadow Garden (original particle effect)
function getMegumi(i: number) {
  const t = i / COUNT;
  if (i < COUNT * 0.3) {
    const radius = Math.random() * 40;
    const angle = Math.random() * Math.PI * 2;
    return { x: radius * Math.cos(angle), y: -18 + Math.random() * 2, z: radius * Math.sin(angle), r: 0.06, g: 0.01, b: 0.12, s: 1.0 };
  }
  if (i < COUNT * 0.5) {
    const tendril = i % 8;
    const tendrilAngle = (tendril / 8) * Math.PI * 2;
    const height = (t - 0.3) * 5 * 40;
    const sway = Math.sin(height * 0.1 + tendril) * 3;
    const dist = 10 + tendril * 2;
    return {
      x: dist * Math.cos(tendrilAngle) + sway,
      y: -18 + height,
      z: dist * Math.sin(tendrilAngle) + sway * 0.5,
      r: 0.18,
      g: 0.04,
      b: 0.28,
      s: 1.5,
    };
  }
  if (i < COUNT * 0.65) {
    const beast = i % 3;
    const bx = [20, -15, 0][beast];
    const bz = [10, -10, 20][beast];
    const r = Math.random() * 8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    return {
      x: bx + r * Math.sin(phi) * Math.cos(theta),
      y: -5 + r * Math.sin(phi) * Math.sin(theta) * 1.5,
      z: bz + r * Math.cos(phi),
      r: 0.1,
      g: 0,
      b: 0.15,
      s: 1.8,
    };
  }
  if (i < COUNT * 0.8) {
    const radius = 15 + Math.random() * 50;
    const theta = Math.random() * Math.PI * 2;
    return {
      x: radius * Math.cos(theta),
      y: (Math.random() - 0.5) * 40,
      z: radius * Math.sin(theta),
      r: 0.08,
      g: 0.02,
      b: 0.12,
      s: 0.4,
    };
  }
  return { x: 0, y: 0, z: 0, r: 0, g: 0, b: 0, s: 0 };
}

export type HandScreenPoint = { x: number; y: number };

interface Props {
  onTechniqueChange: (name: string, color: string) => void;
  onHandScreenPositions?: (points: HandScreenPoint[]) => void;
}

const JJKScene = ({ onTechniqueChange, onHandScreenPositions }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraUtilsRef = useRef<{ stop?: () => void } | null>(null);
  const onHandScreenPositionsRef = useRef(onHandScreenPositions);
  onHandScreenPositionsRef.current = onHandScreenPositions;
  const debugPanelRef = useRef<HTMLDivElement>(null);
  const cameraContainerRef = useRef<HTMLDivElement>(null);
  const currentTechNameRef = useRef("Neutral State");

  useEffect(() => {
    if (!containerRef.current) return;

    // ─── Three.js Setup ──────────────────────────────
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cam.position.z = 55;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, cam));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    composer.addPass(bloomPass);

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    const targetPositions = new Float32Array(COUNT * 3);
    const targetColors = new Float32Array(COUNT * 3);
    const targetSizes = new Float32Array(COUNT);

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const particles = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({ size: 0.3, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })
    );
    scene.add(particles);

    let lastAnimateTime = performance.now() / 1000;

    // ─── State ───────────────────────────────────────
    let currentTech = "neutral";
    let shakeIntensity = 0;
    let glowColor = "#00ffff";
    let animId: number;
    let fistFrames = 0;
    let bloodStartTime = 0;
    const FIST_CONFIRM_FRAMES = 3;

    // Global wrist direction (palm normal) — updated when hand(s) detected, used by all techniques
    const wristDirectionTarget = { x: 0, y: 0, z: 1 };
    const wristDirVec = new THREE.Vector3(0, 0, 1);
    const wristDirSmoothVec = new THREE.Vector3(0, 0, 1);
    const wristForward = new THREE.Vector3(0, 0, -1);
    const wristQuat = new THREE.Quaternion();
    const techniqueEuler = new THREE.Euler(0, 0, 0);
    const techniqueQuat = new THREE.Quaternion();
    const WRIST_DIR_LERP = 0.11;

    // Blood: palm origin and direction (Three.js space), updated from hand landmarks
    const BLOOD_SCALE = 50;
    const bloodOrigin = { x: 0, y: 0, z: 0 };
    const bloodDir = { x: 0, y: 0, z: 1 };
    const bloodDirSmooth = { x: 0, y: 0, z: 1 };
    const BLOOD_DIR_LERP = 0.12;

    function mapLandmarkToThree(lm: { x: number; y: number; z: number }) {
      return {
        x: (lm.x - 0.5) * BLOOD_SCALE,
        y: (0.5 - lm.y) * BLOOD_SCALE,
        z: -lm.z * 30,
      };
    }
    function palmNormalFromLandmarks(lm: any): { x: number; y: number; z: number } {
      const wrist = { x: lm[0].x, y: lm[0].y, z: lm[0].z };
      const idxMcp = { x: lm[5].x, y: lm[5].y, z: lm[5].z };
      const pinkyMcp = { x: lm[17].x, y: lm[17].y, z: lm[17].z };
      const v1 = { x: idxMcp.x - wrist.x, y: idxMcp.y - wrist.y, z: idxMcp.z - wrist.z };
      const v2 = { x: pinkyMcp.x - wrist.x, y: pinkyMcp.y - wrist.y, z: pinkyMcp.z - wrist.z };
      const cx = v1.y * v2.z - v1.z * v2.y;
      const cy = v1.z * v2.x - v1.x * v2.z;
      const cz = v1.x * v2.y - v1.y * v2.x;
      const len = Math.sqrt(cx * cx + cy * cy + cz * cz) || 1;
      return { x: cx / len, y: cy / len, z: cz / len };
    }

    function updateState(tech: string) {
      if (currentTech === tech) return;
      currentTech = tech;
      if (tech === "blood") bloodStartTime = performance.now() / 1000;
      shakeIntensity = tech !== "neutral" ? 0.4 : 0;

      const map: Record<string, { color: string; name: string; bloom: number }> = {
        shrine: { color: "#ff0000", name: "Domain Expansion: Malevolent Shrine", bloom: 2.5 },
        purple: { color: "#bb00ff", name: "Secret Technique: Hollow Purple", bloom: 4.0 },
        void: { color: "#00ffff", name: "Domain Expansion: Infinite Void", bloom: 2.0 },
        red: { color: "#ff3333", name: "Reverse Cursed Technique: Red", bloom: 2.5 },
        mahito: { color: "#00ccaa", name: "Domain Expansion: Self-Embodiment of Perfection", bloom: 2.0 },
        hakari: { color: "#ffaa00", name: "Domain Expansion: Idle Death Gamble", bloom: 3.5 },
        megumi: { color: "#6633aa", name: "Domain Expansion: Chimera Shadow Garden", bloom: 1.5 },
        blackflash: { color: BLACK_FLASH_CONFIG.color, name: BLACK_FLASH_CONFIG.name, bloom: BLACK_FLASH_CONFIG.bloom },
        dismantle: { color: DISMANTLE_CONFIG.color, name: DISMANTLE_CONFIG.name, bloom: DISMANTLE_CONFIG.bloom },
        blood: { color: BLOOD_CONFIG.color, name: BLOOD_CONFIG.name, bloom: BLOOD_CONFIG.bloom },
        neutral: { color: "#00ffff", name: "Neutral State", bloom: 1.0 },
      };

      const info = map[tech] || map.neutral;
      glowColor = info.color;
      bloomPass.strength = info.bloom;
      currentTechNameRef.current = info.name;
      onTechniqueChange(info.name, info.color);

      const getParticle = (i: number) => {
        switch (tech) {
          case "red": return getRed(i);
          case "void": return getVoid(i);
          case "purple": return getPurple(i);
          case "shrine": return getShrine(i);
          case "mahito": return getMahito(i);
          case "hakari": return getHakari(i);
          case "megumi": return getMegumi(i);
          case "blackflash": return getBlackFlash(i, COUNT);
          case "dismantle": return getDismantle(i, COUNT);
          case "blood": return getBlood(i, COUNT, bloodOrigin, bloodDirSmooth);
          default:
            if (i < COUNT * 0.05) {
              const r = 15 + Math.random() * 20;
              const t = Math.random() * 6.28;
              const ph = Math.random() * 3.14;
              return { x: r * Math.sin(ph) * Math.cos(t), y: r * Math.sin(ph) * Math.sin(t), z: r * Math.cos(ph), r: 0.1, g: 0.1, b: 0.2, s: 0.4 };
            }
            return { x: 0, y: 0, z: 0, r: 0, g: 0, b: 0, s: 0 };
        }
      };

      for (let i = 0; i < COUNT; i++) {
        const p = getParticle(i);
        targetPositions[i * 3] = p.x;
        targetPositions[i * 3 + 1] = p.y;
        targetPositions[i * 3 + 2] = p.z;
        targetColors[i * 3] = p.r;
        targetColors[i * 3 + 1] = p.g;
        targetColors[i * 3 + 2] = p.b;
        targetSizes[i] = p.s;
      }
    }

    // ─── Hand Tracking ───────────────────────────────
    const videoEl = videoRef.current!;
    const canvasEl = canvasRef.current!;
    const canvasCtx = canvasEl.getContext("2d")!;

    // Wait for MediaPipe to load
    const initHands = () => {
      if (typeof window.Hands === "undefined") {
        setTimeout(initHands, 200);
        return;
      }

      const hands = new window.Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });
      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.65,
        minTrackingConfidence: 0.5,
      });

      function getHandLabel(lm: any, handIndex: number, handCount: number, detected: string): string {
        if (handCount === 1 && detected === "megumi") return "Index + Pinky";
        if (handCount === 1 && detected === "blood") return "Open Palm";
        if (handCount === 1 && detected === "blackflash") return "Fist";
        const isUpLm = (tip: number, pip: number) => lm[tip].y < lm[pip].y;
        const indexUp = isUpLm(8, 6);
        const middleUp = isUpLm(12, 10);
        const ringUp = isUpLm(16, 14);
        const pinkyUp = isUpLm(20, 18);
        const thumbUp = lm[4].y < lm[3].y && lm[4].y < lm[2].y;
        if (handCount === 1 && indexUp && middleUp && ringUp && pinkyUp && thumbUp) return "Open Palm";
        const wrist = lm[0];
        const isCurled = (tip: number) => Math.hypot(lm[tip].x - wrist.x, lm[tip].y - wrist.y) < 0.22;
        if (handCount === 1 && isCurled(8) && isCurled(12) && isCurled(16) && isCurled(20)) return "Fist";
        return "Hand Detected";
      }

      function drawDebugOverlay(
        ctx: CanvasRenderingContext2D,
        w: number,
        h: number,
        handLandmarks: any[],
        detected: string
      ) {
        const FINGERTIP_IDS = [4, 8, 12, 16, 20];
        const conn = window.HAND_CONNECTIONS as number[][] | undefined;
        handLandmarks.forEach((lm: any, handIndex: number) => {
          const label = getHandLabel(lm, handIndex, handLandmarks.length, detected);
          let minX = 1, minY = 1, maxX = 0, maxY = 0;
          const points: { x: number; y: number }[] = [];
          for (let i = 0; i < 21; i++) {
            if (lm[i]) {
              const x = lm[i].x * w;
              const y = lm[i].y * h;
              points.push({ x, y });
              minX = Math.min(minX, lm[i].x);
              minY = Math.min(minY, lm[i].y);
              maxX = Math.max(maxX, lm[i].x);
              maxY = Math.max(maxY, lm[i].y);
            }
          }
          if (conn && conn.length) {
            ctx.strokeStyle = "rgba(180, 200, 255, 0.9)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            conn.forEach(([a, b]) => {
              if (lm[a] && lm[b]) {
                ctx.moveTo(lm[a].x * w, lm[a].y * h);
                ctx.lineTo(lm[b].x * w, lm[b].y * h);
              }
            });
            ctx.stroke();
          }
          points.forEach((p, i) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, FINGERTIP_IDS.includes(i) ? 5 : 3, 0, Math.PI * 2);
            ctx.fillStyle = FINGERTIP_IDS.includes(i) ? "#00ccff" : "#ffffff";
            ctx.fill();
            ctx.strokeStyle = "rgba(0,0,0,0.5)";
            ctx.lineWidth = 1;
            ctx.stroke();
          });
          const pad = 0.02 * Math.min(w, h);
          const bx = minX * w - pad;
          const by = minY * h - pad;
          const bw = (maxX - minX) * w + pad * 2;
          const bh = (maxY - minY) * h + pad * 2;
          ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
          ctx.lineWidth = 2;
          ctx.strokeRect(bx, by, bw, bh);
          ctx.font = "11px system-ui, sans-serif";
          ctx.fillStyle = "#fff";
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 2;
          const tx = minX * w;
          const ty = minY * h - 6;
          ctx.strokeText(label, tx, ty);
          ctx.fillText(label, tx, ty);
        });
      }

      hands.onResults((results: any) => {
        canvasCtx.clearRect(0, 0, canvasEl.width, canvasEl.height);
        let detected = "neutral";

        const screenPoints: HandScreenPoint[] = [];
        const w = window.innerWidth;
        const h = window.innerHeight;

        if (results.multiHandLandmarks) {
          results.multiHandLandmarks.forEach((lm: any) => {
            if (lm[8]) {
              screenPoints.push({ x: lm[8].x * w, y: lm[8].y * h });
            }
          });
        }
        onHandScreenPositionsRef.current?.(screenPoints);

        // Blood: only when exactly one hand, all five extended, palm facing camera
        const hands = results.multiHandLandmarks ?? [];
        if (hands.length === 1) {
          const lm = hands[0];
          const isUpLm = (tip: number, pip: number) => lm[tip].y < lm[pip].y;
          const indexUp = isUpLm(8, 6);
          const middleUp = isUpLm(12, 10);
          const ringUp = isUpLm(16, 14);
          const pinkyUp = isUpLm(20, 18);
          const thumbUp = lm[4].y < lm[3].y && lm[4].y < lm[2].y;
          const palmNorm = palmNormalFromLandmarks(lm);
          const palmFacingCamera = palmNorm.z < -0.2;
          if (indexUp && middleUp && ringUp && pinkyUp && thumbUp && palmFacingCamera) {
            detected = "blood";
            const w = mapLandmarkToThree(lm[0]);
            const i5 = mapLandmarkToThree(lm[5]);
            const i17 = mapLandmarkToThree(lm[17]);
            bloodOrigin.x = (w.x + i5.x + i17.x) / 3;
            bloodOrigin.y = (w.y + i5.y + i17.y) / 3;
            bloodOrigin.z = (w.z + i5.z + i17.z) / 3;
            bloodDir.x = palmNorm.x;
            bloodDir.y = -palmNorm.y;
            bloodDir.z = -palmNorm.z;
            const dlen = Math.sqrt(bloodDir.x * bloodDir.x + bloodDir.y * bloodDir.y + bloodDir.z * bloodDir.z) || 1;
            bloodDir.x /= dlen;
            bloodDir.y /= dlen;
            bloodDir.z /= dlen;
            bloodOrigin.x += bloodDir.x * 2;
            bloodOrigin.y += bloodDir.y * 2;
            bloodOrigin.z += bloodDir.z * 2;
          }
        }

        const handList = results.multiHandLandmarks ?? [];

        if (handList.length >= 1) {
          const pn = palmNormalFromLandmarks(handList[0]);
          wristDirectionTarget.x = pn.x;
          wristDirectionTarget.y = -pn.y;
          wristDirectionTarget.z = -pn.z;
          const len = Math.sqrt(wristDirectionTarget.x ** 2 + wristDirectionTarget.y ** 2 + wristDirectionTarget.z ** 2) || 1;
          wristDirectionTarget.x /= len;
          wristDirectionTarget.y /= len;
          wristDirectionTarget.z /= len;
        }

        if (results.multiHandLandmarks) {
          results.multiHandLandmarks.forEach((lm: any) => {
            if (!DEBUG_MODE) {
              window.drawConnectors(canvasCtx, lm, window.HAND_CONNECTIONS, { color: glowColor, lineWidth: 5 });
              window.drawLandmarks(canvasCtx, lm, { color: "#fff", lineWidth: 1, radius: 2 });
            }
            if (detected === "blood") return;

            const isUpLm = (tip: number, pip: number) => lm[tip].y < lm[pip].y;
            const pinch = Math.hypot(lm[8].x - lm[4].x, lm[8].y - lm[4].y);

            const indexUp = isUpLm(8, 6);
            const middleUp = isUpLm(12, 10);
            const ringUp = isUpLm(16, 14);
            const pinkyUp = isUpLm(20, 18);
            const thumbUp = lm[4].y < lm[3].y && lm[4].y < lm[2].y;

            const wrist = lm[0];
            const isCurled = (tip: number) => {
              const d = Math.hypot(lm[tip].x - wrist.x, lm[tip].y - wrist.y);
              return d < 0.22;
            };
            const allCurled = isCurled(8) && isCurled(12) && isCurled(16) && isCurled(20);
            const isFist = allCurled && !indexUp && !middleUp && !ringUp && !pinkyUp;

            if (isFist) {
              fistFrames++;
              if (fistFrames >= FIST_CONFIRM_FRAMES) detected = "blackflash";
            } else {
              fistFrames = 0;
              if (pinch < 0.05 && middleUp) {
                detected = "purple";
              } else if (thumbUp && !indexUp && !middleUp && !ringUp && pinkyUp) {
                detected = "mahito";
              } else if (thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp) {
                detected = "hakari";
              } else if (indexUp && !middleUp && !ringUp && pinkyUp) {
                detected = "megumi";
              } else if (indexUp && middleUp && ringUp && !pinkyUp) {
                detected = "dismantle";
              } else if (!indexUp && middleUp && ringUp && !pinkyUp) {
                detected = "shrine";
              } else if (indexUp && middleUp && !ringUp) {
                detected = "void";
              } else if (indexUp && !middleUp) {
                detected = "red";
              }
            }
          });
          if (DEBUG_MODE) {
            drawDebugOverlay(canvasCtx, canvasEl.width, canvasEl.height, results.multiHandLandmarks, detected);
          }
        }
        updateState(detected);

        if (DEBUG_MODE) {
          const handCount = handList.length;
          const gestureRecognized = detected !== "neutral";
          const palmFacing =
            handCount === 1
              ? palmNormalFromLandmarks(handList[0]).z < -0.2
              : null;
          if (debugPanelRef.current) {
            debugPanelRef.current.innerHTML = `
              <div class="debug-panel-row"><span>Hands detected:</span> <span class="${handCount > 0 ? "debug-valid" : "debug-invalid"}">${handCount}</span></div>
              <div class="debug-panel-row"><span>Current technique:</span> <span>${currentTechNameRef.current}</span></div>
              <div class="debug-panel-row"><span>Gesture recognized:</span> <span class="${gestureRecognized ? "debug-valid" : "debug-invalid"}">${gestureRecognized ? "Yes" : "No"}</span></div>
              <div class="debug-panel-row"><span>Palm orientation:</span> <span class="${palmFacing === true ? "debug-valid" : palmFacing === false ? "debug-invalid" : ""}">${palmFacing === null ? "N/A" : palmFacing ? "Facing camera" : "Not facing"}</span></div>
            `;
          }
          if (cameraContainerRef.current) {
            cameraContainerRef.current.classList.remove("debug-border-none", "debug-border-invalid", "debug-border-valid");
            if (handCount === 0) cameraContainerRef.current.classList.add("debug-border-none");
            else if (!gestureRecognized) cameraContainerRef.current.classList.add("debug-border-invalid");
            else cameraContainerRef.current.classList.add("debug-border-valid");
          }
        } else if (cameraContainerRef.current) {
          cameraContainerRef.current.classList.remove("debug-border-none", "debug-border-invalid", "debug-border-valid");
        }
      });

      const cameraUtils = new window.Camera(videoEl, {
        onFrame: async () => {
          canvasEl.width = videoEl.videoWidth;
          canvasEl.height = videoEl.videoHeight;
          await hands.send({ image: videoEl });
        },
        width: 1280,
        height: 720,
      });
      cameraUtils.start();
      cameraUtilsRef.current = cameraUtils;
    };

    initHands();

    // ─── Animation Loop ──────────────────────────────
    function animate() {
      animId = requestAnimationFrame(animate);
      const now = performance.now() / 1000;
      const deltaTime = Math.min(now - lastAnimateTime, 0.1);
      lastAnimateTime = now;

      if (shakeIntensity > 0) {
        renderer.domElement.style.transform = `translate(${(Math.random() - 0.5) * shakeIntensity * 40}px, ${(Math.random() - 0.5) * shakeIntensity * 40}px)`;
      } else {
        renderer.domElement.style.transform = "translate(0,0)";
      }

      const pos = particles.geometry.attributes.position.array as Float32Array;
      const col = particles.geometry.attributes.color.array as Float32Array;
      const siz = particles.geometry.attributes.size.array as Float32Array;

      if (currentTech === "blood") {
        bloodDirSmooth.x += (bloodDir.x - bloodDirSmooth.x) * BLOOD_DIR_LERP;
        bloodDirSmooth.y += (bloodDir.y - bloodDirSmooth.y) * BLOOD_DIR_LERP;
        bloodDirSmooth.z += (bloodDir.z - bloodDirSmooth.z) * BLOOD_DIR_LERP;
        for (let i = 0; i < COUNT; i++) {
          const p = getBlood(i, COUNT, bloodOrigin, bloodDirSmooth);
          targetPositions[i * 3] = p.x;
          targetPositions[i * 3 + 1] = p.y;
          targetPositions[i * 3 + 2] = p.z;
          targetColors[i * 3] = p.r;
          targetColors[i * 3 + 1] = p.g;
          targetColors[i * 3 + 2] = p.b;
          targetSizes[i] = p.s;
        }
      }

      for (let i = 0; i < COUNT * 3; i++) {
        pos[i] += (targetPositions[i] - pos[i]) * 0.1;
        col[i] += (targetColors[i] - col[i]) * 0.1;
      }
      for (let i = 0; i < COUNT; i++) siz[i] += (targetSizes[i] - siz[i]) * 0.1;

      particles.geometry.attributes.position.needsUpdate = true;
      particles.geometry.attributes.color.needsUpdate = true;
      particles.geometry.attributes.size.needsUpdate = true;

      if (currentTech === "neutral") {
        particles.quaternion.identity();
        particles.rotation.y += 0.005;
      } else if (currentTech === "blood") {
        particles.quaternion.identity();
        particles.rotation.set(0, 0, 0);
      } else {
        wristDirVec.set(wristDirectionTarget.x, wristDirectionTarget.y, wristDirectionTarget.z);
        wristDirSmoothVec.lerp(wristDirVec, WRIST_DIR_LERP);
        wristQuat.setFromUnitVectors(wristForward, wristDirSmoothVec);
        techniqueEuler.set(0, 0, 0);
        if (currentTech === "red") {
          techniqueEuler.z -= 0.1;
        } else if (currentTech === "purple") {
          techniqueEuler.z += 0.2;
          techniqueEuler.y += 0.05;
        } else if (currentTech === "mahito") {
          techniqueEuler.y += 0.01;
          techniqueEuler.x += 0.005;
        } else if (currentTech === "hakari") {
          techniqueEuler.y += 0.08;
        } else if (currentTech === "blackflash") {
          techniqueEuler.z += 0.15;
          techniqueEuler.y += 0.1;
        } else if (currentTech === "dismantle") {
          techniqueEuler.y += 0.003;
          techniqueEuler.z += 0.002;
        }
        techniqueQuat.setFromEuler(techniqueEuler);
        particles.quaternion.copy(wristQuat).multiply(techniqueQuat);
      }

      composer.render();
    }
    animate();

    const onResize = () => {
      cam.aspect = window.innerWidth / window.innerHeight;
      cam.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animId);
      if (cameraUtilsRef.current?.stop) {
        try {
          cameraUtilsRef.current.stop();
        } catch (_) {}
        cameraUtilsRef.current = null;
      }
      const video = videoRef.current;
      if (video?.srcObject && typeof MediaStream !== "undefined") {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
        video.srcObject = null;
      }
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
          obj.geometry?.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat?.dispose();
        }
      });
      composer.dispose();
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <>
      {/* Three.js canvas container */}
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Camera feed — 720p for better finger detection and clearer preview */}
      <div
        ref={cameraContainerRef}
        className="absolute bottom-[2%] left-4 w-[75vw] max-w-[360px] h-[32vh] border border-border z-20 rounded-[25px] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.9)] camera-feed-container"
        style={{ transform: "scaleX(-1)" }}
      >
        <video ref={videoRef} className="w-full h-full object-cover opacity-90 camera-feed-video" playsInline muted />
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
      </div>

      {DEBUG_MODE && (
        <div
          ref={debugPanelRef}
          className="debug-panel fixed top-4 left-4 z-30 rounded px-3 py-2 text-white text-xs font-mono space-y-1 min-w-[200px]"
        />
      )}
    </>
  );
};

export default JJKScene;
