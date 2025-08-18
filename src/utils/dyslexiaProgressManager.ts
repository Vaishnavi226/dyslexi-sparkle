interface LevelProgress {
  id: number;
  completed: boolean;
  stars: number;
  bestScore: number;
  attempts: number;
  lastAttempted: string;
}

interface UserProgress {
  currentLevel: number;
  totalStars: number;
  completedLevels: number[];
  levelProgress: Record<number, LevelProgress>;
  overallProgress: number;
  lastPlayed: string;
}

class DyslexiaProgressManager {
  private static instance: DyslexiaProgressManager;
  private readonly STORAGE_KEY = 'dyslexia-progress';

  private constructor() {}

  public static getInstance(): DyslexiaProgressManager {
    if (!DyslexiaProgressManager.instance) {
      DyslexiaProgressManager.instance = new DyslexiaProgressManager();
    }
    return DyslexiaProgressManager.instance;
  }

  private getDefaultProgress(): UserProgress {
    return {
      currentLevel: 1,
      totalStars: 0,
      completedLevels: [],
      levelProgress: {},
      overallProgress: 0,
      lastPlayed: new Date().toISOString()
    };
  }

  public getUserProgress(): UserProgress {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const progress = JSON.parse(stored);
        // Ensure all required fields exist
        return {
          ...this.getDefaultProgress(),
          ...progress
        };
      }
    } catch (error) {
      console.warn('Error loading dyslexia progress:', error);
    }
    return this.getDefaultProgress();
  }

  public saveUserProgress(progress: UserProgress): void {
    try {
      progress.lastPlayed = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving dyslexia progress:', error);
    }
  }

  public updateLevelProgress(
    levelId: number, 
    score: number, 
    stars: number
  ): UserProgress {
    const progress = this.getUserProgress();
    
    // Update or create level progress
    const levelProgress: LevelProgress = {
      id: levelId,
      completed: true,
      stars: Math.max(progress.levelProgress[levelId]?.stars || 0, stars),
      bestScore: Math.max(progress.levelProgress[levelId]?.bestScore || 0, score),
      attempts: (progress.levelProgress[levelId]?.attempts || 0) + 1,
      lastAttempted: new Date().toISOString()
    };

    progress.levelProgress[levelId] = levelProgress;

    // Update completed levels list
    if (!progress.completedLevels.includes(levelId)) {
      progress.completedLevels.push(levelId);
    }

    // Update current level (unlock next level if score is good enough)
    if (score >= 60 && levelId >= progress.currentLevel) {
      progress.currentLevel = Math.min(levelId + 1, 20);
    }

    // Recalculate total stars
    progress.totalStars = Object.values(progress.levelProgress).reduce(
      (total, level) => total + level.stars, 0
    );

    // Calculate overall progress
    progress.overallProgress = (progress.completedLevels.length / 20) * 100;

    this.saveUserProgress(progress);
    return progress;
  }

  public isLevelUnlocked(levelId: number): boolean {
    const progress = this.getUserProgress();
    
    if (levelId === 1) return true;
    
    // Check if user has enough stars
    const requiredStars = (levelId - 1) * 2;
    return progress.totalStars >= requiredStars;
  }

  public getLevelProgress(levelId: number): LevelProgress | null {
    const progress = this.getUserProgress();
    return progress.levelProgress[levelId] || null;
  }

  public resetAllProgress(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error resetting progress:', error);
    }
  }

  public resetLevelProgress(levelId: number): UserProgress {
    const progress = this.getUserProgress();
    
    if (progress.levelProgress[levelId]) {
      delete progress.levelProgress[levelId];
      
      // Remove from completed levels
      progress.completedLevels = progress.completedLevels.filter(id => id !== levelId);
      
      // Recalculate stats
      progress.totalStars = Object.values(progress.levelProgress).reduce(
        (total, level) => total + level.stars, 0
      );
      progress.overallProgress = (progress.completedLevels.length / 20) * 100;
      
      this.saveUserProgress(progress);
    }
    
    return progress;
  }

  public getNextAvailableLevel(): number {
    const progress = this.getUserProgress();
    
    // Find the first uncompleted level that's unlocked
    for (let i = 1; i <= 20; i++) {
      if (!progress.completedLevels.includes(i) && this.isLevelUnlocked(i)) {
        return i;
      }
    }
    
    // If all levels are completed, return the last level
    return 20;
  }

  public exportProgress(): string {
    return JSON.stringify(this.getUserProgress(), null, 2);
  }

  public importProgress(progressData: string): boolean {
    try {
      const progress = JSON.parse(progressData);
      this.saveUserProgress(progress);
      return true;
    } catch (error) {
      console.error('Error importing progress:', error);
      return false;
    }
  }
}

export default DyslexiaProgressManager;