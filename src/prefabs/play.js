class Play extends Phaser.Scene {
  constructor() {
    super("playScene");
  }

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

    this.background = this.add.tileSprite(
      0, 0, this.scale.width * 4, this.scale.height * 4, "mushroomBG"
    ).setOrigin(0, 0);

    this.mobs = this.add.group();
    addMob(this.mobs, this);

    this.enemCount = 0;
    this.lastThrowTime = 0;

    this.player = new Player(this, 100, 100, "mushroomPlayer");
    this.player.setScale(0.2);
    this.physics.add.existing(this.player);

    this.cameras.main.setBounds(0, 0, this.worldBoundX, this.worldBoundY);
    this.cameras.main.startFollow(this.player, true, 0.25, 0.25);
    this.physics.world.setBounds(0, 0, this.worldBoundX, this.worldBoundY);

    this.playerFSM = new StateMachine(
      "idle",
      {
        idle: new IdleState(),
        move: new MoveState(),
        throw: new ThrowState(),
      },
      [this, this.player]
    );

    this.mushroomBombs = this.physics.add.group();

    // Add collision detection for mushroom bombs with mobs
    this.physics.add.overlap(this.mushroomBombs, this.mobs, this.handleBombHit, null, this);
  }

  handleBombHit(bomb, enemy) {
    // Decrease enemy health on bomb hit
    enemy.health -= 1;
    enemy.healthText.setText(enemy.health);
    bomb.destroy();

    // If the enemy's health is 0 or less, destroy it
    if (enemy.health <= 0) {
      enemy.healthText.destroy();
      enemy.destroy();
    } else {
      enemy.hit = true; // Mark the enemy as hit
    }
  }

  update() {
    const { left, right, up, down, throw: throwKey } = this.keys;

    this.background.tilePositionX = this.player.x - this.scale.width / 10;
    this.background.tilePositionY = this.player.y - this.scale.height / 3;

    this.playerFSM.step();
    if (!left.isDown && !down.isDown && !up.isDown && !right.isDown) {
      this.player.setVelocity(0);
    }

    this.player.updateHealthTextPosition();

    while (this.enemCount < 20) {
      addMob(this.mobs, this);
      this.enemCount++;
    }
    mobMovement(this.mobs, this);
  }
}

function mobMovement(mobList, scene) {
  if (!mobList) return;
  mobList.children.each((enemy) => {
    if (enemy.hit && Phaser.Math.Distance.BetweenPoints(enemy, scene.player) < 500) {
      enemy.setVelocity(
        enemy.x < scene.player.x ? enemy.speed : -enemy.speed,
        enemy.y < scene.player.y ? enemy.speed : -enemy.speed
      );
    } else if (enemy.toggleIdle) {
      const [direcX, direcY] = [Math.random() > 0.5 ? 1 : -1, Math.random() > 0.5 ? 1 : -1];
      enemy.setVelocity(enemy.speed * direcX, enemy.speed * direcY);
      enemy.toggleIdle = false;
      scene.time.delayedCall(1000, speedToggle, [enemy], scene);
    }
    enemy.healthText.setPosition(enemy.x, enemy.y - 20);
  });
}

function speedToggle(object) {
  object.toggleIdle = true;
  object.speed = Math.random() * 150 + 50;
}

function addMob(mobGroup, scene) {
  let enem = scene.physics.add.sprite(
    Math.random() * (scene.worldBoundX - 100),
    Math.random() * (scene.worldBoundY - 100),
    "enemy"
  );
  enem.setScale(0.2);
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

  enem.preUpdate = function (time, delta) {
    Phaser.Physics.Arcade.Sprite.prototype.preUpdate.call(this, time, delta);
    this.healthText.setPosition(this.x, this.y - 20);
  };

  mobGroup.add(enem);
}
