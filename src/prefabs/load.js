class load extends Phaser.Scene {
  constructor() {
    super("loadScene");
  }
  preload() {
    this.load.image(
      "mushroomBomb",
      "./assets/mushrooms/PNG/tallShroom_red.png"
    );
  }
  create() {
    this.scene.start("playScene");
  }
}
