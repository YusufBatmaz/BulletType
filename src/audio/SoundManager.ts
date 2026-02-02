import { Howl } from 'howler';

export class SoundManager {
  private shootSound: Howl;
  private explosionSound: Howl;
  private hitSound: Howl;
  private currentMusic: Howl | null = null;
  private audioContext: AudioContext;
  
  // Ses seviyeleri
  private musicVolume: number = 0.2;
  private effectsVolume: number = 1.0;
  private isMusicMuted: boolean = false;
  private areEffectsMuted: boolean = false;
  
  // Müzik listesi
  private musicTracks: string[] = [
    '/sounds/Musics/Chiptune Arcade Game Music.mp3',
    '/sounds/Musics/Level IX Short.mp3',
    '/sounds/Musics/Pixelated Alien.mp3',
    '/sounds/Musics/Retro Arcade Beat – 8-Bit Lo-fi Music.mp3'
  ];
  
  private playedTracks: string[] = [];

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Gerçek ses dosyaları için Howler.js
    this.shootSound = new Howl({
      src: ['/sounds/shoot.mp3', '/sounds/shoot.ogg'],
      volume: 0.2,  // Dengeli seviye
      onloaderror: () => {
        console.log('Shoot sound not found, using fallback');
      }
    });

    this.explosionSound = new Howl({
      src: ['/sounds/explosion.mp3', '/sounds/explosion.ogg'],
      volume: 0.15,  // Dengeli seviye
      onloaderror: () => {
        console.log('Explosion sound not found, using fallback');
      }
    });

    this.hitSound = new Howl({
      src: ['/sounds/hit.mp3', '/sounds/hit.ogg'],
      volume: 0.2,  // Dengeli seviye
      onloaderror: () => {
        console.log('Hit sound not found, using fallback');
      }
    });
  }

  playShoot(): void {
    if (this.areEffectsMuted) return;
    
    // Önce gerçek ses dosyasını dene
    if (this.shootSound.state() === 'loaded') {
      this.shootSound.volume(0.2 * this.effectsVolume);
      this.shootSound.play();
    } else {
      // Fallback: Prosedürel ses
      this.playShootFallback();
    }
  }

  playExplosion(): void {
    if (this.areEffectsMuted) return;
    
    // Önce gerçek ses dosyasını dene
    if (this.explosionSound.state() === 'loaded') {
      this.explosionSound.volume(0.15 * this.effectsVolume);
      this.explosionSound.play();
    } else {
      // Fallback: Prosedürel ses
      this.playExplosionFallback();
    }
  }

  playHit(): void {
    if (this.areEffectsMuted) return;
    
    // Önce gerçek ses dosyasını dene
    if (this.hitSound.state() === 'loaded') {
      this.hitSound.volume(0.2 * this.effectsVolume);
      this.hitSound.play();
    } else {
      // Fallback: Prosedürel ses
      this.playHitFallback();
    }
  }

  // Fallback prosedürel sesler
  private playShootFallback(): void {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  private playExplosionFallback(): void {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  private playHitFallback(): void {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  playBackgroundMusic(): void {
    this.playRandomTrack();
  }

  stopBackgroundMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic.unload();
      this.currentMusic = null;
    }
  }
  
  skipToNextTrack(): void {
    // Mevcut müziği durdur ve yeni müzik çal
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic.unload();
    }
    this.playRandomTrack();
  }
  
  private playRandomTrack(): void {
    // Eğer tüm şarkılar çalındıysa listeyi sıfırla
    if (this.playedTracks.length === this.musicTracks.length) {
      this.playedTracks = [];
    }
    
    // Henüz çalınmamış şarkıları bul
    const availableTracks = this.musicTracks.filter(
      track => !this.playedTracks.includes(track)
    );
    
    // Rastgele bir şarkı seç
    const randomIndex = Math.floor(Math.random() * availableTracks.length);
    const selectedTrack = availableTracks[randomIndex];
    
    // Çalınan şarkıları kaydet
    this.playedTracks.push(selectedTrack);
    
    // Önceki müziği durdur
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic.unload();
    }
    
    // Yeni müziği çal
    this.currentMusic = new Howl({
      src: [selectedTrack],
      volume: this.isMusicMuted ? 0 : this.musicVolume,
      loop: false,
      onend: () => {
        // Şarkı bitince bir sonraki rastgele şarkıyı çal
        this.playRandomTrack();
      },
      onloaderror: (id, error) => {
        console.log(`Music load error: ${selectedTrack}`, error);
        // Hata olursa bir sonraki şarkıyı dene
        this.playRandomTrack();
      }
    });
    
    this.currentMusic.play();
    console.log(`Now playing: ${selectedTrack.split('/').pop()}`);
  }
  
  // Ses kontrol fonksiyonları
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic && !this.isMusicMuted) {
      this.currentMusic.volume(this.musicVolume);
    }
  }
  
  setEffectsVolume(volume: number): void {
    this.effectsVolume = Math.max(0, Math.min(1, volume));
  }
  
  toggleMusicMute(): boolean {
    this.isMusicMuted = !this.isMusicMuted;
    if (this.currentMusic) {
      this.currentMusic.volume(this.isMusicMuted ? 0 : this.musicVolume);
    }
    return this.isMusicMuted;
  }
  
  toggleEffectsMute(): boolean {
    this.areEffectsMuted = !this.areEffectsMuted;
    return this.areEffectsMuted;
  }
  
  isMusicMutedState(): boolean {
    return this.isMusicMuted;
  }
  
  areEffectsMutedState(): boolean {
    return this.areEffectsMuted;
  }
  
  getMusicVolume(): number {
    return this.musicVolume;
  }
  
  getEffectsVolume(): number {
    return this.effectsVolume;
  }
}
