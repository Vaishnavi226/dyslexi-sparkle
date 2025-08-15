import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Cylinder, Torus, Html } from '@react-three/drei';
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
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/shared/Layout';
import { useGame } from '@/contexts/GameContext';
import { SpeechUtils } from '@/utils/speechUtils';
import { triggerConfetti, triggerStarConfetti } from '@/utils/confetti';
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
}

const stories: Story[] = [
  {
    id: 1,
    title: "The Magic Forest Adventure",
    description: "Join Luna the rabbit on her journey through an enchanted forest filled with talking trees and magical creatures.",
    video: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", // placeholder
    narration: [
      "Once upon a time, in a magical forest far away, lived a curious little rabbit named Luna.",
      "Luna loved to explore and discover new things every day.",
      "One morning, she heard a soft whisper coming from the ancient oak tree.",
      "The tree told her about a hidden treasure that could help all the forest animals.",
      "With courage in her heart, Luna began her amazing adventure."
    ],
    difficulty: 'easy',
    duration: '5 min',
    scene: 'forest',
    characters: ['Luna the Rabbit', 'Wise Oak Tree', 'Forest Animals']
  },
  {
    id: 2,
    title: "Under the Sea Discovery",
    description: "Dive deep with Captain Finn as he explores the mysterious underwater world and meets friendly sea creatures.",
    video: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4", // placeholder
    narration: [
      "Captain Finn was the bravest explorer of the seven seas.",
      "He had a special submarine that could take him to the deepest parts of the ocean.",
      "On this particular day, he discovered a beautiful coral city.",
      "The fish there spoke in bubbles and sang the most melodious songs.",
      "Finn learned that friendship exists everywhere, even in the depths of the sea."
    ],
    difficulty: 'easy',
    duration: '6 min',
    scene: 'ocean',
    characters: ['Captain Finn', 'Coral Fish', 'Sea Turtle']
  },
  {
    id: 3,
    title: "Journey to the Stars",
    description: "Blast off with Astronaut Zara as she travels through space and visits different planets in our galaxy.",
    video: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4", // placeholder
    narration: [
      "Astronaut Zara always dreamed of visiting distant planets.",
      "Her spaceship was equipped with the latest technology for space exploration.",
      "First, she visited the red planet Mars, where she found interesting rock formations.",
      "Then she traveled to a planet covered entirely in purple crystals.",
      "Each planet taught her something new about the wonders of our universe."
    ],
    difficulty: 'medium',
    duration: '7 min',
    scene: 'space',
    characters: ['Astronaut Zara', 'Robot Helper', 'Alien Friends']
  },
  {
    id: 4,
    title: "The Brave Knight's Quest",
    description: "Follow Sir Alex on a noble quest to save the kingdom and learn about courage, friendship, and determination.",
    video: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", // placeholder
    narration: [
      "In a kingdom long ago, lived a young knight named Sir Alex.",
      "The kingdom was in trouble because a dragon had taken all the gold.",
      "But Sir Alex discovered that the dragon was actually very lonely.",
      "Instead of fighting, Alex decided to become the dragon's friend.",
      "Together, they worked to make the kingdom a better place for everyone."
    ],
    difficulty: 'medium',
    duration: '8 min',
    scene: 'castle',
    characters: ['Sir Alex', 'Friendly Dragon', 'Village People']
  },
  {
    id: 5,
    title: "The Secret Garden Mystery",
    description: "Explore with Maya as she uncovers the secrets of a magical garden where flowers sing and butterflies paint rainbows.",
    video: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4", // placeholder
    narration: [
      "Maya found an old key hidden in her grandmother's attic.",
      "The key opened a gate to the most beautiful garden she had ever seen.",
      "In this garden, flowers could sing lullabies and tell stories.",
      "Butterflies painted rainbows across the sky with their colorful wings.",
      "Maya learned that nature holds the most wonderful secrets of all."
    ],
    difficulty: 'hard',
    duration: '9 min',
    scene: 'garden',
    characters: ['Maya', 'Singing Flowers', 'Rainbow Butterflies']
  }
];

// 3D Scene Components
const AnimatedSphere = ({ position, color, speed }: { position: [number, number, number], color: string, speed: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * speed;
      meshRef.current.rotation.y += delta * speed * 0.5;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.2;
    }
  });

  return (
    <Sphere ref={meshRef} position={position} args={[0.5, 32, 32]}>
      <meshStandardMaterial color={color} />
    </Sphere>
  );
};

const StoryScene = ({ scene, isPlaying }: { scene: Story['scene'], isPlaying: boolean }) => {
  const sceneElements = useMemo(() => {
    switch (scene) {
      case 'forest':
        return (
          <>
            <AnimatedSphere position={[-2, 1, 0]} color="#4ade80" speed={0.5} />
            <AnimatedSphere position={[2, 1.5, -1]} color="#22c55e" speed={0.3} />
            <Box position={[0, -0.5, 0]} args={[0.5, 1, 0.5]}>
              <meshStandardMaterial color="#8b4513" />
            </Box>
            <Text
              position={[0, 2, 0]}
              fontSize={0.3}
              color="#15803d"
              anchorX="center"
              anchorY="middle"
            >
              Magical Forest
            </Text>
          </>
        );
      case 'ocean':
        return (
          <>
            <AnimatedSphere position={[-1, 0, 1]} color="#06b6d4" speed={0.4} />
            <AnimatedSphere position={[1, -0.5, 0]} color="#0891b2" speed={0.6} />
            <Torus position={[0, 1, -1]} args={[0.5, 0.2, 16, 32]}>
              <meshStandardMaterial color="#0369a1" />
            </Torus>
            <Text
              position={[0, 2, 0]}
              fontSize={0.3}
              color="#0ea5e9"
              anchorX="center"
              anchorY="middle"
            >
              Ocean Deep
            </Text>
          </>
        );
      case 'space':
        return (
          <>
            <AnimatedSphere position={[-2, 0, 0]} color="#8b5cf6" speed={0.7} />
            <AnimatedSphere position={[1, 1, -2]} color="#a855f7" speed={0.4} />
            <AnimatedSphere position={[0, -1, 1]} color="#c084fc" speed={0.5} />
            <Text
              position={[0, 2.5, 0]}
              fontSize={0.3}
              color="#a855f7"
              anchorX="center"
              anchorY="middle"
            >
              Space Adventure
            </Text>
          </>
        );
      case 'castle':
        return (
          <>
            <Box position={[0, 0, 0]} args={[1, 1.5, 1]}>
              <meshStandardMaterial color="#6b7280" />
            </Box>
            <Cylinder position={[-1, 0, -1]} args={[0.3, 0.3, 2, 8]}>
              <meshStandardMaterial color="#4b5563" />
            </Cylinder>
            <Cylinder position={[1, 0, -1]} args={[0.3, 0.3, 2, 8]}>
              <meshStandardMaterial color="#4b5563" />
            </Cylinder>
            <Text
              position={[0, 2, 0]}
              fontSize={0.3}
              color="#6b7280"
              anchorX="center"
              anchorY="middle"
            >
              Royal Castle
            </Text>
          </>
        );
      case 'garden':
        return (
          <>
            <AnimatedSphere position={[-1, 0.5, 0]} color="#f59e0b" speed={0.3} />
            <AnimatedSphere position={[1, 0.8, -0.5]} color="#ef4444" speed={0.4} />
            <AnimatedSphere position={[0, 0.3, 1]} color="#ec4899" speed={0.6} />
            <Box position={[0, -0.8, 0]} args={[3, 0.2, 3]}>
              <meshStandardMaterial color="#22c55e" />
            </Box>
            <Text
              position={[0, 2, 0]}
              fontSize={0.3}
              color="#f59e0b"
              anchorX="center"
              anchorY="middle"
            >
              Secret Garden
            </Text>
          </>
        );
      default:
        return null;
    }
  }, [scene]);

  return (
    <group>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      {sceneElements}
    </group>
  );
};

const StoryMode: React.FC = () => {
  const { userProgress, updateProgress, addXP, userProfile } = useGame();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentNarrationIndex, setCurrentNarrationIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [completedStories, setCompletedStories] = useState<number[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentStory = stories[currentStoryIndex];
  const progress = ((currentNarrationIndex + 1) / currentStory.narration.length) * 100;

  const playNarration = () => {
    if (currentNarrationIndex < currentStory.narration.length) {
      setIsPlaying(true);
      SpeechUtils.speak(currentStory.narration[currentNarrationIndex], {
        rate: userProfile.ttsRate,
        volume: userProfile.ttsVolume,
        onEnd: () => {
          setIsPlaying(false);
          if (currentNarrationIndex < currentStory.narration.length - 1) {
            setTimeout(() => {
              setCurrentNarrationIndex(prev => prev + 1);
            }, 1000);
          } else {
            completeStory();
          }
        }
      });
    }
  };

  const stopNarration = () => {
    SpeechUtils.stopSpeaking();
    setIsPlaying(false);
  };

  const completeStory = () => {
    if (!completedStories.includes(currentStory.id)) {
      setCompletedStories(prev => [...prev, currentStory.id]);
      const stars = currentStory.difficulty === 'easy' ? 1 : currentStory.difficulty === 'medium' ? 2 : 3;
      
      updateProgress('storyMode', {
        score: 100,
        storiesCompleted: completedStories.length + 1,
        stars
      });
      
      addXP(stars * 15);
      
      if (userProfile.soundFxEnabled) {
        triggerStarConfetti(stars);
      }
    }
  };

  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setCurrentNarrationIndex(0);
      setIsPlaying(false);
    }
  };

  const previousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setCurrentNarrationIndex(0);
      setIsPlaying(false);
    }
  };

  const restartStory = () => {
    setCurrentNarrationIndex(0);
    setIsPlaying(false);
    SpeechUtils.stopSpeaking();
  };

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="glass mb-6">
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <CardTitle className="text-2xl md:text-3xl font-bold flex items-center">
                  <Book className="w-8 h-8 mr-3 text-primary" />
                  Story Mode
                </CardTitle>
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="text-sm">
                    {currentStory.difficulty.charAt(0).toUpperCase() + currentStory.difficulty.slice(1)}
                  </Badge>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-1" />
                    <span className="font-bold">{completedStories.length}/{stories.length}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between text-sm text-muted-foreground gap-2">
                <span>Story {currentStoryIndex + 1} of {stories.length} • {currentStory.duration}</span>
                <div className="flex items-center space-x-2">
                  <span>Characters:</span>
                  {currentStory.characters.map((character, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {character}
                    </Badge>
                  ))}
                </div>
              </div>
              <Progress value={progress} className="mt-2" />
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 3D Scene */}
                <div className="space-y-4">
                  <div className="bg-muted/30 rounded-lg overflow-hidden" style={{ height: '300px' }}>
                    <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
                      <StoryScene scene={currentStory.scene} isPlaying={isPlaying} />
                      <OrbitControls 
                        enablePan={true} 
                        enableZoom={true} 
                        enableRotate={true}
                        autoRotate={isPlaying}
                        autoRotateSpeed={0.5}
                      />
                    </Canvas>
                  </div>

                  {/* Video Player */}
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full h-48 object-cover"
                      poster="/placeholder.svg"
                      onPlay={() => setIsVideoPlaying(true)}
                      onPause={() => setIsVideoPlaying(false)}
                    >
                      <source src={currentStory.video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    
                    {/* Video Controls */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <div className="flex items-center justify-between">
                        <Button onClick={toggleVideo} variant="secondary" size="sm">
                          {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button onClick={toggleMute} variant="secondary" size="sm">
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Story Content */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold mb-2">{currentStory.title}</h3>
                    <p className="text-muted-foreground mb-4">{currentStory.description}</p>
                  </div>

                  {/* Current Narration */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentNarrationIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-muted/50 rounded-lg p-6 border-l-4 border-primary"
                    >
                      <div className="text-sm text-muted-foreground mb-2">
                        Narration {currentNarrationIndex + 1} of {currentStory.narration.length}
                      </div>
                      <div className="text-lg leading-relaxed">
                        {currentStory.narration[currentNarrationIndex]}
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Controls */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={isPlaying ? stopNarration : playNarration}
                      className="flex-1 md:flex-none"
                      disabled={currentNarrationIndex >= currentStory.narration.length}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Play Narration
                        </>
                      )}
                    </Button>

                    <Button onClick={restartStory} variant="outline">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restart
                    </Button>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between">
                    <Button
                      onClick={previousStory}
                      variant="outline"
                      disabled={currentStoryIndex === 0}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>

                    <Button
                      onClick={nextStory}
                      variant="outline"
                      disabled={currentStoryIndex === stories.length - 1}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  {/* Completion Status */}
                  {completedStories.includes(currentStory.id) && (
                    <Alert>
                      <Award className="w-4 h-4" />
                      <AlertDescription>
                        Congratulations! You've completed this story and earned {
                          currentStory.difficulty === 'easy' ? 1 : 
                          currentStory.difficulty === 'medium' ? 2 : 3
                        } stars!
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {/* Story Navigation Grid */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4">All Stories</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stories.map((story, index) => (
                    <motion.div
                      key={story.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all duration-300 ${
                          index === currentStoryIndex ? 'ring-2 ring-primary' : ''
                        } ${completedStories.includes(story.id) ? 'bg-green-50 dark:bg-green-950/20' : ''}`}
                        onClick={() => {
                          setCurrentStoryIndex(index);
                          setCurrentNarrationIndex(0);
                          setIsPlaying(false);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-sm">{story.title}</h5>
                            {completedStories.includes(story.id) && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {story.description}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <Badge variant="outline" className="text-xs">
                              {story.difficulty}
                            </Badge>
                            <span className="text-muted-foreground">{story.duration}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default StoryMode;