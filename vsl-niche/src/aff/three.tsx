import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";

// cinematic lighting: warm key, molten-orange rim, cool steel fill
const Lights: React.FC = () => (
  <>
    <ambientLight intensity={0.9} />
    <hemisphereLight args={["#FFFFFF", "#C9CBD1", 1.1]} />
    <directionalLight position={[4, 6, 6]} intensity={2.8} color="#FFFFFF" />
    <pointLight position={[-5, 1.5, 3]} intensity={35} color="#FF8A4A" />
    <pointLight position={[5, -1, -2]} intensity={20} color="#9CC8FF" />
    <pointLight position={[0, 4, 5]} intensity={20} color="#FFFFFF" />
  </>
);

const roundedBox = (w: number, h: number, d: number, r: number) => {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: d - r * 2, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 6, curveSegments: 10 });
  g.translate(0, 0, -(d - r * 2) / 2);
  return g;
};

const Glossy: React.FC<{ color: string; emissive?: string; ei?: number; metal?: number }> = ({ color, emissive, ei = 0.04, metal = 0.75 }) => (
  <meshPhysicalMaterial color={color} roughness={0.3} metalness={metal} clearcoat={1} clearcoatRoughness={0.2} emissive={emissive ?? color} emissiveIntensity={ei} />
);

/** the ProfitIQS kit box: pastel body, magenta ribbon, hinged lid. open 0..1 */
export const KitBox: React.FC<{ open: number; rotY: number; rotX?: number; y?: number; scale?: number; bow?: number }> = ({ open, rotY, rotX = 0.62, y = 0, scale = 1, bow = 0 }) => {
  const body = useMemo(() => roundedBox(3.2, 2.2, 2.4, 0.18), []);
  const lid = useMemo(() => roundedBox(3.4, 0.42, 2.6, 0.12), []);
  return (
    <group position={[0, y, 0]} rotation={[rotX, rotY, 0]} scale={scale}>
      <mesh geometry={body}><Glossy color="#ECEDEF" metal={0.25} /></mesh>
      {/* ribbon on the body */}
      <mesh position={[0, 0, 1.215]}><boxGeometry args={[0.42, 2.25, 0.03]} /><Glossy color="#FF5E1A" ei={0.35} metal={0.3} /></mesh>
      <mesh position={[1.615, 0, 0]}><boxGeometry args={[0.03, 2.25, 0.42]} /><Glossy color="#FF5E1A" ei={0.35} metal={0.3} /></mesh>
      {/* inner glow when open */}
      <mesh position={[0, 1.125, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2.85, 2.0]} /><meshBasicMaterial color="#FFB27A" transparent opacity={0.95 * open} /></mesh>
      {/* lid hinged at the back top edge */}
      <group position={[0, 1.1, -1.25]} rotation={[-open * 2.25, 0, 0]}>
        <group position={[0, 0.21, 1.25]}>
          <mesh geometry={lid}><Glossy color="#111214" metal={0.4} /></mesh>
          <mesh position={[0, 0.215, 0]}><boxGeometry args={[0.44, 0.02, 2.62]} /><Glossy color="#FF5E1A" ei={0.35} metal={0.3} /></mesh>
          {/* bow */}
          <group position={[0, 0.3, 0]} scale={0.6 + 0.4 * (1 - open) + bow * 0.2}>
            <mesh position={[-0.32, 0.12, 0]} rotation={[0, 0, 0.6]}><torusGeometry args={[0.28, 0.09, 16, 40]} /><Glossy color="#FF5E1A" ei={0.35} metal={0.3} /></mesh>
            <mesh position={[0.32, 0.12, 0]} rotation={[0, 0, -0.6]}><torusGeometry args={[0.28, 0.09, 16, 40]} /><Glossy color="#FF5E1A" ei={0.35} metal={0.3} /></mesh>
            <mesh position={[0, 0.06, 0]}><sphereGeometry args={[0.14, 24, 24]} /><Glossy color="#FFB21E" ei={0.3} metal={0.6} /></mesh>
          </group>
        </group>
      </group>
    </group>
  );
};

/** glossy pastel shapes drifting (decor) */
export const Floaters: React.FC<{ fr: number; spread?: number }> = ({ fr, spread = 1 }) => {
  const items: [number, number, number, string, "torus" | "sphere" | "cap" | "ico"][] = [
    [-5.2, 2.2, -2, "#C9CDD4", "torus"], [5.4, 2.4, -3, "#FF5E1A", "sphere"], [-5.6, -2.3, -2.5, "#111214", "ico"],
    [5.0, -2.2, -2, "#FFB21E", "cap"], [0.4, 3.3, -5, "#D5D8DE", "ico"], [-1.8, -3.4, -4, "#FF5E1A", "torus"],
  ];
  return (
    <>
      {items.map(([x, y, z, c, k], i) => (
        <mesh key={i} position={[x * spread, y + Math.sin(fr / 40 + i) * 0.25, z]} rotation={[fr / (70 + i * 9), fr / (55 + i * 7), 0]}>
          {k === "torus" ? <torusGeometry args={[0.55, 0.22, 32, 64]} /> : k === "sphere" ? <sphereGeometry args={[0.6, 40, 40]} /> : k === "cap" ? <capsuleGeometry args={[0.32, 0.8, 12, 24]} /> : <icosahedronGeometry args={[0.65, 1]} />}
          <Glossy color={c} ei={0.05} metal={0.85} />
        </mesh>
      ))}
    </>
  );
};

/** a full-frame transparent 3D layer */
export const Stage: React.FC<{ children: React.ReactNode; cam?: [number, number, number]; fov?: number }> = ({ children, cam = [0, 0, 9], fov = 38 }) => (
  <ThreeCanvas width={1920} height={1080} camera={{ position: cam, fov }} flat gl={{ alpha: true, antialias: true, premultipliedAlpha: false }} style={{ position: "absolute", inset: 0, background: "transparent" }}>
    <Lights />
    {children}
  </ThreeCanvas>
);

export const useFr = () => useCurrentFrame();
