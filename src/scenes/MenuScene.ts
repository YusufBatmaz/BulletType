import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  preload(): void {
    // Uçak görselini yükle
    this.load.image('plane', '/images/ucak.png');
    
    // Savaş arka planını yükle (menü için)
    this.load.image('battleground', '/images/savas.png');
  }

  create(): void {
    const { width, height } = this.cameras.main;

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
    const plane = this.add.image(width / 2, height / 2, 'plane');
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
}
