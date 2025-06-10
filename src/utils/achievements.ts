import { Achievement, GameState, GameStatistics } from '../types/game';

export class AchievementSystem {
  private achievements: Record<string, Achievement> = {};
  
  constructor() {
    this.initializeAchievements();
  }

  private initializeAchievements(): void {
    this.achievements = {
      'first-win': {
        id: 'first-win',
        name: 'First Victory',
        description: 'Win your first game of Klondike Solitaire',
        icon: '🏆',
        category: 'basic',
        unlocked: false,
      },
      'speed-demon': {
        id: 'speed-demon',
        name: 'Speed Demon',
        description: 'Win a game in under 2 minutes',
        icon: '⚡',
        category: 'time',
        unlocked: false,
      },
      'perfectionist': {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Win a game without using undo',
        icon: '💎',
        category: 'skill',
        unlocked: false,
      },
      'streak-5': {
        id: 'streak-5',
        name: 'Win Streak',
        description: 'Win 5 games in a row',
        icon: '🔥',
        category: 'streak',
        unlocked: false,
      },
      'streak-10': {
        id: 'streak-10',
        name: 'Hot Streak',
        description: 'Win 10 games in a row',
        icon: '🌟',
        category: 'streak',
        unlocked: false,
      },
      'high-scorer': {
        id: 'high-scorer',
        name: 'High Scorer',
        description: 'Score over 1000 points in a single game',
        icon: '💯',
        category: 'score',
        unlocked: false,
      },
      'patient-player': {
        id: 'patient-player',
        name: 'Patient Player',
        description: 'Win a game with over 500 moves',
        icon: '🧘',
        category: 'patience',
        unlocked: false,
      },
      'minimalist': {
        id: 'minimalist',
        name: 'Minimalist',
        description: 'Win a game with fewer than 100 moves',
        icon: '🎯',
        category: 'efficiency',
        unlocked: false,
      },
      'foundation-master': {
        id: 'foundation-master',
        name: 'Foundation Master',
        description: 'Complete all foundations in order (A-K)',
        icon: '🏛️',
        category: 'skill',
        unlocked: false,
      },
      'night-owl': {
        id: 'night-owl',
        name: 'Night Owl',
        description: 'Win a game between midnight and 6 AM',
        icon: '🦉',
        category: 'time',
        unlocked: false,
      },
      'persistent': {
        id: 'persistent',
        name: 'Persistent',
        description: 'Play 100 games',
        icon: '🏃',
        category: 'dedication',
        unlocked: false,
        progress: 0,
        maxProgress: 100,
      },
      'dedicated': {
        id: 'dedicated',
        name: 'Dedicated',
        description: 'Play 500 games',
        icon: '🎖️',
        category: 'dedication',
        unlocked: false,
        progress: 0,
        maxProgress: 500,
      },
      'legend': {
        id: 'legend',
        name: 'Legend',
        description: 'Play 1000 games',
        icon: '👑',
        category: 'dedication',
        unlocked: false,
        progress: 0,
        maxProgress: 1000,
      },
      'win-rate-50': {
        id: 'win-rate-50',
        name: 'Consistent Winner',
        description: 'Maintain a 50% win rate over 20 games',
        icon: '📊',
        category: 'skill',
        unlocked: false,
      },
      'win-rate-75': {
        id: 'win-rate-75',
        name: 'Master Player',
        description: 'Maintain a 75% win rate over 20 games',
        icon: '🎓',
        category: 'skill',
        unlocked: false,
      },
      'theme-explorer': {
        id: 'theme-explorer',
        name: 'Theme Explorer',
        description: 'Try all 4 themes',
        icon: '🎨',
        category: 'exploration',
        unlocked: false,
        progress: 0,
        maxProgress: 4,
      },
      'no-stock': {
        id: 'no-stock',
        name: 'No Stock Needed',
        description: 'Win without ever flipping the stock pile',
        icon: '🚫',
        category: 'skill',
        unlocked: false,
      },
      'revealer': {
        id: 'revealer',
        name: 'The Revealer',
        description: 'Reveal all face-down cards in a single game',
        icon: '👁️',
        category: 'exploration',
        unlocked: false,
      },
    };
  }

  initialize(statistics: GameStatistics): void {
    // Update progress-based achievements
    if (this.achievements['persistent']) {
      this.achievements['persistent'].progress = statistics.gamesPlayed;
      this.achievements['persistent'].unlocked = statistics.gamesPlayed >= 100;
    }
    
    if (this.achievements['dedicated']) {
      this.achievements['dedicated'].progress = statistics.gamesPlayed;
      this.achievements['dedicated'].unlocked = statistics.gamesPlayed >= 500;
    }
    
    if (this.achievements['legend']) {
      this.achievements['legend'].progress = statistics.gamesPlayed;
      this.achievements['legend'].unlocked = statistics.gamesPlayed >= 1000;
    }

    // Load unlocked achievements from statistics
    statistics.achievements.forEach(achievementId => {
      if (this.achievements[achievementId]) {
        this.achievements[achievementId].unlocked = true;
        this.achievements[achievementId].unlockedAt = Date.now();
      }
    });
  }

  checkAchievements(gameState: GameState, statistics: GameStatistics): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    // Check each achievement
    Object.values(this.achievements).forEach(achievement => {
      if (!achievement.unlocked && this.checkAchievement(achievement, gameState, statistics)) {
        achievement.unlocked = true;
        achievement.unlockedAt = Date.now();
        newlyUnlocked.push(achievement);
      }
    });

    return newlyUnlocked;
  }

  private checkAchievement(achievement: Achievement, gameState: GameState, statistics: GameStatistics): boolean {
    const now = new Date();
    const gameTime = gameState.gameStats.time;
    const moves = gameState.gameStats.moves;
    const score = gameState.gameStats.score;
    const isGameWon = this.isGameWon(gameState);

    switch (achievement.id) {
      case 'first-win':
        return isGameWon && statistics.gamesWon === 1;

      case 'speed-demon':
        return isGameWon && gameTime < 120; // 2 minutes

      case 'perfectionist':
        return isGameWon && gameState.gameHistory.length === 0; // No undos

      case 'streak-5':
        return statistics.currentStreak >= 5;

      case 'streak-10':
        return statistics.currentStreak >= 10;

      case 'high-scorer':
        return score > 1000;

      case 'patient-player':
        return isGameWon && moves > 500;

      case 'minimalist':
        return isGameWon && moves < 100;

      case 'foundation-master':
        return isGameWon && this.checkFoundationOrder(gameState);

      case 'night-owl':
        const hour = now.getHours();
        return isGameWon && (hour >= 0 && hour < 6);

      case 'persistent':
        return statistics.gamesPlayed >= 100;

      case 'dedicated':
        return statistics.gamesPlayed >= 500;

      case 'legend':
        return statistics.gamesPlayed >= 1000;

      case 'win-rate-50':
        return statistics.gamesPlayed >= 20 && statistics.winRate >= 0.5;

      case 'win-rate-75':
        return statistics.gamesPlayed >= 20 && statistics.winRate >= 0.75;

      case 'theme-explorer':
        // This would need to be tracked separately
        return false; // Placeholder

      case 'no-stock':
        return isGameWon && !this.wasStockUsed(gameState);

      case 'revealer':
        return isGameWon && this.allCardsRevealed(gameState);

      default:
        return false;
    }
  }

  private isGameWon(gameState: GameState): boolean {
    return Object.values(gameState.foundations).every(foundation => foundation.length === 13);
  }

  private checkFoundationOrder(gameState: GameState): boolean {
    // Check if all foundations were built in proper order (A to K)
    return Object.values(gameState.foundations).every(foundation => {
      if (foundation.length !== 13) return false;
      
      for (let i = 0; i < foundation.length; i++) {
        const expectedValue = i + 1;
        if (foundation[i].value !== expectedValue) return false;
      }
      return true;
    });
  }

  private wasStockUsed(gameState: GameState): boolean {
    // This would need to be tracked during gameplay
    // For now, check if there are any cards in waste
    return gameState.waste.length > 0;
  }

  private allCardsRevealed(gameState: GameState): boolean {
    // Check if all tableau cards were revealed at some point
    return gameState.tableau.every(pile => 
      pile.every(card => card.faceUp)
    );
  }

  getAchievements(): Record<string, Achievement> {
    return this.achievements;
  }

  getUnlockedAchievements(): Achievement[] {
    return Object.values(this.achievements).filter(achievement => achievement.unlocked);
  }

  getAchievementsByCategory(category: string): Achievement[] {
    return Object.values(this.achievements).filter(achievement => achievement.category === category);
  }

  getAchievementProgress(achievementId: string): number {
    const achievement = this.achievements[achievementId];
    if (!achievement || !achievement.maxProgress) return 0;
    
    return Math.min((achievement.progress || 0) / achievement.maxProgress, 1);
  }

  updateProgress(achievementId: string, progress: number): void {
    const achievement = this.achievements[achievementId];
    if (achievement && achievement.maxProgress) {
      achievement.progress = Math.min(progress, achievement.maxProgress);
      
      if (achievement.progress >= achievement.maxProgress && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedAt = Date.now();
      }
    }
  }

  getAchievementStats(): {
    total: number;
    unlocked: number;
    categories: Record<string, { total: number; unlocked: number }>;
  } {
    const achievements = Object.values(this.achievements);
    const categories: Record<string, { total: number; unlocked: number }> = {};

    achievements.forEach(achievement => {
      if (!categories[achievement.category]) {
        categories[achievement.category] = { total: 0, unlocked: 0 };
      }
      
      categories[achievement.category].total++;
      if (achievement.unlocked) {
        categories[achievement.category].unlocked++;
      }
    });

    return {
      total: achievements.length,
      unlocked: achievements.filter(a => a.unlocked).length,
      categories,
    };
  }
} 