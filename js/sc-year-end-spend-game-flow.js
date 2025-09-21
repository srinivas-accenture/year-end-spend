// ScYearEndSpendSlider manages the campaign slider UI, including layout, rendering, and touch interactions.
class ScYearEndSpendSlider {
  constructor() {
    // DOM elements for slider and pocket area
    this.slider = document.getElementById("slider");
    this.pocket = document.getElementById("pocket");
    // Array of slider item elements
    this.items = Array.from(
      this.slider?.querySelectorAll(".sc-year-spend-slider-img") || []
    );
    this.num = this.items.length;

    // Layout and animation properties
    this.offset = Math.floor(this.num / 2); // Center item offset
    this.itemW = 138; // Default item width
    this.itemH = 185; // Default item height
    this.baseX = 0; // Base X position for center
    this.baseY = 0; // Base Y position for center
    this.spacingX = 140; // Horizontal spacing between items
    this.curveIntensity = 40; // Curve for vertical offset
    this.activeItem = null; // Currently active (center) item

    // Angles for item rotation based on position
    this.angles = [0, -20, -40, -65, -90];
    this.maxIndex = this.angles.length - 1;

    // Touch state variables for gesture handling
    this.startX = 0;
    this.startY = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.movedX = 0;
    this.movedY = 0;
    this.gesture = null;
    this.dragging = false;

    // Initialize slider layout and event listeners
    this.init();
  }

  // Calculate layout values based on container and item sizes
  updateLayout() {
    if (!this.items[0]) return;
    this.itemW = this.items[0].offsetWidth || 138;
    this.itemH = this.items[0].offsetHeight || 185;
    const sw = this.slider.clientWidth;
    const sh = this.slider.clientHeight;

    this.baseX = sw / 2 - this.itemW / 2;
    this.baseY = sh / 2 - this.itemH / 2;

    this.spacingX = Math.max(this.itemW * 1.5, 120);
    this.curveIntensity = this.itemH * 0.15;
  }

  // Get rotation angle for item position (for curved effect)
  angleForPos(t) {
    const sign = t < 0 ? -1 : 1;
    const a = Math.abs(t);
    if (a >= this.maxIndex) return sign * this.angles[this.maxIndex];
    const k = Math.floor(a);
    const frac = a - k;
    const angle = this.angles[k] + (this.angles[k + 1] - this.angles[k]) * frac;
    return sign * angle;
  }

  // Render slider items: position, scale, rotate, and highlight center
  render() {
    this.activeItem = null;
    const centerIndex = Math.round(this.offset);

    this.items.forEach((el, i) => {
      if (el.style.display === "none") return;

      const pos = i - this.offset;
      const absPos = Math.abs(pos);

      if (absPos > this.maxIndex + 0.5) {
        gsap.set(el, { opacity: 0, pointerEvents: "none" });
        el.classList.remove("sc-year-spend-active");
        return;
      }

      const x = this.baseX + pos * this.spacingX;
      const y = this.baseY - Math.pow(pos, 2) * this.curveIntensity;
      const angle = this.angleForPos(pos);

      const scale = Math.max(1 - absPos * 0.1, 0.5);
      const zIndex = Math.round(100 - absPos * 10);

      gsap.set(el, {
        x,
        y,
        scale,
        rotation: angle,
        zIndex,
        transformOrigin: "center center",
        opacity: 1,
      });

      el.classList.remove("sc-year-spend-active");
      if (i === centerIndex && el.style.display !== "none") {
        el.dataset.centerY = String(y);
        this.activeItem = el;
        el.classList.add("sc-year-spend-active");
      }
    });
  }

  // Touch start handler: begin tracking gesture
  handleTouchStart(e) {
    if (!e.touches || e.touches.length !== 1) return;
    const t = e.touches[0];
    this.startX = this.lastX = t.clientX;
    this.startY = this.lastY = t.clientY;
    this.gesture = null;
    this.dragging = true;
    this.movedX = this.movedY = 0;
  }

  // Touch move handler: handle horizontal swipe and vertical drag
  handleTouchMove(e) {
    if (!this.dragging || !e.touches || e.touches.length !== 1) return;
    const t = e.touches[0];
    const cx = t.clientX,
      cy = t.clientY;

    const dxTotal = cx - this.startX;
    const dyTotal = cy - this.startY;
    this.movedX = dxTotal;
    this.movedY = dyTotal;

    const dxStep = cx - this.lastX;
    const dyStep = cy - this.lastY;

    this.lastX = cx;
    this.lastY = cy;

    if (!this.gesture) {
      if (Math.abs(dxTotal) > 12 && Math.abs(dxTotal) > Math.abs(dyTotal)) {
        this.gesture = "horizontal";
      } else if (
        Math.abs(dyTotal) > 12 &&
        Math.abs(dyTotal) > Math.abs(dxTotal)
      ) {
        const centerEl = this.items[Math.round(this.offset)];
        if (centerEl && centerEl.classList.contains("sc-year-spend-active")) {
          this.gesture = "vertical";
          this.activeItem = centerEl;
        } else {
          this.gesture = "horizontal";
        }
      } else {
        return;
      }
    }

    if (this.gesture === "horizontal") {
      this.offset -= dxStep / 480;
      this.render();
    }

    if (this.gesture === "vertical" && this.activeItem) {
      if (dyTotal > 20) {
        const base = parseFloat(this.activeItem.dataset.centerY || this.baseY);
        const adjusted = base + dyTotal * 0.65;
        gsap.set(this.activeItem, { y: adjusted });
      }
    }
  }

  // Touch end handler: snap to item or animate drop into pocket
  handleTouchEnd() {
    if (!this.dragging) return;
    this.dragging = false;

    if (this.gesture === "horizontal" || this.gesture === null) {
      const current = Math.round(this.offset);

      let target = current;
      if (this.movedX < -30) {
        target = current + 1;
      } else if (this.movedX > 30) {
        target = current - 1;
      }

      if (target < 0) target = 0;
      if (target > this.num - 1) target = this.num - 1;

      gsap.to(
        { val: this.offset },
        {
          val: target,
          duration: 0.5,
          ease: "power3.out",
          onUpdate: () => {
            this.offset = gsap.getProperty(this, "val") || target;
            this.render();
          },
        }
      );
      return;
    }

    if (this.gesture === "vertical" && this.activeItem) {
      if (Math.abs(this.movedY) < 60) {
        const base = parseFloat(this.activeItem.dataset.centerY || this.baseY);
        gsap.to(this.activeItem, {
          y: base,
          duration: 0.28,
          ease: "power2.out",
        });
        return;
      }

      const pocketBox = this.pocket.getBoundingClientRect();
      const imgBox = this.activeItem.getBoundingClientRect();
      if (
        imgBox.bottom > pocketBox.top &&
        imgBox.left < pocketBox.right &&
        imgBox.right > pocketBox.left
      ) {
        gsap.to(this.activeItem, {
          y: window.innerHeight + 200,
          scale: 0.45,
          opacity: 0,
          duration: 0.6,
          ease: "back.in",
          onComplete: () => {
            this.activeItem.style.display = "none";
          },
        });
      } else {
        const base = parseFloat(this.activeItem.dataset.centerY || this.baseY);
        gsap.to(this.activeItem, {
          y: base,
          duration: 0.32,
          ease: "power2.out",
        });
      }
    }
  }

  // Set up event listeners for resize and touch events
  init() {
    this.updateLayout();
    this.render();

    window.addEventListener("resize", () => {
      this.updateLayout();
      this.render();
    });

    document.addEventListener("touchstart", (e) => this.handleTouchStart(e), {
      passive: true,
    });
    document.addEventListener("touchmove", (e) => this.handleTouchMove(e), {
      passive: true,
    });
    document.addEventListener("touchend", () => this.handleTouchEnd(), {
      passive: true,
    });

    // Expose for debugging if needed (window._u)
    window._u = {
      updateLayout: this.updateLayout.bind(this),
      render: this.render.bind(this),
      items: this.items,
    };
  }
}

// Create and export a single instance of the slider
const scYearEndSpendSlider = new ScYearEndSpendSlider();

export default scYearEndSpendSlider;
