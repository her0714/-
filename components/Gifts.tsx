import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GiftData, GiftType, GiftPattern, BowType, AppMode } from '../types';
import { generateGifts } from '../utils/geometry';
import { Text } from '@react-three/drei';

// --- TEXTURE GENERATION ---
const createGiftTexture = (colorHex: string, pattern: GiftPattern): THREE.CanvasTexture | null => {
  if (pattern === GiftPattern.SOLID) return null;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = colorHex;
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = pattern === GiftPattern.SPECIAL ? '#FFD700' : '#FFFFFF';

  if (pattern === GiftPattern.STRIPES) {
    const lineWidth = 40;
    for (let i = -512; i < 1024; i += 80) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + lineWidth, 0);
      ctx.lineTo(i - 512 + lineWidth, 512);
      ctx.lineTo(i - 512, 512);
      ctx.fill();
    }
  } else if (pattern === GiftPattern.DOTS) {
    for (let x = 0; x < 512; x += 60) {
      for (let y = 0; y < 512; y += 60) {
        ctx.beginPath();
        const offset = (y % 120 === 0) ? 0 : 30;
        ctx.arc(x + offset, y, 12, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (pattern === GiftPattern.SPECIAL) {
      ctx.font = "60px serif";
      ctx.fillStyle = "white";
      ctx.fillText("❄", 100, 100);
      ctx.fillText("❄", 300, 300);
      ctx.fillText("★", 400, 100);
      ctx.fillText("★", 100, 400);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

// --- SUB-COMPONENTS ---

const Bow = ({ type, color, scale = 1 }: { type: BowType, color: string, scale?: number }) => {
  const knotGeometry = useMemo(() => {
    if (type === BowType.COMPLEX) return new THREE.TorusKnotGeometry(0.08 * scale, 0.03 * scale, 64, 8);
    return new THREE.TorusKnotGeometry(0.06 * scale, 0.02 * scale, 48, 6, 2, 3); 
  }, [type, scale]);

  return (
    <mesh geometry={knotGeometry} castShadow>
      {/* Ribbon: Satin finish */}
      <meshStandardMaterial color={color} metalness={0.3} roughness={0.3} envMapIntensity={1.0} />
    </mesh>
  );
};

const Tag = ({ text }: { text: string }) => {
  return (
    <group position={[0.1, -0.15, 0.1]} rotation={[0, 0, -0.2]}>
      <mesh castShadow>
        <boxGeometry args={[0.15, 0.08, 0.005]} />
        {/* Paper tag */}
        <meshStandardMaterial color="#FFF8DC" roughness={0.9} metalness={0} />
      </mesh>
      <Text position={[0, 0, 0.01]} fontSize={0.03} color="black" anchorX="center" anchorY="middle">
        {text}
      </Text>
    </group>
  );
};

// --- INTERACTIVE GIFT ITEM ---

const InteractiveGift = ({ data, mode, onOpenCard }: { data: GiftData; mode: AppMode; onOpenCard: (msg: string) => void }) => {
  const groupRef = useRef<THREE.Group>(null);
  const lidGroupRef = useRef<THREE.Group>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  const texture = useMemo(() => createGiftTexture(data.color, data.pattern), [data.color, data.pattern]);
  
  // Physics State
  const position = useRef(new THREE.Vector3(...data.scatterPosition));
  const timeOffset = useRef(Math.random() * 100);

  // Geometry dimensions
  const [width, height, depth] = data.dimensions;
  const lidHeight = height * 0.15; // Lid is top 15%
  const bodyHeight = height * 0.85;

  const handleClick = (e: any) => {
    if (mode === AppMode.TREE_SHAPE) {
      e.stopPropagation();
      setIsOpen(true);
      // Delay showing card slightly to allow open animation to start
      setTimeout(() => onOpenCard(data.cardMessage), 200);
    }
  };

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();
    const isTree = mode === AppMode.TREE_SHAPE;
    const targetPos = isTree ? new THREE.Vector3(...data.treePosition) : new THREE.Vector3(...data.scatterPosition);

    // 1. Position Lerp
    // Hover Effect: Rise 0.1 units
    if (isTree && hovered && !isOpen) {
      targetPos.y += 0.1; // Gentle float
    }
    
    position.current.lerp(targetPos, isTree ? 0.05 : 0.02);
    groupRef.current.position.copy(position.current);

    // 2. Rotation
    if (isTree) {
      const targetRot = new THREE.Euler(...data.rotation);
      
      // Gentle Sway
      if (!hovered && !isOpen) {
         const sway = Math.sin(time * 2 + timeOffset.current) * 0.03;
         targetRot.z += sway;
      }
      
      // Hover Shake
      if (hovered && !isOpen) {
         targetRot.z += Math.sin(time * 15) * 0.03; 
      }

      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRot.x, 0.1);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRot.y, 0.1);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRot.z, 0.1);
    } else {
      groupRef.current.rotation.x += 0.01;
      groupRef.current.rotation.z += 0.01;
    }

    // 3. Lid Animation (Opening)
    if (lidGroupRef.current) {
        // If open, rotate lid 90 degrees backward (around X axis)
        const targetLidRot = isOpen ? -Math.PI / 1.8 : 0;
        lidGroupRef.current.rotation.x = THREE.MathUtils.lerp(lidGroupRef.current.rotation.x, targetLidRot, 0.1);
        
        // Also move it slightly back and up to simulate hinge
        const targetLidPosY = isOpen ? bodyHeight/2 + lidHeight/2 + 0.1 : bodyHeight/2 + lidHeight/2;
        const targetLidPosZ = isOpen ? -width/2 : 0;
        lidGroupRef.current.position.y = THREE.MathUtils.lerp(lidGroupRef.current.position.y, targetLidPosY, 0.1);
        lidGroupRef.current.position.z = THREE.MathUtils.lerp(lidGroupRef.current.position.z, targetLidPosZ, 0.1);
    }
  });

  // Material setup: Brighter wrapping
  const materialProps = {
    color: texture ? 'white' : data.color,
    map: texture,
    roughness: 0.6, // Slight sheen
    metalness: 0.1, 
    envMapIntensity: 1.0,
  };

  // Hover Glow (White outline/rim light)
  const glowIntensity = hovered ? 0.5 : 0.0;

  return (
    <group 
      ref={groupRef} 
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* --- BODY --- */}
      <mesh position={[0, -lidHeight/2, 0]} castShadow receiveShadow>
        {data.type === GiftType.CUBE && <boxGeometry args={[width, bodyHeight, depth]} />}
        {data.type === GiftType.CYLINDER && <cylinderGeometry args={[width, width, bodyHeight, 32]} />}
        {data.type === GiftType.STAR && <octahedronGeometry args={[width, 0]} />} 
        
        <meshStandardMaterial 
          {...materialProps} 
          emissive="#FFD700"
          emissiveIntensity={glowIntensity}
        />
      </mesh>

      {/* Ribbon on Body */}
      {data.type === GiftType.CUBE && (
         <group position={[0, -lidHeight/2, 0]}>
            <mesh position={[0, 0, 0]} scale={[1.01, 1, 1.01]}>
               <boxGeometry args={[width * 0.15, bodyHeight, depth]} />
               <meshStandardMaterial color={data.decoration.ribbonColor} metalness={0.2} roughness={0.4} envMapIntensity={1.0} />
            </mesh>
            <mesh position={[0, 0, 0]} scale={[1.01, 1, 1.01]}>
               <boxGeometry args={[width, bodyHeight, depth * 0.15]} />
               <meshStandardMaterial color={data.decoration.ribbonColor} metalness={0.2} roughness={0.4} envMapIntensity={1.0} />
            </mesh>
         </group>
      )}

      {/* --- LID GROUP (Pivot for opening) --- */}
      <group ref={lidGroupRef} position={[0, bodyHeight/2 + lidHeight/2, 0]}>
          {/* Lid Mesh */}
          <mesh castShadow>
             {data.type === GiftType.CUBE && <boxGeometry args={[width * 1.05, lidHeight, depth * 1.05]} />}
             {data.type === GiftType.CYLINDER && <cylinderGeometry args={[width * 1.05, width * 1.05, lidHeight, 32]} />}
             <meshStandardMaterial 
                {...materialProps} 
                emissive="#FFD700"
                emissiveIntensity={glowIntensity}
             />
          </mesh>
          
          {/* Ribbon on Lid */}
          {data.type === GiftType.CUBE && (
            <group>
                <mesh position={[0, 0, 0]} scale={[1.06, 1.01, 1.06]}>
                   <boxGeometry args={[width * 0.15, lidHeight, depth]} />
                   <meshStandardMaterial color={data.decoration.ribbonColor} metalness={0.2} roughness={0.4} envMapIntensity={1.0} />
                </mesh>
                <mesh position={[0, 0, 0]} scale={[1.06, 1.01, 1.06]}>
                   <boxGeometry args={[width, lidHeight, depth * 0.15]} />
                   <meshStandardMaterial color={data.decoration.ribbonColor} metalness={0.2} roughness={0.4} envMapIntensity={1.0} />
                </mesh>
            </group>
          )}

          {/* Bow & Tag */}
          {data.decoration.hasBow && (
             <group position={[0, lidHeight/2, 0]}>
                <Bow type={data.decoration.bowType} color={data.decoration.ribbonColor} scale={width * 3} />
                {data.decoration.hasTag && <Tag text={data.decoration.tagText} />}
             </group>
          )}
      </group>

      {/* --- CONTENT (Visible when open) --- */}
      {isOpen && (
        <group position={[0, 0, 0]}>
           {/* Warm Light Emitted from inside */}
           <pointLight color="#FFD700" intensity={3} distance={5} decay={2} />
           
           {/* The Card inside */}
           <mesh position={[0, bodyHeight/2, 0]} rotation={[0.2, 0, 0]}>
             <planeGeometry args={[width * 0.8, height * 0.6]} />
             <meshStandardMaterial color="#FFF8DC" emissive="#FFF8DC" emissiveIntensity={0.2} />
           </mesh>
        </group>
      )}
    </group>
  );
};

const Gifts: React.FC<{ mode: AppMode; onOpenCard: (msg: string) => void }> = ({ mode, onOpenCard }) => {
  const gifts = useMemo(() => generateGifts(), []);

  return (
    <group>
      {gifts.map(gift => (
        <InteractiveGift 
          key={gift.id} 
          data={gift} 
          mode={mode} 
          onOpenCard={onOpenCard} 
        />
      ))}
    </group>
  );
};

export default Gifts;