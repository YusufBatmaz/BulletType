import Phaser from 'phaser';

export class Plane extends Phaser.GameObjects.Image {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string = 'plane') {
    super(scene, x, y, texture);

    this.setOrigin(0.5);
    this.setScale(0.15); // Boyutu ayarla (gerekirse değiştir)
    scene.add.existing(this);
  }

  shoot(): void {
    this.scene.tweens.add({
      targets: this,
      scale: 0.17, // Ateş ederken biraz büyüsün
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });
  }
  
  changeTexture(texture: string): void {
    this.setTexture(texture);
  }
}
