/**
 * Simple Screen Manager for handling page transitions and loading states
 */
class ScreenManager {
  constructor() {
    this.screens = {
      loader: "sc-year-end-spend-loader",
      registration: "sc-year-end-spend-registration",
      regConfirmation: "sc-year-end-spend-reg-confirmation",
      landing: "sc-year-end-spend-landing",
      profileCustomisation: "sc-year-end-spend-profile-customisation",
      instructionModal: "sc-year-end-spend-instruction-modal",
      instruction: "sc-year-end-spend-instruction",
      checkinModal: "sc-year-end-spend-checkin-modal",
      cardCollection: "sc-year-end-spend-card-collection",
      rewardPopup: "sc-year-end-spend-reward-popup",
      rewardDetails: "sc-year-end-spend-reward-details",
      campaignEnd: "sc-year-end-spend-campaign-end",
      error: "sc-year-end-spend-error",
      modal: "sc-year-end-spend-modal",
      game: "sc-year-end-spend-polaroid-game",
    };

    this.currentScreen = null;
    this.hideClass = "--hide";
  }

  /**
   * Show a screen with optional loading and API call
   */
  async show(screenName, options = {}) {
    const {
      showLoader = false,
      apiCall = null,
      onComplete = null,
      minLoaderTime = 300,
    } = options;

    const startTime = Date.now();

    if (showLoader) {
      this.showLoader();
    }

    if (apiCall) {
      try {
        await apiCall();
      } catch (error) {
        console.error("API call failed:", error);
        this.hideLoader();
        this.show("error");
        return;
      }
    }

    if (showLoader) {
      const elapsed = Date.now() - startTime;
      if (elapsed < minLoaderTime) {
        await this._delay(minLoaderTime - elapsed);
      }
      this.hideLoader();
    }

    if (this.currentScreen) {
      this.hide(this.currentScreen);
    }

    this._showElement(this.screens[screenName]);
    this.currentScreen = screenName;

    if (onComplete) {
      onComplete();
    }
  }

  /**
   * Hide a specific screen
   */
  hide(screenName) {
    const elementId = this.screens[screenName];
    if (elementId) {
      this._hideElement(elementId);
    }
  }

  /**
   * Show loader independently
   */
  showLoader() {
    this._showElement(this.screens.loader);
  }

  /**
   * Hide loader independently
   */
  hideLoader() {
    this._hideElement(this.screens.loader);
  }

  /**
   * Check if a screen is currently visible
   */
  isVisible(screenName) {
    const elementId = this.screens[screenName];
    const el = document.getElementById(elementId);
    if (!el) return false;

    const baseClass = el.classList[0];
    return !el.classList.contains(baseClass + this.hideClass);
  }

  /**
   * Show element by ID
   */
  _showElement(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      const baseClass = el.classList[0];
      el.classList.remove(baseClass + this.hideClass);
    }
  }

  /**
   * Hide element by ID
   */
  _hideElement(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      const baseClass = el.classList[0];
      el.classList.add(baseClass + this.hideClass);
    }
  }

  /**
   * Delay helper
   */
  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

const screenManager = new ScreenManager();
export default screenManager;
