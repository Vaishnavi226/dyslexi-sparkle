import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Layout from '@/components/shared/Layout';

interface Question {
  id: number;
  type: 'word-recognition' | 'letter-confusion' | 'phonics' | 'reading-speed';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  timeLimit?: number;
}

const testQuestions: Question[] = [
  {
    id: 1,
    type: 'letter-confusion',
    question: 'Which letter is different?',
    options: ['b', 'b', 'd', 'b'],
    correctAnswer: 2
  },
  {
    id: 2,
    type: 'word-recognition',
    question: 'Select the word that matches the sound: /kat/',
    options: ['cat', 'bat', 'hat', 'rat'],
    correctAnswer: 0
  },
  {
    id: 3,
    type: 'phonics',
    question: 'What sound does "ch" make in "chair"?',
    options: ['/k/', '/ch/', '/sh/', '/th/'],
    correctAnswer: 1
  },
  {
    id: 4,
    type: 'letter-confusion',
    question: 'Which letters are the same?',
    options: ['p', 'q', 'p', 'b'],
    correctAnswer: 'p'
  },
  {
    id: 5,
    type: 'reading-speed',
    question: 'Read this word quickly: "beautiful"',
    options: ['beautiful', 'beatiful', 'beutiful', 'beautifull'],
    correctAnswer: 0,
    timeLimit: 3000
  }
];

const DyslexiaTest: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | string)[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const question = testQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / testQuestions.length) * 100;

  useEffect(() => {
    if (question?.timeLimit) {
      setTimeLeft(question.timeLimit);
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev && prev <= 1000) {
            clearInterval(timer);
            handleNext();
            return 0;
          }
          return prev ? prev - 100 : 0;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [currentQuestion]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer ?? -1;
    setAnswers(newAnswers);
    setSelectedAnswer(null);

    if (currentQuestion + 1 >= testQuestions.length) {
      setIsComplete(true);
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

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setIsComplete(false);
    setSelectedAnswer(null);
    setTimeLeft(null);
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === testQuestions[index].correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / testQuestions.length) * 100);
  };

  const getRecommendations = (score: number) => {
    if (score >= 80) {
      return {
        level: 'Excellent',
        color: 'text-green-600',
        recommendations: [
          'Continue with advanced reading exercises',
          'Try complex vocabulary building',
          'Practice speed reading techniques'
        ]
      };
    } else if (score >= 60) {
      return {
        level: 'Good',
        color: 'text-blue-600',
        recommendations: [
          'Focus on phonics practice',
          'Use spelling world regularly',
          'Practice with flash cards'
        ]
      };
    } else {
      return {
        level: 'Needs Support',
        color: 'text-orange-600',
        recommendations: [
          'Start with letter recognition exercises',
          'Use voice practice for pronunciation',
          'Work with a learning specialist',
          'Practice 15 minutes daily'
        ]
      };
    }
  };

  if (isComplete) {
    const score = calculateScore();
    const recommendations = getRecommendations(score);

    return (
      <Layout>
        <div className="p-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass">
              <CardHeader className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                </motion.div>
                <CardTitle className="text-3xl font-bold">Test Complete!</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center"
                >
                  <div className="text-6xl font-bold text-primary mb-2">{score}%</div>
                  <div className={`text-xl font-semibold ${recommendations.color}`}>
                    {recommendations.level}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-muted/50 rounded-lg p-6"
                >
                  <h3 className="text-lg font-semibold mb-4">Recommendations:</h3>
                  <ul className="space-y-2">
                    {recommendations.recommendations.map((rec, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="flex items-center space-x-2"
                      >
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span>{rec}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  className="flex justify-center space-x-4"
                >
                  <Button onClick={handleRestart} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Take Again
                  </Button>
                  <Button onClick={() => window.history.back()}>
                    Back to Dashboard
                  </Button>
                </motion.div>
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
                <CardTitle className="text-2xl font-bold">
                  Dyslexia Assessment
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {testQuestions.length}
                </div>
              </div>
              <Progress value={progress} className="mt-4" />
              {timeLeft && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span>Time remaining:</span>
                    <span className={timeLeft < 1000 ? 'text-destructive font-bold' : ''}>
                      {Math.ceil(timeLeft / 1000)}s
                    </span>
                  </div>
                  <Progress value={(timeLeft / (question.timeLimit || 1)) * 100} className="h-1 mt-1" />
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
                  <h3 className="text-xl font-semibold">{question.question}</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {question.options?.map((option, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswerSelect(index)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 text-lg font-medium ${
                          selectedAnswer === index
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50 hover:bg-accent'
                        }`}
                      >
                        {option}
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
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={selectedAnswer === null}
                  className="ml-auto"
                >
                  {currentQuestion + 1 === testQuestions.length ? 'Finish' : 'Next'}
                  <ChevronRight className="w-4 h-4 ml-2" />
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