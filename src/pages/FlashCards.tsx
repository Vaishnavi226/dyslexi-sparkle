import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Volume2, ArrowLeft, ArrowRight, RefreshCw, Check } from 'lucide-react';
import Layout from '@/components/shared/Layout';
import flashcards from '@/data/flashcards.json';
import { useTheme } from '@/contexts/ThemeContext';

const dyslexiaFont = {
  fontFamily: 'Arial, Verdana, Tahoma, sans-serif',
  letterSpacing: '0.05em',
  fontSize: '1.5rem',
};

const letterStyle = {
  display: 'inline-block',
  color: '#3b82f6', // Blue-500, visible in both modes
  fontWeight: 'bold',
  fontSize: '2.5rem',
  marginRight: '8px',
};

const FlashCards: React.FC = () => {
  const { theme } = useTheme();
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const card = flashcards[current];
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  
  // Dynamic styles based on theme
  const textColor = theme === 'dark' ? 'text-slate-200' : 'text-slate-800';
  const cardBg = theme === 'dark' 
    ? 'bg-gradient-to-br from-slate-800 to-slate-700' 
    : 'bg-gradient-to-br from-white to-blue-50';
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesisRef.current = window.speechSynthesis;
    }
  }, []);

  useEffect(() => {
    setFlipped(false);
    setShowSuccess(false);
  }, [current]);
  
  const speakText = (text: string) => {
    if (speechSynthesisRef.current) {
      // Cancel any ongoing speech
      speechSynthesisRef.current.cancel();
      
      // Create and configure utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8; // Slightly slower for better comprehension
      utterance.pitch = 1.2; // Slightly higher pitch for children
      
      // Speak the text
      speechSynthesisRef.current.speak(utterance);
    }
  };

  const nextCard = () => {
    setIsRotating(true);
    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % flashcards.length);
      setIsRotating(false);
    }, 300);
  };
  
  const prevCard = () => {
    setIsRotating(true);
    setTimeout(() => {
      setCurrent((prev) => (prev - 1 + flashcards.length) % flashcards.length);
      setIsRotating(false);
    }, 300);
  };
  
  const handleFlip = () => setFlipped(!flipped);
  
  const handleCheckClick = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);
  };
  
  const letter = card.title.split(' ')[0];
  const contentWithoutLetter = card.content.replace(`${letter} `, '');

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <motion.h1 
          className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={dyslexiaFont}
        >
          Fun Flashcards
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            rotateY: isRotating ? 90 : 0
          }}
          transition={{ duration: 0.3 }}
          className={`${cardBg} border-4 border-blue-300 rounded-2xl shadow-xl p-8 max-w-md w-full relative overflow-hidden`}
          style={{ 
            perspective: '1000px',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Card Number Indicator */}
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
            {current + 1} / {flashcards.length}
          </div>
          
          {/* Front of Card */}
          <motion.div
            initial={false}
            animate={{ rotateY: flipped ? 180 : 0, opacity: flipped ? 0 : 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <h2 style={{ ...dyslexiaFont }} className={`mb-4 text-center font-bold text-2xl ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>
              {card.title}
            </h2>
            
            <motion.div 
              className="mb-6 w-32 h-32 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
            >
              <img 
                src={card.image_url} 
                alt={card.title} 
                className="max-w-full max-h-full object-contain drop-shadow-md" 
              />
            </motion.div>
            
            <div className="mb-6 text-center w-full">
              <div style={dyslexiaFont} className="mb-2 flex items-center justify-center">
                <span style={letterStyle}>{letter}</span>
                <span className={`text-xl ${textColor}`}>{contentWithoutLetter}</span>
              </div>
              
              <button 
                onClick={() => speakText(card.content)} 
                className="flex items-center justify-center mt-2 px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-full transition-colors mx-auto"
                aria-label="Listen to pronunciation"
              >
                <Volume2 size={18} className="mr-1" /> Listen
              </button>
            </div>
            
            <button
              onClick={handleFlip}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors w-full"
            >
              See Challenge
            </button>
          </motion.div>
          
          {/* Back of Card (Challenge) */}
          <motion.div
            initial={false}
            animate={{ rotateY: flipped ? 0 : -180, opacity: flipped ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center absolute inset-0 p-8"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <h3 style={{ ...dyslexiaFont }} className={`mb-6 text-center font-bold text-2xl ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>
              Challenge Time!
            </h3>
            
            <div className={`text-center mb-8 p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-slate-700 border-blue-500 text-slate-200' : 'bg-blue-100 border-blue-200 text-slate-800'}`}>
              <p className="text-lg">
                {card.content.split('Can you')[1] 
                  ? <span><strong>Can you</strong>{card.content.split('Can you')[1]}</span>
                  : 'Try to say or do what the card asks!'
                }
              </p>
            </div>
            
            <div className="flex justify-center space-x-4 w-full mb-4">
              <button
                onClick={handleCheckClick}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
              >
                <Check size={18} className="mr-1" /> I did it!
              </button>
              
              <button
                onClick={() => speakText(card.content.split('Can you')[1] || card.content)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <Volume2 size={18} className="mr-1" /> Listen
              </button>
            </div>
            
            <button
              onClick={handleFlip}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors w-full mt-2"
            >
              Back to Card
            </button>
          </motion.div>
          
          {/* Success Animation */}
          {showSuccess && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute inset-0 bg-green-500/50 backdrop-blur-sm flex items-center justify-center"
            >
              <motion.div 
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-full p-4"
              >
                <Check size={40} className="text-green-500" />
              </motion.div>
            </motion.div>
          )}
        </motion.div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 w-full max-w-md">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
            onClick={prevCard}
            aria-label="Previous Card"
          >
            <ArrowLeft size={18} className="mr-1" /> Previous
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors"
            onClick={() => {
              setIsRotating(true);
              setTimeout(() => {
                setCurrent(Math.floor(Math.random() * flashcards.length));
                setIsRotating(false);
              }, 300);
            }}
            aria-label="Random Card"
          >
            <RefreshCw size={24} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
            onClick={nextCard}
            aria-label="Next Card"
          >
            Next <ArrowRight size={18} className="ml-1" />
          </motion.button>
        </div>
      </div>
    </Layout>
  );
};

export default FlashCards;
