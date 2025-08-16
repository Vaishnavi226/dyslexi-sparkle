import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere, Box, Cylinder, Torus } from '@react-three/drei';
import * as THREE from 'three';

interface StoryCharacterProps {
  character: string;
  position: [number, number, number];
  isActive: boolean;
  story: string;
}

const StoryCharacter: React.FC<StoryCharacterProps> = ({ 
  character, 
  position, 
  isActive,
  story 
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
    
    if (glowRef.current && isActive) {
      glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  const getCharacterMesh = () => {
    switch (story) {
      case 'star':
        return (
          <group>
            <Sphere args={[0.3, 16, 16]}>
              <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
            </Sphere>
            {/* Star points */}
            {[...Array(5)].map((_, i) => (
              <Box 
                key={i}
                position={[
                  Math.cos((i * 72 * Math.PI) / 180) * 0.5,
                  Math.sin((i * 72 * Math.PI) / 180) * 0.5,
                  0
                ]}
                args={[0.1, 0.3, 0.1]}
                rotation={[0, 0, (i * 72 * Math.PI) / 180]}
              >
                <meshStandardMaterial color="#FFD700" />
              </Box>
            ))}
          </group>
        );
      
      case 'tree':
        return (
          <group>
            <Cylinder position={[0, -0.3, 0]} args={[0.15, 0.15, 0.6, 8]}>
              <meshStandardMaterial color="#8B4513" />
            </Cylinder>
            <Sphere position={[0, 0.2, 0]} args={[0.4, 16, 16]}>
              <meshStandardMaterial color="#228B22" />
            </Sphere>
            {/* Leaves */}
            {[...Array(8)].map((_, i) => (
              <Sphere
                key={i}
                position={[
                  Math.cos((i * 45 * Math.PI) / 180) * 0.3,
                  0.2 + Math.sin((i * 45 * Math.PI) / 180) * 0.1,
                  Math.sin((i * 45 * Math.PI) / 180) * 0.3
                ]}
                args={[0.15, 8, 8]}
              >
                <meshStandardMaterial color="#32CD32" />
              </Sphere>
            ))}
          </group>
        );
      
      case 'rocket':
        return (
          <group>
            <Cylinder position={[0, 0, 0]} args={[0.2, 0.15, 0.8, 8]}>
              <meshStandardMaterial color="#FF4500" />
            </Cylinder>
            <Cylinder position={[0, 0.5, 0]} args={[0.05, 0.15, 0.3, 8]}>
              <meshStandardMaterial color="#FFD700" />
            </Cylinder>
            {/* Fins */}
            {[...Array(3)].map((_, i) => (
              <Box
                key={i}
                position={[
                  Math.cos((i * 120 * Math.PI) / 180) * 0.25,
                  -0.3,
                  Math.sin((i * 120 * Math.PI) / 180) * 0.25
                ]}
                args={[0.1, 0.3, 0.05]}
                rotation={[0, (i * 120 * Math.PI) / 180, 0]}
              >
                <meshStandardMaterial color="#4169E1" />
              </Box>
            ))}
          </group>
        );
      
      case 'book':
        return (
          <group>
            <Box position={[0, 0, 0]} args={[0.6, 0.4, 0.1]}>
              <meshStandardMaterial color="#8B4513" />
            </Box>
            <Box position={[0, 0, 0.06]} args={[0.55, 0.35, 0.02]}>
              <meshStandardMaterial color="#FFFAF0" />
            </Box>
            {/* Sparkles around book */}
            {[...Array(6)].map((_, i) => (
              <Sphere
                key={i}
                position={[
                  Math.cos((i * 60 * Math.PI) / 180) * 0.8,
                  Math.sin((i * 60 * Math.PI) / 180) * 0.4,
                  Math.sin((i * 60 * Math.PI) / 180) * 0.3
                ]}
                args={[0.05, 8, 8]}
              >
                <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
              </Sphere>
            ))}
          </group>
        );
      
      case 'dinosaur':
        return (
          <group>
            {/* Body */}
            <Box position={[0, 0, 0]} args={[0.8, 0.4, 0.3]}>
              <meshStandardMaterial color="#32CD32" />
            </Box>
            {/* Head */}
            <Box position={[0.5, 0.2, 0]} args={[0.4, 0.3, 0.25]}>
              <meshStandardMaterial color="#32CD32" />
            </Box>
            {/* Tail */}
            <Cylinder position={[-0.5, 0, 0]} args={[0.1, 0.15, 0.6, 8]} rotation={[0, 0, Math.PI / 2]}>
              <meshStandardMaterial color="#228B22" />
            </Cylinder>
            {/* Legs */}
            {[...Array(4)].map((_, i) => (
              <Cylinder
                key={i}
                position={[
                  -0.2 + (i % 2) * 0.4,
                  -0.4,
                  -0.15 + Math.floor(i / 2) * 0.3
                ]}
                args={[0.08, 0.08, 0.3, 8]}
              >
                <meshStandardMaterial color="#228B22" />
              </Cylinder>
            ))}
          </group>
        );
      
      default:
        return (
          <Sphere args={[0.3, 16, 16]}>
            <meshStandardMaterial color="#FF69B4" />
          </Sphere>
        );
    }
  };

  return (
    <group ref={meshRef} position={position}>
      {/* Glow effect for active character */}
      {isActive && (
        <Sphere ref={glowRef} args={[0.6, 16, 16]}>
          <meshBasicMaterial color="#FFD700" transparent opacity={0.2} />
        </Sphere>
      )}
      
      {getCharacterMesh()}
      
      {/* Character name */}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.15}
        color={isActive ? "#FFD700" : "#FFFFFF"}
        anchorX="center"
        anchorY="middle"
      >
        {character}
      </Text>
    </group>
  );
};

export default StoryCharacter;