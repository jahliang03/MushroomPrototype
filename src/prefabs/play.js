class Play extends Phaser.Scene {
  constructor() {
    super("playScene");
  }

  preload() {}

  create() {
    this.worldBoundX = 2000;
    this.worldBoundY = 2000;
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

    this.enemCount = 0;
    this.lastThrowTime = 0;

    this.player = new Player(this, 100, 100, "mushroomPlayer");
    this.player.setScale(0.2);
    this.physics.add.existing(this.player);

    this.cameras.main.setBounds(0, 0, this.worldBoundX, this.worldBoundY);
    this.cameras.main.startFollow(this.player, true, 0.25, 0.25);
    this.physics.world.setBounds(0, 0, this.worldBoundX, this.worldBoundY);

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

    this.physics.add.collider(
      this.mobs,
      this.player,
      this.onPlayerDeath,
      null,
      this
    );
  }

  onPlayerDeath(player, mob) {
    this.scene.restart(); // Restart the scene upon player death
  }

  update() {
    const { left, right, up, down, throw: throwKey } = this.keys;

    // Player movement logic
    this.playerFSM.step();
    if (!left.isDown && !down.isDown && !up.isDown && !right.isDown) {
      this.player.setVelocity(0);
    }
    while (this.enemCount < 20) {
      addMob(this.mobs, this);
      this.enemCount++;
    }
    mobMovement(this.mobs, this); // Checks which mobs need to move
  }
}

function mobMovement(mobList, scene) {
  if (mobList == null) {
    return;
  }
  mobList.children.each(function (enemy) {
    // Only move if the enemy has been hit
    if (
      enemy.hit &&
      Phaser.Math.Distance.BetweenPoints(enemy, scene.player) < 500
    ) {
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
      if (enemy.toggleIdle) {
        //Idle movement for animals
        let direcY = Math.floor(Math.random() * 2 + 1);
        if (direcY % 2 == 0) {
          direcY = -1;
        }
        let direcX = Math.floor(Math.random() * 2 + 1);
        if (direcX % 2 == 0) {
          direcX = -1;
        }
        if (Math.floor(Math.random() * 3) == 1) {
          enemy.setVelocity(0);
        } else {
          enemy.setVelocity(enemy.speed * direcX, enemy.speed * direcY);
        }
        enemy.toggleIdle = false;
        scene.time.delayedCall(1000, speedToggle, [enemy], scene);
      }
    }
    enemy.healthText.setPosition(enemy.x, enemy.y - 20);
  }, scene);
}

function speedToggle(object) {
  object.toggleIdle = true;
  object.speed = Math.random() * 150 + 50;
}

function addMob(mobGroup, scene) {
  // Adds enemy to given group
  let enem = scene.physics.add.sprite(
    Math.random() * (scene.worldBoundX - 100),
    Math.random() * (scene.worldBoundY - 100),
    "mushroomBomb" // Enemy texture
  );
  enem.body.setCollideWorldBounds(true);
  enem.body.setImmovable();
  enem.speed = 100;
  enem.health = 5;
  enem.hit = false;
  enem.toggleIdle = true;

  enem.healthText = scene.add
    .text(enem.x, enem.y - 20, enem.health, {
      font: "16px Arial",
      fill: "#ff0000",
    })
    .setOrigin(0.5);

  // Override preUpdate to make the text follow the enemy
  enem.preUpdate = function (time, delta) {
    Phaser.Physics.Arcade.Sprite.prototype.preUpdate.call(this, time, delta);
    this.healthText.setPosition(this.x, this.y - 20);
  };

  mobGroup.add(enem);
}
