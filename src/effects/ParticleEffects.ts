import Phaser from 'phaser';

export class ParticleEffects {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createMuzzleFlash(x: number, y: number): void {
    // Daha küçük ve gerçekçi namlu ateşi
    const particles = this.scene.add.particles(x, y - 10, 'particle', {
      speed: { min: 50, max: 100 },
      angle: { min: -100, max: -80 },
      scale: { start: 0.4, end: 0 },
      tint: [0xffff00, 0xffa500, 0xff6b6b],
      lifespan: 150,
      quantity: 8,
      blendMode: 'ADD',
      alpha: { start: 1, end: 0 }
    });

    // Küçük parlama efekti
    const flash = this.scene.add.circle(x, y - 10, 4, 0xffff00);
    flash.setBlendMode(Phaser.BlendModes.ADD);
    flash.setAlpha(0.8);

    this.scene.tweens.add({
      targets: flash,
      scale: 2,
      alpha: 0,
      duration: 100,
      ease: 'Power2',
      onComplete: () => {
        flash.destroy();
      }
    });

    this.scene.time.delayedCall(150, () => {
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
    // Daha küçük mermi
    const bullet = this.scene.add.circle(startX, startY, 2, 0xffff00);
    bullet.setBlendMode(Phaser.BlendModes.ADD);

    // Daha ince mermi izi
    const trail = this.scene.add.particles(startX, startY, 'particle', {
      follow: bullet,
      scale: { start: 0.3, end: 0 },
      tint: [0xffff00, 0xffa500],
      lifespan: 150,
      frequency: 30,
      blendMode: 'ADD',
      alpha: { start: 0.8, end: 0 }
    });

    this.scene.tweens.add({
      targets: bullet,
      x: endX,
      y: endY,
      duration: 200,
      ease: 'Linear',
      onComplete: () => {
        trail.destroy();
        bullet.destroy();
      }
    });
  }
}
