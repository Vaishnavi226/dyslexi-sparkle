import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, RotateCcw, Volume2, ZoomIn, ZoomOut, RotateCw, Palette, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import Layout from '@/components/shared/Layout';
import { useGame } from '@/contexts/GameContext';
import { SpeechUtils } from '@/utils/speechUtils';
import { triggerConfetti } from '@/utils/confetti';

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

const ar3DObjects: AR3DObject[] = [
  { id: 'apple', name: 'Apple', letter: 'A', emoji: '🍎', color: '#FF6B6B', rotation: { x: 0, y: 0, z: 0 }, scale: 1, position: { x: 0, y: 0, z: 0 } },
  { id: 'ball', name: 'Ball', letter: 'B', emoji: '⚽', color: '#4ECDC4', rotation: { x: 0, y: 0, z: 0 }, scale: 1, position: { x: 0, y: 0, z: 0 } },
  { id: 'cat', name: 'Cat', letter: 'C', emoji: '🐱', color: '#45B7D1', rotation: { x: 0, y: 0, z: 0 }, scale: 1, position: { x: 0, y: 0, z: 0 } },
  { id: 'dog', name: 'Dog', letter: 'D', emoji: '🐕', color: '#96CEB4', rotation: { x: 0, y: 0, z: 0 }, scale: 1, position: { x: 0, y: 0, z: 0 } },
  { id: 'elephant', name: 'Elephant', letter: 'E', emoji: '🐘', color: '#FFEAA7', rotation: { x: 0, y: 0, z: 0 }, scale: 1, position: { x: 0, y: 0, z: 0 } },
  { id: 'fish', name: 'Fish', letter: 'F', emoji: '🐟', color: '#DDA0DD', rotation: { x: 0, y: 0, z: 0 }, scale: 1, position: { x: 0, y: 0, z: 0 } }
];

const ARPlayground: React.FC = () => {
  const { userProfile, updateProgress, addXP } = useGame();
  const [selectedObject, setSelectedObject] = useState<AR3DObject>(ar3DObjects[0]);
  const [isRotating, setIsRotating] = useState(false);
  const [experimentsCompleted, setExperimentsCompleted] = useState(0);
  const [currentRotation, setCurrentRotation] = useState({ x: 0, y: 0, z: 0 });
  const [currentScale, setCurrentScale] = useState(1);
  const [backgroundColor, setBackgroundColor] = useState('#f0f9ff');
  
  const animationRef = useRef<number>();

  useEffect(() => {
    if (isRotating) {
      const animate = () => {
        setCurrentRotation(prev => ({
          ...prev,
          y: (prev.y + 2) % 360
        }));
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRotating]);

  const selectObject = (object: AR3DObject) => {
    setSelectedObject(object);
    setCurrentRotation({ x: 0, y: 0, z: 0 });
    setCurrentScale(1);
    setExperimentsCompleted(prev => prev + 1);
    
    if (userProfile.ttsEnabled) {
      SpeechUtils.speak(`${object.letter} for ${object.name}`, {
        rate: userProfile.ttsRate,
        volume: userProfile.ttsVolume
      });
    }

    if (userProfile.soundFxEnabled) {
      triggerConfetti('success');
    }
  };

  const resetObject = () => {
    setCurrentRotation({ x: 0, y: 0, z: 0 });
    setCurrentScale(1);
    setIsRotating(false);
  };

  const toggleRotation = () => {
    setIsRotating(!isRotating);
  };

  const speakObjectInfo = () => {
    SpeechUtils.speak(
      `This is the letter ${selectedObject.letter} for ${selectedObject.name}. You can rotate and scale this 3D object.`,
      {
        rate: userProfile.ttsRate,
        volume: userProfile.ttsVolume
      }
    );
  };

  const completeExperiment = () => {
    const score = Math.min(experimentsCompleted * 10, 100);
    const stars = score >= 90 ? 3 : score >= 60 ? 2 : score >= 30 ? 1 : 0;
    
    updateProgress('arPlayground', {
      score,
      experimentsCompleted,
      stars
    });
    
    addXP(stars * 15);
    
    if (userProfile.soundFxEnabled) {
      triggerConfetti('achievement');
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Box className="w-8 h-8 mr-3 text-primary" />
                  AR Playground
                </CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Sparkles className="w-5 h-5 text-yellow-500 mr-1" />
                    <span className="font-bold">{experimentsCompleted} Experiments</span>
                  </div>
                  <Button onClick={completeExperiment} variant="outline" size="sm">
                    Finish Session
                  </Button>
                </div>
              </div>
              <p className="text-muted-foreground">
                Explore 3D letters and words in an interactive AR-like environment
              </p>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Object Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Choose an Object</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {ar3DObjects.map((object, index) => (
                      <motion.button
                        key={object.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => selectObject(object)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedObject.id === object.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="text-3xl mb-2">{object.emoji}</div>
                        <div className="text-sm font-medium">{object.letter}</div>
                        <div className="text-xs text-muted-foreground">{object.name}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* 3D Viewer */}
                <div className="lg:col-span-2">
                  <div 
                    className="relative h-96 rounded-lg border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor }}
                  >
                    {/* Background Grid */}
                    <div 
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `
                          linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px'
                      }}
                    />
                    
                    {/* 3D Object */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedObject.id}
                        initial={{ opacity: 0, scale: 0, rotateY: -180 }}
                        animate={{ 
                          opacity: 1, 
                          scale: currentScale,
                          rotateY: currentRotation.y,
                          rotateX: currentRotation.x,
                          rotateZ: currentRotation.z
                        }}
                        exit={{ opacity: 0, scale: 0, rotateY: 180 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className="relative"
                        style={{
                          transformStyle: 'preserve-3d',
                          filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))'
                        }}
                      >
                        {/* Main Object */}
                        <div className="relative">
                          <div 
                            className="text-9xl font-bold select-none"
                            style={{ 
                              color: selectedObject.color,
                              textShadow: '0 4px 8px rgba(0,0,0,0.3)'
                            }}
                          >
                            {selectedObject.emoji}
                          </div>
                          
                          {/* Letter Overlay */}
                          <div 
                            className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-white mix-blend-overlay"
                            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
                          >
                            {selectedObject.letter}
                          </div>
                        </div>

                        {/* Floating particles */}
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-primary/50 rounded-full"
                            animate={{
                              x: [0, Math.random() * 100 - 50],
                              y: [0, Math.random() * 100 - 50],
                              opacity: [0.5, 0, 0.5]
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              delay: i * 0.5
                            }}
                            style={{
                              left: `${50 + Math.random() * 40 - 20}%`,
                              top: `${50 + Math.random() * 40 - 20}%`
                            }}
                          />
                        ))}
                      </motion.div>
                    </AnimatePresence>

                    {/* Object Info */}
                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-lg">
                      <div className="font-bold">{selectedObject.letter} - {selectedObject.name}</div>
                      <div className="text-xs opacity-75">
                        Scale: {currentScale.toFixed(1)}x | Rotation: {Math.round(currentRotation.y)}°
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Scale</label>
                      <Slider
                        value={[currentScale]}
                        onValueChange={(value) => setCurrentScale(value[0])}
                        min={0.5}
                        max={2}
                        step={0.1}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rotation X</label>
                      <Slider
                        value={[currentRotation.x]}
                        onValueChange={(value) => setCurrentRotation(prev => ({ ...prev, x: value[0] }))}
                        min={-180}
                        max={180}
                        step={15}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rotation Z</label>
                      <Slider
                        value={[currentRotation.z]}
                        onValueChange={(value) => setCurrentRotation(prev => ({ ...prev, z: value[0] }))}
                        min={-180}
                        max={180}
                        step={15}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Background</label>
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-full h-10 rounded border border-border"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button onClick={toggleRotation} variant="outline">
                      <RotateCw className="w-4 h-4 mr-2" />
                      {isRotating ? 'Stop' : 'Auto'} Rotate
                    </Button>
                    
                    <Button onClick={resetObject} variant="outline">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                    
                    <Button onClick={speakObjectInfo} variant="outline">
                      <Volume2 className="w-4 h-4 mr-2" />
                      Speak Info
                    </Button>
                    
                    <Button 
                      onClick={() => setCurrentScale(prev => Math.min(prev + 0.2, 2))} 
                      variant="outline"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    
                    <Button 
                      onClick={() => setCurrentScale(prev => Math.max(prev - 0.2, 0.5))} 
                      variant="outline"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">How to Use:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Click on different objects to explore letters and words</li>
                  <li>• Use the sliders to scale and rotate objects in 3D space</li>
                  <li>• Change the background color to create different environments</li>
                  <li>• Enable auto-rotation to see objects from all angles</li>
                  <li>• Listen to pronunciations with the Speak Info button</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ARPlayground;