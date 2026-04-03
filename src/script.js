//.....................................................
//VID CTRLS DEFINITIONS................................
const navBar = document.querySelector(".nav_component");
const navMenu = document.querySelector(".nav_menu");
const navBtn = document.querySelector(".nav_button");
const allNavLinks = [...navBar.querySelectorAll(".nav_menu_link-wrap")];
const productHomeBtn = document.querySelector(".btn.products-home");
const productSelectSection = document.getElementById("products");
const allProductSections = [
  document.getElementById("closures"),
  document.getElementById("pigging-tees"),
];
const resourcesSelectSection = document.getElementById("resources");
const allResourcesSections = [
  document.getElementById("showcases"),
  document.getElementById("documents"),
];
const allCardLinks = document.querySelectorAll(".card-link");
const mainWrap = document.querySelector(".main-wrapper");
const blackout = document.querySelector(".blackout");
const txtAndBtnsWrap = document.querySelector(".txt-and-btns-wrap");
const allTxtWraps = [...document.querySelectorAll(".txt-wrap")];
const allVidDivs = [...document.querySelectorAll(".vid-div")];
const allVidCode = [...document.querySelectorAll(".vid-code")];
const allVids = document.querySelectorAll(".vid");
const allBackBtns = document.querySelectorAll(".back-btn");
const allBackBtnsMP = document.querySelectorAll(".back-btn.mp");
const ctrlBtnWrap = document.querySelector(".section-wrap-btns");
let activeNavLink = allNavLinks[0]; //fix this
let activeProductSection = null;
let activeResourcesSection = null;
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
if (navBar) {
  navBar.addEventListener("click", function (e) {
    const clicked = e.target.closest(".nav_menu_link");
    if (!clicked) return;
    flashBlackout();
    if ("navMenuOpen" in navMenu.dataset) navBtn.click();
    activateProductSelect();
  });
}
if (allNavLinks) {
  allNavLinks.forEach(function (el) {
    el.addEventListener("mouseenter", function () {
      deactivateNavLinks();
      el.querySelector(".nav_menu_link-bar").classList.add("active");
    });
    el.addEventListener("mouseleave", function () {
      el.querySelector(".nav_menu_link-bar").classList.remove("active");
    });
  });
}
if (productHomeBtn) {
  productHomeBtn.addEventListener("click", function () {
    activateProductSelect();
  });
}
if (mainWrap) {
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
    activeProductSection.querySelector(".drag-wrap").classList.remove("active");
    resetDragControl();
    activateProduct(datasetAction);
    if (activeVid.parentElement.classList.contains("mp")) {
      mobileSelectedProductView = true;
      toggleMobileProductOpts();
    }
  });
}
allCardLinks.forEach(function (el) {
  el.addEventListener("click", function () {
    const datasetValue = el.dataset.section;
    flashBlackout();
    if (datasetValue === "closures" || datasetValue === "pigging-tees") {
      activateProductSection(datasetValue);
      mobileSelectedProductView = false;
      if (isMobilePortrait) toggleMobileProductOpts();
    }
    if (datasetValue === "showcases" || datasetValue === "documents") {
      activateResourcesSection(datasetValue);
    }
  });
});
if (allBackBtns) {
  allBackBtns.forEach(function (el) {
    el.addEventListener("click", function (e) {
      if (e.target.classList.contains("mp")) return;
      activateProductSelect();
    });
  });
}
if (allBackBtnsMP) {
  allBackBtnsMP.forEach(function (el) {
    el.addEventListener("click", function () {
      mobileSelectedProductView = false;
      toggleMobileProductOpts();
    });
  });
}
if (allVids) {
  allVids.forEach(function (el) {
    el.addEventListener("ended", function (e) {
      const endedVid = e.target.closest(".vid");
      if (endedVid.parentElement.dataset.vidType !== "reveal") return;
      if (activeRotateVid) {
        activeRotateVid.parentElement.classList.add("active");
        activeVid = activeRotateVid;
        activeVid.load();
      }
      const backBtnMp = activeProductSection.querySelector(".back-btn.mp");
      if (backBtnMp) backBtnMp.classList.add("active");
      activeProductSection.querySelector(".drag-wrap").classList.add("active");
    });
  });
}
//Lenis ready
window.addEventListener("lenis-ready", () => {
  window.lenis.on("scroll", ({ velocity, progress, target }) => {
    if (velocity === 0) {
      const sections = document.querySelectorAll(".section");
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        // If the top of the section is within 10px of the top of the screen
        if (rect.top >= -10 && rect.top <= 10) {
          // blackout.classList.remove("active");
        }
      });
    }
  });
});
//page load, touchstart, GSAP slider
document.addEventListener("DOMContentLoaded", () => {
  navBar.style.backgroundColor = "transparent";
  blackout.classList.remove("active");
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
function init() {
  const mobilePortraitQuery = window.matchMedia("(max-width: 479px)");
  if (mobilePortraitQuery.matches) {
    isMobilePortrait = true;
    allTxtWraps.forEach(function (el) {
      el.classList.remove("active");
    });
  }
  const closureSection = document.getElementById("closures");
  const piggingTeesSection = document.getElementById("pigging-tees");
  const allBtnsGrid = document.querySelectorAll(".btns-grid");
  if (closureSection) closureSection.classList.remove("active");
  if (piggingTeesSection) piggingTeesSection.classList.remove("active");
  if (allBtnsGrid)
    allBtnsGrid.forEach(function (el) {
      el.classList.add("active");
    });
  if (dragWrap) dragWrap.classList.remove("active");
}
function flashBlackout() {
  blackout.classList.add("active");
  setTimeout(function () {
    blackout.classList.remove("active");
  }, 400);
}
function deactivateNavLinks() {
  allNavLinks.forEach(function (el) {
    el.classList.remove("active");
  });
}
function activateProductSelect() {
  allProductSections.forEach(function (el) {
    el.classList.remove("active");
  });
  productSelectSection.classList.add("active");
}
function activateProductSection(datasetValue) {
  productSelectSection.classList.remove("active");
  allProductSections.forEach(function (el) {
    el.classList.remove("active");
  });
  activeProductSection = allProductSections.find(
    (el2) => el2.id === datasetValue,
  );
  dragWrap.classList.remove("active");
  activeProductSection.classList.add("active");
  setActiveTxt("product-1");
  setActiveVidDiv();
  setActiveRevealAndRotateVids("product-1");
  if (isMobilePortrait === false) {
    if (activeVid) activeVid.play();
  }
}
function activateResourcesSection(datasetValue) {
  resourcesSelectSection.classList.remove("active");
  allResourcesSections.forEach(function (el) {
    el.classList.remove("active");
  });
  activeResourcesSection = allResourcesSections.find(
    (el2) => el2.id === datasetValue,
  );
  activeResourcesSection.classList.add("active");
}
function activateProduct(datasetAction) {
  setActiveTxt(datasetAction);
  setActiveVidDiv();
  setActiveRevealAndRotateVids(datasetAction);
  activeVid.play();
}
function setActiveTxt(datasetAction) {
  activeProductSection.querySelectorAll(".txt-wrap").forEach(function (el) {
    el.classList.remove("active");
    if (el.dataset.product === datasetAction) {
      el.classList.add("active");
      activeTxtWrap = el;
    }
  });
}
function setActiveVidDiv() {
  activeProductSection.querySelectorAll(".vid-div").forEach(function (el) {
    el.classList.remove("active");
  });
  if (isMobilePortrait) {
    activeVidDiv = [...activeProductSection.querySelectorAll(".vid-div")].find(
      (el) => el.classList.contains("mp"),
    );
  } else
    activeVidDiv = [...activeProductSection.querySelectorAll(".vid-div")].find(
      (el) => !el.classList.contains("mp"),
    );
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
    activeProductSection
      .querySelector(".txt-and-btns-wrap")
      .style.setProperty("height", "25rem", "important");
    // 2. Standard toggles
    activeProductSection.querySelector(".btns-grid").classList.remove("active");
    activeVidDiv.classList.add("active");
    // 3. iPhone Visibility Fixes
    activeTxtWrap.classList.add("active");
    activeTxtWrap.style.visibility = "visible"; // Force visibility
    activeTxtWrap.style.opacity = "1"; // Force opacity
    activeTxtWrap.style.zIndex = "10"; // Force to the front
    // 4. The "Magic" Reflow (Critical for iOS)
    void activeTxtWrap.offsetHeight;
  } else {
    activeProductSection.querySelector(".txt-and-btns-wrap").style.height =
      "auto";
    activeProductSection.querySelector(".btns-grid").classList.add("active");
    activeVidDiv.classList.remove("active");
    activeProductSection
      .querySelector(".back-btn.mp")
      .classList.remove("active");
    activeProductSection.querySelector(".drag-wrap").classList.remove("active");
    activeTxtWrap.classList.remove("active");
  }
  setTimeout(function () {
    blackout.classList.remove("active");
  }, 20);
}
