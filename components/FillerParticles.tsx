import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AppMode } from '../types';
import { CONFIG, COLORS } from '../constants';
import { generateFillerParticles } from '../utils/geometry';

interface FillerParticlesProps {
  mode: AppMode;
}

const FillerParticles: React.FC<FillerParticlesProps> = ({ mode }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Generate data once
  const particles = useMemo(() => generateFillerParticles(), []);

  // Reusable dummy object
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const currentPositions = useMemo(() => {
    return particles.map(p => new THREE.Vector3(...p.scatterPosition));
  }, [particles]);

  useLayoutEffect(() => {
    if (!meshRef.current) return;

    // Set initial
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
      // 1. Target
      const tx = isTreeMode ? p.treePosition[0] : p.scatterPosition[0];
      const ty = isTreeMode ? p.treePosition[1] : p.scatterPosition[1];
      const tz = isTreeMode ? p.treePosition[2] : p.scatterPosition[2];

      targetPos.set(tx, ty, tz);

      // Gentle floating (less chaotic than surface)
      if (isTreeMode) {
        targetPos.y += Math.sin(time * 0.5 + p.id) * 0.01;
      } else {
        targetPos.x += Math.sin(time * 0.2 + p.id * 0.1) * 1.5;
        targetPos.y += Math.cos(time * 0.1 + p.id * 0.1) * 1.5;
        targetPos.z += Math.sin(time * 0.2 + p.id * 0.1) * 1.5;
      }

      // 2. Interpolate
      const current = currentPositions[i];
      const dist = current.distanceTo(targetPos);
      const lerpSpeed = isTreeMode 
        ? THREE.MathUtils.lerp(0.01, 0.05, Math.min(dist / 20, 1)) 
        : 0.01;
      
      current.lerp(targetPos, lerpSpeed);

      // 3. Update
      dummy.position.copy(current);
      dummy.rotation.x = time * 0.1 + p.id;
      dummy.rotation.y = time * 0.1 + p.id;
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, CONFIG.FILLER_COUNT]}
      castShadow
      receiveShadow
      frustumCulled={false}
    >
      {/* Low poly Octahedron for grains */}
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        toneMapped={true}
        roughness={0.9} 
        metalness={0.1} 
        color={COLORS.EMERALD_DARKEST} 
        emissive={COLORS.EMERALD_DEEP}
        emissiveIntensity={0.3} // Weak light emission
        envMapIntensity={0.2} 
        transparent={false}
        opacity={1.0} 
      />
    </instancedMesh>
  );
};

export default FillerParticles;