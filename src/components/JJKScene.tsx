import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { getBlackFlash, BLACK_FLASH_CONFIG } from "@/lib/techniques/black-flash";
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

// ─── NEW: Megumi - Chimera Shadow Garden ─────────────────────
// Dark shadows spreading from below, shadow creatures, deep purple/black
function getMegumi(i: number) {
  const t = i / COUNT;
  if (i < COUNT * 0.3) {
    // Shadow pool spreading on the ground
    const radius = Math.random() * 40;
    const angle = Math.random() * Math.PI * 2;
    return { x: radius * Math.cos(angle), y: -18 + Math.random() * 2, z: radius * Math.sin(angle), r: 0.06, g: 0.01, b: 0.12, s: 1.0 };
  }
  if (i < COUNT * 0.5) {
    // Rising shadow tendrils
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
    // Shadow beast silhouettes (large dark clusters)
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
    // Ambient dark mist
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
  /** Use a specific camera (e.g. DroidCam / phone-as-webcam). Pass deviceId from enumerateDevices. */
  cameraDeviceId?: string | null;
  /** Use phone camera via IP Webcam app: e.g. http://192.168.1.5:8080/video */
  cameraStreamUrl?: string | null;
}

const JJKScene = ({ onTechniqueChange, onHandScreenPositions, cameraDeviceId, cameraStreamUrl }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraUtilsRef = useRef<{ stop?: () => void } | null>(null);
  const frameLoopIdRef = useRef<number | null>(null);
  const onHandScreenPositionsRef = useRef(onHandScreenPositions);
  onHandScreenPositionsRef.current = onHandScreenPositions;

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

    // ─── State ───────────────────────────────────────
    let currentTech = "neutral";
    let shakeIntensity = 0;
    let glowColor = "#00ffff";
    let animId: number;
    let fistFrames = 0;
    const FIST_CONFIRM_FRAMES = 3;

    function updateState(tech: string) {
      if (currentTech === tech) return;
      currentTech = tech;
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
        neutral: { color: "#00ffff", name: "Neutral State", bloom: 1.0 },
      };

      const info = map[tech] || map.neutral;
      glowColor = info.color;
      bloomPass.strength = info.bloom;
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
      hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.7 });

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

        if (results.multiHandLandmarks) {
          results.multiHandLandmarks.forEach((lm: any) => {
            window.drawConnectors(canvasCtx, lm, window.HAND_CONNECTIONS, { color: glowColor, lineWidth: 5 });
            window.drawLandmarks(canvasCtx, lm, { color: "#fff", lineWidth: 1, radius: 2 });

            const isUp = (tip: number, pip: number) => lm[tip].y < lm[pip].y;
            const pinch = Math.hypot(lm[8].x - lm[4].x, lm[8].y - lm[4].y);

            const indexUp = isUp(8, 6);
            const middleUp = isUp(12, 10);
            const ringUp = isUp(16, 14);
            const pinkyUp = isUp(20, 18);
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
              if (pinch < 0.05) {
                detected = "purple";
              } else if (thumbUp && !indexUp && !middleUp && !ringUp && pinkyUp) {
                detected = "mahito";
              } else if (indexUp && !middleUp && !ringUp && pinkyUp) {
                detected = "megumi";
              } else if (thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp) {
                detected = "hakari";
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
        }
        updateState(detected);
      });

      const runCustomFrameLoop = () => {
        if (videoEl.readyState >= 2) {
          canvasEl.width = videoEl.videoWidth;
          canvasEl.height = videoEl.videoHeight;
          hands.send({ image: videoEl });
        }
        frameLoopIdRef.current = requestAnimationFrame(runCustomFrameLoop);
      };

      if (cameraStreamUrl) {
        videoEl.src = cameraStreamUrl;
        videoEl.crossOrigin = "anonymous";
        videoEl.play().catch(() => {});
        frameLoopIdRef.current = requestAnimationFrame(runCustomFrameLoop);
      } else if (cameraDeviceId) {
        navigator.mediaDevices
          .getUserMedia({
            video: {
              deviceId: { exact: cameraDeviceId },
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
          })
          .then((stream) => {
            videoEl.srcObject = stream;
            videoEl.play().catch(() => {});
            frameLoopIdRef.current = requestAnimationFrame(runCustomFrameLoop);
          })
          .catch((err) => console.error("Camera access failed:", err));
      } else {
        const cameraUtils = new window.Camera(videoEl, {
          onFrame: async () => {
            canvasEl.width = videoEl.videoWidth;
            canvasEl.height = videoEl.videoHeight;
            await hands.send({ image: videoEl });
          },
          width: 640,
          height: 480,
        });
        cameraUtils.start();
        cameraUtilsRef.current = cameraUtils;
      }
    };

    initHands();

    // ─── Animation Loop ──────────────────────────────
    function animate() {
      animId = requestAnimationFrame(animate);

      if (shakeIntensity > 0) {
        renderer.domElement.style.transform = `translate(${(Math.random() - 0.5) * shakeIntensity * 40}px, ${(Math.random() - 0.5) * shakeIntensity * 40}px)`;
      } else {
        renderer.domElement.style.transform = "translate(0,0)";
      }

      const pos = particles.geometry.attributes.position.array as Float32Array;
      const col = particles.geometry.attributes.color.array as Float32Array;
      const siz = particles.geometry.attributes.size.array as Float32Array;

      for (let i = 0; i < COUNT * 3; i++) {
        pos[i] += (targetPositions[i] - pos[i]) * 0.1;
        col[i] += (targetColors[i] - col[i]) * 0.1;
      }
      for (let i = 0; i < COUNT; i++) siz[i] += (targetSizes[i] - siz[i]) * 0.1;

      particles.geometry.attributes.position.needsUpdate = true;
      particles.geometry.attributes.color.needsUpdate = true;
      particles.geometry.attributes.size.needsUpdate = true;

      if (currentTech === "red") {
        particles.rotation.z -= 0.1;
      } else if (currentTech === "purple") {
        particles.rotation.z += 0.2;
        particles.rotation.y += 0.05;
      } else if (currentTech === "shrine" || currentTech === "megumi") {
        particles.rotation.set(0, 0, 0);
      } else if (currentTech === "mahito") {
        particles.rotation.y += 0.01;
        particles.rotation.x += 0.005;
      } else if (currentTech === "hakari") {
        particles.rotation.y += 0.08;
      } else if (currentTech === "blackflash") {
        particles.rotation.z += 0.15;
        particles.rotation.y += 0.1;
      } else if (currentTech === "dismantle") {
        particles.rotation.y += 0.003;
        particles.rotation.z += 0.002;
      } else {
        particles.rotation.y += 0.005;
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
      if (frameLoopIdRef.current != null) {
        cancelAnimationFrame(frameLoopIdRef.current);
        frameLoopIdRef.current = null;
      }
      if (cameraUtilsRef.current?.stop) {
        try {
          cameraUtilsRef.current.stop();
        } catch (_) {}
        cameraUtilsRef.current = null;
      }
      const video = videoRef.current;
      if (video) {
        if (video.srcObject && typeof MediaStream !== "undefined") {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach((t) => t.stop());
          video.srcObject = null;
        }
        if (video.src) {
          video.src = "";
          video.load();
        }
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
  }, [cameraDeviceId, cameraStreamUrl]);

  return (
    <>
      {/* Three.js canvas container */}
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Camera feed */}
      <div className="absolute bottom-[2%] left-[18%] -translate-x-1/2 w-[85vw] max-w-[450px] h-[42vh] border border-border z-20 rounded-[25px] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.9)]" style={{ transform: "translateX(-50%) scaleX(-1)" }}>
        <video ref={videoRef} className="w-full h-full object-cover opacity-80" playsInline muted />
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      </div>
    </>
  );
};

export default JJKScene;
