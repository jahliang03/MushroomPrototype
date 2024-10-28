class Load extends Phaser.Scene {
  constructor() {
    super("loadScene");
  }
  preload() {
    this.load.image(
      "mushroomPlayer",
      "./assets/mushrooms/PNG/tallShroom_red.png"
    );
    this.load.image(
      "mushroomBomb",
      "./assets/mushrooms/PNG/tinyShroom_red.png"
    );
  }
  create() {
    this.scene.start("playScene");
  }
}
