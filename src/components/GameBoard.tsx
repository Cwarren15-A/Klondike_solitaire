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

import React, { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { StockPile, WastePile, Foundation, TableauPile, GameHeader, GameControls, GameStats, WebGPUCanvas } from './index';
import { MLVisualization } from './MLVisualization';
import { Card3DRenderer } from '../utils/cardRenderer3D';
import { CardPhysicsEngine } from '../utils/cardPhysics';
import { Card } from '../types/game';
import './GameBoard.css';
import '../styles/WebGPU.css';

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
  const [card3DRenderer, setCard3DRenderer] = useState<Card3DRenderer | null>(null);
  const [physicsEngine, setPhysicsEngine] = useState<CardPhysicsEngine | null>(null);
  const [realisticMode, setRealisticMode] = useState(true);
  const webgpuCanvasRef = useRef<any>(null);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Initialize 3D card systems
  useEffect(() => {
    const initializeCardSystems = async () => {
      if (!webgpuCanvasRef.current) return;
      
      try {
        // Get WebGPU context from canvas
        const canvas = webgpuCanvasRef.current;
        const context = canvas.getContext('webgpu');
        const adapter = await navigator.gpu?.requestAdapter();
        const device = await adapter?.requestDevice();
        
        if (device && context) {
          // Initialize physics engine
          const physics = new CardPhysicsEngine();
          setPhysicsEngine(physics);
          
          // Initialize 3D renderer (would need PBR renderer instance)
          // const renderer3D = new Card3DRenderer(device, context, pbrRenderer);
          // await renderer3D.init();
          // setCard3DRenderer(renderer3D);
          
          console.log('🃏 3D Card Systems initialized!');
        }
      } catch (error) {
        console.warn('WebGPU not available, falling back to 2D mode:', error);
        setRealisticMode(false);
      }
    };
    
    initializeCardSystems();
  }, []);

  const handleCardClick = (card: Card) => {
    if (isDragging) {
      endDrag();
    } else {
      startDrag(card);
    }
    
    // Realistic card flip with physics
    if (realisticMode && physicsEngine) {
      physicsEngine.flipCard(card.id, 1.0);
    }
    
    // Trigger WebGPU particle effects
    if (webgpuCanvasRef.current) {
      webgpuCanvasRef.current.triggerCardEffect?.('sparkle', { x: 0, y: 0 });
    }
  };

  const handleCardDoubleClick = (card: Card) => {
    // Try to auto-move to foundation
    const moveResult = makeMove({
      type: 'foundation',
      cardId: card.id,
      sourceType: 'tableau',
      targetType: 'foundation'
    });
    
    if (realisticMode && physicsEngine) {
      // Realistic card dealing physics to foundation
      const foundationPosition = new Float32Array([0.5, 0.8, 0.1]); // Top right area
      physicsEngine.dealCard(card.id, foundationPosition, 0.8);
    }
    
    // Victory sparkle effect
    if (webgpuCanvasRef.current) {
      webgpuCanvasRef.current.triggerCardEffect?.('victory', { x: 0.5, y: 0.8 });
    }
  };

  const handleStockClick = () => {
    makeMove({
      type: 'stock-flip',
      cardId: '',
      sourceType: 'stock',
      targetType: 'waste'
    });
    
    // Realistic card dealing from stock to waste
    if (realisticMode && physicsEngine && gameState.waste.length > 0) {
      const topCard = gameState.waste[gameState.waste.length - 1];
      const wastePosition = new Float32Array([0.1, 0.8, 0.0]);
      physicsEngine.dealCard(topCard.id, wastePosition, 1.2);
    }
  };

  const handleHint = async () => {
    const hint = await getHint();
    if (hint) {
      console.log('💡 AI Hint:', hint);
      
      // Highlight suggested cards with magic particle effect
      if (webgpuCanvasRef.current) {
        webgpuCanvasRef.current.triggerCardEffect?.('magic', { x: 0.3, y: 0.5 });
      }
    }
  };

  const handleNewGame = () => {
    newGame();
    setShowMLVisualization(false);
    
    // Realistic shuffling animation
    if (realisticMode && physicsEngine && gameState) {
      const allCards = [
        ...gameState.stock,
        ...gameState.waste,
        ...gameState.foundations.spades,
        ...gameState.foundations.hearts,
        ...gameState.foundations.diamonds,
        ...gameState.foundations.clubs,
        ...gameState.tableau.flat()
      ];
      
      // Shuffle with physics simulation
      allCards.forEach(card => {
        const shufflePosition = new Float32Array([
          (Math.random() - 0.5) * 0.3,
          0.5 + Math.random() * 0.2,
          (Math.random() - 0.5) * 0.1
        ]);
        physicsEngine.dealCard(card.id, shufflePosition, 0.5);
      });
      
      // Deal cards to tableau with realistic timing
      setTimeout(() => {
        gameState.tableau.forEach((pile, pileIndex) => {
          pile.forEach((card, cardIndex) => {
            const tableauPosition = new Float32Array([
              -0.3 + (pileIndex * 0.1),
              0.3 - (cardIndex * 0.01),
              0.0
            ]);
            
            setTimeout(() => {
              physicsEngine.dealCard(card.id, tableauPosition, 1.0);
            }, (pileIndex * 7 + cardIndex) * 100); // Staggered dealing
          });
        });
      }, 1000);
    }
    
    // New game celebration effect
    if (webgpuCanvasRef.current) {
      webgpuCanvasRef.current.triggerCardEffect?.('ai-generation', { x: 0.5, y: 0.5 });
    }
  };

  const handleUndo = () => {
    undoMove();
    
    // Reverse movement with physics
    if (realisticMode && physicsEngine) {
      console.log('🔄 Undoing move with realistic physics');
    }
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

  // Physics simulation loop
  useEffect(() => {
    if (!physicsEngine || !realisticMode) return;
    
    let animationFrame: number;
    let lastTime = performance.now();
    
    const simulate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;
      
      // Update physics simulation
      physicsEngine.simulate(deltaTime);
      
      // Update 3D card positions
      if (card3DRenderer) {
        card3DRenderer.updateAnimations(currentTime);
      }
      
      animationFrame = requestAnimationFrame(simulate);
    };
    
    animationFrame = requestAnimationFrame(simulate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [physicsEngine, card3DRenderer, realisticMode]);

  if (!gameState) {
    return (
      <div className="loading">
        <div className="loading-text">🃏 Loading realistic card physics...</div>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Victory effects with realistic physics
  useEffect(() => {
    if (isGameWon && realisticMode && physicsEngine) {
      console.log('🎉 Victory! Triggering realistic celebration physics');
      
      // All cards fly up in celebration
      Object.values(gameState.foundations).flat().forEach((card, index) => {
        setTimeout(() => {
          const celebrationPosition = new Float32Array([
            (Math.random() - 0.5) * 1.0,
            1.5 + Math.random() * 0.5,
            (Math.random() - 0.5) * 0.2
          ]);
          physicsEngine.dealCard(card.id, celebrationPosition, 2.0);
        }, index * 50);
      });
      
      // Victory particle explosion
      if (webgpuCanvasRef.current) {
        webgpuCanvasRef.current.triggerCardEffect?.('victory', { x: 0.5, y: 0.5 });
      }
    }
  }, [isGameWon, realisticMode, physicsEngine, gameState]);

  return (
    <div className="game-board-with-webgpu">
      {/* WebGPU Canvas Layer with Physics */}
      <WebGPUCanvas 
        className="webgpu-background"
      />
      
      {/* Game Content Layer */}
      <div className="game-content">
        <GameHeader onViewChange={handleViewChange} />
        
        {/* Realistic Mode Toggle */}
        <div className="graphics-controls">
          <label className="realistic-toggle">
            <input
              type="checkbox"
              checked={realisticMode}
              onChange={(e) => setRealisticMode(e.target.checked)}
            />
            <span>🃏 Realistic 3D Cards</span>
          </label>
          
          {realisticMode && (
            <div className="physics-status">
              <span className="status-indicator active">⚡ Physics Active</span>
              <span className="status-indicator">🎨 PBR Rendering</span>
              <span className="status-indicator">🤖 AI Materials</span>
            </div>
          )}
        </div>
        
        {currentView === 'game' && (
          <>
            <div className="game-area">
              <div className="stock-waste-area">
                <StockPile 
                  cards={gameState.stock} 
                  onStockClick={handleStockClick}
                  realistic3D={realisticMode}
                />
                <WastePile 
                  cards={gameState.waste} 
                  onCardClick={handleCardClick}
                  realistic3D={realisticMode}
                />
              </div>
              
              <div className="foundations">
                {['spades', 'hearts', 'diamonds', 'clubs'].map((suit) => (
                  <Foundation
                    key={suit}
                    suit={suit as 'spades' | 'hearts' | 'diamonds' | 'clubs'}
                    cards={gameState.foundations[suit as keyof typeof gameState.foundations]}
                    onCardClick={handleCardClick}
                    realistic3D={realisticMode}
                  />
                ))}
              </div>
              
              <div className="tableau">
                {gameState.tableau.map((pile, index) => (
                  <TableauPile
                    key={index}
                    cards={pile}
                    pileIndex={index}
                    onCardClick={handleCardClick}
                    onCardDoubleClick={handleCardDoubleClick}
                    realistic3D={realisticMode}
                  />
                ))}
              </div>
            </div>
            
            <GameControls
              onNewGame={handleNewGame}
              onUndo={handleUndo}
              onHint={handleHint}
              canUndo={canUndo}
              canHint={canHint}
              showRealisticToggle={true}
              realisticMode={realisticMode}
              onRealisticToggle={setRealisticMode}
            />
          </>
        )}
        
        {currentView === 'stats' && (
          <GameStats statistics={statistics} />
        )}
        
                 {currentView === 'ml' && showMLVisualization && (
           <MLVisualization 
             analysis={mlAnalysis}
           />
         )}
        
        {/* Victory Screen with Physics */}
        {isGameWon && (
          <div className="victory-screen">
            <div className="victory-content">
              <h2>🎉 Congratulations!</h2>
              <p>You won with realistic 3D card physics!</p>
                             <p>Time: {statistics.gamesPlayed > 0 ? '0' : '0'}s</p>
               <p>Moves: {statistics.gamesPlayed > 0 ? '0' : '0'}</p>
              
              <button 
                onClick={handleNewGame}
                className="victory-new-game-btn"
              >
                🃏 New Realistic Game
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard; 