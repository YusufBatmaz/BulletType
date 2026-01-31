import Phaser from 'phaser';

export class FallingWord extends Phaser.GameObjects.Container {
  private wordText: Phaser.GameObjects.Text;
  private asteroidSprite: Phaser.GameObjects.Image;
  public word: string;
  public originalWord: string;
  public speed: number;
  private isMatched: boolean = false;
  public currentProgress: number = 0; // Kaç harf yazıldı

  constructor(scene: Phaser.Scene, x: number, y: number, word: string, speed: number) {
    super(scene, x, y);

    this.word = word;
    this.originalWord = word;
    this.speed = speed;

    // Asteroid sprite
    this.asteroidSprite = scene.add.image(0, 0, 'asteroid');
    this.asteroidSprite.setScale(0.25); // Boyutu büyüttük
    this.add(this.asteroidSprite);

    // Kelime metni
    this.wordText = scene.add.text(0, 0, word, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.wordText.setOrigin(0.5);
    this.add(this.wordText);

    scene.add.existing(this);
  }

  update(delta: number): void {
    this.y += this.speed * (delta / 1000);
    
    // Asteroid'i yavaşça döndür
    this.asteroidSprite.rotation += 0.01;
  }

  setMatched(matched: boolean): void {
    this.isMatched = matched;
    if (matched) {
      // Hedeflendiğinde sarı renk
      this.asteroidSprite.setTint(0xffc107);
      this.wordText.setColor('#ffff00');
    } else {
      // Normal renk
      this.asteroidSprite.clearTint();
      this.wordText.setColor('#ffffff');
    }
  }

  removeFirstLetter(): void {
    if (this.word.length > 0) {
      this.word = this.word.substring(1);
      this.currentProgress++;
      this.updateWordDisplay();
    }
  }

  private updateWordDisplay(): void {
    // Sadece kalan harfleri göster
    this.wordText.setText(this.word);
    
    // Kelime kısaldıkça asteroid'i küçült
    const scale = 0.25 * (0.5 + (this.word.length / this.originalWord.length) * 0.5);
    this.asteroidSprite.setScale(scale);
  }

  getIsMatched(): boolean {
    return this.isMatched;
  }

  isComplete(): boolean {
    return this.word.length === 0;
  }

  destroy(): void {
    this.asteroidSprite.destroy();
    this.wordText.destroy();
    super.destroy();
  }
}
