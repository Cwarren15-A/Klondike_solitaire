import React from 'react';
import { motion } from 'framer-motion';
import { Card as CardType } from '../types/game';
import './Card.css';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  isSelected?: boolean;
  isHinted?: boolean;
  realistic3D?: boolean;
}

const Card: React.FC<CardProps> = ({
  card,
  onClick,
  isSelected = false,
  isHinted = false,
  realistic3D = true,
}) => {
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

  const getCardValue = (rank: number): string => {
    switch (rank) {
      case 1: return 'A';
      case 11: return 'J';
      case 12: return 'Q';
      case 13: return 'K';
      default: return rank.toString();
    }
  };

  const getSuitSymbol = (suit: string): string => {
    switch (suit) {
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
      rotateY: 0,
      y: 0,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    hover: {
      scale: 1.05,
      rotateY: 5,
      y: -5,
      boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
      transition: {
        duration: 0.2,
      },
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1,
      },
    },
    drag: {
      scale: 1.1,
      rotateY: 10,
      y: -10,
      boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
    },
    selected: {
      scale: 1.1,
      y: -10,
      boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
    },
    hinted: {
      scale: 1.05,
      y: -5,
      boxShadow: '0 0 20px rgba(255,215,0,0.5)',
    },
  };

  return (
    <motion.div
      className={`card ${isRed ? 'red' : 'black'} ${realistic3D ? 'realistic-3d' : ''} ${isSelected ? 'selected' : ''} ${isHinted ? 'hinted' : ''}`}
      onClick={onClick}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      animate={isSelected ? 'selected' : isHinted ? 'hinted' : 'initial'}
      drag={card.faceUp}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      whileDrag="drag"
    >
      {card.faceUp ? (
        <div className="card-face">
          <div className="card-corner top-left">
            <div className="card-value">{getCardValue(card.rank)}</div>
            <div className="card-suit">{getSuitSymbol(card.suit)}</div>
          </div>
          <div className="card-center">
            <div className="card-suit large">{getSuitSymbol(card.suit)}</div>
          </div>
          <div className="card-corner bottom-right">
            <div className="card-value">{getCardValue(card.rank)}</div>
            <div className="card-suit">{getSuitSymbol(card.suit)}</div>
          </div>
        </div>
      ) : (
        <div className="card-back">
          <div className="card-back-pattern"></div>
        </div>
      )}
    </motion.div>
  );
};

export default Card; 