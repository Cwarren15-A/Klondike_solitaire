import { GameState, Card, Move, GameStats } from '../types/game';

interface MoveResult {
  success: boolean;
  newState: GameState;
  error?: string;
}

// Create initial game state
export const createInitialGameState = (): GameState => {
  const deck = createDeck();
  const shuffledDeck = shuffleDeck(deck);
  const dealtCards = dealCards(shuffledDeck);
  
  return {
    stock: dealtCards.stock,
    waste: [],
    tableau: dealtCards.tableau,
    foundations: { '♠': [], '♥': [], '♦': [], '♣': [] },
    drawMode: 1,
    moveHistory: [],
    gameStats: { moves: 0, time: 0, score: 0 },
    settings: {
      drawMode: 1,
      theme: 'green',
      animations: true,
      sounds: true,
      autoComplete: true
    }
  };
};

// Create a standard 52-card deck
export const createDeck = (): Card[] => {
  const suits = ['♠', '♥', '♦', '♣'] as const;
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
  const deck: Card[] = [];
  
  let id = 1;
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        value: rank === 'A' ? 1 : 
               rank === 'J' ? 11 :
               rank === 'Q' ? 12 :
               rank === 'K' ? 13 :
               parseInt(rank),
        faceUp: false
      });
      id++;
    }
  }
  
  return deck;
};

// Shuffle deck using Fisher-Yates algorithm
export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Deal cards for Klondike Solitaire
export const dealCards = (deck: Card[]) => {
  const tableau: Card[][] = Array(7).fill(null).map(() => []);
  const stock: Card[] = [];
  
  let cardIndex = 0;
  
  // Deal tableau
  for (let col = 0; col < 7; col++) {
    for (let row = col; row < 7; row++) {
      const card = { ...deck[cardIndex] };
      card.faceUp = row === col; // Only top card is face up
      tableau[row].push(card);
      cardIndex++;
    }
  }
  
  // Remaining cards go to stock
  for (let i = cardIndex; i < deck.length; i++) {
    stock.push({ ...deck[i], faceUp: false });
  }
  
  return { tableau, stock };
};

export class GameEngine {
  createNewGame(drawMode: number = 1): Partial<GameState> {
    return createInitialGameState();
  }

  makeMove(gameState: GameState, move: Move): { success: boolean; newState: GameState } {
    // Simplified move validation and execution
    const newState = { ...gameState };
    newState.moveHistory.push(move);
    newState.gameStats.moves++;
    
    return { success: true, newState };
  }

  isGameWon(gameState: GameState): boolean {
    return Object.values(gameState.foundations).every(pile => pile.length === 13);
  }

  calculateWinProbability(gameState: GameState): number {
    // Simple heuristic: foundation progress
    const foundationCards = Object.values(gameState.foundations).reduce(
      (sum, pile) => sum + pile.length, 0
    );
    return foundationCards / 52;
  }

  isValidMove(gameState: GameState, move: Move): boolean {
    // Simplified validation
    return true;
  }

  getPossibleMoves(gameState: GameState): Move[] {
    // Return array of possible moves
    return [];
  }

  // Create a shuffled deck of 52 cards
  private createDeck(): Card[] {
    const suits = ['♠', '♥', '♦', '♣'] as const;
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck: Card[] = [];

    let cardId = 1;
    for (const suit of suits) {
      for (let i = 0; i < ranks.length; i++) {
        const rank = ranks[i];
        const value = rank === 'A' ? 1 : 
                     rank === 'J' ? 11 : 
                     rank === 'Q' ? 12 : 
                     rank === 'K' ? 13 : parseInt(rank);

        deck.push({
          id: `card-${cardId++}`,
          suit,
          rank,
          value,
          faceUp: false,
        });
      }
    }

    return this.shuffleDeck(deck);
  }

  private shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private moveToFoundation(gameState: GameState, move: Move): MoveResult {
    const card = this.findCard(gameState, move.cardId);
    if (!card) {
      return { success: false, newState: gameState, error: 'Card not found' };
    }

    const foundation = gameState.foundations[card.suit];
    
    // Check if move is valid
    if (foundation.length === 0 && card.rank !== 'A') {
      return { success: false, newState: gameState, error: 'Only Ace can be placed on empty foundation' };
    }
    
    if (foundation.length > 0 && card.value !== foundation[foundation.length - 1].value + 1) {
      return { success: false, newState: gameState, error: 'Card must be next in sequence' };
    }

    // Remove card from source
    this.removeCardFromSource(gameState, card);
    
    // Add to foundation
    foundation.push(card);
    
    // Update stats
    gameState.gameStats.moves++;
    gameState.gameStats.score += 10;
    
    // Reveal hidden cards if necessary
    this.revealHiddenCards(gameState);

    return { success: true, newState: gameState };
  }

  private moveToTableau(gameState: GameState, move: Move): MoveResult {
    const card = this.findCard(gameState, move.cardId);
    if (!card || move.targetIndex === undefined) {
      return { success: false, newState: gameState, error: 'Invalid move parameters' };
    }

    const targetPile = gameState.tableau[move.targetIndex];
    
    // Check if move is valid
    if (!this.canMoveToTableau(card, targetPile)) {
      return { success: false, newState: gameState, error: 'Invalid tableau move' };
    }

    // Get cards to move (might be multiple in sequence)
    const cardsToMove = this.getCardsToMove(gameState, card);
    
    // Remove cards from source
    cardsToMove.forEach(c => this.removeCardFromSource(gameState, c));
    
    // Add to target pile
    targetPile.push(...cardsToMove);
    
    // Update stats
    gameState.gameStats.moves++;
    gameState.gameStats.score += cardsToMove.length;
    
    // Reveal hidden cards
    this.revealHiddenCards(gameState);

    return { success: true, newState: gameState };
  }

  private moveWasteToTableau(gameState: GameState, move: Move): MoveResult {
    if (gameState.waste.length === 0 || move.targetIndex === undefined) {
      return { success: false, newState: gameState, error: 'No waste card or invalid target' };
    }

    const card = gameState.waste[gameState.waste.length - 1];
    const targetPile = gameState.tableau[move.targetIndex];
    
    if (!this.canMoveToTableau(card, targetPile)) {
      return { success: false, newState: gameState, error: 'Cannot move waste card to tableau' };
    }

    // Remove from waste
    gameState.waste.pop();
    
    // Add to tableau
    targetPile.push(card);
    
    // Update stats
    gameState.gameStats.moves++;
    gameState.gameStats.score += 5;

    return { success: true, newState: gameState };
  }

  private moveFoundationToTableau(gameState: GameState, move: Move): MoveResult {
    const card = this.findCard(gameState, move.cardId);
    if (!card || move.targetIndex === undefined) {
      return { success: false, newState: gameState, error: 'Invalid move parameters' };
    }

    const targetPile = gameState.tableau[move.targetIndex];
    
    if (!this.canMoveToTableau(card, targetPile)) {
      return { success: false, newState: gameState, error: 'Cannot move foundation card to tableau' };
    }

    // Remove from foundation
    const foundation = gameState.foundations[card.suit];
    foundation.pop();
    
    // Add to tableau
    targetPile.push(card);
    
    // Update stats (penalty for moving from foundation)
    gameState.gameStats.moves++;
    gameState.gameStats.score -= 15;

    return { success: true, newState: gameState };
  }

  private flipStock(gameState: GameState): MoveResult {
    if (gameState.stock.length === 0) {
      // Recycle waste pile back to stock
      gameState.stock = [...gameState.waste.reverse()];
      gameState.waste = [];
      gameState.stock.forEach(card => card.faceUp = false);
    } else {
      // Draw cards from stock
      const cardsToDraw = Math.min(gameState.drawMode, gameState.stock.length);
      for (let i = 0; i < cardsToDraw; i++) {
        const card = gameState.stock.pop();
        if (card) {
          card.faceUp = true;
          gameState.waste.push(card);
        }
      }
    }

    gameState.gameStats.moves++;
    return { success: true, newState: gameState };
  }

  private canMoveToTableau(card: Card, pile: Card[]): boolean {
    if (pile.length === 0) {
      return card.rank === 'K';
    }

    const topCard = pile[pile.length - 1];
    if (!topCard.faceUp) return false;

    const isRedCard = card.suit === '♥' || card.suit === '♦';
    const isTopCardRed = topCard.suit === '♥' || topCard.suit === '♦';
    
    return card.value === topCard.value - 1 && isRedCard !== isTopCardRed;
  }

  private findCard(gameState: GameState, cardId: string): Card | null {
    // Search in all locations
    const allCards = [
      ...gameState.stock,
      ...gameState.waste,
      ...gameState.tableau.flat(),
      ...Object.values(gameState.foundations).flat(),
    ];
    
    return allCards.find(card => card.id === cardId) || null;
  }

  private removeCardFromSource(gameState: GameState, card: Card): void {
    // Remove from stock
    const stockIndex = gameState.stock.findIndex(c => c.id === card.id);
    if (stockIndex !== -1) {
      gameState.stock.splice(stockIndex, 1);
      return;
    }

    // Remove from waste
    const wasteIndex = gameState.waste.findIndex(c => c.id === card.id);
    if (wasteIndex !== -1) {
      gameState.waste.splice(wasteIndex, 1);
      return;
    }

    // Remove from tableau
    for (const pile of gameState.tableau) {
      const cardIndex = pile.findIndex(c => c.id === card.id);
      if (cardIndex !== -1) {
        pile.splice(cardIndex, 1);
        return;
      }
    }

    // Remove from foundations
    for (const foundation of Object.values(gameState.foundations)) {
      const cardIndex = foundation.findIndex(c => c.id === card.id);
      if (cardIndex !== -1) {
        foundation.splice(cardIndex, 1);
        return;
      }
    }
  }

  private getCardsToMove(gameState: GameState, card: Card): Card[] {
    // Find which tableau pile contains the card
    for (const pile of gameState.tableau) {
      const cardIndex = pile.findIndex(c => c.id === card.id);
      if (cardIndex !== -1) {
        // Return all cards from this card to the end of the pile
        return pile.slice(cardIndex);
      }
    }
    
    return [card];
  }

  private revealHiddenCards(gameState: GameState): void {
    for (const pile of gameState.tableau) {
      if (pile.length > 0) {
        const topCard = pile[pile.length - 1];
        if (!topCard.faceUp) {
          topCard.faceUp = true;
          gameState.gameStats.score += 5; // Bonus for revealing card
        }
      }
    }
  }

  getAllPossibleMoves(gameState: GameState): Move[] {
    const moves: Move[] = [];
    
    // Foundation moves from tableau
    gameState.tableau.forEach((pile, index) => {
      if (pile.length > 0) {
        const topCard = pile[pile.length - 1];
        if (topCard.faceUp) {
          const foundation = gameState.foundations[topCard.suit];
          if ((foundation.length === 0 && topCard.rank === 'A') ||
              (foundation.length > 0 && topCard.value === foundation[foundation.length - 1].value + 1)) {
            moves.push({
              type: 'foundation',
              cardId: topCard.id,
              sourceType: 'tableau',
              targetType: 'foundation',
              sourceIndex: index,
              description: `Move ${topCard.rank}${topCard.suit} to foundation`,
            });
          }
        }
      }
    });

    // Tableau to tableau moves
    gameState.tableau.forEach((sourcePile, sourceIndex) => {
      if (sourcePile.length > 0) {
        const topCard = sourcePile[sourcePile.length - 1];
        if (topCard.faceUp) {
          gameState.tableau.forEach((targetPile, targetIndex) => {
            if (sourceIndex !== targetIndex && this.canMoveToTableau(topCard, targetPile)) {
              moves.push({
                type: 'tableau',
                cardId: topCard.id,
                sourceType: 'tableau',
                targetType: 'tableau',
                sourceIndex,
                targetIndex,
                description: `Move ${topCard.rank}${topCard.suit} to tableau`,
              });
            }
          });
        }
      }
    });

    // Waste to tableau moves
    if (gameState.waste.length > 0) {
      const wasteCard = gameState.waste[gameState.waste.length - 1];
      gameState.tableau.forEach((pile, index) => {
        if (this.canMoveToTableau(wasteCard, pile)) {
          moves.push({
            type: 'waste-to-tableau',
            cardId: wasteCard.id,
            sourceType: 'waste',
            targetType: 'tableau',
            targetIndex: index,
            description: `Move ${wasteCard.rank}${wasteCard.suit} from waste`,
          });
        }
      });
    }

    return moves;
  }

  private deepCopyGameState(gameState: GameState): GameState {
    return {
      stock: gameState.stock.map(card => ({ ...card })),
      waste: gameState.waste.map(card => ({ ...card })),
      tableau: gameState.tableau.map(pile => pile.map(card => ({ ...card }))),
      foundations: {
        '♠': [...gameState.foundations['♠']],
        '♥': [...gameState.foundations['♥']],
        '♦': [...gameState.foundations['♦']],
        '♣': [...gameState.foundations['♣']],
      },
      drawMode: gameState.drawMode,
      gameStats: { ...gameState.gameStats },
      gameHistory: [...gameState.gameHistory],
      redoHistory: [...gameState.redoHistory],
      hintCardId: gameState.hintCardId,
      hoveredCard: gameState.hoveredCard,
    };
  }
} 