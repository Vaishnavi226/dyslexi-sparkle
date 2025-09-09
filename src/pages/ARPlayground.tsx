import React from 'react';
import { motion } from 'framer-motion';
import { Box } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/shared/Layout';

const ARPlayground: React.FC = () => {
  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-6 overflow-hidden"
        >
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <Box className="w-8 h-8 mr-3 text-primary" />
              AR Playground
            </h1>
            <p className="text-muted-foreground mt-2">
              Interactive augmented reality experiences for learning
            </p>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <Card className="min-h-96">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Box className="w-6 h-6 mr-2 text-primary" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <div className="text-center py-12">
                  <Box className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">AR Playground</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    This section is being prepared for new AR experiences. 
                    Check back soon for interactive learning activities!
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="activities" className="mt-6">
                <div className="text-center py-12">
                  <div className="text-muted-foreground mb-4">
                    <Box className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Activities</h3>
                  <p className="text-muted-foreground">
                    AR activities will be available here soon.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="mt-6">
                <div className="text-center py-12">
                  <div className="text-muted-foreground mb-4">
                    <Box className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Settings</h3>
                  <p className="text-muted-foreground">
                    AR settings and preferences will be configured here.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="progress" className="mt-6">
                <div className="text-center py-12">
                  <div className="text-muted-foreground mb-4">
                    <Box className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Progress</h3>
                  <p className="text-muted-foreground">
                    AR learning progress and achievements will be tracked here.
                  </p>
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