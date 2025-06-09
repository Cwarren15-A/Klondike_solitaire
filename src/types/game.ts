// Game Types for Modern TypeScript Implementation

export interface Card {
  id: string;
  suit: '♠' | '♥' | '♦' | '♣';
  rank: string;
  value: number;
  faceUp: boolean;
}

export interface GameState {
  stock: Card[];
  waste: Card[];
  tableau: Card[][];
  foundations: Record<string, Card[]>;
  gameStats: GameStats;
  gameHistory: GameStateSnapshot[];
  hintCardId: string | null;
  hoveredCard: Card | null;
  drawMode: 1 | 3;
}

export interface GameStats {
  moves: number;
  time: number;
  score: number;
}

export interface GameStateSnapshot {
  stock: Card[];
  waste: Card[];
  tableau: Card[][];
  foundations: Record<string, Card[]>;
  gameStats: GameStats;
}

export interface Move {
  type: 'foundation' | 'tableau' | 'waste-to-tableau' | 'foundation-to-tableau';
  cardId: string;
  card: Card;
  priority: number;
  description: string;
  aiScore?: number;
  confidence?: number;
  strategicReasoning?: string[];
  futureValue?: number;
  riskAssessment?: RiskAssessment;
}

export interface RiskAssessment {
  risk: number;
  reason: string;
}

export interface AIAnalysis {
  winProbability: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  recommendation: string;
  stockRecommendation: StockRecommendation;
  strategicInsights: string[];
  hiddenCardInsights: HiddenCardAnalysis;
  learningInsights: LearningInsights;
  webAIInsights?: WebAIInsights;
  neuralWeights: NeuralWeights;
}

export interface StockRecommendation {
  shouldDraw: boolean;
  reason: string;
  drawValue?: number;
  immediateUseCards?: number;
  valuableCards?: number;
  upcomingCards?: string[];
  recommendation?: string;
}

export interface HiddenCardAnalysis {
  insights: string[];
  totalValue: number;
  count: number;
}

export interface LearningInsights {
  insights: string[];
  confidenceBoost: number;
  similarWinningGames: number;
  historicallySuccessfulMoves: number;
  totalLearningData: number;
}

export interface WebAIInsights {
  confidence: number;
  recommendation: string;
  strategicInsights: string[];
  riskAssessment: string;
}

export interface NeuralWeights {
  foundationValue: number;
  sequenceValue: number;
  revealValue: number;
  emptySpaceValue: number;
  kingPlacementValue: number;
  stockEfficiency: number;
  riskMitigation: number;
}

export interface Settings {
  difficulty: 'easy' | 'medium' | 'hard';
  autoMoveToFoundation: boolean;
  showMoveHints: boolean;
  enableMLAnalysis: boolean;
  adaptiveDifficulty: boolean;
  drawMode: 1 | 3;
  scoringMode: 'standard' | 'vegas';
  theme: 'green' | 'dark' | 'light';
  soundEnabled: boolean;
}

export interface Statistics {
  gamesPlayed: number;
  gamesWon: number;
  totalTime: number;
  totalMoves: number;
  bestTime: number | null;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
  dailyChallenges: Record<string, DailyChallengeResult>;
}

export interface DailyChallengeResult {
  completed: boolean;
  score: number;
  time: number;
  moves: number;
}

export interface Achievement {
  name: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

export interface Tournament {
  id: string;
  name: string;
  players: Player[];
  rounds: TournamentRound[];
  currentRound: number;
  gameMode: string;
  startTime: number;
  endTime?: number;
  winner?: Player;
}

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  gamesPlayed: number;
  gamesWon: number;
}

export interface TournamentRound {
  id: string;
  matches: Match[];
  completed: boolean;
}

export interface Match {
  id: string;
  player1: Player;
  player2: Player;
  winner?: Player;
  score1: number;
  score2: number;
  completed: boolean;
}

// Event Types
export type GameEvent = 
  | { type: 'CARD_MOVED'; payload: { move: Move } }
  | { type: 'GAME_WON'; payload: { stats: GameStats } }
  | { type: 'HINT_REQUESTED'; payload: { move: Move } }
  | { type: 'UNDO_PERFORMED'; payload: { previousState: GameStateSnapshot } }
  | { type: 'SETTINGS_CHANGED'; payload: { settings: Partial<Settings> } }
  | { type: 'ACHIEVEMENT_UNLOCKED'; payload: { achievementId: string } };

// Hook Types
export interface UseGameState {
  gameState: GameState;
  moves: Move[];
  isGameWon: boolean;
  canUndo: boolean;
  makeMove: (move: Move) => void;
  undoMove: () => void;
  newGame: () => void;
  getHint: () => Promise<Move | null>;
  getAnalysis: () => Promise<AIAnalysis>;
}

export interface UseSettings {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
}

export interface UseStatistics {
  statistics: Statistics;
  achievements: Record<string, Achievement>;
  updateGameStats: (won: boolean, stats: GameStats) => void;
  resetStats: () => void;
} 