class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set player values
    this.direction = new Phaser.Math.Vector2(0);
    this.velocityS = 150;
    this.health = 5;
    this.isAlive = true;

    // Display health on the screen
    this.healthText = scene.add
      .text(x, y - 50, `${this.health}`, {
        font: "16px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5);
  }

  takeDamage(amount) {
    if (!this.isAlive) return;
    this.health -= amount;
    this.healthText.setText(`Health: ${this.health}`);
    if (this.health <= 0) {
      this.health = 0;
      this.isAlive = false;
    }
  }

  updateHealthTextPosition() {
    this.healthText.setPosition(this.x, this.y - 30);
  }
}

class IdleState extends State {
  enter(scene, hero) {
    if (scene.input.keyboard.enabled) hero.body.setVelocity(0);
  }

  execute(scene, hero) {
    const { left, right, up, down, throw: throwKey } = scene.keys;
    if (left.isDown || right.isDown || up.isDown || down.isDown) {
      this.stateMachine.transition("move");
      return;
    }
    if (Phaser.Input.Keyboard.JustDown(throwKey)) {
      this.stateMachine.transition("throw");
    }
  }
}

class MoveState extends State {
  execute(scene, hero) {
    const { left, right, up, down, throw: throwKey } = scene.keys;

    if (!(left.isDown || right.isDown || up.isDown || down.isDown)) {
      this.stateMachine.transition("idle");
      return;
    }

    if (up.isDown || down.isDown) {
      hero.direction.y = up.isDown ? -1 : 1;
      hero.direction.normalize();
      hero.body.setVelocityY(hero.velocityS * hero.direction.y);
    } else {
      hero.setVelocityY(0);
      hero.direction.y = 0;
    }

    if (left.isDown || right.isDown) {
      if (left.isDown) {
        hero.setFlipX(true);
      } else {
        hero.setFlipX(false);
      }
      hero.direction.x = left.isDown ? -1 : 1;
      hero.direction.normalize();
      hero.body.setVelocityX(hero.velocityS * hero.direction.x);
    } else {
      hero.setVelocityX(0);
      hero.direction.x = 0;
    }

    if (Phaser.Input.Keyboard.JustDown(throwKey)) {
      this.stateMachine.transition("throw");
    }
  }
}

class ThrowState extends State {
  execute(scene, hero) {
    const currentTime = scene.time.now;

    if (currentTime - scene.lastShootTime < 300) {
      this.stateMachine.transition("idle");
      return;
    }
    scene.lastShootTime = currentTime;

    const bullet = scene.mushroomBombs.create(hero.x, hero.y, "bullet");
    bullet.setScale(1);
    bullet.body.setSize(bullet.displayWidth, bullet.displayHeight);

    bullet.setVelocity(500 * hero.direction.x, 500 * hero.direction.y);
    const angle = Phaser.Math.Angle.Between(
      0,
      0,
      hero.direction.x,
      hero.direction.y,
    );
    bullet.rotation = angle + Phaser.Math.PI2 / 4;

    bullet.body.rotation = bullet.rotation;

    bullet.body.checkCollision.none = false;

    this.stateMachine.transition("idle");
  }
}
