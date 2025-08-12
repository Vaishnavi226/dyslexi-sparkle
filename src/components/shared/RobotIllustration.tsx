import React from 'react';
import { motion } from 'framer-motion';

const RobotIllustration: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative"
    >
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-32 h-32 mx-auto"
      >
        <svg
          width="128"
          height="128"
          viewBox="0 0 128 128"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Robot Head */}
          <motion.rect
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            x="32"
            y="16"
            width="64"
            height="56"
            rx="8"
            fill="hsl(var(--primary))"
          />
          
          {/* Eyes */}
          <motion.circle
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            cx="48"
            cy="36"
            r="6"
            fill="white"
          />
          <motion.circle
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.9 }}
            cx="80"
            cy="36"
            r="6"
            fill="white"
          />
          
          {/* Eye pupils */}
          <motion.circle
            animate={{ x: [0, 2, -2, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            cx="48"
            cy="36"
            r="2"
            fill="hsl(var(--primary))"
          />
          <motion.circle
            animate={{ x: [0, 2, -2, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            cx="80"
            cy="36"
            r="2"
            fill="hsl(var(--primary))"
          />
          
          {/* Mouth */}
          <motion.rect
            initial={{ width: 0 }}
            animate={{ width: 20 }}
            transition={{ duration: 0.3, delay: 1.1 }}
            x="54"
            y="52"
            width="20"
            height="4"
            rx="2"
            fill="white"
          />
          
          {/* Antennae */}
          <motion.line
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            x1="48"
            y1="16"
            x2="48"
            y2="8"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <motion.line
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            x1="80"
            y1="16"
            x2="80"
            y2="8"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
          />
          
          {/* Antenna balls */}
          <motion.circle
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 1.0 }}
            cx="48"
            cy="8"
            r="3"
            fill="hsl(var(--accent))"
          />
          <motion.circle
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 1.0 }}
            cx="80"
            cy="8"
            r="3"
            fill="hsl(var(--accent))"
          />
          
          {/* Body */}
          <motion.rect
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            x="40"
            y="72"
            width="48"
            height="40"
            rx="6"
            fill="hsl(var(--secondary))"
            style={{ transformOrigin: "center bottom" }}
          />
          
          {/* Chest circle */}
          <motion.circle
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 1.2 }}
            cx="64"
            cy="88"
            r="8"
            fill="hsl(var(--accent))"
          />
          
          {/* Arms */}
          <motion.rect
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            x="20"
            y="80"
            width="20"
            height="8"
            rx="4"
            fill="hsl(var(--primary))"
            style={{ transformOrigin: "right center" }}
          />
          <motion.rect
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.4, delay: 0.9 }}
            x="88"
            y="80"
            width="20"
            height="8"
            rx="4"
            fill="hsl(var(--primary))"
            style={{ transformOrigin: "left center" }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
};

export default RobotIllustration;