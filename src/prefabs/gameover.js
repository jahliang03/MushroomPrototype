class GameOver extends Phaser.Scene {
  constructor() {
    super("gameOver");
  }

  create(data) {
    this.add.rectangle(400, 300, 800, 600, 0x000000).setAlpha(0.8);

    this.add.text(500, 200, "Congrats! Good Poaching!", {
      fontSize: "64px",
      fill: "#ffffff",
    }).setOrigin(0.5);

    const restartButton = this.add.text(500, 400, "Restart", {
      fontSize: "32px",
      fill: "#00ff00",
    }).setOrigin(0.5).setInteractive();

    restartButton.on("pointerdown", () => {
      this.scene.start("playScene");
    });
  }
}
