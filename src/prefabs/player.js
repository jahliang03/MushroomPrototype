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
    this.healthText = scene.add.text(x, y - 50, `${this.health}`, {
      font: "16px Arial",
      fill: "#ffffff",
    }).setOrigin(0.5);
  }

  takeDamage(amount) {
    if (!this.isAlive) return;
    this.health -= amount;
    this.healthText.setText(`Health: ${this.health}`);
    if (this.health <= 0) {
      this.health = 0;
      this.isAlive = false;
      this.die();
    }
  }

  die() {
    this.setTint(0xff0000);
    this.setVelocity(0);
    this.body.enable = false;
    this.healthText.setText("Health: 0");
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
    if (currentTime - scene.lastThrowTime < 750) {
      this.stateMachine.transition("idle");
      return;
    }
    scene.lastThrowTime = currentTime;

    const mushroom = scene.mushroomBombs.create(hero.x, hero.y, "mushroomBomb");
    mushroom.setScale(0.1);
    mushroom.body.setSize(mushroom.displayWidth, mushroom.displayHeight);
    mushroom.setVelocity(250 * hero.direction.x, -200);
    mushroom.setGravityY(300);
    mushroom.body.checkCollision.none = true;

    scene.time.delayedCall(1000, () => {
      mushroom.setScale(0.1);
      mushroom.body.setSize(mushroom.displayWidth * 1, mushroom.displayHeight * 1);
      mushroom.body.checkCollision.none = false;

      // Destroy bomb after collision is enabled
      scene.time.delayedCall(100, () => {
        mushroom.destroy();
      });
    });

    this.stateMachine.transition("idle");
  }
}
