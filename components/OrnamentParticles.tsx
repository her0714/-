import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AppMode } from '../types';
import { CONFIG } from '../constants';
import { generateOrnaments } from '../utils/geometry';

interface OrnamentParticlesProps {
  mode: AppMode;
}

const OrnamentParticles: React.FC<OrnamentParticlesProps> = ({ mode }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Generate ornament data
  const particles = useMemo(() => generateOrnaments(), []);

  // Reusable objects
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  
  // Store current positions in a mutable array for physics/lerping
  const currentPositions = useMemo(() => {
    return particles.map(p => new THREE.Vector3(...p.scatterPosition));
  }, [particles]);

  useLayoutEffect(() => {
    if (!meshRef.current) return;

    particles.forEach((p, i) => {
      dummy.position.set(p.scatterPosition[0], p.scatterPosition[1], p.scatterPosition[2]);
      dummy.scale.set(p.scale, p.scale, p.scale);
      dummy.updateMatrix();
      
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, new THREE.Color(p.color));
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [particles, dummy]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const isTreeMode = mode === AppMode.TREE_SHAPE;

    particles.forEach((p, i) => {
      // 1. Determine Target
      const tx = isTreeMode ? p.treePosition[0] : p.scatterPosition[0];
      const ty = isTreeMode ? p.treePosition[1] : p.scatterPosition[1];
      const tz = isTreeMode ? p.treePosition[2] : p.scatterPosition[2];

      targetPos.set(tx, ty, tz);

      // Add gentle floating motion
      if (isTreeMode) {
        targetPos.y += Math.sin(time * 1.5 + p.id) * 0.05;
      } else {
        targetPos.x += Math.sin(time * 0.2 + p.id * 0.1) * 2;
        targetPos.y += Math.cos(time * 0.15 + p.id * 0.1) * 2;
        targetPos.z += Math.sin(time * 0.25 + p.id * 0.1) * 2;
      }

      // 2. Interpolate
      const current = currentPositions[i];
      const dist = current.distanceTo(targetPos);
      const lerpSpeed = isTreeMode 
        ? THREE.MathUtils.lerp(0.01, 0.08, Math.min(dist / 25, 1)) 
        : 0.015;
      
      current.lerp(targetPos, lerpSpeed);

      // 3. Update Matrix
      dummy.position.copy(current);
      
      // ROTATION: Gentle spin
      dummy.rotation.x = time * 0.5 + p.id;
      dummy.rotation.y = time * 0.4 + p.id;
      
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, CONFIG.ORNAMENT_COUNT]}
      castShadow
      receiveShadow
      frustumCulled={false}
    >
      {/* SphereGeometry for traditional Baubles */}
      <sphereGeometry args={[1, 16, 16]} />
      {/* 
        Traditional Ornament Material:
        - High gloss (low roughness)
        - Moderate metalness
        - High envMap intensity for sparkles
      */}
      <meshStandardMaterial
        color="white" 
        roughness={0.1} // Glossier
        metalness={0.6} // More reflective
        envMapIntensity={2.0} // Bright reflections
        toneMapped={true}
        transparent={false}
        opacity={1.0}
        depthWrite={true}
      />
    </instancedMesh>
  );
};

export default OrnamentParticles;