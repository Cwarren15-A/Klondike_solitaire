/**
 * 3D Card Component with Realistic Physics
 * Beautiful, lifelike card rendering with advanced interactions
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card } from '../types/game';
import { CardPhysicsEngine, PhysicsCard } from '../utils/cardPhysics';
import './CardComponent3D.css';

interface Card3DProps {
  card: Card;
  physicsEngine?: CardPhysicsEngine;
  position?: Float32Array;
  onCardClick?: (card: Card) => void;
  onCardDoubleClick?: (card: Card) => void;
  onCardHover?: (card: Card, isHovered: boolean) => void;
  onCardDrag?: (card: Card, isDragging: boolean) => void;
  realistic3D?: boolean;
  showBack?: boolean;
  size?: 'small' | 'medium' | 'large';
  elevation?: number;
  rotation?: { x: number; y: number; z: number };
  style?: React.CSSProperties;
}

export const CardComponent3D: React.FC<Card3DProps> = ({
  card,
  physicsEngine,
  position = new Float32Array([0, 0, 0]),
  onCardClick,
  onCardDoubleClick,
  onCardHover,
  onCardDrag,
  realistic3D = false,
  showBack = false,
  size = 'medium',
  elevation = 0,
  rotation = { x: 0, y: 0, z: 0 },
  style = {}
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(rotation);
  const [physicsCard, setPhysicsCard] = useState<PhysicsCard | null>(null);

  // Initialize physics card
  useEffect(() => {
    if (realistic3D && physicsEngine) {
      const initialRotation = new Float32Array([rotation.x, rotation.y, rotation.z]);
      const physics = physicsEngine.addCard(card.id, position, initialRotation);
      setPhysicsCard(physics);
      
      return () => {
        physicsEngine.removeCard(card.id);
      };
    }
  }, [realistic3D, physicsEngine, card.id, position, rotation]);

  // Update visual position from physics
  useEffect(() => {
    if (!realistic3D || !physicsCard || !cardRef.current) return;
    
    let animationFrame: number;
    
    const updatePosition = () => {
      if (physicsCard && cardRef.current) {
        const element = cardRef.current;
        const pos = physicsCard.position;
        const rot = physicsCard.rotation;
        
        // Convert physics coordinates to CSS transform
        const x = pos[0] * 100; // Scale to viewport
        const y = -pos[1] * 100; // Flip Y axis
        const z = pos[2] * 100;
        
        const rotX = rot[0] * (180 / Math.PI);
        const rotY = rot[1] * (180 / Math.PI);
        const rotZ = rot[2] * (180 / Math.PI);
        
        // Apply realistic 3D transform
        element.style.transform = `
          translate3d(${x}px, ${y}px, ${z}px)
          rotateX(${rotX}deg)
          rotateY(${rotY}deg)
          rotateZ(${rotZ}deg)
        `;
        
        setCurrentRotation({ x: rotX, y: rotY, z: rotZ });
      }
      
      animationFrame = requestAnimationFrame(updatePosition);
    };
    
    animationFrame = requestAnimationFrame(updatePosition);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [realistic3D, physicsCard]);

  // Realistic card interactions
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    onCardHover?.(card, true);
    
    if (realistic3D && physicsEngine) {
      // Subtle elevation effect
      physicsEngine.getCard(card.id)!.velocity[1] += 0.05;
    }
  }, [card, onCardHover, realistic3D, physicsEngine]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    onCardHover?.(card, false);
  }, [card, onCardHover]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onCardClick?.(card);
    
    if (realistic3D && physicsEngine) {
      // Add slight impulse on click
      const physCard = physicsEngine.getCard(card.id);
      if (physCard) {
        physCard.velocity[1] += 0.02;
        physCard.angularVelocity[2] += 0.1;
      }
    }
  }, [card, onCardClick, realistic3D, physicsEngine]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onCardDoubleClick?.(card);
    
    if (realistic3D && physicsEngine) {
      // Flip card with physics
      physicsEngine.flipCard(card.id, 1.5);
      setIsFlipping(true);
      
      setTimeout(() => setIsFlipping(false), 600);
    }
  }, [card, onCardDoubleClick, realistic3D, physicsEngine]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    onCardDrag?.(card, true);
    e.preventDefault();
  }, [card, onCardDrag]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    onCardDrag?.(card, false);
  }, [card, onCardDrag]);

  // Card styling based on state and physics
  const getCardStyle = (): React.CSSProperties => {
    const baseTransform = realistic3D ? '' : `
      translateX(${position[0] * 100}px)
      translateY(${position[1] * 100}px)
      translateZ(${position[2] * 100 + elevation}px)
      rotateX(${currentRotation.x}deg)
      rotateY(${currentRotation.y}deg)
      rotateZ(${currentRotation.z}deg)
    `;

    return {
      ...style,
      transform: realistic3D ? undefined : baseTransform,
      transformStyle: 'preserve-3d',
      transition: realistic3D ? 'none' : 'transform 0.3s ease, box-shadow 0.2s ease',
      boxShadow: isHovered 
        ? '0 20px 40px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.1)'
        : isDragging
        ? '0 30px 60px rgba(0,0,0,0.4), 0 0 30px rgba(255,255,255,0.2)'
        : '0 8px 16px rgba(0,0,0,0.2)',
      filter: isFlipping 
        ? 'blur(1px) brightness(1.2)'
        : isHovered 
        ? 'brightness(1.1) contrast(1.05)'
        : 'none',
      cursor: 'pointer',
      userSelect: 'none'
    };
  };

  // Get card face content
  const getCardContent = () => {
    if (showBack || (realistic3D && currentRotation.y > 90 && currentRotation.y < 270)) {
      return (
        <div className="card-back">
          <div className="card-pattern">
            <div className="pattern-grid">
              {Array.from({length: 64}, (_, i) => (
                <div key={i} className="pattern-dot" />
              ))}
            </div>
          </div>
        </div>
      );
    }

    const suitColor = card.suit === '♥' || card.suit === '♦' ? 'red' : 'black';
    
    return (
      <div className={`card-front ${suitColor}`}>
        <div className="card-corner top-left">
          <div className="rank">{card.rank}</div>
          <div className="suit">{card.suit}</div>
        </div>
        
        <div className="card-center">
          <div className="center-suit">{card.suit}</div>
        </div>
        
        <div className="card-corner bottom-right">
          <div className="rank">{card.rank}</div>
          <div className="suit">{card.suit}</div>
        </div>
        
        {/* Realistic paper texture overlay */}
        <div className="paper-texture" />
        
        {/* Shine effect for realism */}
        <div className="card-shine" />
      </div>
    );
  };

  return (
    <div
      ref={cardRef}
      className={`
        card-3d
        card-${size}
        ${isHovered ? 'hovered' : ''}
        ${isDragging ? 'dragging' : ''}
        ${isFlipping ? 'flipping' : ''}
        ${realistic3D ? 'realistic-physics' : ''}
      `}
      style={getCardStyle()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      data-card-id={card.id}
      data-card-suit={card.suit}
      data-card-rank={card.rank}
    >
      {/* Card inner container for 3D effects */}
      <div className="card-inner">
        {getCardContent()}
        
        {/* Edge highlights for realism */}
        <div className="card-edges">
          <div className="edge edge-top" />
          <div className="edge edge-right" />
          <div className="edge edge-bottom" />
          <div className="edge edge-left" />
        </div>
        
        {/* Physics indicators (dev mode) */}
        {realistic3D && physicsCard && (
          <div className="physics-debug">
            <div className="velocity-indicator">
              V: {Math.sqrt(
                physicsCard.velocity[0]**2 + 
                physicsCard.velocity[1]**2 + 
                physicsCard.velocity[2]**2
              ).toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardComponent3D; 