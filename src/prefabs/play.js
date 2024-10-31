class Play extends Phaser.Scene {
  constructor() {
    super("playScene");
  }

  preload() {
  }

  create() {
    this.keys = this.input.keyboard.addKeys({
      up: "W",
      left: "A",
      down: "S",
      right: "D",
      throw: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    this.add.sprite(config.width / 2, config.height / 2, "mushroomBG");

    this.mobs = this.add.group(); // Creating group to add all mobs
    addMob(this.mobs, this);
    this.testMobDead = false;

    this.player = new Player(this, 100, 100, "mushroomPlayer");
    this.player.setScale(0.3);
    this.physics.add.existing(this.player);

    // Player state machine initialization
    this.playerFSM = new StateMachine(
      "idle",
      {
        idle: new IdleState(),
        move: new MoveState(),
        throw: new ThrowState(),
      },
      [this, this.player]
    );

    // Mushroom bomb group
    this.mushroomBombs = this.physics.add.group();

    this.physics.add.overlap(this.mushroomBombs, this.mobs, (enemy, bomb) => {
      enemy.health -= 1;
      enemy.healthText.setText(enemy.health); // Update health display
      bomb.destroy();

      if (enemy.health <= 0) {
        enemy.healthText.destroy(); // Remove health display
        enemy.destroy();
        this.testMobDead = true;
      } else {
        enemy.hit = true; // Mark enemy as hit
      }
    });
  }

  update() {
    const { left, right, up, down, throw: throwKey } = this.keys;

    // Player movement logic
    this.playerFSM.step();
    if (!left.isDown && !down.isDown && !up.isDown && !right.isDown) {
      this.player.setVelocity(0);
    }
    if (this.testMobDead) {
      addMob(this.mobs, this);
      this.testMobDead = false;
    }
    mobMovement(this.mobs, this); // Checks which mobs need to move
  }
}

function mobMovement(mobList, scene) {
  mobList.children.each(function (enemy) {
    // Only move if the enemy has been hit
    if (enemy.hit && Phaser.Math.Distance.BetweenPoints(enemy, scene.player) < 300) {
      if (scene.player.x < enemy.x && enemy.body.velocity.x >= 0) {
        enemy.setVelocityX(-enemy.speed);
      } else if (scene.player.x > enemy.x && enemy.body.velocity.x <= 0) {
        enemy.setVelocityX(enemy.speed);
      }

      if (scene.player.y < enemy.y && enemy.body.velocity.y >= 0) {
        enemy.setVelocityY(-enemy.speed);
      } else if (scene.player.y > enemy.y && enemy.body.velocity.y <= 0) {
        enemy.setVelocityY(enemy.speed);
      }
    } else {
      enemy.setVelocity(0);
    }
    enemy.healthText.setPosition(enemy.x, enemy.y - 20);
  }, scene);
}

function addMob(mobGroup, scene) {
  // Adds enemy to given group
  let enem = scene.physics.add.sprite(
    Math.random() * (config.width - 200) + 100,
    Math.random() * (config.height - 200) + 100,
    "mushroomBomb" // Enemy texture
  );
  enem.body.setCollideWorldBounds(true);
  enem.body.setImmovable();
  enem.speed = 50;
  enem.health = 5;
  enem.hit = false;

  enem.healthText = scene.add.text(enem.x, enem.y - 20, enem.health, {
    font: "16px Arial",
    fill: "#ff0000",
  }).setOrigin(0.5);

  // Override preUpdate to make the text follow the enemy
  enem.preUpdate = function (time, delta) {
    Phaser.Physics.Arcade.Sprite.prototype.preUpdate.call(this, time, delta);
    this.healthText.setPosition(this.x, this.y - 20);
  };

  mobGroup.add(enem);
}
