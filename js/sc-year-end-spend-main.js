import generalInstance from "./sc-year-end-spend-general-flow.js";
import gameInstance from "./sc-year-end-spend-game-flow.js";

window.addEventListener("load", function () {
  gameInstance.setGeneralInstance(generalInstance);
  generalInstance.setGameInstance(gameInstance);
  generalInstance.init();
  gameInstance.init();
});
