import React from 'react';
import { Card as CardType } from '../types/game';

// Card Component
export const Card: React.FC<{
  card: CardType;
  onClick?: () => void;
  onDoubleClick?: () => void;
  isDragging?: boolean;
  isHint?: boolean;
}> = ({ card, onClick, onDoubleClick, isDragging = false, isHint = false }) => (
  <div
    className={`card ${isDragging ? 'dragging' : ''} ${isHint ? 'hint' : ''} ${card.faceUp ? 'face-up' : 'face-down'}`}
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

export const WastePile: React.FC<any> = ({ cards, onCardClick }) => (
  <div className="waste-pile">
    {cards.map((card: CardType) => (
      <Card key={card.id} card={card} onClick={() => onCardClick(card)} />
    ))}
  </div>
);

export const Foundation: React.FC<any> = ({ suit, cards, onCardClick }) => (
  <div className="foundation-pile">
    <div className="foundation-placeholder">{suit}</div>
    {cards.map((card: CardType) => (
      <Card key={card.id} card={card} onClick={() => onCardClick(card)} />
    ))}
  </div>
);

export const TableauPile: React.FC<any> = ({
  cards,
  onCardClick,
  onCardDoubleClick
}) => (
  <div className="tableau-pile">
    {cards.map((card: CardType) => (
      <Card
        key={card.id}
        card={card}
        onClick={() => onCardClick(card)}
        onDoubleClick={() => onCardDoubleClick(card)}
      />
    ))}
  </div>
);

export const StockPile: React.FC<any> = ({ cards, onStockClick }) => (
  <div className="stock-pile" onClick={onStockClick}>
    {cards.length > 0 ? (
      <div className="stock-card">🂠</div>
    ) : (
      <div className="stock-empty">♻️</div>
    )}
    <div className="stock-count">{cards.length}</div>
  </div>
);

export const GameHeader: React.FC<any> = ({ onViewChange }) => (
  <div className="game-header">
    <h1>🃏 Klondike Solitaire</h1>
    <div className="view-controls">
      <button onClick={() => onViewChange('game')}>Game</button>
      <button onClick={() => onViewChange('stats')}>Stats</button>
      <button onClick={() => onViewChange('ml')}>AI Analysis</button>
    </div>
  </div>
);

export const GameControls: React.FC<any> = ({ onNewGame, onUndo, onHint, canUndo, canHint }) => (
  <div className="game-controls">
    <button onClick={onNewGame} className="control-btn new-game">
      🔄 New Game
    </button>
    <button onClick={onUndo} disabled={!canUndo} className="control-btn undo">
      ↶ Undo
    </button>
    <button onClick={onHint} disabled={!canHint} className="control-btn hint">
      💡 Hint
    </button>
  </div>
);

export const GameStats: React.FC<any> = ({ stats }) => (
  <div className="game-stats">
    <div className="stat-item">
      <span className="stat-label">Games Won:</span>
      <span className="stat-value">{stats.gamesWon || 0}</span>
    </div>
    <div className="stat-item">
      <span className="stat-label">Games Played:</span>
      <span className="stat-value">{stats.gamesPlayed || 0}</span>
    </div>
    <div className="stat-item">
      <span className="stat-label">Win Rate:</span>
      <span className="stat-value">
        {stats.gamesPlayed ? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1) : 0}%
      </span>
    </div>
  </div>
);

// Loading Screen Component
export const LoadingScreen: React.FC<{ isLoading: boolean; message?: string }> = ({ 
  isLoading, 
  message = "Loading..." 
}) => (
  isLoading ? (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p>{message}</p>
    </div>
  ) : null
);

// WebGPU Graphics Components
export { default as WebGPUCanvas } from './WebGPUCanvas'; 