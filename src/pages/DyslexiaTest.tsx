import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  CheckCircle, 
  Star, 
  Trophy, 
  Rocket, 
  Target,
  Brain,
  Sparkles,
  Lock,
  Play,
  Globe,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/shared/Layout';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/hooks/use-toast';
import QuestionPoolManager from '@/utils/questionPoolManager';

interface Question {
  id: string;
  type: string;
  difficulty: number;
  question: string;
  content: string;
  options: string[];
  correct: number;
  points: number;
  category: string;
  used: boolean;
}

interface Level {
  id: number;
  name: string;
  description: string;
  difficulty: number;
  requiredStars: number;
  icon: React.ComponentType<any>;
  theme: string;
  questions: Question[];
  unlocked: boolean;
  completed: boolean;
  stars: number;
  bestScore: number;
}

const spaceThemes = [
  { name: "Mercury Station", icon: Rocket },
  { name: "Venus Outpost", icon: Star },
  { name: "Earth Base", icon: Globe },
  { name: "Mars Colony", icon: Target },
  { name: "Jupiter Station", icon: Sparkles },
  { name: "Saturn Rings", icon: Trophy },
  { name: "Uranus Portal", icon: Brain },
  { name: "Neptune Deep", icon: Zap },
  { name: "Pluto Edge", icon: Rocket },
  { name: "Moon Base", icon: Star },
  { name: "Asteroid Belt", icon: Target },
  { name: "Comet Trail", icon: Sparkles },
  { name: "Galaxy Core", icon: Brain },
  { name: "Black Hole", icon: Trophy },
  { name: "Space Station", icon: Rocket },
  { name: "Alpha Centauri", icon: Star },
  { name: "Andromeda", icon: Globe },
  { name: "Milky Way", icon: Sparkles },
  { name: "Nebula Cloud", icon: Brain },
  { name: "Cosmic Journey", icon: Trophy }
];

const generateLevels = (): Level[] => {
  const levels: Level[] = [];
  const questionPool = QuestionPoolManager.getInstance();
  
  for (let i = 1; i <= 20; i++) {
    const theme = spaceThemes[i - 1];
    const difficulty = Math.ceil(i / 4);
    const questions = questionPool.getUniqueQuestions(i, 5);
    
    levels.push({
      id: i,
      name: theme.name,
      description: `Explore ${theme.name} and master reading challenges`,
      difficulty,
      requiredStars: Math.max(0, (i - 1) * 2),
      icon: theme.icon,
      theme: theme.name,
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
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [totalStars, setTotalStars] = useState(0);

  useEffect(() => {
    const stars = levels.reduce((sum, l) => sum + l.stars, 0);
    setTotalStars(stars);
    
    setLevels(prev => prev.map(level => ({
      ...level,
      unlocked: level.id === 1 || stars >= level.requiredStars
    })));
  }, [levels]);

  const handleLevelSelect = (level: Level) => {
    if (!level.unlocked) {
      toast({
        title: "Level Locked! 🔒",
        description: `You need ${level.requiredStars} stars to unlock ${level.name}.`,
        variant: "destructive"
      });
      return;
    }
    
    const questionPool = QuestionPoolManager.getInstance();
    const freshQuestions = questionPool.getUniqueQuestions(level.id, 5);
    
    setSelectedLevel({ ...level, questions: freshQuestions });
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResults(false);
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

  const calculateResults = (finalAnswers: (number | string)[]) => {
    if (!selectedLevel) return;
    
    let correct = 0;
    let totalPoints = 0;
    
    finalAnswers.forEach((answer, index) => {
      const question = selectedLevel.questions[index];
      if (answer === question.correct) {
        correct++;
        totalPoints += question.points;
      }
    });
    
    const score = Math.round((correct / selectedLevel.questions.length) * 100);
    const stars = score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0;
    
    setLevels(prev => prev.map(level => {
      if (level.id === selectedLevel.id) {
        const wasCompleted = level.completed;
        const updatedLevel = {
          ...level,
          completed: true,
          stars: Math.max(level.stars, stars),
          bestScore: Math.max(level.bestScore, score)
        };
        
        if (!wasCompleted || stars > level.stars) {
          addXP(totalPoints);
          if (stars === 3) {
            addBadge(`${level.theme}-perfect`);
          }
        }
        
        return updatedLevel;
      }
      return level;
    }));

    updateProgress('dyslexiaTest', {
      ...userProgress.dyslexiaTest,
      level: Math.max(userProgress.dyslexiaTest.level, selectedLevel.id),
      score: Math.max(userProgress.dyslexiaTest.score, score),
      stars: totalStars + (stars > selectedLevel.stars ? stars - selectedLevel.stars : 0),
      accuracy: Math.round((correct / selectedLevel.questions.length) * 100)
    });

    toast({
      title: `${selectedLevel.name} Complete! ${stars > 0 ? '⭐'.repeat(stars) : '🚀'}`,
      description: `Score: ${score}% - Earned ${totalPoints} XP`,
    });
  };

  if (!selectedLevel) {
    return (
      <Layout>
        <div className="p-4 lg:p-8 max-w-7xl mx-auto min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-6">
              <div className="cosmic-card p-8 rounded-3xl">
                <Brain className="w-20 h-20 text-accent mx-auto mb-6" />
                <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-4">
                  Cosmic Reading Quest
                </h1>
                <p className="text-xl text-muted-foreground mb-6">
                  Journey through 20 galactic levels and become a reading master!
                </p>
                <div className="flex items-center justify-center gap-6 flex-wrap">
                  <Badge variant="secondary" className="text-lg px-6 py-3">
                    <Star className="w-5 h-5 mr-2" />
                    {totalStars} Cosmic Stars
                  </Badge>
                  <Badge variant="outline" className="text-lg px-6 py-3">
                    <Trophy className="w-5 h-5 mr-2" />
                    {levels.filter(l => l.completed).length}/20 Missions
                  </Badge>
                </div>
              </div>
            </div>

            <div className="cosmic-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Mission Progress</h2>
                <div className="text-lg font-medium">
                  {Math.round((levels.filter(l => l.completed).length / 20) * 100)}% Complete
                </div>
              </div>
              <Progress value={(levels.filter(l => l.completed).length / 20) * 100} className="h-3" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {levels.map((level, index) => {
                const IconComponent = level.icon;
                return (
                  <motion.div
                    key={level.id}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: level.unlocked ? 1.05 : 1, y: level.unlocked ? -5 : 0 }}
                  >
                    <Card 
                      className={`
                        cursor-pointer transition-all duration-300 h-full overflow-hidden
                        ${level.unlocked 
                          ? 'cosmic-card hover:shadow-xl hover:shadow-primary/30' 
                          : 'opacity-60 bg-muted/20'
                        }
                        ${level.completed ? 'ring-2 ring-accent shadow-lg' : ''}
                      `}
                      onClick={() => handleLevelSelect(level)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-accent">
                              {level.unlocked ? (
                                <IconComponent className="w-6 h-6 text-white" />
                              ) : (
                                <Lock className="w-6 h-6 text-gray-500" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-lg">{level.id}</div>
                            </div>
                          </div>
                          {level.completed && (
                            <div className="flex">
                              {Array.from({ length: level.stars }).map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          )}
                        </div>
                        <CardTitle className="text-sm font-semibold">{level.name}</CardTitle>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground mb-4">{level.description}</p>
                        
                        {!level.unlocked && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Requires {level.requiredStars} ⭐
                          </div>
                        )}
                        
                        {level.completed && (
                          <div className="text-xs text-accent font-medium flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Best: {level.bestScore}%
                          </div>
                        )}
                        
                        {level.unlocked && !level.completed && (
                          <div className="text-xs text-primary font-medium flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            Ready to explore!
                          </div>
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

  if (!showResults) {
    const currentQ = selectedLevel.questions[currentQuestion];
    
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="p-4 lg:p-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <Button onClick={() => setSelectedLevel(null)} variant="outline" className="gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  Back to Galaxy
                </Button>
                
                <div className="text-center">
                  <h1 className="text-2xl font-bold">{selectedLevel.name}</h1>
                  <p className="text-muted-foreground">
                    Question {currentQuestion + 1} of {selectedLevel.questions.length}
                  </p>
                </div>
                
                <Badge variant="secondary">{currentQ.points} points</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(((currentQuestion + 1) / selectedLevel.questions.length) * 100)}%</span>
                </div>
                <Progress value={((currentQuestion + 1) / selectedLevel.questions.length) * 100} />
              </div>

              <Card className="cosmic-card">
                <CardHeader>
                  <CardTitle className="text-xl text-center">{currentQ.question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-4 p-6 rounded-xl bg-primary/10">
                      {currentQ.content}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentQ.options.map((option, index) => (
                      <Button
                        key={index}
                        onClick={() => setSelectedAnswer(index)}
                        variant={selectedAnswer === index ? "default" : "outline"}
                        className={`w-full h-16 text-lg font-medium ${
                          selectedAnswer === index ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
                        }`}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button
                  onClick={() => {
                    if (currentQuestion > 0) {
                      setCurrentQuestion(currentQuestion - 1);
                      setSelectedAnswer(answers[currentQuestion - 1] as number ?? null);
                    }
                  }}
                  disabled={currentQuestion === 0}
                  variant="outline"
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={selectedAnswer === null}
                  className="gap-2"
                >
                  {currentQuestion + 1 === selectedLevel.questions.length ? 'Complete Mission' : 'Next'}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

  const correctAnswers = answers.filter((answer, index) => 
    answer === selectedLevel.questions[index].correct
  ).length;
  const score = Math.round((correctAnswers / selectedLevel.questions.length) * 100);
  const stars = score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="p-4 lg:p-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 text-center"
          >
            <div className="cosmic-card p-8 rounded-3xl">
              <div className="text-8xl mb-4">🚀</div>
              <h1 className="text-4xl font-bold mb-2">Mission Complete!</h1>
              <h2 className="text-2xl text-primary mb-4">{selectedLevel.name}</h2>
              
              <div className="flex justify-center gap-2 mb-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Star 
                    key={i}
                    className={`w-12 h-12 ${
                      i < stars ? 'text-yellow-400 fill-current' : 'text-muted-foreground'
                    }`} 
                  />
                ))}
              </div>
              
              <div className="text-6xl font-bold text-primary mb-2">{score}%</div>
              <div className="text-xl text-muted-foreground">
                {correctAnswers} out of {selectedLevel.questions.length} correct
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => setSelectedLevel(null)} size="lg" className="gap-2">
                <Star className="w-5 h-5" />
                Return to Galaxy
              </Button>
              <Button 
                onClick={() => {
                  const questionPool = QuestionPoolManager.getInstance();
                  const freshQuestions = questionPool.getUniqueQuestions(selectedLevel.id, 5);
                  setSelectedLevel({ ...selectedLevel, questions: freshQuestions });
                  setCurrentQuestion(0);
                  setAnswers([]);
                  setSelectedAnswer(null);
                  setShowResults(false);
                }} 
                variant="outline" 
                size="lg" 
                className="gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Retry Mission
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default DyslexiaTest;