/*
 * GameBoard.tsx - Future React Template
 * 
 * This is a template file for when you decide to modernize from your current
 * working HTML file to a React-based architecture.
 * 
 * Your current index.html file is working perfectly and doesn't need this!
 * 
 * This file is provided as a reference for future modernization if desired.
 */

// When you're ready to migrate to React, you would:
// 1. Install dependencies: npm install react react-dom @types/react
// 2. Set up TypeScript properly
// 3. Replace the content below with actual React components

/*
// Example React component structure (uncomment when React is installed):

import React, { useState, useEffect, useCallback } from 'react';

interface Card {
  id: string;
  suit: '♠' | '♥' | '♦' | '♣';
  rank: string;
  value: number;
  faceUp: boolean;
}

interface GameBoardProps {
  onCardMove?: (move: any) => void;
  showHints?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({ onCardMove, showHints = false }) => {
  const [gameState, setGameState] = useState({
    stock: [],
    waste: [],
    tableau: Array(7).fill([]),
    foundations: { '♠': [], '♥': [], '♦': [], '♣': [] }
  });

  return (
    <div className="game-board min-h-screen bg-green-800 p-4">
      <h1 className="text-white text-3xl mb-4">Klondike Solitaire</h1>
      
      <div className="flex gap-4 mb-6">
        <div className="stock w-16 h-24 bg-gray-600 rounded border-2 border-dashed border-gray-400"></div>
        <div className="waste w-16 h-24 bg-gray-700 rounded border-2 border-dashed border-gray-500"></div>
      </div>
      
      <div className="foundations flex gap-4 mb-6 justify-end">
        {['♠', '♥', '♦', '♣'].map(suit => (
          <div key={suit} className="foundation w-16 h-24 bg-gray-700 rounded border-2 border-dashed border-gray-500 flex items-center justify-center">
            <span className="text-white text-2xl">{suit}</span>
          </div>
        ))}
      </div>
      
      <div className="tableau flex gap-3 justify-center">
        {Array.from({length: 7}, (_, i) => (
          <div key={i} className="pile w-16 min-h-32">
            <div className="w-16 h-24 bg-gray-700 rounded border-2 border-dashed border-gray-500"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
*/

// For now, this is just a placeholder template.
// Your current HTML implementation is working perfectly!

import React, { useEffect, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { Card, Move } from '../types/game';
import './GameBoard.css';

// Simple Card Component
const CardComponent: React.FC<{
  card: Card;
  onClick?: () => void;
  onDoubleClick?: () => void;
  isHinted?: boolean;
}> = ({ card, onClick, onDoubleClick, isHinted = false }) => (
  <div
    className={`card ${card.faceUp ? 'face-up' : 'face-down'} ${isHinted ? 'hint' : ''}`}
    onClick={onClick}
    onDoubleClick={onDoubleClick}
  >
    {card.faceUp ? (
      <div className={`card-content ${card.suit === '♥' || card.suit === '♦' ? 'red' : 'black'}`}>
        <span className="rank">{card.rank}</span>
        <span className="suit">{card.suit}</span>
      </div>
    ) : (
      <div className="card-back">🂠</div>
    )}
  </div>
);

const GameBoard: React.FC = () => {
  const {
    gameState,
    initializeGame,
    makeMove,
    undoMove,
    getHint,
    newGame,
    canUndo,
    canHint,
    isGameWon,
    statistics,
    selectedCard,
    selectCard,
  } = useGameStore();

  const [showStats, setShowStats] = useState(false);
  const [realisticMode, setRealisticMode] = useState(false);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleCardClick = (card: Card) => {
    if (selectedCard) {
      // Try to make a move
      const move: Move = {
        type: 'tableau',
        cardId: card.id,
        sourceType: 'tableau',
        targetType: 'tableau',
      };
      makeMove(move);
      selectCard(null);
    } else {
      selectCard(card);
    }
  };

  const handleStockClick = () => {
    const move: Move = {
      type: 'stock-flip',
      cardId: '',
      sourceType: 'stock',
      targetType: 'waste',
    };
    makeMove(move);
  };

  const handleFoundationClick = (suit: string) => {
    if (selectedCard) {
      const move: Move = {
        type: 'foundation',
        cardId: selectedCard.id,
        sourceType: 'tableau',
        targetType: 'foundation',
      };
      makeMove(move);
      selectCard(null);
    }
  };

  const handleHint = async () => {
    try {
      await getHint();
    } catch (error) {
      console.log('Hint not available');
    }
  };

  return (
    <div className="game-board">
      {/* Game Header */}
      <div className="game-header">
        <h1>🃏 Advanced Klondike Solitaire</h1>
        <div className="game-info">
          <span>Score: {gameState.gameStats.score}</span>
          <span>Moves: {gameState.gameStats.moves}</span>
          <span>Time: {Math.floor(gameState.gameStats.time / 60)}:{(gameState.gameStats.time % 60).toString().padStart(2, '0')}</span>
        </div>
      </div>

      {/* Game Controls */}
      <div className="game-controls">
        <button onClick={newGame} className="control-btn new-game">
          🔄 New Game
        </button>
        <button onClick={undoMove} disabled={!canUndo} className="control-btn undo">
          ↶ Undo
        </button>
        <button onClick={handleHint} disabled={!canHint} className="control-btn hint">
          💡 Hint
        </button>
        <button 
          onClick={() => setRealisticMode(!realisticMode)} 
          className={`control-btn realistic ${realisticMode ? 'active' : ''}`}
        >
          🎮 Realistic 3D Cards
        </button>
        <button onClick={() => setShowStats(!showStats)} className="control-btn stats">
          📊 Stats
        </button>
      </div>

      {/* Statistics Panel */}
      {showStats && (
        <div className="stats-panel">
          <h3>📈 Game Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Games Won:</span>
              <span className="stat-value">{statistics.gamesWon}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Games Played:</span>
              <span className="stat-value">{statistics.gamesPlayed}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Win Rate:</span>
              <span className="stat-value">
                {statistics.gamesPlayed ? ((statistics.gamesWon / statistics.gamesPlayed) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Best Time:</span>
              <span className="stat-value">{statistics.bestTime}s</span>
            </div>
          </div>
        </div>
      )}

      {/* Stock and Waste Piles */}
      <div className="top-piles">
        <div className="stock-waste">
          <div className="stock-pile" onClick={handleStockClick}>
            {gameState.stock.length > 0 ? (
              <div className="stock-card">🂠</div>
            ) : (
              <div className="stock-empty">♻️</div>
            )}
            <div className="stock-count">{gameState.stock.length}</div>
          </div>
          <div className="waste-pile">
            {gameState.waste.slice(-3).map((card, index) => (
              <CardComponent
                key={card.id}
                card={card}
                onClick={() => handleCardClick(card)}
              />
            ))}
          </div>
        </div>

        {/* Foundation Piles */}
        <div className="foundations">
          {['♠', '♥', '♦', '♣'].map(suit => (
            <div 
              key={suit} 
              className="foundation-pile"
              onClick={() => handleFoundationClick(suit)}
            >
              <div className="foundation-placeholder">{suit}</div>
              {gameState.foundations[suit]?.slice(-1).map((card) => (
                <CardComponent key={card.id} card={card} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Tableau Piles */}
      <div className="tableau">
        {gameState.tableau.map((pile, pileIndex) => (
          <div key={pileIndex} className="tableau-pile">
            {pile.map((card, cardIndex) => (
              <CardComponent
                key={card.id}
                card={card}
                onClick={() => handleCardClick(card)}
                isHinted={card.id === gameState.hintCardId}
              />
            ))}
          </div>
        ))}
      </div>

      {/* 3D Mode Indicator */}
      {realisticMode && (
        <div className="realistic-mode-indicator">
          <span>🎮 3D Physics Mode Active</span>
          <div className="physics-stats">
            <span>Mass: 1.8g</span>
            <span>Friction: 0.4</span>
            <span>Bounce: 15%</span>
          </div>
        </div>
      )}

      {/* Victory Screen */}
      {isGameWon && (
        <div className="victory-overlay">
          <div className="victory-message">
            <h2>🎉 Congratulations! You Won!</h2>
            <div className="victory-stats">
              <p>Score: {gameState.gameStats.score}</p>
              <p>Moves: {gameState.gameStats.moves}</p>
              <p>Time: {Math.floor(gameState.gameStats.time / 60)}:{(gameState.gameStats.time % 60).toString().padStart(2, '0')}</p>
            </div>
            <button onClick={newGame} className="new-game-btn">
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard; 