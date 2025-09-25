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
        POCKET_FADE: { duration: 0.1, ease: "power2.out" },
        RESULT_SHOW: { duration: 0.8, delay: 1, ease: "power2.in" },
      },

      TIMING: {
        POCKET_DELAY: 2600,
      },
    };

    // Section Management - NEW
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
    this.debugMode = true; // Set to true to enable debug logging
    this.restartButton = null; // Track the restart button
  }

  // set the general instance
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
      this.bindEventListeners();

      console.log("ScYESGameScreen: Initialized successfully");
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

  // NEW SECTION MANAGEMENT METHODS

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
   * Reset game to initial playing state
   */
  resetToGameState() {
    console.log("=== RESET TO GAME STATE START ===");

    // Kill any active animations first
    this.activeAnimations.forEach((animation) => {
      if (animation && animation.kill) {
        animation.kill();
      }
    });
    this.activeAnimations.clear();

    // Hide result page
    this.hideSection("result");

    // Show game elements
    this.showSections(["slider", "pocket", "bgDark"]);

    // Reset all slider items (packs) - restore any that were hidden
    this.items.forEach((item, index) => {
      item.style.display = "block";
      item.style.opacity = "1";
      item.style.visibility = "visible";
      item.classList.remove("active");

      // Clear any GSAP transforms that might position them off-screen
      gsap.set(item, { clearProps: "all" });
    });

    // Reset pocket to initial animation state
    const pocket = document.getElementById(this.sections.pocket);
    if (pocket) {
      console.log(
        "Resetting pocket - removing classes:",
        pocket.classList.toString()
      );
      // Remove all classes that affect animation sequence
      pocket.classList.remove("active", "dismiss-card");
      // Reset to initial opacity and clear GSAP properties
      gsap.set(pocket, { opacity: 1, clearProps: "transform,scale,x,y" });
      pocket.style.opacity = "1";
      pocket.style.visibility = "visible";

      // COMPREHENSIVE RESET: Reset dispensing elements completely
      const dispensingElements = pocket.querySelectorAll(
        ".sc-year-end-spend-polaroid-game__dispense-polaroid img"
      );
      console.log("Found dispensing elements:", dispensingElements.length);

      dispensingElements.forEach((img, index) => {
        // First, disable ALL transitions to prevent interference during reset
        img.style.transition = "none";
        img.style.webkitTransition = "none";

        // Reset to initial CSS state from your stylesheet
        img.style.position = "absolute";
        img.style.zIndex = "14";
        img.style.left = "50%";
        img.style.top = "5%"; // Initial position
        img.style.transform = "translate(-50%, 50%) scale(1)"; // Initial transform
        img.style.width = "calc(min(340px, 79.07vw))"; // From your CSS
        img.style.opacity = "1";
        img.style.display = "block";
        img.style.visibility = "visible";

        // Force style computation to ensure reset is applied
        const computedStyle = window.getComputedStyle(img);
        console.log(
          `Image ${index + 1} reset - top:`,
          computedStyle.top,
          "transform:",
          computedStyle.transform
        );

        // Force reflow
        img.offsetHeight;

        // Re-enable transitions after a brief delay to ensure clean state
        setTimeout(() => {
          img.style.transition = "";
          img.style.webkitTransition = "";
        }, 10);
      });

      console.log("Pocket after reset - classes:", pocket.classList.toString());
    }

    // Reset background to initial state for animations
    const bgDark = document.getElementById(this.sections.bgDark);
    if (bgDark) {
      console.log("Resetting bgDark - removing dismiss class");
      bgDark.classList.remove("dismiss");
      gsap.set(bgDark, { clearProps: "all" });
    }

    // Reset section classes that affect the final result state
    if (this.elements.section) {
      this.elements.section.classList.remove("active-scroll");
    }

    // Reset result element to initial state
    if (this.elements.result) {
      this.elements.result.classList.remove("result-show");
      gsap.set(this.elements.result, {
        opacity: 0,
        clearProps: "transform,scale,x,y",
      });
      this.elements.result.style.opacity = "0";
    }

    // Reset slider to initial state
    if (this.elements.slider) {
      gsap.set(this.elements.slider, {
        opacity: 1,
        clearProps: "transform,scale,x,y",
      });
      this.elements.slider.style.opacity = "1";
      this.elements.slider.style.visibility = "visible";
    }

    // Completely reset game state
    if (this.isInitialized) {
      this.resetGestureState();
      this.setupGameState();
      this.updateLayoutDimensions();
      this.renderCarousel();
    }

    console.log("=== RESET TO GAME STATE END ===");
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

  // END NEW SECTION MANAGEMENT METHODS

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

    // UPDATED RESTART BUTTON HANDLER
    try {
      this.restartButton = document.querySelector(
        ".sc-year-end-spend-polaroid-game__open-another"
      );

      if (this.restartButton) {
        this.addEventListenerWithCleanup(this.restartButton, "click", (e) => {
          // Use the new simplified section management
          this.resetToGameState();
        });
      }
    } catch (error) {
      console.warn("Error binding restart button:", error.message);
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
        this.executeSliderFadeOut();
      },
    });

    this.activeAnimations.add(dropAnimation);
  }

  /**
   * Execute slider fade out animation
   */
  executeSliderFadeOut() {
    const fadeAnimation = gsap.to(this.elements.slider, {
      opacity: 0,
      ...this.CONFIG.ANIMATIONS.SLIDER_FADE,
      onComplete: () => {
        this.activeAnimations.delete(fadeAnimation);
        this.elements.slider.style.display = "none";

        console.log("Starting dispensing animation with GSAP");
        this.executeDispensingAnimation();
      },
    });

    this.activeAnimations.add(fadeAnimation);
  }

  /**
   * Execute dispensing animation using GSAP (more reliable than CSS transitions)
   */
  executeDispensingAnimation() {
    // Add the active class for styling, but handle animation with GSAP
    this.elements.pocket.classList.add(this.CONFIG.CSS_CLASSES.ACTIVE);
    this.elements.bgDark.classList.add(this.CONFIG.CSS_CLASSES.DISMISS);

    // Get dispensing elements
    const dispensingElements = this.elements.pocket.querySelectorAll(
      ".sc-year-end-spend-polaroid-game__dispense-polaroid img"
    );
    console.log(
      "Found dispensing elements for GSAP animation:",
      dispensingElements.length
    );

    // Animate each dispensing card with staggered delays
    dispensingElements.forEach((img, index) => {
      const delay = 2 + index * 0.2; // 2s, 2.2s, 2.4s delays

      const dispensingAnimation = gsap.to(img, {
        top: "1300px",
        scale: 2,
        duration: 0.5,
        delay: delay,
        ease: "ease-in-out",
        onStart: () => {
          console.log(`Dispensing animation started for image ${index + 1}`);
        },
        onComplete: () => {
          console.log(`Dispensing animation completed for image ${index + 1}`);
          this.activeAnimations.delete(dispensingAnimation);
        },
      });

      this.activeAnimations.add(dispensingAnimation);
    });

    // Continue with pocket fade out after all dispensing animations
    setTimeout(() => {
      console.log("About to execute pocket fade out after dispensing");
      this.executePocketFadeOut();
    }, this.CONFIG.TIMING.POCKET_DELAY);
  }

  /**
   * Execute pocket fade out animation
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
   * Show final game result with animation - UPDATED to use section management
   */
  showGameResult() {
    // Use the new section management for the basic show/hide
    this.showResultState();

    // Keep the existing result animation
    const resultAnimation = gsap.to(this.elements.result, {
      opacity: 1,
      ...this.CONFIG.ANIMATIONS.RESULT_SHOW,
      onComplete: () => {
        this.activeAnimations.delete(resultAnimation);
      },
    });

    this.activeAnimations.add(resultAnimation);

    // Add CSS classes for final state
    this.elements.result.classList.add(this.CONFIG.CSS_CLASSES.RESULT_SHOW);
    this.elements.section.classList.add(this.CONFIG.CSS_CLASSES.ACTIVE_SCROLL);
    this.elements.pocket.classList.add(this.CONFIG.CSS_CLASSES.DISMISS_CARD);
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
      console.log("Current state:", this.getState());
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

      console.log("ScYESGameScreen: Destroyed successfully");
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
}

// Create and export instance
const instance = new ScYESGameScreen();

export default instance;
