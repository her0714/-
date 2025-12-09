import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars, SpotLight } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import MagicParticles from './MagicParticles';
import OrnamentParticles from './OrnamentParticles';
import FillerParticles from './FillerParticles';
import Gifts from './Gifts';
import Snow from './Snow';
import { AppMode } from '../types';
import { COLORS, CONFIG } from '../constants';

interface SceneProps {
  mode: AppMode;
  onOpenCard: (message: string) => void;
}

// A glowing star component that sits at the top of the tree
const Star = ({ mode }: { mode: AppMode }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const isTree = mode === AppMode.TREE_SHAPE;
    
    // Scale animation
    const targetScale = isTree ? 1 : 0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05);
    meshRef.current.rotation.y = time * 0.5;
  });

  return (
    <mesh ref={meshRef} position={[0, CONFIG.TREE_HEIGHT / 2 + 1, 0]}>
      {/* Traditional Star Shape */}
      <octahedronGeometry args={[1.5, 0]} />
      {/* Bright Warm Glow */}
      <meshStandardMaterial 
        color={COLORS.GOLD_METALLIC} 
        emissive={COLORS.GOLD_METALLIC}
        emissiveIntensity={2.0}
        toneMapped={false} 
      />
    </mesh>
  );
};

const Scene: React.FC<SceneProps> = ({ mode, onOpenCard }) => {
  return (
    <div className="w-full h-full absolute top-0 left-0 z-0 bg-[#172554]">
      <Canvas 
        shadows 
        dpr={[1, 1.5]} 
        gl={{ 
          antialias: true,
          toneMapping: THREE.ReinhardToneMapping, 
          toneMappingExposure: 2.5, // High exposure for bright, festive look
          stencil: false,
          depth: true
        }}
      >
        {/* Lighter, warmer fog to blend scene */}
        <fogExp2 attach="fog" args={['#1e1b4b', 0.01]} />

        <PerspectiveCamera makeDefault position={[0, 5, 45]} fov={45} />

        <Suspense fallback={null}>
          <group position={[0, 0, 0]}>
            <FillerParticles mode={mode} />
            <MagicParticles mode={mode} />
            <OrnamentParticles mode={mode} />
            <Gifts mode={mode} onOpenCard={onOpenCard} />
            <Star mode={mode} />
            <Snow />
          </group>

          {/* === LIGHTING (Bright & Warm) === */}
          
          {/* High Intensity Ambient Light to fill shadows with warmth */}
          <ambientLight intensity={1.5} color="#FFE4C4" />
          
          {/* Main Key Light (Warm Sunlight) */}
          <SpotLight
            position={[10, 40, 10]}
            angle={0.6}
            attenuation={15}
            anglePower={5}
            intensity={4.0} 
            color="#FFD700" 
            castShadow
            shadow-bias={-0.0001}
            penumbra={1}
          />

          {/* Strong Frontal Fill Light - Eliminates dark front */}
          <pointLight position={[0, 15, 40]} intensity={2.5} color="#FFE5B4" distance={80} decay={2} />

          {/* Warm Side Lights/Rim Lights */}
          <pointLight position={[25, 10, 15]} intensity={2.0} color="#FFA500" distance={60} decay={2} />
          <pointLight position={[-25, 5, -15]} intensity={2.0} color="#FF8C00" distance={60} decay={2} />

          {/* === ENVIRONMENT === */}
          {/* Sunset preset for warm, golden reflections */}
          <Environment preset="sunset" background={false} blur={0.6} /> 
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />

          {/* === FLOOR (Snowy Ground) === */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]} receiveShadow>
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial 
              color="#F8FAFC"
              roughness={1.0}
              metalness={0.0}
              envMapIntensity={0.5}
            />
          </mesh>
        </Suspense>

        {/* === POST PROCESSING === */}
        <EffectComposer enableNormalPass={false} multisampling={0}>
          
          {/* Enhanced Bloom for magical glow */}
          <Bloom 
            luminanceThreshold={0.7} 
            mipmapBlur 
            intensity={0.5} 
            radius={0.5} 
            levels={8}
          />
          
          <Vignette eskil={false} offset={0.1} darkness={0.4} />
        </EffectComposer>

        <OrbitControls 
          enablePan={false} 
          minDistance={15} 
          maxDistance={70}
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 2 - 0.05}
          autoRotate={mode === AppMode.TREE_SHAPE}
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </div>
  );
};

export default Scene;