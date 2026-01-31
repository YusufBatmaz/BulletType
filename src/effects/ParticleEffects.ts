import Phaser from 'phaser';

export class ParticleEffects {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createMuzzleFlash(x: number, y: number): void {
    const particles = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 100, max: 200 },
      angle: { min: -120, max: -60 },
      scale: { start: 1, end: 0 },
      tint: [0xffd700, 0xff6b6b],
      lifespan: 300,
      quantity: 15,
      blendMode: 'ADD'
    });

    this.scene.time.delayedCall(300, () => {
      particles.destroy();
    });
  }

  createExplosion(x: number, y: number): void {
    // Ana patlama
    const explosion = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 100, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      tint: [0xff6b6b, 0xffd700, 0xff8c00, 0xff4500],
      lifespan: 500,
      quantity: 30,
      blendMode: 'ADD'
    });

    // Duman efekti
    const smoke = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 20, max: 50 },
      angle: { min: 0, max: 360 },
      scale: { start: 2, end: 0 },
      tint: 0x666666,
      alpha: { start: 0.6, end: 0 },
      lifespan: 800,
      quantity: 10,
      gravityY: -50
    });

    // Patlama emoji
    const explosionEmoji = this.scene.add.text(x, y, '💥', {
      fontSize: '40px'
    });
    explosionEmoji.setOrigin(0.5);

    this.scene.tweens.add({
      targets: explosionEmoji,
      scale: 2,
      alpha: 0,
      angle: 360,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        explosionEmoji.destroy();
      }
    });

    this.scene.time.delayedCall(500, () => {
      explosion.destroy();
    });

    this.scene.time.delayedCall(800, () => {
      smoke.destroy();
    });
  }

  createBulletTrail(startX: number, startY: number, endX: number, endY: number): void {
    const bullet = this.scene.add.circle(startX, startY, 3, 0xffd700);
    bullet.setBlendMode(Phaser.BlendModes.ADD);

    // Mermi izi parçacıkları
    const trail = this.scene.add.particles(startX, startY, 'particle', {
      follow: bullet,
      scale: { start: 0.5, end: 0 },
      tint: [0xffd700, 0xff6b6b],
      lifespan: 200,
      frequency: 20,
      blendMode: 'ADD'
    });

    this.scene.tweens.add({
      targets: bullet,
      x: endX,
      y: endY,
      duration: 300,
      ease: 'Linear',
      onComplete: () => {
        trail.destroy();
        bullet.destroy();
      }
    });
  }
}
