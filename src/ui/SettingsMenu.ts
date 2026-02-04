import Phaser from 'phaser';
import { SoundManager } from '../audio/SoundManager';
import { planeOptions, PlaneSelector } from '../config/PlaneConfig';

import { FirebaseService } from '../services/FirebaseService';

export class SettingsMenu {
  private scene: Phaser.Scene;
  private soundManager: SoundManager;
  private container!: Phaser.GameObjects.Container;
  private isOpen: boolean = false;
  private settingsButton!: Phaser.GameObjects.Container;
  private onToggle?: (isOpen: boolean) => void;
  private onPlaneChange?: (texture: string) => void;

  constructor(
    scene: Phaser.Scene, 
    soundManager: SoundManager, 
    onToggle?: (isOpen: boolean) => void,
    onPlaneChange?: (texture: string) => void
  ) {
    this.scene = scene;
    this.soundManager = soundManager;
    this.onToggle = onToggle;
    this.onPlaneChange = onPlaneChange;
    this.createSettingsButton();
    this.createSettingsPanel();
  }

  private createPlaneSelector(x: number, y: number): void {
    // Uçak seçimi etiketi
    const label = this.scene.add.text(x, y - 60, 'UÇAK', {
      fontSize: '28px',
      color: '#00ffff',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    });
    label.setOrigin(0.5);
    label.setStroke('#004444', 3);
    this.container.add(label);

    const selectedPlaneId = PlaneSelector.getSelectedPlane();
    const cols = 3;
    const spacing = 100;
    const rowSpacing = 110;

    planeOptions.forEach((plane, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const planeX = x - spacing + (col * spacing);
      const planeY = y + (row * rowSpacing);
      const isSelected = plane.id === selectedPlaneId;

      // Uçak önizleme kutusu
      const box = this.scene.add.rectangle(planeX, planeY, 80, 80, 0x000000, 0.8);
      box.setStrokeStyle(3, isSelected ? 0x00ff00 : 0x333333);
      box.setInteractive({ useHandCursor: true });
      this.container.add(box);

      // Uçak görseli
      if (this.scene.textures.exists(plane.texture)) {
        const planeDisplay = this.scene.add.image(planeX, planeY, plane.texture);
        planeDisplay.setScale(0.09);
        this.container.add(planeDisplay);
      }

      // İsim (her uçak için göster)
      const nameText = this.scene.add.text(planeX, planeY + 50, plane.name, {
        fontSize: '11px',
        color: isSelected ? '#00ff00' : '#666666',
        fontFamily: 'Courier New, monospace',
        fontStyle: isSelected ? 'bold' : 'normal'
      });
      nameText.setOrigin(0.5);
      if (isSelected) {
        nameText.setStroke('#004400', 2);
      }
      this.container.add(nameText);

      // Hover efekti
      box.on('pointerover', () => {
        if (!isSelected) {
          box.setStrokeStyle(3, 0x00ffff);
          box.setScale(1.05);
        }
      });

      box.on('pointerout', () => {
        if (!isSelected) {
          box.setStrokeStyle(3, 0x333333);
          box.setScale(1);
        }
      });

      box.on('pointerdown', () => {
        PlaneSelector.setSelectedPlane(plane.id);
        
        if (this.onPlaneChange) {
          this.onPlaneChange(plane.texture);
        }
        
        const wasOpen = this.isOpen;
        this.container.destroy();
        this.createSettingsPanel();
        
        if (wasOpen) {
          this.container.setVisible(true);
        }
      });
    });
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
    const panelWidth = 450;
    const panelHeight = 520;
    const panelBg = this.scene.add.rectangle(width / 2, height / 2, panelWidth, panelHeight, 0x000000, 0.95);
    panelBg.setStrokeStyle(4, 0x00ffff);
    this.container.add(panelBg);

    // Başlık
    const title = this.scene.add.text(width / 2, height / 2 - 220, 'AYARLAR', {
      fontSize: '36px',
      color: '#00ffff',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    title.setStroke('#004444', 4);
    this.container.add(title);

    // Uçak seçimi
    this.createPlaneSelector(width / 2, height / 2 - 125);

    // Müzik kontrolü (daha aşağıda)
    this.createMusicControl(width / 2, height / 2 + 75);

    // Efekt sesleri kontrolü
    this.createEffectsControl(width / 2, height / 2 + 125);

    // Alt butonlar (yan yana)
    this.createBottomButtons(width / 2, height / 2 + 200);
  }

  private createMusicControl(x: number, y: number): void {
    // Müzik etiketi (sola)
    const label = this.scene.add.text(x - 190, y, 'MÜZİK', {
      fontSize: '20px',
      color: '#00ffff',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    });
    label.setOrigin(0, 0.5);
    label.setStroke('#004444', 2);
    this.container.add(label);

    // Slider arka planı (ortada, daha kısa)
    const sliderBg = this.scene.add.rectangle(x, y, 140, 8, 0x333333);
    this.container.add(sliderBg);

    // Slider dolgu
    const sliderFill = this.scene.add.rectangle(x - 70, y, 140, 8, 0x00ffff);
    sliderFill.setOrigin(0, 0.5);
    this.container.add(sliderFill);

    // Slider handle
    const handle = this.scene.add.circle(x + 70, y, 12, 0x00ffff);
    handle.setStrokeStyle(2, 0xffffff);
    handle.setInteractive({ useHandCursor: true, draggable: true });
    this.container.add(handle);

    // Previous butonu
    const prevBtn = this.scene.add.rectangle(x + 110, y, 35, 35, 0x000000, 0.8);
    prevBtn.setStrokeStyle(2, 0xffff00);
    prevBtn.setInteractive({ useHandCursor: true });
    this.container.add(prevBtn);

    const prevBtnText = this.scene.add.text(x + 110, y, '⏮️', {
      fontSize: '20px'
    });
    prevBtnText.setOrigin(0.5);
    this.container.add(prevBtnText);

    // Next butonu
    const nextBtn = this.scene.add.rectangle(x + 150, y, 35, 35, 0x000000, 0.8);
    nextBtn.setStrokeStyle(2, 0xffff00);
    nextBtn.setInteractive({ useHandCursor: true });
    this.container.add(nextBtn);

    const nextBtnText = this.scene.add.text(x + 150, y, '⏭️', {
      fontSize: '20px'
    });
    nextBtnText.setOrigin(0.5);
    this.container.add(nextBtnText);

    // Mute butonu
    const muteBtn = this.scene.add.rectangle(x + 190, y, 35, 35, 0x000000, 0.8);
    muteBtn.setStrokeStyle(2, 0xff6600);
    muteBtn.setInteractive({ useHandCursor: true });
    this.container.add(muteBtn);

    const muteBtnText = this.scene.add.text(x + 190, y, '🔊', {
      fontSize: '20px'
    });
    muteBtnText.setOrigin(0.5);
    this.container.add(muteBtnText);

    // Previous hover
    prevBtn.on('pointerover', () => {
      prevBtn.setFillStyle(0xffff00, 0.3);
    });
    prevBtn.on('pointerout', () => {
      prevBtn.setFillStyle(0x000000, 0.8);
    });
    prevBtn.on('pointerdown', () => {
      this.soundManager.skipToPreviousTrack();
      this.scene.tweens.add({
        targets: prevBtnText,
        angle: -360,
        duration: 300,
        ease: 'Back.easeOut'
      });
    });

    // Next hover
    nextBtn.on('pointerover', () => {
      nextBtn.setFillStyle(0xffff00, 0.3);
    });
    nextBtn.on('pointerout', () => {
      nextBtn.setFillStyle(0x000000, 0.8);
    });
    nextBtn.on('pointerdown', () => {
      this.soundManager.skipToNextTrack();
      this.scene.tweens.add({
        targets: nextBtnText,
        angle: 360,
        duration: 300,
        ease: 'Back.easeOut'
      });
    });

    // Mute hover
    muteBtn.on('pointerover', () => {
      muteBtn.setFillStyle(0xff6600, 0.3);
    });
    muteBtn.on('pointerout', () => {
      muteBtn.setFillStyle(0x000000, 0.8);
    });
    muteBtn.on('pointerdown', () => {
      const isMuted = this.soundManager.toggleMusicMute();
      muteBtnText.setText(isMuted ? '🔇' : '🔊');
    });

    // Drag işlemi
    this.scene.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number) => {
      if (gameObject === handle) {
        const minX = x - 70;
        const maxX = x + 70;
        const clampedX = Phaser.Math.Clamp(dragX, minX, maxX);
        handle.x = clampedX;
        
        const volume = (clampedX - minX) / (maxX - minX);
        sliderFill.width = 140 * volume;
        this.soundManager.setMusicVolume(volume);
      }
    });

    // Başlangıç pozisyonu
    const initialVolume = this.soundManager.getMusicVolume();
    handle.x = x - 70 + (140 * initialVolume);
    sliderFill.width = 140 * initialVolume;
    muteBtnText.setText(this.soundManager.isMusicMutedState() ? '🔇' : '🔊');
  }

  private createEffectsControl(x: number, y: number): void {
    // Efekt sesleri etiketi (sola)
    const label = this.scene.add.text(x - 190, y, 'EFEKTLER', {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    });
    label.setOrigin(0, 0.5);
    label.setStroke('#004400', 2);
    this.container.add(label);

    // Slider arka planı (ortada, daha kısa)
    const sliderBg = this.scene.add.rectangle(x, y, 140, 8, 0x333333);
    this.container.add(sliderBg);

    // Slider dolgu
    const sliderFill = this.scene.add.rectangle(x - 70, y, 140, 8, 0x00ff00);
    sliderFill.setOrigin(0, 0.5);
    this.container.add(sliderFill);

    // Slider handle
    const handle = this.scene.add.circle(x + 70, y, 12, 0x00ff00);
    handle.setStrokeStyle(2, 0xffffff);
    handle.setInteractive({ useHandCursor: true, draggable: true });
    this.container.add(handle);

    // Mute butonu (sağda)
    const muteBtn = this.scene.add.rectangle(x + 130, y, 35, 35, 0x000000, 0.8);
    muteBtn.setStrokeStyle(2, 0xff6600);
    muteBtn.setInteractive({ useHandCursor: true });
    this.container.add(muteBtn);

    const muteBtnText = this.scene.add.text(x + 130, y, '🔊', {
      fontSize: '20px'
    });
    muteBtnText.setOrigin(0.5);
    this.container.add(muteBtnText);

    // Mute hover
    muteBtn.on('pointerover', () => {
      muteBtn.setFillStyle(0xff6600, 0.3);
    });
    muteBtn.on('pointerout', () => {
      muteBtn.setFillStyle(0x000000, 0.8);
    });
    muteBtn.on('pointerdown', () => {
      const isMuted = this.soundManager.toggleEffectsMute();
      muteBtnText.setText(isMuted ? '🔇' : '🔊');
    });

    // Drag işlemi
    this.scene.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number) => {
      if (gameObject === handle) {
        const minX = x - 70;
        const maxX = x + 70;
        const clampedX = Phaser.Math.Clamp(dragX, minX, maxX);
        handle.x = clampedX;
        
        const volume = (clampedX - minX) / (maxX - minX);
        sliderFill.width = 140 * volume;
        this.soundManager.setEffectsVolume(volume);
      }
    });

    // Başlangıç pozisyonu
    const initialVolume = this.soundManager.getEffectsVolume();
    handle.x = x - 70 + (140 * initialVolume);
    sliderFill.width = 140 * initialVolume;
    muteBtnText.setText(this.soundManager.areEffectsMutedState() ? '🔇' : '🔊');
  }

  private createBottomButtons(x: number, y: number): void {
    // FirebaseService'i al
    const firebaseService = (this.scene.game as any).firebaseService;
    const isLoggedIn = firebaseService && firebaseService.isLoggedIn();

    if (isLoggedIn) {
      // Çıkış yap butonu (sol)
      const logoutBg = this.scene.add.rectangle(x - 110, y, 180, 50, 0x000000);
      logoutBg.setStrokeStyle(3, 0xffff00);
      logoutBg.setInteractive({ useHandCursor: true });
      this.container.add(logoutBg);

      const logoutText = this.scene.add.text(x - 110, y, 'ÇIKIŞ YAP', {
        fontSize: '22px',
        color: '#ffff00',
        fontFamily: 'Courier New, monospace',
        fontStyle: 'bold'
      });
      logoutText.setOrigin(0.5);
      logoutText.setStroke('#444400', 2);
      this.container.add(logoutText);

      logoutBg.on('pointerover', () => {
        logoutBg.setFillStyle(0xffff00, 0.2);
        logoutText.setScale(1.05);
      });

      logoutBg.on('pointerout', () => {
        logoutBg.setFillStyle(0x000000);
        logoutText.setScale(1);
      });

      logoutBg.on('pointerdown', async () => {
        try {
          await firebaseService.signOut();
          
          // Başarı mesajı göster
          const successText = this.scene.add.text(x, y - 40, '✓ Çıkış yapıldı', {
            fontSize: '16px',
            color: '#00ff00',
            fontFamily: 'Courier New, monospace'
          });
          successText.setOrigin(0.5);
          this.container.add(successText);

          // 1 saniye sonra login ekranına dön
          this.scene.time.delayedCall(1000, () => {
            this.scene.scene.start('LoginScene');
          });
        } catch (error) {
          console.error('Çıkış hatası:', error);
          
          // Hata mesajı göster
          const errorText = this.scene.add.text(x, y - 40, '✗ Çıkış yapılamadı', {
            fontSize: '16px',
            color: '#ff0000',
            fontFamily: 'Courier New, monospace'
          });
          errorText.setOrigin(0.5);
          this.container.add(errorText);

          // 2 saniye sonra mesajı kaldır
          this.scene.time.delayedCall(2000, () => {
            errorText.destroy();
          });
        }
      });

      // Close butonu (sağ)
      const closeBg = this.scene.add.rectangle(x + 110, y, 180, 50, 0x000000);
      closeBg.setStrokeStyle(3, 0xff0066);
      closeBg.setInteractive({ useHandCursor: true });
      this.container.add(closeBg);

      const closeText = this.scene.add.text(x + 110, y, 'KAPAT', {
        fontSize: '28px',
        color: '#ff0066',
        fontFamily: 'Courier New, monospace',
        fontStyle: 'bold'
      });
      closeText.setOrigin(0.5);
      closeText.setStroke('#440022', 3);
      this.container.add(closeText);

      closeBg.on('pointerover', () => {
        closeBg.setFillStyle(0xff0066, 0.2);
        closeText.setScale(1.05);
      });

      closeBg.on('pointerout', () => {
        closeBg.setFillStyle(0x000000);
        closeText.setScale(1);
      });

      closeBg.on('pointerdown', () => {
        this.toggleSettings();
      });
    } else {
      // Sadece Close butonu (ortada, geniş)
      const closeBg = this.scene.add.rectangle(x, y, 200, 50, 0x000000);
      closeBg.setStrokeStyle(3, 0xff0066);
      closeBg.setInteractive({ useHandCursor: true });
      this.container.add(closeBg);

      const closeText = this.scene.add.text(x, y, 'KAPAT', {
        fontSize: '28px',
        color: '#ff0066',
        fontFamily: 'Courier New, monospace',
        fontStyle: 'bold'
      });
      closeText.setOrigin(0.5);
      closeText.setStroke('#440022', 3);
      this.container.add(closeText);

      closeBg.on('pointerover', () => {
        closeBg.setFillStyle(0xff0066, 0.2);
        closeText.setScale(1.05);
      });

      closeBg.on('pointerout', () => {
        closeBg.setFillStyle(0x000000);
        closeText.setScale(1);
      });

      closeBg.on('pointerdown', () => {
        this.toggleSettings();
      });
    }
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
