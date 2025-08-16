import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  CheckCircle, 
  Star, 
  Trophy, 
  Rocket, 
  Zap,
  Target,
  Brain,
  Sparkles,
  Award,
  Lock,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/shared/Layout';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: number;
  type: 'word-recognition' | 'letter-confusion' | 'phonics' | 'reading-speed' | 'comprehension' | 'sequence';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  timeLimit?: number;
  difficulty: number;
  points: number;
}

interface Level {
  id: number;
  name: string;
  description: string;
  difficulty: number;
  requiredStars: number;
  icon: React.ComponentType<any>;
  questions: Question[];
  unlocked: boolean;
  completed: boolean;
  stars: number;
  bestScore: number;
}

// Generate 20 levels with increasing difficulty
const generateLevels = (): Level[] => {
  const levels: Level[] = [];
  
  const questionTypes = ['word-recognition', 'letter-confusion', 'phonics', 'reading-speed', 'comprehension', 'sequence'] as const;
  const icons = [Rocket, Star, Brain, Zap, Target, Trophy, Sparkles, Award];
  
  for (let i = 1; i <= 20; i++) {
    const difficulty = Math.ceil(i / 4); // 1-5 difficulty scale
    const questions: Question[] = [];
    
    // Generate 5 questions per level
    for (let q = 1; q <= 5; q++) {
      const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      let question: Question;
      
      switch (type) {
        case 'letter-confusion':
          question = {
            id: q,
            type,
            question: `Level ${i}: Which letter is different?`,
            options: difficulty <= 2 ? ['b', 'b', 'd', 'b'] : ['p', 'q', 'p', 'b'],
            correctAnswer: 2,
            difficulty,
            points: 10 * difficulty,
            timeLimit: difficulty >= 3 ? 5000 - (difficulty * 500) : undefined
          };
          break;
          
        case 'word-recognition':
          const words = [
            { word: 'cat', sound: '/kat/', options: ['cat', 'bat', 'hat', 'rat'] },
            { word: 'dog', sound: '/dog/', options: ['dog', 'log', 'fog', 'hog'] },
            { word: 'tree', sound: '/tree/', options: ['tree', 'free', 'three', 'flee'] },
            { word: 'house', sound: '/house/', options: ['house', 'mouse', 'horse', 'course'] },
            { word: 'beautiful', sound: '/beautiful/', options: ['beautiful', 'beatiful', 'beutiful', 'beautifull'] }
          ];
          const wordData = words[Math.min(difficulty - 1, words.length - 1)];
          question = {
            id: q,
            type,
            question: `Level ${i}: Select the word that matches: ${wordData.sound}`,
            options: wordData.options,
            correctAnswer: 0,
            difficulty,
            points: 15 * difficulty,
            timeLimit: difficulty >= 4 ? 6000 - (difficulty * 400) : undefined
          };
          break;
          
        case 'phonics':
          const phonics = [
            { sound: 'ch', word: 'chair', options: ['/k/', '/ch/', '/sh/', '/th/'], correct: 1 },
            { sound: 'sh', word: 'ship', options: ['/s/', '/sh/', '/ch/', '/th/'], correct: 1 },
            { sound: 'th', word: 'think', options: ['/t/', '/th/', '/f/', '/s/'], correct: 1 },
            { sound: 'ph', word: 'phone', options: ['/p/', '/f/', '/ph/', '/h/'], correct: 1 },
            { sound: 'ough', word: 'rough', options: ['/uf/', '/ough/', '/of/', '/aff/'], correct: 0 }
          ];
          const phonicData = phonics[Math.min(difficulty - 1, phonics.length - 1)];
          question = {
            id: q,
            type,
            question: `Level ${i}: What sound does "${phonicData.sound}" make in "${phonicData.word}"?`,
            options: phonicData.options,
            correctAnswer: phonicData.correct,
            difficulty,
            points: 20 * difficulty
          };
          break;
          
        case 'reading-speed':
          const speedWords = ['cat', 'house', 'beautiful', 'extraordinary', 'incomprehensible'];
          const word = speedWords[Math.min(difficulty - 1, speedWords.length - 1)];
          question = {
            id: q,
            type,
            question: `Level ${i}: Read this word quickly: "${word}"`,
            options: [word, word.slice(0, -1), word + 'e', word.replace('a', 'e')],
            correctAnswer: 0,
            difficulty,
            points: 25 * difficulty,
            timeLimit: Math.max(2000, 4000 - (difficulty * 300))
          };
          break;
          
        case 'comprehension':
          const stories = [
            { text: 'The cat sat on the mat.', question: 'Where did the cat sit?', options: ['chair', 'mat', 'floor', 'bed'], correct: 1 },
            { text: 'Tom ran to school because he was late.', question: 'Why did Tom run?', options: ['exercise', 'fun', 'late', 'race'], correct: 2 },
            { text: 'The red car drove slowly down the hill.', question: 'What color was the car?', options: ['blue', 'red', 'green', 'yellow'], correct: 1 }
          ];
          const story = stories[Math.min(difficulty - 1, stories.length - 1)];
          question = {
            id: q,
            type,
            question: `Level ${i}: ${story.text} - ${story.question}`,
            options: story.options,
            correctAnswer: story.correct,
            difficulty,
            points: 30 * difficulty
          };
          break;
          
        case 'sequence':
          const sequences = [
            { sequence: ['First', 'Second', '?', 'Fourth'], options: ['Third', 'Fifth', 'Zero', 'Last'], correct: 0 },
            { sequence: ['A', 'B', '?', 'D'], options: ['C', 'E', 'F', 'G'], correct: 0 },
            { sequence: ['Monday', 'Tuesday', '?', 'Thursday'], options: ['Wednesday', 'Friday', 'Sunday', 'Saturday'], correct: 0 }
          ];
          const seq = sequences[Math.min(difficulty - 1, sequences.length - 1)];
          question = {
            id: q,
            type,
            question: `Level ${i}: What comes next? ${seq.sequence.join(' → ')}`,
            options: seq.options,
            correctAnswer: seq.correct,
            difficulty,
            points: 20 * difficulty
          };
          break;
          
        default:
          question = {
            id: q,
            type: 'word-recognition',
            question: `Level ${i}: Default question`,
            options: ['a', 'b', 'c', 'd'],
            correctAnswer: 0,
            difficulty,
            points: 10
          };
      }
      
      questions.push(question);
    }
    
    levels.push({
      id: i,
      name: `Cosmic Level ${i}`,
      description: `Master ${['basic', 'intermediate', 'advanced', 'expert', 'legendary'][difficulty - 1]} space challenges`,
      difficulty,
      requiredStars: Math.max(0, (i - 1) * 2),
      icon: icons[Math.floor(Math.random() * icons.length)],
      questions,
      unlocked: i === 1,
      completed: false,
      stars: 0,
      bestScore: 0
    });
  }
  
  return levels;
};

const DyslexiaTest: React.FC = () => {
  const { userProgress, updateProgress, addXP, addBadge } = useGame();
  const { toast } = useToast();
  const [levels, setLevels] = useState<Level[]>(() => generateLevels());
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | string)[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [totalStars, setTotalStars] = useState(0);

  useEffect(() => {
    const completed = levels.filter(l => l.completed).length;
    const stars = levels.reduce((sum, l) => sum + l.stars, 0);
    setTotalStars(stars);
    
    // Unlock levels based on stars
    setLevels(prev => prev.map(level => ({
      ...level,
      unlocked: level.id === 1 || stars >= level.requiredStars
    })));
  }, [levels]);

  useEffect(() => {
    if (selectedLevel && selectedLevel.questions[currentQuestion]?.timeLimit) {
      const timeLimit = selectedLevel.questions[currentQuestion].timeLimit!;
      setTimeLeft(timeLimit);
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev && prev <= 100) {
            clearInterval(timer);
            handleNext();
            return 0;
          }
          return prev ? prev - 100 : 0;
        });
      }, 100);
      
      return () => clearInterval(timer);
    }
  }, [currentQuestion, selectedLevel]);

  const handleLevelSelect = (level: Level) => {
    if (!level.unlocked) {
      toast({
        title: "Level Locked! 🔒",
        description: `You need ${level.requiredStars} stars to unlock this level.`,
        variant: "destructive"
      });
      return;
    }
    
    setSelectedLevel(level);
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResults(false);
    setTimeLeft(null);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (!selectedLevel) return;
    
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer ?? -1;
    setAnswers(newAnswers);
    setSelectedAnswer(null);

    if (currentQuestion + 1 >= selectedLevel.questions.length) {
      setShowResults(true);
      calculateResults(newAnswers);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] as number ?? null);
    }
  };

  const calculateResults = (finalAnswers: (number | string)[]) => {
    if (!selectedLevel) return;
    
    let correct = 0;
    let totalPoints = 0;
    
    finalAnswers.forEach((answer, index) => {
      const question = selectedLevel.questions[index];
      if (answer === question.correctAnswer) {
        correct++;
        totalPoints += question.points;
      }
    });
    
    const score = Math.round((correct / selectedLevel.questions.length) * 100);
    const stars = score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0;
    
    // Update level progress
    setLevels(prev => prev.map(level => {
      if (level.id === selectedLevel.id) {
        const wasCompleted = level.completed;
        const updatedLevel = {
          ...level,
          completed: true,
          stars: Math.max(level.stars, stars),
          bestScore: Math.max(level.bestScore, score)
        };
        
        // Add XP and badges for new completion or improvement
        if (!wasCompleted || stars > level.stars) {
          addXP(totalPoints);
          
          if (stars === 3) {
            addBadge(`perfect-${level.id}`);
          }
        }
        
        return updatedLevel;
      }
      return level;
    }));

    // Update progress context
    updateProgress('dyslexiaTest', {
      ...userProgress.dyslexiaTest,
      level: Math.max(userProgress.dyslexiaTest.level, selectedLevel.id),
      score: Math.max(userProgress.dyslexiaTest.score, score),
      stars: totalStars + (stars > selectedLevel.stars ? stars - selectedLevel.stars : 0)
    });

    toast({
      title: `Level Complete! ${stars > 0 ? '⭐'.repeat(stars) : '🚀'}`,
      description: `Score: ${score}% - Earned ${totalPoints} XP`,
    });
  };

  const backToLevels = () => {
    setSelectedLevel(null);
    setShowResults(false);
  };

  const restartLevel = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResults(false);
    setTimeLeft(null);
  };

  // Level Selection View
  if (!selectedLevel) {
    return (
      <Layout>
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center"
              >
                <div className="cosmic-card p-6 rounded-2xl">
                  <Brain className="w-16 h-16 text-accent mx-auto mb-4" />
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Cosmic Dyslexia Journey
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Master reading skills across 20 galactic levels
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      <Star className="w-4 h-4 mr-2" />
                      {totalStars} Stars Collected
                    </Badge>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {levels.filter(l => l.completed).length}/20 Levels
                    </Badge>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Levels Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {levels.map((level, index) => {
                const IconComponent = level.icon;
                return (
                  <motion.div
                    key={level.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: level.unlocked ? 1.05 : 1 }}
                    whileTap={{ scale: level.unlocked ? 0.95 : 1 }}
                  >
                    <Card 
                      className={`
                        cursor-pointer transition-all duration-300 h-full
                        ${level.unlocked 
                          ? 'cosmic-card hover:shadow-lg hover:shadow-primary/25' 
                          : 'opacity-50 bg-muted/20'
                        }
                        ${level.completed ? 'ring-2 ring-success' : ''}
                      `}
                      onClick={() => handleLevelSelect(level)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {level.unlocked ? (
                              <IconComponent className="w-6 h-6 text-accent" />
                            ) : (
                              <Lock className="w-6 h-6 text-muted-foreground" />
                            )}
                            <span className="font-bold text-lg">{level.id}</span>
                          </div>
                          {level.completed && (
                            <div className="flex">
                              {Array.from({ length: level.stars }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className="w-4 h-4 text-yellow-400 fill-current" 
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <CardTitle className="text-sm">{level.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground mb-3">
                          {level.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Difficulty:</span>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < level.difficulty 
                                      ? 'text-orange-400 fill-current' 
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {!level.unlocked && (
                            <div className="text-xs text-muted-foreground">
                              Requires {level.requiredStars} ⭐
                            </div>
                          )}
                          {level.completed && (
                            <div className="text-xs text-success font-medium">
                              Best: {level.bestScore}%
                            </div>
                          )}
                        </div>
                        {level.unlocked && (
                          <Button 
                            size="sm" 
                            className="w-full mt-3 cosmic-button"
                            variant={level.completed ? "outline" : "default"}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            {level.completed ? 'Replay' : 'Start'}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  // Results View
  if (showResults) {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === selectedLevel.questions[index].correctAnswer) {
        correct++;
      }
    });
    
    const score = Math.round((correct / selectedLevel.questions.length) * 100);
    const stars = score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0;
    
    return (
      <Layout>
        <div className="p-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="cosmic-card">
              <CardHeader className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                </motion.div>
                <CardTitle className="text-3xl font-bold">
                  {selectedLevel.name} Complete!
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center"
                >
                  <div className="text-6xl font-bold text-primary mb-2">{score}%</div>
                  <div className="flex justify-center mb-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Star 
                        key={i}
                        className={`w-8 h-8 mx-1 ${
                          i < stars 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {correct}/{selectedLevel.questions.length} Correct
                  </Badge>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex justify-center space-x-4"
                >
                  <Button onClick={restartLevel} variant="outline" className="cosmic-button">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Button onClick={backToLevels} className="cosmic-button">
                    <Rocket className="w-4 h-4 mr-2" />
                    Back to Levels
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  // Question View
  const question = selectedLevel.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / selectedLevel.questions.length) * 100;

  return (
    <Layout>
      <div className="p-4 lg:p-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="cosmic-card">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={backToLevels}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Levels
                  </Button>
                  <div className="h-4 w-px bg-border" />
                  <h2 className="text-xl font-bold">{selectedLevel.name}</h2>
                </div>
                <div className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {selectedLevel.questions.length}
                </div>
              </div>
              
              <Progress value={progress} className="space-progress h-3" />
              
              {timeLeft && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span>Time remaining:</span>
                    <span className={`font-bold ${timeLeft < 1000 ? 'text-destructive' : 'text-accent'}`}>
                      {Math.ceil(timeLeft / 1000)}s
                    </span>
                  </div>
                  <Progress 
                    value={(timeLeft / (question.timeLimit || 1)) * 100} 
                    className="h-2 mt-1" 
                  />
                </motion.div>
              )}
            </CardHeader>

            <CardContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">{question.question}</h3>
                    <Badge variant="outline" className="mb-4">
                      {question.points} points • {question.type.replace('-', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.options?.map((option, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswerSelect(index)}
                        className={`
                          p-4 rounded-lg border-2 transition-all duration-200 text-lg font-medium
                          ${selectedAnswer === index
                            ? 'border-primary bg-primary/20 text-primary shadow-lg shadow-primary/25' 
                            : 'border-border hover:border-primary/50 hover:bg-accent/10 cosmic-card'
                          }
                        `}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span>{option}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-between mt-8">
                <Button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  variant="outline"
                  className="cosmic-button"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={selectedAnswer === null}
                  className="cosmic-button"
                >
                  {currentQuestion + 1 === selectedLevel.questions.length ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Finish
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default DyslexiaTest;