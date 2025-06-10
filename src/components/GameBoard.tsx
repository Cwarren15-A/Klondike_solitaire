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
import { useRef, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { Card } from '../types/game';
import WebGPUCanvas from './WebGPUCanvas';
import { MaterialEditor } from './MaterialEditor';
import './GameBoard.css';
import '../styles/WebGPU.css';

interface GameBoardProps {
  className?: string;
}

const GameBoard: React.FC<GameBoardProps> = ({ className = '' }) => {
  const {
    gameState,
    selectedCard,
    makeMove,
    selectCard,
    undoMove,
    newGame,
  } = useGameStore();

  const webgpuRef = useRef<any>(null);
  const [showMaterialEditor, setShowMaterialEditor] = useState(false);

  const handleStockClick = () => {
    makeMove({
      type: 'stock',
      cardId: 'stock'
    });
  };

  return (
    <div className={`game-board-container ${className}`}>
      <div className="game-area">
        <WebGPUCanvas ref={webgpuRef} gameState={gameState} />
        <div className="game-board">
          {/* Stock and Waste */}
          <div className="stock-waste-area">
            <div className="stock" onClick={handleStockClick}>
              {gameState.stock.map((card: Card) => (
                <div key={card.id} />
              ))}
            </div>
            <div className="waste">
              {gameState.waste.map((card: Card) => (
                <div key={card.id} />
              ))}
            </div>
          </div>

          {/* Foundations */}
          <div className="foundations">
            {Object.entries(gameState.foundations).map(([suit, cards]) => (
              <div key={suit} className="foundation">
                {(cards as Card[]).map((card) => (
                  <div key={card.id} />
                ))}
              </div>
            ))}
          </div>

          {/* Tableau */}
          <div className="tableau">
            {gameState.tableau.map((pile: Card[], index: number) => (
              <div key={index} className="tableau-pile">
                {pile.map((card) => (
                  <div key={card.id} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="game-controls">
        <button onClick={newGame}>New Game</button>
        <button onClick={undoMove}>Undo</button>
      </div>

      {/* Material Editor */}
      {showMaterialEditor && (
        <MaterialEditor onSave={() => setShowMaterialEditor(false)} />
      )}
    </div>
  );
};

export default GameBoard; 