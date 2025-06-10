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

interface GPUDevice {
  createCommandEncoder(): GPUCommandEncoder;
  queue: GPUQueue;
}

interface GPUQueue {
  submit(commands: GPUCommandBuffer[]): void;
}

interface GPUCommandEncoder {
  beginRenderPass(descriptor: GPURenderPassDescriptor): GPURenderPassEncoder;
  finish(): GPUCommandBuffer;
}

interface GPURenderPassEncoder {
  end(): void;
}

interface GPURenderPassDescriptor {
  colorAttachments: GPURenderPassColorAttachment[];
}

interface GPURenderPassColorAttachment {
  view: GPUTextureView;
  clearValue: GPUColor;
  loadOp: GPULoadOp;
  storeOp: GPUStoreOp;
}

interface GPUTextureView {}

type GPUColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};

type GPULoadOp = 'clear' | 'load';
type GPUStoreOp = 'store' | 'discard';

interface GPUCommandBuffer {}

interface GPUCanvasContext {
  configure(config: GPUCanvasConfiguration): void;
  getCurrentTexture(): GPUTexture;
}

interface GPUTexture {
  createView(): GPUTextureView;
}

interface GPUCanvasConfiguration {
  device: GPUDevice;
  format: GPUTextureFormat;
  alphaMode: GPUCanvasAlphaMode;
}

type GPUTextureFormat = 'rgba8unorm' | 'bgra8unorm';
type GPUCanvasAlphaMode = 'opaque' | 'premultiplied';

declare global {
  interface Navigator {
    gpu: {
      requestAdapter(): Promise<GPUAdapter | null>;
      getPreferredCanvasFormat(): GPUTextureFormat;
    };
  }

  interface GPUAdapter {
    requestDevice(): Promise<GPUDevice>;
  }

  interface Window {
    WebGPURenderer?: WebGPURenderer;
  }
} 