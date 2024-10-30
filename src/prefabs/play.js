class Play extends Phaser.Scene {
  constructor() {
    super("playScene");
  }
  preload() {}

  create() {
    this.keys = this.input.keyboard.addKeys({
      up: "W",
      left: "A",
      down: "S",
      right: "D",
      throw: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    this.add.sprite(config.width / 2, config.height / 2, "mushroomBG");

    this.mobs = this.add.group(); //Creating group to add all mobs
    addMob(this.mobs, this);
    this.testMobDead = false;

    this.player = new Player(this, 100, 100, "mushroomPlayer");
    this.physics.add.existing(this.player);
    //Player state machine initialization
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
      enemy.destroy();
      bomb.destroy();
      this.testMobDead = true;
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
    mobMovement(this.mobs, this); //Checks which mobs need to move
  }
}

function mobMovement(mobList, scene) {
  mobList.children.each(function (enemy) {
    //Mobs check distance from player and move accordingly
    //if (!enemy.hit) {
    if (Phaser.Math.Distance.BetweenPoints(enemy, scene.player) < 300) {
      // if player to left of enemy AND enemy moving to right (or not moving)
      if (scene.player.x < enemy.x && enemy.body.velocity.x >= 0) {
        // move enemy to left
        enemy.setVelocityX(-enemy.speed);
      }
      // if player to right of enemy AND enemy moving to left (or not moving)
      else if (scene.player.x > enemy.x && enemy.body.velocity.x <= 0) {
        // move enemy to right
        enemy.setVelocityX(enemy.speed);
      }

      if (scene.player.y < enemy.y && enemy.body.velocity.y >= 0) {
        // move enemy to left
        enemy.setVelocityY(-enemy.speed);
      }
      // if player to right of enemy AND enemy moving to left (or not moving)
      else if (scene.player.y > enemy.y && enemy.body.velocity.y <= 0) {
        // move enemy to right
        enemy.setVelocityY(enemy.speed);
      }
    } else {
      enemy.setVelocity(0);
    }
    //}
  }, scene);
}

function addMob(mobGroup, scene) {
  //Adds enemy to given group
  let enem = scene.physics.add.sprite(
    Math.random() * config.width - 100 + 100,
    Math.random() * config.height - 100 + 100,
    "mushroomBomb"
  );
  enem.body.setCollideWorldBounds(true);
  enem.body.setImmovable();
  enem.speed = 50;
  mobGroup.add(enem);
}
