import { wordDatabase } from './WordDatabase';

export const GameConfig = {
  initialLives: 3,
  initialLevel: 1,
  pointsPerLetter: 1,
  pointsPerWord: 5,
  pointsForLevelUp: 100,
  baseSpawnInterval: 2000,
  spawnIntervalDecrease: 80,
  minSpawnInterval: 1200,
  baseFallSpeed: 20,
  fallSpeedIncrease: 2,
  maxFallSpeed: 45,
  // Seviyeye göre kelime uzunluk limitleri
  maxWordLengthByLevel: {
    1: 5,   // Level 1: Max 5 harf
    2: 6,   // Level 2: Max 6 harf
    3: 7,   // Level 3: Max 7 harf
    4: 8,   // Level 4: Max 8 harf
    5: 9,   // Level 5: Max 9 harf
    6: 10,  // Level 6: Max 10 harf
    7: 11,  // Level 7: Max 11 harf
    8: 12,  // Level 8+: Max 12 harf
  }
};

// Kelime uzunluğuna göre filtreleme
export function getWordForLevel(level: number): string {
  // Seviyeye göre maksimum kelime uzunluğu
  const levelKey = Math.min(level, 8) as keyof typeof GameConfig.maxWordLengthByLevel;
  const maxLength = GameConfig.maxWordLengthByLevel[levelKey] || 12;
  
  // Uygun uzunluktaki kelimeleri filtrele
  const suitableWords = wordDatabase.filter(word => word.length <= maxLength);
  
  // Rastgele kelime seç
  return suitableWords[Math.floor(Math.random() * suitableWords.length)];
}
