import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProgress {
  dyslexiaTest: {
    level: number;
    score: number;
    accuracy: number;
    speed: number;
    lastPlayed: Date;
    stars: number;
  };
  spellingWorld: {
    level: number;
    score: number;
    accuracy: number;
    lastPlayed: Date;
    stars: number;
  };
  flashCards: {
    level: number;
    score: number;
    cardsCompleted: number;
    lastPlayed: Date;
    stars: number;
  };
  vrPlayground: {
    level: number;
    score: number;
    experimentsCompleted: number;
    lastPlayed: Date;
    stars: number;
  };
  voicePractice: {
    level: number;
    score: number;
    accuracy: number;
    lastPlayed: Date;
    stars: number;
  };
  storyMode: {
    level: number;
    score: number;
    storiesCompleted: number;
    lastPlayed: Date;
    stars: number;
  };
  overall: {
    xp: number;
    level: number;
    badges: string[];
    streak: number;
    totalPlayTime: number;
  };
}

export interface UserProfile {
  name: string;
  avatar: string;
  age: number;
  preferredFont: 'default' | 'opendyslexic' | 'atkinson';
  ttsEnabled: boolean;
  soundFxEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  ttsRate: number;
  ttsVolume: number;
}

interface GameContextType {
  userProgress: UserProgress;
  userProfile: UserProfile;
  updateProgress: (module: keyof UserProgress, data: Partial<UserProgress[keyof UserProgress]>) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  addBadge: (badge: string) => void;
  addXP: (amount: number) => void;
  getOverallProgress: () => number;
  getWeakAreas: () => string[];
  getRecommendations: () => string[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const defaultProgress: UserProgress = {
  dyslexiaTest: { level: 1, score: 0, accuracy: 0, speed: 0, lastPlayed: new Date(), stars: 0 },
  spellingWorld: { level: 1, score: 0, accuracy: 0, lastPlayed: new Date(), stars: 0 },
  flashCards: { level: 1, score: 0, cardsCompleted: 0, lastPlayed: new Date(), stars: 0 },
  vrPlayground: { level: 1, score: 0, experimentsCompleted: 0, lastPlayed: new Date(), stars: 0 },
  voicePractice: { level: 1, score: 0, accuracy: 0, lastPlayed: new Date(), stars: 0 },
  storyMode: { level: 1, score: 0, storiesCompleted: 0, lastPlayed: new Date(), stars: 0 },
  overall: { xp: 0, level: 1, badges: [], streak: 0, totalPlayTime: 0 }
};

const defaultProfile: UserProfile = {
  name: 'Learning Friend',
  avatar: '🎓',
  age: 8,
  preferredFont: 'default',
  ttsEnabled: true,
  soundFxEnabled: true,
  fontSize: 'medium',
  highContrast: false,
  ttsRate: 1,
  ttsVolume: 1
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProgress, setUserProgress] = useState<UserProgress>(defaultProgress);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);

  useEffect(() => {
    const savedProgress = localStorage.getItem('dyslexia-progress');
    const savedProfile = localStorage.getItem('dyslexia-profile');
    
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dyslexia-progress', JSON.stringify(userProgress));
  }, [userProgress]);

  useEffect(() => {
    localStorage.setItem('dyslexia-profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const updateProgress = (module: keyof UserProgress, data: any) => {
    setUserProgress(prev => ({
      ...prev,
      [module]: { ...prev[module], ...data, lastPlayed: new Date() }
    }));
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...data }));
  };

  const addBadge = (badge: string) => {
    setUserProgress(prev => ({
      ...prev,
      overall: {
        ...prev.overall,
        badges: [...prev.overall.badges, badge]
      }
    }));
  };

  const addXP = (amount: number) => {
    setUserProgress(prev => {
      const newXP = prev.overall.xp + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      
      return {
        ...prev,
        overall: {
          ...prev.overall,
          xp: newXP,
          level: newLevel
        }
      };
    });
  };

  const getOverallProgress = () => {
    const modules = Object.keys(userProgress).filter(key => key !== 'overall') as Array<keyof Omit<UserProgress, 'overall'>>;
    const totalStars = modules.reduce((sum, module) => {
      const moduleData = userProgress[module];
      return sum + (moduleData as any).stars;
    }, 0);
    return Math.min((totalStars / (modules.length * 3)) * 100, 100);
  };

  const getWeakAreas = () => {
    const areas: string[] = [];
    if (userProgress.dyslexiaTest.accuracy < 60) areas.push('Letter Recognition');
    if (userProgress.spellingWorld.accuracy < 60) areas.push('Spelling');
    if (userProgress.voicePractice.accuracy < 60) areas.push('Pronunciation');
    if (userProgress.flashCards.cardsCompleted < 10) areas.push('Vocabulary');
    return areas;
  };

  const getRecommendations = () => {
    const recommendations: string[] = [];
    const weakAreas = getWeakAreas();
    
    if (weakAreas.includes('Letter Recognition')) {
      recommendations.push('Practice with Dyslexia Test daily');
    }
    if (weakAreas.includes('Spelling')) {
      recommendations.push('Complete Spelling World challenges');
    }
    if (weakAreas.includes('Pronunciation')) {
      recommendations.push('Use Voice Practice regularly');
    }
    if (weakAreas.includes('Vocabulary')) {
      recommendations.push('Review Flash Cards more often');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Keep up the great work!');
      recommendations.push('Try the AR Playground for fun learning');
      recommendations.push('Enjoy Story Mode for reading practice');
    }
    
    return recommendations;
  };

  return (
    <GameContext.Provider value={{
      userProgress,
      userProfile,
      updateProgress,
      updateProfile,
      addBadge,
      addXP,
      getOverallProgress,
      getWeakAreas,
      getRecommendations
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};