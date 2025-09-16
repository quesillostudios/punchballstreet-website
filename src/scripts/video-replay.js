(function () {
  const video = document.getElementById("hero-video");
  if (!video) return;

  // Ensure muted for autoplay policy
  video.muted = true;

  // State
  let wasOutOfView = false;
  let pauseTimestamp = 0;
  let playTimer = null;
  const REPLAY_DELAY = 2000; // ms

  function clearPlayTimer() {
    if (playTimer) {
      clearTimeout(playTimer);
      playTimer = null;
    }
  }

  function schedulePlayAfterDelay(remaining) {
    clearPlayTimer();
    playTimer = setTimeout(() => {
      // only play if still paused and still in viewport
      if (video.paused && isElementInViewport(video)) {
        try {
          video.currentTime = 0;
        } catch (e) {}
        video.play().catch(() => {});
      }
      playTimer = null;
    }, Math.max(0, remaining));
  }

  // Start after a 2s delay on initial load (only once)
  function delayedStart() {
    clearPlayTimer();
    playTimer = setTimeout(() => {
      if (video.paused) {
        try {
          video.currentTime = 0;
        } catch (e) {}
        video.play().catch(() => {});
      }
      playTimer = null;
    }, REPLAY_DELAY);
  }

  // Utility to check element viewport presence roughly
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.bottom >= 0 &&
      rect.right >= 0 &&
      rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
      rect.top <= (window.innerHeight || document.documentElement.clientHeight)
    );
  }

  // IntersectionObserver to detect visibility in viewport
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Entering viewport
          if (wasOutOfView) {
            // calculate how long it's been paused/out-of-view
            const elapsed = pauseTimestamp ? Date.now() - pauseTimestamp : Infinity;
            const remaining = REPLAY_DELAY - elapsed;
            if (remaining <= 0) {
              // enough time has passed: replay immediately
              clearPlayTimer();
              if (video.paused) {
                try {
                  video.currentTime = 0;
                } catch (e) {}
                video.play().catch(() => {});
              }
            } else {
              // schedule replay after remaining time
              if (video.paused) schedulePlayAfterDelay(remaining);
            }
          } else {
            // First time entering: ensure it will play after initial delay if paused
            if (video.paused && !playTimer) {
              // If initial load and not played yet, start delayedStart only once
              delayedStart();
            } else if (video.paused) {
              // If paused for other reason (user paused), don't force play; only play if we scheduled it
            }
          }
          wasOutOfView = false;
        } else {
          // Leaving viewport
          wasOutOfView = true;
          pauseTimestamp = Date.now();
          clearPlayTimer();
          try {
            video.pause();
          } catch (e) {}
        }
      });
    },
    {
      threshold: 0.25, // consider "visible" when 25% is in view
    }
  );

  io.observe(video);

  // Pause when user switches tabs / page hidden, resume when visible (with delay)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // mark pause time and clear timers
      pauseTimestamp = Date.now();
      clearPlayTimer();
      try {
        video.pause();
      } catch (e) {}
    } else {
      // tab visible again: only schedule replay if video is in viewport
      if (isElementInViewport(video)) {
        const elapsed = pauseTimestamp ? Date.now() - pauseTimestamp : Infinity;
        const remaining = REPLAY_DELAY - elapsed;
        if (remaining <= 0) {
          clearPlayTimer();
          if (video.paused) {
            try {
              video.currentTime = 0;
            } catch (e) {}
            video.play().catch(() => {});
          }
        } else {
          if (video.paused) schedulePlayAfterDelay(remaining);
        }
      }
    }
  });

  // Safety: start logic after metadata is ready
  if (video.readyState >= 1) {
    // kick off initial delayed start
    delayedStart();
  } else {
    video.addEventListener(
      "loadedmetadata",
      () => {
        delayedStart();
      },
      { once: true }
    );
  }

  // Clean up on unload (defensive)
  window.addEventListener("beforeunload", () => {
    clearPlayTimer();
    io.disconnect();
  });
})();