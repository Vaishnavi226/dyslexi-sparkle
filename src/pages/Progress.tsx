import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Brain, Globe, BookOpen, Box, Mic, Book, Target, Award, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import Layout from '@/components/shared/Layout';
import { useGame } from '@/contexts/GameContext';

const moduleIcons = {
  dyslexiaTest: Brain,
  spellingWorld: Globe,
  flashCards: BookOpen,
  vrPlayground: Box,
  voicePractice: Mic,
  storyMode: Book
};

const moduleNames = {
  dyslexiaTest: 'Dyslexia Test',
  spellingWorld: 'Spelling World',
  flashCards: 'Flash Cards',
  vrPlayground: 'VR Playground',
  voicePractice: 'Voice Practice',
  storyMode: 'Story Mode'
};

const moduleColors = {
  dyslexiaTest: '#FF6B6B',
  spellingWorld: '#4ECDC4',
  flashCards: '#45B7D1',
  vrPlayground: '#96CEB4',
  voicePractice: '#FFEAA7',
  storyMode: '#DDA0DD'
};

const Progress: React.FC = () => {
  const { userProgress, getOverallProgress, getWeakAreas, getRecommendations } = useGame();
  
  const overallProgress = getOverallProgress();
  const weakAreas = getWeakAreas();
  const recommendations = getRecommendations();

  // Generate sample data for charts
  const weeklyProgressData = [
    { day: 'Mon', score: 75 },
    { day: 'Tue', score: 82 },
    { day: 'Wed', score: 78 },
    { day: 'Thu', score: 85 },
    { day: 'Fri', score: 90 },
    { day: 'Sat', score: 88 },
    { day: 'Sun', score: 92 }
  ];

  const moduleScores = Object.entries(userProgress)
    .filter(([key]) => key !== 'overall')
    .map(([key, data]) => ({
      module: moduleNames[key as keyof typeof moduleNames],
      score: data.score,
      stars: data.stars,
      icon: moduleIcons[key as keyof typeof moduleIcons]
    }));

  const accuracyData = Object.entries(userProgress)
    .filter(([key]) => key !== 'overall' && 'accuracy' in userProgress[key as keyof typeof userProgress])
    .map(([key, data]) => ({
      module: moduleNames[key as keyof typeof moduleNames],
      accuracy: (data as any).accuracy,
      color: moduleColors[key as keyof typeof moduleColors]
    }));

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center space-x-4">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Learning Progress</h1>
          </div>

          {/* Overall Progress Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Overall Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="hsl(var(--muted))"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="hsl(var(--primary))"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${overallProgress * 2.51} 251`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">
                          {Math.round(overallProgress)}%
                        </span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg">Overall Progress</h3>
                  </div>

                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {userProgress.overall.level}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Current Level</h3>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(userProgress.overall.xp % 100)}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {userProgress.overall.xp % 100}/100 XP to next level
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-500 mb-2">
                      {userProgress.overall.badges.length}
                    </div>
                    <h3 className="font-semibold text-lg">Badges Earned</h3>
                    <div className="flex justify-center mt-2">
                      <Award className="w-6 h-6 text-yellow-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly Progress Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Weekly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ChartContainer
                    config={{
                      score: {
                        label: "Score",
                        color: "hsl(var(--primary))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyProgressData}>
                        <XAxis dataKey="day" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Module Progress */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Module Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {moduleScores.map((module, index) => {
                    const IconComponent = module.icon;
                    const progress = Math.min((module.score / 100) * 100, 100);
                    
                    return (
                      <motion.div
                        key={module.module}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <IconComponent className="w-5 h-5 text-primary" />
                            <span className="font-medium">{module.module}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {[...Array(3)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.5 + index * 0.1 + i * 0.1 }}
                                  className={`w-4 h-4 ml-1 ${
                                    i < module.stars ? 'text-yellow-500' : 'text-gray-300'
                                  }`}
                                >
                                  ⭐
                                </motion.div>
                              ))}
                            </div>
                            <span className="text-sm font-bold text-primary">
                              {module.score}
                            </span>
                          </div>
                        </div>
                        <ProgressBar value={progress} className="h-2" />
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            {/* Accuracy Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Accuracy by Module</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ChartContainer
                      config={{
                        accuracy: {
                          label: "Accuracy",
                          color: "hsl(var(--primary))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={accuracyData}>
                          <XAxis dataKey="module" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="accuracy" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Weak Areas and Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Weak Areas */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-orange-600">Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                {weakAreas.length > 0 ? (
                  <div className="space-y-3">
                    {weakAreas.map((area, index) => (
                      <motion.div
                        key={area}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                      >
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3" />
                        <span className="text-orange-800 dark:text-orange-200">{area}</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-green-600">
                    <div className="text-4xl mb-2">🎉</div>
                    <p className="font-medium">Great job!</p>
                    <p className="text-sm text-muted-foreground">
                      No areas need immediate attention.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-blue-600">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.map((recommendation, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                      <span className="text-blue-800 dark:text-blue-200">{recommendation}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Progress;