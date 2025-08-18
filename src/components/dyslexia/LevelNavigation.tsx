import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Trophy } from 'lucide-react';

interface Level {
  id: number;
  title: string;
  description: string;
  difficulty: number;
  requiredStars: number;
  unlocked: boolean;
  completed: boolean;
  stars: number;
  bestScore: number;
}

interface LevelNavigationProps {
  levels: Level[];
  currentLevel: Level | null;
  totalStars: number;
  onLevelSelect: (level: Level) => void;
}

const LevelNavigation: React.FC<LevelNavigationProps> = ({
  levels,
  currentLevel,
  totalStars,
  onLevelSelect
}) => {
  const completedLevels = levels.filter(l => l.completed).length;
  const progressPercentage = (completedLevels / levels.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card className="cosmic-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Cosmic Reading Quest
              </h2>
              <p className="text-muted-foreground">
                Master reading through 20 galactic levels!
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Star className="w-5 h-5 mr-2" />
                {totalStars} Stars
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Trophy className="w-5 h-5 mr-2" />
                {completedLevels}/20 Complete
              </Badge>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3 space-progress" />
          </div>
        </CardContent>
      </Card>

      {/* Level Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {levels.map((level, index) => (
          <motion.div
            key={level.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ 
              scale: level.unlocked ? 1.05 : 1, 
              y: level.unlocked ? -5 : 0 
            }}
          >
            <Card 
              className={`
                cursor-pointer transition-all duration-300 h-full
                ${level.unlocked 
                  ? 'cosmic-card hover:shadow-xl hover:shadow-primary/30' 
                  : 'opacity-60 bg-muted/20'
                }
                ${level.completed ? 'ring-2 ring-accent shadow-lg' : ''}
                ${currentLevel?.id === level.id ? 'ring-2 ring-primary' : ''}
              `}
              onClick={() => level.unlocked && onLevelSelect(level)}
            >
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-between mb-2">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${level.unlocked 
                      ? 'bg-gradient-to-br from-primary to-accent text-white' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {level.id}
                  </div>
                  
                  {level.completed && (
                    <div className="flex">
                      {Array.from({ length: level.stars }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  )}
                </div>
                
                <h3 className="font-semibold text-xs mb-1 line-clamp-2">{level.title}</h3>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {level.description}
                </p>
                
                {!level.unlocked && (
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Star className="w-3 h-3" />
                    {level.requiredStars}
                  </div>
                )}
                
                {level.completed && (
                  <div className="text-xs text-accent font-medium">
                    Best: {level.bestScore}%
                  </div>
                )}
                
                {level.unlocked && !level.completed && (
                  <div className="text-xs text-primary font-medium">
                    Ready!
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LevelNavigation;