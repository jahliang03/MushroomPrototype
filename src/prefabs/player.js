class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture); // call Sprite parent class
    scene.add.existing(this); // add Player to existing scene
    scene.physics.add.existing(this); // add physics body to scene

    //set player values
    this.direction = new Phaser.Math.Vector2(0);
    this.velocityS = 150;
  }
}
class IdleState extends State {
  //Player idle state
  enter(scene, hero) {
    if (scene.input.keyboard.enabled == true) {
      hero.body.setVelocity(0);
    }
  }

  execute(scene, hero) {
    const { left, right, up, down, throw: throwKey } = scene.keys;
    //transition to new states
    if (left.isDown || right.isDown || up.isDown || down.isDown) {
      this.stateMachine.transition("move");
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(throwKey)) {
      this.stateMachine.transition("throw");
    }
    /*scene.input.on('pointerdown', function (pointer)
        {
            this.stateMachine.transition('idleSwing');
        }, this);*/
  }
}

class MoveState extends State {
  execute(scene, hero) {
    const { left, right, up, down, throw: throwKey } = scene.keys;

    let direction = new Phaser.Math.Vector2(0);
    //Character movement
    if (!(left.isDown || right.isDown || up.isDown || down.isDown)) {
      this.stateMachine.transition("idle");
      return;
    }

    if (up.isDown || down.isDown) {
      if (up.isDown) {
        //hero.setFlip(true, false);
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
    if (Phaser.Input.Keyboard.JustDown(throwKey)) {
      this.stateMachine.transition("throw");
    }
  }
}

class ThrowState extends State {
  execute(scene, hero) {
    const mushroom = scene.mushroomBombs.create(hero.x, hero.y, "mushroomBomb");

    // Set an initial velocity to simulate an arc
    mushroom.setVelocity(250 * hero.direction.x, -150); // Adjust values for a better arc
    mushroom.setGravityY(300); // Gravity to pull the mushroom down
    this.stateMachine.transition("idle");
    return;
  }
}
