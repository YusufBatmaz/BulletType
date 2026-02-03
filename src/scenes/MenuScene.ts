import Phaser from 'phaser';
import { SoundManager } from '../audio/SoundManager';
import { SettingsMenu } from '../ui/SettingsMenu';

export class MenuScene extends Phaser.Scene {
  private static soundManager: SoundManager | null = null;
  private settingsMenu!: SettingsMenu;
  private visibilityHandler?: () => void;
  
  constructor() {
    super({ key: 'MenuScene' });
  }

  preload(): void {
    // Uçak görsellerini yükle
    this.load.image('classic', '/images/ucaklar/classic.png');
    this.load.image('bit-striker', '/images/ucaklar/Bit-Striker.png');
    this.load.image('sky-warden', '/images/ucaklar/Sky Warden.png');
    this.load.image('nebula-ghost', '/images/ucaklar/Nebula Ghost.png');
    this.load.image('apex-sentinel', '/images/ucaklar/Apex Sentinel.png');
    this.load.image('stormbringer', '/images/ucaklar/Stormbringer.png');
    
    // Savaş arka planını yükle (menü için)
    this.load.image('battleground', '/images/savas.png');
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Müzik sistemini başlat (sadece bir kere)
    if (!MenuScene.soundManager) {
      MenuScene.soundManager = new SoundManager();
      MenuScene.soundManager.playBackgroundMusic();
      
      // Page Visibility API - Sekme değiştiğinde müziği duraklat/devam ettir
      this.visibilityHandler = () => {
        if (document.hidden) {
          MenuScene.soundManager?.pauseMusic();
        } else {
          MenuScene.soundManager?.resumeMusic();
        }
      };
      
      document.addEventListener('visibilitychange', this.visibilityHandler);
    }

    // Ayarlar menüsü oluştur
    this.settingsMenu = new SettingsMenu(this, MenuScene.soundManager, undefined, undefined);

    // Savaş alanı arka planı
    const battleground = this.add.image(width / 2, height / 2, 'battleground');
    battleground.setDisplaySize(width, height);
    battleground.setAlpha(0.3); // Menüde daha soluk
    battleground.setTint(0x8888aa); // Hafif mavi-gri ton

    // Başlık
    const title = this.add.text(width / 2, height / 3, 'BULLETTYPE', {
      fontSize: '64px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      align: 'center'
    });
    title.setOrigin(0.5);

    // Uçak görseli
    const plane = this.add.image(width / 2, height / 2, 'classic');
    plane.setOrigin(0.5);
    plane.setScale(0.2);

    // Başla butonu - Retro arcade stili
    const buttonWidth = 200;
    const buttonHeight = 60;
    
    // Buton arka planı
    const buttonBg = this.add.rectangle(width / 2, height / 1.5, buttonWidth, buttonHeight, 0x000000);
    buttonBg.setStrokeStyle(4, 0x00ffff);
    
    // Buton metni
    const startButton = this.add.text(width / 2, height / 1.5, 'START', {
      fontSize: '36px',
      color: '#00ffff',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    });
    startButton.setOrigin(0.5);
    startButton.setStroke('#004444', 4);

    // İnteraktif yap
    buttonBg.setInteractive({ useHandCursor: true });

    // Hover efekti
    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(0x00ffff, 0.2);
      startButton.setScale(1.1);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(0x000000);
      startButton.setScale(1);
    });

    buttonBg.on('pointerdown', () => {
      buttonBg.setFillStyle(0x00ffff, 0.4);
      startButton.setScale(0.95);
    });

    buttonBg.on('pointerup', () => {
      this.scene.start('GameScene');
    });

    // Animasyonlar
    this.tweens.add({
      targets: plane,
      y: height / 2 + 20,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  
  shutdown(): void {
    // Visibility listener'ı temizle
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
  }
}
