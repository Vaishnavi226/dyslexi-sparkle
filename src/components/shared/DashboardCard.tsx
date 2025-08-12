import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface DashboardCardProps {
  title: string;
  icon: LucideIcon;
  gradient: string;
  onClick: () => void;
  progress?: number;
  delay?: number;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon: Icon,
  gradient,
  onClick,
  progress,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className={`h-48 p-6 relative overflow-hidden card-hover ${gradient} border-0`}>
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex justify-center mb-4">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"
            >
              <Icon size={32} className="text-white" />
            </motion.div>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            {progress !== undefined && (
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: delay + 0.5 }}
                  className="bg-white h-2 rounded-full"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8" />
      </Card>
    </motion.div>
  );
};

export default DashboardCard;