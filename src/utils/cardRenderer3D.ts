/**
 * 3D Card Rendering System with Realistic Physics and PBR Materials
 * Features: 3D geometry, physics simulation, realistic materials, advanced animations
 */

import { PBRRenderer } from './pbrRenderer';

interface CardPhysics {
  position: Float32Array; // x, y, z
  rotation: Float32Array; // rx, ry, rz (radians)
  velocity: Float32Array; // vx, vy, vz
  angularVelocity: Float32Array; // angular velocity
  mass: number;
  friction: number;
  restitution: number; // bounciness
  airResistance: number;
}

interface Card3D {
  id: string;
  suit: string;
  rank: string;
  geometry: CardGeometry;
  physics: CardPhysics;
  isFlipping: boolean;
  flipProgress: number;
  isHovered: boolean;
  isDragging: boolean;
}

interface CardGeometry {
  vertices: Float32Array;
  indices: Uint16Array;
  normals: Float32Array;
  uvs: Float32Array;
  vertexBuffer: GPUBuffer;
  indexBuffer: GPUBuffer;
}

interface CardAnimation {
  type: 'deal' | 'flip' | 'move' | 'shuffle';
  duration: number;
  startTime: number;
  startPosition: Float32Array;
  endPosition: Float32Array;
  startRotation: Float32Array;
  endRotation: Float32Array;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';
  onComplete?: () => void;
}

export class Card3DRenderer {
  private device: GPUDevice;
  private context: GPUCanvasContext;
  private pbrRenderer: PBRRenderer;
  
  private cards: Map<string, Card3D> = new Map();
  private animations: Map<string, CardAnimation> = new Map();
  
  // Physics simulation
  private physicsEnabled = true;
  private gravity = -9.81;
  private tableHeight = 0.0;

  constructor(device: GPUDevice, context: GPUCanvasContext, pbrRenderer: PBRRenderer) {
    this.device = device;
    this.context = context;
    this.pbrRenderer = pbrRenderer;
  }

  async init(): Promise<void> {
    console.log('🃏 3D Card Renderer initialized with realistic physics!');
  }

  // Create realistic 3D card geometry
  createCardGeometry(): CardGeometry {
    const width = 0.0635; // Standard playing card width
    const height = 0.0889; // Standard playing card height
    const thickness = 0.0003; // Card thickness
    
    // Simple card geometry
    const vertices = new Float32Array([
      -width/2, -height/2, thickness/2,  // Front face
       width/2, -height/2, thickness/2,
       width/2,  height/2, thickness/2,
      -width/2,  height/2, thickness/2,
      
      -width/2, -height/2, -thickness/2, // Back face
       width/2, -height/2, -thickness/2,
       width/2,  height/2, -thickness/2,
      -width/2,  height/2, -thickness/2,
    ]);
    
    const indices = new Uint16Array([
      0, 1, 2, 0, 2, 3, // Front
      7, 6, 5, 7, 5, 4, // Back
    ]);
    
    const normals = new Float32Array([
      0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,  // Front
      0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, // Back
    ]);
    
    const uvs = new Float32Array([
      0, 0,  1, 0,  1, 1,  0, 1, // Front
      0, 0,  1, 0,  1, 1,  0, 1, // Back
    ]);
    
    // Create GPU buffers
    const vertexBuffer = this.device.createBuffer({
      size: vertices.length * 4,
      usage: GPUBufferUsage.VERTEX,
      mappedAtCreation: true
    });
    new Float32Array(vertexBuffer.getMappedRange()).set(vertices);
    vertexBuffer.unmap();
    
    const indexBuffer = this.device.createBuffer({
      size: indices.length * 2,
      usage: GPUBufferUsage.INDEX,
      mappedAtCreation: true
    });
    new Uint16Array(indexBuffer.getMappedRange()).set(indices);
    indexBuffer.unmap();
    
    return {
      vertices,
      indices,
      normals,
      uvs,
      vertexBuffer,
      indexBuffer
    };
  }

  // Create realistic card with physics
  async createCard(id: string, suit: string, rank: string): Promise<Card3D> {
    const geometry = this.createCardGeometry();
    
    const card: Card3D = {
      id,
      suit,
      rank,
      geometry,
      physics: {
        position: new Float32Array([0, 0, 0]),
        rotation: new Float32Array([0, 0, 0]),
        velocity: new Float32Array([0, 0, 0]),
        angularVelocity: new Float32Array([0, 0, 0]),
        mass: 0.0005, // 0.5 grams
        friction: 0.3,
        restitution: 0.2,
        airResistance: 0.02
      },
      isFlipping: false,
      flipProgress: 0,
      isHovered: false,
      isDragging: false
    };
    
    this.cards.set(id, card);
    return card;
  }

  // Realistic card dealing animation
  dealCard(cardId: string, targetPosition: Float32Array, delay: number = 0): void {
    const card = this.cards.get(cardId);
    if (!card) return;
    
    const startPosition = new Float32Array([0, 0.1, 0]);
    
    const animation: CardAnimation = {
      type: 'deal',
      duration: 800 + Math.random() * 200,
      startTime: performance.now() + delay,
      startPosition,
      endPosition: targetPosition,
      startRotation: new Float32Array([0, 0, 0]),
      endRotation: new Float32Array([0, 0, Math.random() * 0.1 - 0.05]),
      easing: 'ease-out',
      onComplete: () => {
        console.log(`🎴 Card ${cardId} dealt`);
      }
    };
    
    this.animations.set(cardId, animation);
  }

  // Realistic card flip animation
  flipCard(cardId: string, showFront: boolean = true): void {
    const card = this.cards.get(cardId);
    if (!card) return;
    
    card.isFlipping = true;
    
    const animation: CardAnimation = {
      type: 'flip',
      duration: 600,
      startTime: performance.now(),
      startPosition: card.physics.position,
      endPosition: card.physics.position,
      startRotation: card.physics.rotation,
      endRotation: new Float32Array([
        card.physics.rotation[0],
        showFront ? 0 : Math.PI,
        card.physics.rotation[2]
      ]),
      easing: 'ease-in-out',
      onComplete: () => {
        card.isFlipping = false;
        card.flipProgress = showFront ? 0 : 1;
        console.log(`🔄 Card ${cardId} flipped`);
      }
    };
    
    this.animations.set(cardId, animation);
  }

  // Physics simulation update
  updatePhysics(deltaTime: number): void {
    if (!this.physicsEnabled) return;
    
    this.cards.forEach(card => {
      // Apply gravity
      card.physics.velocity[1] += this.gravity * deltaTime;
      
      // Apply air resistance
      const resistance = card.physics.airResistance;
      card.physics.velocity[0] *= (1 - resistance * deltaTime);
      card.physics.velocity[1] *= (1 - resistance * deltaTime * 0.5);
      card.physics.velocity[2] *= (1 - resistance * deltaTime);
      
      // Update position
      card.physics.position[0] += card.physics.velocity[0] * deltaTime;
      card.physics.position[1] += card.physics.velocity[1] * deltaTime;
      card.physics.position[2] += card.physics.velocity[2] * deltaTime;
      
      // Table collision
      if (card.physics.position[1] <= this.tableHeight + 0.0005) {
        card.physics.position[1] = this.tableHeight + 0.0005;
        card.physics.velocity[1] *= -card.physics.restitution;
        card.physics.velocity[0] *= card.physics.friction;
        card.physics.velocity[2] *= card.physics.friction;
      }
      
      // Update rotation
      card.physics.rotation[0] += card.physics.angularVelocity[0] * deltaTime;
      card.physics.rotation[1] += card.physics.angularVelocity[1] * deltaTime;
      card.physics.rotation[2] += card.physics.angularVelocity[2] * deltaTime;
      
      // Angular damping
      card.physics.angularVelocity[0] *= 0.98;
      card.physics.angularVelocity[1] *= 0.98;
      card.physics.angularVelocity[2] *= 0.98;
    });
  }

  // Animation system
  updateAnimations(currentTime: number): void {
    this.animations.forEach((animation, cardId) => {
      const card = this.cards.get(cardId);
      if (!card) return;
      
      if (currentTime < animation.startTime) return;
      
      const elapsed = currentTime - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1);
      const easedProgress = this.applyEasing(progress, animation.easing);
      
      // Interpolate position
      for (let i = 0; i < 3; i++) {
        card.physics.position[i] = this.lerp(
          animation.startPosition[i],
          animation.endPosition[i],
          easedProgress
        );
      }
      
      // Interpolate rotation
      for (let i = 0; i < 3; i++) {
        card.physics.rotation[i] = this.lerp(
          animation.startRotation[i],
          animation.endRotation[i],
          easedProgress
        );
      }
      
      // Special handling for flip animation
      if (animation.type === 'flip') {
        card.flipProgress = easedProgress;
      }
      
      // Animation complete
      if (progress >= 1) {
        this.animations.delete(cardId);
        animation.onComplete?.();
      }
    });
  }

  // Get card for interactions
  getCard(cardId: string): Card3D | undefined {
    return this.cards.get(cardId);
  }

  // Set card hover state
  setCardHover(cardId: string, isHovered: boolean): void {
    const card = this.cards.get(cardId);
    if (card) {
      card.isHovered = isHovered;
    }
  }

  // Set card dragging state
  setCardDragging(cardId: string, isDragging: boolean): void {
    const card = this.cards.get(cardId);
    if (card) {
      card.isDragging = isDragging;
    }
  }

  private applyEasing(t: number, easing: string): number {
    switch (easing) {
      case 'ease-in': return t * t;
      case 'ease-out': return 1 - (1 - t) * (1 - t);
      case 'ease-in-out': return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      case 'bounce': return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
      default: return t;
    }
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  destroy(): void {
    this.cards.forEach(card => {
      card.geometry.vertexBuffer.destroy();
      card.geometry.indexBuffer.destroy();
    });
    this.cards.clear();
    this.animations.clear();
    console.log('🧹 3D Card Renderer destroyed');
  }
}

 