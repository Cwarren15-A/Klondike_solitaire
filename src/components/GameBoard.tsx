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
import { StockPile, WastePile, Foundation, TableauPile, GameHeader, GameControls, GameStats } from './index';
import { MLVisualization } from './MLVisualization';
import { Card } from '../types/game';
import './GameBoard.css';

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
    mlAnalysis,
    startDrag,
    endDrag,
    isDragging,
    currentView,
    setCurrentView
  } = useGameStore();

  const [showMLVisualization, setShowMLVisualization] = useState(false);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleCardClick = (card: Card) => {
    if (isDragging) {
      endDrag();
    } else {
      startDrag(card);
    }
  };

  const handleCardDoubleClick = (card: Card) => {
    // Try to auto-move to foundation
    makeMove({
      type: 'foundation',
      cardId: card.id,
      sourceType: 'tableau',
      targetType: 'foundation'
    });
  };

  const handleStockClick = () => {
    makeMove({
      type: 'stock-flip',
      cardId: '',
      sourceType: 'stock',
      targetType: 'waste'
    });
  };

  const handleHint = async () => {
    const hint = await getHint();
    if (hint) {
      // Highlight the suggested move
      console.log('Hint:', hint);
    }
  };

  const handleNewGame = () => {
    newGame();
    setShowMLVisualization(false);
  };

  const handleUndo = () => {
    undoMove();
  };

  const handleViewChange = (view: string) => {
    const validViews = ['game', 'stats', 'ml'] as const;
    if (validViews.includes(view as any)) {
      setCurrentView(view as 'game' | 'stats' | 'ml');
      if (view === 'ml') {
        setShowMLVisualization(true);
      } else {
        setShowMLVisualization(false);
      }
    }
  };

  if (!gameState) {
    return <div className="loading">Loading game...</div>;
  }

  return (
    <div className="game-board">
      <GameHeader onViewChange={handleViewChange} />
      
      {currentView === 'game' && (
        <>
          <div className="game-area">
            <div className="stock-waste-area">
              <StockPile cards={gameState.stock} onStockClick={handleStockClick} />
              <WastePile cards={gameState.waste} onCardClick={handleCardClick} />
            </div>
            
            <div className="foundations">
              {Object.entries(gameState.foundations).map(([suit, cards]) => (
                <Foundation
                  key={suit}
                  suit={suit}
                  cards={cards}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>
          </div>
          
          <div className="tableau">
            {gameState.tableau.map((pile: Card[], index: number) => (
              <TableauPile
                key={index}
                cards={pile}
                onCardClick={handleCardClick}
                onCardDoubleClick={handleCardDoubleClick}
              />
            ))}
          </div>
          
          <GameControls
            onNewGame={handleNewGame}
            onUndo={handleUndo}
            onHint={handleHint}
            canUndo={canUndo}
            canHint={canHint}
          />
          
          {isGameWon && (
            <div className="victory-message">
              <h2>🎉 Congratulations! You won!</h2>
              <button onClick={handleNewGame}>Play Again</button>
            </div>
          )}
        </>
      )}
      
      {currentView === 'stats' && (
        <div className="stats-view">
          <GameStats stats={statistics} />
        </div>
      )}
      
      {(currentView === 'ml' || showMLVisualization) && mlAnalysis && (
        <div className="ml-view">
          <MLVisualization analysis={mlAnalysis} />
        </div>
      )}
    </div>
  );
};

export default GameBoard; 