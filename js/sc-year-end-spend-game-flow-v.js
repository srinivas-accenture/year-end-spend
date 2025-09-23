/**
 * Class representing the Polaroid Game slider.
 * Handles layout, rendering, and drag interactions.
 */
// ScYearEndSpendSlider manages the polaroid slider UI, layout, rendering, and drag interactions.
class ScYearEndSpendSlider {
  /**
   * @param {string} sliderId - ID of the slider container.
   * @param {string} pocketId - ID of the pocket element.
   * @param {string} bgDarkId - ID of the dark background element.
   * @param {string} resultId - ID of the result container.
   */
  constructor(sliderId, pocketId, bgDarkId, resultId) {
    // Store element IDs for later use in init
    this.sliderId = sliderId;
    this.pocketId = pocketId;
    this.bgDarkId = bgDarkId;
    this.resultId = resultId;
    // Initialize all properties
    this.pgslider = null;
    this.pgpocket = null;
    this.pgbgdark = null;
    this.polaroidResult = null;
    this.items = [];
    this.num = 0;
    this.itemW = 138;
    this.itemH = 185;
    this.spacingX = 140;
    this.curveIntensity = 40;
    this.angles = [0, -20, -40, -65, -90];
    this.swipeThreshold = 30;
    this.verticalThreshold = 60;
    this.offset = 0;
    this.baseX = 0;
    this.baseY = 0;
    this.activeItem = null;
    this.maxIndex = 0;
    this.startX = 0;
    this.startY = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.movedX = 0;
    this.movedY = 0;
    this.gesture = null;
    this.dragging = false;
    // Do not call init here; wait for images to load
  }

  // Initialize DOM references, config, and event bindings
  init() {
    this.pgslider = document.getElementById(this.sliderId);
    this.pgpocket = document.getElementById(this.pocketId);
    this.pgbgdark = document.getElementById(this.bgDarkId);
    this.polaroidResult = document.getElementById(this.resultId);

    if (
      !this.pgslider ||
      !this.pgpocket ||
      !this.pgbgdark ||
      !this.polaroidResult
    ) {
      throw new Error("One or more required elements not found.");
    }

    this.items = Array.from(
      this.pgslider.querySelectorAll(
        ".sc-year-end-spend-polaroid-game__slider-img"
      )
    );
    this.num = this.items.length;
    if (this.num === 0) throw new Error("No slider items found.");

    // Load config from dataset
    const ds = this.pgslider.dataset;
    this.itemW = parseInt(ds.itemWidth) || 138;
    this.itemH = parseInt(ds.itemHeight) || 185;
    this.spacingX = parseInt(ds.spacingX) || 140;
    this.curveIntensity = parseInt(ds.curveIntensity) || 40;
    this.angles = ds.angles
      ? ds.angles.split(",").map(Number)
      : [0, -20, -40, -65, -90];
    this.swipeThreshold = parseInt(ds.swipeThreshold) || 30;
    this.verticalThreshold = parseInt(ds.verticalThreshold) || 60;

    this.offset = Math.floor(this.num / 2);
    this.baseX = 0;
    this.baseY = 0;
    this.activeItem = null;
    this.maxIndex = this.angles.length - 1;

    this.startX = this.startY = this.lastX = this.lastY = 0;
    this.movedX = this.movedY = 0;
    this.gesture = null;
    this.dragging = false;

    this.bindEvents();
    this.updateLayout();
    this.render();
  }

  /** Recalculate item positions */
  updateLayout() {
    try {
      if (!this.items[0]) return;
      this.itemW = this.items[0].offsetWidth || this.itemW;
      this.itemH = this.items[0].offsetHeight || this.itemH;
      const sw = this.pgslider.clientWidth;
      const sh = this.pgslider.clientHeight;
      this.baseX = sw / 2 - this.itemW / 2;
      this.baseY = sh / 2 - this.itemH / 2;
    } catch (err) {
      //          console.warn("updateLayout error:", err.message);
    }
  }

  /**
   * Get angle for curve.
   * @param {number} t - Position offset.
   * @returns {number} rotation angle.
   */
  angleForPos(t) {
    const sign = t < 0 ? -1 : 1;
    const a = Math.abs(t);
    if (a >= this.maxIndex) return sign * this.angles[this.maxIndex];
    const k = Math.floor(a);
    const frac = a - k;
    return (
      sign * (this.angles[k] + (this.angles[k + 1] - this.angles[k]) * frac)
    );
  }

  /** Render slider items */
  render() {
    try {
      this.activeItem = null;
      const centerIndex = Math.round(this.offset);
      this.items.forEach((el, i) => {
        const pos = i - this.offset;
        const absPos = Math.abs(pos);
        if (absPos > this.maxIndex + 0.5) {
          gsap.set(el, { opacity: 0, pointerEvents: "none" });
          el.classList.remove("active");
          return;
        }
        const x = this.baseX + pos * this.spacingX;
        const y = this.baseY - Math.pow(pos, 2) * this.curveIntensity;
        const angle = this.angleForPos(pos);
        const scale = Math.max(1 - absPos * 0.1, 0.5);
        const zIndex = Math.round(100 - absPos * 10);
        gsap.set(el, { x, y, scale, rotation: angle, zIndex, opacity: 1 });
        el.classList.remove("active");
        if (i === centerIndex) {
          el.dataset.centerY = String(y);
          this.activeItem = el;
          el.classList.add("active");
        }
      });
    } catch (err) {
      //          console.warn("render error:", err.message);
    }
  }

  /**
   * Get pointer coords.
   * @param {Event} e - Mouse or touch event.
   * @returns {{x:number,y:number}}
   */
  getPoint(e) {
    if (e.touches && e.touches.length)
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  /** Drag start */
  onStart(e) {
    try {
      const p = this.getPoint(e);
      this.startX = this.lastX = p.x;
      this.startY = this.lastY = p.y;
      this.gesture = null;
      this.dragging = true;
      this.movedX = this.movedY = 0;
    } catch (err) {
      //          console.warn("onStart error:", err.message);
    }
  }

  /** Drag move */
  onMove(e) {
    try {
      if (!this.dragging) return;
      const p = this.getPoint(e);
      this.movedX = p.x - this.startX;
      this.movedY = p.y - this.startY;
      const dxStep = p.x - this.lastX;
      const dyStep = p.y - this.lastY;
      this.lastX = p.x;
      this.lastY = p.y;

      if (!this.gesture) {
        if (
          Math.abs(this.movedX) > 12 &&
          Math.abs(this.movedX) > Math.abs(this.movedY)
        ) {
          this.gesture = "horizontal";
          e.preventDefault();
        } else if (
          Math.abs(this.movedY) > 12 &&
          Math.abs(this.movedY) > Math.abs(this.movedX)
        ) {
          const centerEl = this.items[Math.round(this.offset)];
          this.gesture =
            centerEl && centerEl.classList.contains("active")
              ? "vertical"
              : "horizontal";
          if (this.gesture === "horizontal") e.preventDefault();
        } else return;
      }
      if (this.gesture === "horizontal") {
        e.preventDefault();
        this.offset -= dxStep / 480;
        this.render();
      }
      if (this.gesture === "vertical" && this.activeItem && this.movedY > 20) {
        const base = parseFloat(this.activeItem.dataset.centerY || this.baseY);
        gsap.set(this.activeItem, { y: base + this.movedY * 0.65 });
      }
    } catch (err) {
      //          console.warn("onMove error:", err.message);
    }
  }

  /** Drag end */
  onEnd() {
    try {
      if (!this.dragging) return;
      this.dragging = false;
      if (this.gesture === "horizontal" || this.gesture === null) {
        const current = Math.round(this.offset);
        let target = current;
        if (this.movedX < -this.swipeThreshold) target = current + 1;
        else if (this.movedX > this.swipeThreshold) target = current - 1;
        target = Math.max(0, Math.min(this.num - 1, target));
        gsap.to(this, {
          offset: target,
          duration: 0.5,
          ease: "power3.out",
          onUpdate: () => this.render(),
        });
        return;
      }
      if (this.gesture === "vertical" && this.activeItem) {
        if (Math.abs(this.movedY) < this.verticalThreshold) {
          const base = parseFloat(
            this.activeItem.dataset.centerY || this.baseY
          );
          gsap.to(this.activeItem, {
            y: base,
            duration: 0.28,
            ease: "power2.out",
          });
          return;
        }
        const pgpocketBox = this.pgpocket.getBoundingClientRect();
        const imgBox = this.activeItem.getBoundingClientRect();
        const overlap =
          imgBox.bottom > pgpocketBox.top &&
          imgBox.left < pgpocketBox.right &&
          imgBox.right > pgpocketBox.left;
        if (overlap) {
          gsap.to(this.activeItem, {
            y: window.innerHeight + 200,
            scale: 0.45,
            opacity: 0,
            duration: 0.6,
            ease: "back.in",
            onComplete: () => {
              this.activeItem.style.display = "none";
              gsap.to(this.pgslider, {
                opacity: 0,
                duration: 0.4,
                ease: "power2.in",
                onComplete: () => {
                  this.pgslider.style.display = "none";
                  this.pgpocket.classList.add("active");
                  this.pgbgdark.classList.add("dismiss");
                  setTimeout(() => {
                    gsap.to(this.pgpocket, {
                      opacity: 0,
                      duration: 0.1,
                      ease: "power2.out",
                      onComplete: () => {
                        gsap.to(this.polaroidResult, {
                          opacity: 1,
                          delay: 1,
                          duration: 0.8,
                          ease: "power2.in",
                        });
                        this.polaroidResult.classList.add("result-show");
                      },
                    });
                  }, 2400);
                },
              });
            },
          });
        } else {
          const base = parseFloat(
            this.activeItem.dataset.centerY || this.baseY
          );
          gsap.to(this.activeItem, {
            y: base,
            duration: 0.32,
            ease: "power2.out",
          });
        }
      }
    } catch (err) {
      //          console.warn("onEnd error:", err.message);
    }
  }

  /** Bind mouse/touch events */
  bindEvents() {
    window.addEventListener("resize", () => {
      this.updateLayout();
      this.render();
    });
    document.addEventListener("touchstart", (e) => this.onStart(e), {
      passive: true,
    });
    document.addEventListener("touchmove", (e) => this.onMove(e), {
      passive: false,
    });
    document.addEventListener("touchend", () => this.onEnd(), {
      passive: true,
    });
    document.addEventListener("mousedown", (e) => {
      if (e.button === 0) this.onStart(e);
    });
    document.addEventListener("mousemove", (e) => this.onMove(e));
    document.addEventListener("mouseup", () => this.onEnd());
  }
}

const instance = new ScYearEndSpendSlider(
  "polaroid-game-slider",
  "polaroid-game-pocket",
  "polaroid-game-bg-dark",
  "polaroid-result"
);

// Wait for all images in the slider to load before initializing layout
function imagesLoaded(container, callback) {
  const images = Array.from(container.querySelectorAll("img"));
  let loaded = 0;
  if (images.length === 0) {
    callback();
    return;
  }
  images.forEach((img) => {
    if (img.complete) {
      loaded++;
      if (loaded === images.length) callback();
    } else {
      img.addEventListener("load", () => {
        loaded++;
        if (loaded === images.length) callback();
      });
      img.addEventListener("error", () => {
        loaded++;
        if (loaded === images.length) callback();
      });
    }
  });
}

window.addEventListener("load", function () {
  const slider = document.getElementById("polaroid-game-slider");
  if (slider) {
    imagesLoaded(slider, () => {
      instance.init();
    });
  }
});

export default instance;
