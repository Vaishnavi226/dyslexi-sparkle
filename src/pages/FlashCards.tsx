import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Volume2, RotateCcw, Shuffle, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Layout from '@/components/shared/Layout';
import { useGame } from '@/contexts/GameContext';
import { SpeechUtils } from '@/utils/speechUtils';
import { triggerConfetti, triggerStarConfetti } from '@/utils/confetti';

interface FlashCard {
  id: number;
  letter: string;
  word: string;
  image: string;
  pronunciation: string;
  category: 'alphabet' | 'phonics' | 'sight-words';
}

const flashCardsData: FlashCard[] = [
  // Alphabet cards
  { id: 1, letter: 'A', word: 'Apple', image: '🍎', pronunciation: '/æ/', category: 'alphabet' },
  { id: 2, letter: 'B', word: 'Ball', image: '⚽', pronunciation: '/b/', category: 'alphabet' },
  { id: 3, letter: 'C', word: 'Cat', image: '🐱', pronunciation: '/k/', category: 'alphabet' },
  { id: 4, letter: 'D', word: 'Dog', image: '🐕', pronunciation: '/d/', category: 'alphabet' },
  { id: 5, letter: 'E', word: 'Elephant', image: '🐘', pronunciation: '/ɛ/', category: 'alphabet' },
  { id: 6, letter: 'F', word: 'Fish', image: '🐟', pronunciation: '/f/', category: 'alphabet' },
  { id: 7, letter: 'G', word: 'Giraffe', image: '🦒', pronunciation: '/g/', category: 'alphabet' },
  { id: 8, letter: 'H', word: 'House', image: '🏠', pronunciation: '/h/', category: 'alphabet' },
  { id: 9, letter: 'I', word: 'Ice cream', image: '🍦', pronunciation: '/aɪ/', category: 'alphabet' },
  { id: 10, letter: 'J', word: 'Juice', image: '🧃', pronunciation: '/dʒ/', category: 'alphabet' },
  
  // Phonics cards
  { id: 11, letter: 'CH', word: 'Chair', image: '🪑', pronunciation: '/tʃ/', category: 'phonics' },
  { id: 12, letter: 'SH', word: 'Ship', image: '🚢', pronunciation: '/ʃ/', category: 'phonics' },
  { id: 13, letter: 'TH', word: 'Three', image: '3️⃣', pronunciation: '/θ/', category: 'phonics' },
  { id: 14, letter: 'PH', word: 'Phone', image: '📱', pronunciation: '/f/', category: 'phonics' },
  
  // Sight words
  { id: 15, letter: 'THE', word: 'The', image: '👆', pronunciation: '/ðə/', category: 'sight-words' },
  { id: 16, letter: 'AND', word: 'And', image: '➕', pronunciation: '/ænd/', category: 'sight-words' },
  { id: 17, letter: 'YOU', word: 'You', image: '👤', pronunciation: '/ju/', category: 'sight-words' },
  { id: 18, letter: 'ARE', word: 'Are', image: '❓', pronunciation: '/ɑr/', category: 'sight-words' }
];

const FlashCards: React.FC = () => {
  const { userProgress, updateProgress, addXP, userProfile } = useGame();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [cardsViewed, setCardsViewed] = useState(0);
  const [gameMode, setGameMode] = useState<'study' | 'quiz'>('study');
  const [shuffledCards, setShuffledCards] = useState(flashCardsData);

  const currentCard = shuffledCards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / shuffledCards.length) * 100;

  useEffect(() => {
    if (userProfile.ttsEnabled && currentCard && !isFlipped) {
      SpeechUtils.speak(`Letter ${currentCard.letter}`, {
        rate: userProfile.ttsRate,
        volume: userProfile.ttsVolume
      });
    }
  }, [currentCardIndex, userProfile.ttsEnabled, userProfile.ttsRate, userProfile.ttsVolume, currentCard, isFlipped]);

  const shuffleCards = () => {
    const shuffled = [...flashCardsData].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setScore(0);
    setCardsViewed(0);
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      setCardsViewed(prev => prev + 1);
      if (userProfile.ttsEnabled) {
        // Clean pronunciation by removing forward slashes and phonetic symbols
        const cleanPronunciation = currentCard.pronunciation.replace(/[\/\[\]]/g, '');
        SpeechUtils.speak(`${currentCard.word}`, {
          rate: userProfile.ttsRate,
          volume: userProfile.ttsVolume
        });
      }
    }
  };

  const nextCard = () => {
    if (currentCardIndex < shuffledCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      // Game complete
      const finalScore = Math.round((score / shuffledCards.length) * 100);
      const stars = finalScore >= 90 ? 3 : finalScore >= 70 ? 2 : finalScore >= 50 ? 1 : 0;
      
      updateProgress('flashCards', {
        score: finalScore,
        cardsCompleted: cardsViewed,
        stars
      });
      
      addXP(stars * 10);
      
      if (stars > 0) {
        triggerStarConfetti(stars);
      }
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const markCorrect = () => {
    setScore(score + 1);
    if (userProfile.soundFxEnabled) {
      triggerConfetti('success');
    }
    setTimeout(nextCard, 500);
  };

  const markIncorrect = () => {
    setTimeout(nextCard, 500);
  };

  const speakWord = () => {
    if (isFlipped) {
      // Only speak the word, not the pronunciation symbols
      SpeechUtils.speak(`${currentCard.word}`, {
        rate: userProfile.ttsRate,
        volume: userProfile.ttsVolume
      });
    } else {
      SpeechUtils.speak(`Letter ${currentCard.letter}`, {
        rate: userProfile.ttsRate,
        volume: userProfile.ttsVolume
      });
    }
  };

  const resetGame = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setScore(0);
    setCardsViewed(0);
  };

  if (currentCardIndex >= shuffledCards.length) {
    const finalScore = Math.round((score / shuffledCards.length) * 100);
    const stars = finalScore >= 90 ? 3 : finalScore >= 70 ? 2 : finalScore >= 50 ? 1 : 0;

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
                  <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
                </motion.div>
                <CardTitle className="text-3xl font-bold">Flash Cards Complete!</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex justify-center space-x-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">{finalScore}%</div>
                    <div className="text-sm text-muted-foreground">Final Score</div>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      {[...Array(3)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-8 h-8 ${
                            i < stars ? 'text-yellow-500 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">Stars Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-secondary">{cardsViewed}</div>
                    <div className="text-sm text-muted-foreground">Cards Viewed</div>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <Button onClick={resetGame} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Study Again
                  </Button>
                  <Button onClick={shuffleCards}>
                    <Shuffle className="w-4 h-4 mr-2" />
                    Shuffle & Restart
                  </Button>
                </div>
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
                  <BookOpen className="w-8 h-8 mr-3 text-primary" />
                  Flash Cards
                </CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-1" />
                    <span className="font-bold">{score}/{cardsViewed}</span>
                  </div>
                  <Button onClick={shuffleCards} variant="outline" size="sm">
                    <Shuffle className="w-4 h-4 mr-2" />
                    Shuffle
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Card {currentCardIndex + 1} of {shuffledCards.length}</span>
                <span className="capitalize">{currentCard.category.replace('-', ' ')}</span>
              </div>
              <Progress value={progress} className="mt-2" />
            </CardHeader>

            <CardContent>
              <div className="flex flex-col items-center space-y-6">
                {/* Flash Card */}
                <motion.div
                  className="relative w-80 h-96 cursor-pointer group"
                  style={{ perspective: '1000px' }}
                  onClick={flipCard}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="relative w-full h-full"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Front of card */}
                    <motion.div
                      className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 dark:from-blue-400/30 dark:via-purple-400/30 dark:to-pink-400/30 rounded-3xl border-4 border-blue-300/50 dark:border-blue-400/70 flex flex-col items-center justify-center shadow-2xl backdrop-blur-sm"
                      style={{ backfaceVisibility: 'hidden' }}
                      whileHover={{ borderColor: 'rgba(59, 130, 246, 0.8)' }}
                    >
                      <motion.div 
                        className="text-9xl font-black text-transparent bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text mb-4 drop-shadow-lg"
                        animate={{ 
                          textShadow: [
                            '0 0 20px rgba(59, 130, 246, 0.5)',
                            '0 0 30px rgba(147, 51, 234, 0.5)',
                            '0 0 20px rgba(236, 72, 153, 0.5)',
                            '0 0 20px rgba(59, 130, 246, 0.5)'
                          ]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        {currentCard.letter}
                      </motion.div>
                      <motion.div 
                        className="text-lg font-semibold text-foreground/80 dark:text-foreground/90 bg-background/60 dark:bg-background/80 px-4 py-2 rounded-full border border-border/50"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        ✨ Tap to reveal ✨
                      </motion.div>
                      
                      {/* Floating sparkles */}
                      <motion.div
                        className="absolute top-4 right-4 text-yellow-400 text-2xl"
                        animate={{ 
                          rotate: [0, 360],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        ⭐
                      </motion.div>
                      <motion.div
                        className="absolute bottom-6 left-6 text-pink-400 text-xl"
                        animate={{ 
                          rotate: [360, 0],
                          scale: [1, 1.3, 1]
                        }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      >
                        🌟
                      </motion.div>
                      <motion.div
                        className="absolute top-1/3 left-4 text-blue-400 text-lg"
                        animate={{ 
                          y: [-5, 5, -5],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        ✨
                      </motion.div>
                    </motion.div>

                    {/* Back of card */}
                    <motion.div
                      className="absolute inset-0 w-full h-full bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20 dark:from-green-400/30 dark:via-emerald-400/30 dark:to-teal-400/30 rounded-3xl border-4 border-green-300/50 dark:border-green-400/70 flex flex-col items-center justify-center shadow-2xl backdrop-blur-sm"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <motion.div 
                        className="text-8xl mb-4 drop-shadow-2xl"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          filter: [
                            'drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))',
                            'drop-shadow(0 0 20px rgba(16, 185, 129, 0.7))',
                            'drop-shadow(0 0 10px rgba(20, 184, 166, 0.5))'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {currentCard.image}
                      </motion.div>
                      
                      <motion.div 
                        className="text-4xl font-black text-transparent bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 dark:from-green-400 dark:via-emerald-400 dark:to-teal-400 bg-clip-text mb-3"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      >
                        {currentCard.word}
                      </motion.div>
                      
                      <motion.div 
                        className="text-lg font-medium text-foreground/70 dark:text-foreground/80 mb-4 bg-background/60 dark:bg-background/80 px-3 py-1 rounded-full border border-border/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        {currentCard.pronunciation}
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          onClick={(e) => { e.stopPropagation(); speakWord(); }} 
                          variant="outline" 
                          size="lg"
                          className="bg-background/80 dark:bg-background/90 border-2 border-green-300 dark:border-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 text-foreground dark:text-foreground font-semibold"
                        >
                          <Volume2 className="w-5 h-5 mr-2" />
                          🎵 Listen
                        </Button>
                      </motion.div>
                      
                      {/* Decorative elements */}
                      <motion.div
                        className="absolute top-4 left-4 text-green-400 text-2xl"
                        animate={{ 
                          rotate: [0, 360]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      >
                        🍃
                      </motion.div>
                      <motion.div
                        className="absolute bottom-4 right-4 text-emerald-400 text-xl"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 180, 360]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        💎
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Controls */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={previousCard}
                      disabled={currentCardIndex === 0}
                      variant="outline"
                      className="bg-background/80 dark:bg-background/90 border-2 border-primary/30 dark:border-primary/50 hover:border-primary/60 dark:hover:border-primary/80"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                  </motion.div>

                  {gameMode === 'quiz' && isFlipped && (
                    <div className="flex space-x-3">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          onClick={markIncorrect} 
                          variant="outline" 
                          className="border-2 border-red-300 dark:border-red-400 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          ❌ Try Again
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          onClick={markCorrect} 
                          className="border-2 border-green-300 dark:border-green-400 bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700"
                        >
                          ✅ Got It!
                        </Button>
                      </motion.div>
                    </div>
                  )}

                  {gameMode === 'study' && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        onClick={nextCard}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 font-semibold px-6"
                      >
                        {currentCardIndex === shuffledCards.length - 1 ? '🎉 Finish' : 'Next Card'}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.div>
                  )}
                </div>

                {/* Mode Toggle */}
                <div className="flex items-center space-x-4 bg-muted/30 dark:bg-muted/50 p-2 rounded-xl border border-border/50">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => setGameMode('study')}
                      variant={gameMode === 'study' ? 'default' : 'outline'}
                      size="sm"
                      className={gameMode === 'study' 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 font-semibold' 
                        : 'border-2 border-blue-300 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                      }
                    >
                      📚 Study Mode
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => setGameMode('quiz')}
                      variant={gameMode === 'quiz' ? 'default' : 'outline'}
                      size="sm"
                      className={gameMode === 'quiz' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 font-semibold' 
                        : 'border-2 border-purple-300 dark:border-purple-400 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30'
                      }
                    >
                      🎯 Quiz Mode
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default FlashCards;