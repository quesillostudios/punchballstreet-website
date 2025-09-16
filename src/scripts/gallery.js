// Lightweight gallery script: open images in fullscreen overlay, navigate with arrows/keyboard/swipe.

(function () {
    const items = Array.from(document.querySelectorAll(".gallery-item"));
    if (!items.length) return;

    const overlay = document.getElementById("gallery-overlay");
    const imgEl = document.getElementById("gallery-image");
    const captionEl = document.getElementById("gallery-caption");
    const counterEl = document.getElementById("gallery-counter");
    const btnClose = overlay.querySelector(".gallery-close");
    const btnNext = overlay.querySelector(".gallery-next");
    const btnPrev = overlay.querySelector(".gallery-prev");

    let currentIndex = 0;

    function open(index) {
        currentIndex = index;
        const src = items[index].getAttribute("src");
        const alt = items[index].getAttribute("alt") || "";
        imgEl.style.opacity = 0;
        imgEl.src = src;
        imgEl.alt = alt;
        captionEl.textContent = alt;
        counterEl.textContent = `${index + 1} / ${items.length}`;
        overlay.classList.add("open");
        overlay.setAttribute("aria-hidden", "false");

        // Wait for image load to animate opacity
        imgEl.onload = () => {
            imgEl.style.transform = "translateY(0)";
            imgEl.style.opacity = 1;
        };

        // focus for keyboard navigation
        setTimeout(() => btnClose.focus(), 30);
    }

    function close() {
        overlay.classList.remove("open");
        overlay.setAttribute("aria-hidden", "true");
        imgEl.src = "";
    }

    function next() {
        open((currentIndex + 1) % items.length);
    }

    function prev() {
        open((currentIndex - 1 + items.length) % items.length);
    }

    // Click on thumbnails
    items.forEach((el, i) => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            open(i);
        });
        // optional: support keyboard activation on focused thumbnail
        el.tabIndex = 0;
        el.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open(i);
            }
        });
    });

    // Buttons
    btnClose.addEventListener("click", close);
    btnNext.addEventListener("click", next);
    btnPrev.addEventListener("click", prev);

    // Click outside image closes overlay
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close();
    });

    // Keyboard
    document.addEventListener("keydown", (e) => {
        if (overlay.classList.contains("open")) {
            if (e.key === "Escape") close();
            if (e.key === "ArrowRight") next();
            if (e.key === "ArrowLeft") prev();
        }
    });

    // Basic swipe support for touch devices
    let touchStartX = 0;
    let touchEndX = 0;
    imgEl.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    imgEl.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleGesture();
    });

    function handleGesture() {
        const threshold = 40; // px
        if (touchEndX <= touchStartX - threshold) {
            // swiped left
            next();
        }
        if (touchEndX >= touchStartX + threshold) {
            // swiped right
            prev();
        }
    }

    // Preload neighbors for smoother navigation
    function preload(index) {
        const url = items[index]?.getAttribute("src");
        if (!url) return;
        const i = new Image();
        i.src = url;
    }

    // Preload on open
    overlay.addEventListener("transitionend", () => {
        if (overlay.classList.contains("open")) {
            preload((currentIndex + 1) % items.length);
            preload((currentIndex - 1 + items.length) % items.length);
        }
    });
})();