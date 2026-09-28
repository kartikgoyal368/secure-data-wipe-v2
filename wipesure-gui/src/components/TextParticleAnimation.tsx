import { useRef, useEffect } from 'react';

interface TextParticleAnimationProps {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  resolution?: number;
  pixelSize?: number;
  hoverRadius?: number;
  repelForce?: number;
  clickRadius?: number;
  clickForce?: number;
  springForce?: number;
  friction?: number;
  theme?: "light" | "dark";
  padding?: number;
  height?: number;
  className?: string;
  particleColor?: string; // backwards compatibility
}

export function TextParticleAnimation({ 
  text, 
  fontSize = 120,
  fontFamily = "sans-serif",
  fontWeight = 900,
  resolution = 4,
  pixelSize = 3,
  hoverRadius = 60,
  repelForce = 15,
  clickRadius = 300,
  clickForce = 80,
  springForce = 0.10,
  friction = 0.5,
  theme = "light",
  padding = 150,
  height: explicitHeight,
  className = "",
  particleColor
}: TextParticleAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let particles: any[] = [];
    let mouse = { x: -1000, y: -1000, radius: hoverRadius, click: false };
    let animationFrameId: number;
    let dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;

    // Resolve color
    const resolvedColor = particleColor || (theme === "dark" ? "#ffffff" : "#000000");

    const init = () => {
      width = canvas.clientWidth || 500;
      height = explicitHeight || canvas.clientHeight || (fontSize + padding * 2);
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);
      
      // Draw text to sample
      ctx.fillStyle = resolvedColor;
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Ensure text fits
      let actualFontSize = fontSize;
      let textWidth = ctx.measureText(text).width;
      if (textWidth > width - padding) {
        actualFontSize = fontSize * ((width - padding) / textWidth);
        ctx.font = `${fontWeight} ${actualFontSize}px ${fontFamily}`;
      }
      
      ctx.fillText(text, width / 2, height / 2);

      const textData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.clearRect(0, 0, width, height);

      particles = [];
      const step = Math.floor(resolution * dpr); 
      
      for (let y = 0; y < textData.height; y += step) {
        for (let x = 0; x < textData.width; x += step) {
          const index = (y * textData.width + x) * 4;
          const alpha = textData.data[index + 3];
          if (alpha > 128) {
            particles.push({
              x: x / dpr,
              y: y / dpr,
              baseX: x / dpr,
              baseY: y / dpr,
              vx: (Math.random() - 0.5) * 20,
              vy: (Math.random() - 0.5) * 20,
              size: pixelSize
            });
          }
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleMouseDown = () => {
      mouse.click = true;
    };

    const handleMouseUp = () => {
      mouse.click = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', init);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = resolvedColor;

      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        
        let dx = mouse.x - p.x;
        let dy = mouse.y - p.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        // Hover Repulsion
        if (distance < mouse.radius) {
          let angle = Math.atan2(dy, dx);
          let force = (mouse.radius - distance) / mouse.radius;
          p.vx -= Math.cos(angle) * force * (repelForce / 5);
          p.vy -= Math.sin(angle) * force * (repelForce / 5);
        }

        // Click Explosion
        if (mouse.click && distance < clickRadius) {
          let angle = Math.atan2(dy, dx);
          let force = (clickRadius - distance) / clickRadius;
          p.vx -= Math.cos(angle) * force * (clickForce / 2);
          p.vy -= Math.sin(angle) * force * (clickForce / 2);
        }

        // Spring force to base position
        p.x += (p.baseX - p.x) * springForce + p.vx;
        p.y += (p.baseY - p.y) * springForce + p.vy;

        // Friction damping
        p.vx *= friction;
        p.vy *= friction;

        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      
      // Auto-reset click flag so it only impulses once per frame if held, 
      // or we can leave it to continuous force. We'll make it continuous while held down.
      
      animationFrameId = requestAnimationFrame(animate);
    };

    const timer = setTimeout(() => {
      init();
      animate();
    }, 100);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', init);
    };
  }, [
    text, fontSize, fontFamily, fontWeight, resolution, pixelSize, 
    hoverRadius, repelForce, clickRadius, clickForce, springForce, 
    friction, theme, padding, explicitHeight, particleColor
  ]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`w-full block touch-none ${className}`} 
      style={{ height: explicitHeight ? `${explicitHeight}px` : '100%' }}
    />
  );
}
