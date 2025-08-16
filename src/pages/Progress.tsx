
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/shared/Layout';
import { useToast } from '@/hooks/use-toast';

const defaultProgress = [
  { label: 'Dyslexia Test', value: 80 },
  { label: 'Spelling World', value: 60 },
  { label: 'Flash Cards', value: 90 },
  { label: 'Story Mode', value: 70 },
];

const Progress: React.FC = () => {
  const { toast } = useToast();
  const [progressData, setProgressData] = useState(() => {
    const saved = localStorage.getItem('progress');
    return saved ? JSON.parse(saved) : defaultProgress;
  });

  useEffect(() => {
    localStorage.setItem('progress', JSON.stringify(progressData));
  }, [progressData]);

  const handleChange = (idx: number, value: number) => {
    const updated = progressData.map((item, i) =>
      i === idx ? { ...item, value } : item
    );
    setProgressData(updated);
    toast({ title: 'Progress updated', description: `${updated[idx].label}: ${value}%` });
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-2xl mx-auto mt-12 bg-white rounded-2xl shadow-xl border border-blue-100 p-8"
      >
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl font-bold text-blue-700 mb-6 text-center"
        >
          Your Progress
        </motion.h2>
        <div className="space-y-6">
          {progressData.map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
              className="bg-blue-50 rounded-lg p-4 shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-blue-600">{item.label}</span>
                <span className="text-blue-800 font-bold">{item.value}%</span>
              </div>
              <div className="w-full h-3 bg-blue-200 rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ duration: 0.7, delay: 0.4 + idx * 0.1 }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={item.value}
                onChange={e => handleChange(idx, Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </Layout>
  );
};

export default Progress;
