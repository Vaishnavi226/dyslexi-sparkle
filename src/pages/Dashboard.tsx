import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Globe, 
  BookOpen, 
  Box, 
  Mic, 
  Book
} from 'lucide-react';
import Layout from '@/components/shared/Layout';
import DashboardCard from '@/components/shared/DashboardCard';
import CloudBackground from '@/components/shared/CloudBackground';
import RobotIllustration from '@/components/shared/RobotIllustration';

const dashboardItems = [
  {
    title: 'Dyslexia Test',
    icon: Brain,
    gradient: 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600',
    path: '/dyslexia-test',
    progress: 65
  },
  {
    title: 'Spelling World',
    icon: Globe,
    gradient: 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600',
    path: '/spelling-world'
  },
  {
    title: 'Flash Cards',
    icon: BookOpen,
    gradient: 'bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600',
    path: '/flash-cards'
  },
  {
    title: 'AR Playground',
    icon: Box,
    gradient: 'bg-gradient-to-br from-green-400 via-green-500 to-green-600',
    path: '/ar-playground'
  },
  {
    title: 'Voice Practice',
    icon: Mic,
    gradient: 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500',
    path: '/voice-practice'
  },
  {
    title: 'Story Mode',
    icon: Book,
    gradient: 'bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600',
    path: '/story-mode'
  }
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <CloudBackground />
      <div className="relative z-10 p-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="mb-6">
            <RobotIllustration />
          </div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          >
            Welcome
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-4xl font-bold text-primary mb-4"
          >
            Dyslexia Support
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Interactive learning tools designed to help with reading, spelling, and language skills
          </motion.p>
        </motion.div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {dashboardItems.map((item, index) => (
            <DashboardCard
              key={item.title}
              title={item.title}
              icon={item.icon}
              gradient={item.gradient}
              progress={item.progress}
              delay={index * 0.1}
              onClick={() => navigate(item.path)}
            />
          ))}
        </div>

        {/* Motivational Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mt-12"
        >
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto border border-border/20">
            <p className="text-lg font-medium text-foreground mb-2">🌟 Keep Learning!</p>
            <p className="text-muted-foreground">
              Every step forward is progress. You're doing great!
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Dashboard;