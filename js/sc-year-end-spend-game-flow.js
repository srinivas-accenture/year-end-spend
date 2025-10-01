class ScYESGameScreen {
  constructor() {
    this.generalInstance = null;

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
        POCKET_FADE: { duration: 0.4, ease: "power2.out" },
        RESULT_SHOW: { duration: 0.8, delay: 1, ease: "power2.in" },
      },

      TIMING: {
        POCKET_DELAY: 4600, // default 2600
      },
    };

    // Section Management
    this.sections = {
      result: "polaroid-result",
      slider: "polaroid-game-slider",
      pocket: "polaroid-game-pocket",
      bgDark: "polaroid-game-bg-dark",
      bgLight: "polaroid-game-bg-light",
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
    this.debugMode = true;
    this.restartButton = null;
    this.openAllButton = null;
    this.openAllPopup = null;
    this.openAllPopupBackButton = null;
    this.openAllPopupProceedButton = null;
    this.unlockButton = null;
    this.cardsAndCollectionsButton = null;
    this.campaignConfig = null;
    this.closeButton = null;
  }

  // Set the general instance
  setGeneralInstance(instance) {
    this.generalInstance = instance;
  }

  /**
   * Initialize the game
   */
  init() {
    try {
      this.loadAndCacheConfig();
      this.initializeElements();
      this.parseDatasetConfiguration();
      this.setupGameState();
      this.bindEventListeners();
      this.updateLayoutDimensions();
      this.renderCarousel();
      this.isInitialized = true;
    } catch (error) {
      console.error("ScYESGameScreen: Initialization failed:", error.message);
      throw error;
    }
  }

  /**
   * Initialize DOM elements and validate their existence
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

    // Initialize slider visibility
    this.elements.slider.style.display = "block";

    // Find slider items
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
   * Parse configuration from HTML dataset attributes
   */
  parseDatasetConfiguration() {
    const dataset = this.elements.slider.dataset;

    // Override defaults with dataset values if present
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
   * Setup initial game state values
   */
  setupGameState() {
    this.itemCount = this.items.length;
    this.offset = Math.floor(this.itemCount / 2);
    this.maxIndex = this.angles.length - 1;
    this.activeItem = null;
    this.resetGestureState();
  }

  /**
   * Reset gesture tracking state
   */
  resetGestureState() {
    this.startX = this.startY = this.lastX = this.lastY = 0;
    this.movedX = this.movedY = 0;
    this.gesture = null;
    this.isDragging = false;
  }

  /**
   * Simple show section method
   * @param {string} sectionName - Name from this.sections
   */
  showSection(sectionName) {
    const elementId = this.sections[sectionName];
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.style.display = "block";
        element.style.visibility = "visible";
        element.style.opacity = "1";

        // Special handling for slider positioning
        if (sectionName === "slider") {
          element.style.position = "absolute";
          element.style.zIndex = "10";
        }
      }
    }
  }

  /**
   * Simple hide section method
   * @param {string} sectionName - Name from this.sections
   */
  hideSection(sectionName) {
    const elementId = this.sections[sectionName];
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.style.display = "none";
      }
    }
  }

  /**
   * Show multiple sections at once
   * @param {string[]} sectionNames - Array of section names
   */
  showSections(sectionNames) {
    sectionNames.forEach((section) => this.showSection(section));
  }

  /**
   * Hide multiple sections at once
   * @param {string[]} sectionNames - Array of section names
   */
  hideSections(sectionNames) {
    sectionNames.forEach((section) => this.hideSection(section));
  }

  /**
   * Switch between sections - hide some, show others
   * @param {string[]} hideList - Sections to hide
   * @param {string[]} showList - Sections to show
   */
  switchSections(hideList = [], showList = []) {
    this.hideSections(hideList);
    this.showSections(showList);
  }

  /**
   * Show result page
   */
  showResultState() {
    this.switchSections(
      ["slider", "pocket"], // hide
      ["result"] // show
    );
  }

  /**
   * Bind all event listeners with proper cleanup tracking
   */
  bindEventListeners() {
    // Window resize
    this.addEventListenerWithCleanup(window, "resize", () => {
      this.updateLayoutDimensions();
      this.renderCarousel();
    });

    // Touch events
    this.addEventListenerWithCleanup(
      document,
      "touchstart",
      (e) => {
        this.handleGestureStart(e);
      },
      { passive: true }
    );

    this.addEventListenerWithCleanup(
      document,
      "touchmove",
      (e) => {
        this.handleGestureMove(e);
      },
      { passive: false }
    );

    this.addEventListenerWithCleanup(
      document,
      "touchend",
      () => {
        this.handleGestureEnd();
      },
      { passive: true }
    );

    // Mouse events
    this.addEventListenerWithCleanup(document, "mousedown", (e) => {
      if (e.button === 0) {
        this.handleGestureStart(e);
      }
    });

    this.addEventListenerWithCleanup(document, "mousemove", (e) => {
      this.handleGestureMove(e);
    });

    this.addEventListenerWithCleanup(document, "mouseup", () => {
      this.handleGestureEnd();
    });

    // Restart button handler
    try {
      this.restartButton = document.querySelector(
        ".sc-year-end-spend-polaroid-game__open-another"
      );

      if (this.restartButton) {
        this.addEventListenerWithCleanup(this.restartButton, "click", (e) => {
          this.showSliderScreen();
        });
      }
    } catch (error) {
      console.warn("Error binding restart button:", error.message);
    }
    try {
      this.openAllPopup = document.querySelector(
        ".sc-year-end-spend-polaroid-game-open-all-popup"
      );
      this.openAllButton = document.querySelector(
        ".sc-year-end-spend-polaroid-game__open-all"
      );

      this.openAllPopupBackButton = document.querySelector(
        ".sc-year-end-spend-polaroid-game-open-all-popup__back"
      );
      this.openAllPopupProceedButton = document.querySelector(
        ".sc-year-end-spend-polaroid-game-open-all-popup__button-view-details"
      );
      if (this.openAllPopupProceedButton) {
        this.addEventListenerWithCleanup(
          this.openAllPopupProceedButton,
          "click",
          (e) => {
            this.hideSection("slider");
            this.openAllPopup.classList.add(
              "sc-year-end-spend-polaroid-game-open-all-popup--hide"
            );
            this.resetToGameState();
            this.executeSliderFadeOut("all");
          }
        );
      }
      if (this.openAllPopupBackButton) {
        this.addEventListenerWithCleanup(
          this.openAllPopupBackButton,
          "click",
          (e) => {
            this.openAllPopup.classList.add(
              "sc-year-end-spend-polaroid-game-open-all-popup--hide"
            );
          }
        );
      }

      if (this.openAllButton) {
        this.addEventListenerWithCleanup(this.openAllButton, "click", (e) => {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });

          this.openAllPopup.classList.remove(
            "sc-year-end-spend-polaroid-game-open-all-popup--hide"
          );
        });
      }
    } catch (error) {
      console.warn("Error binding restart button:", error.message);
    }
    try {
      this.unlockButton = document.querySelector(
        ".sc-year-end-spend-polaroid-game__unlock-packs"
      );

      console.log("Unlock button found:", this.unlockButton);

      if (this.unlockButton) {
        this.addEventListenerWithCleanup(this.unlockButton, "click", (e) => {
          console.log("✅ Unlock button clicked!", e);
          if (
            this.generalInstance &&
            this.generalInstance.showInstructionPage
          ) {
            console.log("Using generalInstance instead");
            this.generalInstance.showInstructionPage("game-screen");
          } else {
            console.error(
              "Neither gameflowInstance nor generalInstance available"
            );
          }
        });

        console.log("✅ Unlock button event listener attached");
      } else {
        console.warn("Unlock button not found in DOM");
      }
    } catch (error) {
      console.error("Error binding unlock button:", error);
    }
    try {
      this.cardsAndCollectionsButton = document.querySelector(
        ".sc-year-end-spend-polaroid-game__cards-collections"
      );

      console.log(
        "Cards and Collections button found:",
        this.cardsAndCollectionsButton
      );

      if (this.cardsAndCollectionsButton) {
        this.addEventListenerWithCleanup(
          this.cardsAndCollectionsButton,
          "click",
          (e) => {
            console.log("✅ Cards and Collections button clicked!", e);
            if (
              this.generalInstance &&
              this.generalInstance.showCardCollectionPage
            ) {
              console.log("Using generalInstance instead");
              this.generalInstance.showCardCollectionPage("game-screen");
            } else {
              console.error(
                "Neither gameflowInstance nor generalInstance available"
              );
            }
          }
        );

        console.log("✅ Unlock button event listener attached");
      } else {
        console.warn("Unlock button not found in DOM");
      }
    } catch (error) {
      console.error("Error binding unlock button:", error);
    }
    try {
      this.closeButton = document.querySelector(
        ".sc-year-end-spend-polaroid-game__header-close"
      );
      if (this.closeButton) {
        this.addEventListenerWithCleanup(this.closeButton, "click", (e) => {
          this.generalInstance.showLandingPage("game-screen");
        });
      } else {
        console.warn("Close button not found in DOM");
      }
    } catch (error) {
      console.error("Error binding close button:", error);
    }
  }

  /**
   * Add event listener with cleanup tracking
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
   * Update layout dimensions based on current element sizes
   */
  updateLayoutDimensions() {
    try {
      if (this.items.length === 0) return;

      // Update item dimensions from actual DOM
      const firstItem = this.items[0];
      if (firstItem) {
        this.itemWidth = firstItem.offsetWidth || this.itemWidth;
        this.itemHeight = firstItem.offsetHeight || this.itemHeight;
      }

      // Calculate base position for centering
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
   * Calculate angle for item at given position
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
   * Calculate scale for item at given position
   */
  calculateItemScale(position) {
    const absPosition = Math.abs(position);
    return Math.max(
      1 - absPosition * this.CONFIG.DEFAULTS.SCALE_STEP,
      this.CONFIG.DEFAULTS.MIN_SCALE
    );
  }

  /**
   * Calculate z-index for item at given position
   */
  calculateItemZIndex(position) {
    const absPosition = Math.abs(position);
    return Math.round(
      this.CONFIG.DEFAULTS.Z_INDEX_BASE -
        absPosition * this.CONFIG.DEFAULTS.Z_INDEX_STEP
    );
  }

  /**
   * Render the carousel with all items positioned
   */
  renderCarousel() {
    if (!this.items || this.items.length === 0) return;

    try {
      this.activeItem = null;
      const centerIndex = Math.round(this.offset);

      this.items.forEach((element, index) => {
        const position = index - this.offset;
        const absPosition = Math.abs(position);

        // Hide items that are too far from center
        if (absPosition > this.maxIndex + 0.5) {
          this.setElementTransform(element, {
            opacity: 0,
            pointerEvents: "none",
          });
          element.classList.remove(this.CONFIG.CSS_CLASSES.ACTIVE);
          return;
        }

        // Calculate item properties
        const x = this.baseX + position * this.spacingX;
        const y = this.baseY - Math.pow(position, 2) * this.curveIntensity;
        const angle = this.calculateItemAngle(position);
        const scale = this.calculateItemScale(position);
        const zIndex = this.calculateItemZIndex(position);

        // Apply transforms
        this.setElementTransform(element, {
          x,
          y,
          scale,
          rotation: angle,
          zIndex,
          opacity: 1,
          pointerEvents: "auto",
        });

        // Manage active state
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
   * Set element transform using GSAP
   */
  setElementTransform(element, properties) {
    gsap.set(element, properties);
  }

  /**
   * Get pointer coordinates from mouse or touch event
   */
  getPointerCoordinates(event) {
    if (event.touches && event.touches.length > 0) {
      return {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
    }
    return {
      x: event.clientX,
      y: event.clientY,
    };
  }

  /**
   * Handle gesture start (touch/mouse down)
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
   * Handle gesture move (touch/mouse move)
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

      // Determine gesture type if not already determined
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

          if (this.gesture === "horizontal") {
            event.preventDefault();
          }
        } else {
          return;
        }
      }

      // Handle horizontal carousel movement
      if (this.gesture === "horizontal") {
        event.preventDefault();
        this.offset -= deltaX / this.CONFIG.DEFAULTS.DRAG_SENSITIVITY;
        this.renderCarousel();
      }

      // Handle vertical item dragging
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
   * Handle gesture end (touch/mouse up)
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
   * Handle end of horizontal carousel gesture
   */
  handleHorizontalGestureEnd() {
    const currentIndex = Math.round(this.offset);
    let targetIndex = currentIndex;

    // Determine swipe direction
    if (this.movedX < -this.swipeThreshold) {
      targetIndex = currentIndex + 1;
    } else if (this.movedX > this.swipeThreshold) {
      targetIndex = currentIndex - 1;
    }

    // Clamp to valid range
    targetIndex = Math.max(0, Math.min(this.itemCount - 1, targetIndex));

    // Animate to target
    const animation = gsap.to(this, {
      offset: targetIndex,
      ...this.CONFIG.ANIMATIONS.CAROUSEL_TRANSITION,
      onUpdate: () => this.renderCarousel(),
      onComplete: () => {
        this.activeAnimations.delete(animation);
      },
    });

    this.activeAnimations.add(animation);
  }

  /**
   * Handle end of vertical drag gesture
   */
  handleVerticalGestureEnd() {
    if (Math.abs(this.movedY) < this.verticalThreshold) {
      this.snapActiveItemBack();
      return;
    }

    // Check if item overlaps with pocket
    if (this.checkItemPocketOverlap()) {
      this.executeCardDropSequence();
    } else {
      this.snapActiveItemBack(true);
    }
  }

  /**
   * Check if active item overlaps with pocket
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
   * Snap active item back to original position
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
      onComplete: () => {
        this.activeAnimations.delete(animation);
      },
    });

    this.activeAnimations.add(animation);
  }

  /**
   * Execute complete card drop animation sequence
   */
  executeCardDropSequence() {
    if (!this.activeItem) return;

    // Phase 1: Drop the card
    const dropAnimation = gsap.to(this.activeItem, {
      y: window.innerHeight + 200,
      scale: 0.45,
      opacity: 0,
      ...this.CONFIG.ANIMATIONS.CARD_DROP,
      onComplete: () => {
        this.activeAnimations.delete(dropAnimation);
        this.activeItem.style.display = "none";
        this.executeSliderFadeOut("one");
      },
    });

    this.activeAnimations.add(dropAnimation);
  }

  /**
   * Execute slider fade out animation
   */
  executeSliderFadeOut(chances = "one") {
    const fadeAnimation = gsap.to(this.elements.slider, {
      opacity: 0,
      ...this.CONFIG.ANIMATIONS.SLIDER_FADE,
      onComplete: () => {
        // const gamePocket = document.querySelector(
        //   ".sc-year-end-spend-polaroid-game__pocket"
        // );
        // gamePocket.style.display = "block !important";
        this.activeAnimations.delete(fadeAnimation);
        this.elements.slider.style.display = "none";

        // console.log("Adding active class to pocket for dispensing animation");
        this.elements.pocket.classList.add(this.CONFIG.CSS_CLASSES.ACTIVE);
        this.elements.bgDark.classList.add(this.CONFIG.CSS_CLASSES.DISMISS);
        // impression call for pack dispense
        this.generalInstance.handleClickImpressionOnEvent(
          this.elements.slider,
          "game-play",
          chances.toLowerCase()
        );
        // Get a session item
        const collectedCurrentCardGroup =
          sessionStorage.getItem("currentCardGroup");
        console.log(
          "🚀 ~ ScYESGameScreen ~ executeSliderFadeOut ~ value:",
          collectedCurrentCardGroup
        );

        // setTimeout(() => {
        //   console.log("About to execute pocket fade out after delay");
        //   this.executePocketFadeOut(chances);
        // }, this.CONFIG.TIMING.POCKET_DELAY);
      },
    });

    this.activeAnimations.add(fadeAnimation);
  }

  /**
   * Execute pocket fade out animation
   */
  executePocketFadeOut(chances = "one") {
    const pocketAnimation = gsap.to(this.elements.pocket, {
      opacity: 0,
      ...this.CONFIG.ANIMATIONS.POCKET_FADE,
      onComplete: () => {
        this.activeAnimations.delete(pocketAnimation);
        this.showGameResult(chances);
      },
    });

    this.activeAnimations.add(pocketAnimation);
  }

  /**
   * Show final game result with animation - ORIGINAL behavior for first completion
   */
  showGameResult(chances = "one") {
    this.showResultState();
    this.updateResultFromSessionStorage(chances);
    // CRITICAL: Use requestAnimationFrame to ensure class is added in next render cycle
    // This allows the browser to properly recognize the state change and trigger CSS animations
    requestAnimationFrame(() => {
      // Original result animation - no card reset needed on first play
      const resultAnimation = gsap.to(this.elements.result, {
        opacity: 1,
        ...this.CONFIG.ANIMATIONS.RESULT_SHOW,
        onComplete: () => {
          this.activeAnimations.delete(resultAnimation);
        },
      });

      this.activeAnimations.add(resultAnimation);

      // Add CSS classes for final state - this triggers the CSS animations naturally
      this.elements.result.classList.add(this.CONFIG.CSS_CLASSES.RESULT_SHOW);
      this.elements.section.classList.add(
        this.CONFIG.CSS_CLASSES.ACTIVE_SCROLL
      );
      this.elements.pocket.classList.add(this.CONFIG.CSS_CLASSES.DISMISS_CARD);
    });
  }

  /**
   * Get current game state
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
   * Log current game state
   */
  logCurrentState() {
    if (this.debugMode) {
      // console.log("Current state:", this.getState());
    }
  }

  /**
   * Clean up all resources and remove event listeners
   */
  destroy() {
    try {
      // Kill all active animations
      this.activeAnimations.forEach((animation) => {
        if (animation && animation.kill) {
          animation.kill();
        }
      });
      this.activeAnimations.clear();

      // Remove all event listeners
      this.eventListeners.forEach(({ element, event, handler, options }) => {
        element.removeEventListener(event, handler, options);
      });
      this.eventListeners = [];

      // Reset state
      this.isInitialized = false;
      this.activeItem = null;
      this.resetGestureState();

      // console.log("ScYESGameScreen: Destroyed successfully");
    } catch (error) {
      console.warn("ScYESGameScreen: Error during destruction:", error.message);
    }
  }

  /**
   * Restart the game (clean destroy and reinitialize)
   */
  restart() {
    this.destroy();
    setTimeout(() => {
      this.init();
    }, 100);
  }

  /**
   * Show slider/game screen
   */
  resetToGameState() {
    console.log("Resetting game to initial state");

    // Kill all animations
    this.activeAnimations.forEach((animation) => {
      if (animation && animation.kill) animation.kill();
    });
    this.activeAnimations.clear();

    // Show slider elements first
    this.showSections(["slider", "pocket", "bgDark"]);

    // Hide result elements
    this.hideSection("result");

    // Clear all transforms and classes from items
    this.items.forEach((item) => {
      item.classList.remove("active");
      gsap.set(item, { clearProps: "all" });
      item.style.display = "block";
      item.style.opacity = "1";
      item.style.visibility = "visible";
    });

    // Reset pocket
    if (this.elements.pocket) {
      this.elements.pocket.classList.remove("active", "dismiss-card");
      gsap.set(this.elements.pocket, { clearProps: "all" });
      this.elements.pocket.style.opacity = "1";
      this.elements.pocket.style.visibility = "visible";
    }

    // Reset background
    if (this.elements.bgDark) {
      this.elements.bgDark.classList.remove("dismiss");
      gsap.set(this.elements.bgDark, { clearProps: "all" });
    }

    // Reset result
    if (this.elements.result) {
      this.elements.result.classList.remove("result-show");
      this.elements.result.style.opacity = "0";
    }

    // Reset section
    if (this.elements.section) {
      this.elements.section.classList.remove("active-scroll");
    }

    // CRITICAL: Reset game state BEFORE rendering
    this.resetGestureState();
    this.activeItem = null;
    this.offset = Math.floor(this.itemCount / 2); // Force center

    // Update dimensions and render
    this.updateLayoutDimensions();
    //this.renderCarousel();

    console.log(
      `Slider reset complete - Center index: ${Math.floor(
        this.itemCount / 2
      )}, Current offset: ${this.offset}`
    );
  }

  showSliderScreen() {
    this.resetToGameState();
    this.renderCarousel();
  }

  /**
   * Show game section (parent container)
   */
  showGameSection() {
    if (this.elements.section) {
      this.elements.section.classList.remove(
        "sc-year-end-spend-polaroid-game--hide"
      );
    }
    this.showSliderScreen();
  }

  /**
   * Hide game section
   */
  hideGameSection() {
    console.log("Hiding game section - cleaning up");

    // Reset everything first
    this.resetToGameState();

    // Then hide
    if (this.elements.section) {
      this.elements.section.classList.add(
        "sc-year-end-spend-polaroid-game--hide"
      );
    }
  }
  /**
   * Update result screen with data from session storage
   * @param {string} playType - "one" for single play, "all" for open all
   */
  // updateResultFromSessionStorageold(playType = "one") {
  //   try {
  //     if (typeof sessionStorage === "undefined") {
  //       return false;
  //     }

  //     if (!this.campaignConfig) {
  //       console.error("Campaign config not loaded");
  //       return false;
  //     }

  //     const rewardConfig = this.campaignConfig;
  //     const currentCardGroupRaw = sessionStorage.getItem("currentCardGroup");
  //     if (!currentCardGroupRaw) {
  //       return false;
  //     }

  //     let currentCardGroupData;
  //     try {
  //       currentCardGroupData = JSON.parse(currentCardGroupRaw);
  //       console.log(
  //         "🚀 ~ ScYESGameScreen ~ updateResultFromSessionStorage ~ currentCardGroupData:",
  //         currentCardGroupData
  //       );
  //     } catch (parseError) {
  //       console.error("Failed to parse currentCardGroup JSON:", parseError);
  //       return false;
  //     }

  //     if (
  //       !Array.isArray(currentCardGroupData) ||
  //       currentCardGroupData.length === 0
  //     ) {
  //       console.error("currentCardGroup is not a valid array or is empty");
  //       return false;
  //     }

  //     const firstGroup = currentCardGroupData[0];
  //     if (!firstGroup || typeof firstGroup !== "object") {
  //       console.error("Invalid first group structure");
  //       return false;
  //     }

  //     const groupKey = Object.keys(firstGroup)[0];
  //     if (!groupKey) {
  //       console.error("No group key found in first group");
  //       return false;
  //     }

  //     const currentCardGroup = firstGroup[groupKey];
  //     if (!Array.isArray(currentCardGroup) || currentCardGroup.length === 0) {
  //       console.error("No rewards array found in group:", groupKey);
  //       return false;
  //     }

  //     // GROUP BY RewardType ONLY and get config details
  //     const groupedRewards = {};

  //     currentCardGroup.forEach((reward) => {
  //       const rewardType = reward.RewardType || "Unknown";
  //       const rewardProvider = reward.RewardProvider || "Unknown";
  //       // Get config details based on type and provider
  //       const configDetails = this.getRewardConfigDetails(
  //         rewardType,
  //         rewardProvider,
  //         rewardConfig
  //       );

  //       if (!groupedRewards[rewardType]) {
  //         groupedRewards[rewardType] = [];
  //       }

  //       groupedRewards[rewardType].push({
  //         ...reward,
  //         configDetails,
  //       });
  //     });

  //     console.log("Grouped rewards by type:", groupedRewards);

  //     const cardResultContainer = document.querySelector(
  //       ".sc-year-end-spend-polaroid-game__polaroid-card-result"
  //     );

  //     if (!cardResultContainer) {
  //       console.error("Card result container not found");
  //       return false;
  //     }

  //     cardResultContainer.innerHTML = "";

  //     if (playType === "all") {
  //       const defaultCards = window.prizeDefaultImages || [];

  //       defaultCards.forEach((imagePath, index) => {
  //         const cardHTML = `
  //         <div class="sc-year-end-spend-polaroid-game__polaroid-card">
  //           <div class="sc-year-end-spend-polaroid-game__polaroid-card-img">
  //             <img src="${imagePath}" alt="card-${index + 1}">
  //           </div>
  //           <div class="sc-year-end-spend-polaroid-game__polaroid-card-text">
  //           </div>
  //         </div>
  //       `;
  //         cardResultContainer.innerHTML += cardHTML;
  //       });
  //     } else {
  //       Object.entries(groupedRewards).forEach(([rewardType, rewards]) => {
  //         rewards.forEach((reward) => {
  //           console.log(
  //             "🚀 ~ ScYESGameScreen ~ updateResultFromSessionStorage ~ reward:",
  //             reward
  //           );
  //           const cardHTML = `
  //           <div class="sc-year-end-spend-polaroid-game__polaroid-card">
  //             <div class="sc-year-end-spend-polaroid-game__polaroid-card-img">
  //               <img src="${reward.configDetails.image}"
  //                    alt="${rewardType} card">
  //             </div>
  //             <div class="sc-year-end-spend-polaroid-game__polaroid-card-text">
  //               <!--{reward.configDetails.providerName}-->
  //             </div>
  //           </div>
  //         `;
  //           cardResultContainer.innerHTML += cardHTML;
  //         });
  //       });
  //     }

  //     const prizeDetailScroll = document.querySelector(
  //       ".sc-year-end-spend-polaroid-game__prize-detail-scroll-cell"
  //     );

  //     if (!prizeDetailScroll) {
  //       console.error("Prize detail scroll container not found");
  //       return false;
  //     }

  //     let prizeHTML = "";

  //     if (playType === "one") {
  //       // GROUPED: Group by RewardType and show counts
  //       const groupedRewards = {};

  //       currentCardGroup.forEach((reward) => {
  //         const rewardType = reward.RewardType || "Unknown";

  //         if (!groupedRewards[rewardType]) {
  //           groupedRewards[rewardType] = [];
  //         }

  //         groupedRewards[rewardType].push(reward);
  //       });

  //       Object.entries(groupedRewards).forEach(([rewardType, rewards]) => {
  //         const count = rewards.length;
  //         const firstReward = rewards[0];
  //         const rewardProvider = firstReward.RewardProvider || "Unknown";

  //         const configDetails = this.getRewardConfigDetails(
  //           rewardType,
  //           rewardProvider,
  //           rewardConfig
  //         );
  //         const description = this.buildPrizeDescription(
  //           rewardType,
  //           count,
  //           configDetails
  //         );

  //         prizeHTML += `
  //         <div class="sc-year-end-spend-polaroid-game__prize-info">
  //           ${description}
  //         </div>
  //       `;
  //       });
  //     } else {
  //       // INDIVIDUAL: List each card separately with count of 1
  //       currentCardGroup.forEach((reward) => {
  //         const rewardType = reward.RewardType || "Unknown";
  //         const rewardProvider = reward.RewardProvider || "Unknown";

  //         const configDetails = this.getRewardConfigDetails(
  //           rewardType,
  //           rewardProvider,
  //           rewardConfig
  //         );
  //         const description = this.buildPrizeDescription(
  //           rewardType,
  //           1,
  //           configDetails
  //         );

  //         prizeHTML += `
  //         <div class="sc-year-end-spend-polaroid-game__prize-info">
  //           ${description}
  //         </div>
  //       `;
  //       });
  //     }

  //     prizeDetailScroll.innerHTML = prizeHTML;

  //     // Update packs count and button visibility
  //     this.updatePacksAndButtons();

  //     return true;
  //   } catch (error) {
  //     console.error("Critical error in updateResultFromSessionStorage:", error);
  //     return false;
  //   }
  // }
  /**
   * Update result screen with data from session storage
   * @param {string} playType - "one" for single play, "all" for open all
   * @param {boolean} groupByType - true to group by RewardType, false to list all individually
   */
  updateResultFromSessionStorageV1(playType = "one", groupByType = false) {
    try {
      if (typeof sessionStorage === "undefined") {
        console.error("SessionStorage is not available");
        return false;
      }

      console.log("Play type:", playType);

      const rewardConfig = this.campaignConfig; // Your cached config

      const currentCardGroupRaw = sessionStorage.getItem("currentCardGroup");
      if (!currentCardGroupRaw) {
        console.error("No 'currentCardGroup' found in session storage");
        return false;
      }

      let currentCardGroupData;
      try {
        currentCardGroupData = JSON.parse(currentCardGroupRaw);
      } catch (parseError) {
        console.error("Failed to parse currentCardGroup JSON:", parseError);
        return false;
      }

      if (
        !Array.isArray(currentCardGroupData) ||
        currentCardGroupData.length === 0
      ) {
        console.error("currentCardGroup is not a valid array or is empty");
        return false;
      }

      // FLATTEN ALL REWARD GROUPS INTO SINGLE ARRAY
      let allRewards = [];

      if (playType === "all") {
        // For "all", flatten all groups
        currentCardGroupData.forEach((groupObj) => {
          const groupKey = Object.keys(groupObj)[0];
          const rewards = groupObj[groupKey];
          if (Array.isArray(rewards)) {
            allRewards = allRewards.concat(rewards);
          }
        });
        console.log(
          `Open All - Total rewards across ${currentCardGroupData.length} groups:`,
          allRewards.length
        );
      } else {
        // For "one", use only first group
        const firstGroup = currentCardGroupData[0];
        const groupKey = Object.keys(firstGroup)[0];
        allRewards = firstGroup[groupKey];
        console.log("Single play - rewards:", allRewards.length);
      }

      console.log("All rewards to process:", allRewards);

      // Update card images
      const cardResultContainer = document.querySelector(
        ".sc-year-end-spend-polaroid-game__polaroid-card-result"
      );

      if (!cardResultContainer) {
        console.error("Card result container not found");
        return false;
      }

      cardResultContainer.innerHTML = "";

      // Show default images for "all", dynamic for "one"
      if (playType === "all") {
        const defaultCards = [
          "./images/game/sc-year-end-spend-photo-card-1.png",
          "./images/game/sc-year-end-spend-photo-card-2.png",
          "./images/game/sc-year-end-spend-photo-card-3.png",
          "./images/game/sc-year-end-spend-photo-card-1.png",
          "./images/game/sc-year-end-spend-photo-card-2.png",
        ];

        defaultCards.forEach((imagePath, index) => {
          cardResultContainer.innerHTML += `
          <div class="sc-year-end-spend-polaroid-game__polaroid-card">
            <div class="sc-year-end-spend-polaroid-game__polaroid-card-img">
              <img src="${imagePath}" alt="card-${index + 1}">
            </div>
            <!--<div class="sc-year-end-spend-polaroid-game__polaroid-card-text"></div>-->
          </div>
        `;
        });
      } else {
        // Dynamic images for single play
        allRewards.forEach((reward) => {
          const rewardType = reward.RewardType || "Unknown";
          const rewardProvider = reward.RewardProvider || "Unknown";
          const configDetails = this.getRewardConfigDetails(
            rewardType,
            rewardProvider,
            rewardConfig
          );

          cardResultContainer.innerHTML += `
          <div class="sc-year-end-spend-polaroid-game__polaroid-card">
            <div class="sc-year-end-spend-polaroid-game__polaroid-card-img">
              <img src="${configDetails.image}" alt="${rewardType} card">
            </div>
            <!--<div class="sc-year-end-spend-polaroid-game__polaroid-card-text">
              ${configDetails.providerName}
            </div> -->
          </div>
        `;
        });
      }

      // BUILD PRIZE DETAILS - Always show aggregated counts for "all"
      const prizeDetailScroll = document.querySelector(
        ".sc-year-end-spend-polaroid-game__prize-detail-scroll-cell"
      );

      if (!prizeDetailScroll) {
        console.error("Prize detail scroll container not found");
        return false;
      }

      let prizeHTML = "";

      if (playType === "all" || groupByType) {
        // GROUP AND AGGREGATE - Count by RewardType
        const aggregatedRewards = {};

        allRewards.forEach((reward) => {
          const rewardType = reward.RewardType || "Unknown";

          if (!aggregatedRewards[rewardType]) {
            aggregatedRewards[rewardType] = {
              count: 0,
              totalAmount: 0,
              providers: new Set(),
              firstReward: reward,
            };
          }

          aggregatedRewards[rewardType].count++;
          aggregatedRewards[rewardType].totalAmount += reward.RewardAmount || 0;
          aggregatedRewards[rewardType].providers.add(reward.RewardProvider);
        });

        console.log("Aggregated rewards:", aggregatedRewards);

        // Build prize HTML from aggregated data
        Object.entries(aggregatedRewards).forEach(([rewardType, data]) => {
          const firstReward = data.firstReward;
          const rewardProvider = firstReward.RewardProvider || "Unknown";
          const configDetails = this.getRewardConfigDetails(
            rewardType,
            rewardProvider,
            rewardConfig
          );

          let description = "";

          // Special handling for GrandPrizeDraw - show total amount
          if (rewardType === "GrandPrizeDraw") {
            description = `${data.totalAmount} additional chance(s)<br>in the Grand Draw`;
          } else {
            // For others, show count
            description = this.buildPrizeDescription(
              rewardType,
              data.count,
              configDetails
            );
          }

          prizeHTML += `
          <div class="sc-year-end-spend-polaroid-game__prize-info">
            ${description}
          </div>
        `;
        });
      } else {
        // INDIVIDUAL LIST - Show each card separately
        allRewards.forEach((reward) => {
          const rewardType = reward.RewardType || "Unknown";
          const rewardProvider = reward.RewardProvider || "Unknown";
          const configDetails = this.getRewardConfigDetails(
            rewardType,
            rewardProvider,
            rewardConfig
          );
          const description = this.buildPrizeDescription(
            rewardType,
            1,
            configDetails
          );

          prizeHTML += `
          <div class="sc-year-end-spend-polaroid-game__prize-info">
            ${description}
          </div>
        `;
        });
      }

      prizeDetailScroll.innerHTML = prizeHTML;

      // Update packs and buttons
      this.updatePacksAndButtons();

      console.log(`Result screen updated for playType: ${playType}`);
      return true;
    } catch (error) {
      console.error("Critical error in updateResultFromSessionStorage:", error);
      return false;
    }
  }
  /**
   * Update result screen with data from session storage
   * @param {string} playType - "one" for single play, "all" for open all
   * @param {boolean} groupByType - true to group by RewardType, false to list all individually
   */
  updateResultFromSessionStorage(playType = "one", groupByType = false) {
    try {
      if (typeof sessionStorage === "undefined") {
        console.error("SessionStorage is not available");
        return false;
      }

      console.log("Play type:", playType, "Group by type:", groupByType);

      // Use cached config
      const rewardConfig = this.campaignConfig;
      if (!rewardConfig) {
        console.error("Campaign config not loaded");
        return false;
      }

      const currentCardGroupRaw = sessionStorage.getItem("currentCardGroup");
      if (!currentCardGroupRaw) {
        console.error("No 'currentCardGroup' found in session storage");
        return false;
      }

      let currentCardGroupData;
      try {
        currentCardGroupData = JSON.parse(currentCardGroupRaw);
      } catch (parseError) {
        console.error("Failed to parse currentCardGroup JSON:", parseError);
        return false;
      }

      if (
        !Array.isArray(currentCardGroupData) ||
        currentCardGroupData.length === 0
      ) {
        console.error("currentCardGroup is not a valid array or is empty");
        return false;
      }

      // FLATTEN ALL REWARD GROUPS INTO SINGLE ARRAY
      let allRewards = [];

      if (playType === "all") {
        // For "all", flatten all groups
        currentCardGroupData.forEach((groupObj) => {
          const groupKey = Object.keys(groupObj)[0];
          const rewards = groupObj[groupKey];
          if (Array.isArray(rewards)) {
            allRewards = allRewards.concat(rewards);
          }
        });
        console.log(
          `Open All - Total rewards across ${currentCardGroupData.length} groups:`,
          allRewards.length
        );
      } else {
        // For "one", use only first group
        const firstGroup = currentCardGroupData[0];
        const groupKey = Object.keys(firstGroup)[0];
        allRewards = firstGroup[groupKey];
        console.log("Single play - rewards:", allRewards.length);
      }

      console.log("All rewards to process:", allRewards);

      // UPDATE CARD IMAGES
      const cardResultContainer = document.querySelector(
        ".sc-year-end-spend-polaroid-game__polaroid-card-result"
      );

      if (!cardResultContainer) {
        console.error("Card result container not found");
        return false;
      }

      cardResultContainer.innerHTML = "";

      if (playType === "all") {
        // Show 5 default placeholder images for "all"
        const defaultCards = window.prizeDefaultImages || [];

        defaultCards.forEach((imagePath, index) => {
          cardResultContainer.innerHTML += `
          <div class="sc-year-end-spend-polaroid-game__polaroid-card">
            <div class="sc-year-end-spend-polaroid-game__polaroid-card-img">
              <img src="${imagePath}" alt="card-${index + 1}">
            </div>
            <!--<div class="sc-year-end-spend-polaroid-game__polaroid-card-text"></div>-->
          </div>
        `;
        });
      } else {
        // Show dynamic images based on rewards for "one"
        allRewards.forEach((reward) => {
          const rewardType = reward.RewardType || "Unknown";
          const rewardProvider = reward.RewardProvider || "Unknown";
          const configDetails = this.getRewardConfigDetails(
            rewardType,
            rewardProvider,
            rewardConfig
          );

          cardResultContainer.innerHTML += `
          <div class="sc-year-end-spend-polaroid-game__polaroid-card">
            <div class="sc-year-end-spend-polaroid-game__polaroid-card-img">
              <img src="${configDetails.image}" alt="${rewardType} card">
            </div>
            <!--<div class="sc-year-end-spend-polaroid-game__polaroid-card-text">
              ${configDetails.providerName}
            </div>-->
          </div>
        `;
        });
      }

      // UPDATE PRIZE DETAILS
      const prizeDetailScroll = document.querySelector(
        ".sc-year-end-spend-polaroid-game__prize-detail-scroll-cell"
      );

      if (!prizeDetailScroll) {
        console.error("Prize detail scroll container not found");
        return false;
      }

      let prizeHTML = "";

      if (playType === "all" || groupByType) {
        // GROUPED: Aggregate by RewardType with provider counts
        const aggregatedRewards = {};

        allRewards.forEach((reward) => {
          const rewardType = reward.RewardType || "Unknown";
          const rewardProvider = reward.RewardProvider || "Unknown";

          if (!aggregatedRewards[rewardType]) {
            aggregatedRewards[rewardType] = {
              count: 0,
              providerCounts: {},
              firstReward: reward,
            };
          }

          aggregatedRewards[rewardType].count++;
          aggregatedRewards[rewardType].totalAmount += reward.RewardAmount || 0;

          // Count each provider
          if (!aggregatedRewards[rewardType].providerCounts[rewardProvider]) {
            aggregatedRewards[rewardType].providerCounts[rewardProvider] = 0;
          }
          aggregatedRewards[rewardType].providerCounts[rewardProvider]++;
        });

        console.log("Aggregated rewards with providers:", aggregatedRewards);

        // Build prize HTML from aggregated data
        Object.entries(aggregatedRewards).forEach(([rewardType, data]) => {
          const description = this.buildPrizeDescriptionForALL(
            rewardType,
            data,
            rewardConfig
          );

          prizeHTML += `
          <div class="sc-year-end-spend-polaroid-game__prize-info">
            ${description}
          </div>
        `;
        });
      } else {
        // INDIVIDUAL: List each card separately
        allRewards.forEach((reward) => {
          const rewardType = reward.RewardType || "Unknown";
          const rewardProvider = reward.RewardProvider || "Unknown";
          const configDetails = this.getRewardConfigDetails(
            rewardType,
            rewardProvider,
            rewardConfig
          );

          const description = this.buildPrizeDescriptionForOne(
            rewardType,
            1,
            configDetails
          );

          prizeHTML += `
          <div class="sc-year-end-spend-polaroid-game__prize-info">
            ${description}
          </div>
        `;
        });
      }

      prizeDetailScroll.innerHTML = prizeHTML;

      // Update packs and buttons
      this.updatePacksAndButtons();

      console.log(`Result screen updated for playType: ${playType}`);
      return true;
    } catch (error) {
      console.error("Critical error in updateResultFromSessionStorage:", error);
      return false;
    }
  }

  /**
   * Build prize description with provider breakdown for multiple cards
   */
  buildPrizeDescriptionForALL(rewardType, aggregatedData, rewardConfig) {
    const { count, providerCounts, firstReward } = aggregatedData;

    // Build provider breakdown if multiple providers
    let providerBreakdown = "";
    if (providerCounts && Object.keys(providerCounts).length > 1) {
      const providerList = Object.entries(providerCounts)
        .map(([provider, providerCount]) => {
          const providerConfig = this.getRewardConfigDetails(
            rewardType,
            provider,
            rewardConfig
          );
          const name = providerConfig.providerName || provider;
          return `${providerCount} ${name}`;
        })
        .join(", ");
      providerBreakdown = ` (${providerList})`;
    } else if (providerCounts && Object.keys(providerCounts).length === 1) {
      // Single provider - include name in main text
      const provider = Object.keys(providerCounts)[0];
      const providerConfig = this.getRewardConfigDetails(
        rewardType,
        provider,
        rewardConfig
      );
      const name = providerConfig.providerName || provider;

      if (name && rewardType === "Dining") {
        providerBreakdown = ` at ${name}`;
      } else if (name && rewardType === "Travel") {
        providerBreakdown = ` ${name}`;
      }
    }

    switch (rewardType) {
      case "Dining":
        return `${count} Michelin-starred dining experience${
          count > 1 ? "s" : ""
        } (for two)${providerBreakdown} `;

      case "Travel":
        return `${count} Pair${
          count > 1 ? "s" : ""
        } of flight tickets${providerBreakdown}`;

      case "Luggage":
        return `${count} Designer travel luggage `;

      case "Bonus":
      case "Cashback":
        return `${count} Bonus mystery prize `;

      case "GrandPrizeDraw":
        return `${count} additional chance(s)<br>in the Grand Draw`;

      // default:
      //   const rewardProvider = firstReward.RewardProvider || "Unknown";
      //   const configDetails = this.getRewardConfigDetails(
      //     rewardType,
      //     rewardProvider,
      //     rewardConfig
      //   );
      //   return `${count} ${configDetails.name}${providerBreakdown} card${
      //     count > 1 ? "s" : ""
      //   }`;
    }
  }
  /**
   * Get reward config details based on type and provider
   */
  getRewardConfigDetails(rewardType, rewardProvider, rewardConfig) {
    console.log(
      "🚀 ~ ScYESGameScreen ~ getRewardConfigDetails ~ rewardType, rewardProvider, rewardConfig:",
      rewardType,
      rewardProvider,
      rewardConfig
    );
    const details = {
      image: "./images/game/sc-year-end-spend-photo-card-1.png",
      title: "",
      providerName: "",
      name: "",
    };

    switch (rewardType) {
      case "Dining":
        const diningConfig = rewardConfig.dining;
        // Use provider directly as key: rewardProvider = "restaurant1"
        if (diningConfig[rewardProvider]) {
          const restaurant = diningConfig[rewardProvider];
          details.image = restaurant.image;
          details.title = restaurant.title;
          details.providerName = restaurant.name;
          details.name = diningConfig.name;
        }
        break;

      case "Travel":
        const travelConfig = rewardConfig.travel;
        // Use provider directly as key: rewardProvider = "travel1"
        if (travelConfig[rewardProvider]) {
          const destination = travelConfig[rewardProvider];
          details.image = destination.image;
          details.title = destination.title;
          details.providerName = destination.name;
          details.name = travelConfig.name;
        }
        break;

      case "Luggage":
        details.image = rewardConfig.luggage.image;
        details.title = rewardConfig.luggage.title;
        details.providerName = "";
        details.name = rewardConfig.luggage.name;
        break;

      case "GrandPrizeDraw":
        details.image = rewardConfig.grandPrize.image;
        details.title = rewardConfig.grandPrize.name;
        details.providerName = "";
        details.name = rewardConfig.grandPrize.name;
        break;

      case "Cashback":
        details.image = rewardConfig.bonus.image;
        details.title = rewardConfig.bonus.name;
        details.providerName = "";
        details.name = rewardConfig.bonus.name;
        break;

      default:
        console.warn(`Unknown reward type: ${rewardType}`);
        break;
    }

    console.log("Final details:", details);
    return details;
  }

  /**
   * Build prize description with count and config details
   */
  buildPrizeDescriptionForOne(rewardType, count, configDetails) {
    switch (rewardType) {
      case "Dining":
        return `${count} ${
          configDetails.title ||
          configDetails.providerName +
            " Michelin-starred dining experience (for two)"
        }`;

      case "Travel":
        return `${count} ${
          configDetails.title ||
          "pair of flight tickets " + configDetails.providerName
        }${count > 1 ? "s" : ""}`;

      case "Luggage":
        return `${count} ${configDetails.title || configDetails.name}`;

      case "GrandPrizeDraw":
        return `${count} ${configDetails.title || configDetails.name}`;
      case "Cashback":
        return `${count} ${configDetails.title || configDetails.name}`;
      // default:
      //   return `${count} ${configDetails.title || configDetails.name} card${
      //     count > 1 ? "s" : ""
      //   }`;
    }
  }

  /**
   * Update packs count and button visibility
   */
  updatePacksAndButtons() {
    try {
      const packsRaw = sessionStorage.getItem("packsCount");
      const packsLeft = packsRaw ? parseInt(packsRaw, 10) : 0;

      const packsLeftElement = document.querySelector(
        ".sc-year-end-spend-polaroid-game__card-left-no"
      );
      const openAllButtonTitleElement = document.querySelector(
        ".sc-year-end-spend-polaroid-game-open-all-popup__open-all-title"
      );
      if (packsLeftElement) {
        packsLeftElement.textContent = packsLeft;
        openAllButtonTitleElement.textContent = `Open all ${packsLeft} card packs in one go`;
      }

      // Button visibility logic
      const openAnotherButton = document.querySelector(
        ".sc-year-end-spend-polaroid-game__open-another"
      );
      const openAllButton = document.querySelector(
        ".sc-year-end-spend-polaroid-game__open-all"
      );
      const unlockButton = document.querySelector(
        ".sc-year-end-spend-polaroid-game__unlock-packs"
      );
      const twoButtonRow = document.querySelector(
        ".sc-year-end-spend-polaroid-game__2-btn-row"
      );

      if (packsLeft === 0) {
        if (twoButtonRow) twoButtonRow.style.display = "none";
        if (openAnotherButton) openAnotherButton.style.display = "none";
        if (openAllButton) openAllButton.style.display = "none";
        if (unlockButton) unlockButton.style.display = "block";
        console.log("No packs left - showing unlock button only");
      } else if (packsLeft >= 1 && packsLeft < 5) {
        if (twoButtonRow) twoButtonRow.style.display = "flex";
        if (openAnotherButton) openAnotherButton.style.display = "block";
        if (openAllButton) openAllButton.style.display = "none";
        if (unlockButton) unlockButton.style.display = "none";
        console.log(
          `${packsLeft} packs left - showing open another and unlock`
        );
      } else {
        if (twoButtonRow) twoButtonRow.style.display = "flex";
        if (openAnotherButton) openAnotherButton.style.display = "block";
        if (openAllButton) openAllButton.style.display = "block";
        if (unlockButton) unlockButton.style.display = "none";
        console.log(`${packsLeft} packs left - showing all buttons`);
      }
    } catch (error) {
      console.error("Error updating packs and buttons:", error);
    }
  }
  /**
   * Load and cache config JSON during initialization
   */
  async loadAndCacheConfig() {
    try {
      const response = await fetch(window?.general?.configJsonUrl);
      if (!response.ok) {
        throw new Error("Failed to load config");
      }
      const configData = await response.json();
      this.campaignConfig = configData[0].campaign.reward;
      console.log("Campaign config cached:", this.campaignConfig);
    } catch (error) {
      console.error("Error loading config JSON:", error);
      // Set default config to prevent errors
      this.campaignConfig = {
        dining: {},
        travel: {},
        luggage: {},
        bonus: {},
      };
    }
  }
}

// Create and export instance
const instance = new ScYESGameScreen();

export default instance;
