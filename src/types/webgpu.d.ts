import { ReactNode } from 'react';

export interface WebGPUCanvasProps {
  children?: ReactNode;
  className?: string;
  width?: number;
  height?: number;
  onContextCreated?: (context: GPUCanvasContext) => void;
}

export interface WebGPUCardProps {
  card: {
    suit: string;
    value: string;
    faceUp: boolean;
  };
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  scale: number;
  onClick?: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export interface WebGPURenderer {
  initialize: (canvas: HTMLCanvasElement) => Promise<void>;
  render: () => void;
  dispose: () => void;
  updateCardTransform: (cardId: string, transform: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: number;
  }) => void;
}

declare global {
  interface Window {
    WebGPURenderer?: WebGPURenderer;
  }
} 