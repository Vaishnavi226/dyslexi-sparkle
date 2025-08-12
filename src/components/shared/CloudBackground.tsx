import React from 'react';
import { motion } from 'framer-motion';

const CloudBackground: React.FC = () => {
  const clouds = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 40 + 10,
    size: Math.random() * 0.5 + 0.5,
    duration: Math.random() * 20 + 30,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {clouds.map((cloud) => (
        <motion.div
          key={cloud.id}
          className="absolute opacity-20"
          style={{
            left: `${cloud.x}%`,
            top: `${cloud.y}%`,
            transform: `scale(${cloud.size})`,
          }}
          animate={{
            x: [0, 100, 0],
          }}
          transition={{
            duration: cloud.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <svg
            width="120"
            height="80"
            viewBox="0 0 120 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M30 60C20 60 12 52 12 42C12 32 20 24 30 24C32 14 42 6 54 6C66 6 76 14 78 24C88 24 96 32 96 42C96 52 88 60 78 60H30Z"
              fill="currentColor"
              className="text-primary/10"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default CloudBackground;