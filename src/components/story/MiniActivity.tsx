import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Check, X, Target } from 'lucide-react';
import { triggerConfetti } from '@/utils/confetti';
import { SpeechUtils } from '@/utils/speechUtils';

interface MiniActivityProps {
  storyId: number;
  storyTitle: string;
  onComplete: (score: number) => void;
  isVisible: boolean;
}

interface FindActivity {
  type: 'find';
  title: string;
  description: string;
  items: { id: number; x: number; y: number; found: boolean; }[];
}

interface RiddleActivity {
  type: 'riddle';
  title: string;
  description: string;
  options: string[];
  correct: number;
}

interface SequenceActivity {
  type: 'sequence';
  title: string;
  description: string;
  sequence: number[];
  shuffled: number[];
}

interface LettersActivity {
  type: 'letters';
  title: string;
  description: string;
  word: string;
  letters: string[];
}

interface MatchActivity {
  type: 'match';
  title: string;
  description: string;
  pairs: { item: string; color: string; }[];
}

type Activity = FindActivity | RiddleActivity | SequenceActivity | LettersActivity | MatchActivity;

const activities: Record<number, Activity> = {
  1: { // Lost Star
    type: 'find',
    title: 'Find the Hidden Stars!',
    description: 'Click on all the twinkling stars to help them find their way home!',
    items: [
      { id: 1, x: 20, y: 30, found: false },
      { id: 2, x: 60, y: 50, found: false },
      { id: 3, x: 80, y: 20, found: false },
      { id: 4, x: 40, y: 70, found: false },
      { id: 5, x: 15, y: 80, found: false },
    ]
  },
  2: { // Talking Tree
    type: 'riddle',
    title: 'Answer the Tree\'s Riddle!',
    description: 'What has leaves but is not a plant, and has a trunk but is not an elephant?',
    options: ['A Tree', 'A Car', 'A Book', 'An Elephant'],
    correct: 0
  },
  3: { // Brave Rocket
    type: 'sequence',
    title: 'Help the Rocket Count Down!',
    description: 'Arrange the numbers in the correct countdown order!',
    sequence: [5, 4, 3, 2, 1],
    shuffled: [3, 1, 5, 2, 4]
  },
  4: { // Magic Book
    type: 'letters',
    title: 'Spell with Magic Letters!',
    description: 'Drag the letters to spell the magic word: MAGIC',
    word: 'MAGIC',
    letters: ['G', 'M', 'C', 'A', 'I']
  },
  5: { // Friendly Dinosaur
    type: 'match',
    title: 'Match the Dinosaur Foods!',
    description: 'Match each food with its color!',
    pairs: [
      { item: '🍎', color: 'Red' },
      { item: '🍌', color: 'Yellow' },
      { item: '🥬', color: 'Green' },
      { item: '🫐', color: 'Blue' }
    ]
  }
};

const MiniActivity: React.FC<MiniActivityProps> = ({ 
  storyId, 
  storyTitle, 
  onComplete, 
  isVisible 
}) => {
  const [gameState, setGameState] = useState<any>({});
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const activity = activities[storyId as keyof typeof activities];

  if (!activity || !isVisible) return null;

  const handleStarClick = (starId: number) => {
    if (activity.type === 'find') {
      const findActivity = activity as FindActivity;
      const newItems = findActivity.items.map(item => 
        item.id === starId ? { ...item, found: true } : item
      );
      const foundCount = newItems.filter(item => item.found).length;
      
      setGameState({ items: newItems });
      setScore((foundCount / findActivity.items.length) * 100);
      
      if (foundCount === findActivity.items.length) {
        completeActivity(100);
      } else {
        triggerConfetti('success');
        SpeechUtils.speak('Great job! Keep looking for more stars!');
      }
    }
  };

  const handleRiddleAnswer = (answerIndex: number) => {
    setAttempts(prev => prev + 1);
    
    if (activity.type === 'riddle') {
      const riddleActivity = activity as RiddleActivity;
      if (answerIndex === riddleActivity.correct) {
        completeActivity(Math.max(100 - (attempts * 20), 60));
      } else {
        SpeechUtils.speak('Try again! Think about what the tree is asking.');
        if (attempts >= 2) {
          SpeechUtils.speak(`The answer is ${riddleActivity.options[riddleActivity.correct]}!`);
          completeActivity(40);
        }
      }
    }
  };

  const handleSequenceDrop = (dragIndex: number, dropIndex: number) => {
    if (activity.type === 'sequence') {
      const sequenceActivity = activity as SequenceActivity;
      const newSequence = [...(gameState.sequence || sequenceActivity.shuffled)];
      [newSequence[dragIndex], newSequence[dropIndex]] = [newSequence[dropIndex], newSequence[dragIndex]];
      
      setGameState({ sequence: newSequence });
      
      const isCorrect = newSequence.every((num, index) => num === sequenceActivity.sequence[index]);
      if (isCorrect) {
        completeActivity(100);
      }
    }
  };

  const handleLetterDrop = (letter: string, position: number) => {
    if (activity.type === 'letters') {
      const lettersActivity = activity as LettersActivity;
      const newSpelling = [...(gameState.spelling || Array(lettersActivity.word.length).fill(''))];
      newSpelling[position] = letter;
      
      setGameState({ spelling: newSpelling });
      
      const isCorrect = newSpelling.join('') === lettersActivity.word;
      if (isCorrect) {
        completeActivity(100);
      }
    }
  };

  const handleMatch = (item: string, color: string) => {
    if (activity.type === 'match') {
      const matchActivity = activity as MatchActivity;
      const correctPair = matchActivity.pairs.find(pair => pair.item === item);
      const isCorrect = correctPair?.color === color;
      
      const newMatches = { ...(gameState.matches || {}), [item]: color };
      setGameState({ matches: newMatches });
      
      if (isCorrect) {
        triggerConfetti('success');
        SpeechUtils.speak('Perfect match!');
        
        const completedMatches = Object.keys(newMatches).length;
        setScore((completedMatches / matchActivity.pairs.length) * 100);
        
        if (completedMatches === matchActivity.pairs.length) {
          completeActivity(100);
        }
      } else {
        SpeechUtils.speak('Try a different color!');
      }
    }
  };

  const completeActivity = (finalScore: number) => {
    setScore(finalScore);
    setIsCompleted(true);
    triggerConfetti('achievement');
    SpeechUtils.speak(`Congratulations! You completed the activity with ${finalScore} points!`);
    
    setTimeout(() => {
      onComplete(finalScore);
    }, 2000);
  };

  const renderActivity = () => {
    switch (activity.type) {
      case 'find':
        const findActivity = activity as FindActivity;
        return (
          <div className="relative h-64 bg-gradient-to-br from-purple-900 to-blue-900 rounded-lg overflow-hidden">
            {(gameState.items || findActivity.items).map((star: any) => (
              <motion.button
                key={star.id}
                className={`absolute w-8 h-8 text-2xl ${star.found ? 'opacity-30' : 'animate-pulse'}`}
                style={{ left: `${star.x}%`, top: `${star.y}%` }}
                onClick={() => handleStarClick(star.id)}
                disabled={star.found}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
              >
                ⭐
              </motion.button>
            ))}
            <div className="absolute bottom-4 left-4 text-white">
              Found: {(gameState.items || findActivity.items).filter((s: any) => s.found).length} / {findActivity.items.length}
            </div>
          </div>
        );

      case 'riddle':
        const riddleActivity = activity as RiddleActivity;
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-center p-4 bg-muted rounded-lg">
              {riddleActivity.description}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {riddleActivity.options.map((option: string, index: number) => (
                <Button
                  key={index}
                  onClick={() => handleRiddleAnswer(index)}
                  variant="outline"
                  className="h-16 text-lg"
                  disabled={isCompleted}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'sequence':
        const sequenceActivity = activity as SequenceActivity;
        return (
          <div className="space-y-4">
            <div className="text-center">Drag to reorder the countdown!</div>
            <div className="flex justify-center space-x-2">
              {(gameState.sequence || sequenceActivity.shuffled).map((num: number, index: number) => (
                <motion.div
                  key={index}
                  className="w-16 h-16 bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-2xl font-bold cursor-move"
                  drag
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  whileDrag={{ scale: 1.1, zIndex: 10 }}
                >
                  {num}
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'letters':
        const lettersActivity = activity as LettersActivity;
        return (
          <div className="space-y-4">
            <div className="text-center">Drag letters to spell: {lettersActivity.word}</div>
            <div className="flex justify-center space-x-2 mb-4">
              {Array(lettersActivity.word.length).fill('').map((_, index) => (
                <div
                  key={index}
                  className="w-12 h-12 border-2 border-dashed border-primary rounded-lg flex items-center justify-center text-xl font-bold"
                >
                  {(gameState.spelling || [])[index] || ''}
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-2">
              {lettersActivity.letters.map((letter: string, index: number) => (
                <motion.div
                  key={index}
                  className="w-12 h-12 bg-secondary text-secondary-foreground rounded-lg flex items-center justify-center text-xl font-bold cursor-move"
                  drag
                  whileDrag={{ scale: 1.1, zIndex: 10 }}
                >
                  {letter}
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'match':
        const matchActivity = activity as MatchActivity;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-center">Foods</h4>
                {matchActivity.pairs.map((pair: any, index: number) => (
                  <motion.button
                    key={index}
                    className="w-full p-3 bg-muted rounded-lg text-2xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {pair.item}
                  </motion.button>
                ))}
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-center">Colors</h4>
                {['Red', 'Yellow', 'Green', 'Blue'].map((color: string, index: number) => (
                  <motion.button
                    key={index}
                    className="w-full p-3 rounded-lg text-white font-medium"
                    style={{ backgroundColor: color.toLowerCase() }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {color}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Target className="w-6 h-6 mr-2 text-primary" />
                  {activity.title}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    <Star className="w-4 h-4 mr-1" />
                    {Math.round(score)}
                  </Badge>
                  {isCompleted && (
                    <Badge variant="default">
                      <Check className="w-4 h-4 mr-1" />
                      Complete!
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-muted-foreground">{activity.description}</p>
            </CardHeader>
            
            <CardContent>
              {renderActivity()}
              
              {isCompleted && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-center"
                >
                  <div className="text-2xl font-bold text-primary mb-2">
                    🎉 Activity Complete! 🎉
                  </div>
                  <div className="text-lg">
                    You earned {Math.round(score)} stars!
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MiniActivity;