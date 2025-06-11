import { GameState, Card, Move } from '../types/game';

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
    selectedCard: null,
    moves: 0,
    score: 0,
    time: 0,
    isWon: false,
    canUndo: false,
    gameStats: {
      time: 0,
      moves: 0,
      score: 0
    },
    gameHistory: [],
    drawMode: 1,
    settings: {
      difficulty: 'medium',
      autoMoveToFoundation: false,
      showMoveHints: false,
      enableMLAnalysis: false,
      adaptiveDifficulty: false,
      drawMode: 1,
      scoringMode: 'standard',
      theme: 'light',
      soundEnabled: true,
      musicEnabled: true,
      volume: 0.5,
      showWinProbability: false,
      enableWebGPU: false,
      enableParticles: false,
      enableShadows: false,
      enablePostProcessing: false,
      enableIBL: false,
      enableSSR: false,
      enableSSAO: false,
      enableBloom: false,
      enableMotionBlur: false,
      enableDepthOfField: false,
      enableChromaticAberration: false,
      enableVignette: false,
      enableGrain: false,
      enableLensFlare: false,
      enableGodRays: false,
      enableVolumetricLighting: false,
      enableCaustics: false,
      enableSubsurfaceScattering: false,
      enableParallaxOcclusionMapping: false,
      enableTessellation: false,
      enableDisplacement: false,
      enableNormalMapping: false,
      enableRoughnessMapping: false,
      enableMetallicMapping: false,
      enableAOMapping: false,
      enableEmissiveMapping: false,
      enableClearcoatMapping: false,
      enableSheenMapping: false,
      enableTransmissionMapping: false,
      enableVolumeMapping: false,
      enableIridescenceMapping: false,
      enableSpecularMapping: false,
      enableSpecularTintMapping: false,
      enableAnisotropyMapping: false,
      enableAnisotropicRotationMapping: false,
      enableBumpMapping: false,
      enableDetailMapping: false,
      enableDetailMaskMapping: false,
      enableDetailNormalMapping: false,
      enableDetailRoughnessMapping: false,
      enableDetailMetallicMapping: false,
      enableDetailAOMapping: false,
      enableDetailEmissiveMapping: false,
      enableDetailClearcoatMapping: false,
      enableDetailSheenMapping: false,
      enableDetailTransmissionMapping: false,
      enableDetailVolumeMapping: false,
      enableDetailIridescenceMapping: false,
      enableDetailSpecularMapping: false,
      enableDetailSpecularTintMapping: false,
      enableDetailAnisotropyMapping: false,
      enableDetailAnisotropicRotationMapping: false,
      enableDetailBumpMapping: false,
      enableDetailDisplacementMapping: false,
      enableDetailParallaxOcclusionMapping: false,
      enableDetailTessellationMapping: false,
      enableDetailSubsurfaceScatteringMapping: false,
      enableDetailCausticsMapping: false,
      enableDetailVolumetricLightingMapping: false,
      enableDetailGodRaysMapping: false,
      enableDetailLensFlareMapping: false,
      enableDetailGrainMapping: false,
      enableDetailVignetteMapping: false,
      enableDetailChromaticAberrationMapping: false,
      enableDetailDepthOfFieldMapping: false,
      enableDetailMotionBlurMapping: false,
      enableDetailBloomMapping: false,
      enableDetailSSAOMapping: false,
      enableDetailSSRMapping: false,
      enableDetailIBLMapping: false,
      enableDetailPostProcessingMapping: false,
      enableDetailShadowsMapping: false,
      enableDetailParticlesMapping: false,
      enableDetailWebGPUMapping: false,
      enableDetailDrawModeMapping: false,
      enableDetailMusicEnabledMapping: false,
      enableDetailSoundEnabledMapping: false,
      enableDetailThemeMapping: false,
      enableDetailSettingsMapping: false
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
        faceUp: false,
        location: 'stock',
        position: id - 1
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
  private readonly SUITS = ['♠', '♥', '♦', '♣'] as const;
  private readonly RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

  initializeGame(): GameState {
    const deck = this.createDeck();
    const shuffledDeck = this.shuffleDeck(deck);
    const tableau = this.dealTableau(shuffledDeck);
    const stock = shuffledDeck.slice(28);
    const waste: Card[] = [];
    const foundations: Record<string, Card[]> = {
      '♠': [],
      '♥': [],
      '♦': [],
      '♣': [],
    };

    return {
      stock,
      waste,
      foundations,
      tableau,
      selectedCard: null,
      moves: 0,
      score: 0,
      time: 0,
      isWon: false,
      canUndo: false,
      gameStats: {
        time: 0,
        moves: 0,
        score: 0,
      },
      gameHistory: [],
      drawMode: 1,
      settings: {
        difficulty: 'medium',
        autoMoveToFoundation: false,
        showMoveHints: false,
        enableMLAnalysis: false,
        adaptiveDifficulty: false,
        drawMode: 1,
        scoringMode: 'standard',
        theme: 'light',
        soundEnabled: true,
        musicEnabled: true,
        volume: 0.5,
        showWinProbability: false,
        enableWebGPU: false,
        enableParticles: false,
        enableShadows: false,
        enablePostProcessing: false,
        enableIBL: false,
        enableSSR: false,
        enableSSAO: false,
        enableBloom: false,
        enableMotionBlur: false,
        enableDepthOfField: false,
        enableChromaticAberration: false,
        enableVignette: false,
        enableGrain: false,
        enableLensFlare: false,
        enableGodRays: false,
        enableVolumetricLighting: false,
        enableCaustics: false,
        enableSubsurfaceScattering: false,
        enableParallaxOcclusionMapping: false,
        enableTessellation: false,
        enableDisplacement: false,
        enableNormalMapping: false,
        enableRoughnessMapping: false,
        enableMetallicMapping: false,
        enableAOMapping: false,
        enableEmissiveMapping: false,
        enableClearcoatMapping: false,
        enableSheenMapping: false,
        enableTransmissionMapping: false,
        enableVolumeMapping: false,
        enableIridescenceMapping: false,
        enableSpecularMapping: false,
        enableSpecularTintMapping: false,
        enableAnisotropyMapping: false,
        enableAnisotropicRotationMapping: false,
        enableBumpMapping: false,
        enableDetailMapping: false,
        enableDetailMaskMapping: false,
        enableDetailNormalMapping: false,
        enableDetailRoughnessMapping: false,
        enableDetailMetallicMapping: false,
        enableDetailAOMapping: false,
        enableDetailEmissiveMapping: false,
        enableDetailClearcoatMapping: false,
        enableDetailSheenMapping: false,
        enableDetailTransmissionMapping: false,
        enableDetailVolumeMapping: false,
        enableDetailIridescenceMapping: false,
        enableDetailSpecularMapping: false,
        enableDetailSpecularTintMapping: false,
        enableDetailAnisotropyMapping: false,
        enableDetailAnisotropicRotationMapping: false,
        enableDetailBumpMapping: false,
        enableDetailDisplacementMapping: false,
        enableDetailParallaxOcclusionMapping: false,
        enableDetailTessellationMapping: false,
        enableDetailSubsurfaceScatteringMapping: false,
        enableDetailCausticsMapping: false,
        enableDetailVolumetricLightingMapping: false,
        enableDetailGodRaysMapping: false,
        enableDetailLensFlareMapping: false,
        enableDetailGrainMapping: false,
        enableDetailVignetteMapping: false,
        enableDetailChromaticAberrationMapping: false,
        enableDetailDepthOfFieldMapping: false,
        enableDetailMotionBlurMapping: false,
        enableDetailBloomMapping: false,
        enableDetailSSAOMapping: false,
        enableDetailSSRMapping: false,
        enableDetailIBLMapping: false,
        enableDetailPostProcessingMapping: false,
        enableDetailShadowsMapping: false,
        enableDetailParticlesMapping: false,
        enableDetailWebGPUMapping: false,
        enableDetailDrawModeMapping: false,
        enableDetailMusicEnabledMapping: false,
        enableDetailSoundEnabledMapping: false,
        enableDetailThemeMapping: false,
        enableDetailSettingsMapping: false
      }
    };
  }

  private createDeck(): Card[] {
    const deck: Card[] = [];
    for (const suit of this.SUITS) {
      for (const rank of this.RANKS) {
        const value = rank === 'A' ? 1 :
                     rank === 'J' ? 11 :
                     rank === 'Q' ? 12 :
                     rank === 'K' ? 13 :
                     parseInt(rank);
        
        deck.push({
          id: `${rank}-${suit}`,
          suit,
          rank,
          value,
          faceUp: false,
          location: 'stock',
          position: deck.length,
        });
      }
    }
    return deck;
  }

  private shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private dealTableau(deck: Card[]): Card[][] {
    const tableau: Card[][] = Array(7).fill(null).map(() => []);
    for (let i = 0; i < 7; i++) {
      for (let j = i; j < 7; j++) {
        const card = deck[i * 7 + j];
        card.faceUp = i === j;
        card.location = 'tableau';
        card.position = j;
        tableau[j].push(card);
      }
    }
    return tableau;
  }

  isValidMove(gameState: GameState, move: Move): boolean {
    switch (move.type) {
      case 'foundation':
        return this.moveToFoundation(gameState, move).success;
      case 'tableau':
        return this.moveToTableau(gameState, move).success;
      case 'waste-to-tableau':
        return this.moveWasteToTableau(gameState, move).success;
      default:
        return false;
    }
  }

  getPossibleMoves(gameState: GameState): Move[] {
    return this.getAllPossibleMoves(gameState);
  }

  makeMove(gameState: GameState, move: Move): MoveResult {
    // Ensure gameHistory exists
    if (!gameState.gameHistory) {
      gameState.gameHistory = [];
    }

    // Create a deep copy of the current state for history
    const currentState = {
      stock: [...gameState.stock],
      waste: [...gameState.waste],
      foundations: Object.fromEntries(
        Object.entries(gameState.foundations).map(([suit, cards]) => [suit, [...cards]])
      ),
      tableau: gameState.tableau.map(pile => [...pile]),
      gameStats: { ...gameState.gameStats }
    };

    // Add current state to history before making the move
    gameState.gameHistory.push(currentState);

    // Perform the move
    const result = this.executeMove(gameState, move);
    
    if (result.success) {
      // Update canUndo flag
      result.newState.canUndo = true;
    }

    return result;
  }

  checkWinCondition(gameState: GameState): boolean {
    return Object.values(gameState.foundations).every(
      (foundation) => foundation.length === 13
    );
  }

  updateScore(gameState: GameState): void {
    // Implement scoring logic
    gameState.score = 0;
  }

  calculateWinProbability(gameState: GameState): number {
    // Simple heuristic: foundation progress
    const foundationCards = Object.values(gameState.foundations).reduce(
      (sum, pile) => sum + pile.length, 0
    );
    return foundationCards / 52;
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
              sourceIndex: index,
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
                sourceIndex,
                targetIndex,
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
            targetIndex: index,
          });
        }
      });
    }

    return moves;
  }

  private executeMove(gameState: GameState, move: Move): MoveResult {
    switch (move.type) {
      case 'foundation':
        return this.moveToFoundation(gameState, move);
      case 'tableau':
        return this.moveToTableau(gameState, move);
      case 'waste-to-tableau':
        return this.moveWasteToTableau(gameState, move);
      default:
        return { success: false, newState: gameState, error: 'Invalid move type' };
    }
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
    gameState.moves++;
    gameState.score += 10;
    
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
    gameState.moves++;
    gameState.score += cardsToMove.length;
    
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
    gameState.moves++;
    gameState.score += 5;

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
          gameState.score += 5; // Bonus for revealing card
        }
      }
    }
  }

  undo(gameState: GameState): MoveResult {
    // Ensure gameHistory exists
    if (!gameState.gameHistory) {
      gameState.gameHistory = [];
    }

    if (gameState.gameHistory.length === 0) {
      return { success: false, newState: gameState, error: 'No moves to undo' };
    }

    const previousState = gameState.gameHistory.pop();
    if (!previousState) {
      return { success: false, newState: gameState, error: 'Failed to restore previous state' };
    }

    // Create a new state with the previous state's values
    const newState: GameState = {
      ...gameState,
      stock: [...previousState.stock],
      waste: [...previousState.waste],
      foundations: Object.fromEntries(
        Object.entries(previousState.foundations).map(([suit, cards]) => [suit, [...cards]])
      ),
      tableau: previousState.tableau.map(pile => [...pile]),
      gameHistory: [...gameState.gameHistory],
      gameStats: { ...previousState.gameStats },
      selectedCard: null,
      canUndo: gameState.gameHistory.length > 0
    };

    return { success: true, newState };
  }
} 