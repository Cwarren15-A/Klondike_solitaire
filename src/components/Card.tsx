import React from 'react';
import { motion } from 'framer-motion';
import { Card as CardType } from '../types/game';
import { useGameStore } from '../stores/gameStore';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  onDoubleClick?: () => void;
  isSelected?: boolean;
  isHinted?: boolean;
  isDragging?: boolean;
  style?: React.CSSProperties;
  className?: string;
  realistic3D?: boolean;
}

export const Card: React.FC<CardProps> = ({
  card,
  onClick,
  onDoubleClick,
  isSelected = false,
  isHinted = false,
  isDragging = false,
  style,
  className = '',
  realistic3D = false
}) => {
  const { settings } = useGameStore();
  const isRed = card.suit === '♥' || card.suit === '♦';
  
  const getCardValue = () => {
    switch (card.value) {
      case 1: return 'A';
      case 11: return 'J';
      case 12: return 'Q';
      case 13: return 'K';
      default: return card.value.toString();
    }
  };

  const cardVariants = {
    initial: { scale: 1, rotateY: card.faceUp ? 0 : 180 },
    hover: { scale: 1.05, rotateY: card.faceUp ? 0 : 180 },
    tap: { scale: 0.95, rotateY: card.faceUp ? 0 : 180 },
    drag: { scale: 1.1, rotateY: card.faceUp ? 0 : 180 },
    selected: { 
      scale: 1.1, 
      rotateY: card.faceUp ? 0 : 180,
      boxShadow: '0 0 10px rgba(255, 255, 0, 0.5)'
    },
    hinted: {
      scale: 1.05,
      rotateY: card.faceUp ? 0 : 180,
      boxShadow: '0 0 15px rgba(0, 255, 0, 0.5)'
    }
  };

  const currentVariant = isSelected ? 'selected' : 
                        isHinted ? 'hinted' : 
                        isDragging ? 'drag' : 'initial';

  return (
    <motion.div
      className={`card ${className} ${isSelected ? 'selected' : ''} ${isHinted ? 'hinted' : ''} ${realistic3D ? 'realistic-3d' : ''}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      style={style}
      variants={cardVariants}
      initial="initial"
      animate={currentVariant}
      whileHover="hover"
      whileTap="tap"
      transition={{ 
        duration: 0.2,
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
    >
      {card.faceUp ? (
        <div className={`card-face ${isRed ? 'red' : 'black'}`}>
          <div className="card-corner top-left">
            <div className="card-value">{getCardValue()}</div>
            <div className="card-suit">{card.suit}</div>
          </div>
          <div className="card-center">
            <div className="card-suit large">{card.suit}</div>
          </div>
          <div className="card-corner bottom-right">
            <div className="card-value">{getCardValue()}</div>
            <div className="card-suit">{card.suit}</div>
          </div>
        </div>
      ) : (
        <div className="card-back">
          <div className="card-pattern">
            <div className="pattern-top">♠</div>
            <div className="pattern-center">♠</div>
            <div className="pattern-bottom">♠</div>
          </div>
        </div>
      )}
    </motion.div>
  );
}; 