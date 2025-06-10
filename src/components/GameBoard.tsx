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

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { Card, Move } from '../types/game';
import { WebGPUCanvas } from './WebGPUCanvas';
import { MLVisualization } from './MLVisualization';
import { MaterialEditor } from './MaterialEditor';
import { CardComponent3D } from './CardComponent3D';
import { CardComponent2D } from './CardComponent2D';
import './GameBoard.css';
import '../styles/WebGPU.css';

interface GameBoardProps {
  className?: string;
}

const GameBoard: React.FC<GameBoardProps> = ({ className = '' }) => {
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
    mlAnalysis,
    currentView,
    setCurrentView,
    settings,
    getMLAnalysis
  } = useGameStore();

  const [showStats, setShowStats] = React.useState(false);
  const [showMLVisualization, setShowMLVisualization] = React.useState(false);
  const [showMaterialEditor, setShowMaterialEditor] = React.useState(false);
  const [realisticMode, setRealisticMode] = React.useState(settings.enableWebGPU);
  const [webgpuSupported, setWebgpuSupported] = React.useState<boolean | null>(null);
  const [hintedCards, setHintedCards] = React.useState<Set<string>>(new Set());
  const webgpuRef = React.useRef<typeof WebGPUCanvas>(null);

  React.useEffect(() => {
    initializeGame();
    
    // Check WebGPU support
    const checkWebGPU = async () => {
      try {
        if (!('gpu' in navigator)) {
          setWebgpuSupported(false);
          return;
        }
        
        const adapter = await (navigator as any).gpu.requestAdapter();
        setWebgpuSupported(!!adapter);
      } catch {
        setWebgpuSupported(false);
      }
    };
    
    checkWebGPU();
  }, [initializeGame]);

  React.useEffect(() => {
    if (settings.enableMLAnalysis) {
      getMLAnalysis();
    }
  }, [settings.enableMLAnalysis, getMLAnalysis]);

  const handleCardClick = (card: Card) => {
    if (selectedCard?.id === card.id) {
      selectCard(null);
      return;
    }

    if (selectedCard) {
      // Try to make a move
      const move: Move = {
        type: card.location,
        cardId: selectedCard.id,
        fromLocation: selectedCard.location,
        toLocation: card.location,
        fromPosition: selectedCard.position,
        toPosition: card.position
      };
      makeMove(move);
      selectCard(null);
    } else if (card.faceUp) {
      selectCard(card);
    }
  };

  const handleCardDoubleClick = (card: Card) => {
    // Auto-move to foundation
    const move: Move = {
      type: 'foundation',
      cardId: card.id,
      fromLocation: card.location,
      toLocation: 'foundation',
      fromPosition: card.position,
      toPosition: Object.keys(gameState.foundations).indexOf(card.suit)
    };
    makeMove(move);
    selectCard(null);
  };

  const handleStockClick = () => {
    const move: Move = {
      type: 'stock',
      cardId: gameState.stock[0]?.id || '',
      fromLocation: 'stock',
      toLocation: 'waste',
      fromPosition: 0,
      toPosition: gameState.waste.length
    };
    makeMove(move);
  };

  const handleFoundationClick = (suit: string) => {
    if (selectedCard) {
      const move: Move = {
        type: 'foundation',
        cardId: selectedCard.id,
        fromLocation: selectedCard.location,
        toLocation: 'foundation',
        fromPosition: selectedCard.position,
        toPosition: Object.keys(gameState.foundations).indexOf(suit)
      };
      makeMove(move);
      selectCard(null);
    }
  };

  const handleHint = async () => {
    try {
      const hintMove = await getHint();
      if (hintMove) {
        setHintedCards(new Set([hintMove.cardId]));
        setTimeout(() => setHintedCards(new Set()), 3000);
      }
    } catch (error) {
      console.log('Hint not available');
    }
  };

  const handleNewGame = () => {
    newGame();
    setShowMLVisualization(false);
    selectCard(null);
    setHintedCards(new Set());
  };

  const handleViewChange = (view: 'game' | 'stats' | 'ml') => {
    setCurrentView(view);
    if (view === 'ml') {
      setShowMLVisualization(true);
    } else {
      setShowMLVisualization(false);
    }
  };

  const toggleRealisticMode = () => {
    setRealisticMode(!realisticMode);
    if (webgpuRef.current) {
      webgpuRef.current.toggleRealisticMode();
    }
  };

  const renderCard = (card: Card, isHinted: boolean = false) => {
    if (realisticMode && webgpuSupported) {
      return (
        <CardComponent3D
          key={card.id}
          card={card}
          onCardClick={() => handleCardClick(card)}
          onCardDoubleClick={() => handleCardDoubleClick(card)}
          realistic3D={true}
          isHinted={isHinted}
          isSelected={selectedCard?.id === card.id}
        />
      );
    }
    
    return (
      <CardComponent2D
        key={card.id}
        card={card}
        onClick={() => handleCardClick(card)}
        onDoubleClick={() => handleCardDoubleClick(card)}
        isSelected={selectedCard?.id === card.id}
        isHinted={isHinted}
      />
    );
  };

  return (
    <div className={`game-board-container ${className}`}>
      <div className="game-header">
        <div className="game-controls">
          <button onClick={handleNewGame} className="control-button">
            New Game
          </button>
          <button onClick={undoMove} disabled={!canUndo} className="control-button">
            Undo
          </button>
          <button onClick={handleHint} disabled={!canHint} className="control-button">
            Hint
          </button>
          {webgpuSupported && (
            <button onClick={toggleRealisticMode} className="control-button">
              {realisticMode ? '2D Mode' : '3D Mode'}
            </button>
          )}
        </div>
        <div className="view-controls">
          <button 
            onClick={() => handleViewChange('game')} 
            className={`view-button ${currentView === 'game' ? 'active' : ''}`}
          >
            Game
          </button>
          <button 
            onClick={() => handleViewChange('stats')} 
            className={`view-button ${currentView === 'stats' ? 'active' : ''}`}
          >
            Stats
          </button>
          {settings.enableMLAnalysis && (
            <button 
              onClick={() => handleViewChange('ml')} 
              className={`view-button ${currentView === 'ml' ? 'active' : ''}`}
            >
              AI Analysis
            </button>
          )}
        </div>
      </div>

      <div className="game-content">
        {currentView === 'game' && (
          <div className="game-board">
            {realisticMode && webgpuSupported ? (
              <WebGPUCanvas
                gameState={gameState}
                selectedCard={selectedCard}
                hintedCards={hintedCards}
                onCardClick={handleCardClick}
                onCardDoubleClick={handleCardDoubleClick}
              />
            ) : (
              <>
                <div className="stock-waste">
                  <div className="stock" onClick={handleStockClick}>
                    {gameState.stock.map((card: Card) => renderCard(card))}
                  </div>
                  <div className="waste">
                    {gameState.waste.map((card: Card) => renderCard(card))}
                  </div>
                </div>

                <div className="foundations">
                  {(Object.entries(gameState.foundations) as [string, Card[]][]).map(([suit, cards], idx) => (
                    <div 
                      key={suit} 
                      className="foundation"
                      onClick={() => handleFoundationClick(suit)}
                    >
                      {cards.map((card: Card) => renderCard(card))}
                    </div>
                  ))}
                </div>

                <div className="tableau">
                  {gameState.tableau.map((column: Card[], index: number) => (
                    <div key={index} className="tableau-column">
                      {column.map((card: Card) => renderCard(card, hintedCards.has(card.id)))}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {currentView === 'stats' && (
          <div className="stats-view">
            <h2>Game Statistics</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Games Played:</span>
                <span className="stat-value">{statistics.gamesPlayed}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Win Rate:</span>
                <span className="stat-value">{(statistics.winRate * 100).toFixed(1)}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Best Time:</span>
                <span className="stat-value">{statistics.bestTime}s</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Best Score:</span>
                <span className="stat-value">{statistics.bestScore}</span>
              </div>
            </div>
          </div>
        )}

        {currentView === 'ml' && settings.enableMLAnalysis && (
          <div className="ml-view">
            <MLVisualization />
          </div>
        )}
      </div>

      {showMaterialEditor && (
        <MaterialEditor
          onClose={() => setShowMaterialEditor(false)}
          onSave={(settings: any) => {
            // Handle material settings save
            setShowMaterialEditor(false);
          }}
        />
      )}
    </div>
  );
};

export default GameBoard; 