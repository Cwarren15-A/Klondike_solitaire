import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { GameState, Card, Move, GameSettings, GameStatistics, AIAnalysis } from '../types/game';
import { createInitialGameState } from '../utils/gameEngine';
import { TensorFlowMLEngine } from '../utils/tensorflowEngine';
import { GameEngine } from '../utils/gameEngine';
import { AchievementSystem } from '../utils/achievements';

const defaultSettings: GameSettings = {
  difficulty: 'medium',
  autoMoveToFoundation: true,
  showMoveHints: true,
  enableMLAnalysis: true,
  adaptiveDifficulty: false,
  drawMode: 1,
  scoringMode: 'standard',
  theme: 'green',
  soundEnabled: true,
  musicEnabled: true,
  volume: 0.5,
  showWinProbability: true,
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
};

const defaultStatistics: GameStatistics = {
  gamesPlayed: 0,
  gamesWon: 0,
  winRate: 0,
  bestTime: 0,
  bestScore: 0,
  totalTime: 0,
  averageTime: 0,
  currentStreak: 0,
  bestStreak: 0,
  perfectGames: 0,
  achievements: [],
};

interface GameStore extends GameState {
  // UI state
  selectedCard: Card | null;
  hintCardId: string | null;
  isDragging: boolean;
  draggedCard: Card | null;
  currentView: 'game' | 'stats' | 'ml';
  showHints: boolean;
  isGameWon: boolean;
  isGameLost: boolean;
  mlAnalysis: AIAnalysis | null;
  
  // Settings and stats
  settings: GameSettings;
  statistics: GameStatistics;
  
  // Game systems
  gameEngine: GameEngine;
  mlEngine: TensorFlowMLEngine;
  achievementSystem: AchievementSystem;
  
  // Computed properties
  canUndo: boolean;
  canHint: boolean;
  gameState: GameState;
  
  // Actions
  initializeGame: () => Promise<void>;
  newGame: () => void;
  makeMove: (move: Move) => Promise<void>;
  undoMove: () => void;
  redoMove: () => void;
  getHint: () => Promise<Move | null>;
  getWinProbability: () => Promise<number>;
  selectCard: (card: Card | null) => void;
  startDrag: (card: Card) => void;
  endDrag: () => void;
  setCurrentView: (view: 'game' | 'stats' | 'ml') => void;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  toggleTheme: () => void;
  updateGameStats: (won: boolean) => void;
  resetStatistics: () => void;
  getMLAnalysis: () => Promise<AIAnalysis | null>;
}

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      immer((set, get) => {
        const mlEngine = new TensorFlowMLEngine();
        const gameEngine = new GameEngine();
        const achievementSystem = new AchievementSystem();
        
        const initialState = createInitialGameState();
        
        return {
          // Initialize with game state
          ...initialState,
          gameState: initialState,
          
          // UI state
          selectedCard: null,
          hintCardId: null,
          isDragging: false,
          draggedCard: null,
          currentView: 'game' as const,
          showHints: false,
          isGameWon: false,
          isGameLost: false,
          mlAnalysis: null,
          
          // Settings and stats
          settings: defaultSettings,
          statistics: defaultStatistics,
          
          // Game systems
          gameEngine,
          mlEngine,
          achievementSystem,
          
          // Computed properties
          canUndo: false,
          canHint: true,
          
          // Actions
          initializeGame: async () => {
            try {
              await mlEngine.initialize();
              set((state) => {
                const newState = createInitialGameState();
                Object.assign(state, newState);
                state.gameState = newState;
              });
            } catch (error) {
              console.warn('Failed to initialize ML engine:', error);
              set((state) => {
                const newState = createInitialGameState();
                Object.assign(state, newState);
                state.gameState = newState;
              });
            }
          },

          newGame: () => {
            set((state) => {
              const newState = createInitialGameState();
              Object.assign(state, newState);
              state.gameState = newState;
              state.selectedCard = null;
              state.hintCardId = null;
              state.isDragging = false;
              state.draggedCard = null;
              state.isGameWon = false;
              state.isGameLost = false;
            });
          },

          makeMove: async (move: Move) => {
            const state = get();
            console.log('Making move:', move);
            
            set((draft) => {
              draft.gameHistory.push({
                stock: [...draft.stock],
                waste: [...draft.waste],
                tableau: draft.tableau.map((pile: Card[]) => [...pile]),
                foundations: { ...draft.foundations },
                gameStats: { ...draft.gameStats },
              });
              draft.gameStats.moves++;
              draft.canUndo = true;
            });
            
            // Update ML analysis after move
            try {
              if (mlEngine.isInitialized) {
                const analysis = await mlEngine.getGameAnalysis(state.gameState);
                set((draft) => {
                  draft.mlAnalysis = analysis;
                });
              }
            } catch (error) {
              console.error('Failed to get ML analysis:', error);
            }
          },

          undoMove: () => {
            set((state) => {
              if (state.gameHistory.length > 0) {
                const lastState = state.gameHistory.pop();
                if (lastState) {
                  state.stock = lastState.stock;
                  state.waste = lastState.waste;
                  state.tableau = lastState.tableau;
                  state.foundations = lastState.foundations;
                  state.gameStats = lastState.gameStats;
                  state.canUndo = state.gameHistory.length > 0;
                }
              }
            });
          },

          redoMove: () => {
            console.log('Redo move');
          },

          getHint: async () => {
            const state = get();
            try {
              if (mlEngine.isInitialized) {
                const bestMove = await mlEngine.getBestMove(state.gameState);
                set((draft) => {
                  draft.hintCardId = bestMove?.cardId || null;
                });
                return bestMove;
              }
              return null;
            } catch (error) {
              console.error('Failed to get hint:', error);
              return null;
            }
          },

          getWinProbability: async () => {
            const state = get();
            try {
              if (mlEngine.isInitialized) {
                const analysis = await mlEngine.getGameAnalysis(state.gameState);
                return analysis.winProbability;
              }
              return 0.5;
            } catch (error) {
              console.error('Failed to get win probability:', error);
              return 0.5;
            }
          },

          selectCard: (card: Card | null) => {
            set((state) => {
              state.selectedCard = card;
            });
          },

          startDrag: (card: Card) => {
            set((state) => {
              state.isDragging = true;
              state.draggedCard = card;
            });
          },

          endDrag: () => {
            set((state) => {
              state.isDragging = false;
              state.draggedCard = null;
            });
          },

          setCurrentView: (view: 'game' | 'stats' | 'ml') => {
            set((state) => {
              state.currentView = view;
            });
          },

          updateSettings: (newSettings: Partial<GameSettings>) => {
            set((state) => {
              state.settings = { ...state.settings, ...newSettings };
            });
          },

          toggleTheme: () => {
            set((state) => {
              const themes: Array<'green' | 'blue' | 'dark' | 'light'> = ['green', 'blue', 'dark', 'light'];
              const currentIndex = themes.indexOf(state.settings.theme);
              const nextIndex = (currentIndex + 1) % themes.length;
              state.settings.theme = themes[nextIndex];
            });
          },

          updateGameStats: (won: boolean) => {
            set((state) => {
              state.statistics.gamesPlayed++;
              if (won) {
                state.statistics.gamesWon++;
                state.statistics.currentStreak++;
                if (state.statistics.currentStreak > state.statistics.bestStreak) {
                  state.statistics.bestStreak = state.statistics.currentStreak;
                }
              } else {
                state.statistics.currentStreak = 0;
              }
              state.statistics.winRate = state.statistics.gamesWon / state.statistics.gamesPlayed;
            });
          },

          resetStatistics: () => {
            set((state) => {
              state.statistics = { ...defaultStatistics };
            });
          },

          // Add new ML-related actions
          getMLAnalysis: async () => {
            const state = get();
            try {
              if (mlEngine.isInitialized) {
                const analysis = await mlEngine.getGameAnalysis(state.gameState);
                set((draft) => {
                  draft.mlAnalysis = analysis;
                });
                return analysis;
              }
              return null;
            } catch (error) {
              console.error('Failed to get ML analysis:', error);
              return null;
            }
          },
        };
      }),
      {
        name: 'solitaire-game-store',
        partialize: (state) => ({
          settings: state.settings,
          statistics: state.statistics,
        }),
      }
    ),
    {
      name: 'solitaire-game-store',
    }
  )
); 