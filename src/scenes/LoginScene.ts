import Phaser from 'phaser';
import { FirebaseService } from '../services/FirebaseService';

export class LoginScene extends Phaser.Scene {
  private firebaseService!: FirebaseService;
  private spaceBackground!: Phaser.GameObjects.TileSprite;
  private usernameInput!: HTMLInputElement;
  private passwordInput!: HTMLInputElement;

  constructor() {
    super({ key: 'LoginScene' });
  }

  preload(): void {
    // Savaş arka planını yükle
    this.load.image('battleground', '/images/savas.png');
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Firebase servisini başlat
    this.firebaseService = new FirebaseService();

    // Savaş alanı arka planı - TileSprite ile scrolling efekti
    this.spaceBackground = this.add.tileSprite(0, 0, width, height, 'battleground');
    this.spaceBackground.setOrigin(0, 0);
    this.spaceBackground.setDepth(-1);
    this.spaceBackground.setAlpha(0.3);
    this.spaceBackground.setTint(0x8888aa);

    // Ana panel arka planı
    const panelWidth = 500;
    const panelHeight = 550;
    const panelBg = this.add.rectangle(width / 2, height / 2, panelWidth, panelHeight, 0x000000, 0.9);
    panelBg.setStrokeStyle(4, 0x00ffff);

    // İç glow efekti için ikinci kenarlık
    const innerGlow = this.add.rectangle(width / 2, height / 2, panelWidth - 8, panelHeight - 8, 0x000000, 0);
    innerGlow.setStrokeStyle(2, 0x00ffff, 0.3);

    // Başlık
    const title = this.add.text(width / 2, height / 2 - 200, 'BULLETTYPE', {
      fontSize: '64px',
      color: '#00ffff',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    title.setStroke('#004444', 6);
    
    // Başlık altı çizgi
    const titleLine = this.add.rectangle(width / 2, height / 2 - 155, 400, 3, 0x00ffff);
    titleLine.setAlpha(0.6);

    // Bilgi metni
    const infoText = this.add.text(width / 2, height / 2 - 120, 
      'Skorunu kaydetmek için giriş yap', {
      fontSize: '16px',
      color: '#ffff00',
      fontFamily: 'Courier New, monospace',
      align: 'center'
    });
    infoText.setOrigin(0.5);

    // HTML input alanları oluştur
    this.createInputFields(width, height);

    // Giriş butonu
    this.createLoginButton(width, height);

    // Misafir olarak devam et butonu
    this.createGuestButton(width, height);

    // Animasyonlar
    this.tweens.add({
      targets: title,
      scale: 1.05,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Glow efekti
    this.tweens.add({
      targets: [panelBg],
      alpha: 0.95,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Çizgi animasyonu
    this.tweens.add({
      targets: titleLine,
      scaleX: 1.1,
      alpha: 0.8,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createInputFields(width: number, height: number): void {
    // Canvas'ın ekrandaki gerçek pozisyonunu al
    const canvas = this.game.canvas;
    const rect = canvas.getBoundingClientRect();
    
    const centerX = rect.left + (width / 2);
    const centerY = rect.top + (height / 2);

    // Kullanıcı adı label (solda)
    const usernameLabel = this.add.text(width / 2 - 180, height / 2 - 40, 'KULLANICI ADI', {
      fontSize: '14px',
      color: '#00ffff',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    });
    usernameLabel.setOrigin(0, 0.5);

    // Kullanıcı adı input (sağda)
    this.usernameInput = document.createElement('input');
    this.usernameInput.type = 'text';
    this.usernameInput.placeholder = 'Kullanıcı adını gir...';
    this.usernameInput.style.position = 'absolute';
    this.usernameInput.style.left = `${centerX - 50}px`;
    this.usernameInput.style.top = `${centerY - 52}px`;
    this.usernameInput.style.width = '230px';
    this.usernameInput.style.height = '45px';
    this.usernameInput.style.fontSize = '16px';
    this.usernameInput.style.padding = '10px 14px';
    this.usernameInput.style.border = '1px solid #00ffff';
    this.usernameInput.style.borderRadius = '6px';
    this.usernameInput.style.backgroundColor = 'rgba(0, 20, 40, 0.7)';
    this.usernameInput.style.color = '#00ffff';
    this.usernameInput.style.fontFamily = 'Courier New, monospace';
    this.usernameInput.style.outline = 'none';
    this.usernameInput.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.2)';
    this.usernameInput.style.transition = 'all 0.3s ease';
    this.usernameInput.style.zIndex = '1000';
    this.usernameInput.style.boxSizing = 'border-box';
    
    // Focus efekti
    this.usernameInput.addEventListener('focus', () => {
      this.usernameInput.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.5)';
      this.usernameInput.style.borderColor = '#00ffff';
      this.usernameInput.style.backgroundColor = 'rgba(0, 30, 50, 0.85)';
    });
    
    this.usernameInput.addEventListener('blur', () => {
      this.usernameInput.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.2)';
    });
    
    document.body.appendChild(this.usernameInput);

    // Şifre label (solda)
    const passwordLabel = this.add.text(width / 2 - 180, height / 2 + 25, 'ŞİFRE', {
      fontSize: '14px',
      color: '#00ffff',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    });
    passwordLabel.setOrigin(0, 0.5);

    // Şifre input (sağda)
    this.passwordInput = document.createElement('input');
    this.passwordInput.type = 'password';
    this.passwordInput.placeholder = 'Şifreni gir (min. 6 karakter)...';
    this.passwordInput.style.position = 'absolute';
    this.passwordInput.style.left = `${centerX - 50}px`;
    this.passwordInput.style.top = `${centerY + 13}px`;
    this.passwordInput.style.width = '230px';
    this.passwordInput.style.height = '45px';
    this.passwordInput.style.fontSize = '16px';
    this.passwordInput.style.padding = '10px 14px';
    this.passwordInput.style.border = '1px solid #00ffff';
    this.passwordInput.style.borderRadius = '6px';
    this.passwordInput.style.backgroundColor = 'rgba(0, 20, 40, 0.7)';
    this.passwordInput.style.color = '#00ffff';
    this.passwordInput.style.fontFamily = 'Courier New, monospace';
    this.passwordInput.style.outline = 'none';
    this.passwordInput.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.2)';
    this.passwordInput.style.transition = 'all 0.3s ease';
    this.passwordInput.style.zIndex = '1000';
    this.passwordInput.style.boxSizing = 'border-box';
    
    // Focus efekti
    this.passwordInput.addEventListener('focus', () => {
      this.passwordInput.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.5)';
      this.passwordInput.style.borderColor = '#00ffff';
      this.passwordInput.style.backgroundColor = 'rgba(0, 30, 50, 0.85)';
    });
    
    this.passwordInput.addEventListener('blur', () => {
      this.passwordInput.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.2)';
    });
    
    document.body.appendChild(this.passwordInput);

    // Enter tuşu ile giriş
    this.passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleLogin();
      }
    });
  }

  private createLoginButton(width: number, height: number): void {
    const buttonY = height / 2 + 100;

    const buttonBg = this.add.rectangle(width / 2, buttonY, 360, 55, 0x00ff00, 0.1);
    buttonBg.setStrokeStyle(3, 0x00ff00);
    buttonBg.setInteractive({ useHandCursor: true });

    const buttonText = this.add.text(width / 2, buttonY, 'GİRİŞ YAP / KAYIT OL', {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);
    buttonText.setStroke('#004400', 3);

    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(0x00ff00, 0.3);
      buttonBg.setScale(1.02);
      buttonText.setScale(1.05);
      
      this.tweens.add({
        targets: buttonBg,
        alpha: 0.8,
        duration: 200,
        yoyo: true,
        repeat: 0
      });
    });

    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(0x00ff00, 0.1);
      buttonBg.setScale(1);
      buttonText.setScale(1);
    });

    buttonBg.on('pointerdown', () => {
      buttonBg.setScale(0.98);
      this.handleLogin();
    });
    
    buttonBg.on('pointerup', () => {
      buttonBg.setScale(1);
    });
  }

  private createGuestButton(width: number, height: number): void {
    const buttonY = height / 2 + 170;

    const buttonBg = this.add.rectangle(width / 2, buttonY, 360, 50, 0xff6600, 0.05);
    buttonBg.setStrokeStyle(2, 0xff6600, 0.6);
    buttonBg.setInteractive({ useHandCursor: true });

    const buttonText = this.add.text(width / 2, buttonY, 'MİSAFİR OLARAK DEVAM ET', {
      fontSize: '18px',
      color: '#ff6600',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);
    buttonText.setStroke('#442200', 2);

    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(0xff6600, 0.2);
      buttonBg.setScale(1.02);
      buttonText.setScale(1.05);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(0xff6600, 0.05);
      buttonBg.setScale(1);
      buttonText.setScale(1);
    });

    buttonBg.on('pointerdown', () => {
      buttonBg.setScale(0.98);
      this.handleGuestLogin();
    });
    
    buttonBg.on('pointerup', () => {
      buttonBg.setScale(1);
    });
    
    // Küçük bilgi metni
    const guestInfo = this.add.text(width / 2, buttonY + 40, 
      '(Skorun kaydedilmeyecek)', {
      fontSize: '12px',
      color: '#888888',
      fontFamily: 'Courier New, monospace',
      align: 'center'
    });
    guestInfo.setOrigin(0.5);
  }

  private async handleLogin(): Promise<void> {
    const username = this.usernameInput.value.trim();
    const password = this.passwordInput.value.trim();

    if (!username || !password) {
      alert('Lütfen kullanıcı adı ve şifre girin!');
      return;
    }

    if (password.length < 6) {
      alert('Şifre en az 6 karakter olmalıdır!');
      return;
    }

    try {
      // Kayıt ol / Giriş yap
      await this.firebaseService.signUpWithCredentials(username, '', password);
      this.cleanupAndStart();
    } catch (error: any) {
      console.error('Giriş hatası:', error);
      alert('Giriş yapılamadı. Lütfen tekrar deneyin.');
    }
  }

  private async handleGuestLogin(): Promise<void> {
    try {
      await this.firebaseService.signInAnonymously();
      this.cleanupAndStart();
    } catch (error) {
      console.error('Misafir girişi hatası:', error);
      alert('Giriş yapılamadı. Lütfen tekrar deneyin.');
    }
  }

  private cleanupAndStart(): void {
    // Input alanlarını temizle
    if (this.usernameInput) {
      document.body.removeChild(this.usernameInput);
    }
    if (this.passwordInput) {
      document.body.removeChild(this.passwordInput);
    }

    // Firebase servisini global olarak sakla
    (this.game as any).firebaseService = this.firebaseService;

    // MenuScene'e geç
    this.scene.start('MenuScene');
  }

  update(): void {
    // Savaş arka planını hareket ettir
    this.spaceBackground.tilePositionY -= 0.3;
  }

  shutdown(): void {
    // Input alanlarını temizle
    if (this.usernameInput && document.body.contains(this.usernameInput)) {
      document.body.removeChild(this.usernameInput);
    }
    if (this.passwordInput && document.body.contains(this.passwordInput)) {
      document.body.removeChild(this.passwordInput);
    }
  }
}
