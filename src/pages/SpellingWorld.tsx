import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, RotateCcw, Globe, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import Layout from '@/components/shared/Layout';

interface SpellingWord {
  word: string;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
  audio?: string;
}

const spellingWords: SpellingWord[] = [
  { word: 'cat', hint: 'A furry pet that meows', difficulty: 'easy' },
  { word: 'dog', hint: 'A loyal pet that barks', difficulty: 'easy' },
  { word: 'house', hint: 'Where people live', difficulty: 'easy' },
  { word: 'friend', hint: 'Someone you like to play with', difficulty: 'medium' },
  { word: 'school', hint: 'Where you go to learn', difficulty: 'medium' },
  { word: 'beautiful', hint: 'Something very pretty', difficulty: 'hard' },
  { word: 'elephant', hint: 'A big gray animal with a trunk', difficulty: 'hard' },
  { word: 'rainbow', hint: 'Colorful arc in the sky after rain', difficulty: 'medium' }
];

const SpellingWorld: React.FC = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [streak, setStreak] = useState(0);

  const currentWord = spellingWords[currentWordIndex];
  const progress = ((currentWordIndex + 1) / spellingWords.length) * 100;

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.7;
      utterance.pitch = 1.2;
      speechSynthesis.speak(utterance);
    }
  };

  const checkSpelling = () => {
    const isMatch = userInput.toLowerCase().trim() === currentWord.word.toLowerCase();
    setIsCorrect(isMatch);

    if (isMatch) {
      setScore(score + (currentWord.difficulty === 'easy' ? 10 : currentWord.difficulty === 'medium' ? 20 : 30));
      setStreak(streak + 1);
      
      // Trigger confetti animation
      setTimeout(() => {
        nextWord();
      }, 1500);
    } else {
      setLives(lives - 1);
      setStreak(0);
      if (lives <= 1) {
        setGameComplete(true);
      } else {
        setTimeout(() => {
          setIsCorrect(null);
          setUserInput('');
        }, 2000);
      }
    }
  };

  const nextWord = () => {
    if (currentWordIndex + 1 >= spellingWords.length) {
      setGameComplete(true);
    } else {
      setCurrentWordIndex(currentWordIndex + 1);
      setUserInput('');
      setIsCorrect(null);
      setShowHint(false);
    }
  };

  const resetGame = () => {
    setCurrentWordIndex(0);
    setUserInput('');
    setScore(0);
    setLives(3);
    setIsCorrect(null);
    setShowHint(false);
    setGameComplete(false);
    setStreak(0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userInput.trim() && !isCorrect) {
      checkSpelling();
    }
  };

  if (gameComplete) {
    return (
      <Layout>
        <div className="p-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass text-center">
              <CardHeader>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Globe className="w-16 h-16 text-primary mx-auto mb-4" />
                </motion.div>
                <CardTitle className="text-3xl font-bold">
                  {lives > 0 ? 'Congratulations!' : 'Game Over!'}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-4xl font-bold text-primary">{score} Points</div>
                
                <div className="flex justify-center space-x-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{currentWordIndex}</div>
                    <div className="text-sm text-muted-foreground">Words Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{Math.max(streak)}</div>
                    <div className="text-sm text-muted-foreground">Best Streak</div>
                  </div>
                </div>

                <Button onClick={resetGame} className="mx-auto">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Globe className="w-8 h-8 mr-3 text-primary" />
                  Spelling World
                </CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-1" />
                    <span className="font-bold">{score}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: 3 }, (_, i) => (
                      <Heart
                        key={i}
                        className={`w-5 h-5 ${
                          i < lives ? 'text-red-500 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  {streak > 1 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-sm font-bold"
                    >
                      🔥 {streak}
                    </motion.div>
                  )}
                </div>
              </div>
              <Progress value={progress} className="mt-4" />
            </CardHeader>

            <CardContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentWordIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <Button
                        onClick={() => speakWord(currentWord.word)}
                        variant="outline"
                        size="lg"
                        className="flex items-center space-x-2"
                      >
                        <Volume2 className="w-5 h-5" />
                        <span>Listen</span>
                      </Button>
                      
                      <motion.div
                        animate={isCorrect === null ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          currentWord.difficulty === 'easy'
                            ? 'bg-green-100 text-green-800'
                            : currentWord.difficulty === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {currentWord.difficulty.toUpperCase()}
                      </motion.div>
                    </div>

                    {showHint && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-muted/50 rounded-lg p-4 mb-4"
                      >
                        <p className="text-muted-foreground">💡 {currentWord.hint}</p>
                      </motion.div>
                    )}

                    <div className="space-y-4">
                      <Input
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type the word you heard..."
                        className={`text-center text-2xl h-16 ${
                          isCorrect === true
                            ? 'border-green-500 bg-green-50'
                            : isCorrect === false
                            ? 'border-red-500 bg-red-50'
                            : ''
                        }`}
                        disabled={isCorrect !== null}
                      />

                      {isCorrect === true && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-green-600 font-bold text-xl"
                        >
                          🎉 Correct! Well done!
                        </motion.div>
                      )}

                      {isCorrect === false && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-red-600 font-bold text-xl"
                        >
                          ❌ Try again! The correct spelling is: {currentWord.word}
                        </motion.div>
                      )}
                    </div>

                    <div className="flex justify-center space-x-4 mt-6">
                      <Button
                        onClick={() => setShowHint(true)}
                        variant="outline"
                        disabled={showHint}
                      >
                        Show Hint
                      </Button>
                      
                      <Button
                        onClick={checkSpelling}
                        disabled={!userInput.trim() || isCorrect !== null}
                      >
                        Check Spelling
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default SpellingWorld;