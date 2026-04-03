(() => {
  // src/script.js
  var navBar = document.querySelector(".nav_component");
  var navMenu = document.querySelector(".nav_menu");
  var navBtn = document.querySelector(".nav_button");
  var allNavLinks = [...navBar.querySelectorAll(".nav_menu_link-wrap")];
  var productHomeBtn = document.querySelector(".btn.products-home");
  var productSelectSection = document.getElementById("products");
  var allProductSections = [
    document.getElementById("closures"),
    document.getElementById("pigging-tees")
  ];
  var resourcesSelectSection = document.getElementById("resources");
  var allResourcesSections = [
    document.getElementById("showcases"),
    document.getElementById("documents")
  ];
  var allCardLinks = document.querySelectorAll(".card-link");
  var mainWrap = document.querySelector(".main-wrapper");
  var blackout = document.querySelector(".blackout");
  var txtAndBtnsWrap = document.querySelector(".txt-and-btns-wrap");
  var allTxtWraps = [...document.querySelectorAll(".txt-wrap")];
  var allVidDivs = [...document.querySelectorAll(".vid-div")];
  var allVidCode = [...document.querySelectorAll(".vid-code")];
  var allVids = document.querySelectorAll(".vid");
  var allBackBtns = document.querySelectorAll(".back-btn");
  var allBackBtnsMP = document.querySelectorAll(".back-btn.mp");
  var ctrlBtnWrap = document.querySelector(".section-wrap-btns");
  var activeNavLink = allNavLinks[0];
  var activeProductSection = null;
  var activeResourcesSection = null;
  var activeVidDiv = null;
  var activeTxtWrap = null;
  var activeVid = document.querySelectorAll(".vid")[1];
  var isMobilePortrait = false;
  var sections = gsap.utils.toArray(".section");
  var dragWrap = document.querySelector(".drag-wrap");
  var dragTrack = document.querySelector(".drag-track");
  var dragHandle = document.querySelector(".drag-handle");
  var dragInstance;
  var activeRotateVid = null;
  var mobileSelectedProductView = false;
  var isSeeking = false;
  if (navBar) {
    navBar.addEventListener("click", function(e) {
      const clicked = e.target.closest(".nav_menu_link");
      if (!clicked) return;
      flashBlackout();
      if ("navMenuOpen" in navMenu.dataset) navBtn.click();
      activateProductSelect();
    });
  }
  if (allNavLinks) {
    allNavLinks.forEach(function(el) {
      el.addEventListener("mouseenter", function() {
        deactivateNavLinks();
        el.querySelector(".nav_menu_link-bar").classList.add("active");
      });
      el.addEventListener("mouseleave", function() {
        el.querySelector(".nav_menu_link-bar").classList.remove("active");
      });
    });
  }
  if (productHomeBtn) {
    productHomeBtn.addEventListener("click", function() {
      activateProductSelect();
    });
  }
  if (mainWrap) {
    mainWrap.addEventListener("click", function(e) {
      const clicked = e.target.closest("[data-click-action]");
      if (!clicked) return;
      const datasetAction = clicked.dataset.product;
      if (datasetAction !== "product-1" && datasetAction !== "product-2" && datasetAction !== "product-3")
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
  allCardLinks.forEach(function(el) {
    el.addEventListener("click", function() {
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
    allBackBtns.forEach(function(el) {
      el.addEventListener("click", function(e) {
        if (e.target.classList.contains("mp")) return;
        activateProductSelect();
      });
    });
  }
  if (allBackBtnsMP) {
    allBackBtnsMP.forEach(function(el) {
      el.addEventListener("click", function() {
        mobileSelectedProductView = false;
        toggleMobileProductOpts();
      });
    });
  }
  if (allVids) {
    allVids.forEach(function(el) {
      el.addEventListener("ended", function(e) {
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
  window.addEventListener("lenis-ready", () => {
    window.lenis.on("scroll", ({ velocity, progress, target }) => {
      if (velocity === 0) {
        const sections2 = document.querySelectorAll(".section");
        sections2.forEach((section) => {
          const rect = section.getBoundingClientRect();
          if (rect.top >= -10 && rect.top <= 10) {
          }
        });
      }
    });
  });
  document.addEventListener("DOMContentLoaded", () => {
    navBar.style.backgroundColor = "transparent";
    blackout.classList.remove("active");
    function updateVideo(instance) {
      if (!activeVid || !activeVid.duration) return;
      if (isSeeking) return;
      isSeeking = true;
      requestAnimationFrame(() => {
        let progress = instance.x / instance.maxX;
        activeVid.currentTime = progress * activeVid.duration;
        isSeeking = false;
      });
    }
    document.addEventListener(
      "touchstart",
      function() {
        allVids.forEach((vid) => {
          vid.play().then(() => {
            vid.pause();
          }).catch((err) => {
          });
        });
      },
      { once: true }
    );
    gsap.registerPlugin(Draggable);
    dragInstance = Draggable.create(dragHandle, {
      type: "x",
      bounds: dragTrack,
      inertia: true,
      edgeResistance: 1,
      overshootTolerance: 0,
      onDrag: function() {
        updateVideo(this);
      },
      onThrowUpdate: function() {
        updateVideo(this);
      }
    })[0];
    if (dragTrack) {
      dragTrack.addEventListener("click", (e) => {
        if (e.target === dragHandle) return;
        const dragTrackRect = dragTrack.getBoundingClientRect();
        const dragHandleWidth = dragHandle.offsetWidth;
        let clickX = e.clientX - dragTrackRect.left - dragHandleWidth / 2;
        const finalX = Math.max(0, Math.min(clickX, dragInstance.maxX));
        gsap.to(dragHandle, {
          x: finalX,
          duration: 0.4,
          ease: "power2.out",
          onUpdate: () => {
            dragInstance.update();
            updateVideo(dragInstance);
          }
        });
      });
    }
    init();
  });
  function init() {
    const mobilePortraitQuery = window.matchMedia("(max-width: 479px)");
    if (mobilePortraitQuery.matches) {
      isMobilePortrait = true;
      allTxtWraps.forEach(function(el) {
        el.classList.remove("active");
      });
    }
    const closureSection = document.getElementById("closures");
    const piggingTeesSection = document.getElementById("pigging-tees");
    const allBtnsGrid = document.querySelectorAll(".btns-grid");
    if (closureSection) closureSection.classList.remove("active");
    if (piggingTeesSection) piggingTeesSection.classList.remove("active");
    if (allBtnsGrid)
      allBtnsGrid.forEach(function(el) {
        el.classList.add("active");
      });
    if (dragWrap) dragWrap.classList.remove("active");
  }
  function flashBlackout() {
    blackout.classList.add("active");
    setTimeout(function() {
      blackout.classList.remove("active");
    }, 400);
  }
  function deactivateNavLinks() {
    allNavLinks.forEach(function(el) {
      el.classList.remove("active");
    });
  }
  function activateProductSelect() {
    allProductSections.forEach(function(el) {
      el.classList.remove("active");
    });
    productSelectSection.classList.add("active");
  }
  function activateProductSection(datasetValue) {
    productSelectSection.classList.remove("active");
    allProductSections.forEach(function(el) {
      el.classList.remove("active");
    });
    activeProductSection = allProductSections.find(
      (el2) => el2.id === datasetValue
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
    allResourcesSections.forEach(function(el) {
      el.classList.remove("active");
    });
    activeResourcesSection = allResourcesSections.find(
      (el2) => el2.id === datasetValue
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
    activeProductSection.querySelectorAll(".txt-wrap").forEach(function(el) {
      el.classList.remove("active");
      if (el.dataset.product === datasetAction) {
        el.classList.add("active");
        activeTxtWrap = el;
      }
    });
  }
  function setActiveVidDiv() {
    activeProductSection.querySelectorAll(".vid-div").forEach(function(el) {
      el.classList.remove("active");
    });
    if (isMobilePortrait) {
      activeVidDiv = [...activeProductSection.querySelectorAll(".vid-div")].find(
        (el) => el.classList.contains("mp")
      );
    } else
      activeVidDiv = [...activeProductSection.querySelectorAll(".vid-div")].find(
        (el) => !el.classList.contains("mp")
      );
    if (activeVidDiv) activeVidDiv.classList.add("active");
  }
  function setActiveRevealAndRotateVids(datasetAction) {
    if (activeVidDiv) {
      activeVidDiv.querySelectorAll(".vid-code").forEach(function(el) {
        const vid = el.querySelector(".vid");
        const source = vid.querySelector("source");
        if (!source) return;
        if (el.dataset.product !== datasetAction) {
          vid.pause();
          source.src = "";
          vid.load();
          el.classList.remove("active");
          return;
        }
        if (source.src !== source.dataset.src) {
          source.src = source.dataset.src;
          vid.load();
        }
        if (el.dataset.vidType === "reveal") {
          el.classList.add("active");
          activeVid = vid;
        } else if (el.dataset.vidType === "rotate") {
          el.classList.remove("active");
          activeRotateVid = vid;
        }
      });
    }
  }
  function resetDragControl() {
    activeVid.currentTime = 0;
    gsap.to(dragHandle, {
      x: 0,
      duration: 0.5,
      ease: "power2.inOut",
      onUpdate: function() {
        dragInstance.update();
      }
    });
  }
  function toggleMobileProductOpts() {
    blackout.classList.add("active");
    if (mobileSelectedProductView) {
      activeProductSection.querySelector(".txt-and-btns-wrap").style.setProperty("height", "25rem", "important");
      activeProductSection.querySelector(".btns-grid").classList.remove("active");
      activeVidDiv.classList.add("active");
      activeTxtWrap.classList.add("active");
      activeTxtWrap.style.visibility = "visible";
      activeTxtWrap.style.opacity = "1";
      activeTxtWrap.style.zIndex = "10";
      void activeTxtWrap.offsetHeight;
    } else {
      activeProductSection.querySelector(".txt-and-btns-wrap").style.height = "auto";
      activeProductSection.querySelector(".btns-grid").classList.add("active");
      activeVidDiv.classList.remove("active");
      activeProductSection.querySelector(".back-btn.mp").classList.remove("active");
      activeProductSection.querySelector(".drag-wrap").classList.remove("active");
      activeTxtWrap.classList.remove("active");
    }
    setTimeout(function() {
      blackout.classList.remove("active");
    }, 20);
  }
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL3NjcmlwdC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxyXG4vL1ZJRCBDVFJMUyBERUZJTklUSU9OUy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXHJcbmNvbnN0IG5hdkJhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubmF2X2NvbXBvbmVudFwiKTtcclxuY29uc3QgbmF2TWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubmF2X21lbnVcIik7XHJcbmNvbnN0IG5hdkJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubmF2X2J1dHRvblwiKTtcclxuY29uc3QgYWxsTmF2TGlua3MgPSBbLi4ubmF2QmFyLnF1ZXJ5U2VsZWN0b3JBbGwoXCIubmF2X21lbnVfbGluay13cmFwXCIpXTtcclxuY29uc3QgcHJvZHVjdEhvbWVCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmJ0bi5wcm9kdWN0cy1ob21lXCIpO1xyXG5jb25zdCBwcm9kdWN0U2VsZWN0U2VjdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJvZHVjdHNcIik7XHJcbmNvbnN0IGFsbFByb2R1Y3RTZWN0aW9ucyA9IFtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNsb3N1cmVzXCIpLFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGlnZ2luZy10ZWVzXCIpLFxyXG5dO1xyXG5jb25zdCByZXNvdXJjZXNTZWxlY3RTZWN0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXNvdXJjZXNcIik7XHJcbmNvbnN0IGFsbFJlc291cmNlc1NlY3Rpb25zID0gW1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2hvd2Nhc2VzXCIpLFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZG9jdW1lbnRzXCIpLFxyXG5dO1xyXG5jb25zdCBhbGxDYXJkTGlua3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmNhcmQtbGlua1wiKTtcclxuY29uc3QgbWFpbldyYXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLm1haW4td3JhcHBlclwiKTtcclxuY29uc3QgYmxhY2tvdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmJsYWNrb3V0XCIpO1xyXG5jb25zdCB0eHRBbmRCdG5zV3JhcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudHh0LWFuZC1idG5zLXdyYXBcIik7XHJcbmNvbnN0IGFsbFR4dFdyYXBzID0gWy4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudHh0LXdyYXBcIildO1xyXG5jb25zdCBhbGxWaWREaXZzID0gWy4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudmlkLWRpdlwiKV07XHJcbmNvbnN0IGFsbFZpZENvZGUgPSBbLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi52aWQtY29kZVwiKV07XHJcbmNvbnN0IGFsbFZpZHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnZpZFwiKTtcclxuY29uc3QgYWxsQmFja0J0bnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmJhY2stYnRuXCIpO1xyXG5jb25zdCBhbGxCYWNrQnRuc01QID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5iYWNrLWJ0bi5tcFwiKTtcclxuY29uc3QgY3RybEJ0bldyYXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnNlY3Rpb24td3JhcC1idG5zXCIpO1xyXG5sZXQgYWN0aXZlTmF2TGluayA9IGFsbE5hdkxpbmtzWzBdOyAvL2ZpeCB0aGlzXHJcbmxldCBhY3RpdmVQcm9kdWN0U2VjdGlvbiA9IG51bGw7XHJcbmxldCBhY3RpdmVSZXNvdXJjZXNTZWN0aW9uID0gbnVsbDtcclxubGV0IGFjdGl2ZVZpZERpdiA9IG51bGw7XHJcbmxldCBhY3RpdmVUeHRXcmFwID0gbnVsbDtcclxubGV0IGFjdGl2ZVZpZENvZGUgPSBudWxsO1xyXG5sZXQgYWN0aXZlVmlkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi52aWRcIilbMV07IC8vZml4IHRoaXNcclxubGV0IGlzTW9iaWxlUG9ydHJhaXQgPSBmYWxzZTtcclxuLy8uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxyXG4vL0dTQVAgREVGSU5JVElPTlMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXHJcbmNvbnN0IHNlY3Rpb25zID0gZ3NhcC51dGlscy50b0FycmF5KFwiLnNlY3Rpb25cIik7XHJcbmNvbnN0IGRyYWdXcmFwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5kcmFnLXdyYXBcIik7XHJcbmNvbnN0IGRyYWdUcmFjayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZHJhZy10cmFja1wiKTtcclxuY29uc3QgZHJhZ0hhbmRsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZHJhZy1oYW5kbGVcIik7XHJcbmxldCBkcmFnSW5zdGFuY2U7XHJcbmxldCBhY3RpdmVSb3RhdGVWaWQgPSBudWxsO1xyXG5sZXQgbW9iaWxlU2VsZWN0ZWRQcm9kdWN0VmlldyA9IGZhbHNlO1xyXG5sZXQgaXNTZWVraW5nID0gZmFsc2U7IC8vIFRoZSBcImxvY2tcIiB0byBwcmV2ZW50IG92ZXItdGF4aW5nIHRoZSBDUFVcclxuLy8uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cclxuLy9FVkVOVFMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cclxuaWYgKG5hdkJhcikge1xyXG4gIG5hdkJhci5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgIGNvbnN0IGNsaWNrZWQgPSBlLnRhcmdldC5jbG9zZXN0KFwiLm5hdl9tZW51X2xpbmtcIik7XHJcbiAgICBpZiAoIWNsaWNrZWQpIHJldHVybjtcclxuICAgIGZsYXNoQmxhY2tvdXQoKTtcclxuICAgIGlmIChcIm5hdk1lbnVPcGVuXCIgaW4gbmF2TWVudS5kYXRhc2V0KSBuYXZCdG4uY2xpY2soKTtcclxuICAgIGFjdGl2YXRlUHJvZHVjdFNlbGVjdCgpO1xyXG4gIH0pO1xyXG59XHJcbmlmIChhbGxOYXZMaW5rcykge1xyXG4gIGFsbE5hdkxpbmtzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGRlYWN0aXZhdGVOYXZMaW5rcygpO1xyXG4gICAgICBlbC5xdWVyeVNlbGVjdG9yKFwiLm5hdl9tZW51X2xpbmstYmFyXCIpLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XHJcbiAgICB9KTtcclxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgZWwucXVlcnlTZWxlY3RvcihcIi5uYXZfbWVudV9saW5rLWJhclwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn1cclxuaWYgKHByb2R1Y3RIb21lQnRuKSB7XHJcbiAgcHJvZHVjdEhvbWVCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgIGFjdGl2YXRlUHJvZHVjdFNlbGVjdCgpO1xyXG4gIH0pO1xyXG59XHJcbmlmIChtYWluV3JhcCkge1xyXG4gIG1haW5XcmFwLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgY29uc3QgY2xpY2tlZCA9IGUudGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1jbGljay1hY3Rpb25dXCIpO1xyXG4gICAgaWYgKCFjbGlja2VkKSByZXR1cm47XHJcbiAgICBjb25zdCBkYXRhc2V0QWN0aW9uID0gY2xpY2tlZC5kYXRhc2V0LnByb2R1Y3Q7XHJcbiAgICBpZiAoXHJcbiAgICAgIGRhdGFzZXRBY3Rpb24gIT09IFwicHJvZHVjdC0xXCIgJiZcclxuICAgICAgZGF0YXNldEFjdGlvbiAhPT0gXCJwcm9kdWN0LTJcIiAmJlxyXG4gICAgICBkYXRhc2V0QWN0aW9uICE9PSBcInByb2R1Y3QtM1wiXHJcbiAgICApXHJcbiAgICAgIHJldHVybjtcclxuICAgIGFjdGl2ZVByb2R1Y3RTZWN0aW9uLnF1ZXJ5U2VsZWN0b3IoXCIuZHJhZy13cmFwXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgICByZXNldERyYWdDb250cm9sKCk7XHJcbiAgICBhY3RpdmF0ZVByb2R1Y3QoZGF0YXNldEFjdGlvbik7XHJcbiAgICBpZiAoYWN0aXZlVmlkLnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwibXBcIikpIHtcclxuICAgICAgbW9iaWxlU2VsZWN0ZWRQcm9kdWN0VmlldyA9IHRydWU7XHJcbiAgICAgIHRvZ2dsZU1vYmlsZVByb2R1Y3RPcHRzKCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuYWxsQ2FyZExpbmtzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgIGNvbnN0IGRhdGFzZXRWYWx1ZSA9IGVsLmRhdGFzZXQuc2VjdGlvbjtcclxuICAgIGZsYXNoQmxhY2tvdXQoKTtcclxuICAgIGlmIChkYXRhc2V0VmFsdWUgPT09IFwiY2xvc3VyZXNcIiB8fCBkYXRhc2V0VmFsdWUgPT09IFwicGlnZ2luZy10ZWVzXCIpIHtcclxuICAgICAgYWN0aXZhdGVQcm9kdWN0U2VjdGlvbihkYXRhc2V0VmFsdWUpO1xyXG4gICAgICBtb2JpbGVTZWxlY3RlZFByb2R1Y3RWaWV3ID0gZmFsc2U7XHJcbiAgICAgIGlmIChpc01vYmlsZVBvcnRyYWl0KSB0b2dnbGVNb2JpbGVQcm9kdWN0T3B0cygpO1xyXG4gICAgfVxyXG4gICAgaWYgKGRhdGFzZXRWYWx1ZSA9PT0gXCJzaG93Y2FzZXNcIiB8fCBkYXRhc2V0VmFsdWUgPT09IFwiZG9jdW1lbnRzXCIpIHtcclxuICAgICAgYWN0aXZhdGVSZXNvdXJjZXNTZWN0aW9uKGRhdGFzZXRWYWx1ZSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn0pO1xyXG5pZiAoYWxsQmFja0J0bnMpIHtcclxuICBhbGxCYWNrQnRucy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGlmIChlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoXCJtcFwiKSkgcmV0dXJuO1xyXG4gICAgICBhY3RpdmF0ZVByb2R1Y3RTZWxlY3QoKTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG59XHJcbmlmIChhbGxCYWNrQnRuc01QKSB7XHJcbiAgYWxsQmFja0J0bnNNUC5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgbW9iaWxlU2VsZWN0ZWRQcm9kdWN0VmlldyA9IGZhbHNlO1xyXG4gICAgICB0b2dnbGVNb2JpbGVQcm9kdWN0T3B0cygpO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn1cclxuaWYgKGFsbFZpZHMpIHtcclxuICBhbGxWaWRzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKFwiZW5kZWRcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgY29uc3QgZW5kZWRWaWQgPSBlLnRhcmdldC5jbG9zZXN0KFwiLnZpZFwiKTtcclxuICAgICAgaWYgKGVuZGVkVmlkLnBhcmVudEVsZW1lbnQuZGF0YXNldC52aWRUeXBlICE9PSBcInJldmVhbFwiKSByZXR1cm47XHJcbiAgICAgIGlmIChhY3RpdmVSb3RhdGVWaWQpIHtcclxuICAgICAgICBhY3RpdmVSb3RhdGVWaWQucGFyZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xyXG4gICAgICAgIGFjdGl2ZVZpZCA9IGFjdGl2ZVJvdGF0ZVZpZDtcclxuICAgICAgICBhY3RpdmVWaWQubG9hZCgpO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IGJhY2tCdG5NcCA9IGFjdGl2ZVByb2R1Y3RTZWN0aW9uLnF1ZXJ5U2VsZWN0b3IoXCIuYmFjay1idG4ubXBcIik7XHJcbiAgICAgIGlmIChiYWNrQnRuTXApIGJhY2tCdG5NcC5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xyXG4gICAgICBhY3RpdmVQcm9kdWN0U2VjdGlvbi5xdWVyeVNlbGVjdG9yKFwiLmRyYWctd3JhcFwiKS5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn1cclxuLy9MZW5pcyByZWFkeVxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxlbmlzLXJlYWR5XCIsICgpID0+IHtcclxuICB3aW5kb3cubGVuaXMub24oXCJzY3JvbGxcIiwgKHsgdmVsb2NpdHksIHByb2dyZXNzLCB0YXJnZXQgfSkgPT4ge1xyXG4gICAgaWYgKHZlbG9jaXR5ID09PSAwKSB7XHJcbiAgICAgIGNvbnN0IHNlY3Rpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zZWN0aW9uXCIpO1xyXG4gICAgICBzZWN0aW9ucy5mb3JFYWNoKChzZWN0aW9uKSA9PiB7XHJcbiAgICAgICAgY29uc3QgcmVjdCA9IHNlY3Rpb24uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgLy8gSWYgdGhlIHRvcCBvZiB0aGUgc2VjdGlvbiBpcyB3aXRoaW4gMTBweCBvZiB0aGUgdG9wIG9mIHRoZSBzY3JlZW5cclxuICAgICAgICBpZiAocmVjdC50b3AgPj0gLTEwICYmIHJlY3QudG9wIDw9IDEwKSB7XHJcbiAgICAgICAgICAvLyBibGFja291dC5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn0pO1xyXG4vL3BhZ2UgbG9hZCwgdG91Y2hzdGFydCwgR1NBUCBzbGlkZXJcclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xyXG4gIG5hdkJhci5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcInRyYW5zcGFyZW50XCI7XHJcbiAgYmxhY2tvdXQuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICBmdW5jdGlvbiB1cGRhdGVWaWRlbyhpbnN0YW5jZSkge1xyXG4gICAgLy8gMS4gU2FmZXR5IGNoZWNrczogRW5zdXJlIHRoZXJlIGlzIGEgdmlkZW8gYW5kIGl0IGhhcyBhIGR1cmF0aW9uXHJcbiAgICBpZiAoIWFjdGl2ZVZpZCB8fCAhYWN0aXZlVmlkLmR1cmF0aW9uKSByZXR1cm47XHJcbiAgICAvLyAyLiBQZXJmb3JtYW5jZSBDaGVjazogSWYgdGhlIHBob25lIGlzIHN0aWxsIHByb2Nlc3NpbmcgdGhlIGxhc3QgZnJhbWUsIHNraXAgdGhpcyBvbmVcclxuICAgIGlmIChpc1NlZWtpbmcpIHJldHVybjtcclxuICAgIGlzU2Vla2luZyA9IHRydWU7IC8vIExvY2tcclxuICAgIC8vIDMuIFN5bmMgd2l0aCB0aGUgc2NyZWVuJ3MgcmVmcmVzaCByYXRlXHJcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xyXG4gICAgICBsZXQgcHJvZ3Jlc3MgPSBpbnN0YW5jZS54IC8gaW5zdGFuY2UubWF4WDtcclxuICAgICAgLy8gNC4gVXBkYXRlIHRoZSB2aWRlbyB0aW1lXHJcbiAgICAgIGFjdGl2ZVZpZC5jdXJyZW50VGltZSA9IHByb2dyZXNzICogYWN0aXZlVmlkLmR1cmF0aW9uO1xyXG4gICAgICBpc1NlZWtpbmcgPSBmYWxzZTsgLy8gVW5sb2NrIGZvciB0aGUgbmV4dCBmcmFtZVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIC8vdG91Y2hzdGFydCBldmVudFxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICBcInRvdWNoc3RhcnRcIixcclxuICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgYWxsVmlkcy5mb3JFYWNoKCh2aWQpID0+IHtcclxuICAgICAgICAvLyBQbGF5IGZvciBhIHNwbGl0IHNlY29uZCB0aGVuIHBhdXNlIHRvIGZvcmNlIGEgYnVmZmVyIGZpbGxcclxuICAgICAgICB2aWRcclxuICAgICAgICAgIC5wbGF5KClcclxuICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgdmlkLnBhdXNlKCk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgLyogSW50ZW50aW9uYWwgc2lsZW5jZTogd2UgYXJlIGp1c3Qgd2FybWluZyB0aGUgYnVmZmVyICovXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgeyBvbmNlOiB0cnVlIH0sXHJcbiAgKTsgLy8gT25seSBydW5zIG9uIHRoZSB2ZXJ5IGZpcnN0IHRhcFxyXG4gIGdzYXAucmVnaXN0ZXJQbHVnaW4oRHJhZ2dhYmxlKTtcclxuICAvLyBDcmVhdGUgdGhlIGRyYWdnYWJsZSBhbmQgc3RvcmUgaXQgaW4gYSB2YXJpYWJsZVxyXG4gIGRyYWdJbnN0YW5jZSA9IERyYWdnYWJsZS5jcmVhdGUoZHJhZ0hhbmRsZSwge1xyXG4gICAgdHlwZTogXCJ4XCIsXHJcbiAgICBib3VuZHM6IGRyYWdUcmFjayxcclxuICAgIGluZXJ0aWE6IHRydWUsXHJcbiAgICBlZGdlUmVzaXN0YW5jZTogMSxcclxuICAgIG92ZXJzaG9vdFRvbGVyYW5jZTogMCxcclxuICAgIG9uRHJhZzogZnVuY3Rpb24gKCkge1xyXG4gICAgICB1cGRhdGVWaWRlbyh0aGlzKTtcclxuICAgIH0sXHJcbiAgICBvblRocm93VXBkYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHVwZGF0ZVZpZGVvKHRoaXMpO1xyXG4gICAgfSxcclxuICB9KVswXTsgLy8gRHJhZ2dhYmxlLmNyZWF0ZSByZXR1cm5zIGFuIGFycmF5OyB3ZSB3YW50IHRoZSBmaXJzdCBpdGVtXHJcbiAgLy8gLS0tIENMSUNLIFRPIFNOQVAgTE9HSUMgLS0tXHJcbiAgaWYgKGRyYWdUcmFjaykge1xyXG4gICAgZHJhZ1RyYWNrLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4ge1xyXG4gICAgICAvLyBJZ25vcmUgaWYgdGhlIHVzZXIgY2xpY2tlZCB0aGUgZHJhZ0hhbmRsZSBpdHNlbGZcclxuICAgICAgaWYgKGUudGFyZ2V0ID09PSBkcmFnSGFuZGxlKSByZXR1cm47XHJcbiAgICAgIC8vIENhbGN1bGF0ZSBjbGljayBwb3NpdGlvbiByZWxhdGl2ZSB0byBkcmFnVHJhY2tcclxuICAgICAgY29uc3QgZHJhZ1RyYWNrUmVjdCA9IGRyYWdUcmFjay5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgY29uc3QgZHJhZ0hhbmRsZVdpZHRoID0gZHJhZ0hhbmRsZS5vZmZzZXRXaWR0aDtcclxuICAgICAgLy8gQ2VudGVyIHRoZSBkcmFnSGFuZGxlIG9uIHRoZSBjbGljayBwb2ludFxyXG4gICAgICBsZXQgY2xpY2tYID0gZS5jbGllbnRYIC0gZHJhZ1RyYWNrUmVjdC5sZWZ0IC0gZHJhZ0hhbmRsZVdpZHRoIC8gMjtcclxuICAgICAgLy8gQ2xhbXAgYmV0d2VlbiAwIGFuZCBtYXhYXHJcbiAgICAgIGNvbnN0IGZpbmFsWCA9IE1hdGgubWF4KDAsIE1hdGgubWluKGNsaWNrWCwgZHJhZ0luc3RhbmNlLm1heFgpKTtcclxuICAgICAgLy8gQW5pbWF0ZSBkcmFnSGFuZGxlIGFuZCBzeW5jIHZpZGVvXHJcbiAgICAgIGdzYXAudG8oZHJhZ0hhbmRsZSwge1xyXG4gICAgICAgIHg6IGZpbmFsWCxcclxuICAgICAgICBkdXJhdGlvbjogMC40LFxyXG4gICAgICAgIGVhc2U6IFwicG93ZXIyLm91dFwiLFxyXG4gICAgICAgIG9uVXBkYXRlOiAoKSA9PiB7XHJcbiAgICAgICAgICAvLyBTeW5jIERyYWdnYWJsZSdzIGludGVybmFsICd4JyBkdXJpbmcgYW5pbWF0aW9uXHJcbiAgICAgICAgICBkcmFnSW5zdGFuY2UudXBkYXRlKCk7XHJcbiAgICAgICAgICB1cGRhdGVWaWRlbyhkcmFnSW5zdGFuY2UpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGluaXQoKTtcclxufSk7XHJcbi8vLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXHJcbi8vRlVOQ1RJT05TLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXHJcbmZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgY29uc3QgbW9iaWxlUG9ydHJhaXRRdWVyeSA9IHdpbmRvdy5tYXRjaE1lZGlhKFwiKG1heC13aWR0aDogNDc5cHgpXCIpO1xyXG4gIGlmIChtb2JpbGVQb3J0cmFpdFF1ZXJ5Lm1hdGNoZXMpIHtcclxuICAgIGlzTW9iaWxlUG9ydHJhaXQgPSB0cnVlO1xyXG4gICAgYWxsVHh0V3JhcHMuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBjb25zdCBjbG9zdXJlU2VjdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2xvc3VyZXNcIik7XHJcbiAgY29uc3QgcGlnZ2luZ1RlZXNTZWN0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwaWdnaW5nLXRlZXNcIik7XHJcbiAgY29uc3QgYWxsQnRuc0dyaWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmJ0bnMtZ3JpZFwiKTtcclxuICBpZiAoY2xvc3VyZVNlY3Rpb24pIGNsb3N1cmVTZWN0aW9uLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgaWYgKHBpZ2dpbmdUZWVzU2VjdGlvbikgcGlnZ2luZ1RlZXNTZWN0aW9uLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgaWYgKGFsbEJ0bnNHcmlkKVxyXG4gICAgYWxsQnRuc0dyaWQuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgZWwuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxuICAgIH0pO1xyXG4gIGlmIChkcmFnV3JhcCkgZHJhZ1dyYXAuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxufVxyXG5mdW5jdGlvbiBmbGFzaEJsYWNrb3V0KCkge1xyXG4gIGJsYWNrb3V0LmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XHJcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICBibGFja291dC5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gIH0sIDQwMCk7XHJcbn1cclxuZnVuY3Rpb24gZGVhY3RpdmF0ZU5hdkxpbmtzKCkge1xyXG4gIGFsbE5hdkxpbmtzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gIH0pO1xyXG59XHJcbmZ1bmN0aW9uIGFjdGl2YXRlUHJvZHVjdFNlbGVjdCgpIHtcclxuICBhbGxQcm9kdWN0U2VjdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgfSk7XHJcbiAgcHJvZHVjdFNlbGVjdFNlY3Rpb24uY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxufVxyXG5mdW5jdGlvbiBhY3RpdmF0ZVByb2R1Y3RTZWN0aW9uKGRhdGFzZXRWYWx1ZSkge1xyXG4gIHByb2R1Y3RTZWxlY3RTZWN0aW9uLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgYWxsUHJvZHVjdFNlY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gIH0pO1xyXG4gIGFjdGl2ZVByb2R1Y3RTZWN0aW9uID0gYWxsUHJvZHVjdFNlY3Rpb25zLmZpbmQoXHJcbiAgICAoZWwyKSA9PiBlbDIuaWQgPT09IGRhdGFzZXRWYWx1ZSxcclxuICApO1xyXG4gIGRyYWdXcmFwLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgYWN0aXZlUHJvZHVjdFNlY3Rpb24uY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxuICBzZXRBY3RpdmVUeHQoXCJwcm9kdWN0LTFcIik7XHJcbiAgc2V0QWN0aXZlVmlkRGl2KCk7XHJcbiAgc2V0QWN0aXZlUmV2ZWFsQW5kUm90YXRlVmlkcyhcInByb2R1Y3QtMVwiKTtcclxuICBpZiAoaXNNb2JpbGVQb3J0cmFpdCA9PT0gZmFsc2UpIHtcclxuICAgIGlmIChhY3RpdmVWaWQpIGFjdGl2ZVZpZC5wbGF5KCk7XHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIGFjdGl2YXRlUmVzb3VyY2VzU2VjdGlvbihkYXRhc2V0VmFsdWUpIHtcclxuICByZXNvdXJjZXNTZWxlY3RTZWN0aW9uLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgYWxsUmVzb3VyY2VzU2VjdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgfSk7XHJcbiAgYWN0aXZlUmVzb3VyY2VzU2VjdGlvbiA9IGFsbFJlc291cmNlc1NlY3Rpb25zLmZpbmQoXHJcbiAgICAoZWwyKSA9PiBlbDIuaWQgPT09IGRhdGFzZXRWYWx1ZSxcclxuICApO1xyXG4gIGFjdGl2ZVJlc291cmNlc1NlY3Rpb24uY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxufVxyXG5mdW5jdGlvbiBhY3RpdmF0ZVByb2R1Y3QoZGF0YXNldEFjdGlvbikge1xyXG4gIHNldEFjdGl2ZVR4dChkYXRhc2V0QWN0aW9uKTtcclxuICBzZXRBY3RpdmVWaWREaXYoKTtcclxuICBzZXRBY3RpdmVSZXZlYWxBbmRSb3RhdGVWaWRzKGRhdGFzZXRBY3Rpb24pO1xyXG4gIGFjdGl2ZVZpZC5wbGF5KCk7XHJcbn1cclxuZnVuY3Rpb24gc2V0QWN0aXZlVHh0KGRhdGFzZXRBY3Rpb24pIHtcclxuICBhY3RpdmVQcm9kdWN0U2VjdGlvbi5xdWVyeVNlbGVjdG9yQWxsKFwiLnR4dC13cmFwXCIpLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gICAgaWYgKGVsLmRhdGFzZXQucHJvZHVjdCA9PT0gZGF0YXNldEFjdGlvbikge1xyXG4gICAgICBlbC5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xyXG4gICAgICBhY3RpdmVUeHRXcmFwID0gZWw7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuZnVuY3Rpb24gc2V0QWN0aXZlVmlkRGl2KCkge1xyXG4gIGFjdGl2ZVByb2R1Y3RTZWN0aW9uLnF1ZXJ5U2VsZWN0b3JBbGwoXCIudmlkLWRpdlwiKS5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgZWwuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICB9KTtcclxuICBpZiAoaXNNb2JpbGVQb3J0cmFpdCkge1xyXG4gICAgYWN0aXZlVmlkRGl2ID0gWy4uLmFjdGl2ZVByb2R1Y3RTZWN0aW9uLnF1ZXJ5U2VsZWN0b3JBbGwoXCIudmlkLWRpdlwiKV0uZmluZChcclxuICAgICAgKGVsKSA9PiBlbC5jbGFzc0xpc3QuY29udGFpbnMoXCJtcFwiKSxcclxuICAgICk7XHJcbiAgfSBlbHNlXHJcbiAgICBhY3RpdmVWaWREaXYgPSBbLi4uYWN0aXZlUHJvZHVjdFNlY3Rpb24ucXVlcnlTZWxlY3RvckFsbChcIi52aWQtZGl2XCIpXS5maW5kKFxyXG4gICAgICAoZWwpID0+ICFlbC5jbGFzc0xpc3QuY29udGFpbnMoXCJtcFwiKSxcclxuICAgICk7XHJcbiAgaWYgKGFjdGl2ZVZpZERpdikgYWN0aXZlVmlkRGl2LmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XHJcbn1cclxuZnVuY3Rpb24gc2V0QWN0aXZlUmV2ZWFsQW5kUm90YXRlVmlkcyhkYXRhc2V0QWN0aW9uKSB7XHJcbiAgaWYgKGFjdGl2ZVZpZERpdikge1xyXG4gICAgYWN0aXZlVmlkRGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudmlkLWNvZGVcIikuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgY29uc3QgdmlkID0gZWwucXVlcnlTZWxlY3RvcihcIi52aWRcIik7XHJcbiAgICAgIGNvbnN0IHNvdXJjZSA9IHZpZC5xdWVyeVNlbGVjdG9yKFwic291cmNlXCIpO1xyXG4gICAgICBpZiAoIXNvdXJjZSkgcmV0dXJuO1xyXG4gICAgICAvLyAxLiBJZiBpdCdzIE5PVCB0aGUgYWN0aXZlIHByb2R1Y3QsIGtpbGwgdGhlIGNvbm5lY3Rpb24gdG8gc2F2ZSBkYXRhXHJcbiAgICAgIGlmIChlbC5kYXRhc2V0LnByb2R1Y3QgIT09IGRhdGFzZXRBY3Rpb24pIHtcclxuICAgICAgICB2aWQucGF1c2UoKTtcclxuICAgICAgICBzb3VyY2Uuc3JjID0gXCJcIjtcclxuICAgICAgICB2aWQubG9hZCgpO1xyXG4gICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIDIuIElmIGl0IElTIHRoZSBhY3RpdmUgcHJvZHVjdCwgbG9hZCB0aGUgZGF0YVxyXG4gICAgICBpZiAoc291cmNlLnNyYyAhPT0gc291cmNlLmRhdGFzZXQuc3JjKSB7XHJcbiAgICAgICAgc291cmNlLnNyYyA9IHNvdXJjZS5kYXRhc2V0LnNyYztcclxuICAgICAgICB2aWQubG9hZCgpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIC0tLSBUSEUgU0VRVUVOQ0UgTE9HSUMgLS0tXHJcbiAgICAgIGlmIChlbC5kYXRhc2V0LnZpZFR5cGUgPT09IFwicmV2ZWFsXCIpIHtcclxuICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpOyAvLyBTSE9XIHRoZSBSZXZlYWwgdmlkZW9cclxuICAgICAgICBhY3RpdmVWaWQgPSB2aWQ7IC8vIFNldCB0aGlzIGFzIHRoZSBvbmUgdG8gLnBsYXkoKSBpbW1lZGlhdGVseVxyXG4gICAgICB9IGVsc2UgaWYgKGVsLmRhdGFzZXQudmlkVHlwZSA9PT0gXCJyb3RhdGVcIikge1xyXG4gICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7IC8vIEhJREUgdGhlIFJvdGF0ZSB2aWRlbyAoZm9yIG5vdylcclxuICAgICAgICBhY3RpdmVSb3RhdGVWaWQgPSB2aWQ7IC8vIFN0b3JlIHJlZmVyZW5jZSBmb3IgdGhlICdlbmRlZCcgaGFuZC1vZmZcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIHJlc2V0RHJhZ0NvbnRyb2woKSB7XHJcbiAgLy8gMS4gUmVzZXQgdGhlIGFjdGl2ZVZpZCBpbW1lZGlhdGVseVxyXG4gIGFjdGl2ZVZpZC5jdXJyZW50VGltZSA9IDA7XHJcbiAgLy8gMi4gQW5pbWF0ZSBkcmFnSGFuZGxlIGJhY2sgdG8gc3RhcnQgKHg6IDApXHJcbiAgZ3NhcC50byhkcmFnSGFuZGxlLCB7XHJcbiAgICB4OiAwLFxyXG4gICAgZHVyYXRpb246IDAuNSxcclxuICAgIGVhc2U6IFwicG93ZXIyLmluT3V0XCIsXHJcbiAgICBvblVwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAvLyAzLiBJTVBPUlRBTlQ6IFRlbGwgRHJhZ2dhYmxlIHRoZSBkcmFnSGFuZGxlIGhhcyBtb3ZlZFxyXG4gICAgICAvLyBkcmFnSW5zdGFuY2Ugc2hvdWxkIGJlIHRoZSB2YXJpYWJsZSB3aGVyZSB5b3Ugc3RvcmVkIERyYWdnYWJsZS5jcmVhdGUoKVxyXG4gICAgICBkcmFnSW5zdGFuY2UudXBkYXRlKCk7XHJcbiAgICB9LFxyXG4gIH0pO1xyXG59XHJcbmZ1bmN0aW9uIHRvZ2dsZU1vYmlsZVByb2R1Y3RPcHRzKCkge1xyXG4gIGJsYWNrb3V0LmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XHJcbiAgaWYgKG1vYmlsZVNlbGVjdGVkUHJvZHVjdFZpZXcpIHtcclxuICAgIC8vIDEuIEZvcmNlIGEgaGVpZ2h0IHRoYXQgU2FmYXJpIGNhbm5vdCBpZ25vcmVcclxuICAgIGFjdGl2ZVByb2R1Y3RTZWN0aW9uXHJcbiAgICAgIC5xdWVyeVNlbGVjdG9yKFwiLnR4dC1hbmQtYnRucy13cmFwXCIpXHJcbiAgICAgIC5zdHlsZS5zZXRQcm9wZXJ0eShcImhlaWdodFwiLCBcIjI1cmVtXCIsIFwiaW1wb3J0YW50XCIpO1xyXG4gICAgLy8gMi4gU3RhbmRhcmQgdG9nZ2xlc1xyXG4gICAgYWN0aXZlUHJvZHVjdFNlY3Rpb24ucXVlcnlTZWxlY3RvcihcIi5idG5zLWdyaWRcIikuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICAgIGFjdGl2ZVZpZERpdi5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xyXG4gICAgLy8gMy4gaVBob25lIFZpc2liaWxpdHkgRml4ZXNcclxuICAgIGFjdGl2ZVR4dFdyYXAuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxuICAgIGFjdGl2ZVR4dFdyYXAuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiOyAvLyBGb3JjZSB2aXNpYmlsaXR5XHJcbiAgICBhY3RpdmVUeHRXcmFwLnN0eWxlLm9wYWNpdHkgPSBcIjFcIjsgLy8gRm9yY2Ugb3BhY2l0eVxyXG4gICAgYWN0aXZlVHh0V3JhcC5zdHlsZS56SW5kZXggPSBcIjEwXCI7IC8vIEZvcmNlIHRvIHRoZSBmcm9udFxyXG4gICAgLy8gNC4gVGhlIFwiTWFnaWNcIiBSZWZsb3cgKENyaXRpY2FsIGZvciBpT1MpXHJcbiAgICB2b2lkIGFjdGl2ZVR4dFdyYXAub2Zmc2V0SGVpZ2h0O1xyXG4gIH0gZWxzZSB7XHJcbiAgICBhY3RpdmVQcm9kdWN0U2VjdGlvbi5xdWVyeVNlbGVjdG9yKFwiLnR4dC1hbmQtYnRucy13cmFwXCIpLnN0eWxlLmhlaWdodCA9XHJcbiAgICAgIFwiYXV0b1wiO1xyXG4gICAgYWN0aXZlUHJvZHVjdFNlY3Rpb24ucXVlcnlTZWxlY3RvcihcIi5idG5zLWdyaWRcIikuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxuICAgIGFjdGl2ZVZpZERpdi5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gICAgYWN0aXZlUHJvZHVjdFNlY3Rpb25cclxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoXCIuYmFjay1idG4ubXBcIilcclxuICAgICAgLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgICBhY3RpdmVQcm9kdWN0U2VjdGlvbi5xdWVyeVNlbGVjdG9yKFwiLmRyYWctd3JhcFwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gICAgYWN0aXZlVHh0V3JhcC5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gIH1cclxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgIGJsYWNrb3V0LmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgfSwgMjApO1xyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7O0FBRUEsTUFBTSxTQUFTLFNBQVMsY0FBYyxnQkFBZ0I7QUFDdEQsTUFBTSxVQUFVLFNBQVMsY0FBYyxXQUFXO0FBQ2xELE1BQU0sU0FBUyxTQUFTLGNBQWMsYUFBYTtBQUNuRCxNQUFNLGNBQWMsQ0FBQyxHQUFHLE9BQU8saUJBQWlCLHFCQUFxQixDQUFDO0FBQ3RFLE1BQU0saUJBQWlCLFNBQVMsY0FBYyxvQkFBb0I7QUFDbEUsTUFBTSx1QkFBdUIsU0FBUyxlQUFlLFVBQVU7QUFDL0QsTUFBTSxxQkFBcUI7QUFBQSxJQUN6QixTQUFTLGVBQWUsVUFBVTtBQUFBLElB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
