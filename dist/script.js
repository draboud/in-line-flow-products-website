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
      el.addEventListener("click", function() {
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL3NjcmlwdC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxyXG4vL1ZJRCBDVFJMUyBERUZJTklUSU9OUy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXHJcbmNvbnN0IG5hdkJhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubmF2X2NvbXBvbmVudFwiKTtcclxuY29uc3QgbmF2TWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubmF2X21lbnVcIik7XHJcbmNvbnN0IG5hdkJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubmF2X2J1dHRvblwiKTtcclxuY29uc3QgYWxsTmF2TGlua3MgPSBbLi4ubmF2QmFyLnF1ZXJ5U2VsZWN0b3JBbGwoXCIubmF2X21lbnVfbGluay13cmFwXCIpXTtcclxuY29uc3QgcHJvZHVjdEhvbWVCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmJ0bi5wcm9kdWN0cy1ob21lXCIpO1xyXG5jb25zdCBwcm9kdWN0U2VsZWN0U2VjdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJvZHVjdHNcIik7XHJcbmNvbnN0IGFsbFByb2R1Y3RTZWN0aW9ucyA9IFtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNsb3N1cmVzXCIpLFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGlnZ2luZy10ZWVzXCIpLFxyXG5dO1xyXG5jb25zdCByZXNvdXJjZXNTZWxlY3RTZWN0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXNvdXJjZXNcIik7XHJcbmNvbnN0IGFsbFJlc291cmNlc1NlY3Rpb25zID0gW1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2hvd2Nhc2VzXCIpLFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZG9jdW1lbnRzXCIpLFxyXG5dO1xyXG5jb25zdCBhbGxDYXJkTGlua3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmNhcmQtbGlua1wiKTtcclxuY29uc3QgbWFpbldyYXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLm1haW4td3JhcHBlclwiKTtcclxuY29uc3QgYmxhY2tvdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmJsYWNrb3V0XCIpO1xyXG5jb25zdCB0eHRBbmRCdG5zV3JhcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudHh0LWFuZC1idG5zLXdyYXBcIik7XHJcbmNvbnN0IGFsbFR4dFdyYXBzID0gWy4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudHh0LXdyYXBcIildO1xyXG5jb25zdCBhbGxWaWREaXZzID0gWy4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudmlkLWRpdlwiKV07XHJcbmNvbnN0IGFsbFZpZENvZGUgPSBbLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi52aWQtY29kZVwiKV07XHJcbmNvbnN0IGFsbFZpZHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnZpZFwiKTtcclxuY29uc3QgYWxsQmFja0J0bnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmJhY2stYnRuXCIpO1xyXG5jb25zdCBhbGxCYWNrQnRuc01QID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5iYWNrLWJ0bi5tcFwiKTtcclxuY29uc3QgY3RybEJ0bldyYXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnNlY3Rpb24td3JhcC1idG5zXCIpO1xyXG5sZXQgYWN0aXZlTmF2TGluayA9IGFsbE5hdkxpbmtzWzBdOyAvL2ZpeCB0aGlzXHJcbmxldCBhY3RpdmVQcm9kdWN0U2VjdGlvbiA9IG51bGw7XHJcbmxldCBhY3RpdmVSZXNvdXJjZXNTZWN0aW9uID0gbnVsbDtcclxubGV0IGFjdGl2ZVZpZERpdiA9IG51bGw7XHJcbmxldCBhY3RpdmVUeHRXcmFwID0gbnVsbDtcclxubGV0IGFjdGl2ZVZpZENvZGUgPSBudWxsO1xyXG5sZXQgYWN0aXZlVmlkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi52aWRcIilbMV07IC8vZml4IHRoaXNcclxubGV0IGlzTW9iaWxlUG9ydHJhaXQgPSBmYWxzZTtcclxuLy8uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxyXG4vL0dTQVAgREVGSU5JVElPTlMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXHJcbmNvbnN0IHNlY3Rpb25zID0gZ3NhcC51dGlscy50b0FycmF5KFwiLnNlY3Rpb25cIik7XHJcbmNvbnN0IGRyYWdXcmFwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5kcmFnLXdyYXBcIik7XHJcbmNvbnN0IGRyYWdUcmFjayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZHJhZy10cmFja1wiKTtcclxuY29uc3QgZHJhZ0hhbmRsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZHJhZy1oYW5kbGVcIik7XHJcbmxldCBkcmFnSW5zdGFuY2U7XHJcbmxldCBhY3RpdmVSb3RhdGVWaWQgPSBudWxsO1xyXG5sZXQgbW9iaWxlU2VsZWN0ZWRQcm9kdWN0VmlldyA9IGZhbHNlO1xyXG5sZXQgaXNTZWVraW5nID0gZmFsc2U7IC8vIFRoZSBcImxvY2tcIiB0byBwcmV2ZW50IG92ZXItdGF4aW5nIHRoZSBDUFVcclxuLy8uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cclxuLy9FVkVOVFMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cclxuaWYgKG5hdkJhcikge1xyXG4gIG5hdkJhci5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgIGNvbnN0IGNsaWNrZWQgPSBlLnRhcmdldC5jbG9zZXN0KFwiLm5hdl9tZW51X2xpbmtcIik7XHJcbiAgICBpZiAoIWNsaWNrZWQpIHJldHVybjtcclxuICAgIGZsYXNoQmxhY2tvdXQoKTtcclxuICAgIGlmIChcIm5hdk1lbnVPcGVuXCIgaW4gbmF2TWVudS5kYXRhc2V0KSBuYXZCdG4uY2xpY2soKTtcclxuICAgIGFjdGl2YXRlUHJvZHVjdFNlbGVjdCgpO1xyXG4gIH0pO1xyXG59XHJcbmlmIChhbGxOYXZMaW5rcykge1xyXG4gIGFsbE5hdkxpbmtzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGRlYWN0aXZhdGVOYXZMaW5rcygpO1xyXG4gICAgICBlbC5xdWVyeVNlbGVjdG9yKFwiLm5hdl9tZW51X2xpbmstYmFyXCIpLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XHJcbiAgICB9KTtcclxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgZWwucXVlcnlTZWxlY3RvcihcIi5uYXZfbWVudV9saW5rLWJhclwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn1cclxuaWYgKHByb2R1Y3RIb21lQnRuKSB7XHJcbiAgcHJvZHVjdEhvbWVCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgIGFjdGl2YXRlUHJvZHVjdFNlbGVjdCgpO1xyXG4gIH0pO1xyXG59XHJcbmlmIChtYWluV3JhcCkge1xyXG4gIG1haW5XcmFwLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgY29uc3QgY2xpY2tlZCA9IGUudGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1jbGljay1hY3Rpb25dXCIpO1xyXG4gICAgaWYgKCFjbGlja2VkKSByZXR1cm47XHJcbiAgICBjb25zdCBkYXRhc2V0QWN0aW9uID0gY2xpY2tlZC5kYXRhc2V0LnByb2R1Y3Q7XHJcbiAgICBpZiAoXHJcbiAgICAgIGRhdGFzZXRBY3Rpb24gIT09IFwicHJvZHVjdC0xXCIgJiZcclxuICAgICAgZGF0YXNldEFjdGlvbiAhPT0gXCJwcm9kdWN0LTJcIiAmJlxyXG4gICAgICBkYXRhc2V0QWN0aW9uICE9PSBcInByb2R1Y3QtM1wiXHJcbiAgICApXHJcbiAgICAgIHJldHVybjtcclxuICAgIGFjdGl2ZVByb2R1Y3RTZWN0aW9uLnF1ZXJ5U2VsZWN0b3IoXCIuZHJhZy13cmFwXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgICByZXNldERyYWdDb250cm9sKCk7XHJcbiAgICBhY3RpdmF0ZVByb2R1Y3QoZGF0YXNldEFjdGlvbik7XHJcbiAgICBpZiAoYWN0aXZlVmlkLnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwibXBcIikpIHtcclxuICAgICAgbW9iaWxlU2VsZWN0ZWRQcm9kdWN0VmlldyA9IHRydWU7XHJcbiAgICAgIHRvZ2dsZU1vYmlsZVByb2R1Y3RPcHRzKCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuYWxsQ2FyZExpbmtzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgIGNvbnN0IGRhdGFzZXRWYWx1ZSA9IGVsLmRhdGFzZXQuc2VjdGlvbjtcclxuICAgIGZsYXNoQmxhY2tvdXQoKTtcclxuICAgIGlmIChkYXRhc2V0VmFsdWUgPT09IFwiY2xvc3VyZXNcIiB8fCBkYXRhc2V0VmFsdWUgPT09IFwicGlnZ2luZy10ZWVzXCIpIHtcclxuICAgICAgYWN0aXZhdGVQcm9kdWN0U2VjdGlvbihkYXRhc2V0VmFsdWUpO1xyXG4gICAgICBtb2JpbGVTZWxlY3RlZFByb2R1Y3RWaWV3ID0gZmFsc2U7XHJcbiAgICAgIGlmIChpc01vYmlsZVBvcnRyYWl0KSB0b2dnbGVNb2JpbGVQcm9kdWN0T3B0cygpO1xyXG4gICAgfVxyXG4gICAgaWYgKGRhdGFzZXRWYWx1ZSA9PT0gXCJzaG93Y2FzZXNcIiB8fCBkYXRhc2V0VmFsdWUgPT09IFwiZG9jdW1lbnRzXCIpIHtcclxuICAgICAgYWN0aXZhdGVSZXNvdXJjZXNTZWN0aW9uKGRhdGFzZXRWYWx1ZSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn0pO1xyXG5pZiAoYWxsQmFja0J0bnMpIHtcclxuICBhbGxCYWNrQnRucy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgYWN0aXZhdGVQcm9kdWN0U2VsZWN0KCk7XHJcbiAgICB9KTtcclxuICB9KTtcclxufVxyXG5pZiAoYWxsQmFja0J0bnNNUCkge1xyXG4gIGFsbEJhY2tCdG5zTVAuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIG1vYmlsZVNlbGVjdGVkUHJvZHVjdFZpZXcgPSBmYWxzZTtcclxuICAgICAgdG9nZ2xlTW9iaWxlUHJvZHVjdE9wdHMoKTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG59XHJcbmlmIChhbGxWaWRzKSB7XHJcbiAgYWxsVmlkcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihcImVuZGVkXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGNvbnN0IGVuZGVkVmlkID0gZS50YXJnZXQuY2xvc2VzdChcIi52aWRcIik7XHJcbiAgICAgIGlmIChlbmRlZFZpZC5wYXJlbnRFbGVtZW50LmRhdGFzZXQudmlkVHlwZSAhPT0gXCJyZXZlYWxcIikgcmV0dXJuO1xyXG4gICAgICBpZiAoYWN0aXZlUm90YXRlVmlkKSB7XHJcbiAgICAgICAgYWN0aXZlUm90YXRlVmlkLnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxuICAgICAgICBhY3RpdmVWaWQgPSBhY3RpdmVSb3RhdGVWaWQ7XHJcbiAgICAgICAgYWN0aXZlVmlkLmxvYWQoKTtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBiYWNrQnRuTXAgPSBhY3RpdmVQcm9kdWN0U2VjdGlvbi5xdWVyeVNlbGVjdG9yKFwiLmJhY2stYnRuLm1wXCIpO1xyXG4gICAgICBpZiAoYmFja0J0bk1wKSBiYWNrQnRuTXAuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxuICAgICAgYWN0aXZlUHJvZHVjdFNlY3Rpb24ucXVlcnlTZWxlY3RvcihcIi5kcmFnLXdyYXBcIikuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG59XHJcbi8vTGVuaXMgcmVhZHlcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsZW5pcy1yZWFkeVwiLCAoKSA9PiB7XHJcbiAgd2luZG93LmxlbmlzLm9uKFwic2Nyb2xsXCIsICh7IHZlbG9jaXR5LCBwcm9ncmVzcywgdGFyZ2V0IH0pID0+IHtcclxuICAgIGlmICh2ZWxvY2l0eSA9PT0gMCkge1xyXG4gICAgICBjb25zdCBzZWN0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc2VjdGlvblwiKTtcclxuICAgICAgc2VjdGlvbnMuZm9yRWFjaCgoc2VjdGlvbikgPT4ge1xyXG4gICAgICAgIGNvbnN0IHJlY3QgPSBzZWN0aW9uLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIC8vIElmIHRoZSB0b3Agb2YgdGhlIHNlY3Rpb24gaXMgd2l0aGluIDEwcHggb2YgdGhlIHRvcCBvZiB0aGUgc2NyZWVuXHJcbiAgICAgICAgaWYgKHJlY3QudG9wID49IC0xMCAmJiByZWN0LnRvcCA8PSAxMCkge1xyXG4gICAgICAgICAgLy8gYmxhY2tvdXQuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59KTtcclxuLy9wYWdlIGxvYWQsIHRvdWNoc3RhcnQsIEdTQVAgc2xpZGVyXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcclxuICBuYXZCYXIuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJ0cmFuc3BhcmVudFwiO1xyXG4gIGJsYWNrb3V0LmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgZnVuY3Rpb24gdXBkYXRlVmlkZW8oaW5zdGFuY2UpIHtcclxuICAgIC8vIDEuIFNhZmV0eSBjaGVja3M6IEVuc3VyZSB0aGVyZSBpcyBhIHZpZGVvIGFuZCBpdCBoYXMgYSBkdXJhdGlvblxyXG4gICAgaWYgKCFhY3RpdmVWaWQgfHwgIWFjdGl2ZVZpZC5kdXJhdGlvbikgcmV0dXJuO1xyXG4gICAgLy8gMi4gUGVyZm9ybWFuY2UgQ2hlY2s6IElmIHRoZSBwaG9uZSBpcyBzdGlsbCBwcm9jZXNzaW5nIHRoZSBsYXN0IGZyYW1lLCBza2lwIHRoaXMgb25lXHJcbiAgICBpZiAoaXNTZWVraW5nKSByZXR1cm47XHJcbiAgICBpc1NlZWtpbmcgPSB0cnVlOyAvLyBMb2NrXHJcbiAgICAvLyAzLiBTeW5jIHdpdGggdGhlIHNjcmVlbidzIHJlZnJlc2ggcmF0ZVxyXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcclxuICAgICAgbGV0IHByb2dyZXNzID0gaW5zdGFuY2UueCAvIGluc3RhbmNlLm1heFg7XHJcbiAgICAgIC8vIDQuIFVwZGF0ZSB0aGUgdmlkZW8gdGltZVxyXG4gICAgICBhY3RpdmVWaWQuY3VycmVudFRpbWUgPSBwcm9ncmVzcyAqIGFjdGl2ZVZpZC5kdXJhdGlvbjtcclxuICAgICAgaXNTZWVraW5nID0gZmFsc2U7IC8vIFVubG9jayBmb3IgdGhlIG5leHQgZnJhbWVcclxuICAgIH0pO1xyXG4gIH1cclxuICAvL3RvdWNoc3RhcnQgZXZlbnRcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgXCJ0b3VjaHN0YXJ0XCIsXHJcbiAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGFsbFZpZHMuZm9yRWFjaCgodmlkKSA9PiB7XHJcbiAgICAgICAgLy8gUGxheSBmb3IgYSBzcGxpdCBzZWNvbmQgdGhlbiBwYXVzZSB0byBmb3JjZSBhIGJ1ZmZlciBmaWxsXHJcbiAgICAgICAgdmlkXHJcbiAgICAgICAgICAucGxheSgpXHJcbiAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIHZpZC5wYXVzZSgpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgIC8qIEludGVudGlvbmFsIHNpbGVuY2U6IHdlIGFyZSBqdXN0IHdhcm1pbmcgdGhlIGJ1ZmZlciAqL1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHsgb25jZTogdHJ1ZSB9LFxyXG4gICk7IC8vIE9ubHkgcnVucyBvbiB0aGUgdmVyeSBmaXJzdCB0YXBcclxuICBnc2FwLnJlZ2lzdGVyUGx1Z2luKERyYWdnYWJsZSk7XHJcbiAgLy8gQ3JlYXRlIHRoZSBkcmFnZ2FibGUgYW5kIHN0b3JlIGl0IGluIGEgdmFyaWFibGVcclxuICBkcmFnSW5zdGFuY2UgPSBEcmFnZ2FibGUuY3JlYXRlKGRyYWdIYW5kbGUsIHtcclxuICAgIHR5cGU6IFwieFwiLFxyXG4gICAgYm91bmRzOiBkcmFnVHJhY2ssXHJcbiAgICBpbmVydGlhOiB0cnVlLFxyXG4gICAgZWRnZVJlc2lzdGFuY2U6IDEsXHJcbiAgICBvdmVyc2hvb3RUb2xlcmFuY2U6IDAsXHJcbiAgICBvbkRyYWc6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdXBkYXRlVmlkZW8odGhpcyk7XHJcbiAgICB9LFxyXG4gICAgb25UaHJvd1VwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICB1cGRhdGVWaWRlbyh0aGlzKTtcclxuICAgIH0sXHJcbiAgfSlbMF07IC8vIERyYWdnYWJsZS5jcmVhdGUgcmV0dXJucyBhbiBhcnJheTsgd2Ugd2FudCB0aGUgZmlyc3QgaXRlbVxyXG4gIC8vIC0tLSBDTElDSyBUTyBTTkFQIExPR0lDIC0tLVxyXG4gIGlmIChkcmFnVHJhY2spIHtcclxuICAgIGRyYWdUcmFjay5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcclxuICAgICAgLy8gSWdub3JlIGlmIHRoZSB1c2VyIGNsaWNrZWQgdGhlIGRyYWdIYW5kbGUgaXRzZWxmXHJcbiAgICAgIGlmIChlLnRhcmdldCA9PT0gZHJhZ0hhbmRsZSkgcmV0dXJuO1xyXG4gICAgICAvLyBDYWxjdWxhdGUgY2xpY2sgcG9zaXRpb24gcmVsYXRpdmUgdG8gZHJhZ1RyYWNrXHJcbiAgICAgIGNvbnN0IGRyYWdUcmFja1JlY3QgPSBkcmFnVHJhY2suZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgIGNvbnN0IGRyYWdIYW5kbGVXaWR0aCA9IGRyYWdIYW5kbGUub2Zmc2V0V2lkdGg7XHJcbiAgICAgIC8vIENlbnRlciB0aGUgZHJhZ0hhbmRsZSBvbiB0aGUgY2xpY2sgcG9pbnRcclxuICAgICAgbGV0IGNsaWNrWCA9IGUuY2xpZW50WCAtIGRyYWdUcmFja1JlY3QubGVmdCAtIGRyYWdIYW5kbGVXaWR0aCAvIDI7XHJcbiAgICAgIC8vIENsYW1wIGJldHdlZW4gMCBhbmQgbWF4WFxyXG4gICAgICBjb25zdCBmaW5hbFggPSBNYXRoLm1heCgwLCBNYXRoLm1pbihjbGlja1gsIGRyYWdJbnN0YW5jZS5tYXhYKSk7XHJcbiAgICAgIC8vIEFuaW1hdGUgZHJhZ0hhbmRsZSBhbmQgc3luYyB2aWRlb1xyXG4gICAgICBnc2FwLnRvKGRyYWdIYW5kbGUsIHtcclxuICAgICAgICB4OiBmaW5hbFgsXHJcbiAgICAgICAgZHVyYXRpb246IDAuNCxcclxuICAgICAgICBlYXNlOiBcInBvd2VyMi5vdXRcIixcclxuICAgICAgICBvblVwZGF0ZTogKCkgPT4ge1xyXG4gICAgICAgICAgLy8gU3luYyBEcmFnZ2FibGUncyBpbnRlcm5hbCAneCcgZHVyaW5nIGFuaW1hdGlvblxyXG4gICAgICAgICAgZHJhZ0luc3RhbmNlLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgdXBkYXRlVmlkZW8oZHJhZ0luc3RhbmNlKTtcclxuICAgICAgICB9LFxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBpbml0KCk7XHJcbn0pO1xyXG4vLy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxyXG4vL0ZVTkNUSU9OUy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxyXG5mdW5jdGlvbiBpbml0KCkge1xyXG4gIGNvbnN0IG1vYmlsZVBvcnRyYWl0UXVlcnkgPSB3aW5kb3cubWF0Y2hNZWRpYShcIihtYXgtd2lkdGg6IDQ3OXB4KVwiKTtcclxuICBpZiAobW9iaWxlUG9ydHJhaXRRdWVyeS5tYXRjaGVzKSB7XHJcbiAgICBpc01vYmlsZVBvcnRyYWl0ID0gdHJ1ZTtcclxuICAgIGFsbFR4dFdyYXBzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgY29uc3QgY2xvc3VyZVNlY3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNsb3N1cmVzXCIpO1xyXG4gIGNvbnN0IHBpZ2dpbmdUZWVzU2VjdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGlnZ2luZy10ZWVzXCIpO1xyXG4gIGNvbnN0IGFsbEJ0bnNHcmlkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5idG5zLWdyaWRcIik7XHJcbiAgaWYgKGNsb3N1cmVTZWN0aW9uKSBjbG9zdXJlU2VjdGlvbi5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gIGlmIChwaWdnaW5nVGVlc1NlY3Rpb24pIHBpZ2dpbmdUZWVzU2VjdGlvbi5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gIGlmIChhbGxCdG5zR3JpZClcclxuICAgIGFsbEJ0bnNHcmlkLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgIGVsLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XHJcbiAgICB9KTtcclxuICBpZiAoZHJhZ1dyYXApIGRyYWdXcmFwLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbn1cclxuZnVuY3Rpb24gZmxhc2hCbGFja291dCgpIHtcclxuICBibGFja291dC5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xyXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgYmxhY2tvdXQuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICB9LCA0MDApO1xyXG59XHJcbmZ1bmN0aW9uIGRlYWN0aXZhdGVOYXZMaW5rcygpIHtcclxuICBhbGxOYXZMaW5rcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgZWwuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICB9KTtcclxufVxyXG5mdW5jdGlvbiBhY3RpdmF0ZVByb2R1Y3RTZWxlY3QoKSB7XHJcbiAgYWxsUHJvZHVjdFNlY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gIH0pO1xyXG4gIHByb2R1Y3RTZWxlY3RTZWN0aW9uLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XHJcbn1cclxuZnVuY3Rpb24gYWN0aXZhdGVQcm9kdWN0U2VjdGlvbihkYXRhc2V0VmFsdWUpIHtcclxuICBwcm9kdWN0U2VsZWN0U2VjdGlvbi5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gIGFsbFByb2R1Y3RTZWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgZWwuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICB9KTtcclxuICBhY3RpdmVQcm9kdWN0U2VjdGlvbiA9IGFsbFByb2R1Y3RTZWN0aW9ucy5maW5kKFxyXG4gICAgKGVsMikgPT4gZWwyLmlkID09PSBkYXRhc2V0VmFsdWUsXHJcbiAgKTtcclxuICBkcmFnV3JhcC5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gIGFjdGl2ZVByb2R1Y3RTZWN0aW9uLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XHJcbiAgc2V0QWN0aXZlVHh0KFwicHJvZHVjdC0xXCIpO1xyXG4gIHNldEFjdGl2ZVZpZERpdigpO1xyXG4gIHNldEFjdGl2ZVJldmVhbEFuZFJvdGF0ZVZpZHMoXCJwcm9kdWN0LTFcIik7XHJcbiAgaWYgKGlzTW9iaWxlUG9ydHJhaXQgPT09IGZhbHNlKSB7XHJcbiAgICBpZiAoYWN0aXZlVmlkKSBhY3RpdmVWaWQucGxheSgpO1xyXG4gIH1cclxufVxyXG5mdW5jdGlvbiBhY3RpdmF0ZVJlc291cmNlc1NlY3Rpb24oZGF0YXNldFZhbHVlKSB7XHJcbiAgcmVzb3VyY2VzU2VsZWN0U2VjdGlvbi5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gIGFsbFJlc291cmNlc1NlY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gIH0pO1xyXG4gIGFjdGl2ZVJlc291cmNlc1NlY3Rpb24gPSBhbGxSZXNvdXJjZXNTZWN0aW9ucy5maW5kKFxyXG4gICAgKGVsMikgPT4gZWwyLmlkID09PSBkYXRhc2V0VmFsdWUsXHJcbiAgKTtcclxuICBhY3RpdmVSZXNvdXJjZXNTZWN0aW9uLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XHJcbn1cclxuZnVuY3Rpb24gYWN0aXZhdGVQcm9kdWN0KGRhdGFzZXRBY3Rpb24pIHtcclxuICBzZXRBY3RpdmVUeHQoZGF0YXNldEFjdGlvbik7XHJcbiAgc2V0QWN0aXZlVmlkRGl2KCk7XHJcbiAgc2V0QWN0aXZlUmV2ZWFsQW5kUm90YXRlVmlkcyhkYXRhc2V0QWN0aW9uKTtcclxuICBhY3RpdmVWaWQucGxheSgpO1xyXG59XHJcbmZ1bmN0aW9uIHNldEFjdGl2ZVR4dChkYXRhc2V0QWN0aW9uKSB7XHJcbiAgYWN0aXZlUHJvZHVjdFNlY3Rpb24ucXVlcnlTZWxlY3RvckFsbChcIi50eHQtd3JhcFwiKS5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgZWwuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICAgIGlmIChlbC5kYXRhc2V0LnByb2R1Y3QgPT09IGRhdGFzZXRBY3Rpb24pIHtcclxuICAgICAgZWwuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxuICAgICAgYWN0aXZlVHh0V3JhcCA9IGVsO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcbmZ1bmN0aW9uIHNldEFjdGl2ZVZpZERpdigpIHtcclxuICBhY3RpdmVQcm9kdWN0U2VjdGlvbi5xdWVyeVNlbGVjdG9yQWxsKFwiLnZpZC1kaXZcIikuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgfSk7XHJcbiAgaWYgKGlzTW9iaWxlUG9ydHJhaXQpIHtcclxuICAgIGFjdGl2ZVZpZERpdiA9IFsuLi5hY3RpdmVQcm9kdWN0U2VjdGlvbi5xdWVyeVNlbGVjdG9yQWxsKFwiLnZpZC1kaXZcIildLmZpbmQoXHJcbiAgICAgIChlbCkgPT4gZWwuY2xhc3NMaXN0LmNvbnRhaW5zKFwibXBcIiksXHJcbiAgICApO1xyXG4gIH0gZWxzZVxyXG4gICAgYWN0aXZlVmlkRGl2ID0gWy4uLmFjdGl2ZVByb2R1Y3RTZWN0aW9uLnF1ZXJ5U2VsZWN0b3JBbGwoXCIudmlkLWRpdlwiKV0uZmluZChcclxuICAgICAgKGVsKSA9PiAhZWwuY2xhc3NMaXN0LmNvbnRhaW5zKFwibXBcIiksXHJcbiAgICApO1xyXG4gIGlmIChhY3RpdmVWaWREaXYpIGFjdGl2ZVZpZERpdi5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xyXG59XHJcbmZ1bmN0aW9uIHNldEFjdGl2ZVJldmVhbEFuZFJvdGF0ZVZpZHMoZGF0YXNldEFjdGlvbikge1xyXG4gIGlmIChhY3RpdmVWaWREaXYpIHtcclxuICAgIGFjdGl2ZVZpZERpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLnZpZC1jb2RlXCIpLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgIGNvbnN0IHZpZCA9IGVsLnF1ZXJ5U2VsZWN0b3IoXCIudmlkXCIpO1xyXG4gICAgICBjb25zdCBzb3VyY2UgPSB2aWQucXVlcnlTZWxlY3RvcihcInNvdXJjZVwiKTtcclxuICAgICAgaWYgKCFzb3VyY2UpIHJldHVybjtcclxuICAgICAgLy8gMS4gSWYgaXQncyBOT1QgdGhlIGFjdGl2ZSBwcm9kdWN0LCBraWxsIHRoZSBjb25uZWN0aW9uIHRvIHNhdmUgZGF0YVxyXG4gICAgICBpZiAoZWwuZGF0YXNldC5wcm9kdWN0ICE9PSBkYXRhc2V0QWN0aW9uKSB7XHJcbiAgICAgICAgdmlkLnBhdXNlKCk7XHJcbiAgICAgICAgc291cmNlLnNyYyA9IFwiXCI7XHJcbiAgICAgICAgdmlkLmxvYWQoKTtcclxuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICAvLyAyLiBJZiBpdCBJUyB0aGUgYWN0aXZlIHByb2R1Y3QsIGxvYWQgdGhlIGRhdGFcclxuICAgICAgaWYgKHNvdXJjZS5zcmMgIT09IHNvdXJjZS5kYXRhc2V0LnNyYykge1xyXG4gICAgICAgIHNvdXJjZS5zcmMgPSBzb3VyY2UuZGF0YXNldC5zcmM7XHJcbiAgICAgICAgdmlkLmxvYWQoKTtcclxuICAgICAgfVxyXG4gICAgICAvLyAtLS0gVEhFIFNFUVVFTkNFIExPR0lDIC0tLVxyXG4gICAgICBpZiAoZWwuZGF0YXNldC52aWRUeXBlID09PSBcInJldmVhbFwiKSB7XHJcbiAgICAgICAgZWwuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTsgLy8gU0hPVyB0aGUgUmV2ZWFsIHZpZGVvXHJcbiAgICAgICAgYWN0aXZlVmlkID0gdmlkOyAvLyBTZXQgdGhpcyBhcyB0aGUgb25lIHRvIC5wbGF5KCkgaW1tZWRpYXRlbHlcclxuICAgICAgfSBlbHNlIGlmIChlbC5kYXRhc2V0LnZpZFR5cGUgPT09IFwicm90YXRlXCIpIHtcclxuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpOyAvLyBISURFIHRoZSBSb3RhdGUgdmlkZW8gKGZvciBub3cpXHJcbiAgICAgICAgYWN0aXZlUm90YXRlVmlkID0gdmlkOyAvLyBTdG9yZSByZWZlcmVuY2UgZm9yIHRoZSAnZW5kZWQnIGhhbmQtb2ZmXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5mdW5jdGlvbiByZXNldERyYWdDb250cm9sKCkge1xyXG4gIC8vIDEuIFJlc2V0IHRoZSBhY3RpdmVWaWQgaW1tZWRpYXRlbHlcclxuICBhY3RpdmVWaWQuY3VycmVudFRpbWUgPSAwO1xyXG4gIC8vIDIuIEFuaW1hdGUgZHJhZ0hhbmRsZSBiYWNrIHRvIHN0YXJ0ICh4OiAwKVxyXG4gIGdzYXAudG8oZHJhZ0hhbmRsZSwge1xyXG4gICAgeDogMCxcclxuICAgIGR1cmF0aW9uOiAwLjUsXHJcbiAgICBlYXNlOiBcInBvd2VyMi5pbk91dFwiLFxyXG4gICAgb25VcGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgLy8gMy4gSU1QT1JUQU5UOiBUZWxsIERyYWdnYWJsZSB0aGUgZHJhZ0hhbmRsZSBoYXMgbW92ZWRcclxuICAgICAgLy8gZHJhZ0luc3RhbmNlIHNob3VsZCBiZSB0aGUgdmFyaWFibGUgd2hlcmUgeW91IHN0b3JlZCBEcmFnZ2FibGUuY3JlYXRlKClcclxuICAgICAgZHJhZ0luc3RhbmNlLnVwZGF0ZSgpO1xyXG4gICAgfSxcclxuICB9KTtcclxufVxyXG5mdW5jdGlvbiB0b2dnbGVNb2JpbGVQcm9kdWN0T3B0cygpIHtcclxuICBibGFja291dC5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xyXG4gIGlmIChtb2JpbGVTZWxlY3RlZFByb2R1Y3RWaWV3KSB7XHJcbiAgICAvLyAxLiBGb3JjZSBhIGhlaWdodCB0aGF0IFNhZmFyaSBjYW5ub3QgaWdub3JlXHJcbiAgICBhY3RpdmVQcm9kdWN0U2VjdGlvblxyXG4gICAgICAucXVlcnlTZWxlY3RvcihcIi50eHQtYW5kLWJ0bnMtd3JhcFwiKVxyXG4gICAgICAuc3R5bGUuc2V0UHJvcGVydHkoXCJoZWlnaHRcIiwgXCIyNXJlbVwiLCBcImltcG9ydGFudFwiKTtcclxuICAgIC8vIDIuIFN0YW5kYXJkIHRvZ2dsZXNcclxuICAgIGFjdGl2ZVByb2R1Y3RTZWN0aW9uLnF1ZXJ5U2VsZWN0b3IoXCIuYnRucy1ncmlkXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgICBhY3RpdmVWaWREaXYuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxuICAgIC8vIDMuIGlQaG9uZSBWaXNpYmlsaXR5IEZpeGVzXHJcbiAgICBhY3RpdmVUeHRXcmFwLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XHJcbiAgICBhY3RpdmVUeHRXcmFwLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjsgLy8gRm9yY2UgdmlzaWJpbGl0eVxyXG4gICAgYWN0aXZlVHh0V3JhcC5zdHlsZS5vcGFjaXR5ID0gXCIxXCI7IC8vIEZvcmNlIG9wYWNpdHlcclxuICAgIGFjdGl2ZVR4dFdyYXAuc3R5bGUuekluZGV4ID0gXCIxMFwiOyAvLyBGb3JjZSB0byB0aGUgZnJvbnRcclxuICAgIC8vIDQuIFRoZSBcIk1hZ2ljXCIgUmVmbG93IChDcml0aWNhbCBmb3IgaU9TKVxyXG4gICAgdm9pZCBhY3RpdmVUeHRXcmFwLm9mZnNldEhlaWdodDtcclxuICB9IGVsc2Uge1xyXG4gICAgYWN0aXZlUHJvZHVjdFNlY3Rpb24ucXVlcnlTZWxlY3RvcihcIi50eHQtYW5kLWJ0bnMtd3JhcFwiKS5zdHlsZS5oZWlnaHQgPVxyXG4gICAgICBcImF1dG9cIjtcclxuICAgIGFjdGl2ZVByb2R1Y3RTZWN0aW9uLnF1ZXJ5U2VsZWN0b3IoXCIuYnRucy1ncmlkXCIpLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XHJcbiAgICBhY3RpdmVWaWREaXYuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICAgIGFjdGl2ZVByb2R1Y3RTZWN0aW9uXHJcbiAgICAgIC5xdWVyeVNlbGVjdG9yKFwiLmJhY2stYnRuLm1wXCIpXHJcbiAgICAgIC5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gICAgYWN0aXZlUHJvZHVjdFNlY3Rpb24ucXVlcnlTZWxlY3RvcihcIi5kcmFnLXdyYXBcIikuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICAgIGFjdGl2ZVR4dFdyYXAuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICB9XHJcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICBibGFja291dC5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gIH0sIDIwKTtcclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiOztBQUVBLE1BQU0sU0FBUyxTQUFTLGNBQWMsZ0JBQWdCO0FBQ3RELE1BQU0sVUFBVSxTQUFTLGNBQWMsV0FBVztBQUNsRCxNQUFNLFNBQVMsU0FBUyxjQUFjLGFBQWE7QUFDbkQsTUFBTSxjQUFjLENBQUMsR0FBRyxPQUFPLGlCQUFpQixxQkFBcUIsQ0FBQztBQUN0RSxNQUFNLGlCQUFpQixTQUFTLGNBQWMsb0JBQW9CO0FBQ2xFLE1BQU0sdUJBQXVCLFNBQVMsZUFBZSxVQUFVO0FBQy9ELE1BQU0scUJBQXFCO0FBQUEsSUFDekIsU0FBUyxlQUFlLFVBQVU7QUFBQSxJQUNsQyxTQUFTLGVBQWUsY0FBYztBQUFBLEVBQ3hDO0FBQ0EsTUFBTSx5QkFBeUIsU0FBUyxlQUFlLFdB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
