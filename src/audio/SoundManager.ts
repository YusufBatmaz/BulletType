import { Howl } from 'howler';

export class SoundManager {
  private shootSound: Howl;
  private explosionSound: Howl;
  private hitSound: Howl;
  private bgMusic: Howl;
  private audioContext: AudioContext;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Gerçek ses dosyaları için Howler.js
    this.shootSound = new Howl({
      src: ['/sounds/shoot.mp3', '/sounds/shoot.ogg'],
      volume: 0.4,
      onloaderror: () => {
        console.log('Shoot sound not found, using fallback');
      }
    });

    this.explosionSound = new Howl({
      src: ['/sounds/explosion.mp3', '/sounds/explosion.ogg'],
      volume: 0.25,
      onloaderror: () => {
        console.log('Explosion sound not found, using fallback');
      }
    });

    this.hitSound = new Howl({
      src: ['/sounds/hit.mp3', '/sounds/hit.ogg'],
      volume: 0.3,
      onloaderror: () => {
        console.log('Hit sound not found, using fallback');
      }
    });

    this.bgMusic = new Howl({
      src: ['/sounds/background.mp3', '/sounds/background.ogg'],
      volume: 0.1,
      loop: true,
      onloaderror: () => {
        console.log('Background music not found');
      }
    });
  }

  playShoot(): void {
    // Önce gerçek ses dosyasını dene
    if (this.shootSound.state() === 'loaded') {
      this.shootSound.play();
    } else {
      // Fallback: Prosedürel ses
      this.playShootFallback();
    }
  }

  playExplosion(): void {
    // Önce gerçek ses dosyasını dene
    if (this.explosionSound.state() === 'loaded') {
      this.explosionSound.play();
    } else {
      // Fallback: Prosedürel ses
      this.playExplosionFallback();
    }
  }

  playHit(): void {
    // Önce gerçek ses dosyasını dene
    if (this.hitSound.state() === 'loaded') {
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
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
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
    
    gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
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
    
    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  playBackgroundMusic(): void {
    this.bgMusic.play();
  }

  stopBackgroundMusic(): void {
    this.bgMusic.stop();
  }
}
