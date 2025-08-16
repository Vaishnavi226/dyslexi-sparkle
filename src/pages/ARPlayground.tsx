import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  RotateCcw, 
  Volume2, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Palette, 
  Sparkles, 
  BookOpen,
  Gamepad2,
  Trophy,
  Star,
  Target,
  Shuffle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Layout from '@/components/shared/Layout';
import { useGame } from '@/contexts/GameContext';
import { SpeechUtils } from '@/utils/speechUtils';
import { triggerConfetti } from '@/utils/confetti';
import LetterCharacter from '@/components/ar/LetterCharacter';

interface AR3DObject {
  id: string;
  name: string;
  letter: string;
  emoji: string;
  color: string;
  rotation: { x: number; y: number; z: number };
  scale: number;
  position: { x: number; y: number; z: number };
}

// All 26 letters with creative 3D characters
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const backgroundThemes = [
  { name: 'Space Park', gradient: 'from-purple-900 via-blue-900 to-indigo-900', pattern: 'stars' },
  { name: 'Candy Land', gradient: 'from-pink-400 via-red-400 to-yellow-400', pattern: 'candy' },
  { name: 'Ocean Deep', gradient: 'from-blue-900 via-teal-600 to-cyan-400', pattern: 'waves' },
  { name: 'Magic Forest', gradient: 'from-green-900 via-emerald-600 to-lime-400', pattern: 'trees' },
  { name: 'Rainbow Sky', gradient: 'from-purple-400 via-pink-400 to-red-400', pattern: 'clouds' }
];

const wordChallenges = [
  { word: 'CAT', letters: ['C', 'A', 'T'], difficulty: 'easy' },
  { word: 'DOG', letters: ['D', 'O', 'G'], difficulty: 'easy' },
  { word: 'BIRD', letters: ['B', 'I', 'R', 'D'], difficulty: 'medium' },
  { word: 'FISH', letters: ['F', 'I', 'S', 'H'], difficulty: 'medium' },
  { word: 'ELEPHANT', letters: ['E', 'L', 'E', 'P', 'H', 'A', 'N', 'T'], difficulty: 'hard' }
];

const ARPlayground: React.FC = () => {
  const { userProfile, updateProgress, addXP } = useGame();
  const [mode, setMode] = useState<'learning' | 'play'>('learning');
  const [currentTheme, setCurrentTheme] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lettersExplored, setLettersExplored] = useState<Set<string>>(new Set());
  const [isRotating, setIsRotating] = useState(false);
  const [experimentsCompleted, setExperimentsCompleted] = useState(0);
  
  const animationRef = useRef<number>();

  useEffect(() => {
    // Animation cleanup only
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRotating]);

  const handleLetterInteract = (letter: string) => {
    setLettersExplored(prev => new Set([...prev, letter]));
    setExperimentsCompleted(prev => prev + 1);
    
    if (mode === 'play') {
      handleLetterSelect(letter);
    }
    
    if (userProfile.soundFxEnabled) {
      triggerConfetti('success');
    }
  };

  const handleLetterSelect = (letter: string) => {
    if (mode === 'play') {
      const challenge = wordChallenges[currentChallenge];
      const nextPosition = selectedLetters.length;
      
      if (nextPosition < challenge.letters.length && letter === challenge.letters[nextPosition]) {
        setSelectedLetters(prev => [...prev, letter]);
        setScore(prev => prev + 10);
        setStreak(prev => prev + 1);
        
        SpeechUtils.speak(`Great! ${letter} is correct!`);
        
        if (selectedLetters.length + 1 === challenge.letters.length) {
          // Word completed
          SpeechUtils.speak(`Amazing! You spelled ${challenge.word}!`);
          triggerConfetti('achievement');
          setScore(prev => prev + 50);
          
          setTimeout(() => {
            setCurrentChallenge(prev => (prev + 1) % wordChallenges.length);
            setSelectedLetters([]);
          }, 2000);
        }
      } else {
        SpeechUtils.speak(`Try again! Look for the letter ${challenge.letters[nextPosition]}`);
        setStreak(0);
      }
    }
  };

  const resetGame = () => {
    setSelectedLetters([]);
    setScore(0);
    setStreak(0);
    setCurrentChallenge(0);
  };

  const shuffleLetterPositions = () => {
    // This would trigger a re-render with new random positions
    setExperimentsCompleted(prev => prev + 1);
    triggerConfetti('success');
    SpeechUtils.speak('Letters shuffled! Find your favorites in their new spots!');
  };

  const completeSession = () => {
    const finalScore = Math.min(score + (lettersExplored.size * 5), 100);
    const stars = finalScore >= 90 ? 3 : finalScore >= 60 ? 2 : finalScore >= 30 ? 1 : 0;
    
    updateProgress('arPlayground', {
      score: finalScore,
      experimentsCompleted,
      stars
    });
    
    addXP(stars * 15);
    
    if (userProfile.soundFxEnabled) {
      triggerConfetti('achievement');
    }
    
    SpeechUtils.speak(`Fantastic session! You explored ${lettersExplored.size} letters and earned ${finalScore} points!`);
  };

  const generateLetterPositions = () => {
    return alphabet.map((letter, index) => ({
      letter,
      position: {
        x: 10 + (index % 6) * 15,
        y: 15 + Math.floor(index / 6) * 15 + Math.random() * 5
      }
    }));
  };

  const letterPositions = generateLetterPositions();

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 rounded-2xl p-6 overflow-hidden"
        >
          <div className="absolute inset-0 opacity-30 bg-purple-900/20" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Box className="w-8 h-8 mr-3 text-yellow-400" />
                AR Letter Playground
              </h1>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-200">
                  {lettersExplored.size}/26 Letters Explored
                </Badge>
                <div className="flex items-center text-yellow-400">
                  <Trophy className="w-5 h-5 mr-1" />
                  <span className="font-bold">{score} Points</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Tabs value={mode} onValueChange={(value) => setMode(value as 'learning' | 'play')}>
                <TabsList>
                  <TabsTrigger value="learning" className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    Learning Mode
                  </TabsTrigger>
                  <TabsTrigger value="play" className="flex items-center">
                    <Gamepad2 className="w-4 h-4 mr-1" />
                    Play Mode
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              {mode === 'play' && (
                <div className="flex items-center space-x-4 text-white">
                  <div className="flex items-center">
                    <Target className="w-4 h-4 mr-1" />
                    Spell: <span className="font-bold ml-1">{wordChallenges[currentChallenge].word}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-400" />
                    Streak: {streak}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Playground */}
        <Card className="glass bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center">
                <Sparkles className="w-6 h-6 mr-2 text-primary" />
                {mode === 'learning' ? 'Explore Letters' : 'Spelling Challenge'}
              </CardTitle>
              
              <div className="flex items-center space-x-2">
                <Button onClick={shuffleLetterPositions} variant="outline" size="sm">
                  <Shuffle className="w-4 h-4 mr-1" />
                  Shuffle
                </Button>
                <Button onClick={completeSession} variant="outline" size="sm">
                  <Trophy className="w-4 h-4 mr-1" />
                  Finish Session
                </Button>
              </div>
            </div>
            
            {mode === 'learning' && (
              <p className="text-muted-foreground">
                Click on letters to meet their characters and learn their sounds!
              </p>
            )}
            
            {mode === 'play' && (
              <Alert>
                <Target className="w-4 h-4" />
                <AlertDescription>
                  Spell "{wordChallenges[currentChallenge].word}" by clicking the letters in order!
                  Progress: {selectedLetters.join('')}
                  {selectedLetters.length < wordChallenges[currentChallenge].letters.length && 
                    ` (Next: ${wordChallenges[currentChallenge].letters[selectedLetters.length]})`
                  }
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>

          <CardContent>
            {/* Background Theme Selector */}
            <div className="mb-6 flex flex-wrap gap-2">
              {backgroundThemes.map((theme, index) => (
                <Button
                  key={theme.name}
                  onClick={() => setCurrentTheme(index)}
                  variant={currentTheme === index ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                >
                  <Palette className="w-3 h-3 mr-1" />
                  {theme.name}
                </Button>
              ))}
            </div>

            {/* Interactive Letter Playground */}
            <div className={`
              relative min-h-96 rounded-xl overflow-hidden border-2 border-primary/20
              bg-gradient-to-br ${backgroundThemes[currentTheme].gradient}
            `}>
              {/* Theme-specific background patterns */}
              <div className="absolute inset-0 opacity-20">
                {backgroundThemes[currentTheme].pattern === 'stars' && (
                  <div className="w-full h-full bg-purple-900/10" />
                )}
                {backgroundThemes[currentTheme].pattern === 'waves' && (
                  <div className="w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_50%)]" />
                )}
              </div>

              {/* Letter Characters */}
              <div className="relative z-10 p-6">
                {letterPositions.map(({ letter, position }) => (
                  <LetterCharacter
                    key={letter}
                    letter={letter}
                    character={`${letter} Character`}
                    emoji="🎯"
                    word={`${letter}-Word`}
                    color={`hsl(${(letter.charCodeAt(0) - 65) * 14}, 70%, 60%)`}
                    position={position}
                    isLearningMode={mode === 'learning'}
                    onInteract={handleLetterInteract}
                    onWordFormed={mode === 'play' ? handleLetterSelect : undefined}
                  />
                ))}
              </div>

              {/* Mode-specific overlays */}
              {mode === 'play' && (
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white p-4 rounded-xl">
                  <div className="text-lg font-bold mb-2">Spell: {wordChallenges[currentChallenge].word}</div>
                  <div className="text-sm mb-2">Progress: {selectedLetters.join('') || '___'}</div>
                  <div className="text-xs opacity-75">
                    Difficulty: {wordChallenges[currentChallenge].difficulty}
                  </div>
                </div>
              )}

              {mode === 'learning' && (
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white p-4 rounded-xl">
                  <div className="text-sm font-bold mb-1">Letters Explored</div>
                  <div className="text-2xl font-bold">{lettersExplored.size}/26</div>
                  <div className="text-xs opacity-75">Click letters to meet their characters!</div>
                </div>
              )}
            </div>

            {/* Controls and Stats */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Explored</div>
                    <div className="text-lg font-bold">{lettersExplored.size}/26</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Score</div>
                    <div className="text-lg font-bold">{score}</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-purple-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Streak</div>
                    <div className="text-lg font-bold">{streak}</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Level</div>
                    <div className="text-lg font-bold">{Math.floor(experimentsCompleted / 5) + 1}</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              {mode === 'play' && (
                <Button onClick={resetGame} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Game
                </Button>
              )}
              
              <Button 
                onClick={() => {
                  const nextTheme = (currentTheme + 1) % backgroundThemes.length;
                  setCurrentTheme(nextTheme);
                  SpeechUtils.speak(`Switched to ${backgroundThemes[nextTheme].name} theme!`);
                }}
                variant="outline"
              >
                <Palette className="w-4 h-4 mr-2" />
                Change Theme
              </Button>
              
              <Button onClick={shuffleLetterPositions} variant="outline">
                <Shuffle className="w-4 h-4 mr-2" />
                Shuffle Letters
              </Button>
              
              <Button 
                onClick={() => {
                  const allLetters = alphabet.join(', ');
                  SpeechUtils.speak(`Here are all the letters in the alphabet: ${allLetters}`);
                }}
                variant="outline"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Say Alphabet
              </Button>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-primary/20">
              <h4 className="font-bold text-lg mb-3 flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                How to Play:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-semibold text-blue-600 mb-2">Learning Mode:</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Click any letter to meet its character</li>
                    <li>• Listen to letter sounds and example words</li>
                    <li>• Explore all 26 letters at your own pace</li>
                    <li>• Change themes for different environments</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-purple-600 mb-2">Play Mode:</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Follow the word challenge prompts</li>
                    <li>• Click letters in the correct order to spell words</li>
                    <li>• Build streaks for bonus points</li>
                    <li>• Complete words to unlock new challenges</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ARPlayground;