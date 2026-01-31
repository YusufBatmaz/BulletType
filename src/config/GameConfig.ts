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
  maxFallSpeed: 45
};

// Kolay kelimeler (Level 1-3)
export const easyWords = [
  'ev', 'su', 'el', 'göz', 'kol', 'baş', 'ayak', 'dil',
  'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi',
  'kedi', 'köpek', 'kuş', 'balık', 'fare', 'at', 'inek',
  'elma', 'armut', 'muz', 'üzüm', 'erik', 'kiraz',
  'masa', 'sandalye', 'kapı', 'pencere', 'duvar',
  'güneş', 'ay', 'yıldız', 'bulut', 'yağmur',
  'anne', 'baba', 'kardeş', 'dede', 'nine',
  'okul', 'sınıf', 'kitap', 'kalem', 'defter'
];

// Orta kelimeler (Level 4-7)
export const mediumWords = [
  'bilgisayar', 'klavye', 'fare', 'ekran', 'yazılım',
  'program', 'internet', 'tarayıcı', 'oyun', 'müzik',
  'öğrenci', 'öğretmen', 'müdür', 'doktor', 'mühendis',
  'araba', 'otobüs', 'tren', 'uçak', 'bisiklet',
  'telefon', 'tablet', 'kamera', 'fotoğraf', 'video',
  'kahvaltı', 'öğle', 'akşam', 'gece', 'sabah',
  'deniz', 'göl', 'nehir', 'dağ', 'orman',
  'ağaç', 'çiçek', 'yaprak', 'kök', 'dal',
  'domates', 'salatalık', 'biber', 'patlıcan', 'havuç',
  'kırmızı', 'mavi', 'yeşil', 'sarı', 'siyah'
];

// Zor kelimeler (Level 8+)
export const hardWords = [
  'mühendislik', 'bilgisayar', 'programlama', 'teknoloji',
  'astronomi', 'matematik', 'geometri', 'coğrafya',
  'cumhuriyet', 'demokrasi', 'anayasa', 'parlamento',
  'üniversite', 'laboratuvar', 'kütüphane', 'hastane',
  'restoran', 'lokanta', 'pastane', 'kahvehane',
  'çikolata', 'dondurma', 'hamburger', 'sandviç',
  'televizyon', 'radyo', 'gazete', 'dergi',
  'futbol', 'basketbol', 'voleybol', 'hentbol',
  'müzisyen', 'sanatçı', 'ressam', 'heykeltıraş',
  'mühendis', 'avukat', 'öğretmen', 'doktor',
  'kütüphane', 'müze', 'sinema', 'tiyatro',
  'havaalanı', 'istasyon', 'terminal', 'liman'
];

// Seviyeye göre kelime seçimi
export function getWordForLevel(level: number): string {
  if (level <= 3) {
    // Level 1-3: Sadece kolay kelimeler
    return easyWords[Math.floor(Math.random() * easyWords.length)];
  } else if (level <= 7) {
    // Level 4-7: %70 orta, %30 kolay
    const useEasy = Math.random() < 0.3;
    const pool = useEasy ? easyWords : mediumWords;
    return pool[Math.floor(Math.random() * pool.length)];
  } else {
    // Level 8+: %50 zor, %30 orta, %20 kolay
    const rand = Math.random();
    let pool: string[];
    if (rand < 0.5) {
      pool = hardWords;
    } else if (rand < 0.8) {
      pool = mediumWords;
    } else {
      pool = easyWords;
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }
}
