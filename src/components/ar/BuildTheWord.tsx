import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';
import { Suspense } from 'react';
import { Volume2, RotateCcw, Trophy, Target, Shuffle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SpeechUtils } from '@/utils/speechUtils';
import { triggerConfetti } from '@/utils/confetti';

interface BuildTheWordProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface DraggableLetter3DProps {
  letter: string;
  position: [number, number, number];
  color: string;
  onClick: () => void;
  isUsed: boolean;
  isCorrectPosition: boolean;
}

const DraggableLetter3D: React.FC<DraggableLetter3DProps> = ({ 
  letter, 
  position, 
  color, 
  onClick, 
  isUsed, 
  isCorrectPosition 
}) => {
  const meshRef = useRef<any>();
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={onClick}
      scale={isCorrectPosition ? [1.1, 1.1, 1.1] : [1, 1, 1]}
    >
      <boxGeometry args={[1, 1, 0.2]} />
      <meshStandardMaterial 
        color={isCorrectPosition ? '#22C55E' : isUsed ? '#94A3B8' : color}
        transparent 
        opacity={isUsed && !isCorrectPosition ? 0.5 : 1}
        emissive={isCorrectPosition ? '#16A34A' : '#000000'}
        emissiveIntensity={isCorrectPosition ? 0.3 : 0}
      />
      <Center position={[0, 0, 0.11]}>
        <mesh>
          <planeGeometry args={[0.6, 0.6]} />
          <meshStandardMaterial color="white" transparent opacity={0.9} />
        </mesh>
        <Center position={[0, 0, 0.01]}>
          <mesh>
            <planeGeometry args={[0.4, 0.4]} />
            <meshStandardMaterial color="#000" transparent opacity={0.8} />
          </mesh>
        </Center>
      </Center>
    </mesh>
  );
};

const BuildTheWord: React.FC<BuildTheWordProps> = ({ onComplete, onBack }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [builtWord, setBuiltWord] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [completedWords, setCompletedWords] = useState<string[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);

  const words = [
    { word: 'CAT', syllables: ['CAT'], emoji: '🐱', sound: 'meow' },
    { word: 'DOG', syllables: ['DOG'], emoji: '🐶', sound: 'woof' },
    { word: 'BIRD', syllables: ['BIRD'], emoji: '🐦', sound: 'chirp' },
    { word: 'FISH', syllables: ['FISH'], emoji: '🐠', sound: 'splash' },
    { word: 'APPLE', syllables: ['AP', 'PLE'], emoji: '🍎', sound: 'crunch' },
    { word: 'TREE', syllables: ['TREE'], emoji: '🌳', sound: 'rustle' }
  ];

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

  const currentWord = words[currentWordIndex];

  // Initialize available letters when word changes
  useEffect(() => {
    const wordLetters = currentWord.word.split('');
    const extraLetters = ['X', 'Y', 'Z', 'Q', 'K', 'W', 'J'].slice(0, 6 - wordLetters.length);
    const allLetters = [...wordLetters, ...extraLetters].sort(() => Math.random() - 0.5);
    setAvailableLetters(allLetters);
    setBuiltWord([]);
  }, [currentWordIndex]);

  // Announce word when starting
  useEffect(() => {
    if (!showInstructions) {
      const timeout = setTimeout(() => {
        SpeechUtils.speak(`Build the word: ${currentWord.word}. ${currentWord.syllables.join(' - ')}`);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [currentWord, showInstructions]);

  const handleLetterClick = (letter: string) => {
    const targetPosition = builtWord.length;
    const correctLetter = currentWord.word[targetPosition];

    if (letter === correctLetter) {
      // Correct letter
      const newBuiltWord = [...builtWord, letter];
      setBuiltWord(newBuiltWord);
      setScore(prev => prev + 25);
      
      SpeechUtils.speak(`Good! ${letter}`);

      // Check if word is complete
      if (newBuiltWord.length === currentWord.word.length) {
        setTimeout(() => {
          handleWordComplete();
        }, 500);
      } else {
        // Give hint for next letter
        const nextLetter = currentWord.word[newBuiltWord.length];
        setTimeout(() => {
          SpeechUtils.speak(`Next letter: ${nextLetter}`);
        }, 1000);
      }
    } else {
      // Wrong letter
      SpeechUtils.speak(`Try again! Look for the letter ${correctLetter}`);
    }
  };

  const handleWordComplete = () => {
    const newCompletedWords = [...completedWords, currentWord.word];
    setCompletedWords(newCompletedWords);
    setScore(prev => prev + 100);
    
    triggerConfetti('achievement');
    SpeechUtils.speak(`Excellent! You spelled ${currentWord.word}! ${currentWord.emoji} ${currentWord.sound}!`);

    // Move to next word or complete game
    if (currentWordIndex < words.length - 1) {
      setTimeout(() => {
        setCurrentWordIndex(prev => prev + 1);
      }, 2000);
    } else {
      setTimeout(() => {
        SpeechUtils.speak(`Amazing! You completed all words! Final score: ${score + 100} points!`);
        onComplete(score + 100);
      }, 2000);
    }
  };

  const resetCurrentWord = () => {
    setBuiltWord([]);
    const wordLetters = currentWord.word.split('');
    const extraLetters = ['X', 'Y', 'Z', 'Q', 'K', 'W', 'J'].slice(0, 6 - wordLetters.length);
    const allLetters = [...wordLetters, ...extraLetters].sort(() => Math.random() - 0.5);
    setAvailableLetters(allLetters);
  };

  const playWordSound = () => {
    SpeechUtils.speak(`${currentWord.word}. ${currentWord.syllables.join(' - ')}. ${currentWord.sound}`);
  };

  const startGame = () => {
    setShowInstructions(false);
    setScore(0);
    setCompletedWords([]);
    setCurrentWordIndex(0);
  };

  if (showInstructions) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-6">
          <div className="text-6xl mb-4">🧩</div>
          <h2 className="text-2xl font-bold">Build the Word Instructions</h2>
          <div className="space-y-4 text-left max-w-2xl mx-auto">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">👂</span>
              <p>Listen for the word you need to build (example: "Build the word CAT")</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📝</span>
              <p>Click letters in the correct order to spell the word</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🎨</span>
              <p>Correct letters will turn green and stay in place</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🎉</span>
              <p>Complete the word to see the object come to life!</p>
            </div>
          </div>
          <div className="space-x-4">
            <Button onClick={startGame} size="lg" className="bg-green-600 hover:bg-green-700">
              <Target className="w-5 h-5 mr-2" />
              Start Building!
            </Button>
            <Button onClick={onBack} variant="outline" size="lg">
              Back to Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{score}</div>
            <div className="text-sm text-muted-foreground">Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{completedWords.length}</div>
            <div className="text-sm text-muted-foreground">Words Built</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{currentWordIndex + 1}</div>
            <div className="text-sm text-muted-foreground">Current Word</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl">{currentWord.emoji}</div>
            <div className="text-sm text-muted-foreground">Target</div>
          </CardContent>
        </Card>
      </div>

      {/* Current Word Target */}
      <Alert>
        <Target className="w-4 h-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <span className="font-bold text-lg">Build the word: </span>
            <span className="text-2xl font-bold text-green-600">{currentWord.word}</span>
            <div className="mt-1">
              <span className="text-sm text-muted-foreground">
                Progress: {builtWord.join('')}
                {builtWord.length < currentWord.word.length && ` (Next: ${currentWord.word[builtWord.length]})`}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={playWordSound}
          >
            <Volume2 className="w-4 h-4" />
          </Button>
        </AlertDescription>
      </Alert>

      {/* Syllable Display */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm font-medium">Syllables:</span>
            {currentWord.syllables.map((syllable, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className={`text-lg px-3 py-1 ${
                  index === 0 ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}
              >
                {syllable}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Word Progress</span>
          <span>{builtWord.length}/{currentWord.word.length} letters</span>
        </div>
        <Progress value={(builtWord.length / currentWord.word.length) * 100} className="h-3" />
      </div>

      {/* 3D AR Scene */}
      <Card>
        <CardContent className="p-0">
          <div className="h-96 w-full rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
              <color attach="background" args={['#134e4a']} />
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
              <Suspense fallback={null}>
                {availableLetters.map((letter, index) => (
                  <DraggableLetter3D
                    key={`${letter}-${index}`}
                    letter={letter}
                    position={[
                      (index % 4) * 2.5 - 3.75,
                      Math.floor(index / 4) * 2.5 - 1.25,
                      0
                    ]}
                    color={colors[index % colors.length]}
                    onClick={() => handleLetterClick(letter)}
                    isUsed={builtWord.includes(letter)}
                    isCorrectPosition={
                      builtWord.includes(letter) && 
                      currentWord.word.indexOf(letter) === builtWord.indexOf(letter)
                    }
                  />
                ))}
              </Suspense>
            </Canvas>
          </div>
        </CardContent>
      </Card>

      {/* Game Controls */}
      <div className="flex justify-center space-x-4">
        <Button onClick={resetCurrentWord} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Word
        </Button>
        <Button onClick={playWordSound}>
          <Volume2 className="w-4 h-4 mr-2" />
          Hear Word
        </Button>
        <Button 
          onClick={() => {
            const shuffledLetters = [...availableLetters].sort(() => Math.random() - 0.5);
            setAvailableLetters(shuffledLetters);
          }}
          variant="outline"
        >
          <Shuffle className="w-4 h-4 mr-2" />
          Shuffle
        </Button>
      </div>
    </div>
  );
};

export default BuildTheWord;