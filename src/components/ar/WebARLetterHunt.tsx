import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text3D, Center } from '@react-three/drei';
import { Camera, X, Trophy, Star, Volume2, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SpeechUtils } from '@/utils/speechUtils';
import { triggerConfetti } from '@/utils/confetti';

interface WebARLetterHuntProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Letter3DProps {
  letter: string;
  position: [number, number, number];
  color: string;
  onCollect: () => void;
}

// 3D Letter Component
const Letter3D: React.FC<Letter3DProps> = ({ letter, position, color, onCollect }) => {
  const meshRef = useRef<any>(null);

  useEffect(() => {
    if (meshRef.current) {
      // Rotate animation
      const animate = () => {
        if (meshRef.current) {
          meshRef.current.rotation.y += 0.01;
        }
        requestAnimationFrame(animate);
      };
      animate();
    }
  }, []);

  return (
    <Center position={position}>
      <mesh ref={meshRef} onClick={onCollect}>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={1.5}
          height={0.3}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
        >
          {letter}
          <meshStandardMaterial color={color} />
        </Text3D>
      </mesh>
    </Center>
  );
};

// HUD Component
interface HUDProps {
  targetWord: string;
  collectedLetters: string[];
  score: number;
  timeLeft: number;
}

const HUD: React.FC<HUDProps> = ({ targetWord, collectedLetters, score, timeLeft }) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <Card className="bg-background/90 backdrop-blur-sm border-2 border-primary/30 shadow-lg">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between gap-8">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Target Word</div>
              <div className="text-2xl font-bold text-primary flex gap-1">
                {targetWord.split('').map((letter, i) => (
                  <span
                    key={i}
                    className={`inline-block min-w-[2rem] ${
                      collectedLetters[i] === letter
                        ? 'text-success'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {collectedLetters[i] || '_'}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Score</div>
              <div className="text-2xl font-bold text-warning">{score}</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Time</div>
              <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-destructive' : 'text-secondary'}`}>
                {timeLeft}s
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const WebARLetterHunt: React.FC<WebARLetterHuntProps> = ({ onComplete, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Game state
  const [targetWord, setTargetWord] = useState('CAT');
  const [collectedLetters, setCollectedLetters] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [detectedLetters, setDetectedLetters] = useState<Set<string>>(new Set());
  
  // Available words for different levels
  const words = ['CAT', 'DOG', 'BAT', 'HAT', 'RAT', 'SUN', 'FUN', 'BIG', 'RED'];

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        setCameraError(null);
        SpeechUtils.speak('Camera activated. Point your camera at letter cards to collect them.');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please grant camera permissions.');
      SpeechUtils.speak('Camera access denied. Please enable camera permissions to play.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  // Timer
  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted) {
      endGame();
    }
  }, [gameStarted, timeLeft]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setCollectedLetters([]);
    setTimeLeft(60);
    setDetectedLetters(new Set());
    const word = words[Math.floor(Math.random() * words.length)];
    setTargetWord(word);
    SpeechUtils.speak(`Find the letters to spell ${word.split('').join(', ')}`);
  };

  const handleLetterDetected = (letter: string) => {
    // Check if this letter is needed for the current position
    const nextPosition = collectedLetters.length;
    const neededLetter = targetWord[nextPosition];

    if (letter === neededLetter && !detectedLetters.has(letter)) {
      // Correct letter
      setCollectedLetters(prev => [...prev, letter]);
      setDetectedLetters(prev => new Set([...prev, letter]));
      setScore(prev => prev + 10);
      triggerConfetti('success');
      SpeechUtils.speak(`${letter} collected! Plus 10 points!`);

      // Check if word is complete
      if (collectedLetters.length + 1 === targetWord.length) {
        setTimeout(() => {
          completeWord();
        }, 1000);
      }
    } else if (letter !== neededLetter) {
      // Wrong letter
      setScore(prev => Math.max(0, prev - 5));
      SpeechUtils.speak(`Wrong letter. You need ${neededLetter}. Minus 5 points.`);
    }
  };

  const completeWord = () => {
    triggerConfetti('celebration');
    SpeechUtils.speak(`Amazing! You completed the word ${targetWord}! Bonus 50 points!`);
    setScore(prev => prev + 50);
    
    // Start new word
    setTimeout(() => {
      const word = words[Math.floor(Math.random() * words.length)];
      setTargetWord(word);
      setCollectedLetters([]);
      setDetectedLetters(new Set());
      SpeechUtils.speak(`New word! Find the letters to spell ${word.split('').join(', ')}`);
    }, 2000);
  };

  const endGame = () => {
    setGameStarted(false);
    triggerConfetti('achievement');
    SpeechUtils.speak(`Game over! Final score: ${score} points!`);
    onComplete(score);
  };

  const handleBack = () => {
    stopCamera();
    onBack();
  };

  // Instructions screen
  if (!cameraActive) {
    return (
      <div className="space-y-6">
        <Card className="cosmic-card">
          <CardContent className="p-8 text-center space-y-6">
            <div className="text-6xl mb-4">📸</div>
            <h2 className="text-3xl font-bold text-accent">WebAR Letter Hunt</h2>
            
            <div className="space-y-4 text-left max-w-2xl mx-auto text-lg">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">📱</span>
                <p>Grant camera access to start AR mode</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🎯</span>
                <p>Point your camera at letter cards (A-Z)</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">✨</span>
                <p>Collect letters to spell the target word</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">⭐</span>
                <p>Correct letter: +10 points | Wrong letter: -5 points</p>
              </div>
            </div>

            {cameraError && (
              <Alert variant="destructive">
                <AlertDescription>{cameraError}</AlertDescription>
              </Alert>
            )}

            <div className="space-x-4">
              <Button onClick={startCamera} size="lg" className="cosmic-button text-lg px-8 py-3">
                <Camera className="w-5 h-5 mr-2" />
                Enable Camera
              </Button>
              <Button onClick={handleBack} variant="outline" size="lg" className="text-lg px-8 py-3">
                Back to Menu
              </Button>
            </div>

            <Alert>
              <AlertDescription className="text-sm">
                <strong>Note:</strong> This is a proof-of-concept. Full AR marker detection will be added in the next phase.
                For now, you can test with virtual letter buttons.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // AR Game View
  return (
    <div className="relative w-full h-screen">
      {/* HUD */}
      {gameStarted && (
        <HUD
          targetWord={targetWord}
          collectedLetters={collectedLetters}
          score={score}
          timeLeft={timeLeft}
        />
      )}

      {/* Close button */}
      <Button
        onClick={handleBack}
        variant="secondary"
        size="icon"
        className="fixed top-4 right-4 z-50"
      >
        <X className="w-4 h-4" />
      </Button>

      {/* Camera view */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        autoPlay
        muted
      />

      {/* 3D AR overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          {/* Demo: Show letters that can be "detected" */}
          {gameStarted && (
            <>
              <Letter3D
                letter="C"
                position={[-2, 1, 0]}
                color="#FF6B6B"
                onCollect={() => handleLetterDetected('C')}
              />
              <Letter3D
                letter="A"
                position={[0, 1, 0]}
                color="#4ECDC4"
                onCollect={() => handleLetterDetected('A')}
              />
              <Letter3D
                letter="T"
                position={[2, 1, 0]}
                color="#FFE66D"
                onCollect={() => handleLetterDetected('T')}
              />
            </>
          )}
        </Canvas>
      </div>

      {/* Test letter buttons (for proof of concept) */}
      {gameStarted && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex gap-2">
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'T'].map(letter => (
            <Button
              key={letter}
              onClick={() => handleLetterDetected(letter)}
              className="cosmic-button w-12 h-12 text-xl font-bold"
            >
              {letter}
            </Button>
          ))}
        </div>
      )}

      {/* Start game button */}
      {!gameStarted && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <Button onClick={startGame} size="lg" className="cosmic-button text-lg px-8 py-3">
            <Target className="w-5 h-5 mr-2" />
            Start AR Hunt
          </Button>
        </div>
      )}
    </div>
  );
};

export default WebARLetterHunt;
