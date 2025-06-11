import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { GameState } from '../types/game';
import { WebGPUEngine } from '../engines/WebGPUEngine';

interface WebGPUCanvasProps {
  gameState: GameState;
}

const WebGPUCanvas = forwardRef<any, WebGPUCanvasProps>(({ gameState }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<WebGPUEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const initWebGPU = async () => {
      try {
        const context = canvasRef.current?.getContext('webgpu');
        if (!context) {
          console.warn('WebGPU not supported');
          return;
        }

        engineRef.current = new WebGPUEngine(context);
        await engineRef.current.initialize();
      } catch (error) {
        console.error('Failed to initialize WebGPU:', error);
      }
    };

    initWebGPU();

    return () => {
      engineRef.current?.cleanup();
    };
  }, []);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.render();
    }
  }, [gameState]);

  useImperativeHandle(ref, () => ({
    getEngine: () => engineRef.current
  }));

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ width: '100%', height: '100%' }}
    />
  );
});

WebGPUCanvas.displayName = 'WebGPUCanvas';

export default WebGPUCanvas;