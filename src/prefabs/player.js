class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture); // call Sprite parent class
    scene.add.existing(this); // add Player to existing scene
    scene.physics.add.existing(this); // add physics body to scene

    // Set player values
    this.direction = new Phaser.Math.Vector2(0);
    this.velocityS = 150;
  }
}

class IdleState extends State {
  // Player idle state
  enter(scene, hero) {
    if (scene.input.keyboard.enabled == true) {
      hero.body.setVelocity(0);
    }
  }

  execute(scene, hero) {
    const { left, right, up, down, throw: throwKey } = scene.keys;

    // Transition to new states
    if (left.isDown || right.isDown || up.isDown || down.isDown) {
      this.stateMachine.transition("move");
      return;
    }

    // Transition to ThrowState if the throw key is pressed
    if (Phaser.Input.Keyboard.JustDown(throwKey)) {
      this.stateMachine.transition("throw");
    }
  }
}

class MoveState extends State {
  execute(scene, hero) {
    const { left, right, up, down, throw: throwKey } = scene.keys;

    // Character movement
    if (!(left.isDown || right.isDown || up.isDown || down.isDown)) {
      this.stateMachine.transition("idle");
      return;
    }

    if (up.isDown || down.isDown) {
      if (up.isDown) {
        hero.direction.y = -1;
      } else if (down.isDown) {
        hero.direction.y = 1;
      }
      hero.direction.normalize();
      hero.body.setVelocityY(hero.velocityS * hero.direction.y);
    } else {
      hero.setVelocityY(0);
      hero.direction.y = 0;
    }

    if (left.isDown || right.isDown) {
      if (left.isDown) {
        hero.setFlip(true, false);
        hero.direction.x = -1;
      } else if (right.isDown) {
        hero.resetFlip();
        hero.direction.x = 1;
      }
      hero.direction.normalize();
      hero.body.setVelocityX(hero.velocityS * hero.direction.x);
    } else {
      hero.setVelocityX(0);
      hero.direction.x = 0;
    }

    // Transition to ThrowState if the throw key is pressed
    if (Phaser.Input.Keyboard.JustDown(throwKey)) {
      this.stateMachine.transition("throw");
    }
  }
}

class ThrowState extends State {
  execute(scene, hero) {
    // Check if the cooldown period has passed (1 second = 1000 ms)
    const currentTime = scene.time.now;
    if (currentTime - scene.lastThrowTime < 750) {
      this.stateMachine.transition("idle");
      return;
    }

    // Update the last throw time
    scene.lastThrowTime = currentTime;

    // Create the mushroom bomb
    const mushroom = scene.mushroomBombs.create(hero.x, hero.y, "mushroomBomb");

    // Set initial velocity to simulate an arc
    mushroom.setVelocity(250 * hero.direction.x, -150);
    mushroom.setGravityY(300);

    // Set initial scale and disable collision with mobs
    mushroom.setScale(1); // Initial size
    mushroom.body.setSize(mushroom.width, mushroom.height);
    mushroom.body.checkCollision.none = true; // Temporarily disable collisions

    // After 2 seconds, double size and enable collisions
    scene.time.delayedCall(1000, () => {
      mushroom.setScale(2);
      mushroom.body.setSize(mushroom.width * 1, mushroom.height * 1);
      mushroom.body.checkCollision.none = false;
      scene.time.delayedCall(100, () => {
        mushroom.destroy();
      });
    });

    // Transition back to idle state
    this.stateMachine.transition("idle");
  }
}
