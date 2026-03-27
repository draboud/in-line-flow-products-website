console.log("testing...");
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
//GSAP SLIDER EVENTS
document.addEventListener("DOMContentLoaded", () => {
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
  function updateVideo(instance) {
    let progress = instance.x / instance.maxX;
    activeVid.currentTime = progress * activeVid.duration;
  }
  // 3. Handle window resizing to keep bounds accurate
  window.addEventListener("resize", () => {
    Draggable.get(".drag-handle").applyBounds(".drag-track");
  });
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
function seActiveRevealAndRotateVids(datasetAction) {
  allVidCode.forEach(function (el) {
    el.querySelector(".vid").currentTime = 0;
    el.querySelector(".vid").pause();
    el.querySelector(".vid").preload = "metadata";
    el.querySelector(".vid").load();
    el.classList.remove("active");
    if (
      el.dataset.product === datasetAction &&
      el.dataset.vidType === "reveal" &&
      window.getComputedStyle(el).display !== "none"
    ) {
      el.classList.add("active");
      activeVid = el.querySelector(".vid");
      activeVid.preload = "auto";
    }
    if (
      el.dataset.product === datasetAction &&
      el.dataset.vidType === "rotate" &&
      window.getComputedStyle(el).display !== "none"
    ) {
      activeRotateVid = el.querySelector(".vid");
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
//.............................................
// function toggleMobileProductOpts() {
//   if (mobileSelectedProductView) {
//     document.querySelector(".txt-and-btns-wrap").style.height = "45%";
//     document.querySelector(".btns-grid").style.display = "none";
//     document.querySelector(".broch-prods-btns-wrap").style.display = "flex";
//     document.querySelector(".vid-div").style.display = "block";
//     document.querySelector(".all-txt-wrap").style.display = "block";
//   } else {
//     mobileSelectedProductView = false;
//     document.querySelector(".txt-and-btns-wrap").style.height = "100%";
//     document.querySelector(".btns-grid").style.display = "grid";
//     document.querySelector(".broch-prods-btns-wrap").style.display = "none";
//     document.querySelector(".vid-div").style.display = "none";
//     document.querySelector(".all-txt-wrap").style.display = "none";
//   }
// }
function toggleMobileProductOpts() {
  // Select our elements once to keep it clean
  const txtAndBtnsWrap = document.querySelector(".txt-and-btns-wrap");
  const btnsGrid = document.querySelector(".btns-grid");
  const brochWrap = document.querySelector(".broch-prods-btns-wrap");
  const vidDiv = document.querySelector(".vid-div");
  const allTxtWrap = document.querySelector(".all-txt-wrap");

  if (mobileSelectedProductView) {
    // 1. Use 45vh (viewport height) because iOS often ignores % heights
    txtAndBtnsWrap.style.height = "45vh";

    // 2. Hide/Show elements
    btnsGrid.style.display = "none";
    brochWrap.style.display = "flex";
    vidDiv.style.display = "block";

    // 3. Show text and force a "reflow" (Critical for iPhone rendering)
    allTxtWrap.style.display = "block";
    void allTxtWrap.offsetHeight; // This "magic" line forces Safari to redraw
  } else {
    // Reset state
    txtAndBtnsWrap.style.height = "100%";
    btnsGrid.style.display = "grid";
    brochWrap.style.display = "none";
    vidDiv.style.display = "none";
    allTxtWrap.style.display = "none";
  }
}

//.............................................
