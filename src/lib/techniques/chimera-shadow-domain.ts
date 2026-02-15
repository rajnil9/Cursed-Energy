/**
 * Chimera Shadow Garden — liquid shadow ground + rising shadow forms.
 * Ground plane with ripples and wet sheen; tendrils/spikes rise from surface then dissolve.
 * No particles, no neon; oppressive, living darkness.
 */

import * as THREE from "three";

// ─── Ground plane shader ─────────────────────────────────────────
const CHIMERA_VERT = `
  uniform float uTime;
  uniform float uExpansion;
  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    vec3 pos = position;

    float r = length(pos.xz);
    float wave1 = sin(r * 0.4 - uTime * 1.2) * 0.15;
    float wave2 = sin(r * 0.7 + uTime * 0.8) * 0.08;
    float wave3 = sin(pos.x * 0.5 + pos.z * 0.5 - uTime) * 0.06;
    float ripple = wave1 + wave2 + wave3;
    pos.y += ripple;
    vElevation = ripple;
    pos.y += sin(pos.x * 0.2 + uTime * 0.5) * cos(pos.z * 0.2 + uTime * 0.3) * 0.1;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const CHIMERA_FRAG = `
  uniform float uTime;
  uniform float uExpansion;
  uniform vec3 uDeepColor;
  uniform vec3 uSheenColor;
  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vViewPosition;

  void main() {
    vec3 base = uDeepColor;
    float dist = length(vUv - 0.5);
    base = mix(base, base * 0.7, smoothstep(0.2, 0.5, dist));
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = 1.0 - abs(dot(viewDir, vec3(0.0, 1.0, 0.0)));
    fresnel = pow(fresnel, 2.5);
    vec3 sheen = uSheenColor * fresnel * 0.12;
    float elev = vElevation * 2.0 + 0.5;
    vec3 final = base + sheen + uSheenColor * elev * 0.03;
    float alpha = 0.92 * smoothstep(0.0, 0.25, uExpansion);
    gl_FragColor = vec4(final, alpha);
  }
`;

const DEEP_COLOR = new THREE.Color(0.015, 0.012, 0.035);
const SHEEN_COLOR = new THREE.Color(0.08, 0.05, 0.15);

export function createChimeraShadowPlane(): THREE.Mesh {
  const segments = 80;
  const geometry = new THREE.PlaneGeometry(220, 220, segments, segments);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uExpansion: { value: 0 },
      uDeepColor: { value: new THREE.Vector3(DEEP_COLOR.r, DEEP_COLOR.g, DEEP_COLOR.b) },
      uSheenColor: { value: new THREE.Vector3(SHEEN_COLOR.r, SHEEN_COLOR.g, SHEEN_COLOR.b) },
    },
    vertexShader: CHIMERA_VERT,
    fragmentShader: CHIMERA_FRAG,
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -22;
  mesh.position.z = 0;
  mesh.scale.set(0.001, 1, 0.001);
  mesh.visible = false;
  mesh.renderOrder = -1;
  return mesh;
}

export function updateChimeraShadowPlane(
  mesh: THREE.Mesh,
  deltaTime: number,
  expansion: number,
  _expanding: boolean
): void {
  const mat = mesh.material as THREE.ShaderMaterial;
  if (!mat.uniforms) return;
  mat.uniforms.uTime.value += deltaTime;
  mat.uniforms.uExpansion.value = expansion;
}

// ─── Rising shadow tendrils (from ground, no mid-air) ─────────────
const TENDRIL_COUNT = 12;
const RISE_DURATION = 0.35;
const HOLD_DURATION = 0.15;
const FALL_DURATION = 0.35;
const CYCLE_LENGTH = RISE_DURATION + HOLD_DURATION + FALL_DURATION;
const TENDRIL_SPEED = 0.12;

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function risePhase(cycle: number): number {
  if (cycle < RISE_DURATION) return cycle / RISE_DURATION;
  if (cycle < RISE_DURATION + HOLD_DURATION) return 1;
  const fallT = (cycle - RISE_DURATION - HOLD_DURATION) / FALL_DURATION;
  return 1 - fallT;
}

const TENDRILL_VERT = `
  attribute float rise;
  varying float vRise;
  void main() {
    vRise = rise;
    vec3 pos = position;
    pos.y = (pos.y + 10.0) * rise;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const TENDRILL_FRAG = `
  uniform vec3 uColor;
  uniform float uExpansion;
  varying float vRise;
  void main() {
    float a = 0.85 * vRise * smoothstep(0.0, 0.2, uExpansion);
    gl_FragColor = vec4(uColor, a);
  }
`;

export function createChimeraShadowTendrils(): THREE.Group {
  const group = new THREE.Group();
  group.visible = false;
  group.position.set(0, -22, 0);

  const width = 2;
  const height = 20;
  const geometry = new THREE.PlaneGeometry(width, height);

  const riseAttr = new THREE.InstancedBufferAttribute(new Float32Array(TENDRIL_COUNT), 1);
  geometry.setAttribute("rise", riseAttr);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Vector3(0.02, 0.018, 0.04) },
      uExpansion: { value: 0 },
    },
    vertexShader: TENDRILL_VERT,
    fragmentShader: TENDRILL_FRAG,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.InstancedMesh(geometry, material, TENDRIL_COUNT);
  const dummy = new THREE.Object3D();
  const phases: number[] = [];
  const positions: { x: number; z: number }[] = [];

  for (let i = 0; i < TENDRIL_COUNT; i++) {
    phases.push(seededRandom(i * 7) * 0.9);
    const angle = seededRandom(i * 13) * Math.PI * 2;
    const r = 25 + seededRandom(i * 17) * 70;
    positions.push({ x: Math.cos(angle) * r, z: Math.sin(angle) * r });
    dummy.position.set(positions[i].x, 0, positions[i].z);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;

  (mesh as THREE.Mesh & { _riseAttr?: THREE.InstancedBufferAttribute; _phases?: number[]; _positions?: { x: number; z: number }[] })._riseAttr = riseAttr;
  (mesh as THREE.Mesh & { _riseAttr?: THREE.InstancedBufferAttribute; _phases?: number[]; _positions?: { x: number; z: number }[] })._phases = phases;
  (mesh as THREE.Mesh & { _riseAttr?: THREE.InstancedBufferAttribute; _phases?: number[]; _positions?: { x: number; z: number }[] })._positions = positions;

  mesh.renderOrder = 0;
  group.add(mesh);
  return group;
}

export function updateChimeraShadowTendrils(
  group: THREE.Group,
  time: number,
  expansion: number
): void {
  const mesh = group.children[0] as THREE.InstancedMesh & {
    _riseAttr?: THREE.InstancedBufferAttribute;
    _phases?: number[];
    _positions?: { x: number; z: number }[];
  };
  if (!mesh?.isInstancedMesh || !mesh._riseAttr || !mesh._phases) return;

  const mat = mesh.material as THREE.ShaderMaterial;
  if (mat.uniforms) mat.uniforms.uExpansion.value = expansion;

  const arr = mesh._riseAttr.array as Float32Array;
  for (let i = 0; i < TENDRIL_COUNT; i++) {
    const cycle = ((time * TENDRIL_SPEED + mesh._phases[i]) % 1) * CYCLE_LENGTH;
    const rise = Math.max(0, risePhase(cycle));
    arr[i] = rise;
  }
  mesh._riseAttr.needsUpdate = true;
}
