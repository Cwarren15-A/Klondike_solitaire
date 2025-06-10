import React, { useEffect } from 'react';
import { useGameStore } from './stores/gameStore';
import GameBoard from './components/GameBoard';
import { 
  GameHeader, 
  GameStats, 
  Settings, 
  Achievements, 
  LoadingScreen, 
  VictoryModal, 
  NotificationSystem, 
  ThemeProvider 
} from './components';
import './styles/App.css';

function App() {
  const {
    initializeGame,
    settings,
    isGameWon,
    gameStats,
    statistics,
  } = useGameStore();

  const [currentView, setCurrentView] = React.useState<'game' | 'settings' | 'achievements'>('game');
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
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider theme={settings.theme}>
      <div className="app">
        <NotificationSystem />
        
        <GameHeader 
          currentView={currentView}
          onViewChange={setCurrentView}
        />

        <main className="game-container">
          {currentView === 'game' && (
            <>
              <GameStats 
                stats={gameStats}
                statistics={statistics}
                showWinProbability={settings.showWinProbability}
              />
              <GameBoard />
            </>
          )}
          
          {currentView === 'settings' && (
            <Settings />
          )}
          
          {currentView === 'achievements' && (
            <Achievements />
          )}
        </main>

        {isGameWon && (
          <VictoryModal
            stats={gameStats}
            onNewGame={() => {
              useGameStore.getState().newGame();
            }}
            onClose={() => {
              // Victory modal will auto-close after celebration
            }}
          />
        )}

        {/* Keyboard shortcuts help */}
        <div className="keyboard-shortcuts">
          <div className="shortcuts-info">
            <kbd>H</kbd> Hint • <kbd>U</kbd> Undo • <kbd>R</kbd> Redo • <kbd>N</kbd> New Game
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App; 