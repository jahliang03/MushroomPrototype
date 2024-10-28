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

    this.player = new Player(this, 100, 100, "mushroomPlayer");
    this.physics.add.existing(this.player);
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
  }

  update() {
    const { left, right, up, down, throw: throwKey } = this.keys;

    // Player movement logic
    this.playerFSM.step();
    if (!left.isDown && !down.isDown && !up.isDown && !right.isDown) {
      this.player.setVelocity(0);
    }
  }
}
