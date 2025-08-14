import confetti from 'canvas-confetti';

export const triggerConfetti = (type: 'success' | 'achievement' | 'celebration' = 'success') => {
  switch (type) {
    case 'success':
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
      });
      break;
    
    case 'achievement':
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          particleCount,
          startVelocity: 30,
          spread: 360,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#FFD700', '#FFA500', '#FF4500', '#32CD32', '#1E90FF', '#9370DB']
        });
        
        confetti({
          particleCount,
          startVelocity: 30,
          spread: 360,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#FFD700', '#FFA500', '#FF4500', '#32CD32', '#1E90FF', '#9370DB']
        });
      }, 250);
      break;
    
    case 'celebration':
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98FB98']
      });
      
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 120,
          origin: { y: 0.7 },
          colors: ['#FFD700', '#FF1493', '#00CED1', '#32CD32', '#FF69B4', '#20B2AA']
        });
      }, 300);
      break;
  }
};

export const triggerStarConfetti = (stars: number) => {
  const colors = ['#FFD700', '#FFA500', '#FFFF00'];
  
  for (let i = 0; i < stars; i++) {
    setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { x: 0.5, y: 0.4 },
        colors,
        shapes: ['star'],
        scalar: 1.2
      });
    }, i * 200);
  }
};