// Game Types for Modern TypeScript Implementation

export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: number; // 1-13 (Ace through King)
  faceUp: boolean;
  id: string;
}

export interface GameState {
  stock: Card[];
  waste: Card[];
  foundations: Card[][];
  tableau: Card[][];
  score: number;
  moves: number;
  timeElapsed: number;
  gameStatus: 'playing' | 'won' | 'lost';
  gameStats: {
    winStreak: number;
    bestTime: number;
    averageTime: number;
    totalGames: number;
  };
}

export interface GameStats {
  gamesPlayed: number;
  winRate: number;
  bestTime: number;
  bestScore: number;
}

export interface GameStateSnapshot {
  stock: Card[];
  waste: Card[];
  tableau: Card[][];
  foundations: Record<string, Card[]>;
  gameStats: GameStats;
}

export interface Move {
  from: 'stock' | 'waste' | 'foundation' | 'tableau';
  to: 'foundation' | 'tableau';
  cardIndex: number;
  pileIndex: number;
}

export interface DragState {
  isDragging: boolean;
  draggedCards: Card[];
  draggedFrom: {
    type: string;
    index?: number;
  } | null;
  dragOffset: { x: number; y: number };
}

export interface GameSettings {
  difficulty: 'easy' | 'medium' | 'hard';
  autoMoveToFoundation: boolean;
  showMoveHints: boolean;
  enableMLAnalysis: boolean;
  adaptiveDifficulty: boolean;
  drawMode: 1 | 3;
  scoringMode: 'standard' | 'vegas' | 'custom';
  theme: 'light' | 'dark' | 'blue' | 'green';
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  showWinProbability: boolean;
  enableWebGPU: boolean;
  enableParticles: boolean;
  enableShadows: boolean;
  enablePostProcessing: boolean;
  enableIBL: boolean;
  enableSSR: boolean;
  enableSSAO: boolean;
  enableBloom: boolean;
  enableMotionBlur: boolean;
  enableDepthOfField: boolean;
  enableChromaticAberration: boolean;
  enableVignette: boolean;
  enableGrain: boolean;
  enableLensFlare: boolean;
  enableGodRays: boolean;
  enableVolumetricLighting: boolean;
  enableCaustics: boolean;
  enableSubsurfaceScattering: boolean;
  enableParallaxOcclusionMapping: boolean;
  enableTessellation: boolean;
  enableDisplacement: boolean;
  enableNormalMapping: boolean;
  enableRoughnessMapping: boolean;
  enableMetallicMapping: boolean;
  enableAOMapping: boolean;
  enableEmissiveMapping: boolean;
  enableClearcoatMapping: boolean;
  enableSheenMapping: boolean;
  enableTransmissionMapping: boolean;
  enableVolumeMapping: boolean;
  enableIridescenceMapping: boolean;
  enableSpecularMapping: boolean;
  enableSpecularTintMapping: boolean;
  enableAnisotropyMapping: boolean;
  enableAnisotropicRotationMapping: boolean;
  enableBumpMapping: boolean;
  enableDetailMapping: boolean;
  enableDetailMaskMapping: boolean;
  enableDetailNormalMapping: boolean;
  enableDetailRoughnessMapping: boolean;
  enableDetailMetallicMapping: boolean;
  enableDetailAOMapping: boolean;
  enableDetailEmissiveMapping: boolean;
  enableDetailClearcoatMapping: boolean;
  enableDetailSheenMapping: boolean;
  enableDetailTransmissionMapping: boolean;
  enableDetailVolumeMapping: boolean;
  enableDetailIridescenceMapping: boolean;
  enableDetailSpecularMapping: boolean;
  enableDetailSpecularTintMapping: boolean;
  enableDetailAnisotropyMapping: boolean;
  enableDetailAnisotropicRotationMapping: boolean;
  enableDetailBumpMapping: boolean;
  enableDetailDisplacementMapping: boolean;
  enableDetailParallaxOcclusionMapping: boolean;
  enableDetailTessellationMapping: boolean;
  enableDetailSubsurfaceScatteringMapping: boolean;
  enableDetailCausticsMapping: boolean;
  enableDetailVolumetricLightingMapping: boolean;
  enableDetailGodRaysMapping: boolean;
  enableDetailLensFlareMapping: boolean;
  enableDetailGrainMapping: boolean;
  enableDetailVignetteMapping: boolean;
  enableDetailChromaticAberrationMapping: boolean;
  enableDetailDepthOfFieldMapping: boolean;
  enableDetailMotionBlurMapping: boolean;
  enableDetailBloomMapping: boolean;
  enableDetailSSAOMapping: boolean;
  enableDetailSSRMapping: boolean;
  enableDetailIBLMapping: boolean;
  enableDetailPostProcessingMapping: boolean;
  enableDetailShadowsMapping: boolean;
  enableDetailParticlesMapping: boolean;
  enableDetailWebGPUMapping: boolean;
  enableDetailDrawModeMapping: boolean;
  enableDetailMusicEnabledMapping: boolean;
  enableDetailSoundEnabledMapping: boolean;
  enableDetailThemeMapping: boolean;
  enableDetailSettingsMapping: boolean;
}

export interface GameStatistics {
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  bestTime: number;
  bestScore: number;
  totalTime: number;
  averageTime: number;
  currentStreak: number;
  bestStreak: number;
  perfectGames: number;
  achievements: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

export interface AIAnalysis {
  winProbability: number;
  recommendedMoves: Move[];
  difficulty: string;
  confidence: number;
  bestMove: Move | null;
  strategicInsights: string[];
  recommendation: string;
  moveRelationships: {
    sequential: number;
    strategic: number;
  };
  graphMetrics?: {
    connectivity: number;
    criticalPaths: number;
    bottlenecks: number;
  };
  polynomialFeatures?: {
    degrees: { name: string; value: number }[];
    complexityScore: number;
    nonLinearPatterns: number;
  };
  modelMetrics?: {
    type: string;
    parameters: number;
    layers: number;
  };
  performanceMetrics?: {
    inferenceTime: number;
    memoryUsage: number;
  };
}

export interface GraphAnalysis {
  nodeCount: number;
  edgeCount: number;
  connectivity: number;
  criticalPaths: string[];
  bottleneckCards: string[];
  opportunityNodes: string[];
  centralityScores: Record<string, number>;
}

export interface PolynomialFeatures {
  degree: number;
  featureInteractions: Record<string, number>;
  higherOrderPatterns: string[];
  complexityScore: number;
  nonlinearRelationships: Record<string, number>;
}

export interface GraphNode {
  id: string;
  cardId: string;
  position: [number, number];
  features: number[];
  connections: string[];
  importance: number;
  accessibility: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  edgeType: 'valid_move' | 'sequence' | 'suit_match' | 'color_alternate' | 'strategic';
  strength: number;
}

export interface TransformerAttention {
  queryCard: string;
  keyCard: string;
  attentionWeight: number;
  relationship: string;
}

export interface AdvancedMLMetrics {
  modelVersion: string;
  architecture: string;
  trainingEpochs: number;
  lastTrainingAccuracy: number;
  predictionConfidence: number;
  graphComplexity: number;
  polynomialDegree: number;
  computationTime: number;
}

export interface MLModelState {
  isInitialized: boolean;
  isTraining: boolean;
  modelAccuracy: number;
  trainingProgress: number;
  lastTrainingDate: Date | null;
}

export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    cardBack: string;
    cardFace: string;
  };
}

export interface NotificationData {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement';
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
}

export type GameEvent = 
  | { type: 'CARD_MOVED'; payload: Move }
  | { type: 'GAME_WON'; payload: GameStats }
  | { type: 'HINT_REQUESTED'; payload: Move | null }
  | { type: 'THEME_CHANGED'; payload: string }
  | { type: 'ACHIEVEMENT_UNLOCKED'; payload: Achievement }
  | { type: 'STATE_RESTORED'; payload: GameState };

export interface GameBoardProps {
  onMove?: (move: Move) => void;
  showHints?: boolean;
  showWinProbability?: boolean;
  theme?: string;
}

export interface CardProps {
  card: Card;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  isHinted?: boolean;
  isSelected?: boolean;
  isDragging?: boolean;
  className?: string;
  style?: any;
}

export interface PileProps {
  cards: Card[];
  canDrop?: boolean;
  onDrop?: (card: Card) => void;
  onCardClick?: (card: Card) => void;
  className?: string;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type GameMode = 'normal' | 'daily' | 'challenge' | 'tutorial';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type SortOrder = 'asc' | 'desc';

export const SUITS = ['♠', '♥', '♦', '♣'] as const;
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
export const RED_SUITS = new Set(['♥', '♦']);
export const BLACK_SUITS = new Set(['♠', '♣']);

export const CARD_DIMENSIONS = {
  WIDTH: 80,
  HEIGHT: 120,
  FACE_DOWN_OFFSET: 8,
  FACE_UP_OFFSET: 20,
  WASTE_CARD_OFFSET: 25,
} as const;

export const ANIMATION_DURATIONS = {
  CARD_FLIP: 150,
  CARD_MOVE: 200,
  VICTORY: 1000,
} as const;

// Additional Event Types for compatibility
export type ExtendedGameEvent = GameEvent 
  | { type: 'UNDO_PERFORMED'; payload: { previousState: GameStateSnapshot } }
  | { type: 'SETTINGS_CHANGED'; payload: { settings: Partial<GameSettings> } };

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
  settings: GameSettings;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  resetSettings: () => void;
}

export interface UseStatistics {
  statistics: GameStatistics;
  achievements: Record<string, Achievement>;
  updateGameStats: (won: boolean, stats: GameStats) => void;
  resetStats: () => void;
} 