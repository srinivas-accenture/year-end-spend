import generalInstance from "./sc-year-end-spend-general-flow.js";
import gameInstance from "./sc-year-end-spend-game-flow.js";

window.addEventListener("load", function () {
  gameInstance.setGeneralInstance(generalInstance);
  generalInstance.setGameInstance(gameInstance);

  window.showSliderScreen = () => gameInstance.showSliderScreen();
  window.showResultScreen = () => gameInstance.showResultScreen();
  window.showGameSection = () => gameInstance.showGameSection();
  window.hideGameSection = () => gameInstance.hideGameSection();

  generalInstance.init();
  gameInstance.init();
  console.log("Campaign initialized - Methods available:");
  console.log("- showSliderScreen()");
  console.log("- showResultScreen()");
  console.log("- showGameSection()");
  console.log("- hideGameSection()");
  // Example usage
  console.log("Campaign initialized");
});
