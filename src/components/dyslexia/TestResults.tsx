import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, RotateCcw, ArrowRight, Trophy, Target } from 'lucide-react';

interface Level {
  id: number;
  title: string;
  description: string;
}

interface TestResultsProps {
  level: Level;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  stars: number;
  onRetryLevel: () => void;
  onNextLevel: () => void;
  onBackToLevels: () => void;
  isLastLevel?: boolean;
}

const TestResults: React.FC<TestResultsProps> = ({
  level,
  score,
  correctAnswers,
  totalQuestions,
  stars,
  onRetryLevel,
  onNextLevel,
  onBackToLevels,
  isLastLevel = false
}) => {
  const getRecommendation = () => {
    if (score >= 80) {
      return {
        emoji: "🚀",
        title: "Excellent Work!",
        message: "You are ready for the next level!",
        color: "text-success"
      };
    } else if (score >= 60) {
      return {
        emoji: "⭐",
        title: "Good Try!",
        message: "Review and try again to master this level.",
        color: "text-warning"
      };
    } else {
      return {
        emoji: "💡",
        title: "Keep Practicing!",
        message: "Let's practice again before moving ahead.",
        color: "text-muted-foreground"
      };
    }
  };

  const recommendation = getRecommendation();
  const canProceed = score >= 60;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Main Results Card */}
      <Card className="cosmic-card">
        <CardContent className="p-8 text-center space-y-6">
          <div className="text-6xl mb-4">{recommendation.emoji}</div>
          
          <div>
            <h1 className="text-3xl font-bold mb-2">Level Complete!</h1>
            <h2 className="text-xl text-primary mb-4">{level.title}</h2>
          </div>

          {/* Stars Display */}
          <div className="flex justify-center gap-2 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.2 + 0.5 }}
              >
                <Star 
                  className={`w-12 h-12 ${
                    i < stars ? 'text-yellow-400 fill-current' : 'text-muted-foreground'
                  }`} 
                />
              </motion.div>
            ))}
          </div>

          {/* Score Display */}
          <div className="space-y-2">
            <div className="text-5xl font-bold text-primary">{score}%</div>
            <div className="text-lg text-muted-foreground">
              {correctAnswers} out of {totalQuestions} correct
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-muted/20 rounded-xl p-4">
            <h3 className={`text-lg font-semibold mb-2 ${recommendation.color}`}>
              {recommendation.title}
            </h3>
            <p className="text-muted-foreground">
              {recommendation.message}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          onClick={onBackToLevels} 
          variant="outline" 
          size="lg" 
          className="gap-2"
        >
          <Target className="w-5 h-5" />
          Choose Level
        </Button>

        <Button 
          onClick={onRetryLevel}
          variant="outline" 
          size="lg" 
          className="gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Try Again
        </Button>

        {canProceed && !isLastLevel && (
          <Button 
            onClick={onNextLevel}
            size="lg" 
            className="gap-2 cosmic-button"
          >
            <ArrowRight className="w-5 h-5" />
            Next Level
          </Button>
        )}

        {isLastLevel && (
          <Button 
            onClick={onBackToLevels}
            size="lg" 
            className="gap-2 cosmic-button"
          >
            <Trophy className="w-5 h-5" />
            All Complete!
          </Button>
        )}
      </div>

      {/* Congratulations for completing all levels */}
      {isLastLevel && score >= 60 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Card className="cosmic-card border-2 border-accent">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-accent mb-2">
                Congratulations!
              </h3>
              <p className="text-muted-foreground">
                You have completed all 20 levels! You are now a Reading Master!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TestResults;