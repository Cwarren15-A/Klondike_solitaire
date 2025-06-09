import React, { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '../hooks/useGameState';
import { Card, Move } from '../types/game';
import { CardComponent } from './Card';
import { FoundationPile } from './FoundationPile';
import { TableauPile } from './TableauPile';
import { StockPile } from './StockPile';
import { WastePile } from './WastePile';

interface GameBoardProps {
  onCardMove?: (move: Move) => void;
  showHints?: boolean;
  aiAnalysisMode?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  onCardMove,
  showHints = false,
  aiAnalysisMode = false
}) => {
  const {
    gameState,
    moves,
    isGameWon,
    makeMove,
    getHint,
    getAnalysis
  } = useGameState();
  
  const boardRef = useRef<HTMLDivElement>(null);
  const [draggedCard, setDraggedCard] = React.useState<Card | null>(null);
  const [dropZone, setDropZone] = React.useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = React.useState<Card | null>(null);

  // Enhanced drag and drop with animations
  const handleDragStart = useCallback((card: Card) => {
    setDraggedCard(card);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedCard(null);
    setDropZone(null);
  }, []);

  const handleDrop = useCallback((targetType: string, targetIndex?: number) => {
    if (!draggedCard) return;
    
    const move = moves.find(m => 
      m.cardId === draggedCard.id && 
      m.type === targetType
    );
    
    if (move) {
      makeMove(move);
      onCardMove?.(move);
    }
    
    handleDragEnd();
  }, [draggedCard, moves, makeMove, onCardMove, handleDragEnd]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        getHint();
      }
      if (e.key === 'n' || e.key === 'N') {
        // New game
      }
      if (e.key === 'u' || e.key === 'U') {
        // Undo
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [getHint]);

  // Victory animation
  const victoryVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 500
      }
    }
  };

  return (
    <div 
      ref={boardRef}
      className="game-board relative w-full h-full bg-gradient-to-br from-green-800 to-green-900 rounded-lg p-4"
    >
      {/* Stock and Waste Area */}
      <div className="flex gap-4 mb-6">
        <StockPile 
          cards={gameState.stock}
          drawMode={gameState.drawMode}
          onDraw={() => {/* Handle stock draw */}}
          className="transform hover:scale-105 transition-transform"
        />
        
        <WastePile 
          cards={gameState.waste}
          drawMode={gameState.drawMode}
          onCardDragStart={handleDragStart}
          hoveredCard={hoveredCard}
          onCardHover={setHoveredCard}
        />
      </div>

      {/* Foundation Piles */}
      <div className="flex gap-4 mb-6 justify-end">
        {(['♠', '♥', '♦', '♣'] as const).map((suit) => (
          <FoundationPile
            key={suit}
            suit={suit}
            cards={gameState.foundations[suit]}
            onDrop={(card) => handleDrop('foundation')}
            onCardDragStart={handleDragStart}
            canDrop={dropZone === `foundation-${suit}`}
            showHint={showHints}
            className="transform hover:scale-105 transition-transform"
          />
        ))}
      </div>

      {/* Tableau */}
      <div className="flex gap-3 justify-center">
        {gameState.tableau.map((pile, index) => (
          <TableauPile
            key={index}
            index={index}
            cards={pile}
            onDrop={(card) => handleDrop('tableau', index)}
            onCardDragStart={handleDragStart}
            onCardDoubleClick={(card) => {
              // Auto-move to foundation
              const foundationMove = moves.find(m => 
                m.cardId === card.id && m.type === 'foundation'
              );
              if (foundationMove) {
                makeMove(foundationMove);
              }
            }}
            canDrop={dropZone === `tableau-${index}`}
            showHints={showHints}
            hoveredCard={hoveredCard}
            onCardHover={setHoveredCard}
            className="min-h-96"
          />
        ))}
      </div>

      {/* Dragged Card Overlay */}
      <AnimatePresence>
        {draggedCard && (
          <motion.div
            className="fixed pointer-events-none z-50"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <CardComponent 
              card={draggedCard} 
              className="rotate-12 shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Victory Modal */}
      <AnimatePresence>
        {isGameWon && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-8 text-center max-w-md mx-4"
              variants={victoryVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Congratulations!
              </h2>
              <p className="text-gray-600 mb-4">
                You won in {gameState.gameStats.moves} moves and{' '}
                {Math.floor(gameState.gameStats.time / 60)}:
                {(gameState.gameStats.time % 60).toString().padStart(2, '0')}!
              </p>
              <p className="text-lg font-semibold text-green-600 mb-6">
                Score: {gameState.gameStats.score}
              </p>
              <div className="flex gap-4 justify-center">
                <button 
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  onClick={() => {/* New game */}}
                >
                  Play Again
                </button>
                <button 
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => {/* Show stats */}}
                >
                  View Stats
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Analysis Overlay */}
      {aiAnalysisMode && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg max-w-sm">
          <h3 className="font-bold mb-2">🧠 AI Analysis</h3>
          <div className="text-sm space-y-1">
            <div>Win Probability: <span className="text-green-400">75%</span></div>
            <div>Best Move: <span className="text-blue-400">Ace♠ to Foundation</span></div>
            <div>Difficulty: <span className="text-yellow-400">Medium</span></div>
          </div>
        </div>
      )}

      {/* Performance Debug Info (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded text-xs">
          <div>Moves: {gameState.gameStats.moves}</div>
          <div>Time: {gameState.gameStats.time}s</div>
          <div>Available Moves: {moves.length}</div>
        </div>
      )}
    </div>
  );
};

export default GameBoard; 