//.....................................................
//VID CTRLS DEFINITIONS................................
const navBar = document.querySelector(".nav_component");
const navMenu = document.querySelector(".nav_menu");
const navBtn = document.querySelector(".nav_button");
const allNavLinks = [...navBar.querySelectorAll(".nav_menu_link-wrap")];
let activeNavLink = allNavLinks[0]; //fix this
const mainWrap = document.querySelector(".main-wrapper");
const blackout = document.querySelector(".blackout");
const txtAndBtnsWrap = document.querySelector(".txt-and-btns-wrap");
const allTxtWraps = [...document.querySelectorAll(".txt-wrap")];
const allVidDivs = [...document.querySelectorAll(".vid-div")];
const allVidCode = [...document.querySelectorAll(".vid-code")];
const allVids = document.querySelectorAll(".vid");
const allProductsBtns = document.querySelectorAll(".btn.products");
const ctrlBtnWrap = document.querySelector(".section-wrap-btns");
let activeVidDiv = null;
let activeTxtWrap = null;
let activeVidCode = null;
let activeVid = document.querySelectorAll(".vid")[1]; //fix this
let isMobilePortrait = false;
//.....................................................
//GSAP DEFINITIONS.....................................
const sections = gsap.utils.toArray(".section");

const dragWrap = document.querySelector(".drag-wrap");
const dragTrack = document.querySelector(".drag-track");
const dragHandle = document.querySelector(".drag-handle");
let dragInstance;
let activeRotateVid = null;
let mobileSelectedProductView = false;
let isSeeking = false; // The "lock" to prevent over-taxing the CPU
//......................................................
//EVENTS................................................
navBar.addEventListener("click", function (e) {
  const clicked = e.target.closest(".nav_menu_link");
  if (!clicked) return;
  // blackout.classList.add("active");
  if ("navMenuOpen" in navMenu.dataset) navBtn.click();
});
mainWrap.addEventListener("click", function (e) {
  const clicked = e.target.closest("[data-click-action]");
  if (!clicked) return;
  const datasetAction = clicked.dataset.product;
  if (
    datasetAction !== "product-1" &&
    datasetAction !== "product-2" &&
    datasetAction !== "product-3"
  )
    return;
  dragWrap.classList.remove("active");
  resetDragControl();
  activateProduct(datasetAction);
  if (activeVid.parentElement.classList.contains("mp")) {
    mobileSelectedProductView = true;
    toggleMobileProductOpts();
  }
});
allProductsBtns.forEach(function (el) {
  el.addEventListener("click", function () {
    if (activeVid.parentElement.classList.contains("mp")) {
      mobileSelectedProductView = false;
      toggleMobileProductOpts();
    }
  });
});
allVids.forEach(function (el) {
  el.addEventListener("ended", function (e) {
    const endedVid = e.target.closest(".vid");
    if (endedVid.parentElement.dataset.vidType !== "reveal") return;
    activeRotateVid.parentElement.classList.add("active");
    activeVid = activeRotateVid;
    activeVid.load();
    dragWrap.classList.add("active");
  });
});
//touchstart init, GSAP slider
document.addEventListener("DOMContentLoaded", () => {
  function updateVideo(instance) {
    // 1. Safety checks: Ensure there is a video and it has a duration
    if (!activeVid || !activeVid.duration) return;
    // 2. Performance Check: If the phone is still processing the last frame, skip this one
    if (isSeeking) return;
    isSeeking = true; // Lock
    // 3. Sync with the screen's refresh rate
    requestAnimationFrame(() => {
      let progress = instance.x / instance.maxX;
      // 4. Update the video time
      activeVid.currentTime = progress * activeVid.duration;
      isSeeking = false; // Unlock for the next frame
    });
  }
  //touchstart event
  document.addEventListener(
    "touchstart",
    function () {
      allVids.forEach((vid) => {
        // Play for a split second then pause to force a buffer fill
        vid
          .play()
          .then(() => {
            vid.pause();
          })
          .catch((err) => {
            /* Intentional silence: we are just warming the buffer */
          });
      });
    },
    { once: true },
  ); // Only runs on the very first tap
  gsap.registerPlugin(Draggable);
  // Create the draggable and store it in a variable
  dragInstance = Draggable.create(dragHandle, {
    type: "x",
    bounds: dragTrack,
    inertia: true,
    edgeResistance: 1,
    overshootTolerance: 0,
    onDrag: function () {
      updateVideo(this);
    },
    onThrowUpdate: function () {
      updateVideo(this);
    },
  })[0]; // Draggable.create returns an array; we want the first item
  // --- CLICK TO SNAP LOGIC ---
  if (dragTrack) {
    dragTrack.addEventListener("click", (e) => {
      // Ignore if the user clicked the dragHandle itself
      if (e.target === dragHandle) return;
      // Calculate click position relative to dragTrack
      const dragTrackRect = dragTrack.getBoundingClientRect();
      const dragHandleWidth = dragHandle.offsetWidth;
      // Center the dragHandle on the click point
      let clickX = e.clientX - dragTrackRect.left - dragHandleWidth / 2;
      // Clamp between 0 and maxX
      const finalX = Math.max(0, Math.min(clickX, dragInstance.maxX));
      // Animate dragHandle and sync video
      gsap.to(dragHandle, {
        x: finalX,
        duration: 0.4,
        ease: "power2.out",
        onUpdate: () => {
          // Sync Draggable's internal 'x' during animation
          dragInstance.update();
          updateVideo(dragInstance);
        },
      });
    });
  }
  init();
});
//......................................................
//FUNCTIONS.............................................
//SCROLL SNAPPING
function startApp() {
  // Check for both ScrollTo and ScrollTrigger
  const stp =
    window.ScrollToPlugin ||
    (window.gsap && window.gsap.plugins && window.gsap.plugins.scrollTo);
  const str = window.ScrollTrigger;
  if (stp && str) {
    // Register BOTH here
    gsap.registerPlugin(stp, str);
    // 1. Initialize your custom logic
    initScrollNext();
    // 2. Setup the Observer ONLY ONCE after plugins are ready
    const observerOptions = {
      root: null,
      threshold: 0.6,
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Check if GSAP is currently animating a scroll
          if (!gsap.isTweening(window)) {
            sectionReached(entry.target.id);
          }
        }
      });
    }, observerOptions);
    sections.forEach((section) => observer.observe(section));
  } else {
    // If not found yet, wait and try again
    setTimeout(startApp, 50);
  }
}
// Start the check as soon as the script loads
startApp();
function initScrollNext() {
  //for scroll-snapping
  const nextBtn = document.querySelector(".btn.scroll-next-btn");
  if (!nextBtn || sections.length === 0) return;
  nextBtn.addEventListener("click", () => {
    // 1. Kill the snap so the browser stops fighting
    toggleSnap(false);
    // 1. Determine which section is currently in view
    let currentSectionIndex = sections.findIndex((section) => {
      const rect = section.getBoundingClientRect();
      // Check if the top of the section is roughly at the top of the viewport
      return rect.top >= -100 && rect.top <= 100;
    });
    // 2. Find the next section (or loop back to the first)
    let nextSectionIndex = (currentSectionIndex + 1) % sections.length;
    const targetSection = sections[nextSectionIndex];
    // 3. GSAP Scroll to that section
    gsap.to(window, {
      duration: 0.8,
      scrollTo: { y: targetSection, autoKill: false },
      ease: "power2.inOut",
      overwrite: "auto", // Ensure no other tweens interfere
      onComplete: () => {
        const activeId = targetSection.id;
        sectionReached(activeId);
        if (activeId) history.pushState(null, null, `#${activeId}`);
        // 2. Re-enable snapping after short delay
        setTimeout(() => {
          toggleSnap(true);
          // 3. The "Anchor" - Tell the browser "We are definitely here"
          window.scrollTo(0, targetSection.offsetTop);
        }, 50);
      },
    });
  });
}
// Helper to toggle snapping
// function toggleSnap(enabled) {
//   document.documentElement.style.scrollSnapType = enabled
//     ? "y mandatory"
//     : "none";
//   document.body.style.scrollSnapType = enabled ? "y mandatory" : "none";
// }
function toggleSnap(enabled) {
  // Target all your sections
  const sections = document.querySelectorAll(".section");

  sections.forEach((section) => {
    // If disabled, remove the alignment so there's nothing to snap TO
    section.style.scrollSnapAlign = enabled ? "start" : "none";
  });
}
function sectionReached(id) {
  allNavLinks.forEach(function (el) {
    el.querySelector(".nav_menu_link-bar").classList.remove("active");
  });
  activeNavLink = allNavLinks.find(
    (el) => el.querySelector(".nav_menu_link").innerHTML === id,
  );
  activeNavLink.querySelector(".nav_menu_link-bar").classList.add("active");
}
function init() {
  const mobilePortraitQuery = window.matchMedia("(max-width: 479px)");
  if (mobilePortraitQuery.matches) {
    isMobilePortrait = true;
    allTxtWraps.forEach(function (el) {
      el.classList.remove("active");
    });
  }
  if (isMobilePortrait !== true) {
    setActiveVidDiv();
    setActiveTxt("product-1");
    setActiveRevealAndRotateVids("product-1");
    if (activeVid) activeVid.play();
  }
}
function activateProduct(datasetAction) {
  setActiveTxt(datasetAction);
  setActiveVidDiv();
  setActiveRevealAndRotateVids(datasetAction);
  activeVid.play();
}
function setActiveTxt(datasetAction) {
  allTxtWraps.forEach(function (el) {
    el.classList.remove("active");
    if (el.dataset.product === datasetAction) {
      el.classList.add("active");
      activeTxtWrap = el;
    }
  });
}
function setActiveVidDiv() {
  allVidDivs.forEach(function (el) {
    el.classList.remove("active");
  });
  if (isMobilePortrait) {
    activeVidDiv = allVidDivs.find((el) => el.classList.contains("mp"));
  } else activeVidDiv = allVidDivs.find((el) => !el.classList.contains("mp"));
  if (activeVidDiv) activeVidDiv.classList.add("active");
}
function setActiveRevealAndRotateVids(datasetAction) {
  if (activeVidDiv) {
    activeVidDiv.querySelectorAll(".vid-code").forEach(function (el) {
      const vid = el.querySelector(".vid");
      const source = vid.querySelector("source");
      if (!source) return;
      // 1. If it's NOT the active product, kill the connection to save data
      if (el.dataset.product !== datasetAction) {
        vid.pause();
        source.src = "";
        vid.load();
        el.classList.remove("active");
        return;
      }
      // 2. If it IS the active product, load the data
      if (source.src !== source.dataset.src) {
        source.src = source.dataset.src;
        vid.load();
      }
      // --- THE SEQUENCE LOGIC ---
      if (el.dataset.vidType === "reveal") {
        el.classList.add("active"); // SHOW the Reveal video
        activeVid = vid; // Set this as the one to .play() immediately
      } else if (el.dataset.vidType === "rotate") {
        el.classList.remove("active"); // HIDE the Rotate video (for now)
        activeRotateVid = vid; // Store reference for the 'ended' hand-off
      }
    });
  }
}
function resetDragControl() {
  // 1. Reset the activeVid immediately
  activeVid.currentTime = 0;
  // 2. Animate dragHandle back to start (x: 0)
  gsap.to(dragHandle, {
    x: 0,
    duration: 0.5,
    ease: "power2.inOut",
    onUpdate: function () {
      // 3. IMPORTANT: Tell Draggable the dragHandle has moved
      // dragInstance should be the variable where you stored Draggable.create()
      dragInstance.update();
    },
  });
}
function toggleMobileProductOpts() {
  blackout.classList.add("active");
  if (mobileSelectedProductView) {
    // 1. Force a height that Safari cannot ignore
    txtAndBtnsWrap.style.setProperty("height", "20rem", "important");
    // 2. Standard toggles
    document.querySelector(".btns-grid").classList.remove("active");
    activeVidDiv.classList.add("active");
    // 3. iPhone Visibility Fixes
    activeTxtWrap.classList.add("active");
    activeTxtWrap.style.visibility = "visible"; // Force visibility
    activeTxtWrap.style.opacity = "1"; // Force opacity
    activeTxtWrap.style.zIndex = "10"; // Force to the front
    // 4. The "Magic" Reflow (Critical for iOS)
    void activeTxtWrap.offsetHeight;
  } else {
    txtAndBtnsWrap.style.height = "100%";
    document.querySelector(".btns-grid").classList.add("active");
    activeVidDiv.classList.remove("active");
    document.querySelector(".drag-wrap").classList.remove("active");
    activeTxtWrap.classList.remove("active");
  }
  setTimeout(function () {
    blackout.classList.remove("active");
  }, 250);
}
