import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Layout from '@/components/shared/Layout';
import { useToast } from '@/hooks/use-toast';
import MCQQuestion from '@/components/dyslexia/MCQQuestion';
import LevelNavigation from '@/components/dyslexia/LevelNavigation';
import TestResults from '@/components/dyslexia/TestResults';
import DyslexiaProgressManager from '@/utils/dyslexiaProgressManager';
import levelsData from '@/data/dyslexiaLevels.json';

interface Question {
  id: string;
  question: string;
  content: string;
  options: string[];
  correct: number;
  points: number;
}

interface Level {
  id: number;
  title: string;
  description: string;
  difficulty: number;
  category: string;
  requiredStars: number;
  questions: Question[];
  unlocked: boolean;
  completed: boolean;
  stars: number;
  bestScore: number;
}

const generateLevels = (): Level[] => {
  const progressManager = DyslexiaProgressManager.getInstance();
  
  return levelsData.levels.map(levelData => {
    const levelProgress = progressManager.getLevelProgress(levelData.id);
    
    return {
      id: levelData.id,
      title: levelData.title,
      description: levelData.description,
      difficulty: levelData.difficulty,
      category: levelData.category,
      requiredStars: levelData.requiredStars,
      questions: levelData.questions,
      unlocked: progressManager.isLevelUnlocked(levelData.id),
      completed: levelProgress?.completed || false,
      stars: levelProgress?.stars || 0,
      bestScore: levelProgress?.bestScore || 0
    };
  });
};

const DyslexiaTest: React.FC = () => {
  const { toast } = useToast();
  const [levels, setLevels] = useState<Level[]>(() => generateLevels());
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [totalStars, setTotalStars] = useState(0);
  const [testStarted, setTestStarted] = useState(false);

  useEffect(() => {
    const progressManager = DyslexiaProgressManager.getInstance();
    const userProgress = progressManager.getUserProgress();
    setTotalStars(userProgress.totalStars);
  }, []);

  const handleLevelSelect = (level: Level) => {
    if (!level.unlocked) {
      toast({
        title: "Level Locked! 🔒",
        description: `You need ${level.requiredStars} stars to unlock ${level.title}.`,
        variant: "destructive"
      });
      return;
    }
    
    setSelectedLevel(level);
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResults(false);
    setTestStarted(true);
  };

  const handleNext = () => {
    if (!selectedLevel || selectedAnswer === null) return;
    
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);
    setSelectedAnswer(null);

    if (currentQuestion + 1 >= selectedLevel.questions.length) {
      setShowResults(true);
      calculateResults(newAnswers);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const calculateResults = (finalAnswers: number[]) => {
    if (!selectedLevel) return;
    
    let correct = 0;
    
    finalAnswers.forEach((answer, index) => {
      const question = selectedLevel.questions[index];
      if (answer === question.correct) {
        correct++;
      }
    });
    
    const score = Math.round((correct / selectedLevel.questions.length) * 100);
    const stars = score >= 80 ? 3 : score >= 60 ? 2 : score >= 40 ? 1 : 0;
    
    // Update progress using the progress manager
    const progressManager = DyslexiaProgressManager.getInstance();
    progressManager.updateLevelProgress(selectedLevel.id, score, stars);
    
    // Refresh levels to reflect the updated progress
    setLevels(generateLevels());
    setTotalStars(progressManager.getUserProgress().totalStars);

    toast({
      title: `${selectedLevel.title} Complete! ${stars > 0 ? '⭐'.repeat(stars) : '🚀'}`,
      description: `Score: ${score}% - Earned ${stars} stars!`,
    });
  };

  const handleRetryLevel = () => {
    if (!selectedLevel) return;
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResults(false);
    setTestStarted(true);
  };

  const handleNextLevel = () => {
    if (!selectedLevel) return;
    const nextLevel = levels.find(l => l.id === selectedLevel.id + 1);
    if (nextLevel && nextLevel.unlocked) {
      handleLevelSelect(nextLevel);
    }
  };

  const handleBackToLevels = () => {
    setSelectedLevel(null);
    setTestStarted(false);
    setShowResults(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer(null);
  };

  // Show level navigation screen
  if (!selectedLevel || !testStarted) {
    return (
      <Layout>
        <div className="p-4 lg:p-8 max-w-7xl mx-auto min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <LevelNavigation
              levels={levels}
              currentLevel={selectedLevel}
              totalStars={totalStars}
              onLevelSelect={handleLevelSelect}
            />
          </motion.div>
        </div>
      </Layout>
    );
  }

  // Show question screen
  if (!showResults) {
    const currentQ = selectedLevel.questions[currentQuestion];
    const progressPercentage = ((currentQuestion + 1) / selectedLevel.questions.length) * 100;
    
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="p-4 lg:p-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <Button onClick={handleBackToLevels} variant="outline" className="gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  Back to Levels
                </Button>
                
                <div className="text-center">
                  <h1 className="text-2xl font-bold">{selectedLevel.title}</h1>
                  <p className="text-muted-foreground">
                    Question {currentQuestion + 1} of {selectedLevel.questions.length}
                  </p>
                </div>
                
                <div className="w-24" /> {/* Spacer for center alignment */}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-3 space-progress" />
              </div>

              {/* Question Component */}
              <AnimatePresence mode="wait">
                <MCQQuestion
                  key={currentQuestion}
                  question={currentQ}
                  selectedAnswer={selectedAnswer}
                  onAnswerSelect={setSelectedAnswer}
                  questionNumber={currentQuestion + 1}
                  totalQuestions={selectedLevel.questions.length}
                />
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <Button
                  onClick={() => {
                    if (currentQuestion > 0) {
                      setCurrentQuestion(currentQuestion - 1);
                      setSelectedAnswer(answers[currentQuestion - 1] ?? null);
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
                  className="gap-2 cosmic-button"
                >
                  {currentQuestion + 1 === selectedLevel.questions.length ? 'Complete Level' : 'Next'}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show results screen
  const correctAnswers = answers.filter((answer, index) => 
    answer === selectedLevel.questions[index].correct
  ).length;
  const score = Math.round((correctAnswers / selectedLevel.questions.length) * 100);
  const stars = score >= 80 ? 3 : score >= 60 ? 2 : score >= 40 ? 1 : 0;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="p-4 lg:p-8 max-w-4xl mx-auto">
          <TestResults
            level={selectedLevel}
            score={score}
            correctAnswers={correctAnswers}
            totalQuestions={selectedLevel.questions.length}
            stars={stars}
            onRetryLevel={handleRetryLevel}
            onNextLevel={handleNextLevel}
            onBackToLevels={handleBackToLevels}
            isLastLevel={selectedLevel.id === 20}
          />
        </div>
      </div>
    </Layout>
  );
};

export default DyslexiaTest;