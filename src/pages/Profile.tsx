import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/shared/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSave = () => {
    // In a real app, update user profile via API here
    localStorage.setItem('user', JSON.stringify({ ...user, name, email }));
    toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
    setEditMode(false);
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-2xl mx-auto mt-12 bg-white rounded-2xl shadow-xl border border-blue-100 p-8 flex flex-col items-center"
      >
        <motion.img
          src={user?.avatar ? user.avatar : "/placeholder.svg"}
          alt="Profile"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-32 h-32 rounded-full border-4 border-blue-300 mb-6 shadow-lg hover:scale-105 transition-transform duration-300"
        />
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-3xl font-bold text-blue-700 mb-2"
        >
          Your Profile
        </motion.h2>
        <p className="text-lg text-blue-500 mb-4">Welcome to your personal space!</p>
        <div className="w-full flex flex-col gap-4">
          <div className="flex justify-between items-center bg-blue-50 rounded-lg p-4 hover:shadow-md transition-shadow">
            <span className="font-semibold text-blue-600">Name:</span>
            {editMode ? (
              <input
                className="text-blue-800 bg-white border-b border-blue-300 px-2 py-1 rounded focus:outline-none"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            ) : (
              <span className="text-blue-800">{name}</span>
            )}
          </div>
          <div className="flex justify-between items-center bg-blue-50 rounded-lg p-4 hover:shadow-md transition-shadow">
            <span className="font-semibold text-blue-600">Email:</span>
            {editMode ? (
              <input
                className="text-blue-800 bg-white border-b border-blue-300 px-2 py-1 rounded focus:outline-none"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            ) : (
              <span className="text-blue-800">{email}</span>
            )}
          </div>
          <div className="flex justify-between items-center bg-blue-50 rounded-lg p-4 hover:shadow-md transition-shadow">
            <span className="font-semibold text-blue-600">Role:</span>
            <span className="text-blue-800">{user ? 'Student' : 'Guest'}</span>
          </div>
        </div>
        <div className="mt-6">
          {editMode ? (
            <>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mr-2"
                onClick={handleSave}
              >Save</button>
              <button
                className="px-4 py-2 bg-gray-300 text-blue-700 rounded-lg hover:bg-gray-400 transition-colors"
                onClick={() => setEditMode(false)}
              >Cancel</button>
            </>
          ) : (
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={() => setEditMode(true)}
            >Edit Profile</button>
          )}
        </div>
      </motion.div>
    </Layout>
  );
};

export default Profile;
