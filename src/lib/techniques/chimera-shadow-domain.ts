/**
 * Chimera Shadow Garden — liquid shadow ground effect.
 * One large plane with vertex displacement (ripples, waves) and dark reflective sheen.
 * No particles; heavy, oppressive, living-sea-of-shadows mood.
 */

import * as THREE from "three";

const CHIMERA_VERT = `
  uniform float uTime;
  uniform float uExpansion;
  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Ripple waves across the surface (multiple frequencies)
    float r = length(pos.xz);
    float wave1 = sin(r * 0.4 - uTime * 1.2) * 0.15;
    float wave2 = sin(r * 0.7 + uTime * 0.8) * 0.08;
    float wave3 = sin(pos.x * 0.5 + pos.z * 0.5 - uTime) * 0.06;
    float ripple = wave1 + wave2 + wave3;
    pos.y += ripple;
    vElevation = ripple;

    // Slight organic undulation (living surface)
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
    // Base: deep black / dark navy / dark purple
    vec3 base = uDeepColor;

    // Subtle gradient from center (slightly darker at edges)
    float dist = length(vUv - 0.5);
    base = mix(base, base * 0.7, smoothstep(0.2, 0.5, dist));

    // Reflective sheen at grazing angle (wet shadow look)
    float viewDist = length(vViewPosition);
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = 1.0 - abs(dot(viewDir, vec3(0.0, 1.0, 0.0)));
    fresnel = pow(fresnel, 2.5);
    vec3 sheen = uSheenColor * fresnel * 0.12;

    // Slight variation from elevation (ripple highlights)
    float elev = vElevation * 2.0 + 0.5;
    vec3 final = base + sheen + uSheenColor * elev * 0.03;

    // Fade in as domain spreads, fade out as it retracts
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
  expanding: boolean
): void {
  const mat = mesh.material as THREE.ShaderMaterial;
  if (!mat.uniforms) return;
  mat.uniforms.uTime.value += deltaTime;
  mat.uniforms.uExpansion.value = expansion;
}
