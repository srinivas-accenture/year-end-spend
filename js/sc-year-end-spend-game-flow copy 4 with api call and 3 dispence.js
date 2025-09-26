import screenManager from "./sc-year-end-spend-screen-manager.js";

class ScYESGameScreen {
  constructor() {
    this.generalInstance = null;
    this.screenManager = screenManager;

    // API Configuration
    this.API_CONFIG = {
      PACK_OPEN_URL: "/api/open-pack",
      TIMEOUT: 65000, // 65 seconds to allow for 60s delay
      USE_MOCK: true, // Set to false for production
      MOCK_DELAY: 60000,
    };

    // Configuration Constants
    this.CONFIG = {
      DOM_IDS: {
        SECTION: "sc-year-end-spend-polaroid-game-section",
        SLIDER: "polaroid-game-slider",
        POCKET: "polaroid-game-pocket",
        BG_DARK: "polaroid-game-bg-dark",
        RESULT: "polaroid-result",
      },

      CSS_SELECTORS: {
        SLIDER_IMAGE: ".sc-year-end-spend-polaroid-game__slider-img",
      },

      CSS_CLASSES: {
        ACTIVE: "active",
        RESULT_SHOW: "result-show",
        ACTIVE_SCROLL: "active-scroll",
        DISMISS: "dismiss",
        DISMISS_CARD: "dismiss-card",
      },

      DEFAULTS: {
        ITEM_WIDTH: 138,
        ITEM_HEIGHT: 185,
        SPACING_X: 140,
        CURVE_INTENSITY: 40,
        ANGLES: [0, -20, -40, -65, -90],
        SWIPE_THRESHOLD: 30,
        VERTICAL_THRESHOLD: 60,
        GESTURE_THRESHOLD: 12,
        DRAG_SENSITIVITY: 480,
        VERTICAL_DRAG_MULTIPLIER: 0.65,
        MIN_SCALE: 0.5,
        SCALE_STEP: 0.1,
        Z_INDEX_BASE: 100,
        Z_INDEX_STEP: 10,
      },

      ANIMATIONS: {
        CAROUSEL_TRANSITION: { duration: 0.5, ease: "power3.out" },
        SNAP_BACK: { duration: 0.28, ease: "power2.out" },
        SNAP_BACK_EXTENDED: { duration: 0.32, ease: "power2.out" },
        CARD_DROP: { duration: 0.6, ease: "back.in" },
        SLIDER_FADE: { duration: 0.4, ease: "power2.in" },
        POCKET_FADE: { duration: 0.1, ease: "power2.out" },
        RESULT_SHOW: { duration: 0.8, delay: 1, ease: "power2.in" },
      },

      TIMING: {
        POCKET_DELAY: 2600,
      },
    };

    // DOM Elements
    this.elements = {};
    this.items = [];

    // Layout Properties
    this.itemWidth = this.CONFIG.DEFAULTS.ITEM_WIDTH;
    this.itemHeight = this.CONFIG.DEFAULTS.ITEM_HEIGHT;
    this.spacingX = this.CONFIG.DEFAULTS.SPACING_X;
    this.curveIntensity = this.CONFIG.DEFAULTS.CURVE_INTENSITY;
    this.angles = [...this.CONFIG.DEFAULTS.ANGLES];
    this.swipeThreshold = this.CONFIG.DEFAULTS.SWIPE_THRESHOLD;
    this.verticalThreshold = this.CONFIG.DEFAULTS.VERTICAL_THRESHOLD;

    // Game State
    this.itemCount = 0;
    this.offset = 0;
    this.baseX = 0;
    this.baseY = 0;
    this.activeItem = null;
    this.maxIndex = 0;

    // Gesture State
    this.startX = 0;
    this.startY = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.movedX = 0;
    this.movedY = 0;
    this.gesture = null;
    this.isDragging = false;

    // Management
    this.eventListeners = [];
    this.activeAnimations = new Set();
    this.isInitialized = false;
    this.restartButton = null;
    this.dispensingStartTime = null;
  }

  setGeneralInstance(instance) {
    console.log(
      "🚀 ~ ScYESGameScreen ~ setGeneralInstance ~ instance:",
      instance
    );
    this.generalInstance = instance;
  }

  /**
   * Initialize the game
   */
  init() {
    try {
      this.initializeElements();
      this.parseDatasetConfiguration();
      this.setupGameState();
      this.bindEventListeners();
      this.updateLayoutDimensions();
      this.renderCarousel();
      this.isInitialized = true;

      console.log("ScYESGameScreen: Initialized successfully");
    } catch (error) {
      console.error("ScYESGameScreen: Initialization failed:", error.message);
      throw error;
    }
  }

  /**
   * Initialize DOM elements
   */
  initializeElements() {
    const elementsToFind = {
      section: this.CONFIG.DOM_IDS.SECTION,
      slider: this.CONFIG.DOM_IDS.SLIDER,
      pocket: this.CONFIG.DOM_IDS.POCKET,
      bgDark: this.CONFIG.DOM_IDS.BG_DARK,
      result: this.CONFIG.DOM_IDS.RESULT,
    };

    for (const [key, id] of Object.entries(elementsToFind)) {
      const element = document.getElementById(id);
      if (!element) {
        throw new Error(`Required element not found: ${id}`);
      }
      this.elements[key] = element;
    }

    this.elements.slider.style.display = "block";

    this.items = Array.from(
      this.elements.slider.querySelectorAll(
        this.CONFIG.CSS_SELECTORS.SLIDER_IMAGE
      )
    );

    if (this.items.length === 0) {
      throw new Error("No slider items found");
    }
  }

  /**
   * Parse configuration from dataset
   */
  parseDatasetConfiguration() {
    const dataset = this.elements.slider.dataset;

    this.itemWidth =
      parseInt(dataset.itemWidth) || this.CONFIG.DEFAULTS.ITEM_WIDTH;
    this.itemHeight =
      parseInt(dataset.itemHeight) || this.CONFIG.DEFAULTS.ITEM_HEIGHT;
    this.spacingX =
      parseInt(dataset.spacingX) || this.CONFIG.DEFAULTS.SPACING_X;
    this.curveIntensity =
      parseInt(dataset.curveIntensity) || this.CONFIG.DEFAULTS.CURVE_INTENSITY;
    this.angles = dataset.angles
      ? dataset.angles.split(",").map(Number)
      : [...this.CONFIG.DEFAULTS.ANGLES];
    this.swipeThreshold =
      parseInt(dataset.swipeThreshold) || this.CONFIG.DEFAULTS.SWIPE_THRESHOLD;
    this.verticalThreshold =
      parseInt(dataset.verticalThreshold) ||
      this.CONFIG.DEFAULTS.VERTICAL_THRESHOLD;
  }

  /**
   * Setup game state
   */
  setupGameState() {
    this.itemCount = this.items.length;
    this.offset = Math.floor(this.itemCount / 2);
    this.maxIndex = this.angles.length - 1;
    this.activeItem = null;
    this.resetGestureState();
  }

  /**
   * Reset gesture state
   */
  resetGestureState() {
    this.startX = this.startY = this.lastX = this.lastY = 0;
    this.movedX = this.movedY = 0;
    this.gesture = null;
    this.isDragging = false;
  }

  /**
   * Reset game to initial state
   */
  async resetToGameState() {
    console.log("=== RESET TO GAME STATE START ===");

    this.activeAnimations.forEach((animation) => {
      if (animation && animation.kill) animation.kill();
    });
    this.activeAnimations.clear();

    if (
      this.elements.result &&
      this.elements.result.classList.contains("result-show")
    ) {
      await new Promise((resolve) => {
        gsap.to(this.elements.result, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
          onComplete: resolve,
        });
      });
    }

    this.resetGameElements();

    this.elements.slider.style.display = "block";
    this.elements.slider.style.opacity = "1";
    this.elements.pocket.style.opacity = "1";
    this.elements.pocket.style.visibility = "visible";

    this.renderCarousel();

    console.log("=== RESET TO GAME STATE END ===");
  }

  /**
   * Reset game elements
   */
  resetGameElements() {
    this.items.forEach((item) => {
      item.style.display = "block";
      item.style.opacity = "1";
      item.style.visibility = "visible";
      item.classList.remove("active");
      gsap.set(item, { clearProps: "all" });
    });

    if (this.elements.pocket) {
      this.elements.pocket.classList.remove("active", "dismiss-card");
      gsap.set(this.elements.pocket, {
        opacity: 1,
        clearProps: "transform,scale,x,y",
      });
    }

    if (this.elements.bgDark) {
      this.elements.bgDark.classList.remove("dismiss");
      gsap.set(this.elements.bgDark, { clearProps: "all" });
    }

    if (this.elements.section) {
      this.elements.section.classList.remove("active-scroll");
    }

    if (this.elements.result) {
      this.elements.result.classList.remove("result-show");
      gsap.set(this.elements.result, {
        opacity: 0,
        clearProps: "transform,scale,x,y",
      });
      this.elements.result.style.opacity = "0";

      const resultCards = this.elements.result.querySelectorAll(
        ".sc-year-end-spend-polaroid-game__polaroid-card"
      );
      resultCards.forEach((card) => {
        card.style.cssText = "";
        const cardImg = card.querySelector(
          ".sc-year-end-spend-polaroid-game__polaroid-card-img"
        );
        if (cardImg) cardImg.style.opacity = "";
      });

      const prizeDetail = this.elements.result.querySelector(
        ".sc-year-end-spend-polaroid-game__prize-detail"
      );
      if (prizeDetail) prizeDetail.style.opacity = "";

      this.elements.result.offsetHeight;
    }

    gsap.set(this.elements.slider, {
      opacity: 1,
      clearProps: "transform,scale,x,y",
    });

    this.resetGestureState();
    this.setupGameState();
    this.updateLayoutDimensions();
  }

  /**
   * Bind event listeners
   */
  bindEventListeners() {
    this.addEventListenerWithCleanup(window, "resize", () => {
      this.updateLayoutDimensions();
      this.renderCarousel();
    });

    this.addEventListenerWithCleanup(
      document,
      "touchstart",
      (e) => this.handleGestureStart(e),
      { passive: true }
    );
    this.addEventListenerWithCleanup(
      document,
      "touchmove",
      (e) => this.handleGestureMove(e),
      { passive: false }
    );
    this.addEventListenerWithCleanup(
      document,
      "touchend",
      () => this.handleGestureEnd(),
      { passive: true }
    );

    this.addEventListenerWithCleanup(document, "mousedown", (e) => {
      if (e.button === 0) this.handleGestureStart(e);
    });
    this.addEventListenerWithCleanup(document, "mousemove", (e) =>
      this.handleGestureMove(e)
    );
    this.addEventListenerWithCleanup(document, "mouseup", () =>
      this.handleGestureEnd()
    );

    try {
      this.restartButton = document.querySelector(
        ".sc-year-end-spend-polaroid-game__open-another"
      );
      if (this.restartButton) {
        this.addEventListenerWithCleanup(this.restartButton, "click", () => {
          this.resetToGameState();
        });
      }
    } catch (error) {
      console.warn("Error binding restart button:", error.message);
    }
  }

  /**
   * Add event listener with cleanup
   */
  addEventListenerWithCleanup(element, event, handler, options = {}) {
    const wrappedHandler = (e) => {
      if (this.isInitialized) {
        try {
          handler(e);
        } catch (error) {
          console.warn(
            `ScYESGameScreen: Error in ${event} handler:`,
            error.message
          );
        }
      }
    };

    element.addEventListener(event, wrappedHandler, options);
    this.eventListeners.push({
      element,
      event,
      handler: wrappedHandler,
      options,
    });
  }

  /**
   * Update layout dimensions
   */
  updateLayoutDimensions() {
    try {
      if (this.items.length === 0) return;

      const firstItem = this.items[0];
      if (firstItem) {
        this.itemWidth = firstItem.offsetWidth || this.itemWidth;
        this.itemHeight = firstItem.offsetHeight || this.itemHeight;
      }

      const sliderWidth = this.elements.slider.clientWidth;
      const sliderHeight = this.elements.slider.clientHeight;

      this.baseX = sliderWidth / 2 - this.itemWidth / 2;
      this.baseY = sliderHeight / 2 - this.itemHeight / 2;
    } catch (error) {
      console.warn(
        "ScYESGameScreen: Error updating layout dimensions:",
        error.message
      );
    }
  }

  /**
   * Calculate item angle
   */
  calculateItemAngle(position) {
    const sign = position < 0 ? -1 : 1;
    const absPosition = Math.abs(position);

    if (absPosition >= this.maxIndex) {
      return sign * this.angles[this.maxIndex];
    }

    const floorIndex = Math.floor(absPosition);
    const fraction = absPosition - floorIndex;

    return (
      sign *
      (this.angles[floorIndex] +
        (this.angles[floorIndex + 1] - this.angles[floorIndex]) * fraction)
    );
  }

  /**
   * Calculate item scale
   */
  calculateItemScale(position) {
    const absPosition = Math.abs(position);
    return Math.max(
      1 - absPosition * this.CONFIG.DEFAULTS.SCALE_STEP,
      this.CONFIG.DEFAULTS.MIN_SCALE
    );
  }

  /**
   * Calculate item z-index
   */
  calculateItemZIndex(position) {
    const absPosition = Math.abs(position);
    return Math.round(
      this.CONFIG.DEFAULTS.Z_INDEX_BASE -
        absPosition * this.CONFIG.DEFAULTS.Z_INDEX_STEP
    );
  }

  /**
   * Render carousel
   */
  renderCarousel() {
    if (!this.items || this.items.length === 0) return;

    try {
      this.activeItem = null;
      const centerIndex = Math.round(this.offset);

      this.items.forEach((element, index) => {
        const position = index - this.offset;
        const absPosition = Math.abs(position);

        if (absPosition > this.maxIndex + 0.5) {
          this.setElementTransform(element, {
            opacity: 0,
            pointerEvents: "none",
          });
          element.classList.remove(this.CONFIG.CSS_CLASSES.ACTIVE);
          return;
        }

        const x = this.baseX + position * this.spacingX;
        const y = this.baseY - Math.pow(position, 2) * this.curveIntensity;
        const angle = this.calculateItemAngle(position);
        const scale = this.calculateItemScale(position);
        const zIndex = this.calculateItemZIndex(position);

        this.setElementTransform(element, {
          x,
          y,
          scale,
          rotation: angle,
          zIndex,
          opacity: 1,
          pointerEvents: "auto",
        });

        element.classList.remove(this.CONFIG.CSS_CLASSES.ACTIVE);

        if (index === centerIndex) {
          element.dataset.centerY = String(y);
          this.activeItem = element;
          element.classList.add(this.CONFIG.CSS_CLASSES.ACTIVE);
        }
      });
    } catch (error) {
      console.warn("ScYESGameScreen: Error during rendering:", error.message);
    }
  }

  /**
   * Set element transform
   */
  setElementTransform(element, properties) {
    gsap.set(element, properties);
  }

  /**
   * Get pointer coordinates
   */
  getPointerCoordinates(event) {
    if (event.touches && event.touches.length > 0) {
      return { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
    return { x: event.clientX, y: event.clientY };
  }

  /**
   * Handle gesture start
   */
  handleGestureStart(event) {
    if (!this.isInitialized) return;

    try {
      const point = this.getPointerCoordinates(event);
      this.startX = this.lastX = point.x;
      this.startY = this.lastY = point.y;
      this.gesture = null;
      this.isDragging = true;
      this.movedX = this.movedY = 0;
    } catch (error) {
      console.warn("ScYESGameScreen: Error in gesture start:", error.message);
    }
  }

  /**
   * Handle gesture move
   */
  handleGestureMove(event) {
    if (!this.isInitialized || !this.isDragging) return;

    try {
      const point = this.getPointerCoordinates(event);
      this.movedX = point.x - this.startX;
      this.movedY = point.y - this.startY;

      const deltaX = point.x - this.lastX;
      const deltaY = point.y - this.lastY;

      this.lastX = point.x;
      this.lastY = point.y;

      if (!this.gesture) {
        const absMovedX = Math.abs(this.movedX);
        const absMovedY = Math.abs(this.movedY);

        if (
          absMovedX > this.CONFIG.DEFAULTS.GESTURE_THRESHOLD &&
          absMovedX > absMovedY
        ) {
          this.gesture = "horizontal";
          event.preventDefault();
        } else if (
          absMovedY > this.CONFIG.DEFAULTS.GESTURE_THRESHOLD &&
          absMovedY > absMovedX
        ) {
          const centerElement = this.items[Math.round(this.offset)];
          this.gesture =
            centerElement &&
            centerElement.classList.contains(this.CONFIG.CSS_CLASSES.ACTIVE)
              ? "vertical"
              : "horizontal";

          if (this.gesture === "horizontal") event.preventDefault();
        } else {
          return;
        }
      }

      if (this.gesture === "horizontal") {
        event.preventDefault();
        this.offset -= deltaX / this.CONFIG.DEFAULTS.DRAG_SENSITIVITY;
        this.renderCarousel();
      }

      if (this.gesture === "vertical" && this.activeItem && this.movedY > 20) {
        const baseY = parseFloat(this.activeItem.dataset.centerY || this.baseY);
        const newY =
          baseY + this.movedY * this.CONFIG.DEFAULTS.VERTICAL_DRAG_MULTIPLIER;
        this.setElementTransform(this.activeItem, { y: newY });
      }
    } catch (error) {
      console.warn("ScYESGameScreen: Error in gesture move:", error.message);
    }
  }

  /**
   * Handle gesture end
   */
  handleGestureEnd() {
    if (!this.isInitialized || !this.isDragging) return;

    try {
      this.isDragging = false;

      if (this.gesture === "horizontal" || this.gesture === null) {
        this.handleHorizontalGestureEnd();
      } else if (this.gesture === "vertical" && this.activeItem) {
        this.handleVerticalGestureEnd();
      }
    } catch (error) {
      console.warn("ScYESGameScreen: Error in gesture end:", error.message);
    }
  }

  /**
   * Handle horizontal gesture end
   */
  handleHorizontalGestureEnd() {
    const currentIndex = Math.round(this.offset);
    let targetIndex = currentIndex;

    if (this.movedX < -this.swipeThreshold) {
      targetIndex = currentIndex + 1;
    } else if (this.movedX > this.swipeThreshold) {
      targetIndex = currentIndex - 1;
    }

    targetIndex = Math.max(0, Math.min(this.itemCount - 1, targetIndex));

    const animation = gsap.to(this, {
      offset: targetIndex,
      ...this.CONFIG.ANIMATIONS.CAROUSEL_TRANSITION,
      onUpdate: () => this.renderCarousel(),
      onComplete: () => this.activeAnimations.delete(animation),
    });

    this.activeAnimations.add(animation);
  }

  /**
   * Handle vertical gesture end
   */
  handleVerticalGestureEnd() {
    if (Math.abs(this.movedY) < this.verticalThreshold) {
      this.snapActiveItemBack();
      return;
    }

    if (this.checkItemPocketOverlap()) {
      this.executeCardDropSequence();
    } else {
      this.snapActiveItemBack(true);
    }
  }

  /**
   * Check item-pocket overlap
   */
  checkItemPocketOverlap() {
    if (!this.activeItem) return false;

    try {
      const pocketRect = this.elements.pocket.getBoundingClientRect();
      const itemRect = this.activeItem.getBoundingClientRect();

      return (
        itemRect.bottom > pocketRect.top &&
        itemRect.left < pocketRect.right &&
        itemRect.right > pocketRect.left
      );
    } catch (error) {
      console.warn("ScYESGameScreen: Error checking overlap:", error.message);
      return false;
    }
  }

  /**
   * Snap item back
   */
  snapActiveItemBack(extended = false) {
    if (!this.activeItem) return;

    const baseY = parseFloat(this.activeItem.dataset.centerY || this.baseY);
    const animConfig = extended
      ? this.CONFIG.ANIMATIONS.SNAP_BACK_EXTENDED
      : this.CONFIG.ANIMATIONS.SNAP_BACK;

    const animation = gsap.to(this.activeItem, {
      y: baseY,
      ...animConfig,
      onComplete: () => this.activeAnimations.delete(animation),
    });

    this.activeAnimations.add(animation);
  }

  /**
   * Execute card drop sequence
   */
  executeCardDropSequence() {
    if (!this.activeItem) return;

    const dropAnimation = gsap.to(this.activeItem, {
      y: window.innerHeight + 200,
      scale: 0.45,
      opacity: 0,
      ...this.CONFIG.ANIMATIONS.CARD_DROP,
      onComplete: () => {
        this.activeAnimations.delete(dropAnimation);
        this.activeItem.style.display = "none";
        this.executeSliderFadeOut();
      },
    });

    this.activeAnimations.add(dropAnimation);
  }

  /**
   * Execute slider fade out and start API call
   */
  executeSliderFadeOut() {
    this.dispensingStartTime = Date.now();

    const fadeAnimation = gsap.to(this.elements.slider, {
      opacity: 0,
      ...this.CONFIG.ANIMATIONS.SLIDER_FADE,
      onComplete: () => {
        this.activeAnimations.delete(fadeAnimation);
        this.elements.slider.style.display = "none";

        console.log("Starting dispensing animation + API call");
        this.elements.pocket.classList.add(this.CONFIG.CSS_CLASSES.ACTIVE);
        this.elements.bgDark.classList.add(this.CONFIG.CSS_CLASSES.DISMISS);

        this.callPackOpenAPI();
      },
    });

    this.activeAnimations.add(fadeAnimation);
  }

  /**
   * Call API to open pack
   */
  async callPackOpenAPI() {
    try {
      console.log("API call started - dispensing animation running");
      this.screenManager.showLoader();

      let data;

      if (this.API_CONFIG.USE_MOCK) {
        // Mock API call with configurable delay
        console.log(
          `Mock API: Waiting ${this.API_CONFIG.MOCK_DELAY / 1000} seconds...`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, this.API_CONFIG.MOCK_DELAY)
        );
        data = this.getMockData();
        console.log("Mock API response:", data);
      } else {
        // Real API call
        const response = await this.fetchWithTimeout(
          this.API_CONFIG.PACK_OPEN_URL,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              packId: this.activeItem?.dataset.id || null,
              timestamp: Date.now(),
            }),
          },
          this.API_CONFIG.TIMEOUT
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        data = await response.json();
        console.log("API response received:", data);
      }

      this.screenManager.hideLoader();
      this.updateResultCards(data);
      await this.ensureMinimumDispensingTime();
      this.executePocketFadeOut();
    } catch (error) {
      console.error("API call failed:", error);
      this.screenManager.hideLoader();
      this.handleAPIError(error);
    }
  }

  /**
   * Fetch with timeout - UPDATED
   */
  fetchWithTimeout(url, options = {}, timeout = 65000) {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), timeout)
      ),
    ]);
  }

  /**
   * Ensure minimum dispensing time
   */
  async ensureMinimumDispensingTime() {
    const minDispensingTime = this.CONFIG.TIMING.POCKET_DELAY;

    if (!this.dispensingStartTime) {
      this.dispensingStartTime = Date.now();
    }

    const elapsed = Date.now() - this.dispensingStartTime;

    if (elapsed < minDispensingTime) {
      await new Promise((resolve) =>
        setTimeout(resolve, minDispensingTime - elapsed)
      );
    }

    this.dispensingStartTime = null;
  }

  /**
   * Update result cards with API data
   */
  updateResultCards(apiData) {
    try {
      const resultContainer = this.elements.result;

      // Update card images
      const cardElements = resultContainer.querySelectorAll(
        ".sc-year-end-spend-polaroid-game__polaroid-card-img img"
      );

      if (apiData.cards && apiData.cards.length > 0) {
        apiData.cards.forEach((card, index) => {
          if (cardElements[index]) {
            cardElements[index].src = card.imageUrl || card.image;
            cardElements[index].alt = card.name || `card-${index + 1}`;
          }
        });
      }

      // Update prize details
      const prizeDetailContainer = resultContainer.querySelector(
        ".sc-year-end-spend-polaroid-game__prize-detail"
      );

      if (prizeDetailContainer && apiData.prizes) {
        let prizeHTML = "";
        apiData.prizes.forEach((prize, index) => {
          if (index > 0) {
            prizeHTML +=
              '<div class="sc-year-end-spend-polaroid-game__line"></div>';
          }
          prizeHTML += `
            <div class="sc-year-end-spend-polaroid-game__prize-info">
              ${prize.description || prize.text}
            </div>
          `;
        });
        prizeDetailContainer.innerHTML = prizeHTML;
      }

      // Update packs left
      if (apiData.packsLeft !== undefined) {
        const packsLeftElement = document.querySelector(
          ".sc-year-end-spend-polaroid-game__card-left-no"
        );
        if (packsLeftElement) {
          packsLeftElement.textContent = apiData.packsLeft;
        }
      }

      console.log("Result cards updated with API data");
    } catch (error) {
      console.error("Error updating result cards:", error);
    }
  }

  /**
   * Handle API error
   */
  handleAPIError(error) {
    console.error("Handling API error:", error.message);

    this.screenManager.show("error", {
      onComplete: () => {
        this.resetToGameState();
      },
    });
  }

  /**
   * Get mock data for testing
   */
  getMockData() {
    return {
      success: true,
      cards: [
        {
          imageUrl: "./images/game/sc-year-end-spend-photo-card-1.png",
          name: "Dining Card",
          type: "dining",
        },
        {
          imageUrl: "./images/game/sc-year-end-spend-photo-card-2.png",
          name: "Travel Card",
          type: "travel",
        },
        {
          imageUrl: "./images/game/sc-year-end-spend-photo-card-3.png",
          name: "Luggage Card",
          type: "luggage",
        },
      ],
      prizes: [
        { description: "1 additional chance(s)<br>in the Grand Draw" },
        { description: "1 pair of flight tickets to Bali card" },
        {
          description:
            "1 Lerouy Michelin-starred dining<br>experience (for two) card",
        },
      ],
      packsLeft: 8,
      totalChances: 301,
    };
  }

  /**
   * Execute pocket fade out
   */
  executePocketFadeOut() {
    const pocketAnimation = gsap.to(this.elements.pocket, {
      opacity: 0,
      ...this.CONFIG.ANIMATIONS.POCKET_FADE,
      onComplete: () => {
        this.activeAnimations.delete(pocketAnimation);
        this.showGameResult();
      },
    });

    this.activeAnimations.add(pocketAnimation);
  }

  /**
   * Show game result
   */
  async showGameResult() {
    this.elements.slider.style.display = "none";
    this.elements.pocket.style.opacity = "0";
    this.elements.result.style.display = "block";

    await new Promise((resolve) => requestAnimationFrame(resolve));

    this.elements.result.classList.add(this.CONFIG.CSS_CLASSES.RESULT_SHOW);

    const resultAnimation = gsap.to(this.elements.result, {
      opacity: 1,
      ...this.CONFIG.ANIMATIONS.RESULT_SHOW,
      onComplete: () => {
        this.activeAnimations.delete(resultAnimation);
        this.elements.section.classList.add(
          this.CONFIG.CSS_CLASSES.ACTIVE_SCROLL
        );
        this.elements.pocket.classList.add(
          this.CONFIG.CSS_CLASSES.DISMISS_CARD
        );
      },
    });

    this.activeAnimations.add(resultAnimation);
  }

  /**
   * Get state
   */
  getState() {
    return {
      offset: this.offset,
      activeItemIndex: this.activeItem
        ? Array.from(this.items).indexOf(this.activeItem)
        : -1,
      itemCount: this.itemCount,
      isInitialized: this.isInitialized,
      gesture: this.gesture,
      isDragging: this.isDragging,
    };
  }

  /**
   * Destroy
   */
  destroy() {
    try {
      this.activeAnimations.forEach((animation) => {
        if (animation && animation.kill) animation.kill();
      });
      this.activeAnimations.clear();

      this.eventListeners.forEach(({ element, event, handler, options }) => {
        element.removeEventListener(event, handler, options);
      });
      this.eventListeners = [];

      this.isInitialized = false;
      this.activeItem = null;
      this.resetGestureState();

      console.log("ScYESGameScreen: Destroyed successfully");
    } catch (error) {
      console.warn("ScYESGameScreen: Error during destruction:", error.message);
    }
  }
}

const instance = new ScYESGameScreen();
export default instance;
