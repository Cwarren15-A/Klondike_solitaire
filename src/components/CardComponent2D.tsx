import React from 'react';
import { Card } from '../types/game';
import './CardComponent2D.css';

interface CardComponent2DProps {
  card: Card;
  onClick?: () => void;
  onDoubleClick?: () => void;
  isSelected?: boolean;
  isHinted?: boolean;
  style?: React.CSSProperties;
}

const CardComponent2D: React.FC<CardComponent2DProps> = ({
  card,
  onClick,
  onDoubleClick,
  isSelected = false,
  isHinted = false,
  style
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onDoubleClick?.();
  };

  const getCardStyle = (): React.CSSProperties => ({
    ...style,
    transform: isSelected ? 'translateY(-20px) scale(1.1)' : undefined,
    zIndex: isSelected ? 20 : isHinted ? 10 : 1
  });

  const getCardContent = () => {
    if (!card.faceUp) {
      return (
        <div className="card-back">
          <div className="card-pattern"></div>
        </div>
      );
    }

    const isRed = card.suit === '♥' || card.suit === '♦';
    const rank = card.value === 1 ? 'A' : 
                card.value === 11 ? 'J' : 
                card.value === 12 ? 'Q' : 
                card.value === 13 ? 'K' : 
                card.value.toString();

    return (
      <div className="card-front">
        <div className={`card-corner top-left ${isRed ? 'red' : 'black'}`}>
          <div className="rank">{rank}</div>
          <div className="card-suit">{card.suit}</div>
        </div>
        <div className={`card-center ${isRed ? 'red' : 'black'}`}>
          {card.suit}
        </div>
        <div className={`card-corner bottom-right ${isRed ? 'red' : 'black'}`}>
          <div className="rank">{rank}</div>
          <div className="card-suit">{card.suit}</div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`card ${card.faceUp ? 'face-up' : 'face-down'} ${isSelected ? 'selected' : ''} ${isHinted ? 'hinted' : ''}`}
      style={getCardStyle()}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className="card-content">
        {getCardContent()}
      </div>
    </div>
  );
};

export default CardComponent2D; 