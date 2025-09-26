import generalInstance from "./sc-year-end-spend-general-flow.js";
import gameInstance from "./sc-year-end-spend-game-flow.js";
//import screenManager from "./sc-year-end-spend-screen-manager.js";

window.addEventListener("load", function () {
  gameInstance.setGeneralInstance(generalInstance);
  generalInstance.setGameInstance(gameInstance);

  // window.screenManager = screenManager;

  generalInstance.init();
  gameInstance.init();

  // Example usage
  console.log("Campaign initialized");
});
