import React from 'react';
import { Card } from '../types/game';
import './CardComponent2D.css';

interface CardComponent2DProps {
  card: Card;
  onClick?: (card: Card) => void;
  onDoubleClick?: (card: Card) => void;
  isSelected?: boolean;
  isHinted?: boolean;
  style?: React.CSSProperties;
}

export const CardComponent2D: React.FC<CardComponent2DProps> = ({
  card,
  onClick,
  onDoubleClick,
  isSelected = false,
  isHinted = false,
  style = {}
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(card);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick?.(card);
  };

  const getCardStyle = (): React.CSSProperties => {
    return {
      ...style,
      boxShadow: isSelected 
        ? '0 0 10px 2px #4ade80'
        : isHinted
        ? '0 0 10px 2px #fbbf24'
        : '0 2px 4px rgba(0,0,0,0.2)',
      transform: isSelected ? 'translateY(-8px)' : 'none',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    };
  };

  const getCardContent = () => {
    if (!card.faceUp) {
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
    const rank = card.value === 1 ? 'A' : 
                card.value === 11 ? 'J' :
                card.value === 12 ? 'Q' :
                card.value === 13 ? 'K' :
                card.value.toString();
    
    return (
      <div className={`card-front ${suitColor}`}>
        <div className="card-corner top-left">
          <div className="rank">{rank}</div>
          <div className="suit">{card.suit}</div>
        </div>
        
        <div className="card-center">
          <div className="center-suit">{card.suit}</div>
        </div>
        
        <div className="card-corner bottom-right">
          <div className="rank">{rank}</div>
          <div className="suit">{card.suit}</div>
        </div>
        
        <div className="paper-texture" />
        <div className="card-shine" />
      </div>
    );
  };

  return (
    <div
      className={`
        card-2d
        ${isSelected ? 'selected' : ''}
        ${isHinted ? 'hinted' : ''}
      `}
      style={getCardStyle()}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {getCardContent()}
    </div>
  );
}; 