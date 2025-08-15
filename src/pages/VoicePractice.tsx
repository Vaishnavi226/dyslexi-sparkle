import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, Play, Square, RotateCcw, CheckCircle, XCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Layout from '@/components/shared/Layout';
import { useGame } from '@/contexts/GameContext';
import { SpeechUtils } from '@/utils/speechUtils';
import { triggerConfetti, triggerStarConfetti } from '@/utils/confetti';

interface VoiceExercise {
  id: number;
  type: 'word-repeat' | 'picture-describe' | 'phoneme-practice' | 'sentence-read';
  level: number;
  instruction: string;
  targetText: string;
  image?: string;
  phoneme?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  minAccuracy: number;
}

const voiceExercises: VoiceExercise[] = [
  // Level 1 - Easy word repetition
  { id: 1, type: 'word-repeat', level: 1, instruction: 'Listen and repeat this word:', targetText: 'cat', difficulty: 'easy', minAccuracy: 70 },
  { id: 2, type: 'word-repeat', level: 1, instruction: 'Listen and repeat this word:', targetText: 'dog', difficulty: 'easy', minAccuracy: 70 },
  { id: 3, type: 'word-repeat', level: 1, instruction: 'Listen and repeat this word:', targetText: 'ball', difficulty: 'easy', minAccuracy: 70 },
  
  // Level 2 - Phoneme practice
  { id: 4, type: 'phoneme-practice', level: 2, instruction: 'Say this sound:', targetText: '/th/', phoneme: 'th', difficulty: 'medium', minAccuracy: 60 },
  { id: 5, type: 'phoneme-practice', level: 2, instruction: 'Say this sound:', targetText: '/ch/', phoneme: 'ch', difficulty: 'medium', minAccuracy: 60 },
  { id: 6, type: 'phoneme-practice', level: 2, instruction: 'Say this sound:', targetText: '/sh/', phoneme: 'sh', difficulty: 'medium', minAccuracy: 60 },
  
  // Level 3 - Picture description
  { id: 7, type: 'picture-describe', level: 3, instruction: 'Describe what you see:', targetText: 'red apple', image: '🍎', difficulty: 'medium', minAccuracy: 60 },
  { id: 8, type: 'picture-describe', level: 3, instruction: 'Describe what you see:', targetText: 'blue car', image: '🚗', difficulty: 'medium', minAccuracy: 60 },
  { id: 9, type: 'picture-describe', level: 3, instruction: 'Describe what you see:', targetText: 'big house', image: '🏠', difficulty: 'medium', minAccuracy: 60 },
  
  // Level 4 - Sentence reading
  { id: 10, type: 'sentence-read', level: 4, instruction: 'Read this sentence:', targetText: 'The cat sits on the mat', difficulty: 'hard', minAccuracy: 50 },
  { id: 11, type: 'sentence-read', level: 4, instruction: 'Read this sentence:', targetText: 'I like to play with my friends', difficulty: 'hard', minAccuracy: 50 },
  { id: 12, type: 'sentence-read', level: 4, instruction: 'Read this sentence:', targetText: 'The sun is shining bright today', difficulty: 'hard', minAccuracy: 50 }
];

const VoicePractice: React.FC = () => {
  const { userProgress, updateProgress, addXP, userProfile } = useGame();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hasPlayedTarget, setHasPlayedTarget] = useState(false);

  const currentExercise = voiceExercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / voiceExercises.length) * 100;

  useEffect(() => {
    setHasPlayedTarget(false);
    setUserTranscript('');
    setFeedback(null);
  }, [currentExerciseIndex]);

  const playTargetAudio = () => {
    SpeechUtils.speak(currentExercise.targetText, {
      rate: userProfile.ttsRate * 0.8, // Slower for learning
      volume: userProfile.ttsVolume,
      onEnd: () => setHasPlayedTarget(true)
    });
  };

  const startListening = async () => {
    if (!hasPlayedTarget && currentExercise.type === 'word-repeat') {
      setFeedback({
        type: 'info',
        message: 'Please listen to the word first by clicking the Play button!'
      });
      return;
    }

    setIsListening(true);
    setUserTranscript('');
    setFeedback(null);

    try {
      await SpeechUtils.startListening({
        onResult: (transcript, isFinal) => {
          setUserTranscript(transcript);
          if (isFinal) {
            setIsListening(false);
            checkAccuracy(transcript);
          }
        },
        onEnd: () => {
          setIsListening(false);
        },
        onError: (error) => {
          setIsListening(false);
          setFeedback({
            type: 'error',
            message: 'Voice recognition failed. Please try again or check your microphone.'
          });
        },
        continuous: false
      });
    } catch (error) {
      setIsListening(false);
      setFeedback({
        type: 'error',
        message: 'Voice recognition is not supported in your browser.'
      });
    }
  };

  const stopListening = () => {
    SpeechUtils.stopListening();
    setIsListening(false);
  };

  const checkAccuracy = (transcript: string) => {
    const target = currentExercise.targetText.toLowerCase();
    const spoken = transcript.toLowerCase().trim();
    
    // Calculate similarity (simple word matching for now)
    const targetWords = target.split(' ');
    const spokenWords = spoken.split(' ');
    
    let matches = 0;
    let totalWords = targetWords.length;
    
    targetWords.forEach(word => {
      if (spokenWords.some(spokenWord => 
        spokenWord.includes(word) || word.includes(spokenWord) || 
        levenshteinDistance(word, spokenWord) <= 1
      )) {
        matches++;
      }
    });
    
    const accuracyPercent = Math.round((matches / totalWords) * 100);
    setAccuracy(accuracyPercent);
    setAttempts(prev => prev + 1);
    
    if (accuracyPercent >= currentExercise.minAccuracy) {
      setScore(prev => prev + 1);
      setFeedback({
        type: 'success',
        message: `Great job! ${accuracyPercent}% accuracy. Moving to next exercise.`
      });
      
      if (userProfile.soundFxEnabled) {
        triggerConfetti('success');
      }
      
      setTimeout(() => {
        nextExercise();
      }, 2000);
    } else {
      setFeedback({
        type: 'error',
        message: `Try again! You said: "${transcript}". Target: "${currentExercise.targetText}"`
      });
    }
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(0));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j - 1][i] + 1,
          matrix[j][i - 1] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const nextExercise = () => {
    if (currentExerciseIndex + 1 >= voiceExercises.length) {
      completeSession();
    } else {
      setCurrentExerciseIndex(prev => prev + 1);
    }
  };

  const completeSession = () => {
    const finalScore = Math.round((score / voiceExercises.length) * 100);
    const stars = finalScore >= 90 ? 3 : finalScore >= 70 ? 2 : finalScore >= 50 ? 1 : 0;
    
    updateProgress('voicePractice', {
      score: finalScore,
      accuracy: Math.round(accuracy || 0),
      stars
    });
    
    addXP(stars * 20);
    setIsComplete(true);
    
    if (stars > 0) {
      triggerStarConfetti(stars);
    }
  };

  const resetSession = () => {
    setCurrentExerciseIndex(0);
    setScore(0);
    setAttempts(0);
    setAccuracy(0);
    setIsComplete(false);
    setUserTranscript('');
    setFeedback(null);
    setHasPlayedTarget(false);
  };

  if (isComplete) {
    const finalScore = Math.round((score / voiceExercises.length) * 100);
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
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Mic className="w-16 h-16 text-primary mx-auto mb-4" />
                </motion.div>
                <CardTitle className="text-3xl font-bold">Voice Practice Complete!</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex justify-center space-x-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">{finalScore}%</div>
                    <div className="text-sm text-muted-foreground">Accuracy</div>
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
                    <div className="text-4xl font-bold text-secondary">{score}/{voiceExercises.length}</div>
                    <div className="text-sm text-muted-foreground">Exercises Passed</div>
                  </div>
                </div>

                <Button onClick={resetSession} className="mx-auto">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Practice Again
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
                  <Mic className="w-8 h-8 mr-3 text-primary" />
                  Voice Practice
                </CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-muted-foreground">
                    Level {currentExercise.level}
                  </div>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-1" />
                    <span className="font-bold">{score}/{voiceExercises.length}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Exercise {currentExerciseIndex + 1} of {voiceExercises.length}</span>
                <span className="capitalize">{currentExercise.difficulty}</span>
              </div>
              <Progress value={progress} className="mt-2" />
            </CardHeader>

            <CardContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentExerciseIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Exercise Content */}
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-semibold">{currentExercise.instruction}</h3>
                    
                    {currentExercise.image && (
                      <div className="text-6xl">{currentExercise.image}</div>
                    )}
                    
                    <div className="bg-muted/50 rounded-lg p-6">
                      <div className="text-2xl font-bold text-primary mb-2">
                        {currentExercise.targetText}
                      </div>
                      {currentExercise.phoneme && (
                        <div className="text-lg text-muted-foreground">
                          Phoneme: {currentExercise.phoneme}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col items-center space-y-4">
                    {(currentExercise.type === 'word-repeat' || currentExercise.type === 'sentence-read') && (
                      <Button onClick={playTargetAudio} variant="outline" size="lg">
                        <Volume2 className="w-5 h-5 mr-2" />
                        Listen to Target
                      </Button>
                    )}

                    <div className="flex items-center space-x-4">
                      <Button
                        onClick={isListening ? stopListening : startListening}
                        size="lg"
                        className={`px-8 py-4 ${isListening ? 'bg-red-500 hover:bg-red-600' : ''}`}
                      >
                        {isListening ? (
                          <>
                            <Square className="w-5 h-5 mr-2" />
                            Stop Recording
                          </>
                        ) : (
                          <>
                            <Mic className="w-5 h-5 mr-2" />
                            Start Speaking
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Real-time transcript */}
                    {(isListening || userTranscript) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full"
                      >
                        <div className="bg-muted/30 rounded-lg p-4 border-2 border-dashed border-primary/30">
                          <div className="text-sm text-muted-foreground mb-1">
                            {isListening ? 'Listening...' : 'You said:'}
                          </div>
                          <div className="text-lg font-medium">
                            {userTranscript || (isListening ? '...' : 'Click Start Speaking to begin')}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Feedback */}
                    {feedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full"
                      >
                        <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'}>
                          <div className="flex items-center">
                            {feedback.type === 'success' && <CheckCircle className="w-4 h-4 mr-2 text-green-600" />}
                            {feedback.type === 'error' && <XCircle className="w-4 h-4 mr-2" />}
                            <AlertDescription>{feedback.message}</AlertDescription>
                          </div>
                        </Alert>
                      </motion.div>
                    )}

                    {/* Instructions */}
                    <div className="text-center max-w-md">
                      <p className="text-sm text-muted-foreground">
                        {currentExercise.type === 'word-repeat' && 'Listen to the word, then repeat it clearly.'}
                        {currentExercise.type === 'picture-describe' && 'Look at the picture and describe what you see.'}
                        {currentExercise.type === 'phoneme-practice' && 'Practice saying this sound clearly.'}
                        {currentExercise.type === 'sentence-read' && 'Read the sentence aloud clearly.'}
                      </p>
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

export default VoicePractice;