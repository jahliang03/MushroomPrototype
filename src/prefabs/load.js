class Load extends Phaser.Scene {
  constructor() {
    super("loadScene");
  }
  preload() {
    this.load.image(
      "mushroomPlayer",
      "./assets/mushrooms/sprites/racoon.png"
    );
    this.load.image(
      "mushroomBomb",
      "assets/mushrooms/sprites/mushroom.PNG"
    );
    this.load.image(
      "mushroomBG",
      "./assets/mushrooms/Backgrounds/grass.png"
    );
    this.load.image(
      "enemy", 
      "./assets/mushrooms/sprites/bunny.PNG"
    );
  }
  create() {
    this.scene.start("playScene");
  }
}
