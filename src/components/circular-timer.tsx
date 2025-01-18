'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CirclePosition {
  x: number;
  y: number;
  ring: number;
  sequenceIndex: number;
  anglePosition: number;
  totalInRing: number;
}

const CircularTimer: React.FC = () => {
  const CIRCLE_SIZE = 8;
  const RADIUS = 96;
  const PADDING = CIRCLE_SIZE * 2;
  const SIZE = (RADIUS + PADDING) * 2;
  const CENTER = SIZE / 2;
  const NUM_RINGS = 5;
  const SPACING = RADIUS / NUM_RINGS;

  // Always initialize state
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [circlePositions, setCirclePositions] = useState<CirclePosition[]>([]);
  const [isClient, setIsClient] = useState(false);

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Generate circle positions on first client-side render
  useEffect(() => {
    const generateCirclePositions = () => {
      const positions: CirclePosition[] = [];
      let sequenceIndex = 0;
      
      // Generate rings from outer to inner
      for (let ring = NUM_RINGS; ring >= 1; ring--) {
        const ringRadius = ring * SPACING;
        const circumference = 2 * Math.PI * ringRadius;
        const numCircles = Math.floor(circumference / (CIRCLE_SIZE * 2));
        const ringAngleStep = (2 * Math.PI) / numCircles;
        
        // Create all circles for this ring
        const ringCircles = [];
        for (let i = 0; i < numCircles; i++) {
          const angle = i * ringAngleStep;
          ringCircles.push({
            x: CENTER + ringRadius * Math.cos(angle),
            y: CENTER + ringRadius * Math.sin(angle),
            ring,
            sequenceIndex: sequenceIndex++,
            anglePosition: i,
            totalInRing: numCircles
          });
        }
        
        positions.push(...ringCircles);
      }
      
      positions.push({
        x: CENTER,
        y: CENTER,
        ring: 0,
        sequenceIndex: sequenceIndex,
        anglePosition: 0,
        totalInRing: 1
      });
      
      return positions;
    };

    // Always set positions and mark as client
    setCirclePositions(generateCirclePositions());
    setIsClient(true);
  }, []); // Empty dependency array ensures this runs only once

  const totalCircles = circlePositions.length - 1;

  // Timer update effect
  useEffect(() => {
    const updateTimer = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsedTime = Math.floor((timestamp - startTimeRef.current) / 1000);
      const newTimeLeft = Math.max(60 - elapsedTime, 0);

      setTimeLeft(newTimeLeft);

      if (newTimeLeft > 0 && isRunning) {
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      } else if (newTimeLeft === 0) {
        setIsRunning(false);
        startTimeRef.current = null;
      }
    };

    if (isRunning && timeLeft > 0) {
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const getCircleColor = useCallback((circle: CirclePosition, currentTime: number): string => {
    if (!hasStarted) return "rgb(255, 255, 255)";
    
    if (circle.ring === 0) {
      return currentTime === 0 ? "#1e1e1e" : "rgb(255, 255, 255)";
    }

    if (currentTime <= 1) return "#1e1e1e";

    const percentage = (currentTime - 1) / 59;
    const activeCircleCount = Math.ceil(percentage * totalCircles);
    
    return circle.sequenceIndex > (totalCircles - activeCircleCount) ? "#1e1e1e" : "rgb(255, 255, 255)";
  }, [hasStarted, totalCircles]);

  const reset = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    startTimeRef.current = null;
    setTimeLeft(60);
    setIsRunning(false);
    setHasStarted(false);
  }, []);

  const toggleTimer = useCallback(() => {
    if (!hasStarted) {
      setHasStarted(true);
    }
    if (!isRunning && timeLeft === 0) {
      setTimeLeft(60);
      startTimeRef.current = null;
    }
    setIsRunning(prev => !prev);
  }, [hasStarted, isRunning, timeLeft]);

  // Always call useMemo, even if we might not render
  const circles = useMemo(() => 
    circlePositions.map((circle) => {
      const isActive = getCircleColor(circle, timeLeft) === "rgb(255, 255, 255)";
      return (
        <circle
          key={circle.sequenceIndex}
          cx={circle.x}
          cy={circle.y}
          r={CIRCLE_SIZE / 2}
          fill={getCircleColor(circle, timeLeft)}
          style={{
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transitionDelay: `${(NUM_RINGS - circle.ring) * 0.05}s`,
            transform: `translate(${isActive ? '0, 0' : '0, 2px'}) scale(${isActive ? 1 : 0.8})`,
            transformOrigin: `${circle.x}px ${circle.y}px`,
            opacity: isActive ? 1 : 0.5
          }}
        />
      );
    }), [circlePositions, getCircleColor, timeLeft]);

  // Render placeholder while not on client
  if (!isClient) {
    return <div className="min-h-screen w-full bg-black"></div>;
  }

  return (
    <div 
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-cover bg-center"
      style={{
        fontFamily: '"Noto Sans Mono", monospace'
      }}
    >      
      {/* Glass effect container */}
      <Card className="backdrop-blur-md bg-white/10 border-white/20 rounded-none shadow-2xl relative z-10">
        <CardContent className="p-8 flex flex-col items-center space-y-6">
          <div className="w-48 h-48 relative">
            <svg className="w-full h-full transform" viewBox={`0 0 ${SIZE} ${SIZE}`}>
              {circles}
            </svg>
          </div>
          
          <span className="text-white/90 font-mono text-xs">
            {timeLeft}s
          </span>

          <div className="flex space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTimer}
              className="w-10 h-10 bg-white/10 rounded-none border-white/10 hover:bg-white/20 hover:border-white/50 transition-all duration-300"
            >
              {isRunning ? 
                <Pause className="w-2 h-2 text-white/90" /> : 
                <Play className="w-2 h-2 text-white/90" />
              }
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={reset}
              className="w-10 h-10 bg-white/10 rounded-none border-white/10 hover:bg-white/20 hover:border-white/50 transition-all duration-300"
            >
              <RotateCcw className="w-2 h-2 text-white/90" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Dynamically import with SSR disabled
export default dynamic(() => Promise.resolve(CircularTimer), { ssr: false });