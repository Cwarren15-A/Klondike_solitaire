import React from 'react';
import { motion } from 'framer-motion';
import { Card as CardType } from '../types/game';

interface StockPileProps {
  cards: CardType[];
  onClick: () => void;
  isEmpty: boolean;
}

export const StockPile: React.FC<StockPileProps> = ({ cards, onClick, isEmpty }) => {
  return (
    <motion.div
      className="stock-pile"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isEmpty ? (
        <div className="empty-pile">
          <div className="recycle-icon">♻</div>
        </div>
      ) : (
        <div className="card-stack">
          <div className="card-back">♠</div>
          <span className="card-count">{cards.length}</span>
        </div>
      )}
    </motion.div>
  );
}; 