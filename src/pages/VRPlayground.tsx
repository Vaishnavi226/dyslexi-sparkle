import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  ExternalLink,
  Globe,
  TreePine,
  Calculator,
  ArrowLeft,
  Volume2,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/shared/Layout';
import { useGame } from '@/contexts/GameContext';
import { SpeechUtils } from '@/utils/speechUtils';

const VRPlayground: React.FC = () => {
  const { userProfile } = useGame();
  const [visitedExperiences, setVisitedExperiences] = useState<Set<string>>(new Set());

  const vrExperiences = [
    {
      id: 'mathiland',
      title: 'Mathiland',
      icon: Calculator,
      emoji: '🔢',
      description: 'Explore a magical VR world where numbers come to life!',
      learningGoal: 'Math learning + number recognition',
      color: 'from-blue-500 to-cyan-600',
      url: '/mathiland.html'
    },
    {
      id: 'vrforest',
      title: 'VR Forest',
      icon: TreePine,
      emoji: '🌲',
      description: 'Journey through an immersive alphabet forest in VR!',
      learningGoal: 'Letter recognition + phonics',
      color: 'from-green-500 to-emerald-600',
      url: '/vrforest.html'
    }
  ];

  const handleExperienceLaunch = (experienceId: string, url: string) => {
    setVisitedExperiences(prev => new Set([...prev, experienceId]));
    
    const experience = vrExperiences.find(e => e.id === experienceId);
    if (userProfile.soundFxEnabled && experience) {
      SpeechUtils.speak(`Launching ${experience.title}. ${experience.description}`);
    }
    
    // Navigate to the VR experience in the same page
    window.location.href = url;
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
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-foreground flex items-center">
                <Box className="w-8 h-8 mr-3 text-primary animate-pulse" />
                VR Playground
              </h1>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  {visitedExperiences.size}/{vrExperiences.length} Experiences Visited
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground">
              Immersive VR experiences designed for dyslexia-friendly learning with interactive 3D environments
            </p>
          </div>
        </motion.div>

        {/* VR Experiences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vrExperiences.map((experience, index) => (
            <motion.div
              key={experience.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                  visitedExperiences.has(experience.id) 
                    ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                    : 'border-transparent hover:border-primary/30'
                }`}
                onClick={() => handleExperienceLaunch(experience.id, experience.url)}
              >
                <CardHeader className="text-center pb-3">
                  <div className={`relative mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br ${experience.color} flex items-center justify-center mb-4`}>
                    <div className="absolute inset-0 bg-white/20 rounded-2xl" />
                    <span className="text-5xl relative z-10">{experience.emoji}</span>
                    {visitedExperiences.has(experience.id) && (
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-2xl font-bold text-center">
                    {experience.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="text-center space-y-4">
                  <p className="text-muted-foreground font-medium text-lg">
                    {experience.description}
                  </p>
                  
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-sm">
                      {experience.learningGoal}
                    </Badge>
                  </div>

                  <div className="flex justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        SpeechUtils.speak(`${experience.title}. ${experience.description}. Learning goal: ${experience.learningGoal}`);
                      }}
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExperienceLaunch(experience.id, experience.url);
                      }}
                      className={`bg-gradient-to-r ${experience.color} hover:opacity-90 text-white flex-1`}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Launch VR
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
              <Info className="w-5 h-5 mr-2 text-primary" />
              How to Experience VR Worlds
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Choose an Experience</p>
                  <p className="text-muted-foreground">Click on any VR world to launch it</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 dark:text-green-400 font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium">Explore in VR</p>
                  <p className="text-muted-foreground">Use VR headset or browser controls</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium">Learn Immersively</p>
                  <p className="text-muted-foreground">Interact with 3D objects and environments</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>💡 Tip:</strong> For the best experience, use a VR headset or enable fullscreen mode in your browser. 
                Click on any experience to enter the immersive VR world!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default VRPlayground;
