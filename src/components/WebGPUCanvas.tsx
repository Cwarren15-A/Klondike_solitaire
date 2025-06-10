import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { GameState, Card } from '../types/game';
import { WebGPUEngine } from '../engines/WebGPUEngine';
import { PhysicsEngine } from '../engines/PhysicsEngine';
import './WebGPUCanvas.css';

interface WebGPUCanvasProps {
  gameState: GameState;
}

export interface WebGPUCanvasRef {
  toggleRealisticMode: () => void;
}

const WebGPUCanvas = forwardRef<WebGPUCanvasRef, WebGPUCanvasProps>(({
  gameState
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<WebGPUEngine | null>(null);
  const physicsEngineRef = useRef<PhysicsEngine | null>(null);

  useImperativeHandle(ref, () => ({
    toggleRealisticMode: () => {
      if (engineRef.current) {
        engineRef.current.toggleRealisticMode();
      }
    }
  }));

  useEffect(() => {
    if (!canvasRef.current) return;

    const initWebGPU = async () => {
      try {
        if (!navigator.gpu) {
          console.error('WebGPU not supported');
          return;
        }

        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
          console.error('No WebGPU adapter found');
          return;
        }

        const device: any = await adapter.requestDevice();
        const context = canvasRef.current.getContext('webgpu');
        if (!context) {
          console.error('Could not get WebGPU context');
          return;
        }

        // Initialize WebGPU engine
        engineRef.current = new WebGPUEngine(device, context);
        await engineRef.current.initialize();

        // Initialize physics engine
        physicsEngineRef.current = new PhysicsEngine();
        await physicsEngineRef.current.initialize();

        // Set up render loop
        const render = () => {
          if (engineRef.current && physicsEngineRef.current) {
            engineRef.current.render(gameState);
            physicsEngineRef.current.update();
          }
          requestAnimationFrame(render);
        };
        render();
      } catch (error) {
        console.error('Error initializing WebGPU:', error);
      }
    };

    initWebGPU();

    return () => {
      if (engineRef.current) {
        engineRef.current.cleanup();
      }
      if (physicsEngineRef.current) {
        physicsEngineRef.current.cleanup();
      }
    };
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      className="webgpu-canvas"
      width={800}
      height={600}
    />
  );
});

WebGPUCanvas.displayName = 'WebGPUCanvas';

export default WebGPUCanvas;