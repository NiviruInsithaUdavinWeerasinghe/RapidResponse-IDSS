import React, { useEffect, useRef } from 'react';

export default function RainEffect({ density = 60 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Resize handler
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Raindrop particle setup
    const raindrops = [];
    for (let i = 0; i < density; i++) {
      raindrops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vy: 4 + Math.random() * 5,
        vx: -1 + Math.random() * 0.5,
        len: 10 + Math.random() * 15,
        opacity: 0.1 + Math.random() * 0.3
      });
    }

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';

      raindrops.forEach(drop => {
        ctx.strokeStyle = `rgba(14, 165, 233, ${drop.opacity})`;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + drop.vx * 2, drop.y + drop.len);
        ctx.stroke();

        // Update positions
        drop.y += drop.vy;
        drop.x += drop.vx;

        // Reset drop to top if it exits screen bounds
        if (drop.y > canvas.height) {
          drop.y = -drop.len;
          drop.x = Math.random() * canvas.width;
          drop.vy = 4 + Math.random() * 5;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [density]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none rounded-xl z-0 will-change-transform"
      style={{ transform: 'translate3d(0,0,0)', backfaceVisibility: 'hidden' }}
    />
  );
}
