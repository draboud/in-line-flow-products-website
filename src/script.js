console.log("testing...2");
//.....................................................
//VID CTRLS DEFINITIONS................................
const navBar = document.querySelector(".nav_component");
const allNavLinks = navBar.querySelectorAll(".nav_menu_link-wrap");
const mainWrap = document.querySelector(".main-wrapper");
const blackout = document.querySelector(".blackout-section");
const allTxtWraps = [...document.querySelectorAll(".txt-wrap")];
const allVidDivs = [...document.querySelectorAll(".vid-div")];
const allVidCode = [...document.querySelectorAll(".vid-code")];
const allVids = document.querySelectorAll(".vid");
const allProductsBtns = document.querySelectorAll(".btn.products");
const ctrlBtnWrap = document.querySelector(".section-wrap-btns");
let activeVidCode;
let activeVid = document.querySelectorAll(".vid")[1]; //fix this
//.....................................................
//GSAP DEFINITIONS.....................................
const dragWrap = document.querySelector(".drag-wrap");
const dragTrack = document.querySelector(".drag-track");
const dragHandle = document.querySelector(".drag-handle");
let dragInstance;
let activeRotateVid = null;
let mobileSelectedProductView = false;
//......................................................
//EVENTS................................................
navBar.addEventListener("click", function (e) {
  const clicked = e.target.closest(".nav_menu_link-wrap");
  if (!clicked) return;
  activateNavLink(clicked);
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
    mobileSelectedProductView = false;
    toggleMobileProductOpts();
  });
});
allVids.forEach(function (el) {
  el.addEventListener("ended", function (e) {
    const endedVid = e.target.closest(".vid");
    if (endedVid.parentElement.dataset.vidType !== "reveal") return;

    activeRotateVid.parentElement.classList.add("active");
    activeVid = activeRotateVid;
    activeVid.preload = "auto";
    activeVid.load();
    dragWrap.classList.add("active");
  });
});

//TOUCHSTART INIT AND GSAP SLIDER EVENTS
document.addEventListener("DOMContentLoaded", () => {
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
          .catch((err) => console.log("Buffering initiated"));
      });
    },
    { once: true },
  ); // Only runs on the very first tap
  gsap.registerPlugin(Draggable);
  function updateVideo(instance) {
    if (activeVid && activeVid.duration) {
      let progress = instance.x / instance.maxX;
      activeVid.currentTime = progress * activeVid.duration;
    }
  }
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
  let isSeeking = false; // The "lock" to prevent over-taxing the CPU

  function updateVideo(instance) {
    if (!activeVid || !activeVid.duration || isSeeking) return;

    isSeeking = true; // Lock the function

    requestAnimationFrame(() => {
      let progress = instance.x / instance.maxX;
      // Apply the time change
      activeVid.currentTime = progress * activeVid.duration;
      isSeeking = false; // Unlock for the next frame
    });
  }
});

//......................................................
//FUNCTIONS.............................................
function activateNavLink(clickedNavLink) {
  allNavLinks.forEach(function (el) {
    el.querySelector(".nav_menu_link-bar").classList.remove("active");
  });
  clickedNavLink.querySelector(".nav_menu_link-bar").classList.add("active");
}
function activateProduct(datasetAction) {
  setActiveTxt(datasetAction);
  seActiveRevealAndRotateVids(datasetAction);
  activeVid.play();
}
function setActiveTxt(datasetAction) {
  allTxtWraps.forEach(function (el) {
    el.classList.remove("active");
    if (el.dataset.product === datasetAction) el.classList.add("active");
  });
}
// function seActiveRevealAndRotateVids(datasetAction) {
//   allVidCode.forEach(function (el) {
//     el.querySelector(".vid").currentTime = 0;
//     el.querySelector(".vid").pause();
//     el.querySelector(".vid").preload = "metadata";
//     el.querySelector(".vid").load();
//     el.classList.remove("active");
//     if (
//       el.dataset.product === datasetAction &&
//       el.dataset.vidType === "reveal" &&
//       window.getComputedStyle(el).display !== "none"
//     ) {
//       el.classList.add("active");
//       activeVid = el.querySelector(".vid");
//       activeVid.preload = "auto";
//     }
//     if (
//       el.dataset.product === datasetAction &&
//       el.dataset.vidType === "rotate" &&
//       window.getComputedStyle(el).display !== "none"
//     ) {
//       activeRotateVid = el.querySelector(".vid");
//     }
//   });
// }
function seActiveRevealAndRotateVids(datasetAction) {
  allVidCode.forEach(function (el) {
    const vid = el.querySelector(".vid");
    const source = vid.querySelector("source");

    // 1. If it's NOT the active product, kill the connection to save data
    if (el.dataset.product !== datasetAction) {
      vid.pause();
      source.src = ""; // Empty the source
      vid.load(); // Clear the buffer
      el.classList.remove("active");
      return;
    }

    // 2. If it IS the active product, load it now
    if (el.dataset.vidType === "reveal" || el.dataset.vidType === "rotate") {
      // Only set the src if it's empty (prevents re-loading)
      if (source.src !== source.dataset.src) {
        source.src = source.dataset.src;
        vid.load();
      }
      el.classList.add("active");
      if (el.dataset.vidType === "reveal") activeVid = vid;
      if (el.dataset.vidType === "rotate") activeRotateVid = vid;
    }
  });
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
  const wrap = document.querySelector(".txt-and-btns-wrap");
  const allTxt = document.querySelector(".all-txt-wrap");
  if (mobileSelectedProductView) {
    // 1. Force a height that Safari cannot ignore
    wrap.style.setProperty("height", "45vh", "important");
    // 2. Standard toggles
    document.querySelector(".btns-grid").style.display = "none";
    document.querySelector(".broch-prods-btns-wrap").style.display = "flex";
    document.querySelector(".vid-div").style.display = "block";
    // 3. iPhone Visibility Fixes
    allTxt.style.display = "block";
    allTxt.style.visibility = "visible"; // Force visibility
    allTxt.style.opacity = "1"; // Force opacity
    allTxt.style.zIndex = "9999"; // Force to the front
    allTxt.style.position = "relative"; // Required for z-index to work
    // 4. The "Magic" Reflow (Critical for iOS)
    void allTxt.offsetHeight;
  } else {
    wrap.style.height = "100%";
    document.querySelector(".btns-grid").style.display = "grid";
    document.querySelector(".broch-prods-btns-wrap").style.display = "none";
    document.querySelector(".vid-div").style.display = "none";
    allTxt.style.display = "none";
  }
}
