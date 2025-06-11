import React from 'react';
import { motion } from 'framer-motion';
import { Card as CardType } from '../types/game';
import './Card.css';

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
  realistic3D = true
}) => {
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  
  const getCardValue = () => {
    switch (card.rank) {
      case 1: return 'A';
      case 11: return 'J';
      case 12: return 'Q';
      case 13: return 'K';
      default: return card.rank.toString();
    }
  };

  const getSuitSymbol = () => {
    switch (card.suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };

  const cardVariants = {
    initial: { 
      scale: 1,
      rotateY: card.faceUp ? 0 : 180,
      y: 0
    },
    hover: { 
      scale: 1.05,
      rotateY: card.faceUp ? 0 : 180,
      y: -10,
      transition: {
        duration: 0.2,
        type: 'spring',
        stiffness: 300,
        damping: 20
      }
    },
    tap: { 
      scale: 0.95,
      rotateY: card.faceUp ? 0 : 180,
      y: 0
    },
    drag: { 
      scale: 1.1,
      rotateY: card.faceUp ? 0 : 180,
      y: -20,
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)'
    },
    selected: { 
      scale: 1.1,
      rotateY: card.faceUp ? 0 : 180,
      y: -15,
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
    },
    hinted: {
      scale: 1.05,
      rotateY: card.faceUp ? 0 : 180,
      y: -5,
      boxShadow: '0 0 15px rgba(0, 255, 0, 0.4)'
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
      drag={isDragging}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
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
            <div className="card-suit">{getSuitSymbol()}</div>
          </div>
          <div className="card-center">
            <div className="card-suit large">{getSuitSymbol()}</div>
          </div>
          <div className="card-corner bottom-right">
            <div className="card-value">{getCardValue()}</div>
            <div className="card-suit">{getSuitSymbol()}</div>
          </div>
        </div>
      ) : (
        <div className="card-back">
          <div className="card-pattern">
            <div className="pattern-top">{getSuitSymbol()}</div>
            <div className="pattern-center">{getSuitSymbol()}</div>
            <div className="pattern-bottom">{getSuitSymbol()}</div>
          </div>
        </div>
      )}
    </motion.div>
  );
}; 