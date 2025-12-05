
import { ReadingResult, UserPreferences } from '../types';

const HISTORY_KEY = 'tarot_verdadeiro_history';
const PREFS_KEY = 'tarot_verdadeiro_prefs';

export const getHistory = (): ReadingResult[] => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error loading history", e);
    return [];
  }
};

export const saveReadingToHistory = (reading: ReadingResult) => {
  try {
    const history = getHistory();
    // Keep only last 10
    const newHistory = [reading, ...history].slice(0, 10);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    return newHistory;
  } catch (e) {
    console.error("Error saving history", e);
    return [];
  }
};

export const getUserPrefs = (): UserPreferences => {
  try {
    const data = localStorage.getItem(PREFS_KEY);
    const defaultPrefs: UserPreferences = { 
      lastReadingTime: 0, 
      dailyQuestions: {}, 
      isPremium: false,
      hasRedeemedTrial: false,
      premiumExpiry: null,
      birthDate: undefined,
      cachedHoroscope: undefined
    };
    
    return data ? { ...defaultPrefs, ...JSON.parse(data) } : defaultPrefs;
  } catch (e) {
    return { 
      lastReadingTime: 0, 
      dailyQuestions: {}, 
      isPremium: false,
      hasRedeemedTrial: false,
      premiumExpiry: null,
      birthDate: undefined,
      cachedHoroscope: undefined
    };
  }
};

export const updateUserPrefs = (prefs: Partial<UserPreferences>) => {
  try {
    const current = getUserPrefs();
    const updated = { ...current, ...prefs };
    localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Error saving prefs", e);
    return getUserPrefs();
  }
};

// Helper to hash question for daily check
export const normalizeQuestion = (q: string) => {
  return q.trim().toLowerCase().replace(/[^\w\s]/gi, '');
};
