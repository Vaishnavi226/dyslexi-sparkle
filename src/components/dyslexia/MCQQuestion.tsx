import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Question {
  id: string;
  question: string;
  content: string;
  options: string[];
  correct: number;
  points: number;
}

interface MCQQuestionProps {
  question: Question;
  selectedAnswer: number | null;
  onAnswerSelect: (answerIndex: number) => void;
  questionNumber: number;
  totalQuestions: number;
}

const MCQQuestion: React.FC<MCQQuestionProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  questionNumber,
  totalQuestions
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="cosmic-card w-full max-w-2xl mx-auto">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Question {questionNumber} of {totalQuestions}
            </span>
            <span className="text-sm font-medium text-accent">
              {question.points} points
            </span>
          </div>
          <CardTitle className="text-xl lg:text-2xl">{question.question}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl lg:text-6xl font-bold text-primary mb-6 p-6 rounded-xl bg-primary/10 min-h-[120px] flex items-center justify-center">
              {question.content}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {question.options.map((option, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => onAnswerSelect(index)}
                  variant={selectedAnswer === index ? "default" : "outline"}
                  className={`w-full h-16 text-lg font-medium transition-all duration-200 ${
                    selectedAnswer === index 
                      ? 'ring-2 ring-primary shadow-lg cosmic-button' 
                      : 'hover:shadow-md hover:border-primary/50'
                  }`}
                  size="lg"
                >
                  {option}
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MCQQuestion;