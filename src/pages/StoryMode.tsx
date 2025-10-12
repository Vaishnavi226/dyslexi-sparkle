import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Cylinder, Torus, Html, Environment } from '@react-three/drei';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Book,
  Star,
  Award,
  Rocket,
  Gamepad2,
  Video,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/shared/Layout';
import { useGame } from '@/contexts/GameContext';
import { SpeechUtils } from '@/utils/speechUtils';
import { triggerConfetti, triggerStarConfetti } from '@/utils/confetti';
import StoryCharacter from '@/components/story/StoryCharacter';
import MiniActivity from '@/components/story/MiniActivity';
import * as THREE from 'three';

interface Story {
  id: number;
  title: string;
  description: string;
  video: string;
  narration: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
  scene: 'forest' | 'ocean' | 'space' | 'castle' | 'garden';
  characters: string[];
  vrStoryPath?: string;
}

const stories: Story[] = [
  {
    id: 1,
    title: "The Lost Star",
    description: "Help Luna the glowing star find her way home through the magical cosmos with her new friends.",
    video: "/placeholder.mp4",
    narration: [
      "Luna was a bright little star who loved to shine and sparkle in the night sky.",
      "One day, a strong cosmic wind blew Luna far away from her star family.",
      "She found herself in a strange part of space, feeling scared and alone.",
      "But Luna was brave! She decided to explore and make new friends on her journey home.",
      "With the help of friendly planets and comets, Luna learned that being different makes you special."
    ],
    difficulty: 'easy',
    duration: '2 min',
    scene: 'space',
    characters: ['Luna the Star', 'Planet Friends', 'Cosmic Helpers'],
    vrStoryPath: '/vrstories/strory1.html'
  },
  {
    id: 2,
    title: "The Talking Tree",
    description: "Meet Oakley, the wise old tree who loves to tell riddles and share stories with forest friends.",
    video: "/placeholder.mp4",
    narration: [
      "Deep in the Whispering Woods lived Oakley, a magnificent oak tree who could speak.",
      "Oakley loved to tell jokes and riddles to any creature that would listen.",
      "One sunny morning, a little squirrel named Nutkin came to visit Oakley.",
      "Oakley shared ancient wisdom about friendship, kindness, and growing strong like a tree.",
      "Nutkin learned that the best treasures in life are the friends we make along the way."
    ],
    difficulty: 'easy',
    duration: '2 min',
    scene: 'forest',
    characters: ['Oakley the Tree', 'Nutkin the Squirrel', 'Forest Friends'],
    vrStoryPath: '/vrstories/story2.html'
  },
  {
    id: 3,
    title: "The Brave Little Rocket",
    description: "Join Zoomy the rocket as he learns to fly with confidence and discovers new worlds.",
    video: "/placeholder.mp4",
    narration: [
      "Zoomy was a small red rocket who dreamed of soaring through space.",
      "He watched the big rockets blast off but felt too scared to try himself.",
      "One day, his friend Stella the satellite encouraged him to be brave.",
      "With a countdown of 5-4-3-2-1, Zoomy finally launched into the starry sky!",
      "He discovered that courage grows when you believe in yourself and try new things."
    ],
    difficulty: 'medium',
    duration: '2 min',
    scene: 'space',
    characters: ['Zoomy the Rocket', 'Stella the Satellite', 'Space Crew'],
    vrStoryPath: '/vrstories/story3.html'
  },
  {
    id: 4,
    title: "The Magic Book",
    description: "Discover the adventures of Paige, a magical book whose letters come alive to tell amazing stories.",
    video: "/placeholder.mp4",
    narration: [
      "In the Grand Library lived Paige, a special book filled with colorful, dancing letters.",
      "When children opened Paige, her letters would jump off the pages and come to life!",
      "The letters would form words, and the words would create magical pictures in the air.",
      "Paige taught children that reading opens doors to infinite worlds and adventures.",
      "Every story Paige told sparked imagination and filled hearts with wonder and joy."
    ],
    difficulty: 'medium',
    duration: '2 min',
    scene: 'castle',
    characters: ['Paige the Book', 'Dancing Letters', 'Young Readers']
  },
  {
    id: 5,
    title: "The Friendly Dinosaur",
    description: "Explore the colorful Candy Jungle with Dino, a gentle dinosaur who loves sweet adventures.",
    video: "/placeholder.mp4",
    narration: [
      "In the magical Candy Jungle lived Dino, a friendly green dinosaur with a sweet tooth.",
      "The jungle was filled with chocolate trees, gummy flower bushes, and candy cane vines.",
      "Dino loved to help his friends find the sweetest treats and share them with everyone.",
      "One day, he discovered a hidden valley filled with rainbow-colored candy crystals.",
      "Dino learned that sharing sweet treats with friends makes everything taste even better!"
    ],
    difficulty: 'hard',
    duration: '2 min',
    scene: 'garden',
    characters: ['Dino the Dinosaur', 'Candy Creatures', 'Sweet Friends']
  }
];

const StoryMode: React.FC = () => {
  const { userProgress, updateProgress, addXP, userProfile } = useGame();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showActivity, setShowActivity] = useState(false);
  const [completedStories, setCompletedStories] = useState<number[]>([]);

  const currentStory = stories[currentStoryIndex];

  const handleActivityComplete = (score: number) => {
    setShowActivity(false);
    setCompletedStories(prev => [...prev, currentStory.id]);
    
    const stars = currentStory.difficulty === 'easy' ? 1 : currentStory.difficulty === 'medium' ? 2 : 3;
    
    updateProgress('storyMode', {
      score: score,
      storiesCompleted: completedStories.length + 1,
      stars
    });
    
    addXP(stars * 15);
    
    if (userProfile.soundFxEnabled) {
      triggerStarConfetti(stars);
    }
    
    SpeechUtils.speak('Amazing job! You completed the story mission!');
  };

  const handleStoryClick = (story: Story) => {
    if (story.vrStoryPath) {
      // Open VR story in a new window or navigate to it
      window.open(story.vrStoryPath, '_blank');
    } else {
      // Fallback to showing activity
      setCurrentStoryIndex(story.id - 1);
      setShowActivity(true);
    }
  };

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center">
              <Rocket className="w-8 h-8 mr-3 text-primary" />
              Space Story Adventures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story, index) => (
                <Card 
                  key={story.id} 
                  className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                  onClick={() => handleStoryClick(story)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg">{story.title}</h3>
                      {story.vrStoryPath && (
                        <Badge variant="secondary" className="ml-2">
                          <Eye className="w-3 h-3 mr-1" />
                          VR
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{story.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{story.difficulty}</Badge>
                      <span className="text-xs text-muted-foreground">{story.duration}</span>
                    </div>
                    {completedStories.includes(story.id) && (
                      <div className="mt-2 flex items-center text-green-600 text-sm">
                        <Award className="w-4 h-4 mr-1" />
                        Completed
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <MiniActivity
          storyId={currentStory.id}
          storyTitle={currentStory.title}
          onComplete={handleActivityComplete}
          isVisible={showActivity}
        />
      </div>
    </Layout>
  );
};

export default StoryMode;