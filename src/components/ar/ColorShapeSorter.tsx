import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';
import { Suspense } from 'react';
import { Volume2, RotateCcw, Trophy, Target, Eye, Palette } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SpeechUtils } from '@/utils/speechUtils';
import { triggerConfetti } from '@/utils/confetti';

interface ColorShapeSorterProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Shape3DProps {
  shape: string;
  color: string;
  position: [number, number, number];
  onClick: () => void;
  isTarget: boolean;
  isMatched: boolean;
}

const Shape3D: React.FC<Shape3DProps> = ({ shape, color, position, onClick, isTarget, isMatched }) => {
  const meshRef = useRef<any>();
  
  const getGeometry = () => {
    switch (shape) {
      case 'circle':
        return <sphereGeometry args={[0.6, 32, 32]} />;
      case 'square':
        return <boxGeometry args={[1.2, 1.2, 0.2]} />;
      case 'triangle':
        return <coneGeometry args={[0.6, 1.2, 3]} />;
      default:
        return <sphereGeometry args={[0.6, 32, 32]} />;
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={onClick}
      scale={isTarget && !isMatched ? [1.2, 1.2, 1.2] : [1, 1, 1]}
      rotation={shape === 'triangle' ? [0, 0, 0] : [0, 0, 0]}
    >
      {getGeometry()}
      <meshStandardMaterial 
        color={isMatched ? '#22C55E' : color}
        transparent 
        opacity={isMatched ? 0.7 : 1}
        emissive={isTarget && !isMatched ? color : '#000000'}
        emissiveIntensity={isTarget && !isMatched ? 0.3 : 0}
      />
    </mesh>
  );
};

const ColorShapeSorter: React.FC<ColorShapeSorterProps> = ({ onComplete, onBack }) => {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [score, setScore] = useState(0);
  const [matchedItems, setMatchedItems] = useState<Set<string>>(new Set());
  const [gameMode, setGameMode] = useState<'shapes' | 'colors'>('shapes');
  const [showInstructions, setShowInstructions] = useState(true);
  const [level, setLevel] = useState(1);

  const shapeChallenges = [
    { 
      shape: 'circle', 
      color: '#FF6B6B', 
      realWorldItems: ['plate', 'wheel', 'coin', 'clock'], 
      emoji: '🔴',
      hint: 'Find something round!'
    },
    { 
      shape: 'square', 
      color: '#4ECDC4', 
      realWorldItems: ['window', 'book', 'screen', 'picture frame'], 
      emoji: '🟦',
      hint: 'Find something with four equal sides!'
    },
    { 
      shape: 'triangle', 
      color: '#FFD93D', 
      realWorldItems: ['pizza slice', 'roof', 'mountain', 'warning sign'], 
      emoji: '🔺',
      hint: 'Find something with three sides!'
    }
  ];

  const colorChallenges = [
    { 
      color: '#FF0000', 
      name: 'red', 
      realWorldItems: ['apple', 'fire truck', 'stop sign', 'strawberry'], 
      emoji: '🔴',
      hint: 'Find something red!'
    },
    { 
      color: '#0000FF', 
      name: 'blue', 
      realWorldItems: ['sky', 'ocean', 'blueberry', 'jeans'], 
      emoji: '🔵',
      hint: 'Find something blue!'
    },
    { 
      color: '#FFFF00', 
      name: 'yellow', 
      realWorldItems: ['sun', 'banana', 'lemon', 'school bus'], 
      emoji: '🟡',
      hint: 'Find something yellow!'
    },
    { 
      color: '#00FF00', 
      name: 'green', 
      realWorldItems: ['grass', 'tree', 'lettuce', 'frog'], 
      emoji: '🟢',
      hint: 'Find something green!'
    }
  ];

  const currentItems = gameMode === 'shapes' ? shapeChallenges : colorChallenges;
  const currentItem = currentItems[currentChallenge % currentItems.length];

  // Announce challenge when it changes
  useEffect(() => {
    if (!showInstructions) {
      const timeout = setTimeout(() => {
        if (gameMode === 'shapes') {
          const shapeItem = currentItem as typeof shapeChallenges[0];
          SpeechUtils.speak(`Find the ${shapeItem.shape}! ${shapeItem.hint}`);
        } else {
          const colorItem = currentItem as typeof colorChallenges[0];
          SpeechUtils.speak(`Find the ${colorItem.name} color! ${colorItem.hint}`);
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [currentChallenge, gameMode, showInstructions]);

  const handleShapeClick = (shape: string, color: string) => {
    const shapeItem = currentItem as typeof shapeChallenges[0];
    const colorItem = currentItem as typeof colorChallenges[0];
    
    const isCorrect = gameMode === 'shapes' 
      ? shape === shapeItem.shape
      : color === colorItem.color;

    if (isCorrect) {
      // Correct match
      const itemKey = `${gameMode}-${currentChallenge}`;
      setMatchedItems(prev => new Set([...prev, itemKey]));
      setScore(prev => prev + 50 + (level * 10));
      
      triggerConfetti('success');
      
      if (gameMode === 'shapes') {
        SpeechUtils.speak(`Perfect! You found the ${shapeItem.shape}! ${shapeItem.realWorldItems.join(', ')} are all ${shapeItem.shape}s!`);
      } else {
        SpeechUtils.speak(`Excellent! You found the ${colorItem.name} color! ${colorItem.realWorldItems.join(', ')} are all ${colorItem.name}!`);
      }

      // Move to next challenge
      setTimeout(() => {
        setCurrentChallenge(prev => prev + 1);
        
        // Switch modes after completing all items in current mode
        if ((currentChallenge + 1) % currentItems.length === 0) {
          if (gameMode === 'shapes') {
            setGameMode('colors');
            SpeechUtils.speak('Great job with shapes! Now let\'s try colors!');
          } else {
            // Game complete
            setLevel(prev => prev + 1);
            setGameMode('shapes');
            setCurrentChallenge(0);
            SpeechUtils.speak(`Level ${level + 1}! Let's try again with more challenging items!`);
          }
        }
      }, 2000);
    } else {
      // Wrong match
      if (gameMode === 'shapes') {
        const shapeItem = currentItem as typeof shapeChallenges[0];
        SpeechUtils.speak(`Try again! Look for the ${shapeItem.shape} shape.`);
      } else {
        const colorItem = currentItem as typeof colorChallenges[0];
        SpeechUtils.speak(`Try again! Look for the ${colorItem.name} color.`);
      }
    }
  };

  const speakRealWorldExamples = () => {
    if (gameMode === 'shapes') {
      const shapeItem = currentItem as typeof shapeChallenges[0];
      SpeechUtils.speak(`${shapeItem.shape} examples: ${shapeItem.realWorldItems.join(', ')}`);
    } else {
      const colorItem = currentItem as typeof colorChallenges[0];
      SpeechUtils.speak(`${colorItem.name} examples: ${colorItem.realWorldItems.join(', ')}`);
    }
  };

  const resetGame = () => {
    setShowInstructions(true);
    setCurrentChallenge(0);
    setScore(0);
    setMatchedItems(new Set());
    setGameMode('shapes');
    setLevel(1);
  };

  const startGame = () => {
    setShowInstructions(false);
    setScore(0);
    setMatchedItems(new Set());
    setCurrentChallenge(0);
    setGameMode('shapes');
    setLevel(1);
  };

  if (showInstructions) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-6">
          <div className="text-6xl mb-4">🎨</div>
          <h2 className="text-2xl font-bold">Color & Shape Sorter Instructions</h2>
          <div className="space-y-4 text-left max-w-2xl mx-auto">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">👀</span>
              <p>Look at the target shape or color that's glowing</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🎯</span>
              <p>Click on the matching shape or color in the 3D space</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🌍</span>
              <p>Learn about real-world objects that match each shape and color</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🔄</span>
              <p>Start with shapes, then move to colors, then increase difficulty</p>
            </div>
          </div>
          <div className="space-x-4">
            <Button onClick={startGame} size="lg" className="bg-pink-600 hover:bg-pink-700">
              <Palette className="w-5 h-5 mr-2" />
              Start Sorting!
            </Button>
            <Button onClick={onBack} variant="outline" size="lg">
              Back to Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-pink-600">{score}</div>
            <div className="text-sm text-muted-foreground">Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{matchedItems.size}</div>
            <div className="text-sm text-muted-foreground">Matched</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{level}</div>
            <div className="text-sm text-muted-foreground">Level</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-green-600 capitalize">{gameMode}</div>
            <div className="text-sm text-muted-foreground">Mode</div>
          </CardContent>
        </Card>
      </div>

      {/* Current Challenge */}
      <Alert>
        <Target className="w-4 h-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <span className="font-bold text-lg">
              {gameMode === 'shapes' 
                ? `Find the ${(currentItem as typeof shapeChallenges[0]).shape}:` 
                : `Find the ${(currentItem as typeof colorChallenges[0]).name} color:`
              }
            </span>
            <span className="text-3xl ml-3">{currentItem.emoji}</span>
            <div className="mt-1">
              <span className="text-sm text-muted-foreground italic">
                {currentItem.hint}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={speakRealWorldExamples}
          >
            <Volume2 className="w-4 h-4" />
          </Button>
        </AlertDescription>
      </Alert>

      {/* Real World Examples */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2 flex-wrap gap-2">
            <span className="text-sm font-medium">Real-world examples:</span>
            {currentItem.realWorldItems.map((item, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-sm px-2 py-1"
              >
                {item}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Level Progress</span>
          <span>{(currentChallenge % currentItems.length) + 1}/{currentItems.length} {gameMode}</span>
        </div>
        <Progress 
          value={((currentChallenge % currentItems.length) + 1) / currentItems.length * 100} 
          className="h-3" 
        />
      </div>

      {/* 3D AR Scene */}
      <Card>
        <CardContent className="p-0">
          <div className="h-96 w-full rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
              <color attach="background" args={['#1e293b']} />
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
              <Suspense fallback={null}>
                {/* Display shapes for current mode */}
                {gameMode === 'shapes' ? (
                  shapeChallenges.map((shapeItem, index) => (
                    <Shape3D
                      key={`shape-${index}`}
                      shape={shapeItem.shape}
                      color={shapeItem.color}
                      position={[
                        (index % 3) * 3 - 3,
                        Math.floor(index / 3) * 2 - 1,
                        0
                      ]}
                      onClick={() => handleShapeClick(shapeItem.shape, shapeItem.color)}
                      isTarget={shapeItem.shape === (currentItem as typeof shapeChallenges[0]).shape}
                      isMatched={matchedItems.has(`shapes-${currentChallenge}`)}
                    />
                  ))
                ) : (
                  colorChallenges.map((colorItem, index) => (
                    <Shape3D
                      key={`color-${index}`}
                      shape="circle"
                      color={colorItem.color}
                      position={[
                        (index % 4) * 2.5 - 3.75,
                        Math.floor(index / 4) * 2 - 1,
                        0
                      ]}
                      onClick={() => handleShapeClick('circle', colorItem.color)}
                      isTarget={colorItem.color === currentItem.color}
                      isMatched={matchedItems.has(`colors-${currentChallenge}`)}
                    />
                  ))
                )}
              </Suspense>
            </Canvas>
          </div>
        </CardContent>
      </Card>

      {/* Game Controls */}
      <div className="flex justify-center space-x-4">
        <Button onClick={resetGame} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Game
        </Button>
        <Button onClick={speakRealWorldExamples}>
          <Volume2 className="w-4 h-4 mr-2" />
          Examples
        </Button>
        <Button onClick={() => {
          if (gameMode === 'shapes') {
            const shapeItem = currentItem as typeof shapeChallenges[0];
            SpeechUtils.speak(`Find the ${shapeItem.shape}! ${shapeItem.hint}`);
          } else {
            const colorItem = currentItem as typeof colorChallenges[0];
            SpeechUtils.speak(`Find the ${colorItem.name} color! ${colorItem.hint}`);
          }
        }}>
          <Eye className="w-4 h-4 mr-2" />
          Repeat
        </Button>
      </div>
    </div>
  );
};

export default ColorShapeSorter;