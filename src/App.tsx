import React, { useEffect } from 'react';
import { useGameStore } from './stores/gameStore';
import GameBoard from './components/GameBoard';
import './styles/App.css';

function App() {
  const {
    initializeGame,
    isGameWon,
  } = useGameStore();

  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeGame();
      } catch (error) {
        console.error('Failed to initialize game:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [initializeGame]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading Advanced Klondike Solitaire...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <main className="game-container">
        <GameBoard />
        
        {isGameWon && (
          <div className="victory-overlay">
            <div className="victory-message">
              <h2>🎉 Congratulations! You Won!</h2>
              <button 
                onClick={() => useGameStore.getState().newGame()}
                className="new-game-btn"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Keyboard shortcuts help */}
      <div className="keyboard-shortcuts">
        <div className="shortcuts-info">
          <kbd>H</kbd> Hint • <kbd>U</kbd> Undo • <kbd>R</kbd> Redo • <kbd>N</kbd> New Game
        </div>
      </div>
    </div>
  );
}

export default App; 