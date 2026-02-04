import Phaser from 'phaser';
import { SoundManager } from '../audio/SoundManager';
import { SettingsMenu } from '../ui/SettingsMenu';
import { LeaderboardPanel } from '../ui/LeaderboardPanel';
import { FirebaseService } from '../services/FirebaseService';

export class GameOverScene extends Phaser.Scene {
  private finalScore: number = 0;
  private settingsMenu!: SettingsMenu;
  private leaderboardPanel!: LeaderboardPanel;
  private spaceBackground!: Phaser.GameObjects.TileSprite;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { score: number }): void {
    this.finalScore = data.score;
  }
  
  preload(): void {
    // Savaş arka planını yükle
    this.load.image('battleground', '/images/savas.png');
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // SoundManager'ı al
    const menuScene = this.scene.get('MenuScene') as any;
    const soundManager = menuScene?.constructor.soundManager;
    
    if (soundManager) {
      this.settingsMenu = new SettingsMenu(this, soundManager, undefined, undefined);
    }

    // Leaderboard paneli oluştur ve skorları yenile
    const firebaseService = (this.game as any).firebaseService as FirebaseService;
    if (firebaseService) {
      this.leaderboardPanel = new LeaderboardPanel(firebaseService);
      
      // Skorun kaydedilmesi için kısa bir gecikme sonra fresh data yükle
      this.time.delayedCall(1000, () => {
        if (this.leaderboardPanel) {
          this.leaderboardPanel.forceUpdate();
        }
      });
    }

    // Savaş alanı arka planı - TileSprite ile scrolling efekti
    this.spaceBackground = this.add.tileSprite(0, 0, width, height, 'battleground');
    this.spaceBackground.setOrigin(0, 0);
    this.spaceBackground.setDepth(-1);
    this.spaceBackground.setAlpha(0.3);
    this.spaceBackground.setTint(0x8888aa); // Hafif mavi-gri ton

    // Oyun bitti başlığı - Retro stil
    const gameOverText = this.add.text(width / 2, height / 3, 'GAME OVER', {
      fontSize: '72px',
      color: '#ff0066',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setStroke('#440022', 6);

    // Skor
    const scoreText = this.add.text(width / 2, height / 2, `SCORE: ${this.finalScore}`, {
      fontSize: '36px',
      color: '#00ffff',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    });
    scoreText.setOrigin(0.5);
    scoreText.setStroke('#004444', 4);

    // Yeniden başla butonu
    const restartBtnBg = this.add.rectangle(width / 2, height / 1.6, 280, 60, 0x000000);
    restartBtnBg.setStrokeStyle(4, 0x00ff00);
    
    const restartButton = this.add.text(width / 2, height / 1.6, 'RESTART', {
      fontSize: '32px',
      color: '#00ff00',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    });
    restartButton.setOrigin(0.5);
    restartButton.setStroke('#004400', 4);

    restartBtnBg.setInteractive({ useHandCursor: true });

    restartBtnBg.on('pointerover', () => {
      restartBtnBg.setFillStyle(0x00ff00, 0.2);
      restartButton.setScale(1.1);
    });

    restartBtnBg.on('pointerout', () => {
      restartBtnBg.setFillStyle(0x000000);
      restartButton.setScale(1);
    });

    restartBtnBg.on('pointerdown', () => {
      restartBtnBg.setFillStyle(0x00ff00, 0.4);
      restartButton.setScale(0.95);
    });

    restartBtnBg.on('pointerup', () => {
      this.scene.start('GameScene');
    });

    // Ana menü butonu
    const menuBtnBg = this.add.rectangle(width / 2, height / 1.3, 280, 60, 0x000000);
    menuBtnBg.setStrokeStyle(4, 0xff6600);
    
    const menuButton = this.add.text(width / 2, height / 1.3, 'MAIN MENU', {
      fontSize: '32px',
      color: '#ff6600',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    });
    menuButton.setOrigin(0.5);
    menuButton.setStroke('#442200', 4);

    menuBtnBg.setInteractive({ useHandCursor: true });

    menuBtnBg.on('pointerover', () => {
      menuBtnBg.setFillStyle(0xff6600, 0.2);
      menuButton.setScale(1.1);
    });

    menuBtnBg.on('pointerout', () => {
      menuBtnBg.setFillStyle(0x000000);
      menuButton.setScale(1);
    });

    menuBtnBg.on('pointerdown', () => {
      menuBtnBg.setFillStyle(0xff6600, 0.4);
      menuButton.setScale(0.95);
    });

    menuBtnBg.on('pointerup', () => {
      this.scene.start('MenuScene');
    });

    // Yanıp sönen efekt
    this.tweens.add({
      targets: gameOverText,
      alpha: 0.7,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  
  update(): void {
    // Savaş arka planını hareket ettir
    this.spaceBackground.tilePositionY -= 0.3;
  }
}
