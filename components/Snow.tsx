import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SNOW_CONFIG, CONFIG } from '../constants';

const SnowVertexShader = `
  uniform float uTime;
  uniform float uHeight;
  uniform float uRadius;
  uniform float uWindX;
  uniform float uWindZ;
  uniform float uSpeed;
  
  // Tree parameters passed as uniforms
  uniform float uTreeHeight;
  uniform float uTreeRadius;

  attribute float aScale;
  attribute float aRandom;
  attribute vec3 aVelocity;

  varying vec2 vUv;
  varying float vAlpha;
  varying float vRandom;
  varying float vDistance;

  // Simple pseudo-random
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
    vUv = uv;
    vRandom = aRandom;

    vec3 pos = position;

    // 1. Gravity and Time Loop
    // Position = initial - (velocity * time)
    // We use mod to wrap particles within the height box
    float fallOffset = uTime * uSpeed * aVelocity.y;
    pos.y = position.y - fallOffset;
    
    // Wrap logic: height range [-uHeight, uHeight] roughly
    float bounds = 60.0; 
    pos.y = mod(pos.y + bounds/2.0, bounds) - bounds/2.0;

    // 2. Wind turbulence (Sine waves based on time and position)
    float turbulence = sin(uTime * 0.5 + pos.x * 0.1) * sin(uTime * 0.3 + pos.z * 0.1);
    pos.x += (uWindX + turbulence) * (fallOffset * 0.1); // Wind affects over fall distance
    pos.z += (uWindZ + turbulence * 0.5) * (fallOffset * 0.1);

    // Wrap X/Z to keep them in scene if they blow too far
    if (pos.x > 50.0) pos.x -= 100.0;
    if (pos.x < -50.0) pos.x += 100.0;
    if (pos.z > 50.0) pos.z -= 100.0;
    if (pos.z < -50.0) pos.z += 100.0;

    // 3. Simple Interaction/Collision with Tree Cone
    // Tree is approx Cone(Radius=8, Height=20) at (0,0,0)
    // Simple check: if inside cone volume, push out
    float h = pos.y + uTreeHeight/2.0; // Height from base
    if (h > 0.0 && h < uTreeHeight) {
        float coneRadiusAtH = uTreeRadius * (1.0 - h/uTreeHeight);
        float distFromCenter = length(pos.xz);
        
        if (distFromCenter < coneRadiusAtH) {
            // Push outward
            vec2 dir = normalize(pos.xz);
            pos.xz = dir * (coneRadiusAtH + 0.5); // Push to surface + buffer
        }
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // 4. Size Attenuation
    // Close particles are larger
    vDistance = -mvPosition.z;
    gl_PointSize = aScale * (400.0 / vDistance);
    
    // Fade out based on distance for "Fog" effect integration
    vAlpha = smoothstep(80.0, 40.0, vDistance);
  }
`;

const SnowFragmentShader = `
  uniform vec3 uColor;
  uniform float uTime;
  
  varying float vAlpha;
  varying float vRandom;
  varying float vDistance;

  void main() {
    // Coordinate relative to point center (-0.5 to 0.5)
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float r = length(xy);

    // Circular soft cutout
    if (r > 0.5) discard;

    // Procedural Snowflake Shape (Soft Hexagon approx)
    // Use angle to create 6 arms
    float angle = atan(xy.y, xy.x);
    float arm = abs(cos(angle * 3.0)); // 6 arms
    float shape = smoothstep(0.5, 0.0, r + arm * 0.1); // Soften edges

    // Sparkle / Glint effect (PBR-ish)
    // Use time and random to simulate light hitting ice crystals
    float sparkle = pow(abs(sin(uTime * 3.0 + vRandom * 100.0)), 15.0);
    
    // Combine
    vec3 finalColor = uColor + vec3(sparkle * 0.5); // Reduced sparkle intensity for natural look
    
    // Alpha falloff
    float finalAlpha = vAlpha * 0.9 * shape; 

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;

const Snow: React.FC = () => {
  const count = SNOW_CONFIG.COUNT;
  
  // Generate attributes
  const { positions, velocities, scales, randomness } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const randomness = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spread wide
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

      // Fall speed
      velocities[i * 3] = (Math.random() - 0.5) * 0.5; // X drift
      velocities[i * 3 + 1] = 1.0 + Math.random(); // Y fall speed
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5; // Z drift

      // Size variation
      scales[i] = SNOW_CONFIG.SIZE * (0.5 + Math.random());
      
      randomness[i] = Math.random();
    }
    return { positions, velocities, scales, randomness };
  }, [count]);

  const shaderMaterialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (shaderMaterialRef.current) {
      shaderMaterialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(SNOW_CONFIG.COLOR) },
    uHeight: { value: 60 },
    uSpeed: { value: SNOW_CONFIG.SPEED },
    uWindX: { value: 0.5 },
    uWindZ: { value: 0.2 },
    uTreeHeight: { value: CONFIG.TREE_HEIGHT },
    uTreeRadius: { value: CONFIG.TREE_RADIUS_BASE }
  }), []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aVelocity"
          count={velocities.length / 3}
          array={velocities}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScale"
          count={scales.length}
          array={scales}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randomness.length}
          array={randomness}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderMaterialRef}
        vertexShader={SnowVertexShader}
        fragmentShader={SnowFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending} 
      />
    </points>
  );
};

export default Snow;