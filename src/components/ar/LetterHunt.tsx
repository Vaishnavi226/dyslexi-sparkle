import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, RotateCcw, Trophy, Target, Star, Sparkles } from 'lucide-react';
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

interface LetterSquareProps {
  letter: string;
  isTarget: boolean;
  isFound: boolean;
  onClick: () => void;
  index: number;
  feedback: 'none' | 'correct' | 'incorrect';
}

const LetterSquare: React.FC<LetterSquareProps> = ({ 
  letter, 
  isTarget, 
  isFound, 
  onClick, 
  index, 
  feedback 
}) => {
  const colors = [
    'hsl(217 91% 60%)',   // Cosmic blue
    'hsl(263 70% 50%)',   // Nebula purple
    'hsl(142 76% 45%)',   // Success green
    'hsl(25 95% 53%)',    // Cosmic orange
    'hsl(47 96% 53%)',    // Star yellow
    'hsl(0 84% 60%)',     // Red
  ];

  const getFeedbackClasses = () => {
    if (feedback === 'correct') return 'animate-pulse border-success shadow-lg shadow-success/50';
    if (feedback === 'incorrect') return 'animate-bounce border-destructive shadow-lg shadow-destructive/50';
    if (isTarget) return 'animate-pulse border-warning shadow-lg shadow-warning/50 ring-4 ring-warning/20';
    return 'border-primary/20';
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: isFound ? 0.9 : 1, 
        opacity: isFound ? 0.5 : 1,
        rotate: feedback === 'incorrect' ? [0, -5, 5, 0] : 0
      }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ 
        duration: 0.3,
        rotate: { duration: 0.5 }
      }}
      whileHover={{ scale: isFound ? 0.9 : 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative"
    >
      <Button
        onClick={onClick}
        disabled={isFound}
        className={`
          h-20 w-20 rounded-xl border-2 transition-all duration-300 font-dyslexic text-3xl font-bold
          ${getFeedbackClasses()}
          ${isFound ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'}
        `}
        style={{
          backgroundColor: colors[index % colors.length],
          color: 'white',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}
      >
        {letter}
        
        {/* Target glow effect */}
        {isTarget && !isFound && (
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-warning"
            animate={{ 
              boxShadow: [
                '0 0 20px hsl(47 96% 53% / 0.5)',
                '0 0 40px hsl(47 96% 53% / 0.8)',
                '0 0 20px hsl(47 96% 53% / 0.5)'
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        {/* Success sparkles */}
        <AnimatePresence>
          {feedback === 'correct' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="h-6 w-6 text-warning animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
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
  const [accuracy, setAccuracy] = useState(100);
  const [attempts, setAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [letterFeedback, setLetterFeedback] = useState<{[key: string]: 'none' | 'correct' | 'incorrect'}>({});
  const [gameComplete, setGameComplete] = useState(false);

  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  // Timer effect
  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameComplete) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleGameEnd();
    }
  }, [gameStarted, timeLeft, gameComplete]);

  // Auto-announce target letter
  useEffect(() => {
    if (gameStarted && !showInstructions && !gameComplete) {
      const timeout = setTimeout(() => {
        SpeechUtils.speak(`Find the letter ${currentTarget}. ${currentTarget} as in ${getPhonicsWord(currentTarget)}`);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [currentTarget, gameStarted, showInstructions, gameComplete]);

  // Clear feedback after animation
  useEffect(() => {
    Object.keys(letterFeedback).forEach(letter => {
      if (letterFeedback[letter] !== 'none') {
        setTimeout(() => {
          setLetterFeedback(prev => ({ ...prev, [letter]: 'none' }));
        }, 1000);
      }
    });
  }, [letterFeedback]);

  const getPhonicsWord = (letter: string): string => {
    const phonicsMap: {[key: string]: string} = {
      'A': 'Apple', 'B': 'Ball', 'C': 'Cat', 'D': 'Dog', 'E': 'Elephant',
      'F': 'Fish', 'G': 'Goat', 'H': 'House', 'I': 'Ice cream', 'J': 'Jump',
      'K': 'Kite', 'L': 'Lion'
    };
    return phonicsMap[letter] || letter;
  };

  const calculateStars = (): number => {
    if (accuracy >= 90) return 3;
    if (accuracy >= 70) return 2;
    if (accuracy >= 50) return 1;
    return 0;
  };

  const handleLetterClick = (letter: string) => {
    setAttempts(prev => prev + 1);
    
    // Speak the letter
    SpeechUtils.speak(`${letter}. ${letter} as in ${getPhonicsWord(letter)}`);

    if (letter === currentTarget) {
      // Correct letter
      setFoundLetters(prev => new Set([...prev, letter]));
      setCorrectAttempts(prev => prev + 1);
      setScore(prev => prev + 100 + (level * 10));
      setLetterFeedback(prev => ({ ...prev, [letter]: 'correct' }));
      
      triggerConfetti('success');
      
      // Move to next target
      const nextTarget = getNextTarget();
      if (nextTarget) {
        setTimeout(() => {
          setCurrentTarget(nextTarget);
          SpeechUtils.speak(`Great job! Now find the letter ${nextTarget}`);
        }, 1500);
      } else {
        // Level complete
        setTimeout(() => {
          if (level < 3) {
            setLevel(prev => prev + 1);
            setFoundLetters(new Set());
            setCurrentTarget('A');
            SpeechUtils.speak(`Level ${level + 1} complete! Moving to next level!`);
          } else {
            // Game complete
            setGameComplete(true);
            const stars = calculateStars();
            SpeechUtils.speak(`Congratulations! You completed all levels! You earned ${stars} stars!`);
          }
        }, 1500);
      }
    } else {
      // Wrong letter
      setLetterFeedback(prev => ({ ...prev, [letter]: 'incorrect' }));
      SpeechUtils.speak(`Try again! Look for the letter ${currentTarget}`);
    }

    // Update accuracy
    const newAccuracy = ((correctAttempts + (letter === currentTarget ? 1 : 0)) / (attempts + 1)) * 100;
    setAccuracy(newAccuracy);
  };

  const getNextTarget = () => {
    const availableLetters = letters.filter(l => !foundLetters.has(l) && l !== currentTarget);
    return availableLetters[Math.floor(Math.random() * availableLetters.length)];
  };

  const handleGameEnd = () => {
    setGameStarted(false);
    setGameComplete(true);
    const stars = calculateStars();
    SpeechUtils.speak(`Game over! You found ${foundLetters.size} letters and scored ${score} points! You earned ${stars} stars!`);
  };

  const startGame = () => {
    setGameStarted(true);
    setShowInstructions(false);
    setTimeLeft(60);
    setScore(0);
    setFoundLetters(new Set());
    setLevel(1);
    setCurrentTarget('A');
    setAccuracy(100);
    setAttempts(0);
    setCorrectAttempts(0);
    setLetterFeedback({});
    setGameComplete(false);
    SpeechUtils.speak('Letter hunt started! Find the letter A. A as in Apple!');
  };

  const resetGame = () => {
    setGameStarted(false);
    setShowInstructions(true);
    setTimeLeft(60);
    setScore(0);
    setFoundLetters(new Set());
    setLevel(1);
    setCurrentTarget('A');
    setAccuracy(100);
    setAttempts(0);
    setCorrectAttempts(0);
    setLetterFeedback({});
    setGameComplete(false);
  };

  if (showInstructions) {
    return (
      <Card className="cosmic-card">
        <CardContent className="p-8 text-center space-y-6 font-lexend">
          <div className="text-6xl mb-4">🔎</div>
          <h2 className="text-3xl font-bold text-accent">Letter Hunt Instructions</h2>
          <div className="space-y-4 text-left max-w-2xl mx-auto text-lg">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">👂</span>
              <p>Listen for the letter name and phonics sound</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">✨</span>
              <p>Look for the glowing, pulsing target letter</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">👆</span>
              <p>Tap on the correct letter square to collect it</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">⭐</span>
              <p>Earn up to 3 stars based on your accuracy!</p>
            </div>
          </div>
          <div className="space-x-4">
            <Button onClick={startGame} size="lg" className="cosmic-button text-lg px-8 py-3">
              <Target className="w-5 h-5 mr-2" />
              Start Hunting!
            </Button>
            <Button onClick={onBack} variant="outline" size="lg" className="text-lg px-8 py-3">
              Back to Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gameComplete) {
    const stars = calculateStars();
    return (
      <Card className="cosmic-card">
        <CardContent className="p-8 text-center space-y-6 font-lexend">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Trophy className="w-16 h-16 mx-auto text-accent mb-4" />
            <h2 className="text-3xl font-bold text-accent mb-4">Game Complete!</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="cosmic-card p-4">
              <div className="text-3xl font-bold text-primary">{score}</div>
              <div className="text-muted-foreground">Final Score</div>
            </div>
            <div className="cosmic-card p-4">
              <div className="text-3xl font-bold text-success">{foundLetters.size}/12</div>
              <div className="text-muted-foreground">Letters Found</div>
            </div>
            <div className="cosmic-card p-4">
              <div className="text-3xl font-bold text-warning">{Math.round(accuracy)}%</div>
              <div className="text-muted-foreground">Accuracy</div>
            </div>
          </div>

          <div className="flex justify-center space-x-2 mb-6">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.2, duration: 0.3 }}
              >
                <Star 
                  className={`w-8 h-8 ${i <= stars ? 'text-accent fill-accent' : 'text-muted'}`} 
                />
              </motion.div>
            ))}
          </div>

          <div className="space-x-4">
            <Button onClick={startGame} className="cosmic-button text-lg px-8 py-3">
              <RotateCcw className="w-5 h-5 mr-2" />
              Play Again
            </Button>
            <Button onClick={onBack} variant="outline" className="text-lg px-8 py-3">
              Back to Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 font-lexend">
      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="cosmic-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{score}</div>
            <div className="text-sm text-muted-foreground">Score</div>
          </CardContent>
        </Card>
        <Card className="cosmic-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{foundLetters.size}/12</div>
            <div className="text-sm text-muted-foreground">Found</div>
          </CardContent>
        </Card>
        <Card className="cosmic-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary">{level}</div>
            <div className="text-sm text-muted-foreground">Level</div>
          </CardContent>
        </Card>
        <Card className="cosmic-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{timeLeft}</div>
            <div className="text-sm text-muted-foreground">Time</div>
          </CardContent>
        </Card>
        <Card className="cosmic-card">
          <CardContent className="p-4 text-center">
            <div className="flex justify-center space-x-1">
              {[1, 2, 3].map((i) => (
                <Star 
                  key={i}
                  className={`w-4 h-4 ${i <= calculateStars() ? 'text-accent fill-accent' : 'text-muted'}`} 
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">Stars</div>
          </CardContent>
        </Card>
      </div>

      {/* Current Target */}
      <Alert className="border-warning bg-warning/10">
        <Target className="w-4 h-4" />
        <AlertDescription className="flex items-center justify-between text-lg">
          <span>
            <span className="font-bold">Find the letter:</span> 
            <span className="text-4xl font-bold text-warning ml-2 font-dyslexic">{currentTarget}</span>
            <span className="ml-2 text-sm text-muted-foreground">
              ({currentTarget} as in {getPhonicsWord(currentTarget)})
            </span>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => SpeechUtils.speak(`Find the letter ${currentTarget}. ${currentTarget} as in ${getPhonicsWord(currentTarget)}`)}
            className="shrink-0"
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
        <Progress value={(foundLetters.size / 12) * 100} className="h-3 space-progress" />
      </div>

      {/* Letter Grid */}
      <Card className="cosmic-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 justify-items-center">
            {letters.map((letter, index) => (
              <LetterSquare
                key={letter}
                letter={letter}
                isTarget={letter === currentTarget}
                isFound={foundLetters.has(letter)}
                onClick={() => handleLetterClick(letter)}
                index={index}
                feedback={letterFeedback[letter] || 'none'}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Controls */}
      <div className="flex justify-center space-x-4">
        <Button onClick={resetGame} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Game
        </Button>
        <Button 
          onClick={() => SpeechUtils.speak(`Find the letter ${currentTarget}. ${currentTarget} as in ${getPhonicsWord(currentTarget)}`)}
          className="cosmic-button"
        >
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