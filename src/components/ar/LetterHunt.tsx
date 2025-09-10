import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';
import { Suspense } from 'react';
import { Volume2, RotateCcw, Trophy, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SpeechUtils } from '@/utils/speechUtils';
import { triggerConfetti } from '@/utils/confetti';

interface LetterHuntProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Letter3DProps {
  letter: string;
  position: [number, number, number];
  color: string;
  isTarget: boolean;
  onClick: () => void;
  isFound: boolean;
}

const Letter3D: React.FC<Letter3DProps> = ({ letter, position, color, isTarget, onClick, isFound }) => {
  const meshRef = useRef<any>();
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={onClick}
      scale={isTarget && !isFound ? [1.2, 1.2, 1.2] : [1, 1, 1]}
      visible={!isFound}
    >
      <boxGeometry args={[1, 1, 0.2]} />
      <meshStandardMaterial 
        color={isTarget ? '#FFD700' : color} 
        transparent 
        opacity={isFound ? 0.3 : 1}
        emissive={isTarget ? '#FFA500' : '#000000'}
        emissiveIntensity={isTarget ? 0.2 : 0}
      />
      <Center position={[0, 0, 0.11]}>
        <mesh>
          <planeGeometry args={[0.6, 0.6]} />
          <meshStandardMaterial color="white" transparent opacity={0.9} />
        </mesh>
        <Center position={[0, 0, 0.01]}>
          <mesh>
            <planeGeometry args={[0.4, 0.4]} />
            <meshStandardMaterial color="#000" transparent opacity={0.8} />
          </mesh>
        </Center>
      </Center>
    </mesh>
  );
};

const LetterHunt: React.FC<LetterHuntProps> = ({ onComplete, onBack }) => {
  const [currentTarget, setCurrentTarget] = useState('A');
  const [foundLetters, setFoundLetters] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

  // Timer effect
  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleGameEnd();
    }
  }, [gameStarted, timeLeft]);

  // Auto-announce target letter
  useEffect(() => {
    if (gameStarted && !showInstructions) {
      const timeout = setTimeout(() => {
        SpeechUtils.speak(`Find the letter ${currentTarget}`);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [currentTarget, gameStarted, showInstructions]);

  const handleLetterClick = (letter: string) => {
    if (letter === currentTarget) {
      // Correct letter
      setFoundLetters(prev => new Set([...prev, letter]));
      setScore(prev => prev + 100 + (level * 10));
      triggerConfetti('success');
      SpeechUtils.speak(`Great job! You found ${letter}!`);
      
      // Move to next target
      const nextTarget = getNextTarget();
      if (nextTarget) {
        setCurrentTarget(nextTarget);
      } else {
        // Level complete
        setLevel(prev => prev + 1);
        setFoundLetters(new Set());
        setCurrentTarget('A');
        SpeechUtils.speak(`Level ${level + 1}! Keep going!`);
      }
    } else {
      // Wrong letter
      SpeechUtils.speak(`Try again! Look for the letter ${currentTarget}`);
    }
  };

  const getNextTarget = () => {
    const availableLetters = letters.filter(l => !foundLetters.has(l) && l !== currentTarget);
    return availableLetters[Math.floor(Math.random() * availableLetters.length)];
  };

  const handleGameEnd = () => {
    setGameStarted(false);
    SpeechUtils.speak(`Game over! You found ${foundLetters.size} letters and scored ${score} points!`);
    onComplete(score);
  };

  const startGame = () => {
    setGameStarted(true);
    setShowInstructions(false);
    setTimeLeft(60);
    setScore(0);
    setFoundLetters(new Set());
    setLevel(1);
    setCurrentTarget('A');
    SpeechUtils.speak('Letter hunt started! Find the letter A!');
  };

  const resetGame = () => {
    setGameStarted(false);
    setShowInstructions(true);
    setTimeLeft(60);
    setScore(0);
    setFoundLetters(new Set());
    setLevel(1);
    setCurrentTarget('A');
  };

  if (showInstructions) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-6">
          <div className="text-6xl mb-4">🔎</div>
          <h2 className="text-2xl font-bold">Letter Hunt Instructions</h2>
          <div className="space-y-4 text-left max-w-2xl mx-auto">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">👂</span>
              <p>Listen for the letter name (example: "Find the letter A")</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">👀</span>
              <p>Look for the golden glowing letter in the 3D space</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">👆</span>
              <p>Click on the correct letter to collect it</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">⭐</span>
              <p>Earn points for each correct letter you find</p>
            </div>
          </div>
          <div className="space-x-4">
            <Button onClick={startGame} size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Target className="w-5 h-5 mr-2" />
              Start Hunting!
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
            <div className="text-2xl font-bold text-blue-600">{score}</div>
            <div className="text-sm text-muted-foreground">Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{foundLetters.size}</div>
            <div className="text-sm text-muted-foreground">Found</div>
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
            <div className="text-2xl font-bold text-red-600">{timeLeft}</div>
            <div className="text-sm text-muted-foreground">Time Left</div>
          </CardContent>
        </Card>
      </div>

      {/* Current Target */}
      <Alert>
        <Target className="w-4 h-4" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-lg">
            <span className="font-bold">Find the letter:</span> 
            <span className="text-3xl font-bold text-yellow-600 ml-2">{currentTarget}</span>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => SpeechUtils.speak(`Find the letter ${currentTarget}`)}
          >
            <Volume2 className="w-4 h-4" />
          </Button>
        </AlertDescription>
      </Alert>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Level Progress</span>
          <span>{foundLetters.size}/12 letters</span>
        </div>
        <Progress value={(foundLetters.size / 12) * 100} className="h-3" />
      </div>

      {/* 3D AR Scene */}
      <Card>
        <CardContent className="p-0">
          <div className="h-96 w-full rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
              <color attach="background" args={['#0f172a']} />
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
              <Suspense fallback={null}>
                {letters.slice(0, 6 + level).map((letter, index) => (
                  <Letter3D
                    key={letter}
                    letter={letter}
                    position={[
                      (index % 4) * 2.5 - 3.75,
                      Math.floor(index / 4) * 2 - 1,
                      0
                    ]}
                    color={colors[index % colors.length]}
                    isTarget={letter === currentTarget}
                    onClick={() => handleLetterClick(letter)}
                    isFound={foundLetters.has(letter)}
                  />
                ))}
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
        <Button onClick={() => SpeechUtils.speak(`Find the letter ${currentTarget}`)}>
          <Volume2 className="w-4 h-4 mr-2" />
          Repeat Target
        </Button>
        <Button onClick={handleGameEnd} variant="destructive">
          End Game
        </Button>
      </div>
    </div>
  );
};

export default LetterHunt;