import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Trophy, Volume2, Target, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SpeechUtils } from '@/utils/speechUtils';
import { triggerConfetti } from '@/utils/confetti';

interface AFrameLetterHuntProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

const AFrameLetterHunt: React.FC<AFrameLetterHuntProps> = ({ onComplete, onBack }) => {
  const [aframeLoaded, setAframeLoaded] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [targetWord, setTargetWord] = useState('CAT');
  const [collectedLetters, setCollectedLetters] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const sceneRef = useRef<any>(null);

  const words = ['CAT', 'DOG', 'BAT', 'HAT', 'SUN', 'FUN', 'BIG', 'RED', 'TOP', 'CUP'];

  // Load A-Frame dynamically
  useEffect(() => {
    const loadAFrame = async () => {
      if (typeof window !== 'undefined' && !(window as any).AFRAME) {
        const script = document.createElement('script');
        script.src = 'https://aframe.io/releases/1.6.0/aframe.min.js';
        script.async = true;
        script.onload = () => {
          console.log('A-Frame loaded successfully');
          setAframeLoaded(true);
        };
        script.onerror = () => {
          console.error('Failed to load A-Frame');
        };
        document.head.appendChild(script);
      } else if ((window as any).AFRAME) {
        setAframeLoaded(true);
      }
    };

    loadAFrame();

    return () => {
      // Cleanup
      if (sceneRef.current) {
        sceneRef.current.exitVR();
      }
    };
  }, []);

  // Timer
  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted) {
      endGame();
    }
  }, [gameStarted, timeLeft]);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setCollectedLetters([]);
    setTimeLeft(60);
    const word = words[Math.floor(Math.random() * words.length)];
    setTargetWord(word);
    SpeechUtils.speak(`Find the letters to spell ${word.split('').join(', ')}`);
  };

  const handleLetterClick = (letter: string) => {
    if (!gameStarted) return;

    const nextPosition = collectedLetters.length;
    const neededLetter = targetWord[nextPosition];

    if (letter === neededLetter) {
      setCollectedLetters(prev => [...prev, letter]);
      setScore(prev => prev + 10);
      triggerConfetti('success');
      SpeechUtils.speak(`${letter} collected! Plus 10 points!`);

      if (collectedLetters.length + 1 === targetWord.length) {
        setTimeout(() => completeWord(), 1000);
      }
    } else {
      setScore(prev => Math.max(0, prev - 5));
      SpeechUtils.speak(`Wrong letter. You need ${neededLetter}. Minus 5 points.`);
    }
  };

  const completeWord = () => {
    triggerConfetti('celebration');
    SpeechUtils.speak(`Amazing! You completed the word ${targetWord}! Bonus 50 points!`);
    setScore(prev => prev + 50);

    setTimeout(() => {
      const word = words[Math.floor(Math.random() * words.length)];
      setTargetWord(word);
      setCollectedLetters([]);
      SpeechUtils.speak(`New word! Find ${word.split('').join(', ')}`);
    }, 2000);
  };

  const endGame = () => {
    setGameStarted(false);
    triggerConfetti('achievement');
    SpeechUtils.speak(`Game over! Final score: ${score} points!`);
    onComplete(score);
  };

  const resetGame = () => {
    setGameStarted(false);
    setScore(0);
    setCollectedLetters([]);
    setTimeLeft(60);
  };

  if (!aframeLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="cosmic-card">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg">Loading WebAR Engine...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="space-y-6">
        <Card className="cosmic-card">
          <CardContent className="p-8 text-center space-y-6">
            <div className="text-6xl mb-4">📸</div>
            <h2 className="text-3xl font-bold text-accent">WebAR Letter Hunt</h2>

            <div className="space-y-4 text-left max-w-2xl mx-auto text-lg">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🎯</span>
                <p>Click letters in the correct order to spell words</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">✨</span>
                <p>Correct letter: +10 points | Wrong: -5 points</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🏆</span>
                <p>Complete words for +50 bonus points!</p>
              </div>
            </div>

            {score > 0 && (
              <Alert>
                <AlertDescription className="text-center text-lg font-bold">
                  Previous Score: {score} points
                </AlertDescription>
              </Alert>
            )}

            <div className="space-x-4">
              <Button onClick={startGame} size="lg" className="cosmic-button text-lg px-8 py-3">
                <Target className="w-5 h-5 mr-2" />
                Start AR Hunt
              </Button>
              <Button onClick={onBack} variant="outline" size="lg" className="text-lg px-8 py-3">
                Back to Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height: '600px' }}>
      {/* HUD */}
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

      {/* Controls */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button onClick={resetGame} variant="secondary" size="icon">
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button onClick={onBack} variant="secondary" size="icon">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* A-Frame Scene */}
      <a-scene
        ref={sceneRef}
        embedded
        vr-mode-ui="enabled: false"
        style={{ width: '100%', height: '100%' }}
      >
        <a-assets>
          {/* Preload assets if needed */}
        </a-assets>

        {/* Camera */}
        <a-entity camera look-controls wasd-controls position="0 1.6 3"></a-entity>

        {/* Lighting */}
        <a-light type="ambient" intensity="0.5"></a-light>
        <a-light type="directional" intensity="0.7" position="1 1 1"></a-light>
        <a-light type="point" intensity="0.5" position="0 3 0"></a-light>

        {/* Sky */}
        <a-sky color="#87CEEB"></a-sky>

        {/* Ground */}
        <a-plane
          position="0 0 0"
          rotation="-90 0 0"
          width="20"
          height="20"
          color="#7BC8A4"
        ></a-plane>

        {/* 3D Letters */}
        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'T'].map((letter, index) => {
          const angle = (index / 9) * Math.PI * 2;
          const radius = 5;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;

          const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94', '#C7CEEA', '#FFDAC1', '#B5EAD7', '#C7CEEA'];

          return (
            <a-entity
              key={letter}
              position={`${x} 1.5 ${z}`}
              data-letter={letter}
              class="clickable-letter"
            >
              <a-box
                color={colors[index]}
                width="1"
                height="1"
                depth="0.2"
                animation="property: rotation; to: 0 360 0; loop: true; dur: 5000; easing: linear"
              ></a-box>
              <a-text
                value={letter}
                align="center"
                position="0 0 0.11"
                scale="2 2 2"
                color="#000000"
              ></a-text>
            </a-entity>
          );
        })}
      </a-scene>

      {/* Bottom controls */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-2 flex-wrap justify-center max-w-md">
        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'T'].map(letter => (
          <Button
            key={letter}
            onClick={() => handleLetterClick(letter)}
            className="cosmic-button w-14 h-14 text-xl font-bold"
          >
            {letter}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AFrameLetterHunt;
