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
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  
  const sceneRef = useRef<any>(null);

  const words = ['CAT', 'DOG', 'BAT', 'HAT', 'SUN', 'FUN', 'BIG', 'RED', 'TOP', 'CUP', 'PIG', 'BED'];

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
    setCurrentLetterIndex(0);
    setTimeLeft(120);
    const word = words[Math.floor(Math.random() * words.length)];
    setTargetWord(word);
    
    // Generate 5 random letters including the first letter of the word
    const firstLetter = word[0];
    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const otherLetters = allLetters.filter(l => l !== firstLetter);
    const shuffled = otherLetters.sort(() => Math.random() - 0.5).slice(0, 4);
    const letterSet = [firstLetter, ...shuffled].sort(() => Math.random() - 0.5);
    setAvailableLetters(letterSet);
    
    const message = `Let's spell ${word.split('').join(', ')}. Find the letter ${firstLetter}. ${firstLetter} as in ${getPhonicsWord(firstLetter)}`;
    SpeechUtils.speak(message, { lang: 'en-IN', rate: 0.85 });
  };
  
  const getPhonicsWord = (letter: string): string => {
    const phonicsMap: {[key: string]: string} = {
      'A': 'Apple', 'B': 'Ball', 'C': 'Cat', 'D': 'Dog', 'E': 'Elephant',
      'F': 'Fish', 'G': 'Goat', 'H': 'House', 'I': 'Ice cream', 'J': 'Jump',
      'K': 'Kite', 'L': 'Lion', 'M': 'Mango', 'N': 'Nest', 'O': 'Orange',
      'P': 'Parrot', 'Q': 'Queen', 'R': 'Rabbit', 'S': 'Sun', 'T': 'Tiger',
      'U': 'Umbrella', 'V': 'Van', 'W': 'Water', 'X': 'Xylophone', 'Y': 'Yellow', 'Z': 'Zebra'
    };
    return phonicsMap[letter] || letter;
  };

  const handleLetterClick = (letter: string) => {
    if (!gameStarted) return;

    const currentTargetLetter = targetWord[currentLetterIndex];

    if (letter === currentTargetLetter) {
      // Correct letter
      setCollectedLetters(prev => [...prev, letter]);
      setCurrentLetterIndex(prev => prev + 1);
      setScore(prev => prev + 100);
      triggerConfetti('success');
      
      const foundMessage = `Correct! ${letter} as in ${getPhonicsWord(letter)}! Plus 100 points!`;
      SpeechUtils.speak(foundMessage, { lang: 'en-IN', rate: 0.85 });

      if (currentLetterIndex + 1 === targetWord.length) {
        // Word complete
        setTimeout(() => completeWord(), 1500);
      } else {
        // Move to next letter
        const nextLetter = targetWord[currentLetterIndex + 1];
        setTimeout(() => {
          // Generate new set of 5 letters including the next target letter
          const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
          const otherLetters = allLetters.filter(l => l !== nextLetter);
          const shuffled = otherLetters.sort(() => Math.random() - 0.5).slice(0, 4);
          const letterSet = [nextLetter, ...shuffled].sort(() => Math.random() - 0.5);
          setAvailableLetters(letterSet);
          
          const nextMessage = `Great! Now find ${nextLetter}. ${nextLetter} as in ${getPhonicsWord(nextLetter)}`;
          SpeechUtils.speak(nextMessage, { lang: 'en-IN', rate: 0.85 });
        }, 1500);
      }
    } else {
      // Wrong letter
      setScore(prev => Math.max(0, prev - 20));
      const errorMessage = `That is ${letter}. We need ${currentTargetLetter}. ${currentTargetLetter} as in ${getPhonicsWord(currentTargetLetter)}. Minus 20 points.`;
      SpeechUtils.speak(errorMessage, { lang: 'en-IN', rate: 0.85 });
    }
  };

  const completeWord = () => {
    triggerConfetti('celebration');
    const completionMsg = `Amazing! You completed the word ${targetWord.split('').join(', ')}! Bonus 200 points!`;
    SpeechUtils.speak(completionMsg, { lang: 'en-IN', rate: 0.85 });
    setScore(prev => prev + 200);

    setTimeout(() => {
      const word = words[Math.floor(Math.random() * words.length)];
      setTargetWord(word);
      setCollectedLetters([]);
      setCurrentLetterIndex(0);
      
      // Generate new 5 letters for the new word
      const firstLetter = word[0];
      const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const otherLetters = allLetters.filter(l => l !== firstLetter);
      const shuffled = otherLetters.sort(() => Math.random() - 0.5).slice(0, 4);
      const letterSet = [firstLetter, ...shuffled].sort(() => Math.random() - 0.5);
      setAvailableLetters(letterSet);
      
      const newWordMsg = `New word! Let's spell ${word.split('').join(', ')}. Find ${firstLetter}. ${firstLetter} as in ${getPhonicsWord(firstLetter)}`;
      SpeechUtils.speak(newWordMsg, { lang: 'en-IN', rate: 0.85 });
    }, 3000);
  };

  const endGame = () => {
    setGameStarted(false);
    triggerConfetti('achievement');
    const endMsg = `Game over! Final score: ${score} points! Well done!`;
    SpeechUtils.speak(endMsg, { lang: 'en-IN', rate: 0.85 });
    onComplete(score);
  };

  const resetGame = () => {
    setGameStarted(false);
    setScore(0);
    setCollectedLetters([]);
    setCurrentLetterIndex(0);
    setTimeLeft(120);
    setAvailableLetters([]);
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
                        i < collectedLetters.length
                          ? 'text-success'
                          : i === collectedLetters.length
                          ? 'text-warning animate-pulse'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {i < collectedLetters.length ? letter : '_'}
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

        {/* 3D Letters - Only show 5 at a time */}
        {availableLetters.map((letter, index) => {
          const angle = (index / 5) * Math.PI * 2;
          const radius = 4;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;

          const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94'];
          const currentTarget = targetWord[currentLetterIndex];
          const isTarget = letter === currentTarget;

          return (
            <a-entity
              key={`${letter}-${index}`}
              position={`${x} 1.5 ${z}`}
              data-letter={letter}
              class="clickable-letter"
            >
              <a-box
                color={isTarget ? '#FFD700' : colors[index % colors.length]}
                width="1.2"
                height="1.2"
                depth="0.3"
                animation={`property: rotation; to: 0 360 0; loop: true; dur: 8000; easing: linear${isTarget ? '; dir: alternate' : ''}`}
                opacity={isTarget ? '1' : '0.9'}
              >
                {isTarget && (
                  <a-animation
                    attribute="scale"
                    from="1 1 1"
                    to="1.2 1.2 1.2"
                    direction="alternate"
                    dur="1000"
                    repeat="indefinite"
                  ></a-animation>
                )}
              </a-box>
              <a-text
                value={letter}
                align="center"
                position="0 0 0.16"
                scale="3 3 3"
                color="#000000"
              ></a-text>
            </a-entity>
          );
        })}
      </a-scene>

      {/* Bottom controls - Only show available 5 letters */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-3 flex-wrap justify-center max-w-md">
        {availableLetters.map(letter => {
          const currentTarget = targetWord[currentLetterIndex];
          const isTarget = letter === currentTarget;
          return (
            <Button
              key={letter}
              onClick={() => handleLetterClick(letter)}
              className={`w-16 h-16 text-2xl font-bold transition-all ${
                isTarget 
                  ? 'cosmic-button animate-pulse ring-4 ring-warning shadow-lg shadow-warning/50' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {letter}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default AFrameLetterHunt;
