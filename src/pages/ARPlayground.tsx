import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  BookOpen, 
  Palette, 
  Gamepad2, 
  Brain,
  Volume2,
  RotateCcw,
  Trophy,
  Star,
  Sparkles,
  Target,
  Camera,
  Shuffle,
  Play,
  Pause
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import Layout from '@/components/shared/Layout';
import { useGame } from '@/contexts/GameContext';
import { SpeechUtils } from '@/utils/speechUtils';
import { triggerConfetti } from '@/utils/confetti';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text3D, Center } from '@react-three/drei';
import { Suspense } from 'react';

// AR Activities Data
const letterActivities = [
  { letter: 'A', object: 'Apple', color: '#FF6B6B', emoji: '🍎', sound: 'A says /æ/ like Apple!' },
  { letter: 'B', object: 'Ball', color: '#4ECDC4', emoji: '⚽', sound: 'B says /b/ like Ball!' },
  { letter: 'C', object: 'Cat', color: '#45B7D1', emoji: '🐱', sound: 'C says /k/ like Cat!' },
  { letter: 'D', object: 'Dog', color: '#FFA07A', emoji: '🐶', sound: 'D says /d/ like Dog!' },
  { letter: 'E', object: 'Elephant', color: '#98D8C8', emoji: '🐘', sound: 'E says /ɛ/ like Elephant!' },
  { letter: 'F', object: 'Fish', color: '#F7DC6F', emoji: '🐠', sound: 'F says /f/ like Fish!' }
];

const wordBuildingWords = [
  { word: 'CAT', letters: ['C', 'A', 'T'], object: '🐱', syllables: ['CAT'] },
  { word: 'DOG', letters: ['D', 'O', 'G'], object: '🐶', syllables: ['DOG'] },
  { word: 'BIRD', letters: ['B', 'I', 'R', 'D'], object: '🐦', syllables: ['BIRD'] },
  { word: 'FISH', letters: ['F', 'I', 'S', 'H'], object: '🐠', syllables: ['FISH'] },
  { word: 'APPLE', letters: ['A', 'P', 'P', 'L', 'E'], object: '🍎', syllables: ['AP', 'PLE'] }
];

const shapes = [
  { name: 'Circle', color: '#FF6B6B', emoji: '🔴', realWorld: ['plate', 'wheel', 'coin'] },
  { name: 'Square', color: '#4ECDC4', emoji: '🟦', realWorld: ['window', 'book', 'screen'] },
  { name: 'Triangle', color: '#FFD93D', emoji: '🔺', realWorld: ['pizza slice', 'roof', 'mountain'] }
];

// 3D Letter Component
const Letter3D: React.FC<{ 
  letter: string; 
  color: string; 
  position: [number, number, number];
  onClick: () => void;
  isActive: boolean;
}> = ({ letter, color, position, onClick, isActive }) => {
  const meshRef = useRef<any>();
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={onClick}
      scale={isActive ? [1.2, 1.2, 1.2] : [1, 1, 1]}
    >
      <boxGeometry args={[1, 1, 0.2]} />
      <meshStandardMaterial color={color} />
      <Suspense fallback={null}>
        <Center position={[0, 0, 0.11]}>
          <Text3D
            font="/fonts/helvetiker_regular.typeface.json"
            size={0.4}
            height={0.05}
          >
            {letter}
            <meshStandardMaterial color="white" />
          </Text3D>
        </Center>
      </Suspense>
    </mesh>
  );
};

// 3D Scene Component
const AR3DScene: React.FC<{ 
  children: React.ReactNode; 
  backgroundColor?: string 
}> = ({ children, backgroundColor = '#1a1a2e' }) => {
  return (
    <div className="h-96 w-full rounded-lg overflow-hidden border-2 border-primary/20">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <color attach="background" args={[backgroundColor]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
};

const ARPlayground: React.FC = () => {
  const { userProfile, updateProgress, addXP } = useGame();
  const [activeTab, setActiveTab] = useState('letters');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [currentWord, setCurrentWord] = useState<string[]>([]);
  const [selectedWordIndex, setSelectedWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());
  const [gameMode, setGameMode] = useState<'learn' | 'play'>('learn');
  const [treasureHuntProgress, setTreasureHuntProgress] = useState(0);

  const handleLetterSelect = (letter: string, activity: any) => {
    setSelectedLetter(letter);
    if (userProfile.soundFxEnabled) {
      SpeechUtils.speak(activity.sound);
      triggerConfetti('success');
    }
    setScore(prev => prev + 10);
    setCompletedActivities(prev => new Set([...prev, letter]));
  };

  const handleWordBuilding = (letter: string) => {
    const targetWord = wordBuildingWords[selectedWordIndex];
    const nextPosition = currentWord.length;
    
    if (nextPosition < targetWord.letters.length && letter === targetWord.letters[nextPosition]) {
      const newWord = [...currentWord, letter];
      setCurrentWord(newWord);
      setScore(prev => prev + 15);
      
      if (newWord.length === targetWord.letters.length) {
        SpeechUtils.speak(`Excellent! You spelled ${targetWord.word}! ${targetWord.object}`);
        triggerConfetti('achievement');
        setScore(prev => prev + 50);
        
        setTimeout(() => {
          setCurrentWord([]);
          setSelectedWordIndex(prev => (prev + 1) % wordBuildingWords.length);
        }, 2000);
      } else {
        SpeechUtils.speak(`Great! Next letter is ${targetWord.letters[nextPosition]}`);
      }
    } else {
      SpeechUtils.speak(`Try again! Look for the letter ${targetWord.letters[nextPosition]}`);
    }
  };

  const resetCurrentActivity = () => {
    setCurrentWord([]);
    setSelectedLetter(null);
    setTreasureHuntProgress(0);
  };

  const startTreasureHunt = () => {
    setTreasureHuntProgress(0);
    SpeechUtils.speak('Treasure hunt started! Find all the hidden letters!');
    // Simulate treasure hunt progress
    const interval = setInterval(() => {
      setTreasureHuntProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          triggerConfetti('achievement');
          SpeechUtils.speak('Treasure hunt complete! You found all the letters!');
          return 100;
        }
        return prev + 20;
      });
    }, 1500);
  };

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-6 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-foreground flex items-center">
                <Box className="w-8 h-8 mr-3 text-primary animate-pulse" />
                AR Playground
              </h1>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  {completedActivities.size} Activities Completed
                </Badge>
                <div className="flex items-center text-primary">
                  <Trophy className="w-5 h-5 mr-1" />
                  <span className="font-bold">{score} Points</span>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground">
              Interactive AR experiences designed for dyslexia-friendly learning with multi-sensory feedback
            </p>
          </div>
        </motion.div>

        {/* Main AR Playground */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Camera className="w-6 h-6 mr-2 text-primary" />
              Interactive AR Learning Hub
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="letters" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Letters</span>
                </TabsTrigger>
                <TabsTrigger value="words" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Words</span>
                </TabsTrigger>
                <TabsTrigger value="creative" className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  <span className="hidden sm:inline">Creative</span>
                </TabsTrigger>
                <TabsTrigger value="games" className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Games</span>
                </TabsTrigger>
                <TabsTrigger value="support" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  <span className="hidden sm:inline">Support</span>
                </TabsTrigger>
              </TabsList>

              {/* Reading & Letter Recognition */}
              <TabsContent value="letters" className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2 text-primary">📖 Reading & Letter Recognition</h3>
                  <p className="text-muted-foreground">Click on 3D letters to learn sounds and see related objects</p>
                </div>

                {selectedLetter && (
                  <Alert className="mb-4">
                    <Volume2 className="w-4 h-4" />
                    <AlertDescription>
                      <span className="font-semibold">Letter {selectedLetter}:</span> {
                        letterActivities.find(a => a.letter === selectedLetter)?.sound
                      }
                    </AlertDescription>
                  </Alert>
                )}

                <AR3DScene>
                  {letterActivities.map((activity, index) => (
                    <Letter3D
                      key={activity.letter}
                      letter={activity.letter}
                      color={activity.color}
                      position={[
                        (index % 3) * 2 - 2,
                        Math.floor(index / 3) * 2 - 1,
                        0
                      ]}
                      onClick={() => handleLetterSelect(activity.letter, activity)}
                      isActive={selectedLetter === activity.letter}
                    />
                  ))}
                </AR3DScene>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {letterActivities.map((activity) => (
                    <Button
                      key={activity.letter}
                      variant={selectedLetter === activity.letter ? "default" : "outline"}
                      className="p-4 h-auto flex flex-col space-y-2"
                      onClick={() => handleLetterSelect(activity.letter, activity)}
                    >
                      <span className="text-2xl">{activity.emoji}</span>
                      <span className="font-bold">{activity.letter}</span>
                      <span className="text-sm">{activity.object}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>

              {/* Word Building */}
              <TabsContent value="words" className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2 text-primary">📚 Word Building</h3>
                  <p className="text-muted-foreground">Drag letters to build words and see them come to life!</p>
                </div>

                <Alert>
                  <Target className="w-4 h-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span>Build the word: <span className="font-bold text-lg">{wordBuildingWords[selectedWordIndex].word}</span></span>
                      <span className="text-2xl">{wordBuildingWords[selectedWordIndex].object}</span>
                    </div>
                    <div className="mt-2">
                      Progress: {currentWord.join('')} 
                      {currentWord.length < wordBuildingWords[selectedWordIndex].letters.length && 
                        ` (Next: ${wordBuildingWords[selectedWordIndex].letters[currentWord.length]})`
                      }
                    </div>
                  </AlertDescription>
                </Alert>

                <AR3DScene backgroundColor="#2a2a4e">
                  {letterActivities.slice(0, 6).map((activity, index) => (
                    <Letter3D
                      key={activity.letter}
                      letter={activity.letter}
                      color={activity.color}
                      position={[
                        (index % 3) * 2.5 - 2.5,
                        Math.floor(index / 3) * 2 - 1,
                        0
                      ]}
                      onClick={() => handleWordBuilding(activity.letter)}
                      isActive={currentWord.includes(activity.letter)}
                    />
                  ))}
                </AR3DScene>

                <div className="flex justify-center space-x-4">
                  <Button onClick={resetCurrentActivity} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Word
                  </Button>
                  <Button onClick={() => {
                    const word = wordBuildingWords[selectedWordIndex];
                    SpeechUtils.speak(`The word is ${word.word}. ${word.syllables.join(' - ')}`);
                  }}>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Hear Word
                  </Button>
                </div>
              </TabsContent>

              {/* Creative Playground */}
              <TabsContent value="creative" className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2 text-primary">🎨 Creative Playground</h3>
                  <p className="text-muted-foreground">Explore shapes, colors, and create interactive stories</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <h4 className="font-bold mb-4">Shape Matching</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {shapes.map((shape) => (
                        <Button
                          key={shape.name}
                          variant="outline"
                          className="p-4 h-auto flex flex-col space-y-2 hover-scale"
                          onClick={() => {
                            SpeechUtils.speak(`${shape.name}! You can find this shape in: ${shape.realWorld.join(', ')}`);
                            triggerConfetti('success');
                          }}
                        >
                          <span className="text-3xl">{shape.emoji}</span>
                          <span className="font-bold">{shape.name}</span>
                        </Button>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-bold mb-4">Story World</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create stories by combining characters and objects
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {['🐱', '🐶', '🐦', '🐠', '🍎', '⚽', '🏠', '🌳'].map((emoji, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className="text-2xl p-2 hover-scale"
                          onClick={() => {
                            SpeechUtils.speak(`Once upon a time there was a ${emoji}`);
                          }}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Game Activities */}
              <TabsContent value="games" className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2 text-primary">🎮 Game-like Activities</h3>
                  <p className="text-muted-foreground">Fun interactive games to reinforce learning</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h4 className="font-bold text-lg mb-4 flex items-center">
                      <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                      Treasure Hunt
                    </h4>
                    <div className="space-y-4">
                      <Progress value={treasureHuntProgress} className="w-full" />
                      <p className="text-sm text-muted-foreground">
                        Find hidden letters around the AR environment
                      </p>
                      <Button 
                        onClick={startTreasureHunt}
                        className="w-full"
                        disabled={treasureHuntProgress > 0 && treasureHuntProgress < 100}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        {treasureHuntProgress === 0 ? 'Start Hunt' : 
                         treasureHuntProgress === 100 ? 'Hunt Complete!' : 'Hunting...'}
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h4 className="font-bold text-lg mb-4 flex items-center">
                      <Shuffle className="w-5 h-5 mr-2 text-blue-500" />
                      Memory Match
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {letterActivities.slice(0, 8).map((activity, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="aspect-square p-2 text-sm hover-scale"
                          onClick={() => {
                            SpeechUtils.speak(`${activity.letter} for ${activity.object}`);
                          }}
                        >
                          {Math.random() > 0.5 ? activity.letter : activity.emoji}
                        </Button>
                      ))}
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Dyslexia Support */}
              <TabsContent value="support" className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2 text-primary">🧠 Dyslexia-Specific Support</h3>
                  <p className="text-muted-foreground">Specialized tools designed for dyslexia-friendly learning</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h4 className="font-bold text-lg mb-4">Multi-Sensory Features</h4>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-center">
                        <Volume2 className="w-4 h-4 mr-2 text-green-500" />
                        Audio feedback for every interaction
                      </li>
                      <li className="flex items-center">
                        <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
                        Visual animations and effects
                      </li>
                      <li className="flex items-center">
                        <Target className="w-4 h-4 mr-2 text-purple-500" />
                        Clear, uncluttered interface
                      </li>
                      <li className="flex items-center">
                        <RotateCcw className="w-4 h-4 mr-2 text-orange-500" />
                        Repetition and replay options
                      </li>
                    </ul>
                  </Card>

                  <Card className="p-6">
                    <h4 className="font-bold text-lg mb-4">Progress Tracking</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Activities Completed</span>
                        <Badge>{completedActivities.size}/20</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Total Score</span>
                        <Badge variant="secondary">{score} points</Badge>
                      </div>
                      <Progress value={(completedActivities.size / 20) * 100} />
                      <Button 
                        onClick={() => {
                          updateProgress('arPlayground', {
                            score,
                            level: Math.floor(completedActivities.size / 5) + 1,
                            accuracy: Math.min((score / (completedActivities.size * 20)) * 100, 100) || 0,
                            stars: Math.floor(score / 100)
                          });
                          addXP(completedActivities.size * 10);
                          SpeechUtils.speak(`Progress saved! You've completed ${completedActivities.size} activities and earned ${score} points!`);
                        }}
                        className="w-full"
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        Save Progress
                      </Button>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ARPlayground;