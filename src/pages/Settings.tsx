import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/shared/Layout';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('notifications') === 'enabled';
  });

  const handleToggleTheme = () => {
    toggleTheme();
    toast({ title: 'Theme changed', description: `Theme is now ${theme === 'light' ? 'dark' : 'light'}.` });
  };

  const handleToggleNotifications = () => {
    const newState = !notifications;
    setNotifications(newState);
    localStorage.setItem('notifications', newState ? 'enabled' : 'disabled');
    toast({ title: 'Notifications', description: newState ? 'Enabled' : 'Disabled' });
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
          Settings
        </motion.h2>
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-blue-50 rounded-lg p-4 shadow hover:shadow-lg transition-shadow flex justify-between items-center"
          >
            <span className="font-semibold text-blue-600">Theme</span>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={handleToggleTheme}
            >
              Toggle to {theme === 'light' ? 'Dark' : 'Light'}
            </button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-blue-50 rounded-lg p-4 shadow hover:shadow-lg transition-shadow flex justify-between items-center"
          >
            <span className="font-semibold text-blue-600">Notifications</span>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${notifications ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-blue-700 hover:bg-gray-400'}`}
              onClick={handleToggleNotifications}
            >
              {notifications ? 'Disable' : 'Enable'}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Settings;
