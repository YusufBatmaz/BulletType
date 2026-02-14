import Phaser from 'phaser';
import { FallingWord } from '../objects/FallingWord';
import { Plane } from '../objects/Plane';
import { ParticleEffects } from '../effects/ParticleEffects';
import { SoundManager } from '../audio/SoundManager';
import { GameConfig, getWordForLevel } from '../config/GameConfig';
import { SettingsMenu } from '../ui/SettingsMenu';
import { LeaderboardPanel } from '../ui/LeaderboardPanel';
import { PlaneSelector } from '../config/PlaneConfig';
import { FirebaseService } from '../services/FirebaseService';

export class GameScene extends Phaser.Scene {
  private plane!: Plane;
  private fallingWords: FallingWord[] = [];
  private score: number = 0;
  private level: number = 1;
  private lives: number = 3;
  private isPaused: boolean = false;
  
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private heartsContainer!: Phaser.GameObjects.Container;
  private pauseOverlay!: Phaser.GameObjects.Container;
  private settingsMenu!: SettingsMenu;
  private leaderboardPanel!: LeaderboardPanel;
  
  // Scrolling background için
  private spaceBackground!: Phaser.GameObjects.TileSprite;

  // Cheat code sistemi - Konami Code tarzı
  private cheatCodeSequence: string[] = [];
  private cheatCodeActive: boolean = false;
  private cheatCodeText!: Phaser.GameObjects.Text;
  private autoTypeInterval?: ReturnType<typeof setInterval>;
  
  // Gizli kod: Yukarı, Yukarı, Aşağı, Aşağı, Sol, Sağ, Sol, Sağ, B, A
  private readonly SECRET_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 
                                    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 
                                    'b', 'a'];
  
  private spawnTimer!: Phaser.Time.TimerEvent;
  private particleEffects!: ParticleEffects;
  private soundManager!: SoundManager;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload(): void {
    // Uçak görsellerini yükle
    this.load.image('classic', '/images/ucaklar/classic.png');
    this.load.image('bit-striker', '/images/ucaklar/Bit-Striker.png');
    this.load.image('sky-warden', '/images/ucaklar/Sky-Warden.png');
    this.load.image('nebula-ghost', '/images/ucaklar/Nebula-Ghost.png');
    this.load.image('apex-sentinel', '/images/ucaklar/Apex-Sentinel.png');
    this.load.image('stormbringer', '/images/ucaklar/Stormbringer.png');
    
    // Asteroid görselini yükle
    this.load.image('asteroid', '/images/asteroid.png');
    
    // Savaş arka planını yükle
    this.load.image('battleground', '/images/savas.png');
    
    // Parçacık için basit bir grafik oluştur
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('particle', 8, 8);
    graphics.destroy();
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Savaş alanı arka planı - TileSprite ile scrolling efekti
    this.spaceBackground = this.add.tileSprite(0, 0, width, height, 'battleground');
    this.spaceBackground.setOrigin(0, 0);
    this.spaceBackground.setDepth(-2);
    this.spaceBackground.setAlpha(0.4);
    this.spaceBackground.setTint(0x8888aa); // Hafif mavi-gri ton

    // Yıldızlar oluştur (ekstra derinlik için)
    this.createStars();

    // Oyun nesnelerini başlat
    this.particleEffects = new ParticleEffects(this);
    
    // MenuScene'den gelen SoundManager'ı kullan veya yeni oluştur
    const menuScene = this.scene.get('MenuScene') as any;
    if (menuScene && menuScene.constructor.soundManager) {
      this.soundManager = menuScene.constructor.soundManager;
    } else {
      this.soundManager = new SoundManager();
    }

    // Uçak
    const selectedTexture = PlaneSelector.getSelectedTexture();
    this.plane = new Plane(this, width / 2, height - 50, selectedTexture);

    // UI oluştur
    this.createUI();

    // Ayarlar menüsü oluştur
    this.settingsMenu = new SettingsMenu(
      this, 
      this.soundManager, 
      (isOpen) => {
        // Ayarlar açıldığında oyunu duraklat
        if (isOpen) {
          this.pauseGame();
        } else {
          this.resumeGame();
        }
      },
      (texture) => {
        // Uçak değiştirildiğinde
        this.plane.changeTexture(texture);
      }
    );

    // Leaderboard paneli oluştur
    const firebaseService = (this.game as any).firebaseService as FirebaseService;
    if (firebaseService) {
      this.leaderboardPanel = new LeaderboardPanel(firebaseService);
    }

    // Klavye girişi - önceki listener'ı temizle
    this.input.keyboard?.removeAllListeners();
    this.input.keyboard?.on('keydown', this.handleKeyPress, this);

    // Duraklatma overlay'i oluştur (başlangıçta gizli)
    this.createPauseOverlay();

    // Oyun durumunu sıfırla
    this.score = 0;
    this.level = 1;
    this.lives = GameConfig.initialLives;
    this.fallingWords = [];
    this.isPaused = false;
    
    this.updateUI();

    // Kelime spawn timer
    this.startSpawning();
  }

  private createPauseOverlay(): void {
    const { width, height } = this.cameras.main;

    this.pauseOverlay = this.add.container(0, 0);
    this.pauseOverlay.setDepth(2000);

    // Yarı saydam siyah arka plan
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
    this.pauseOverlay.add(bg);

    // PAUSED başlığı
    const pausedText = this.add.text(width / 2, height / 2 - 80, 'PAUSED', {
      fontSize: '72px',
      color: '#00ffff',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    });
    pausedText.setOrigin(0.5);
    pausedText.setStroke('#004444', 6);
    this.pauseOverlay.add(pausedText);

    // Talimatlar
    const instructionsText = this.add.text(width / 2, height / 2 + 20, 
      'ESC - Devam Et\nENTER - Ana Menü', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Courier New, monospace',
      align: 'center',
      lineSpacing: 10
    });
    instructionsText.setOrigin(0.5);
    this.pauseOverlay.add(instructionsText);

    // Neon parlama efekti
    this.tweens.add({
      targets: pausedText,
      alpha: 0.7,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Başlangıçta gizli
    this.pauseOverlay.setVisible(false);
  }

  private togglePause(): void {
    if (this.isPaused) {
      this.resumeGame();
      this.pauseOverlay.setVisible(false);
    } else {
      this.pauseGame();
      this.pauseOverlay.setVisible(true);
    }
  }

  private pauseGame(): void {
    this.isPaused = true;
    this.physics.pause();
    if (this.spawnTimer) {
      this.spawnTimer.paused = true;
    }
  }

  private resumeGame(): void {
    this.isPaused = false;
    this.physics.resume();
    if (this.spawnTimer) {
      this.spawnTimer.paused = false;
    }
  }

  shutdown(): void {
    // Sahne kapanırken temizlik yap
    if (this.spawnTimer) {
      this.spawnTimer.remove();
    }
    if (this.autoTypeInterval) {
      clearInterval(this.autoTypeInterval);
    }
    if (this.settingsMenu) {
      this.settingsMenu.destroy();
    }
    this.input.keyboard?.removeAllListeners();
    this.fallingWords.forEach(word => word.destroy());
    this.fallingWords = [];
  }

  private createStars(): void {
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, this.cameras.main.width);
      const y = Phaser.Math.Between(0, this.cameras.main.height);
      const star = this.add.circle(x, y, 1, 0xffffff, 0.6);
      
      this.tweens.add({
        targets: star,
        alpha: 0.2,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1
      });
    }
  }

  private createUI(): void {
    const { width, height } = this.cameras.main;

    // Retro arcade header arka planı (koyu, yarı saydam)
    const headerBg = this.add.rectangle(width / 2, 50, width, 100, 0x000000, 0.7);
    headerBg.setDepth(1000);

    // Üst ve alt neon çizgiler
    const topLine = this.add.rectangle(width / 2, 5, width, 3, 0x00ffff);
    topLine.setDepth(1001);
    
    const bottomLine = this.add.rectangle(width / 2, 95, width, 3, 0x00ffff);
    bottomLine.setDepth(1001);

    // Skor (Cyan neon renk)
    this.scoreText = this.add.text(150, 50, 'SCORE: 0', {
      fontSize: '28px',
      color: '#00ffff',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    });
    this.scoreText.setOrigin(0.5);
    this.scoreText.setDepth(1001);
    this.scoreText.setStroke('#004444', 4);

    // Seviye (Yeşil neon renk)
    this.levelText = this.add.text(width / 2, 50, 'LEVEL: 1', {
      fontSize: '28px',
      color: '#00ff00',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    });
    this.levelText.setOrigin(0.5);
    this.levelText.setDepth(1001);
    this.levelText.setStroke('#004400', 4);

    // Can etiketi
    this.livesText = this.add.text(width - 200, 50, 'LIVES:', {
      fontSize: '28px',
      color: '#ff0066',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    });
    this.livesText.setOrigin(0.5);
    this.livesText.setDepth(1001);
    this.livesText.setStroke('#440022', 4);

    // Kalpler için container
    this.heartsContainer = this.add.container(width - 80, 50);
    this.heartsContainer.setDepth(1001);
    this.updateHearts();

    // Neon parlama efekti
    this.tweens.add({
      targets: [topLine, bottomLine],
      alpha: 0.6,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Cheat code göstergesi (başlangıçta gizli)
    this.cheatCodeText = this.add.text(width / 2, height - 30, '', {
      fontSize: '20px',
      color: '#ffff00',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    });
    this.cheatCodeText.setOrigin(0.5);
    this.cheatCodeText.setDepth(1001);
    this.cheatCodeText.setStroke('#444400', 3);
    this.cheatCodeText.setVisible(false);
  }

  private updateHearts(): void {
    // Önceki kalpleri temizle
    this.heartsContainer.removeAll(true);

    // Maksimum 3 kalp göster
    const maxHearts = 3;
    const heartSpacing = 35;
    const startX = -(maxHearts - 1) * heartSpacing / 2;

    for (let i = 0; i < maxHearts; i++) {
      const heart = this.add.text(startX + i * heartSpacing, 0, '❤️', {
        fontSize: '32px'
      });
      heart.setOrigin(0.5);
      
      // Can kaybedildiyse kalbi soluk göster
      if (i >= this.lives) {
        heart.setAlpha(0.2);
        heart.setText('🖤');
      }
      
      this.heartsContainer.add(heart);
    }
  }

  private startSpawning(): void {
    const spawnInterval = Math.max(
      GameConfig.minSpawnInterval,
      GameConfig.baseSpawnInterval - (this.level * GameConfig.spawnIntervalDecrease)
    );

    this.spawnTimer = this.time.addEvent({
      delay: spawnInterval,
      callback: this.spawnWord,
      callbackScope: this,
      loop: true
    });
  }

  private spawnWord(): void {
    const word = getWordForLevel(this.level);
    const x = Phaser.Math.Between(150, this.cameras.main.width - 150);
    const speed = Math.min(
      GameConfig.maxFallSpeed,
      GameConfig.baseFallSpeed + (this.level * GameConfig.fallSpeedIncrease)
    );

    const fallingWord = new FallingWord(this, x, 100, word, speed);
    this.fallingWords.push(fallingWord);
  }

  private handleKeyPress(event: KeyboardEvent): void {
    // Duraklatma kontrolü (sadece ESC)
    if (event.key === 'Escape') {
      this.togglePause();
      return;
    }

    // Duraklama modundaysa
    if (this.isPaused) {
      // Enter ile ana menüye dön
      if (event.key === 'Enter') {
        this.returnToMenu();
      }
      return;
    }

    // Cheat code kontrolü (ok tuşları ve B, A harfleri)
    if (event.key.startsWith('Arrow') || event.key === 'b' || event.key === 'a' || 
        event.key === 'B' || event.key === 'A') {
      this.checkCheatCode(event.key);
    }

    // Auto-type aktifse normal yazma devre dışı
    if (this.cheatCodeActive) {
      return;
    }

    // Sadece harf girişlerini kabul et (Türkçe karakterler dahil)
    if (event.key.length === 1 && /[a-zçğıiöşü]/i.test(event.key)) {
      const typedChar = event.key.toLowerCase();
      this.processCharacter(typedChar);
    }
  }

  private checkCheatCode(key: string): void {
    // B ve A harflerini küçük harfe çevir
    const normalizedKey = (key === 'B' || key === 'A') ? key.toLowerCase() : key;
    
    // Diziye ekle
    this.cheatCodeSequence.push(normalizedKey);
    
    // Son 10 tuşu tut (kod uzunluğu)
    if (this.cheatCodeSequence.length > 10) {
      this.cheatCodeSequence.shift();
    }

    // Kodu kontrol et - her tuşta kontrol et
    if (this.cheatCodeSequence.length === 10) {
      const isMatch = this.cheatCodeSequence.every((key, index) => 
        key === this.SECRET_CODE[index]
      );

      if (isMatch) {
        this.activateCheatCode();
        this.cheatCodeSequence = []; // Sıfırla
      }
    }
  }

  private activateCheatCode(): void {
    if (this.cheatCodeActive) {
      // Zaten aktifse kapat
      this.deactivateCheatCode();
      return;
    }

    this.cheatCodeActive = true;
    
    // Başarı sesi (retro achievement)
    this.soundManager.playShoot();
    this.time.delayedCall(100, () => this.soundManager.playShoot());
    this.time.delayedCall(200, () => this.soundManager.playExplosion());
    
    this.cheatCodeText.setText('⚡ GOD MODE ACTIVATED ⚡');
    this.cheatCodeText.setVisible(true);

    // Yanıp sönen efekt
    this.tweens.add({
      targets: this.cheatCodeText,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 3 saniye sonra metni gizle ama mod aktif kalsın
    this.time.delayedCall(3000, () => {
      this.cheatCodeText.setText('⚡');
    });

    // Otomatik yazma başlat
    this.startAutoType();
  }

  private deactivateCheatCode(): void {
    this.cheatCodeActive = false;
    this.cheatCodeText.setVisible(false);
    this.tweens.killTweensOf(this.cheatCodeText);
    
    if (this.autoTypeInterval) {
      clearInterval(this.autoTypeInterval);
    }
  }

  private startAutoType(): void {
    // Her 100ms'de bir harf yaz
    this.autoTypeInterval = setInterval(() => {
      if (!this.cheatCodeActive || this.isPaused) {
        return;
      }

      // Aktif hedef varsa devam et
      let targetWord: FallingWord | null = null;
      
      for (const word of this.fallingWords) {
        if (word.getIsMatched() && word.word.length > 0) {
          targetWord = word;
          break;
        }
      }

      // Hedef yoksa yeni hedef bul
      if (!targetWord && this.fallingWords.length > 0) {
        // En yakın kelimeyi hedefle
        targetWord = this.fallingWords.reduce((closest, word) => {
          return word.y > closest.y ? word : closest;
        });
      }

      // Hedef varsa ilk harfi yaz
      if (targetWord && targetWord.word.length > 0) {
        const nextChar = targetWord.word[0];
        this.processCharacter(nextChar);
      }
    }, 100);
  }

  private cleanupAndExit(): void {
    // Timer'ları temizle
    if (this.spawnTimer) {
      this.spawnTimer.remove();
    }
    
    if (this.autoTypeInterval) {
      clearInterval(this.autoTypeInterval);
    }
    
    // Keyboard listener'ı temizle
    this.input.keyboard?.off('keydown', this.handleKeyPress, this);
    
    // Tüm kelimeleri temizle
    this.fallingWords.forEach(word => word.destroy());
    this.fallingWords = [];
    
    // Duraklatma durumunu sıfırla
    this.isPaused = false;
    this.cheatCodeActive = false;
  }

  private async returnToMenu(): Promise<void> {
    // Skoru kaydet (eğer kullanıcı giriş yaptıysa ve skor > 0)
    if (this.score > 0) {
      const firebaseService = (this.game as any).firebaseService as FirebaseService;
      if (firebaseService && firebaseService.isLoggedIn()) {
        try {
          await firebaseService.saveScore(this.score);
          console.log('Skor kaydedildi (menüye dönüş):', this.score);
        } catch (error) {
          console.error('Skor kaydetme hatası:', error);
        }
      }
    }
    
    // Temizlik yap
    this.cleanupAndExit();
    
    // Ana menüye dön
    this.scene.start('MenuScene');
  }

  private processCharacter(char: string): void {
    // Aktif hedef kelimeyi bul (eğer varsa devam et)
    let targetWord: FallingWord | null = null;
    
    // Mevcut hedefimiz var mı kontrol et
    for (const word of this.fallingWords) {
      if (word.getIsMatched() && word.word.length > 0) {
        targetWord = word;
        break;
      }
    }

    // Hedef varsa ve doğru harf mi kontrol et
    if (targetWord) {
      if (targetWord.word.startsWith(char)) {
        // Doğru harf - devam et
        targetWord.removeFirstLetter();
        this.addScore(GameConfig.pointsPerLetter);
        this.shootLetter(targetWord);
        targetWord.setMatched(true);
        
        if (targetWord.isComplete()) {
          this.completeWord(targetWord);
        }
        return; // İşlem tamamlandı, çık
      } else {
        // Yanlış harf - hedefi serbest bırak
        targetWord.setMatched(false);
        // Yeni kelime aramaya devam et (aşağıda)
      }
    }

    // Aktif hedef yoksa veya yanlış harf yazıldıysa, yeni hedef bul
    for (const word of this.fallingWords) {
      if (word.word.startsWith(char)) {
        // Yeni hedef bulundu
        word.removeFirstLetter();
        this.addScore(GameConfig.pointsPerLetter);
        this.shootLetter(word);
        word.setMatched(true);
        
        if (word.isComplete()) {
          this.completeWord(word);
        }
        return; // İşlem tamamlandı, çık
      }
    }
    
    // Hiçbir kelime eşleşmedi - hiçbir şey yapma
  }

  private shootLetter(target: FallingWord): void {
    this.soundManager.playShoot();
    this.plane.shoot();

    const startX = this.plane.x;
    const startY = this.plane.y;
    const endX = target.x;
    const endY = target.y;

    this.particleEffects.createMuzzleFlash(startX, startY);
    this.particleEffects.createBulletTrail(startX, startY, endX, endY);
  }

  private completeWord(target: FallingWord): void {
    const endX = target.x;
    const endY = target.y;

    this.time.delayedCall(100, () => {
      this.soundManager.playExplosion();
      this.particleEffects.createExplosion(endX, endY);
      
      const index = this.fallingWords.indexOf(target);
      if (index > -1) {
        this.fallingWords.splice(index, 1);
      }
      target.destroy();

      // Kelime tamamlama bonusu
      this.addScore(GameConfig.pointsPerWord);
    });
  }



  private addScore(points: number): void {
    this.score += points;

    if (this.score >= this.level * GameConfig.pointsForLevelUp) {
      this.level++;
      this.showLevelTransition();
      this.spawnTimer.remove();
      this.startSpawning();
    }

    this.updateUI();
  }

  private showLevelTransition(): void {
    const { width, height } = this.cameras.main;

    // Oyunu geçici olarak duraklat
    this.physics.pause();
    this.spawnTimer.paused = true;

    // Retro seviye geçiş yazısı
    const levelText = this.add.text(width / 2, height / 2, `LEVEL ${this.level}`, {
      fontSize: '96px',
      color: '#ffff00',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold',
      stroke: '#ff0000',
      strokeThickness: 8
    });
    levelText.setOrigin(0.5);
    levelText.setDepth(3000);
    levelText.setScale(0);

    // Zoom in animasyonu
    this.tweens.add({
      targets: levelText,
      scale: 1.2,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Daha uzun bekleme
        this.time.delayedCall(1200, () => {
          // Sağa kayma animasyonu
          this.tweens.add({
            targets: levelText,
            x: width + 200,
            alpha: 0,
            duration: 600,
            ease: 'Power2.easeIn',
            onComplete: () => {
              levelText.destroy();
              // Oyunu devam ettir
              this.physics.resume();
              this.spawnTimer.paused = false;
            }
          });
        });
      }
    });

    // Parlama efekti
    this.tweens.add({
      targets: levelText,
      alpha: 0.7,
      duration: 150,
      yoyo: true,
      repeat: 5,
      ease: 'Sine.easeInOut'
    });
  }

  private loseLife(): void {
    this.lives--;
    this.soundManager.playHit();
    this.updateUI();

    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  private updateUI(): void {
    this.scoreText.setText(`SCORE: ${this.score}`);
    this.levelText.setText(`LEVEL: ${this.level}`);
    this.updateHearts();
  }

  private async gameOver(): Promise<void> {
    // Skoru Firebase'e kaydet
    const firebaseService = (this.game as any).firebaseService as FirebaseService;
    if (firebaseService && firebaseService.isLoggedIn()) {
      try {
        await firebaseService.saveScore(this.score);
        console.log('Skor kaydedildi:', this.score);
      } catch (error) {
        console.error('Skor kaydetme hatası:', error);
      }
    }
    
    // Temizlik yap
    this.cleanupAndExit();
    
    // Game Over sahnesine geç
    this.scene.start('GameOverScene', { score: this.score });
  }

  update(_time: number, delta: number): void {
    // Duraklama modundaysa güncelleme yapma
    if (this.isPaused) {
      return;
    }

    // Savaş arka planını hareket ettir (aşağı doğru scroll)
    // Uçak yukarı doğru gidiyor gibi görünecek
    this.spaceBackground.tilePositionY -= 0.5;

    // Kelimeleri güncelle
    for (let i = this.fallingWords.length - 1; i >= 0; i--) {
      const word = this.fallingWords[i];
      word.update(delta);

      // Ekranın altına ulaştıysa
      if (word.y > this.cameras.main.height - 30) {
        this.fallingWords.splice(i, 1);
        word.destroy();
        this.loseLife();
      }
    }
  }
}
