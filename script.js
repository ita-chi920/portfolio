
class ImageSlider {
  constructor(slider) {
    this.slider = slider;
    this.track = slider.querySelector(".slider-track");
    this.previousButton = slider.querySelector(".previous-button");
    this.nextButton = slider.querySelector(".next-button");
    this.dotsContainer = slider.querySelector(".slider-dots");
    this.status = slider.querySelector(".slider-status");

    if (!this.track) return;

    this.originalSlides = Array.from(
      this.track.querySelectorAll(".slide")
    );

    this.slideCount = this.originalSlides.length;

    if (this.slideCount === 0) return;

    this.index = 1;
    this.isMoving = false;
    this.autoplayDelay = 4000;
    this.autoplayTimer = null;

    this.handleTransitionEnd =
      this.handleTransitionEnd.bind(this);
    this.handlePrevious = this.previous.bind(this);
    this.handleNext = this.next.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleMouseEnter = this.stopAutoplay.bind(this);
    this.handleMouseLeave = this.startAutoplay.bind(this);
    this.handleFocusIn = this.stopAutoplay.bind(this);
    this.handleFocusOut = this.handleFocusOut.bind(this);
    this.handleVisibilityChange =
      this.handleVisibilityChange.bind(this);

    this.setup();
  }

  setup() {
    // Add copies of the first and last slides for smooth looping.
    this.firstClone = this.originalSlides[0].cloneNode(true);
    this.lastClone =
      this.originalSlides[this.slideCount - 1].cloneNode(true);

    this.firstClone.classList.add("slide-clone");
    this.lastClone.classList.add("slide-clone");

    this.firstClone.setAttribute("aria-hidden", "true");
    this.lastClone.setAttribute("aria-hidden", "true");

    this.track.appendChild(this.firstClone);
    this.track.insertBefore(
      this.lastClone,
      this.originalSlides[0]
    );

    this.createDots();
    this.updateSlider(false);

    // Buttons.
    this.previousButton?.addEventListener(
      "click",
      this.handlePrevious
    );
    this.nextButton?.addEventListener(
      "click",
      this.handleNext
    );

    // Slider movement.
    this.track.addEventListener(
      "transitionend",
      this.handleTransitionEnd
    );

    // Keyboard navigation.
    this.slider.addEventListener(
      "keydown",
      this.handleKeydown
    );

    // Pause automatic movement when the user interacts.
    this.slider.addEventListener(
      "mouseenter",
      this.handleMouseEnter
    );
    this.slider.addEventListener(
      "mouseleave",
      this.handleMouseLeave
    );
    this.slider.addEventListener(
      "focusin",
      this.handleFocusIn
    );
    this.slider.addEventListener(
      "focusout",
      this.handleFocusOut
    );

    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );

    this.startAutoplay();
  }

  createDots() {
    if (!this.dotsContainer) return;

    this.dotsContainer.innerHTML = "";

    this.dots = this.originalSlides.map((slide, index) => {
      const dot = document.createElement("button");

      dot.type = "button";
      dot.className = "slider-dot";
      dot.setAttribute(
        "aria-label",
        `Go to slide ${index + 1}`
      );

      dot.addEventListener("click", () => {
        this.goToSlide(index);
      });

      this.dotsContainer.appendChild(dot);

      return dot;
    });
  }

  updateSlider(animate = true) {
    if (!this.track) return;

    this.track.style.transition = animate
      ? "transform 0.5s ease"
      : "none";

    this.track.style.transform =
      `translateX(-${this.index * 100}%)`;

    const realIndex =
      (this.index - 1 + this.slideCount) % this.slideCount;

    this.dots?.forEach((dot, index) => {
      const isActive = index === realIndex;

      dot.classList.toggle("active", isActive);

      if (isActive) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });

    if (this.status) {
      this.status.textContent =
        `Slide ${realIndex + 1} of ${this.slideCount}`;
    }
  }

  next() {
    if (this.isMoving || this.slideCount < 2) return;

    this.isMoving = true;
    this.index += 1;
    this.updateSlider(true);
  }

  previous() {
    if (this.isMoving || this.slideCount < 2) return;

    this.isMoving = true;
    this.index -= 1;
    this.updateSlider(true);
  }

  goToSlide(realIndex) {
    if (this.isMoving) return;

    this.index = realIndex + 1;
    this.updateSlider(true);
    this.isMoving = true;

    this.stopAutoplay();
    this.startAutoplay();
  }

  handleTransitionEnd(event) {
    if (event.target !== this.track) return;

    if (this.index === this.slideCount + 1) {
      this.index = 1;
      this.updateSlider(false);
    } else if (this.index === 0) {
      this.index = this.slideCount;
      this.updateSlider(false);
    }

    this.isMoving = false;
  }

  handleKeydown(event) {
    if (event.key === "ArrowRight") {
      this.next();
    } else if (event.key === "ArrowLeft") {
      this.previous();
    }
  }

  handleFocusOut() {
    // Wait until focus has moved before deciding whether to restart.
    requestAnimationFrame(() => {
      if (!this.slider.contains(document.activeElement)) {
        this.startAutoplay();
      }
    });
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.stopAutoplay();
    } else {
      this.startAutoplay();
    }
  }

  startAutoplay() {
    this.stopAutoplay();

    if (
      this.slideCount < 2 ||
      document.hidden ||
      this.slider.matches(":hover") ||
      this.slider.contains(document.activeElement)
    ) {
      return;
    }

    this.autoplayTimer = setInterval(() => {
      this.next();
    }, this.autoplayDelay);
  }

  stopAutoplay() {
    if (this.autoplayTimer !== null) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  destroy() {
    this.stopAutoplay();

    this.previousButton?.removeEventListener(
      "click",
      this.handlePrevious
    );
    this.nextButton?.removeEventListener(
      "click",
      this.handleNext
    );

    this.track.removeEventListener(
      "transitionend",
      this.handleTransitionEnd
    );

    this.slider.removeEventListener(
      "keydown",
      this.handleKeydown
    );
    this.slider.removeEventListener(
      "mouseenter",
      this.handleMouseEnter
    );
    this.slider.removeEventListener(
      "mouseleave",
      this.handleMouseLeave
    );
    this.slider.removeEventListener(
      "focusin",
      this.handleFocusIn
    );
    this.slider.removeEventListener(
      "focusout",
      this.handleFocusOut
    );

    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );

    this.firstClone?.remove();
    this.lastClone?.remove();
  }
}

// Start the image slider after the page loads.
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".image-slider").forEach((slider) => {
    new ImageSlider(slider);
  });
});
