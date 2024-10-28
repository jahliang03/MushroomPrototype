class play extends Phaser.Scene {
  constructor() {
    super("playScene");
  }
  preload() {}

  create() {
    this.add.sprite(100, 100, "mushroomBomb");
  }
  update() {}
}
