import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Star } from 'lucide-react';
import { SpeechUtils } from '@/utils/speechUtils';
import { triggerConfetti } from '@/utils/confetti';

interface LetterCharacterProps {
  letter: string;
  character: string;
  emoji: string;
  word: string;
  color: string;
  position: { x: number; y: number };
  isLearningMode: boolean;
  onInteract: (letter: string) => void;
  onWordFormed?: (word: string) => void;
}

const letterCharacters = {
  A: { character: 'Astronaut Alex', emoji: '👨‍🚀', word: 'Apple', sound: 'A' },
  B: { character: 'Bouncy Balloon', emoji: '🎈', word: 'Ball', sound: 'B' },
  C: { character: 'Curious Cat', emoji: '🐱', word: 'Cat', sound: 'C' },
  D: { character: 'Dancing Dog', emoji: '🐕', word: 'Dog', sound: 'D' },
  E: { character: 'Excited Elephant', emoji: '🐘', word: 'Elephant', sound: 'E' },
  F: { character: 'Flying Fish', emoji: '🐟', word: 'Fish', sound: 'F' },
  G: { character: 'Giggling Giraffe', emoji: '🦒', word: 'Giraffe', sound: 'G' },
  H: { character: 'Happy Horse', emoji: '🐴', word: 'Horse', sound: 'H' },
  I: { character: 'Icy Igloo', emoji: '🏠', word: 'Igloo', sound: 'I' },
  J: { character: 'Jumping Jaguar', emoji: '🐆', word: 'Jaguar', sound: 'J' },
  K: { character: 'Kind King', emoji: '👑', word: 'King', sound: 'K' },
  L: { character: 'Laughing Lion', emoji: '🦁', word: 'Lion', sound: 'L' },
  M: { character: 'Musical Monkey', emoji: '🐵', word: 'Monkey', sound: 'M' },
  N: { character: 'Noisy Narwhal', emoji: '🐋', word: 'Narwhal', sound: 'N' },
  O: { character: 'Optimistic Owl', emoji: '🦉', word: 'Owl', sound: 'O' },
  P: { character: 'Playful Penguin', emoji: '🐧', word: 'Penguin', sound: 'P' },
  Q: { character: 'Quiet Queen', emoji: '👸', word: 'Queen', sound: 'Q' },
  R: { character: 'Racing Rabbit', emoji: '🐰', word: 'Rabbit', sound: 'R' },
  S: { character: 'Singing Snake', emoji: '🐍', word: 'Snake', sound: 'S' },
  T: { character: 'Tall Tiger', emoji: '🐅', word: 'Tiger', sound: 'T' },
  U: { character: 'Umbrella Unicorn', emoji: '🦄', word: 'Unicorn', sound: 'U' },
  V: { character: 'Vibrant Volcano', emoji: '🌋', word: 'Volcano', sound: 'V' },
  W: { character: 'Wise Whale', emoji: '🐳', word: 'Whale', sound: 'W' },
  X: { character: 'X-ray Fish', emoji: '🐠', word: 'Xray', sound: 'X' },
  Y: { character: 'Yawning Yak', emoji: '🐂', word: 'Yak', sound: 'Y' },
  Z: { character: 'Zigzag Zebra', emoji: '🦓', word: 'Zebra', sound: 'Z' }
};

const LetterCharacter: React.FC<LetterCharacterProps> = ({
  letter,
  character,
  emoji,
  word,
  color,
  position,
  isLearningMode,
  onInteract,
  onWordFormed
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const letterData = letterCharacters[letter as keyof typeof letterCharacters];

  const handleClick = () => {
    setIsAnimating(true);
    setIsSelected(!isSelected);
    onInteract(letter);

    if (isLearningMode) {
      // Learning mode: introduce the letter
      SpeechUtils.speak(
        `Hi! I'm ${letterData.character}. This is the letter ${letter}, and ${letter} is for ${letterData.word}!`,
        {
          rate: 0.8,
          pitch: 1.2,
          onEnd: () => {
            // Play the letter sound after introduction
            setTimeout(() => {
              SpeechUtils.speak(letter, { rate: 0.6, pitch: 1.3 });
            }, 500);
          }
        }
      );
    } else {
      // Play mode: just say letter and word
      SpeechUtils.speak(`${letter} for ${letterData.word}`, {
        rate: 0.9,
        pitch: 1.1
      });
    }

    triggerConfetti('success');

    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };

  const handleDoubleClick = () => {
    // Special interaction for double click
    SpeechUtils.speak(`Let's spell with ${letter}! ${letterData.word} starts with ${letter}!`);
    triggerConfetti('achievement');
  };

  return (
    <motion.div
      className={`
        relative cursor-pointer select-none
        ${isSelected ? 'z-20' : 'z-10'}
      `}
      style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ 
        scale: isSelected ? 1.2 : 1,
        rotate: 0,
        y: isAnimating ? -20 : 0
      }}
      whileHover={{ 
        scale: isSelected ? 1.3 : 1.1,
        rotateY: 15
      }}
      whileTap={{ scale: 0.9 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Glow effect for selected letters */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${color}40, transparent)`,
            width: '120px',
            height: '120px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}

      {/* Main character container */}
      <motion.div
        className="relative bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border-2"
        style={{ borderColor: isSelected ? color : 'transparent' }}
        animate={{
          boxShadow: isSelected 
            ? `0 0 30px ${color}50` 
            : '0 4px 15px rgba(0,0,0,0.1)'
        }}
      >
        {/* Character emoji */}
        <motion.div 
          className="text-6xl text-center mb-2"
          animate={{
            rotate: isAnimating ? [0, 10, -10, 0] : 0
          }}
          transition={{ duration: 0.5 }}
        >
          {letterData.emoji}
        </motion.div>

        {/* Letter display */}
        <motion.div 
          className="text-4xl font-bold text-center mb-1"
          style={{ color }}
          animate={{
            scale: isAnimating ? [1, 1.2, 1] : 1
          }}
        >
          {letter}
        </motion.div>

        {/* Character name */}
        <div className="text-xs font-medium text-center text-gray-600 mb-1">
          {letterData.character}
        </div>

        {/* Word */}
        <div className="text-sm font-semibold text-center" style={{ color }}>
          {letterData.word}
        </div>

        {/* Interaction hints */}
        <div className="absolute -top-2 -right-2 flex space-x-1">
          {isLearningMode && (
            <motion.div
              className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 360]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: 'linear'
              }}
            >
              <Volume2 className="w-3 h-3 text-white" />
            </motion.div>
          )}
          
          {!isLearningMode && (
            <motion.div
              className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center"
              animate={{ 
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <Star className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </div>

        {/* Floating particles for selected letters */}
        {isSelected && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 0.8 
                }}
                animate={{
                  x: [0, Math.random() * 100 - 50],
                  y: [0, Math.random() * 100 - 50],
                  opacity: [0.8, 0, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: 'easeOut'
                }}
              />
            ))}
          </>
        )}

        {/* Success animation */}
        {isAnimating && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{ backgroundColor: color }}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Interactive tooltip for learning mode */}
      {isLearningMode && isSelected && (
        <motion.div
          className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs rounded-lg p-2 whitespace-nowrap"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          Click me to learn about {letter}!
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45" />
        </motion.div>
      )}
    </motion.div>
  );
};

export default LetterCharacter;