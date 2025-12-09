import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AppMode } from '../types';
import { CONFIG } from '../constants';
import { generateParticles } from '../utils/geometry';

interface MagicParticlesProps {
  mode: AppMode;
}

const MagicParticles: React.FC<MagicParticlesProps> = ({ mode }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Generate data once
  const particles = useMemo(() => generateParticles(), []);

  // Reusable dummy object for matrix calculations
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const currentPositions = useMemo(() => {
    return particles.map(p => new THREE.Vector3(...p.scatterPosition));
  }, [particles]);

  useLayoutEffect(() => {
    if (!meshRef.current) return;

    // Set initial colors and transforms
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

      // Add floating noise
      if (isTreeMode) {
        // Natural breeze effect
        targetPos.y += Math.sin(time * 1 + p.id) * 0.02;
        targetPos.x += Math.cos(time * 0.8 + p.id) * 0.01;
        targetPos.z += Math.sin(time * 0.9 + p.id) * 0.01;
      } else {
        // Flowing chaotic movement
        targetPos.x += Math.sin(time * 0.3 + p.id * 0.1) * 2;
        targetPos.y += Math.cos(time * 0.2 + p.id * 0.1) * 2;
        targetPos.z += Math.sin(time * 0.4 + p.id * 0.1) * 2;
      }

      // 2. Interpolate Current Position towards Target
      const current = currentPositions[i];
      // Dynamic speed: faster when changing modes, slower when settling
      const dist = current.distanceTo(targetPos);
      const lerpSpeed = isTreeMode 
        ? THREE.MathUtils.lerp(0.02, 0.1, Math.min(dist / 20, 1)) 
        : 0.02;
      
      current.lerp(targetPos, lerpSpeed);

      // 3. Apply to Dummy
      dummy.position.copy(current);
      
      // Rotate particles continuously (gentle spin)
      dummy.rotation.x = time * 0.2 + p.id;
      dummy.rotation.y = time * 0.1 + p.id;

      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();

      // 4. Update Instance
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, CONFIG.PARTICLE_COUNT]}
      castShadow
      receiveShadow
      frustumCulled={false}
    >
      <dodecahedronGeometry args={[1, 0]} />
      {/* 
        Vegetation Material:
        - Natural Pine Appearance
        - Boosted envMapIntensity for brightness
      */}
      <meshStandardMaterial
        toneMapped={true}
        roughness={0.7} 
        metalness={0.1} 
        envMapIntensity={1.0} // Increased for more light reflection
        transparent={false}
        opacity={1.0} 
        depthWrite={true}
      />
    </instancedMesh>
  );
};

export default MagicParticles;