
export interface TarotCard {
  id: string;
  name: string;
  arcana: 'Major' | 'Minor';
  suit?: 'Copas' | 'Espadas' | 'Ouros' | 'Paus';
  number?: number | string;
  keywords: string[];
  imageCode: string; // Code for the image filename (e.g., 'ar00', 'wa01')
}

export interface DrawnCard extends TarotCard {
  isReversed: boolean;
  position: 'Passado' | 'Presente' | 'Futuro';
}

export interface ReadingResult {
  id: string;
  timestamp: number;
  question: string;
  cards: DrawnCard[];
  interpretation: string;
}

export interface HoroscopeCache {
  date: string; // YYYY-MM-DD
  content: string;
}

export interface UserPreferences {
  lastReadingTime: number; // Timestamp
  dailyQuestions: Record<string, string[]>; // Date string -> Array of question hashes
  isPremium: boolean;
  premiumExpiry?: number | null; // Timestamp when premium expires (if temporary)
  hasRedeemedTrial: boolean; // If user has already used the 1-hour free trial
  birthDate?: string; // YYYY-MM-DD format
  cachedHoroscope?: HoroscopeCache;
}
