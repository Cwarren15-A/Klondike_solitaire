import React from 'react';
import { motion } from 'framer-motion';
import { Card as CardType } from '../types/game';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  onDoubleClick?: () => void;
  isSelected?: boolean;
  isHinted?: boolean;
  isDragging?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  card,
  onClick,
  onDoubleClick,
  isSelected = false,
  isHinted = false,
  isDragging = false,
  style,
  className = ''
}) => {
  const isRed = card.suit === '♥' || card.suit === '♦';
  
  return (
    <motion.div
      className={`card ${className} ${isSelected ? 'selected' : ''} ${isHinted ? 'hinted' : ''}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      style={style}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        rotateY: card.faceUp ? 0 : 180,
        scale: isDragging ? 1.1 : 1,
      }}
      transition={{ duration: 0.2 }}
    >
      {card.faceUp ? (
        <div className={`card-face ${isRed ? 'red' : 'black'}`}>
          <div className="card-rank">{card.rank}</div>
          <div className="card-suit">{card.suit}</div>
          <div className="card-rank bottom">{card.rank}</div>
        </div>
      ) : (
        <div className="card-back">
          <div className="card-pattern">♠</div>
        </div>
      )}
    </motion.div>
  );
}; 