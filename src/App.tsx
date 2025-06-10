import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Cloud, Volume2, VolumeX, Wind, Droplets } from 'lucide-react';

interface RainDrop {
  id: number;
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
  layer: number;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  scale: number;
  opacity: number;
}

function App() {
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [intensity, setIntensity] = useState(50);
  const [windStrength, setWindStrength] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const animationRef = useRef<number>();
  const dropIdRef = useRef<number>(0);
  const rippleIdRef = useRef<number>(0);

  // Create new rain drops based on intensity
  const createRainDrop = useCallback((): RainDrop => {
    const layer = Math.floor(Math.random() * 3) + 1;
    const sizeMultiplier = layer === 1 ? 1.2 : layer === 2 ? 0.8 : 0.5;
    const speedMultiplier = layer === 1 ? 1.5 : layer === 2 ? 1.0 : 0.7;
    
    return {
      id: dropIdRef.current++,
      x: Math.random() * (window.innerWidth + 200) - 100,
      y: -50,
      speed: (Math.random() * 4 + 3) * speedMultiplier,
      size: (Math.random() * 2 + 1.5) * sizeMultiplier,
      opacity: layer === 1 ? 0.9 : layer === 2 ? 0.6 : 0.3,
      layer
    };
  }, []);

  // Create ripple effect when rain hits ground
  const createRipple = useCallback((x: number): Ripple => {
    return {
      id: rippleIdRef.current++,
      x,
      y: window.innerHeight - 50,
      scale: 0,
      opacity: 0.8
    };
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    if (!isPlaying) return;

    setRainDrops(prevDrops => {
      let newDrops = [...prevDrops];
      
      // Calculate how many drops to add based on intensity
      const dropsToAdd = Math.floor((intensity / 100) * 2) + 1;
      
      // Add new drops
      for (let i = 0; i < dropsToAdd; i++) {
        if (Math.random() < 0.4) {
          newDrops.push(createRainDrop());
        }
      }

      // Update existing drops
      const updatedDrops = newDrops
        .map(drop => ({
          ...drop,
          y: drop.y + drop.speed,
          x: drop.x + (windStrength * 0.3)
        }))
        .filter(drop => {
          if (drop.y > window.innerHeight + 20) {
            // Create ripple when drop hits ground
            if (Math.random() < 0.15) {
              setRipples(prev => [...prev.slice(-10), createRipple(drop.x)]);
            }
            return false;
          }
          return drop.x > -100 && drop.x < window.innerWidth + 100;
        });

      return updatedDrops.slice(-300); // Limit max drops for performance
    });

    // Update ripples
    setRipples(prevRipples => 
      prevRipples
        .map(ripple => ({
          ...ripple,
          scale: ripple.scale + 1.2,
          opacity: ripple.opacity - 0.03
        }))
        .filter(ripple => ripple.opacity > 0 && ripple.scale < 40)
    );

    animationRef.current = requestAnimationFrame(animate);
  }, [isPlaying, intensity, windStrength, createRainDrop, createRipple]);

  // Start animation
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, isPlaying]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setRainDrops([]);
      setRipples([]);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize with some rain drops
  useEffect(() => {
    const initialDrops: RainDrop[] = [];
    for (let i = 0; i < 20; i++) {
      initialDrops.push(createRainDrop());
    }
    setRainDrops(initialDrops);
  }, [createRainDrop]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-gray-900/40 to-gray-800/60" />
      
      {/* Lightning Flash Effect */}
      <div 
        className="absolute inset-0 bg-blue-100/10 opacity-0 pointer-events-none transition-opacity duration-75"
        style={{
          opacity: Math.random() < 0.001 ? 1 : 0
        }}
      />

      {/* Rain Layer 3 (Background) */}
      <div className="absolute inset-0 pointer-events-none" style={{ transform: 'translateZ(-100px)', filter: 'blur(0.5px)' }}>
        {rainDrops
          .filter(drop => drop.layer === 3)
          .map(drop => (
            <div
              key={drop.id}
              className="absolute bg-gradient-to-b from-blue-200/30 to-blue-300/20 rounded-full"
              style={{
                left: `${drop.x}px`,
                top: `${drop.y}px`,
                width: `${drop.size}px`,
                height: `${drop.size * 6}px`,
                opacity: drop.opacity,
                transform: `rotate(${windStrength * 2}deg)`
              }}
            />
          ))}
      </div>

      {/* Rain Layer 2 (Middle) */}
      <div className="absolute inset-0 pointer-events-none" style={{ transform: 'translateZ(-50px)' }}>
        {rainDrops
          .filter(drop => drop.layer === 2)
          .map(drop => (
            <div
              key={drop.id}
              className="absolute bg-gradient-to-b from-blue-100/50 to-blue-200/40 rounded-full"
              style={{
                left: `${drop.x}px`,
                top: `${drop.y}px`,
                width: `${drop.size}px`,
                height: `${drop.size * 8}px`,
                opacity: drop.opacity,
                transform: `rotate(${windStrength * 1.5}deg)`,
                boxShadow: '0 0 3px rgba(59, 130, 246, 0.3)'
              }}
            />
          ))}
      </div>

      {/* Rain Layer 1 (Foreground) */}
      <div className="absolute inset-0 pointer-events-none">
        {rainDrops
          .filter(drop => drop.layer === 1)
          .map(drop => (
            <div
              key={drop.id}
              className="absolute bg-gradient-to-b from-blue-50/70 to-blue-100/60 rounded-full"
              style={{
                left: `${drop.x}px`,
                top: `${drop.y}px`,
                width: `${drop.size}px`,
                height: `${drop.size * 10}px`,
                opacity: drop.opacity,
                transform: `rotate(${windStrength}deg)`,
                boxShadow: '0 0 4px rgba(59, 130, 246, 0.5)'
              }}
            />
          ))}
      </div>

      {/* Ground Ripples */}
      <div className="absolute inset-0 pointer-events-none">
        {ripples.map(ripple => (
          <div
            key={ripple.id}
            className="absolute border border-blue-300/40 rounded-full"
            style={{
              left: `${ripple.x - ripple.scale}px`,
              top: `${ripple.y - ripple.scale}px`,
              width: `${ripple.scale * 2}px`,
              height: `${ripple.scale * 2}px`,
              opacity: ripple.opacity,
              transform: 'translateZ(0)'
            }}
          />
        ))}
      </div>

      {/* Control Panel */}
      <div className="absolute top-4 left-4 right-4 md:left-6 md:right-auto md:w-80 z-50">
        <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Cloud className="w-6 h-6 text-blue-300" />
            <h1 className="text-xl font-bold text-white">Rain Simulator</h1>
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-full mb-4 py-3 px-4 bg-blue-600/80 hover:bg-blue-500/80 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {isPlaying ? 'Pause Rain' : 'Start Rain'}
          </button>

          {/* Rain Intensity */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/90 text-sm font-medium flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                Intensity
              </span>
              <span className="text-blue-300 text-sm font-bold">{intensity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Wind Strength */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/90 text-sm font-medium flex items-center gap-2">
                <Wind className="w-4 h-4" />
                Wind
              </span>
              <span className="text-blue-300 text-sm font-bold">{windStrength > 0 ? '+' : ''}{windStrength}</span>
            </div>
            <input
              type="range"
              min="-10"
              max="10"
              value={windStrength}
              onChange={(e) => setWindStrength(Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-2 py-2 px-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-sm">Sound {soundEnabled ? 'On' : 'Off'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Info */}
      <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-auto md:max-w-md z-40">
        <div className="bg-black/15 backdrop-blur-sm rounded-xl p-3 border border-white/5">
          <p className="text-white/70 text-xs md:text-sm text-center md:text-left">
            Realistic 3D rain simulation with atmospheric effects
          </p>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm rounded-lg p-2 text-white/60 text-xs hidden md:block">
        <div>Drops: {rainDrops.length}</div>
        <div>Ripples: {ripples.length}</div>
        <div>Status: {isPlaying ? 'Playing' : 'Paused'}</div>
      </div>
    </div>
  );
}

export default App;