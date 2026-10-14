import { useMemo, useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Html, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────────────────────
   OrbitHero — the PRD's 3D centerpiece.
   A slowly rotating "SA" monogram core wrapped in three tilted orbital rings,
   with the real stack (React, Node.js, Java, SQL…) orbiting as glowing chips.
   React-three-fiber + drei · lazy-loaded by Hero · falls back to a static
   monogram when WebGL is unavailable.
   ──────────────────────────────────────────────────────────────────────────── */

const INDIGO = "#818cf8";
const INDIGO_SOFT = "#a5b4fc";
const CYAN = "#22d3ee";
const CYAN_SOFT = "#67e8f9";

// Orbit bands: radius, tilt (x, y deg), speed (rad/s), chip assignments
const ORBITS = [
  { radius: 1.72, tiltX: 1.22, tiltY: 0.12, speed: 0.42, chips: ["React", "Node.js"] },
  { radius: 2.28, tiltX: 1.38, tiltY: -0.34, speed: -0.3, chips: ["TypeScript", "Java", "SQL"] },
  { radius: 2.84, tiltX: 1.05, tiltY: 0.55, speed: 0.2, chips: ["Firebase", "Tailwind"] },
];

const CHIP_COLORS = {
  React: CYAN,
  "Node.js": INDIGO,
  TypeScript: INDIGO_SOFT,
  Java: CYAN_SOFT,
  SQL: INDIGO,
  Firebase: CYAN,
  Tailwind: INDIGO_SOFT,
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return undefined;
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

/* A glowing dot that rides one orbital band, carrying a crisp DOM label */
function OrbitChip({ label, color, radius, tiltX, tiltY, speed, phase, reduced }) {
  const ref = useRef(null);
  const angle = useRef(phase);

  useFrame((_, delta) => {
    if (!ref.current) return;
    if (!reduced) angle.current += speed * delta;
    const a = angle.current;
    // Point on circle in orbital plane
    const x = Math.cos(a) * radius;
    const z = Math.sin(a) * radius;
    const y = 0;
    ref.current.position.set(x, y, z);
    ref.current.rotation.set(tiltX, 0, tiltY); // match band tilt so dot hugs the ring
  });

  // Position the dot on the tilted ring by nesting: outer group applies tilt
  return (
    <group rotation={[tiltX, 0, tiltY]}>
      <group ref={ref}>
        <mesh>
          <sphereGeometry args={[0.085, 16, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
        {/* soft halo */}
        <mesh>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.22} />
        </mesh>
        <Html center distanceFactor={9} zIndexRange={[20, 0]} wrapperClass="orbit-chip-host">
          <span className="orbit-chip" style={{ borderColor: `${color}55` }}>
            <span className="orbit-chip-dot" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
            {label}
          </span>
        </Html>
      </group>
    </group>
  );
}

/* The central monogram core: faceted body + wireframe shell + inner light */
function Core({ reduced }) {
  const body = useRef(null);
  const shell = useRef(null);

  useFrame((_, delta) => {
    if (reduced) return;
    if (body.current) body.current.rotation.y += delta * 0.16;
    if (shell.current) {
      shell.current.rotation.y -= delta * 0.1;
      shell.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.9} floatingRange={[-0.08, 0.08]}>
      {/* faceted core */}
      <mesh ref={body}>
        <icosahedronGeometry args={[1.02, 1]} />
        <meshStandardMaterial
          color="#14141f"
          metalness={0.85}
          roughness={0.28}
          emissive="#6366f1"
          emissiveIntensity={0.16}
          flatShading
        />
      </mesh>
      {/* wireframe shell */}
      <mesh ref={shell}>
        <icosahedronGeometry args={[1.24, 1]} />
        <meshBasicMaterial color={CYAN} wireframe transparent opacity={0.16} />
      </mesh>
      {/* inner rim glow */}
      <mesh>
        <icosahedronGeometry args={[0.86, 1]} />
        <meshBasicMaterial color={INDIGO} transparent opacity={0.05} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={2.2} distance={4.5} color={INDIGO_SOFT} />
    </Float>
  );
}

/* Three tilted hairline rings */
function Rings({ reduced }) {
  const g = useRef(null);
  useFrame((_, delta) => {
    if (!g.current || reduced) return;
    g.current.rotation.z += delta * 0.03;
  });
  return (
    <group ref={g}>
      {[
        { r: 1.72, c: INDIGO, o: 0.4, rx: 1.22, ry: 0.12 },
        { r: 2.28, c: CYAN, o: 0.26, rx: 1.38, ry: -0.34 },
        { r: 2.84, c: INDIGO_SOFT, o: 0.18, rx: 1.05, ry: 0.55 },
      ].map((ring, i) => (
        <mesh key={i} rotation={[ring.rx, ring.ry, 0]}>
          <torusGeometry args={[ring.r, 0.0065, 8, 128]} />
          <meshBasicMaterial color={ring.c} transparent opacity={ring.o} />
        </mesh>
      ))}
    </group>
  );
}

/* Mouse-parallax rig wrapping the whole scene */
function Rig({ children, reduced }) {
  const ref = useRef(null);
  useFrame((state, delta) => {
    if (!ref.current) return;
    const targetX = reduced ? 0 : state.pointer.y * 0.12;
    const targetY = reduced ? 0 : state.pointer.x * 0.18;
    const k = 1 - Math.pow(0.001, delta); // frame-rate independent lerp
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, targetX, k);
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetY, k);
  });
  return <group ref={ref}>{children}</group>;
}

/* Pull the camera back on narrow viewports so the full orbit fits (declarative) */
function CameraRig() {
  const width = useThree((s) => s.size.width);
  const z = width < 480 ? 8.6 : width < 768 ? 7.8 : width < 1100 ? 7.1 : 6.6;
  return <PerspectiveCamera makeDefault position={[0, 0.4, z]} fov={42} />;
}

function Chips({ reduced }) {
  const chips = useMemo(() => {
    const list = [];
    ORBITS.forEach((band, bi) => {
      band.chips.forEach((label, ci) => {
        list.push({
          label,
          color: CHIP_COLORS[label] || INDIGO,
          radius: band.radius,
          tiltX: band.tiltX,
          tiltY: band.tiltY,
          speed: band.speed,
          // Spread chips evenly around each band, offset per band
          phase: (ci * Math.PI * 2) / band.chips.length + bi * 1.05,
        });
      });
    });
    return list;
  }, []);
  return (
    <>
      {chips.map((c) => (
        <OrbitChip key={c.label} {...c} reduced={reduced} />
      ))}
    </>
  );
}

export default function HeroOrbit() {
  const reduced = useReducedMotion();

  return (
    <Canvas
      className="hero-canvas-wrap"
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.4, 6.6], fov: 42 }}
      style={{ background: "transparent" }}
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-44 h-44 rounded-full border border-accent-indigo/25 flex items-center justify-center bg-bg-card">
            <span className="font-display font-bold text-5xl text-gradient-indigo">SA</span>
          </div>
        </div>
      }
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 6]} intensity={1.1} color="#dbe1ff" />
      <directionalLight position={[-6, -3, -4]} intensity={0.5} color={CYAN} />
      <CameraRig />
      <Rig reduced={reduced}>
        <Core reduced={reduced} />
        <Rings reduced={reduced} />
        <Chips reduced={reduced} />
      </Rig>
    </Canvas>
  );
}
