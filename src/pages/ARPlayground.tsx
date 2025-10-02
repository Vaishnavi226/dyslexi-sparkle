import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Search,
  Puzzle,
  Palette,
  Camera,
  ArrowLeft,
  Volume2,
  RotateCcw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/shared/Layout';
import { useGame } from '@/contexts/GameContext';
import { SpeechUtils } from '@/utils/speechUtils';
import { triggerConfetti } from '@/utils/confetti';

// Import mini-game components
import LetterHunt from '@/components/ar/LetterHunt';
import WebARLetterHunt from '@/components/ar/WebARLetterHunt';
import BuildTheWord from '@/components/ar/BuildTheWord';
import ColorShapeSorter from '@/components/ar/ColorShapeSorter';

type MiniGame = 'letterhunt' | 'webarletterhunt' | 'buildword' | 'colorshape' | null;

const ARPlayground: React.FC = () => {
  const { userProfile } = useGame();
  const [activeMiniGame, setActiveMiniGame] = useState<MiniGame>(null);
  const [completedGames, setCompletedGames] = useState<Set<string>>(new Set());

  const miniGames = [
    {
      id: 'letterhunt',
      title: 'Letter Hunt',
      icon: Search,
      emoji: '🔎',
      description: 'Find and catch the right letters!',
      component: LetterHunt,
      learningGoal: 'Letter recognition + phonics',
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'webarletterhunt',
      title: 'WebAR Letter Hunt',
      icon: Camera,
      emoji: '📸',
      description: 'Use your camera to find 3D letters and spell words!',
      component: WebARLetterHunt,
      learningGoal: 'AR word spelling + letter detection',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'buildword',
      title: 'Build the Word',
      icon: Puzzle,
      emoji: '🧩',
      description: 'Drag letters to make words!',
      component: BuildTheWord,
      learningGoal: 'Spelling + phonemic awareness',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'colorshape',
      title: 'Color & Shape Sorter',
      icon: Palette,
      emoji: '🎨',
      description: 'Match shapes and colors to objects!',
      component: ColorShapeSorter,
      learningGoal: 'Visual recognition, object association',
      color: 'from-pink-500 to-rose-600'
    }
  ];

  const handleGameComplete = (gameId: string, score: number) => {
    setCompletedGames(prev => new Set([...prev, gameId]));
    triggerConfetti('achievement');
    
    if (userProfile.soundFxEnabled) {
      SpeechUtils.speak(`Congratulations! You completed ${miniGames.find(g => g.id === gameId)?.title}!`);
    }
  };

  const handleBackToMenu = () => {
    setActiveMiniGame(null);
  };

  const handleGameSelect = (gameId: string) => {
    setActiveMiniGame(gameId as MiniGame);
    
    if (userProfile.soundFxEnabled) {
      const game = miniGames.find(g => g.id === gameId);
      SpeechUtils.speak(`Starting ${game?.title}. ${game?.description}`);
    }
  };

  // If a mini-game is active, render that game
  if (activeMiniGame) {
    const activeGame = miniGames.find(g => g.id === activeMiniGame);
    const GameComponent = activeGame?.component;

    return (
      <Layout>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {/* Game Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative bg-gradient-to-r ${activeGame?.color} rounded-2xl p-6 mb-6 text-white overflow-hidden`}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToMenu}
                    className="text-white hover:bg-white/20 mr-4"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Menu
                  </Button>
                  <h1 className="text-2xl font-bold flex items-center">
                    <span className="text-3xl mr-3">{activeGame?.emoji}</span>
                    {activeGame?.title}
                  </h1>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {activeGame?.learningGoal}
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Render active game */}
          {GameComponent && (
            <GameComponent 
              onComplete={(score: number) => handleGameComplete(activeMiniGame, score)}
              onBack={handleBackToMenu}
            />
          )}
        </div>
      </Layout>
    );
  }

  // Main menu view
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
                  {completedGames.size}/{miniGames.length} Games Completed
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground">
              Interactive AR experiences designed for dyslexia-friendly learning with multi-sensory feedback
            </p>
          </div>
        </motion.div>

        {/* Mini-Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {miniGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                  completedGames.has(game.id) 
                    ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                    : 'border-transparent hover:border-primary/30'
                }`}
                onClick={() => handleGameSelect(game.id)}
              >
                <CardHeader className="text-center pb-3">
                  <div className={`relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center mb-4`}>
                    <div className="absolute inset-0 bg-white/20 rounded-2xl" />
                    <span className="text-4xl relative z-10">{game.emoji}</span>
                    {completedGames.has(game.id) && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-xl font-bold text-center">
                    {game.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="text-center space-y-4">
                  <p className="text-muted-foreground font-medium">
                    {game.description}
                  </p>
                  
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-xs">
                      {game.learningGoal}
                    </Badge>
                  </div>

                  <div className="flex justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        SpeechUtils.speak(`${game.title}. ${game.description}. Learning goal: ${game.learningGoal}`);
                      }}
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGameSelect(game.id);
                      }}
                      className={`bg-gradient-to-r ${game.color} hover:opacity-90 text-white flex-1`}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Launch AR
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Instructions Card */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2 text-primary" />
              How to Play AR Games
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Choose a Game</p>
                  <p className="text-muted-foreground">Click on any mini-card to start</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 dark:text-green-400 font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium">Interact with AR</p>
                  <p className="text-muted-foreground">Touch, drag, and tap in 3D space</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium">Learn & Have Fun</p>
                  <p className="text-muted-foreground">Complete activities to earn badges</p>
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