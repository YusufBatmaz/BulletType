import Phaser from 'phaser';
import { SoundManager } from '../audio/SoundManager';

export class SettingsMenu {
  private scene: Phaser.Scene;
  private soundManager: SoundManager;
  private container!: Phaser.GameObjects.Container;
  private isOpen: boolean = false;
  private settingsButton!: Phaser.GameObjects.Container;
  private onToggle?: (isOpen: boolean) => void;

  constructor(scene: Phaser.Scene, soundManager: SoundManager, onToggle?: (isOpen: boolean) => void) {
    this.scene = scene;
    this.soundManager = soundManager;
    this.onToggle = onToggle;
    this.createSettingsButton();
    this.createSettingsPanel();
  }

  private createSettingsButton(): void {
    const buttonSize = 40;
    const margin = 15;

    this.settingsButton = this.scene.add.container(margin + buttonSize / 2, margin + buttonSize / 2);
    this.settingsButton.setDepth(2000);

    // Arka plan
    const bg = this.scene.add.circle(0, 0, buttonSize / 2, 0x000000, 0.7);
    bg.setStrokeStyle(2, 0x00ffff);
    this.settingsButton.add(bg);

    // Ayarlar ikonu (dişli çark)
    const icon = this.scene.add.text(0, 0, '⚙️', {
      fontSize: '24px'
    });
    icon.setOrigin(0.5);
    this.settingsButton.add(icon);

    // İnteraktif yap
    bg.setInteractive({ useHandCursor: true });

    bg.on('pointerover', () => {
      bg.setFillStyle(0x00ffff, 0.2);
      this.settingsButton.setScale(1.1);
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(0x000000, 0.7);
      this.settingsButton.setScale(1);
    });

    bg.on('pointerdown', () => {
      this.toggleSettings();
    });

    // Animasyon
    this.scene.tweens.add({
      targets: icon,
      angle: 360,
      duration: 3000,
      repeat: -1,
      ease: 'Linear'
    });
  }

  private createSettingsPanel(): void {
    const { width, height } = this.scene.cameras.main;

    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(1999);
    this.container.setVisible(false);

    // Yarı saydam arka plan (tüm ekran)
    const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
    overlay.setInteractive();
    this.container.add(overlay);

    // Panel arka planı
    const panelWidth = 400;
    const panelHeight = 370;
    const panelBg = this.scene.add.rectangle(width / 2, height / 2, panelWidth, panelHeight, 0x000000, 0.95);
    panelBg.setStrokeStyle(4, 0x00ffff);
    this.container.add(panelBg);

    // Başlık
    const title = this.scene.add.text(width / 2, height / 2 - 150, 'SETTINGS', {
      fontSize: '36px',
      color: '#00ffff',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    title.setStroke('#004444', 4);
    this.container.add(title);

    // Müzik kontrolü
    this.createMusicControl(width / 2, height / 2 - 80);

    // Efekt sesleri kontrolü
    this.createEffectsControl(width / 2, height / 2 + 20);

    // Kapat butonu
    this.createCloseButton(width / 2, height / 2 + 130);
  }

  private createMusicControl(x: number, y: number): void {
    // Müzik etiketi
    const label = this.scene.add.text(x - 150, y, 'MUSIC', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    });
    label.setOrigin(0, 0.5);
    this.container.add(label);

    // Skip butonu (müzik atlama)
    const skipBtn = this.scene.add.rectangle(x + 60, y, 60, 40, 0x000000);
    skipBtn.setStrokeStyle(2, 0xffff00);
    skipBtn.setInteractive({ useHandCursor: true });
    this.container.add(skipBtn);

    const skipBtnText = this.scene.add.text(x + 60, y, '⏭️', {
      fontSize: '24px'
    });
    skipBtnText.setOrigin(0.5);
    this.container.add(skipBtnText);

    skipBtn.on('pointerover', () => {
      skipBtn.setFillStyle(0xffff00, 0.2);
      skipBtnText.setScale(1.1);
    });

    skipBtn.on('pointerout', () => {
      skipBtn.setFillStyle(0x000000);
      skipBtnText.setScale(1);
    });

    skipBtn.on('pointerdown', () => {
      this.soundManager.skipToNextTrack();
      // Kısa animasyon
      this.scene.tweens.add({
        targets: skipBtnText,
        angle: 360,
        duration: 300,
        ease: 'Back.easeOut'
      });
    });

    // Mute butonu
    const muteBtn = this.scene.add.rectangle(x + 130, y, 60, 40, 0x000000);
    muteBtn.setStrokeStyle(2, 0xff6600);
    muteBtn.setInteractive({ useHandCursor: true });
    this.container.add(muteBtn);

    const muteBtnText = this.scene.add.text(x + 130, y, '🔊', {
      fontSize: '24px'
    });
    muteBtnText.setOrigin(0.5);
    this.container.add(muteBtnText);

    muteBtn.on('pointerover', () => {
      muteBtn.setFillStyle(0xff6600, 0.2);
    });

    muteBtn.on('pointerout', () => {
      muteBtn.setFillStyle(0x000000);
    });

    muteBtn.on('pointerdown', () => {
      const isMuted = this.soundManager.toggleMusicMute();
      muteBtnText.setText(isMuted ? '🔇' : '🔊');
    });

    // Slider arka planı
    const sliderBg = this.scene.add.rectangle(x, y + 40, 200, 8, 0x444444);
    this.container.add(sliderBg);

    // Slider dolgu
    const sliderFill = this.scene.add.rectangle(x - 100, y + 40, 200, 8, 0x00ffff);
    sliderFill.setOrigin(0, 0.5);
    this.container.add(sliderFill);

    // Slider handle
    const handle = this.scene.add.circle(x + 100, y + 40, 12, 0x00ffff);
    handle.setStrokeStyle(2, 0xffffff);
    handle.setInteractive({ useHandCursor: true, draggable: true });
    this.container.add(handle);

    // Drag işlemi
    this.scene.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number) => {
      if (gameObject === handle) {
        const minX = x - 100;
        const maxX = x + 100;
        const clampedX = Phaser.Math.Clamp(dragX, minX, maxX);
        handle.x = clampedX;
        
        const volume = (clampedX - minX) / (maxX - minX);
        sliderFill.width = 200 * volume;
        this.soundManager.setMusicVolume(volume);
      }
    });

    // Başlangıç pozisyonu
    const initialVolume = this.soundManager.getMusicVolume();
    handle.x = x - 100 + (200 * initialVolume);
    sliderFill.width = 200 * initialVolume;
    muteBtnText.setText(this.soundManager.isMusicMutedState() ? '🔇' : '🔊');
  }

  private createEffectsControl(x: number, y: number): void {
    // Efekt sesleri etiketi
    const label = this.scene.add.text(x - 150, y, 'EFFECTS', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    });
    label.setOrigin(0, 0.5);
    this.container.add(label);

    // Mute butonu
    const muteBtn = this.scene.add.rectangle(x + 120, y, 60, 40, 0x000000);
    muteBtn.setStrokeStyle(2, 0xff6600);
    muteBtn.setInteractive({ useHandCursor: true });
    this.container.add(muteBtn);

    const muteBtnText = this.scene.add.text(x + 120, y, '🔊', {
      fontSize: '24px'
    });
    muteBtnText.setOrigin(0.5);
    this.container.add(muteBtnText);

    muteBtn.on('pointerover', () => {
      muteBtn.setFillStyle(0xff6600, 0.2);
    });

    muteBtn.on('pointerout', () => {
      muteBtn.setFillStyle(0x000000);
    });

    muteBtn.on('pointerdown', () => {
      const isMuted = this.soundManager.toggleEffectsMute();
      muteBtnText.setText(isMuted ? '🔇' : '🔊');
    });

    // Slider arka planı
    const sliderBg = this.scene.add.rectangle(x, y + 40, 200, 8, 0x444444);
    this.container.add(sliderBg);

    // Slider dolgu
    const sliderFill = this.scene.add.rectangle(x - 100, y + 40, 200, 8, 0x00ff00);
    sliderFill.setOrigin(0, 0.5);
    this.container.add(sliderFill);

    // Slider handle
    const handle = this.scene.add.circle(x + 100, y + 40, 12, 0x00ff00);
    handle.setStrokeStyle(2, 0xffffff);
    handle.setInteractive({ useHandCursor: true, draggable: true });
    this.container.add(handle);

    // Drag işlemi
    this.scene.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number) => {
      if (gameObject === handle) {
        const minX = x - 100;
        const maxX = x + 100;
        const clampedX = Phaser.Math.Clamp(dragX, minX, maxX);
        handle.x = clampedX;
        
        const volume = (clampedX - minX) / (maxX - minX);
        sliderFill.width = 200 * volume;
        this.soundManager.setEffectsVolume(volume);
      }
    });

    // Başlangıç pozisyonu
    const initialVolume = this.soundManager.getEffectsVolume();
    handle.x = x - 100 + (200 * initialVolume);
    sliderFill.width = 200 * initialVolume;
    muteBtnText.setText(this.soundManager.areEffectsMutedState() ? '🔇' : '🔊');
  }

  private createCloseButton(x: number, y: number): void {
    const buttonBg = this.scene.add.rectangle(x, y, 200, 50, 0x000000);
    buttonBg.setStrokeStyle(3, 0xff0066);
    buttonBg.setInteractive({ useHandCursor: true });
    this.container.add(buttonBg);

    const buttonText = this.scene.add.text(x, y, 'CLOSE', {
      fontSize: '28px',
      color: '#ff0066',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);
    buttonText.setStroke('#440022', 3);
    this.container.add(buttonText);

    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(0xff0066, 0.2);
      buttonText.setScale(1.05);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(0x000000);
      buttonText.setScale(1);
    });

    buttonBg.on('pointerdown', () => {
      this.toggleSettings();
    });
  }

  private toggleSettings(): void {
    this.isOpen = !this.isOpen;
    this.container.setVisible(this.isOpen);
    
    // Callback'i çağır (oyunu duraklat/devam ettir)
    if (this.onToggle) {
      this.onToggle(this.isOpen);
    }
  }

  public destroy(): void {
    this.settingsButton.destroy();
    this.container.destroy();
  }
}
