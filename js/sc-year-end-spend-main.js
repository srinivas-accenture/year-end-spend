//import generalInstance from './sc-year-end-spend-general-flow.js';
import gameInstance from "./sc-year-end-spend-game-flow-v.js";

// Initialize the campaign when window is loaded
window.addEventListener("load", function () {
  // set the general screen instance
  gameInstance.setGeneralInstance(generalInstance);
  // set the game screen instance
  //generalInstance.setGameInstance(gameInstance);

  // Initialize the general and game screens
  //generalInstance.init();
  gameInstance.init();
});
