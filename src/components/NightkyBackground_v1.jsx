import React, { useEffect, useRef } from 'react';

const NightSkyBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let stars = [];
    let meteors = [];

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Star class
    class Star {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
        this.opacity = Math.random();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.size = Math.random() * 2 + 0.5;
        this.speed = Math.random() * 0.3 + 0.1;
        this.opacity = Math.random();
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
      }

      update() {
        this.y += this.speed;
        this.opacity += this.twinkleSpeed;
        
        if (this.opacity > 1 || this.opacity < 0) {
          this.twinkleSpeed *= -1;
        }

        if (this.y > canvas.height) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity * 0.8})`;
        ctx.fill();
        
        // Add glow effect
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 3
        );
        gradient.addColorStop(0, `rgba(255, 215, 0, ${this.opacity * 0.4})`);
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Meteor class
    class Meteor {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width + 200;
        this.y = Math.random() * canvas.height / 2;
        this.length = Math.random() * 80 + 40;
        this.speed = Math.random() * 8 + 6;
        this.angle = Math.PI / 4;
        this.opacity = 1;
        this.fadeSpeed = 0.02;
      }

      update() {
        this.x -= Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.opacity -= this.fadeSpeed;

        if (this.opacity <= 0 || this.x < -100 || this.y > canvas.height + 100) {
          if (Math.random() < 0.003) {
            this.reset();
          }
        }
      }

      draw() {
        if (this.opacity <= 0) return;

        ctx.save();
        ctx.beginPath();
        
        const gradient = ctx.createLinearGradient(
          this.x, this.y,
          this.x + Math.cos(this.angle) * this.length,
          this.y - Math.sin(this.angle) * this.length
        );
        
        gradient.addColorStop(0, `rgba(255, 215, 0, ${this.opacity})`);
        gradient.addColorStop(0.3, `rgba(212, 175, 55, ${this.opacity * 0.6})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
          this.x + Math.cos(this.angle) * this.length,
          this.y - Math.sin(this.angle) * this.length
        );
        ctx.stroke();
        ctx.restore();
      }
    }

    // Initialize stars
    for (let i = 0; i < 200; i++) {
      stars.push(new Star());
    }

    // Initialize meteors
    for (let i = 0; i < 5; i++) {
      meteors.push(new Meteor());
    }

    // Animation loop
    const animate = () => {
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#000000');
      gradient.addColorStop(0.5, '#0a0a0f');
      gradient.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw stars
      stars.forEach(star => {
        star.update();
        star.draw();
      });

      // Update and draw meteors
      meteors.forEach(meteor => {
        meteor.update();
        meteor.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  );
};

// Demo wrapper
export default function Demo() {
  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <NightSkyBackground />
      
      <div style={{ 
        position: 'relative', 
        zIndex: 1, 
        color: '#D4AF37',
        padding: '80px 20px',
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '20px' }}>
          Discover Hurghada Safari
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#d1d5db', marginBottom: '40px' }}>
          Desert adventures, crystal waters, and unforgettable memories.
        </p>
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button style={{
            padding: '12px 24px',
            borderRadius: '9999px',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            background: 'transparent',
            color: '#D4AF37',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}>
            See Trips
          </button>
          <button style={{
            padding: '12px 24px',
            borderRadius: '9999px',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            background: 'transparent',
            color: '#D4AF37',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}>
            Reviews
          </button>
          <button style={{
            padding: '12px 24px',
            borderRadius: '9999px',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            background: 'transparent',
            color: '#D4AF37',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}>
            Gallery
          </button>
        </div>
      </div>
    </div>
  );
}