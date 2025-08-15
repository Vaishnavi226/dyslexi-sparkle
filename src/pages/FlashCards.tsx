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
  }, [currentCardIndex, userProfile.ttsEnabled, userProfile.ttsRate, userProfile.ttsVolume]);

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
        SpeechUtils.speak(`${currentCard.word}. Sound: ${currentCard.pronunciation}`, {
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
      SpeechUtils.speak(`${currentCard.word}. ${currentCard.pronunciation}`, {
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
                  className="relative w-80 h-96 cursor-pointer"
                  style={{ perspective: '1000px' }}
                  onClick={flipCard}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="relative w-full h-full"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Front of card */}
                    <div
                      className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border-2 border-primary/20 flex flex-col items-center justify-center"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <div className="text-8xl font-bold text-primary mb-4">
                        {currentCard.letter}
                      </div>
                      <div className="text-lg text-muted-foreground">
                        Tap to see word
                      </div>
                    </div>

                    {/* Back of card */}
                    <div
                      className="absolute inset-0 w-full h-full bg-gradient-to-br from-secondary/10 to-accent/10 rounded-2xl border-2 border-secondary/20 flex flex-col items-center justify-center"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <div className="text-6xl mb-4">{currentCard.image}</div>
                      <div className="text-3xl font-bold text-secondary mb-2">
                        {currentCard.word}
                      </div>
                      <div className="text-lg text-muted-foreground mb-4">
                        {currentCard.pronunciation}
                      </div>
                      <Button onClick={(e) => { e.stopPropagation(); speakWord(); }} variant="outline" size="sm">
                        <Volume2 className="w-4 h-4 mr-2" />
                        Listen
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Controls */}
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={previousCard}
                    disabled={currentCardIndex === 0}
                    variant="outline"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  {gameMode === 'quiz' && isFlipped && (
                    <div className="flex space-x-2">
                      <Button onClick={markIncorrect} variant="outline" className="text-red-600">
                        ❌ Incorrect
                      </Button>
                      <Button onClick={markCorrect} className="text-green-600">
                        ✅ Correct
                      </Button>
                    </div>
                  )}

                  {gameMode === 'study' && (
                    <Button onClick={nextCard}>
                      {currentCardIndex === shuffledCards.length - 1 ? 'Finish' : 'Next'}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>

                {/* Mode Toggle */}
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => setGameMode('study')}
                    variant={gameMode === 'study' ? 'default' : 'outline'}
                    size="sm"
                  >
                    Study Mode
                  </Button>
                  <Button
                    onClick={() => setGameMode('quiz')}
                    variant={gameMode === 'quiz' ? 'default' : 'outline'}
                    size="sm"
                  >
                    Quiz Mode
                  </Button>
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