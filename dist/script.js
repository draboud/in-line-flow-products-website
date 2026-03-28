(() => {
  // src/script.js
  var navBar = document.querySelector(".nav_component");
  var navMenu = document.querySelector(".nav_menu");
  var navBtn = document.querySelector(".nav_button");
  var allNavLinks = [...navBar.querySelectorAll(".nav_menu_link-wrap")];
  var activeNavLink = allNavLinks[0];
  var mainWrap = document.querySelector(".main-wrapper");
  var blackout = document.querySelector(".blackout");
  var txtAndBtnsWrap = document.querySelector(".txt-and-btns-wrap");
  var allTxtWraps = [...document.querySelectorAll(".txt-wrap")];
  var allVidDivs = [...document.querySelectorAll(".vid-div")];
  var allVidCode = [...document.querySelectorAll(".vid-code")];
  var allVids = document.querySelectorAll(".vid");
  var allProductsBtns = document.querySelectorAll(".btn.products");
  var ctrlBtnWrap = document.querySelector(".section-wrap-btns");
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
  navBar.addEventListener("click", function(e) {
    const clicked = e.target.closest(".nav_menu_link");
    if (!clicked) return;
    if ("navMenuOpen" in navMenu.dataset) navBtn.click();
  });
  mainWrap.addEventListener("click", function(e) {
    const clicked = e.target.closest("[data-click-action]");
    if (!clicked) return;
    const datasetAction = clicked.dataset.product;
    if (datasetAction !== "product-1" && datasetAction !== "product-2" && datasetAction !== "product-3")
      return;
    dragWrap.classList.remove("active");
    resetDragControl();
    activateProduct(datasetAction);
    if (activeVid.parentElement.classList.contains("mp")) {
      mobileSelectedProductView = true;
      toggleMobileProductOpts();
    }
  });
  allProductsBtns.forEach(function(el) {
    el.addEventListener("click", function() {
      if (activeVid.parentElement.classList.contains("mp")) {
        mobileSelectedProductView = false;
        toggleMobileProductOpts();
      }
    });
  });
  allVids.forEach(function(el) {
    el.addEventListener("ended", function(e) {
      const endedVid = e.target.closest(".vid");
      if (endedVid.parentElement.dataset.vidType !== "reveal") return;
      activeRotateVid.parentElement.classList.add("active");
      activeVid = activeRotateVid;
      activeVid.load();
      dragWrap.classList.add("active");
    });
  });
  document.addEventListener("DOMContentLoaded", () => {
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
  function startApp() {
    const stp = window.ScrollToPlugin || window.gsap && window.gsap.plugins && window.gsap.plugins.scrollTo;
    const str = window.ScrollTrigger;
    if (stp && str) {
      gsap.registerPlugin(stp, str);
      initScrollNext();
      const observerOptions = {
        root: null,
        threshold: 0.6
      };
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!gsap.isTweening(window)) {
              sectionReached(entry.target.id);
            }
          }
        });
      }, observerOptions);
      sections.forEach((section) => observer.observe(section));
    } else {
      setTimeout(startApp, 50);
    }
  }
  startApp();
  function initScrollNext() {
    const nextBtn = document.querySelector(".btn.scroll-next-btn");
    if (!nextBtn || sections.length === 0) return;
    nextBtn.addEventListener("click", () => {
      toggleSnap(false);
      let currentSectionIndex = sections.findIndex((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top >= -100 && rect.top <= 100;
      });
      let nextSectionIndex = (currentSectionIndex + 1) % sections.length;
      const targetSection = sections[nextSectionIndex];
      gsap.to(window, {
        duration: 0.8,
        scrollTo: { y: targetSection, autoKill: false },
        ease: "power2.inOut",
        onComplete: () => {
          sectionReached(targetSection.id);
          if (targetSection.id)
            history.pushState(null, null, `#${targetSection.id}`);
          const reEnable = () => {
            toggleSnap(true);
            window.removeEventListener("touchstart", reEnable);
            window.removeEventListener("wheel", reEnable);
          };
          window.addEventListener("touchstart", reEnable, { passive: true });
          window.addEventListener("wheel", reEnable, { passive: true });
          window.scrollTo(0, targetSection.offsetTop);
        }
      });
    });
  }
  function toggleSnap(enabled) {
    const container = document.documentElement;
    const sections2 = document.querySelectorAll(".section");
    if (enabled) {
      container.style.scrollSnapType = "y mandatory";
      sections2.forEach((s) => s.style.scrollSnapAlign = "start");
    } else {
      container.style.scrollSnapType = "none";
      sections2.forEach((s) => s.style.scrollSnapAlign = "none");
    }
  }
  function sectionReached(id) {
    allNavLinks.forEach(function(el) {
      el.querySelector(".nav_menu_link-bar").classList.remove("active");
    });
    activeNavLink = allNavLinks.find(
      (el) => el.querySelector(".nav_menu_link").innerHTML === id
    );
    activeNavLink.querySelector(".nav_menu_link-bar").classList.add("active");
  }
  function init() {
    const mobilePortraitQuery = window.matchMedia("(max-width: 479px)");
    if (mobilePortraitQuery.matches) {
      isMobilePortrait = true;
      allTxtWraps.forEach(function(el) {
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
    allTxtWraps.forEach(function(el) {
      el.classList.remove("active");
      if (el.dataset.product === datasetAction) {
        el.classList.add("active");
        activeTxtWrap = el;
      }
    });
  }
  function setActiveVidDiv() {
    allVidDivs.forEach(function(el) {
      el.classList.remove("active");
    });
    if (isMobilePortrait) {
      activeVidDiv = allVidDivs.find((el) => el.classList.contains("mp"));
    } else activeVidDiv = allVidDivs.find((el) => !el.classList.contains("mp"));
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
      txtAndBtnsWrap.style.setProperty("height", "20rem", "important");
      document.querySelector(".btns-grid").classList.remove("active");
      activeVidDiv.classList.add("active");
      activeTxtWrap.classList.add("active");
      activeTxtWrap.style.visibility = "visible";
      activeTxtWrap.style.opacity = "1";
      activeTxtWrap.style.zIndex = "10";
      void activeTxtWrap.offsetHeight;
    } else {
      txtAndBtnsWrap.style.height = "100%";
      document.querySelector(".btns-grid").classList.add("active");
      activeVidDiv.classList.remove("active");
      document.querySelector(".drag-wrap").classList.remove("active");
      activeTxtWrap.classList.remove("active");
    }
    setTimeout(function() {
      blackout.classList.remove("active");
    }, 250);
  }
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL3NjcmlwdC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxyXG4vL1ZJRCBDVFJMUyBERUZJTklUSU9OUy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXHJcbmNvbnN0IG5hdkJhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubmF2X2NvbXBvbmVudFwiKTtcclxuY29uc3QgbmF2TWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubmF2X21lbnVcIik7XHJcbmNvbnN0IG5hdkJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubmF2X2J1dHRvblwiKTtcclxuY29uc3QgYWxsTmF2TGlua3MgPSBbLi4ubmF2QmFyLnF1ZXJ5U2VsZWN0b3JBbGwoXCIubmF2X21lbnVfbGluay13cmFwXCIpXTtcclxubGV0IGFjdGl2ZU5hdkxpbmsgPSBhbGxOYXZMaW5rc1swXTsgLy9maXggdGhpc1xyXG5jb25zdCBtYWluV3JhcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWFpbi13cmFwcGVyXCIpO1xyXG5jb25zdCBibGFja291dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYmxhY2tvdXRcIik7XHJcbmNvbnN0IHR4dEFuZEJ0bnNXcmFwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi50eHQtYW5kLWJ0bnMtd3JhcFwiKTtcclxuY29uc3QgYWxsVHh0V3JhcHMgPSBbLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50eHQtd3JhcFwiKV07XHJcbmNvbnN0IGFsbFZpZERpdnMgPSBbLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi52aWQtZGl2XCIpXTtcclxuY29uc3QgYWxsVmlkQ29kZSA9IFsuLi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnZpZC1jb2RlXCIpXTtcclxuY29uc3QgYWxsVmlkcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudmlkXCIpO1xyXG5jb25zdCBhbGxQcm9kdWN0c0J0bnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmJ0bi5wcm9kdWN0c1wiKTtcclxuY29uc3QgY3RybEJ0bldyYXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnNlY3Rpb24td3JhcC1idG5zXCIpO1xyXG5sZXQgYWN0aXZlVmlkRGl2ID0gbnVsbDtcclxubGV0IGFjdGl2ZVR4dFdyYXAgPSBudWxsO1xyXG5sZXQgYWN0aXZlVmlkQ29kZSA9IG51bGw7XHJcbmxldCBhY3RpdmVWaWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnZpZFwiKVsxXTsgLy9maXggdGhpc1xyXG5sZXQgaXNNb2JpbGVQb3J0cmFpdCA9IGZhbHNlO1xyXG4vLy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXHJcbi8vR1NBUCBERUZJTklUSU9OUy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cclxuY29uc3Qgc2VjdGlvbnMgPSBnc2FwLnV0aWxzLnRvQXJyYXkoXCIuc2VjdGlvblwiKTtcclxuXHJcbmNvbnN0IGRyYWdXcmFwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5kcmFnLXdyYXBcIik7XHJcbmNvbnN0IGRyYWdUcmFjayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZHJhZy10cmFja1wiKTtcclxuY29uc3QgZHJhZ0hhbmRsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZHJhZy1oYW5kbGVcIik7XHJcbmxldCBkcmFnSW5zdGFuY2U7XHJcbmxldCBhY3RpdmVSb3RhdGVWaWQgPSBudWxsO1xyXG5sZXQgbW9iaWxlU2VsZWN0ZWRQcm9kdWN0VmlldyA9IGZhbHNlO1xyXG5sZXQgaXNTZWVraW5nID0gZmFsc2U7IC8vIFRoZSBcImxvY2tcIiB0byBwcmV2ZW50IG92ZXItdGF4aW5nIHRoZSBDUFVcclxuLy8uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cclxuLy9FVkVOVFMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cclxubmF2QmFyLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xyXG4gIGNvbnN0IGNsaWNrZWQgPSBlLnRhcmdldC5jbG9zZXN0KFwiLm5hdl9tZW51X2xpbmtcIik7XHJcbiAgaWYgKCFjbGlja2VkKSByZXR1cm47XHJcbiAgLy8gYmxhY2tvdXQuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxuICBpZiAoXCJuYXZNZW51T3BlblwiIGluIG5hdk1lbnUuZGF0YXNldCkgbmF2QnRuLmNsaWNrKCk7XHJcbn0pO1xyXG5tYWluV3JhcC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGUpIHtcclxuICBjb25zdCBjbGlja2VkID0gZS50YXJnZXQuY2xvc2VzdChcIltkYXRhLWNsaWNrLWFjdGlvbl1cIik7XHJcbiAgaWYgKCFjbGlja2VkKSByZXR1cm47XHJcbiAgY29uc3QgZGF0YXNldEFjdGlvbiA9IGNsaWNrZWQuZGF0YXNldC5wcm9kdWN0O1xyXG4gIGlmIChcclxuICAgIGRhdGFzZXRBY3Rpb24gIT09IFwicHJvZHVjdC0xXCIgJiZcclxuICAgIGRhdGFzZXRBY3Rpb24gIT09IFwicHJvZHVjdC0yXCIgJiZcclxuICAgIGRhdGFzZXRBY3Rpb24gIT09IFwicHJvZHVjdC0zXCJcclxuICApXHJcbiAgICByZXR1cm47XHJcbiAgZHJhZ1dyYXAuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICByZXNldERyYWdDb250cm9sKCk7XHJcbiAgYWN0aXZhdGVQcm9kdWN0KGRhdGFzZXRBY3Rpb24pO1xyXG4gIGlmIChhY3RpdmVWaWQucGFyZW50RWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJtcFwiKSkge1xyXG4gICAgbW9iaWxlU2VsZWN0ZWRQcm9kdWN0VmlldyA9IHRydWU7XHJcbiAgICB0b2dnbGVNb2JpbGVQcm9kdWN0T3B0cygpO1xyXG4gIH1cclxufSk7XHJcbmFsbFByb2R1Y3RzQnRucy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAoYWN0aXZlVmlkLnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwibXBcIikpIHtcclxuICAgICAgbW9iaWxlU2VsZWN0ZWRQcm9kdWN0VmlldyA9IGZhbHNlO1xyXG4gICAgICB0b2dnbGVNb2JpbGVQcm9kdWN0T3B0cygpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59KTtcclxuYWxsVmlkcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJlbmRlZFwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgY29uc3QgZW5kZWRWaWQgPSBlLnRhcmdldC5jbG9zZXN0KFwiLnZpZFwiKTtcclxuICAgIGlmIChlbmRlZFZpZC5wYXJlbnRFbGVtZW50LmRhdGFzZXQudmlkVHlwZSAhPT0gXCJyZXZlYWxcIikgcmV0dXJuO1xyXG4gICAgYWN0aXZlUm90YXRlVmlkLnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxuICAgIGFjdGl2ZVZpZCA9IGFjdGl2ZVJvdGF0ZVZpZDtcclxuICAgIGFjdGl2ZVZpZC5sb2FkKCk7XHJcbiAgICBkcmFnV3JhcC5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xyXG4gIH0pO1xyXG59KTtcclxuLy90b3VjaHN0YXJ0IGluaXQsIEdTQVAgc2xpZGVyXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcclxuICBmdW5jdGlvbiB1cGRhdGVWaWRlbyhpbnN0YW5jZSkge1xyXG4gICAgLy8gMS4gU2FmZXR5IGNoZWNrczogRW5zdXJlIHRoZXJlIGlzIGEgdmlkZW8gYW5kIGl0IGhhcyBhIGR1cmF0aW9uXHJcbiAgICBpZiAoIWFjdGl2ZVZpZCB8fCAhYWN0aXZlVmlkLmR1cmF0aW9uKSByZXR1cm47XHJcbiAgICAvLyAyLiBQZXJmb3JtYW5jZSBDaGVjazogSWYgdGhlIHBob25lIGlzIHN0aWxsIHByb2Nlc3NpbmcgdGhlIGxhc3QgZnJhbWUsIHNraXAgdGhpcyBvbmVcclxuICAgIGlmIChpc1NlZWtpbmcpIHJldHVybjtcclxuICAgIGlzU2Vla2luZyA9IHRydWU7IC8vIExvY2tcclxuICAgIC8vIDMuIFN5bmMgd2l0aCB0aGUgc2NyZWVuJ3MgcmVmcmVzaCByYXRlXHJcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xyXG4gICAgICBsZXQgcHJvZ3Jlc3MgPSBpbnN0YW5jZS54IC8gaW5zdGFuY2UubWF4WDtcclxuICAgICAgLy8gNC4gVXBkYXRlIHRoZSB2aWRlbyB0aW1lXHJcbiAgICAgIGFjdGl2ZVZpZC5jdXJyZW50VGltZSA9IHByb2dyZXNzICogYWN0aXZlVmlkLmR1cmF0aW9uO1xyXG4gICAgICBpc1NlZWtpbmcgPSBmYWxzZTsgLy8gVW5sb2NrIGZvciB0aGUgbmV4dCBmcmFtZVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIC8vdG91Y2hzdGFydCBldmVudFxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICBcInRvdWNoc3RhcnRcIixcclxuICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgYWxsVmlkcy5mb3JFYWNoKCh2aWQpID0+IHtcclxuICAgICAgICAvLyBQbGF5IGZvciBhIHNwbGl0IHNlY29uZCB0aGVuIHBhdXNlIHRvIGZvcmNlIGEgYnVmZmVyIGZpbGxcclxuICAgICAgICB2aWRcclxuICAgICAgICAgIC5wbGF5KClcclxuICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgdmlkLnBhdXNlKCk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgLyogSW50ZW50aW9uYWwgc2lsZW5jZTogd2UgYXJlIGp1c3Qgd2FybWluZyB0aGUgYnVmZmVyICovXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgeyBvbmNlOiB0cnVlIH0sXHJcbiAgKTsgLy8gT25seSBydW5zIG9uIHRoZSB2ZXJ5IGZpcnN0IHRhcFxyXG4gIGdzYXAucmVnaXN0ZXJQbHVnaW4oRHJhZ2dhYmxlKTtcclxuICAvLyBDcmVhdGUgdGhlIGRyYWdnYWJsZSBhbmQgc3RvcmUgaXQgaW4gYSB2YXJpYWJsZVxyXG4gIGRyYWdJbnN0YW5jZSA9IERyYWdnYWJsZS5jcmVhdGUoZHJhZ0hhbmRsZSwge1xyXG4gICAgdHlwZTogXCJ4XCIsXHJcbiAgICBib3VuZHM6IGRyYWdUcmFjayxcclxuICAgIGluZXJ0aWE6IHRydWUsXHJcbiAgICBlZGdlUmVzaXN0YW5jZTogMSxcclxuICAgIG92ZXJzaG9vdFRvbGVyYW5jZTogMCxcclxuICAgIG9uRHJhZzogZnVuY3Rpb24gKCkge1xyXG4gICAgICB1cGRhdGVWaWRlbyh0aGlzKTtcclxuICAgIH0sXHJcbiAgICBvblRocm93VXBkYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHVwZGF0ZVZpZGVvKHRoaXMpO1xyXG4gICAgfSxcclxuICB9KVswXTsgLy8gRHJhZ2dhYmxlLmNyZWF0ZSByZXR1cm5zIGFuIGFycmF5OyB3ZSB3YW50IHRoZSBmaXJzdCBpdGVtXHJcbiAgLy8gLS0tIENMSUNLIFRPIFNOQVAgTE9HSUMgLS0tXHJcbiAgaWYgKGRyYWdUcmFjaykge1xyXG4gICAgZHJhZ1RyYWNrLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4ge1xyXG4gICAgICAvLyBJZ25vcmUgaWYgdGhlIHVzZXIgY2xpY2tlZCB0aGUgZHJhZ0hhbmRsZSBpdHNlbGZcclxuICAgICAgaWYgKGUudGFyZ2V0ID09PSBkcmFnSGFuZGxlKSByZXR1cm47XHJcbiAgICAgIC8vIENhbGN1bGF0ZSBjbGljayBwb3NpdGlvbiByZWxhdGl2ZSB0byBkcmFnVHJhY2tcclxuICAgICAgY29uc3QgZHJhZ1RyYWNrUmVjdCA9IGRyYWdUcmFjay5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgY29uc3QgZHJhZ0hhbmRsZVdpZHRoID0gZHJhZ0hhbmRsZS5vZmZzZXRXaWR0aDtcclxuICAgICAgLy8gQ2VudGVyIHRoZSBkcmFnSGFuZGxlIG9uIHRoZSBjbGljayBwb2ludFxyXG4gICAgICBsZXQgY2xpY2tYID0gZS5jbGllbnRYIC0gZHJhZ1RyYWNrUmVjdC5sZWZ0IC0gZHJhZ0hhbmRsZVdpZHRoIC8gMjtcclxuICAgICAgLy8gQ2xhbXAgYmV0d2VlbiAwIGFuZCBtYXhYXHJcbiAgICAgIGNvbnN0IGZpbmFsWCA9IE1hdGgubWF4KDAsIE1hdGgubWluKGNsaWNrWCwgZHJhZ0luc3RhbmNlLm1heFgpKTtcclxuICAgICAgLy8gQW5pbWF0ZSBkcmFnSGFuZGxlIGFuZCBzeW5jIHZpZGVvXHJcbiAgICAgIGdzYXAudG8oZHJhZ0hhbmRsZSwge1xyXG4gICAgICAgIHg6IGZpbmFsWCxcclxuICAgICAgICBkdXJhdGlvbjogMC40LFxyXG4gICAgICAgIGVhc2U6IFwicG93ZXIyLm91dFwiLFxyXG4gICAgICAgIG9uVXBkYXRlOiAoKSA9PiB7XHJcbiAgICAgICAgICAvLyBTeW5jIERyYWdnYWJsZSdzIGludGVybmFsICd4JyBkdXJpbmcgYW5pbWF0aW9uXHJcbiAgICAgICAgICBkcmFnSW5zdGFuY2UudXBkYXRlKCk7XHJcbiAgICAgICAgICB1cGRhdGVWaWRlbyhkcmFnSW5zdGFuY2UpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGluaXQoKTtcclxufSk7XHJcbi8vLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXHJcbi8vRlVOQ1RJT05TLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXHJcbi8vU0NST0xMIFNOQVBQSU5HXHJcbmZ1bmN0aW9uIHN0YXJ0QXBwKCkge1xyXG4gIC8vIENoZWNrIGZvciBib3RoIFNjcm9sbFRvIGFuZCBTY3JvbGxUcmlnZ2VyXHJcbiAgY29uc3Qgc3RwID1cclxuICAgIHdpbmRvdy5TY3JvbGxUb1BsdWdpbiB8fFxyXG4gICAgKHdpbmRvdy5nc2FwICYmIHdpbmRvdy5nc2FwLnBsdWdpbnMgJiYgd2luZG93LmdzYXAucGx1Z2lucy5zY3JvbGxUbyk7XHJcbiAgY29uc3Qgc3RyID0gd2luZG93LlNjcm9sbFRyaWdnZXI7XHJcbiAgaWYgKHN0cCAmJiBzdHIpIHtcclxuICAgIC8vIFJlZ2lzdGVyIEJPVEggaGVyZVxyXG4gICAgZ3NhcC5yZWdpc3RlclBsdWdpbihzdHAsIHN0cik7XHJcbiAgICAvLyAxLiBJbml0aWFsaXplIHlvdXIgY3VzdG9tIGxvZ2ljXHJcbiAgICBpbml0U2Nyb2xsTmV4dCgpO1xyXG4gICAgLy8gMi4gU2V0dXAgdGhlIE9ic2VydmVyIE9OTFkgT05DRSBhZnRlciBwbHVnaW5zIGFyZSByZWFkeVxyXG4gICAgY29uc3Qgb2JzZXJ2ZXJPcHRpb25zID0ge1xyXG4gICAgICByb290OiBudWxsLFxyXG4gICAgICB0aHJlc2hvbGQ6IDAuNixcclxuICAgIH07XHJcbiAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlcigoZW50cmllcykgPT4ge1xyXG4gICAgICBlbnRyaWVzLmZvckVhY2goKGVudHJ5KSA9PiB7XHJcbiAgICAgICAgaWYgKGVudHJ5LmlzSW50ZXJzZWN0aW5nKSB7XHJcbiAgICAgICAgICAvLyBDaGVjayBpZiBHU0FQIGlzIGN1cnJlbnRseSBhbmltYXRpbmcgYSBzY3JvbGxcclxuICAgICAgICAgIGlmICghZ3NhcC5pc1R3ZWVuaW5nKHdpbmRvdykpIHtcclxuICAgICAgICAgICAgc2VjdGlvblJlYWNoZWQoZW50cnkudGFyZ2V0LmlkKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSwgb2JzZXJ2ZXJPcHRpb25zKTtcclxuICAgIHNlY3Rpb25zLmZvckVhY2goKHNlY3Rpb24pID0+IG9ic2VydmVyLm9ic2VydmUoc2VjdGlvbikpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyBJZiBub3QgZm91bmQgeWV0LCB3YWl0IGFuZCB0cnkgYWdhaW5cclxuICAgIHNldFRpbWVvdXQoc3RhcnRBcHAsIDUwKTtcclxuICB9XHJcbn1cclxuLy8gU3RhcnQgdGhlIGNoZWNrIGFzIHNvb24gYXMgdGhlIHNjcmlwdCBsb2Fkc1xyXG5zdGFydEFwcCgpO1xyXG5mdW5jdGlvbiBpbml0U2Nyb2xsTmV4dCgpIHtcclxuICAvL2ZvciBzY3JvbGwtc25hcHBpbmdcclxuICBjb25zdCBuZXh0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5idG4uc2Nyb2xsLW5leHQtYnRuXCIpO1xyXG4gIGlmICghbmV4dEJ0biB8fCBzZWN0aW9ucy5sZW5ndGggPT09IDApIHJldHVybjtcclxuICBuZXh0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAvLyAxLiBLaWxsIHRoZSBzbmFwIHNvIHRoZSBicm93c2VyIHN0b3BzIGZpZ2h0aW5nXHJcbiAgICB0b2dnbGVTbmFwKGZhbHNlKTtcclxuICAgIC8vIDEuIERldGVybWluZSB3aGljaCBzZWN0aW9uIGlzIGN1cnJlbnRseSBpbiB2aWV3XHJcbiAgICBsZXQgY3VycmVudFNlY3Rpb25JbmRleCA9IHNlY3Rpb25zLmZpbmRJbmRleCgoc2VjdGlvbikgPT4ge1xyXG4gICAgICBjb25zdCByZWN0ID0gc2VjdGlvbi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgLy8gQ2hlY2sgaWYgdGhlIHRvcCBvZiB0aGUgc2VjdGlvbiBpcyByb3VnaGx5IGF0IHRoZSB0b3Agb2YgdGhlIHZpZXdwb3J0XHJcbiAgICAgIHJldHVybiByZWN0LnRvcCA+PSAtMTAwICYmIHJlY3QudG9wIDw9IDEwMDtcclxuICAgIH0pO1xyXG4gICAgLy8gMi4gRmluZCB0aGUgbmV4dCBzZWN0aW9uIChvciBsb29wIGJhY2sgdG8gdGhlIGZpcnN0KVxyXG4gICAgbGV0IG5leHRTZWN0aW9uSW5kZXggPSAoY3VycmVudFNlY3Rpb25JbmRleCArIDEpICUgc2VjdGlvbnMubGVuZ3RoO1xyXG4gICAgY29uc3QgdGFyZ2V0U2VjdGlvbiA9IHNlY3Rpb25zW25leHRTZWN0aW9uSW5kZXhdO1xyXG4gICAgLy8gMy4gR1NBUCBTY3JvbGwgdG8gdGhhdCBzZWN0aW9uXHJcbiAgICBnc2FwLnRvKHdpbmRvdywge1xyXG4gICAgICBkdXJhdGlvbjogMC44LFxyXG4gICAgICBzY3JvbGxUbzogeyB5OiB0YXJnZXRTZWN0aW9uLCBhdXRvS2lsbDogZmFsc2UgfSxcclxuICAgICAgZWFzZTogXCJwb3dlcjIuaW5PdXRcIixcclxuICAgICAgb25Db21wbGV0ZTogKCkgPT4ge1xyXG4gICAgICAgIHNlY3Rpb25SZWFjaGVkKHRhcmdldFNlY3Rpb24uaWQpO1xyXG4gICAgICAgIGlmICh0YXJnZXRTZWN0aW9uLmlkKVxyXG4gICAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUobnVsbCwgbnVsbCwgYCMke3RhcmdldFNlY3Rpb24uaWR9YCk7XHJcbiAgICAgICAgLy8gMi4gRE8gTk9UIHJlLWVuYWJsZSBzbmFwcGluZyB5ZXQuXHJcbiAgICAgICAgLy8gV2Ugd2FpdCBmb3IgdGhlIG5leHQgdG91Y2ggb3Igc2Nyb2xsIHRvIFwicmUtZW5nYWdlXCIgdGhlIG1hZ25ldHMuXHJcbiAgICAgICAgY29uc3QgcmVFbmFibGUgPSAoKSA9PiB7XHJcbiAgICAgICAgICB0b2dnbGVTbmFwKHRydWUpO1xyXG4gICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIHJlRW5hYmxlKTtcclxuICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwid2hlZWxcIiwgcmVFbmFibGUpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIHJlRW5hYmxlLCB7IHBhc3NpdmU6IHRydWUgfSk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJ3aGVlbFwiLCByZUVuYWJsZSwgeyBwYXNzaXZlOiB0cnVlIH0pO1xyXG4gICAgICAgIC8vIDMuIE9uZSBuYXRpdmUganVtcCB0byBcImFuY2hvclwiIHRoZSBwb3NpdGlvblxyXG4gICAgICAgIHdpbmRvdy5zY3JvbGxUbygwLCB0YXJnZXRTZWN0aW9uLm9mZnNldFRvcCk7XHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuICB9KTtcclxufVxyXG5mdW5jdGlvbiB0b2dnbGVTbmFwKGVuYWJsZWQpIHtcclxuICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XHJcbiAgY29uc3Qgc2VjdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNlY3Rpb25cIik7XHJcbiAgaWYgKGVuYWJsZWQpIHtcclxuICAgIGNvbnRhaW5lci5zdHlsZS5zY3JvbGxTbmFwVHlwZSA9IFwieSBtYW5kYXRvcnlcIjtcclxuICAgIHNlY3Rpb25zLmZvckVhY2goKHMpID0+IChzLnN0eWxlLnNjcm9sbFNuYXBBbGlnbiA9IFwic3RhcnRcIikpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyBLaWxsIEVWRVJZVEhJTkcgc28gdGhlIGJyb3dzZXIgaGFzIHplcm8gXCJtZW1vcnlcIiBvZiBzbmFwIHBvaW50c1xyXG4gICAgY29udGFpbmVyLnN0eWxlLnNjcm9sbFNuYXBUeXBlID0gXCJub25lXCI7XHJcbiAgICBzZWN0aW9ucy5mb3JFYWNoKChzKSA9PiAocy5zdHlsZS5zY3JvbGxTbmFwQWxpZ24gPSBcIm5vbmVcIikpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc2VjdGlvblJlYWNoZWQoaWQpIHtcclxuICBhbGxOYXZMaW5rcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgZWwucXVlcnlTZWxlY3RvcihcIi5uYXZfbWVudV9saW5rLWJhclwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gIH0pO1xyXG4gIGFjdGl2ZU5hdkxpbmsgPSBhbGxOYXZMaW5rcy5maW5kKFxyXG4gICAgKGVsKSA9PiBlbC5xdWVyeVNlbGVjdG9yKFwiLm5hdl9tZW51X2xpbmtcIikuaW5uZXJIVE1MID09PSBpZCxcclxuICApO1xyXG4gIGFjdGl2ZU5hdkxpbmsucXVlcnlTZWxlY3RvcihcIi5uYXZfbWVudV9saW5rLWJhclwiKS5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xyXG59XHJcbmZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgY29uc3QgbW9iaWxlUG9ydHJhaXRRdWVyeSA9IHdpbmRvdy5tYXRjaE1lZGlhKFwiKG1heC13aWR0aDogNDc5cHgpXCIpO1xyXG4gIGlmIChtb2JpbGVQb3J0cmFpdFF1ZXJ5Lm1hdGNoZXMpIHtcclxuICAgIGlzTW9iaWxlUG9ydHJhaXQgPSB0cnVlO1xyXG4gICAgYWxsVHh0V3JhcHMuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBpZiAoaXNNb2JpbGVQb3J0cmFpdCAhPT0gdHJ1ZSkge1xyXG4gICAgc2V0QWN0aXZlVmlkRGl2KCk7XHJcbiAgICBzZXRBY3RpdmVUeHQoXCJwcm9kdWN0LTFcIik7XHJcbiAgICBzZXRBY3RpdmVSZXZlYWxBbmRSb3RhdGVWaWRzKFwicHJvZHVjdC0xXCIpO1xyXG4gICAgaWYgKGFjdGl2ZVZpZCkgYWN0aXZlVmlkLnBsYXkoKTtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gYWN0aXZhdGVQcm9kdWN0KGRhdGFzZXRBY3Rpb24pIHtcclxuICBzZXRBY3RpdmVUeHQoZGF0YXNldEFjdGlvbik7XHJcbiAgc2V0QWN0aXZlVmlkRGl2KCk7XHJcbiAgc2V0QWN0aXZlUmV2ZWFsQW5kUm90YXRlVmlkcyhkYXRhc2V0QWN0aW9uKTtcclxuICBhY3RpdmVWaWQucGxheSgpO1xyXG59XHJcbmZ1bmN0aW9uIHNldEFjdGl2ZVR4dChkYXRhc2V0QWN0aW9uKSB7XHJcbiAgYWxsVHh0V3JhcHMuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgICBpZiAoZWwuZGF0YXNldC5wcm9kdWN0ID09PSBkYXRhc2V0QWN0aW9uKSB7XHJcbiAgICAgIGVsLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XHJcbiAgICAgIGFjdGl2ZVR4dFdyYXAgPSBlbDtcclxuICAgIH1cclxuICB9KTtcclxufVxyXG5mdW5jdGlvbiBzZXRBY3RpdmVWaWREaXYoKSB7XHJcbiAgYWxsVmlkRGl2cy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgZWwuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICB9KTtcclxuICBpZiAoaXNNb2JpbGVQb3J0cmFpdCkge1xyXG4gICAgYWN0aXZlVmlkRGl2ID0gYWxsVmlkRGl2cy5maW5kKChlbCkgPT4gZWwuY2xhc3NMaXN0LmNvbnRhaW5zKFwibXBcIikpO1xyXG4gIH0gZWxzZSBhY3RpdmVWaWREaXYgPSBhbGxWaWREaXZzLmZpbmQoKGVsKSA9PiAhZWwuY2xhc3NMaXN0LmNvbnRhaW5zKFwibXBcIikpO1xyXG4gIGlmIChhY3RpdmVWaWREaXYpIGFjdGl2ZVZpZERpdi5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xyXG59XHJcbmZ1bmN0aW9uIHNldEFjdGl2ZVJldmVhbEFuZFJvdGF0ZVZpZHMoZGF0YXNldEFjdGlvbikge1xyXG4gIGlmIChhY3RpdmVWaWREaXYpIHtcclxuICAgIGFjdGl2ZVZpZERpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLnZpZC1jb2RlXCIpLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgIGNvbnN0IHZpZCA9IGVsLnF1ZXJ5U2VsZWN0b3IoXCIudmlkXCIpO1xyXG4gICAgICBjb25zdCBzb3VyY2UgPSB2aWQucXVlcnlTZWxlY3RvcihcInNvdXJjZVwiKTtcclxuICAgICAgaWYgKCFzb3VyY2UpIHJldHVybjtcclxuICAgICAgLy8gMS4gSWYgaXQncyBOT1QgdGhlIGFjdGl2ZSBwcm9kdWN0LCBraWxsIHRoZSBjb25uZWN0aW9uIHRvIHNhdmUgZGF0YVxyXG4gICAgICBpZiAoZWwuZGF0YXNldC5wcm9kdWN0ICE9PSBkYXRhc2V0QWN0aW9uKSB7XHJcbiAgICAgICAgdmlkLnBhdXNlKCk7XHJcbiAgICAgICAgc291cmNlLnNyYyA9IFwiXCI7XHJcbiAgICAgICAgdmlkLmxvYWQoKTtcclxuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICAvLyAyLiBJZiBpdCBJUyB0aGUgYWN0aXZlIHByb2R1Y3QsIGxvYWQgdGhlIGRhdGFcclxuICAgICAgaWYgKHNvdXJjZS5zcmMgIT09IHNvdXJjZS5kYXRhc2V0LnNyYykge1xyXG4gICAgICAgIHNvdXJjZS5zcmMgPSBzb3VyY2UuZGF0YXNldC5zcmM7XHJcbiAgICAgICAgdmlkLmxvYWQoKTtcclxuICAgICAgfVxyXG4gICAgICAvLyAtLS0gVEhFIFNFUVVFTkNFIExPR0lDIC0tLVxyXG4gICAgICBpZiAoZWwuZGF0YXNldC52aWRUeXBlID09PSBcInJldmVhbFwiKSB7XHJcbiAgICAgICAgZWwuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTsgLy8gU0hPVyB0aGUgUmV2ZWFsIHZpZGVvXHJcbiAgICAgICAgYWN0aXZlVmlkID0gdmlkOyAvLyBTZXQgdGhpcyBhcyB0aGUgb25lIHRvIC5wbGF5KCkgaW1tZWRpYXRlbHlcclxuICAgICAgfSBlbHNlIGlmIChlbC5kYXRhc2V0LnZpZFR5cGUgPT09IFwicm90YXRlXCIpIHtcclxuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpOyAvLyBISURFIHRoZSBSb3RhdGUgdmlkZW8gKGZvciBub3cpXHJcbiAgICAgICAgYWN0aXZlUm90YXRlVmlkID0gdmlkOyAvLyBTdG9yZSByZWZlcmVuY2UgZm9yIHRoZSAnZW5kZWQnIGhhbmQtb2ZmXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5mdW5jdGlvbiByZXNldERyYWdDb250cm9sKCkge1xyXG4gIC8vIDEuIFJlc2V0IHRoZSBhY3RpdmVWaWQgaW1tZWRpYXRlbHlcclxuICBhY3RpdmVWaWQuY3VycmVudFRpbWUgPSAwO1xyXG4gIC8vIDIuIEFuaW1hdGUgZHJhZ0hhbmRsZSBiYWNrIHRvIHN0YXJ0ICh4OiAwKVxyXG4gIGdzYXAudG8oZHJhZ0hhbmRsZSwge1xyXG4gICAgeDogMCxcclxuICAgIGR1cmF0aW9uOiAwLjUsXHJcbiAgICBlYXNlOiBcInBvd2VyMi5pbk91dFwiLFxyXG4gICAgb25VcGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgLy8gMy4gSU1QT1JUQU5UOiBUZWxsIERyYWdnYWJsZSB0aGUgZHJhZ0hhbmRsZSBoYXMgbW92ZWRcclxuICAgICAgLy8gZHJhZ0luc3RhbmNlIHNob3VsZCBiZSB0aGUgdmFyaWFibGUgd2hlcmUgeW91IHN0b3JlZCBEcmFnZ2FibGUuY3JlYXRlKClcclxuICAgICAgZHJhZ0luc3RhbmNlLnVwZGF0ZSgpO1xyXG4gICAgfSxcclxuICB9KTtcclxufVxyXG5mdW5jdGlvbiB0b2dnbGVNb2JpbGVQcm9kdWN0T3B0cygpIHtcclxuICBibGFja291dC5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xyXG4gIGlmIChtb2JpbGVTZWxlY3RlZFByb2R1Y3RWaWV3KSB7XHJcbiAgICAvLyAxLiBGb3JjZSBhIGhlaWdodCB0aGF0IFNhZmFyaSBjYW5ub3QgaWdub3JlXHJcbiAgICB0eHRBbmRCdG5zV3JhcC5zdHlsZS5zZXRQcm9wZXJ0eShcImhlaWdodFwiLCBcIjIwcmVtXCIsIFwiaW1wb3J0YW50XCIpO1xyXG4gICAgLy8gMi4gU3RhbmRhcmQgdG9nZ2xlc1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5idG5zLWdyaWRcIikuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICAgIGFjdGl2ZVZpZERpdi5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xyXG4gICAgLy8gMy4gaVBob25lIFZpc2liaWxpdHkgRml4ZXNcclxuICAgIGFjdGl2ZVR4dFdyYXAuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxuICAgIGFjdGl2ZVR4dFdyYXAuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiOyAvLyBGb3JjZSB2aXNpYmlsaXR5XHJcbiAgICBhY3RpdmVUeHRXcmFwLnN0eWxlLm9wYWNpdHkgPSBcIjFcIjsgLy8gRm9yY2Ugb3BhY2l0eVxyXG4gICAgYWN0aXZlVHh0V3JhcC5zdHlsZS56SW5kZXggPSBcIjEwXCI7IC8vIEZvcmNlIHRvIHRoZSBmcm9udFxyXG4gICAgLy8gNC4gVGhlIFwiTWFnaWNcIiBSZWZsb3cgKENyaXRpY2FsIGZvciBpT1MpXHJcbiAgICB2b2lkIGFjdGl2ZVR4dFdyYXAub2Zmc2V0SGVpZ2h0O1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0eHRBbmRCdG5zV3JhcC5zdHlsZS5oZWlnaHQgPSBcIjEwMCVcIjtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYnRucy1ncmlkXCIpLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XHJcbiAgICBhY3RpdmVWaWREaXYuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZHJhZy13cmFwXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgICBhY3RpdmVUeHRXcmFwLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgfVxyXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgYmxhY2tvdXQuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICB9LCAyNTApO1xyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7O0FBRUEsTUFBTSxTQUFTLFNBQVMsY0FBYyxnQkFBZ0I7QUFDdEQsTUFBTSxVQUFVLFNBQVMsY0FBYyxXQUFXO0FBQ2xELE1BQU0sU0FBUyxTQUFTLGNBQWMsYUFBYTtBQUNuRCxNQUFNLGNBQWMsQ0FBQyxHQUFHLE9BQU8saUJBQWlCLHFCQUFxQixDQUFDO0FBQ3RFLE1BQUksZ0JBQWdCLFlBQVksQ0FBQztBQUNqQyxNQUFNLFdBQVcsU0FBUyxjQUFjLGVBQWU7QUFDdkQsTUFBTSxXQUFXLFNBQVMsY0FBYyxXQUFXO0FBQ25ELE1BQU0saUJBQWlCLFNBQVMsY0FBYyxvQkFBb0I7QUFDbEUsTUFBTSxjQUFjLENBQUMsR0FBRyxTQUFTLGlCQUFpQixXQUFXLENBQUM7QUFDOUQsTUFBTSxhQUFhLENBQUMsR0FBRyxTQUFTLGlCQUFpQixVQUFVLENBQUM7QUFDNUQsTUFBTSxhQUFhLENBQUMsR0FBRyxTQUFTLGlCQUFpQixXQUFXLENBQUM7QUFDN0QsTUFBTSxVQUFVLFNBQVMsaUJBQWlCLE1BQU07QUFDaEQsTUFBTSxrQkFBa0IsU0FBUyxpQkFBaUIsZUFBZTtBQUNqRSxNQUFNLGNBQWMsU0FBUyxjQUFjLG9CQUFvQjtBQUMvRCxNQUFJLGVBQWU7QUFDbkIsTUFBSSxnQkFBZ0I7QUFFcEIsTUFBSSxZQUFZLFNBQVMsaUJBQWlCLE1BQU0sRUFBRSxDQUFDO0FBQ25ELE1BQUksbUJBQW1CO0FBR3ZCLE1BQU0sV0FBVyxLQUFLLE1BQU0sUUFBUSxVQUFVO0FBRTlDLE1BQU0sV0FBVyxTQUFTLGNBQWMsWUFBWTtBQUNwRCxNQUFNLFlBQVksU0FBUyxjQUFjLGFBQWE7QUFDdEQsTUFBTSxhQUFhLFNBQVMsY0FBYyxjQUFjO0FBQ3hELE1BQUk7QUFDSixNQUFJLGtCQUFrQjtBQUN0QixNQUFJLDRCQUE0QjtBQUNoQyxNQUFJLFlBQVk7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
