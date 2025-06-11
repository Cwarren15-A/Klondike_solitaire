import { GameState } from '../types/game';
import { AIService } from './AIService';

export class GameStateService {
  private aiService: AIService;
  private currentState: GameState;
  private stateHistory: GameState[] = [];

  constructor(aiService: AIService) {
    this.aiService = aiService;
    this.currentState = this.initializeGameState();
  }

  private initializeGameState(): GameState {
    return {
      stock: [],
      waste: [],
      foundations: [[], [], [], []],
      tableau: [[], [], [], [], [], [], []],
      score: 0,
      moves: 0,
      timeElapsed: 0,
      gameStatus: 'playing'
    };
  }

  async makeMove(move: {
    from: 'stock' | 'waste' | 'foundation' | 'tableau';
    to: 'foundation' | 'tableau';
    cardIndex: number;
    pileIndex: number;
  }): Promise<boolean> {
    // Validate move
    if (!this.isValidMove(move)) {
      return false;
    }

    // Execute move
    this.executeMove(move);

    // Update game state
    this.updateGameState();

    // Get AI analysis
    const analysis = await this.aiService.analyzeGameState(this.currentState);

    // Update state history
    this.stateHistory.push({ ...this.currentState });

    return true;
  }

  private isValidMove(move: {
    from: 'stock' | 'waste' | 'foundation' | 'tableau';
    to: 'foundation' | 'tableau';
    cardIndex: number;
    pileIndex: number;
  }): boolean {
    // Implement move validation logic
    // This is a placeholder - implement actual validation
    return true;
  }

  private executeMove(move: {
    from: 'stock' | 'waste' | 'foundation' | 'tableau';
    to: 'foundation' | 'tableau';
    cardIndex: number;
    pileIndex: number;
  }): void {
    // Implement move execution logic
    // This is a placeholder - implement actual move execution
  }

  private updateGameState(): void {
    // Update score
    this.currentState.score = this.calculateScore();

    // Update moves
    this.currentState.moves++;

    // Update time
    this.currentState.timeElapsed = Date.now() - this.gameStartTime;

    // Check win condition
    if (this.checkWinCondition()) {
      this.currentState.gameStatus = 'won';
    }
  }

  private calculateScore(): number {
    // Implement score calculation logic
    // This is a placeholder - implement actual score calculation
    return 0;
  }

  private checkWinCondition(): boolean {
    // Check if all foundations are complete
    return this.currentState.foundations.every(foundation => foundation.length === 13);
  }

  getCurrentState(): GameState {
    return { ...this.currentState };
  }

  getStateHistory(): GameState[] {
    return [...this.stateHistory];
  }

  resetGame(): void {
    this.currentState = this.initializeGameState();
    this.stateHistory = [];
    this.gameStartTime = Date.now();
  }

  private gameStartTime: number = Date.now();
} 