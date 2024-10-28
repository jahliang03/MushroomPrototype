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
      throw: Phaser.Input.Keyboard.KeyCodes.SPACE
    });
    
    this.player = new Player(this, 100, 100, "mushroomPlayer");
    this.physics.add.existing(this.player);
    this.playerFSM = new StateMachine(
      "idle",
      {
        idle: new IdleState(),
        move: new MoveState(),
      },
      [this, this.player]
    );
    
    // Mushroom bomb group
    this.mushroomBombs = this.physics.add.group();
  }

  update() {
    const { left, right, up, down, throw: throwKey } = this.keys;

    // Player movement logic
    this.playerFSM.step();
    if (!left.isDown && !down.isDown && !up.isDown && !right.isDown) {
      this.player.setVelocity(0);
    }

    // Throwing the mushroom
    if (Phaser.Input.Keyboard.JustDown(throwKey)) {
      this.throwMushroom();
    }
  }

  throwMushroom() {
    // Create a mushroom bomb at player's position
    const mushroom = this.mushroomBombs.create(this.player.x, this.player.y, "mushroomBomb");
    
    // Set an initial velocity to simulate an arc
    mushroom.setVelocity(250, -150); // Adjust values for a better arc
    mushroom.setGravityY(300); // Gravity to pull the mushroom down
  }
}