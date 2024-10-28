class Play extends Phaser.Scene {
  constructor() {
    super("playScene");
  }
  preload() {}

  create() {
    //this.add.sprite(100, 100, "mushroomBomb");
    this.keys = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      up: "W",
      left: "A",
      down: "S",
      right: "D",
    });
    this.player = new Player(this, 100, 100, "mushroomBomb");
  }
  update() {
    const { left, right, up, down } = this.keys;
    if (left.isDown) {
      this.player.setVelocityX(-100);
    } else if (right.isDown) {
      this.player.setVelocityX(100);
    }
    if (up.isDown) {
      this.player.setVelocityY(-100);
    } else if (down.isDown) {
      this.player.setVelocityY(100);
    }
    if (!left.isDown && !down.isDown && !up.isDown && !right.isDown) {
      this.player.setVelocity(0);
    }
  }
}
