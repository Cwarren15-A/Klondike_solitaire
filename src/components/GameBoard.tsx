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

import React, { useRef, useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { Card as CardType, GameState, Move } from '../types/game';
import WebGPUCanvas from './WebGPUCanvas';
import { MaterialEditor } from './MaterialEditor';
import MLVisualization from './MLVisualization';
import { AIService } from '../services/AIService';
import { GameStateService } from '../services/GameStateService';
import { Card } from './Card';
import './GameBoard.css';
import '../styles/WebGPU.css';

interface GameBoardProps {
  className?: string;
}

const GameBoard: React.FC<GameBoardProps> = ({ className = '' }) => {
  const {
    gameState,
    makeMove,
    undoMove,
    newGame,
  } = useGameStore();

  const webgpuRef = useRef<any>(null);
  const [showMaterialEditor, setShowMaterialEditor] = useState(false);
  const [showMLVisualization, setShowMLVisualization] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);

  // Initialize services
  const aiService = new AIService();
  const gameStateService = new GameStateService(aiService);

  useEffect(() => {
    // Initialize AI service
    aiService.initialize().catch(console.error);

    // Cleanup on unmount
    return () => {
      aiService.cleanup();
    };
  }, []);

  const handleStockClick = async () => {
    const move: Move = {
      from: 'stock',
      to: 'waste',
      cardIndex: 0,
      pileIndex: 0
    };

    const success = await gameStateService.makeMove(move);
    if (success) {
      makeMove(move);
      // Get AI analysis
      const analysis = await aiService.analyzeGameState(gameState);
      setAiAnalysis(analysis);
    }
  };

  const handleCardClick = (card: CardType, location: 'stock' | 'waste' | 'foundation' | 'tableau', index: number) => {
    if (selectedCard) {
      // If a card is already selected, try to move it
      const move: Move = {
        from: selectedCard.location,
        to: location,
        cardIndex: selectedCard.index,
        pileIndex: index
      };
      handleCardMove(move);
      setSelectedCard(null);
    } else {
      // Select the card
      setSelectedCard({ ...card, location, index });
    }
  };

  const handleCardMove = async (move: Move) => {
    const success = await gameStateService.makeMove(move);
    if (success) {
      makeMove(move);
      // Get AI analysis
      const analysis = await aiService.analyzeGameState(gameState);
      setAiAnalysis(analysis);
    }
  };

  return (
    <div className={`game-board-container ${className}`}>
      <div className="game-area">
        <WebGPUCanvas ref={webgpuRef} gameState={gameState} />
        <div className="game-board">
          {/* Stock and Waste */}
          <div className="stock-waste-area">
            <div className="stock" onClick={handleStockClick}>
              {gameState.stock.map((card: CardType, index: number) => (
                <Card
                  key={card.id}
                  card={card}
                  onClick={() => handleCardClick(card, 'stock', index)}
                  isSelected={selectedCard?.id === card.id}
                  realistic3D={true}
                />
              ))}
            </div>
            <div className="waste">
              {gameState.waste.map((card: CardType, index: number) => (
                <Card
                  key={card.id}
                  card={card}
                  onClick={() => handleCardClick(card, 'waste', index)}
                  isSelected={selectedCard?.id === card.id}
                  realistic3D={true}
                />
              ))}
            </div>
          </div>

          {/* Foundations */}
          <div className="foundations">
            {gameState.foundations.map((foundation, pileIndex) => (
              <div key={pileIndex} className="foundation">
                {foundation.map((card: CardType, index: number) => (
                  <Card
                    key={card.id}
                    card={card}
                    onClick={() => handleCardClick(card, 'foundation', pileIndex)}
                    isSelected={selectedCard?.id === card.id}
                    realistic3D={true}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Tableau */}
          <div className="tableau">
            {gameState.tableau.map((pile: CardType[], pileIndex: number) => (
              <div key={pileIndex} className="tableau-pile">
                {pile.map((card: CardType, index: number) => (
                  <Card
                    key={card.id}
                    card={card}
                    onClick={() => handleCardClick(card, 'tableau', pileIndex)}
                    isSelected={selectedCard?.id === card.id}
                    realistic3D={true}
                  />
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
        <button onClick={() => setShowMaterialEditor(!showMaterialEditor)}>
          Material Editor
        </button>
        <button onClick={() => setShowMLVisualization(!showMLVisualization)}>
          AI Analysis
        </button>
      </div>

      {/* Material Editor */}
      {showMaterialEditor && (
        <MaterialEditor onSave={() => setShowMaterialEditor(false)} />
      )}

      {/* ML Visualization */}
      {showMLVisualization && aiAnalysis && (
        <MLVisualization
          gameState={gameState}
          analysis={aiAnalysis}
        />
      )}
    </div>
  );
};

export default GameBoard; 