import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, RotateCcw, Trophy, Target, Star, Sparkles, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SpeechUtils } from '@/utils/speechUtils';
import { triggerConfetti } from '@/utils/confetti';

// Analytics event tracking
const trackEvent = (event: string, data?: any) => {
  console.log(`Analytics: ${event}`, data);
  // In a real app, this would send to analytics service
};

interface LetterHuntProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

type LetterState = 'normal' | 'target' | 'found' | 'incorrect';
type GameState = 'instructions' | 'playing' | 'complete';

interface LetterSquareProps {
  letter: string;
  state: LetterState;
  onClick: () => void;
  index: number;
}

const LetterSquare: React.FC<LetterSquareProps> = ({ 
  letter, 
  state, 
  onClick, 
  index 
}) => {
  const colors = [
    'hsl(217 91% 60%)',   // Cosmic blue
    'hsl(263 70% 50%)',   // Nebula purple
    'hsl(142 76% 45%)',   // Success green
    'hsl(25 95% 53%)',    // Cosmic orange
    'hsl(47 96% 53%)',    // Star yellow
    'hsl(0 84% 60%)',     // Red
    'hsl(300 70% 55%)',   // Magenta
    'hsl(180 70% 45%)',   // Cyan
    'hsl(120 60% 50%)',   // Light green
    'hsl(60 90% 50%)',    // Bright yellow
    'hsl(320 80% 55%)',   // Pink
    'hsl(200 80% 55%)',   // Light blue
  ];

  const getStateClasses = () => {
    switch (state) {
      case 'target':
        return 'animate-pulse border-warning shadow-lg shadow-warning/50 ring-4 ring-warning/20';
      case 'found':
        return 'border-success bg-success/20 cursor-not-allowed opacity-75';
      case 'incorrect':
        return 'animate-bounce border-destructive shadow-lg shadow-destructive/50';
      default:
        return 'border-primary/20 hover:border-primary/40';
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: state === 'found' ? 0.95 : 1, 
        opacity: 1,
        rotate: state === 'incorrect' ? [0, -5, 5, 0] : 0
      }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ 
        duration: 0.3,
        rotate: { duration: 0.5 }
      }}
      whileHover={{ scale: state === 'found' ? 0.95 : 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative"
      role="button"
      aria-label={`Letter ${letter}${state === 'target' ? ' - target letter' : ''}${state === 'found' ? ' - found' : ''}`}
    >
      <Button
        onClick={onClick}
        disabled={state === 'found'}
        className={`
          h-20 w-20 rounded-xl border-2 transition-all duration-300 font-dyslexic text-3xl font-bold relative
          ${getStateClasses()}
        `}
        style={{
          backgroundColor: state === 'found' ? 'hsl(142 76% 45%)' : colors[index % colors.length],
          color: 'white',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}
      >
        {state === 'found' ? (
          <div className="flex items-center justify-center">
            <Check className="w-6 h-6" />
          </div>
        ) : (
          letter
        )}
        
        {/* Target glow effect */}
        {state === 'target' && (
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
          {state === 'found' && (
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              exit={{ scale: 0 }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="h-6 w-6 text-warning" />
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
  const [gameState, setGameState] = useState<GameState>('instructions');
  const [accuracy, setAccuracy] = useState(100);
  const [attempts, setAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [letterStates, setLetterStates] = useState<{[key: string]: LetterState}>({});
  const [liveMessage, setLiveMessage] = useState('');
  const [audioTimeouts, setAudioTimeouts] = useState<NodeJS.Timeout[]>([]);
  
  // Dynamic word-based gameplay
  const [targetWord, setTargetWord] = useState('CAT');
  const [wordLetters, setWordLetters] = useState<string[]>([]);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  
  const wordBank = [
    'CAT', 'DOG', 'BAT', 'HAT', 'RAT', 'MAT',
    'BIG', 'DIG', 'FIG', 'JIG', 'PIG', 'WIG',
    'BED', 'FED', 'LED', 'RED', 'TED', 'WED',
    'CUP', 'PUP', 'SUP',
    'BAG', 'GAG', 'JAG', 'LAG', 'NAG', 'RAG', 'TAG', 'WAG'
  ];
  
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  
  // Audio cleanup function
  const stopAllAudio = useCallback(() => {
    SpeechUtils.stopSpeaking();
    audioTimeouts.forEach(timeout => clearTimeout(timeout));
    setAudioTimeouts([]);
    trackEvent('audio_stopped_on_exit');
  }, [audioTimeouts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, [stopAllAudio]);

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      handleGameEnd();
    }
  }, [gameState, timeLeft]);

  // Auto-announce target letter with Indian English accent
  useEffect(() => {
    if (gameState === 'playing' && currentTarget) {
      const message = `Find the letter ${currentTarget}. ${currentTarget} as in ${getPhonicsWord(currentTarget)}`;
      setLiveMessage(message);
      
      const timeout = setTimeout(() => {
        SpeechUtils.speak(message, { lang: 'en-IN', rate: 0.85 });
        trackEvent('letter_target_announced', { letter: currentTarget });
      }, 500);
      
      setAudioTimeouts(prev => [...prev, timeout]);
      return () => clearTimeout(timeout);
    }
  }, [currentTarget, gameState]);

  // Clear incorrect state after animation
  useEffect(() => {
    Object.keys(letterStates).forEach(letter => {
      if (letterStates[letter] === 'incorrect') {
        const timeout = setTimeout(() => {
          setLetterStates(prev => ({ 
            ...prev, 
            [letter]: letter === currentTarget ? 'target' : 'normal' 
          }));
        }, 1000);
        setAudioTimeouts(prev => [...prev, timeout]);
      }
    });
  }, [letterStates, currentTarget]);

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
    if (gameState !== 'playing') return;
    
    setAttempts(prev => prev + 1);
    
    // Handle already found letters
    if (foundLetters.has(letter)) {
      const message = `You already found ${letter}.`;
      setLiveMessage(message);
      SpeechUtils.speak(message);
      return;
    }
    
    // Speak the letter with Indian accent
    const letterMessage = `${letter}. ${letter} as in ${getPhonicsWord(letter)}`;
    SpeechUtils.speak(letterMessage, { lang: 'en-IN', rate: 0.85 });

    if (letter === currentTarget) {
      // Correct letter found
      setFoundLetters(prev => new Set([...prev, letter]));
      setCorrectAttempts(prev => prev + 1);
      setScore(prev => prev + 100 + (level * 10));
      setLetterStates(prev => ({ ...prev, [letter]: 'found' }));
      
      // Update word progress
      const newWordLetters = [...wordLetters, letter];
      setWordLetters(newWordLetters);
      setCurrentLetterIndex(prev => prev + 1);
      
      const foundMessage = `Correct! Letter ${letter} found!`;
      setLiveMessage(foundMessage);
      
      triggerConfetti('success');
      trackEvent('letter_found', { letter, score: score + 100 + (level * 10), word: targetWord });
      
      // Check if word is complete
      if (newWordLetters.length === targetWord.length) {
        const timeout = setTimeout(() => {
          const wordCompleteMsg = `Excellent! You completed the word ${targetWord.split('').join(' ')}! Let's try another word!`;
          setLiveMessage(wordCompleteMsg);
          SpeechUtils.speak(wordCompleteMsg, { lang: 'en-IN', rate: 0.85 });
          triggerConfetti('celebration');
          
          // Start new word after delay
          setTimeout(() => {
            const newWord = wordBank[Math.floor(Math.random() * wordBank.length)];
            setTargetWord(newWord);
            setWordLetters([]);
            setCurrentLetterIndex(0);
            const firstLetter = newWord[0];
            setCurrentTarget(firstLetter);
            setLetterStates(prev => {
              const newStates = { ...prev };
              letters.forEach(l => {
                if (!foundLetters.has(l) && l !== firstLetter) {
                  newStates[l] = 'normal';
                }
              });
              newStates[firstLetter] = 'target';
              return newStates;
            });
            
            const newWordMsg = `New word! Find the letters for ${newWord.split('').join(', ')}. First, find ${firstLetter}. ${firstLetter} as in ${getPhonicsWord(firstLetter)}`;
            setLiveMessage(newWordMsg);
            SpeechUtils.speak(newWordMsg, { lang: 'en-IN', rate: 0.85 });
          }, 2500);
        }, 1000);
        setAudioTimeouts(prev => [...prev, timeout]);
      } else {
        // Move to next letter in the word
        const nextLetter = targetWord[newWordLetters.length];
        const timeout = setTimeout(() => {
          setCurrentTarget(nextLetter);
          setLetterStates(prev => ({ 
            ...prev, 
            [currentTarget]: 'found',
            [nextLetter]: 'target'
          }));
          const nextMessage = `Great! Now find the letter ${nextLetter}. ${nextLetter} as in ${getPhonicsWord(nextLetter)}`;
          setLiveMessage(nextMessage);
          SpeechUtils.speak(nextMessage, { lang: 'en-IN', rate: 0.85 });
          trackEvent('letter_target_announced', { letter: nextLetter, word: targetWord });
        }, 1500);
        setAudioTimeouts(prev => [...prev, timeout]);
      }
    } else {
      // Wrong letter
      setLetterStates(prev => ({ ...prev, [letter]: 'incorrect' }));
      const errorMessage = `That is ${letter}. We need ${currentTarget}. ${currentTarget} as in ${getPhonicsWord(currentTarget)}. Try again!`;
      setLiveMessage(errorMessage);
      SpeechUtils.speak(errorMessage, { lang: 'en-IN', rate: 0.85 });
      trackEvent('letter_incorrect_tap', { 
        tappedLetter: letter, 
        targetLetter: currentTarget,
        word: targetWord
      });
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
    setGameState('complete');
    const stars = calculateStars();
    const endMessage = `Game over! You found ${foundLetters.size} letters and scored ${score} points! You earned ${stars} stars!`;
    setLiveMessage(endMessage);
    SpeechUtils.speak(endMessage);
  };

  const startGame = () => {
    stopAllAudio();
    setGameState('playing');
    setTimeLeft(60);
    setScore(0);
    setFoundLetters(new Set());
    setLevel(1);
    setAccuracy(100);
    setAttempts(0);
    setCorrectAttempts(0);
    
    // Pick a random word to start
    const firstWord = wordBank[Math.floor(Math.random() * wordBank.length)];
    setTargetWord(firstWord);
    setWordLetters([]);
    setCurrentLetterIndex(0);
    const firstLetter = firstWord[0];
    setCurrentTarget(firstLetter);
    
    // Initialize letter states
    const initialStates: {[key: string]: LetterState} = {};
    letters.forEach(letter => {
      initialStates[letter] = letter === firstLetter ? 'target' : 'normal';
    });
    setLetterStates(initialStates);
    
    const startMessage = `Welcome to Letter Hunt! Let's spell the word ${firstWord.split('').join(', ')}. First, find the letter ${firstLetter}. ${firstLetter} as in ${getPhonicsWord(firstLetter)}!`;
    setLiveMessage(startMessage);
    SpeechUtils.speak(startMessage, { lang: 'en-IN', rate: 0.85 });
  };

  const resetGame = () => {
    stopAllAudio();
    setGameState('instructions');
    setTimeLeft(60);
    setScore(0);
    setFoundLetters(new Set());
    setLevel(1);
    setTargetWord('CAT');
    setWordLetters([]);
    setCurrentLetterIndex(0);
    setCurrentTarget('C');
    setAccuracy(100);
    setAttempts(0);
    setCorrectAttempts(0);
    setLetterStates({});
    setLiveMessage('');
  };

  const repeatTarget = () => {
    stopAllAudio();
    const wordProgress = wordLetters.length > 0 
      ? `You have found ${wordLetters.join(', ')}. ` 
      : '';
    const message = `${wordProgress}We are spelling ${targetWord.split('').join(', ')}. Find the letter ${currentTarget}. ${currentTarget} as in ${getPhonicsWord(currentTarget)}`;
    setLiveMessage(message);
    SpeechUtils.speak(message, { lang: 'en-IN', rate: 0.85 });
    trackEvent('letter_target_announced', { letter: currentTarget, repeated: true, word: targetWord });
  };

  const handleBackToMenu = () => {
    stopAllAudio();
    onBack();
  };

  if (gameState === 'instructions') {
    return (
      <div className="space-y-6 font-lexend">
        {/* ARIA Live Region */}
        <div
          role="status"
          aria-live="assertive"
          className="sr-only"
          aria-atomic="true"
        >
          {liveMessage}
        </div>
        
        <Card className="cosmic-card">
          <CardContent className="p-8 text-center space-y-6">
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
              <Button onClick={handleBackToMenu} variant="outline" size="lg" className="text-lg px-8 py-3">
                Back to Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === 'complete') {
    const stars = calculateStars();
    return (
      <div className="space-y-6 font-lexend">
        {/* ARIA Live Region */}
        <div
          role="status"
          aria-live="assertive"
          className="sr-only"
          aria-atomic="true"
        >
          {liveMessage}
        </div>
        
        <Card className="cosmic-card">
          <CardContent className="p-8 text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Trophy className="w-16 h-16 mx-auto text-accent mb-4" />
              <h2 className="text-3xl font-bold text-accent mb-4">Level Complete!</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
              <div className="cosmic-card p-4">
                <div className="text-3xl font-bold text-secondary">{60 - timeLeft}s</div>
                <div className="text-muted-foreground">Time Used</div>
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

            <div className="space-x-4 flex flex-wrap justify-center gap-4">
              <Button onClick={startGame} className="cosmic-button text-lg px-8 py-3">
                <RotateCcw className="w-5 h-5 mr-2" />
                Play Again
              </Button>
              <Button onClick={resetGame} variant="outline" className="text-lg px-8 py-3">
                Review Letters
              </Button>
              <Button onClick={handleBackToMenu} variant="outline" className="text-lg px-8 py-3">
                Back to Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-lexend">
      {/* ARIA Live Region */}
      <div
        role="status"
        aria-live="assertive"
        className="sr-only"
        aria-atomic="true"
      >
        {liveMessage}
      </div>
      
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

      {/* Target Word Display */}
      <Alert className="border-primary bg-primary/10">
        <Sparkles className="w-4 h-4" />
        <AlertDescription className="text-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold">Spelling:</span>
              <div className="flex gap-2 mt-2">
                {targetWord.split('').map((letter, idx) => (
                  <div
                    key={idx}
                    className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 font-dyslexic text-xl font-bold transition-all ${
                      idx < wordLetters.length
                        ? 'bg-success border-success text-white'
                        : idx === wordLetters.length
                        ? 'bg-warning/20 border-warning animate-pulse'
                        : 'bg-muted border-muted-foreground/20'
                    }`}
                  >
                    {idx < wordLetters.length ? letter : '_'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>

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
            onClick={repeatTarget}
            className="shrink-0"
            aria-label="Repeat target letter"
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
            {letters.map((letter, index) => {
              let state: LetterState = 'normal';
              if (foundLetters.has(letter)) {
                state = 'found';
              } else if (letter === currentTarget) {
                state = 'target';
              } else if (letterStates[letter]) {
                state = letterStates[letter];
              }
              
              return (
                <LetterSquare
                  key={letter}
                  letter={letter}
                  state={state}
                  onClick={() => handleLetterClick(letter)}
                  index={index}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Game Controls */}
      <div className="flex justify-center space-x-4 flex-wrap gap-4">
        <Button onClick={resetGame} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Game
        </Button>
        <Button onClick={repeatTarget} className="cosmic-button">
          <Volume2 className="w-4 h-4 mr-2" />
          Repeat Target
        </Button>
        <Button onClick={handleGameEnd} variant="destructive">
          End Game
        </Button>
        <Button onClick={handleBackToMenu} variant="outline">
          Back to Menu
        </Button>
      </div>
    </div>
  );
};

export default LetterHunt;