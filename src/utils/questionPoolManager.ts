import questionPoolData from '@/data/questionPool.json';

interface Question {
  id: string;
  type: string;
  difficulty: number;
  question: string;
  content: string;
  options: string[];
  correct: number;
  points: number;
  category: string;
  used: boolean;
}

interface QuestionPool {
  questionPool: Question[];
}

class QuestionPoolManager {
  private static instance: QuestionPoolManager;
  private questionPool: Question[];
  private usedQuestions: Set<string>;

  private constructor() {
    this.questionPool = (questionPoolData as QuestionPool).questionPool;
    this.usedQuestions = new Set(this.getUsedQuestionsFromStorage());
  }

  public static getInstance(): QuestionPoolManager {
    if (!QuestionPoolManager.instance) {
      QuestionPoolManager.instance = new QuestionPoolManager();
    }
    return QuestionPoolManager.instance;
  }

  private getUsedQuestionsFromStorage(): string[] {
    const stored = localStorage.getItem('dyslexia-used-questions');
    return stored ? JSON.parse(stored) : [];
  }

  private saveUsedQuestionsToStorage(): void {
    localStorage.setItem('dyslexia-used-questions', JSON.stringify(Array.from(this.usedQuestions)));
  }

  public getUniqueQuestions(levelNumber: number, count: number = 5): Question[] {
    // Determine difficulty range based on level
    let difficultyRange: number[];
    let preferredCategories: string[];

    if (levelNumber <= 5) {
      // Levels 1-5: Basic identification
      difficultyRange = [1];
      preferredCategories = ['letter-identification', 'shape-recognition', 'color-matching', 'simple-matching'];
    } else if (levelNumber <= 10) {
      // Levels 6-10: Phonics and word recognition
      difficultyRange = [2];
      preferredCategories = ['phonics', 'sound-letter-mapping', 'word-recognition'];
    } else if (levelNumber <= 15) {
      // Levels 11-15: Word manipulation
      difficultyRange = [3];
      preferredCategories = ['jumbled-words', 'missing-letters', 'short-sentences'];
    } else {
      // Levels 16-20: Advanced reading
      difficultyRange = [4, 5];
      preferredCategories = ['reading-comprehension', 'spelling-correction', 'paragraph-reading'];
    }

    // Get available questions that haven't been used
    const availableQuestions = this.questionPool.filter(q => 
      !this.usedQuestions.has(q.id) &&
      difficultyRange.includes(q.difficulty) &&
      preferredCategories.includes(q.category)
    );

    // If we don't have enough unused questions, reset some older ones
    if (availableQuestions.length < count) {
      this.resetOldestUsedQuestions(count - availableQuestions.length, difficultyRange, preferredCategories);
      return this.getUniqueQuestions(levelNumber, count);
    }

    // Shuffle and select questions
    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    // Mark selected questions as used
    selected.forEach(q => {
      this.usedQuestions.add(q.id);
    });

    this.saveUsedQuestionsToStorage();
    return selected;
  }

  private resetOldestUsedQuestions(count: number, difficultyRange: number[], categories: string[]): void {
    // Find questions that match criteria but are currently marked as used
    const relevantUsedQuestions = this.questionPool.filter(q =>
      this.usedQuestions.has(q.id) &&
      difficultyRange.includes(q.difficulty) &&
      categories.includes(q.category)
    );

    // Reset the oldest ones (we'll just reset the first ones we find)
    const toReset = relevantUsedQuestions.slice(0, count);
    toReset.forEach(q => {
      this.usedQuestions.delete(q.id);
    });

    this.saveUsedQuestionsToStorage();
  }

  public markQuestionAsUsed(questionId: string): void {
    this.usedQuestions.add(questionId);
    this.saveUsedQuestionsToStorage();
  }

  public resetAllUsedQuestions(): void {
    this.usedQuestions.clear();
    this.saveUsedQuestionsToStorage();
  }

  public getUsedQuestionsCount(): number {
    return this.usedQuestions.size;
  }

  public getTotalQuestionsCount(): number {
    return this.questionPool.length;
  }

  public getAvailableQuestionsForLevel(levelNumber: number): number {
    let difficultyRange: number[];
    let preferredCategories: string[];

    if (levelNumber <= 5) {
      difficultyRange = [1];
      preferredCategories = ['letter-identification', 'shape-recognition', 'color-matching', 'simple-matching'];
    } else if (levelNumber <= 10) {
      difficultyRange = [2];
      preferredCategories = ['phonics', 'sound-letter-mapping', 'word-recognition'];
    } else if (levelNumber <= 15) {
      difficultyRange = [3];
      preferredCategories = ['jumbled-words', 'missing-letters', 'short-sentences'];
    } else {
      difficultyRange = [4, 5];
      preferredCategories = ['reading-comprehension', 'spelling-correction', 'paragraph-reading'];
    }

    return this.questionPool.filter(q => 
      !this.usedQuestions.has(q.id) &&
      difficultyRange.includes(q.difficulty) &&
      preferredCategories.includes(q.category)
    ).length;
  }
}

export default QuestionPoolManager;