import { useRef, useEffect } from 'react';

interface InteractiveGridBackgroundProps {
  gridSize?: number;
  gridColor?: string;
  darkGridColor?: string;
  effectColor?: string;
  darkEffectColor?: string;
  trailLength?: number;
  idleSpeed?: number;
  glow?: boolean;
  glowRadius?: number;
  showFade?: boolean;
  fadeIntensity?: number;
  children?: React.ReactNode;
}

interface Point {
  x: number;
  y: number;
  opacity: number;
}

export default function InteractiveGridBackground({
  gridSize = 50,
  gridColor = '#e5e7eb',
  darkGridColor = '#27272a',
  effectColor = 'rgba(0,0,0,0.5)',
  darkEffectColor = 'rgba(168, 85, 247, 0.5)', // Using purple as default dark effect
  trailLength = 3,
  idleSpeed = 0.2,
  glow = true,
  glowRadius = 30,
  showFade = true,
  fadeIntensity = 25,
  children
}: InteractiveGridBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Is dark mode? (Hardcoding true for this app's aesthetic)
  const isDark = true; 
  
  const currentGridColor = isDark ? darkGridColor : gridColor;
  const currentEffectColor = isDark ? darkEffectColor : effectColor;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = container.clientWidth;
    let height = container.clientHeight;
    
    // Set high-DPI canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    let activeCells: Point[] = [];
    let mousePos = { x: -1000, y: -1000 };
    let lastMousePos = { x: -1000, y: -1000 };
    let isIdle = true;
    let idleAngle = 0;
    
    let animationFrameId: number;

    const handleResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      isIdle = false;
    };

    const handleMouseLeave = () => {
      isIdle = true;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const drawGrid = () => {
      ctx.strokeStyle = currentGridColor;
      ctx.lineWidth = 1;
      
      // Add global fade if enabled
      if (showFade) {
        const gradient = ctx.createRadialGradient(
          width / 2, height / 2, 0,
          width / 2, height / 2, Math.max(width, height) / 2
        );
        gradient.addColorStop(0, currentGridColor);
        gradient.addColorStop(1, 'transparent');
        ctx.strokeStyle = gradient;
        ctx.globalAlpha = fadeIntensity / 100;
      } else {
        ctx.globalAlpha = 0.3; // Default faint grid
      }

      ctx.beginPath();
      for (let x = 0; x <= width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const updateCells = () => {
      // If idle, simulate mouse movement
      if (isIdle) {
        idleAngle += idleSpeed * 0.05;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.3;
        mousePos.x = centerX + Math.cos(idleAngle) * radius;
        mousePos.y = centerY + Math.sin(idleAngle * 0.5) * radius * 0.5; // Figure 8 pattern
      }

      // Interpolate between lastMousePos and mousePos to ensure we don't skip cells when moving fast
      const dx = mousePos.x - lastMousePos.x;
      const dy = mousePos.y - lastMousePos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(1, Math.floor(distance / (gridSize / 2))); // High sensitivity interpolation

      if (!isIdle) {
        for (let i = 1; i <= steps; i++) {
          const interpX = lastMousePos.x + (dx * i) / steps;
          const interpY = lastMousePos.y + (dy * i) / steps;
          
          const cellX = Math.floor(interpX / gridSize) * gridSize;
          const cellY = Math.floor(interpY / gridSize) * gridSize;

          // Light up only 1 grid cell (but keep interpolation so no cells are skipped)
          const exists = activeCells.find(c => c.x === cellX && c.y === cellY);
          if (exists) {
            exists.opacity = 1; // Refresh opacity
          } else {
            activeCells.push({ x: cellX, y: cellY, opacity: 1 });
          }
        }
      } else {
        // Idle animation behavior
        const cellX = Math.floor(mousePos.x / gridSize) * gridSize;
        const cellY = Math.floor(mousePos.y / gridSize) * gridSize;
        const exists = activeCells.find(c => c.x === cellX && c.y === cellY);
        if (exists) {
          exists.opacity = 1;
        } else {
          activeCells.push({ x: cellX, y: cellY, opacity: 1 });
        }
      }

      lastMousePos = { ...mousePos };

      // Update and fade out cells
      activeCells = activeCells.filter(cell => {
        cell.opacity -= 0.02 * (10 / trailLength); // Fade speed based on trail length
        return cell.opacity > 0;
      });
    };

    const drawCells = () => {
      activeCells.forEach(cell => {
        ctx.fillStyle = currentEffectColor;
        ctx.globalAlpha = cell.opacity;
        
        // Draw the filled cell
        ctx.fillRect(cell.x, cell.y, gridSize, gridSize);
        
        // Draw glow
        if (glow) {
          ctx.shadowBlur = glowRadius * cell.opacity;
          ctx.shadowColor = currentEffectColor;
          ctx.fillRect(cell.x, cell.y, gridSize, gridSize);
          ctx.shadowBlur = 0;
        }
      });
      ctx.globalAlpha = 1;
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      updateCells();
      drawCells();
      drawGrid();
      
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    gridSize, currentGridColor, currentEffectColor, trailLength, 
    idleSpeed, glow, glowRadius, showFade, fadeIntensity
  ]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#09090b] z-0">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto"
        style={{ pointerEvents: children ? 'none' : 'auto' }}
      />
      {children && (
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      )}
    </div>
  );
}
