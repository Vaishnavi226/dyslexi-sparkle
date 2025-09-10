import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  BookOpen, 
  Palette, 
  Gamepad2, 
  Brain,
  Camera
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/shared/Layout';

const ARPlayground: React.FC = () => {
  const [activeTab, setActiveTab] = useState('letters');

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
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                Coming Soon
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Interactive AR experiences designed for dyslexia-friendly learning with multi-sensory feedback
            </p>
          </div>
        </motion.div>

        {/* Main AR Playground Card */}
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
                  <Box className="w-4 h-4" />
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

              {/* Empty placeholder tabs */}
              <TabsContent value="letters" className="space-y-6">
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2 text-muted-foreground">Reading & Letter Recognition</h3>
                  <p className="text-muted-foreground">Coming soon...</p>
                </div>
              </TabsContent>

              <TabsContent value="words" className="space-y-6">
                <div className="text-center py-12">
                  <Box className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2 text-muted-foreground">Word Building</h3>
                  <p className="text-muted-foreground">Coming soon...</p>
                </div>
              </TabsContent>

              <TabsContent value="creative" className="space-y-6">
                <div className="text-center py-12">
                  <Palette className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2 text-muted-foreground">Creative Playground</h3>
                  <p className="text-muted-foreground">Coming soon...</p>
                </div>
              </TabsContent>

              <TabsContent value="games" className="space-y-6">
                <div className="text-center py-12">
                  <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2 text-muted-foreground">Game Activities</h3>
                  <p className="text-muted-foreground">Coming soon...</p>
                </div>
              </TabsContent>

              <TabsContent value="support" className="space-y-6">
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2 text-muted-foreground">Dyslexia Support</h3>
                  <p className="text-muted-foreground">Coming soon...</p>
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