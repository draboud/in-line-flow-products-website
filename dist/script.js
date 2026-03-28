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
          const activeId = targetSection.id;
          sectionReached(activeId);
          if (activeId) history.pushState(null, null, `#${activeId}`);
          setTimeout(() => {
            toggleSnap(true);
          }, 200);
        }
      });
    });
  }
  function toggleSnap(enabled) {
    document.documentElement.style.scrollSnapType = enabled ? "y mandatory" : "none";
    document.body.style.scrollSnapType = enabled ? "y mandatory" : "none";
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL3NjcmlwdC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxyXG4vL1ZJRCBDVFJMUyBERUZJTklUSU9OUy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXHJcbmNvbnN0IG5hdkJhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubmF2X2NvbXBvbmVudFwiKTtcclxuY29uc3QgbmF2TWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubmF2X21lbnVcIik7XHJcbmNvbnN0IG5hdkJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubmF2X2J1dHRvblwiKTtcclxuY29uc3QgYWxsTmF2TGlua3MgPSBbLi4ubmF2QmFyLnF1ZXJ5U2VsZWN0b3JBbGwoXCIubmF2X21lbnVfbGluay13cmFwXCIpXTtcclxubGV0IGFjdGl2ZU5hdkxpbmsgPSBhbGxOYXZMaW5rc1swXTsgLy9maXggdGhpc1xyXG5jb25zdCBtYWluV3JhcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWFpbi13cmFwcGVyXCIpO1xyXG5jb25zdCBibGFja291dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYmxhY2tvdXRcIik7XHJcbmNvbnN0IHR4dEFuZEJ0bnNXcmFwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi50eHQtYW5kLWJ0bnMtd3JhcFwiKTtcclxuY29uc3QgYWxsVHh0V3JhcHMgPSBbLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50eHQtd3JhcFwiKV07XHJcbmNvbnN0IGFsbFZpZERpdnMgPSBbLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi52aWQtZGl2XCIpXTtcclxuY29uc3QgYWxsVmlkQ29kZSA9IFsuLi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnZpZC1jb2RlXCIpXTtcclxuY29uc3QgYWxsVmlkcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudmlkXCIpO1xyXG5jb25zdCBhbGxQcm9kdWN0c0J0bnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmJ0bi5wcm9kdWN0c1wiKTtcclxuY29uc3QgY3RybEJ0bldyYXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnNlY3Rpb24td3JhcC1idG5zXCIpO1xyXG5sZXQgYWN0aXZlVmlkRGl2ID0gbnVsbDtcclxubGV0IGFjdGl2ZVR4dFdyYXAgPSBudWxsO1xyXG5sZXQgYWN0aXZlVmlkQ29kZSA9IG51bGw7XHJcbmxldCBhY3RpdmVWaWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnZpZFwiKVsxXTsgLy9maXggdGhpc1xyXG5sZXQgaXNNb2JpbGVQb3J0cmFpdCA9IGZhbHNlO1xyXG4vLy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXHJcbi8vR1NBUCBERUZJTklUSU9OUy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cclxuY29uc3Qgc2VjdGlvbnMgPSBnc2FwLnV0aWxzLnRvQXJyYXkoXCIuc2VjdGlvblwiKTtcclxuXHJcbmNvbnN0IGRyYWdXcmFwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5kcmFnLXdyYXBcIik7XHJcbmNvbnN0IGRyYWdUcmFjayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZHJhZy10cmFja1wiKTtcclxuY29uc3QgZHJhZ0hhbmRsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZHJhZy1oYW5kbGVcIik7XHJcbmxldCBkcmFnSW5zdGFuY2U7XHJcbmxldCBhY3RpdmVSb3RhdGVWaWQgPSBudWxsO1xyXG5sZXQgbW9iaWxlU2VsZWN0ZWRQcm9kdWN0VmlldyA9IGZhbHNlO1xyXG5sZXQgaXNTZWVraW5nID0gZmFsc2U7IC8vIFRoZSBcImxvY2tcIiB0byBwcmV2ZW50IG92ZXItdGF4aW5nIHRoZSBDUFVcclxuLy8uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cclxuLy9FVkVOVFMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cclxubmF2QmFyLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xyXG4gIGNvbnN0IGNsaWNrZWQgPSBlLnRhcmdldC5jbG9zZXN0KFwiLm5hdl9tZW51X2xpbmtcIik7XHJcbiAgaWYgKCFjbGlja2VkKSByZXR1cm47XHJcbiAgLy8gYmxhY2tvdXQuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxuICBpZiAoXCJuYXZNZW51T3BlblwiIGluIG5hdk1lbnUuZGF0YXNldCkgbmF2QnRuLmNsaWNrKCk7XHJcbn0pO1xyXG5tYWluV3JhcC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGUpIHtcclxuICBjb25zdCBjbGlja2VkID0gZS50YXJnZXQuY2xvc2VzdChcIltkYXRhLWNsaWNrLWFjdGlvbl1cIik7XHJcbiAgaWYgKCFjbGlja2VkKSByZXR1cm47XHJcbiAgY29uc3QgZGF0YXNldEFjdGlvbiA9IGNsaWNrZWQuZGF0YXNldC5wcm9kdWN0O1xyXG4gIGlmIChcclxuICAgIGRhdGFzZXRBY3Rpb24gIT09IFwicHJvZHVjdC0xXCIgJiZcclxuICAgIGRhdGFzZXRBY3Rpb24gIT09IFwicHJvZHVjdC0yXCIgJiZcclxuICAgIGRhdGFzZXRBY3Rpb24gIT09IFwicHJvZHVjdC0zXCJcclxuICApXHJcbiAgICByZXR1cm47XHJcbiAgZHJhZ1dyYXAuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICByZXNldERyYWdDb250cm9sKCk7XHJcbiAgYWN0aXZhdGVQcm9kdWN0KGRhdGFzZXRBY3Rpb24pO1xyXG4gIGlmIChhY3RpdmVWaWQucGFyZW50RWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJtcFwiKSkge1xyXG4gICAgbW9iaWxlU2VsZWN0ZWRQcm9kdWN0VmlldyA9IHRydWU7XHJcbiAgICB0b2dnbGVNb2JpbGVQcm9kdWN0T3B0cygpO1xyXG4gIH1cclxufSk7XHJcbmFsbFByb2R1Y3RzQnRucy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAoYWN0aXZlVmlkLnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwibXBcIikpIHtcclxuICAgICAgbW9iaWxlU2VsZWN0ZWRQcm9kdWN0VmlldyA9IGZhbHNlO1xyXG4gICAgICB0b2dnbGVNb2JpbGVQcm9kdWN0T3B0cygpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59KTtcclxuYWxsVmlkcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJlbmRlZFwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgY29uc3QgZW5kZWRWaWQgPSBlLnRhcmdldC5jbG9zZXN0KFwiLnZpZFwiKTtcclxuICAgIGlmIChlbmRlZFZpZC5wYXJlbnRFbGVtZW50LmRhdGFzZXQudmlkVHlwZSAhPT0gXCJyZXZlYWxcIikgcmV0dXJuO1xyXG4gICAgYWN0aXZlUm90YXRlVmlkLnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxuICAgIGFjdGl2ZVZpZCA9IGFjdGl2ZVJvdGF0ZVZpZDtcclxuICAgIGFjdGl2ZVZpZC5sb2FkKCk7XHJcbiAgICBkcmFnV3JhcC5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xyXG4gIH0pO1xyXG59KTtcclxuLy90b3VjaHN0YXJ0IGluaXQsIEdTQVAgc2xpZGVyXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcclxuICBmdW5jdGlvbiB1cGRhdGVWaWRlbyhpbnN0YW5jZSkge1xyXG4gICAgLy8gMS4gU2FmZXR5IGNoZWNrczogRW5zdXJlIHRoZXJlIGlzIGEgdmlkZW8gYW5kIGl0IGhhcyBhIGR1cmF0aW9uXHJcbiAgICBpZiAoIWFjdGl2ZVZpZCB8fCAhYWN0aXZlVmlkLmR1cmF0aW9uKSByZXR1cm47XHJcbiAgICAvLyAyLiBQZXJmb3JtYW5jZSBDaGVjazogSWYgdGhlIHBob25lIGlzIHN0aWxsIHByb2Nlc3NpbmcgdGhlIGxhc3QgZnJhbWUsIHNraXAgdGhpcyBvbmVcclxuICAgIGlmIChpc1NlZWtpbmcpIHJldHVybjtcclxuICAgIGlzU2Vla2luZyA9IHRydWU7IC8vIExvY2tcclxuICAgIC8vIDMuIFN5bmMgd2l0aCB0aGUgc2NyZWVuJ3MgcmVmcmVzaCByYXRlXHJcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xyXG4gICAgICBsZXQgcHJvZ3Jlc3MgPSBpbnN0YW5jZS54IC8gaW5zdGFuY2UubWF4WDtcclxuICAgICAgLy8gNC4gVXBkYXRlIHRoZSB2aWRlbyB0aW1lXHJcbiAgICAgIGFjdGl2ZVZpZC5jdXJyZW50VGltZSA9IHByb2dyZXNzICogYWN0aXZlVmlkLmR1cmF0aW9uO1xyXG4gICAgICBpc1NlZWtpbmcgPSBmYWxzZTsgLy8gVW5sb2NrIGZvciB0aGUgbmV4dCBmcmFtZVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIC8vdG91Y2hzdGFydCBldmVudFxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICBcInRvdWNoc3RhcnRcIixcclxuICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgYWxsVmlkcy5mb3JFYWNoKCh2aWQpID0+IHtcclxuICAgICAgICAvLyBQbGF5IGZvciBhIHNwbGl0IHNlY29uZCB0aGVuIHBhdXNlIHRvIGZvcmNlIGEgYnVmZmVyIGZpbGxcclxuICAgICAgICB2aWRcclxuICAgICAgICAgIC5wbGF5KClcclxuICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgdmlkLnBhdXNlKCk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgLyogSW50ZW50aW9uYWwgc2lsZW5jZTogd2UgYXJlIGp1c3Qgd2FybWluZyB0aGUgYnVmZmVyICovXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgeyBvbmNlOiB0cnVlIH0sXHJcbiAgKTsgLy8gT25seSBydW5zIG9uIHRoZSB2ZXJ5IGZpcnN0IHRhcFxyXG4gIGdzYXAucmVnaXN0ZXJQbHVnaW4oRHJhZ2dhYmxlKTtcclxuICAvLyBDcmVhdGUgdGhlIGRyYWdnYWJsZSBhbmQgc3RvcmUgaXQgaW4gYSB2YXJpYWJsZVxyXG4gIGRyYWdJbnN0YW5jZSA9IERyYWdnYWJsZS5jcmVhdGUoZHJhZ0hhbmRsZSwge1xyXG4gICAgdHlwZTogXCJ4XCIsXHJcbiAgICBib3VuZHM6IGRyYWdUcmFjayxcclxuICAgIGluZXJ0aWE6IHRydWUsXHJcbiAgICBlZGdlUmVzaXN0YW5jZTogMSxcclxuICAgIG92ZXJzaG9vdFRvbGVyYW5jZTogMCxcclxuICAgIG9uRHJhZzogZnVuY3Rpb24gKCkge1xyXG4gICAgICB1cGRhdGVWaWRlbyh0aGlzKTtcclxuICAgIH0sXHJcbiAgICBvblRocm93VXBkYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHVwZGF0ZVZpZGVvKHRoaXMpO1xyXG4gICAgfSxcclxuICB9KVswXTsgLy8gRHJhZ2dhYmxlLmNyZWF0ZSByZXR1cm5zIGFuIGFycmF5OyB3ZSB3YW50IHRoZSBmaXJzdCBpdGVtXHJcbiAgLy8gLS0tIENMSUNLIFRPIFNOQVAgTE9HSUMgLS0tXHJcbiAgaWYgKGRyYWdUcmFjaykge1xyXG4gICAgZHJhZ1RyYWNrLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4ge1xyXG4gICAgICAvLyBJZ25vcmUgaWYgdGhlIHVzZXIgY2xpY2tlZCB0aGUgZHJhZ0hhbmRsZSBpdHNlbGZcclxuICAgICAgaWYgKGUudGFyZ2V0ID09PSBkcmFnSGFuZGxlKSByZXR1cm47XHJcbiAgICAgIC8vIENhbGN1bGF0ZSBjbGljayBwb3NpdGlvbiByZWxhdGl2ZSB0byBkcmFnVHJhY2tcclxuICAgICAgY29uc3QgZHJhZ1RyYWNrUmVjdCA9IGRyYWdUcmFjay5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgY29uc3QgZHJhZ0hhbmRsZVdpZHRoID0gZHJhZ0hhbmRsZS5vZmZzZXRXaWR0aDtcclxuICAgICAgLy8gQ2VudGVyIHRoZSBkcmFnSGFuZGxlIG9uIHRoZSBjbGljayBwb2ludFxyXG4gICAgICBsZXQgY2xpY2tYID0gZS5jbGllbnRYIC0gZHJhZ1RyYWNrUmVjdC5sZWZ0IC0gZHJhZ0hhbmRsZVdpZHRoIC8gMjtcclxuICAgICAgLy8gQ2xhbXAgYmV0d2VlbiAwIGFuZCBtYXhYXHJcbiAgICAgIGNvbnN0IGZpbmFsWCA9IE1hdGgubWF4KDAsIE1hdGgubWluKGNsaWNrWCwgZHJhZ0luc3RhbmNlLm1heFgpKTtcclxuICAgICAgLy8gQW5pbWF0ZSBkcmFnSGFuZGxlIGFuZCBzeW5jIHZpZGVvXHJcbiAgICAgIGdzYXAudG8oZHJhZ0hhbmRsZSwge1xyXG4gICAgICAgIHg6IGZpbmFsWCxcclxuICAgICAgICBkdXJhdGlvbjogMC40LFxyXG4gICAgICAgIGVhc2U6IFwicG93ZXIyLm91dFwiLFxyXG4gICAgICAgIG9uVXBkYXRlOiAoKSA9PiB7XHJcbiAgICAgICAgICAvLyBTeW5jIERyYWdnYWJsZSdzIGludGVybmFsICd4JyBkdXJpbmcgYW5pbWF0aW9uXHJcbiAgICAgICAgICBkcmFnSW5zdGFuY2UudXBkYXRlKCk7XHJcbiAgICAgICAgICB1cGRhdGVWaWRlbyhkcmFnSW5zdGFuY2UpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGluaXQoKTtcclxufSk7XHJcbi8vLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXHJcbi8vRlVOQ1RJT05TLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXHJcbi8vU0NST0xMIFNOQVBQSU5HXHJcbmZ1bmN0aW9uIHN0YXJ0QXBwKCkge1xyXG4gIC8vIENoZWNrIGZvciBib3RoIFNjcm9sbFRvIGFuZCBTY3JvbGxUcmlnZ2VyXHJcbiAgY29uc3Qgc3RwID1cclxuICAgIHdpbmRvdy5TY3JvbGxUb1BsdWdpbiB8fFxyXG4gICAgKHdpbmRvdy5nc2FwICYmIHdpbmRvdy5nc2FwLnBsdWdpbnMgJiYgd2luZG93LmdzYXAucGx1Z2lucy5zY3JvbGxUbyk7XHJcbiAgY29uc3Qgc3RyID0gd2luZG93LlNjcm9sbFRyaWdnZXI7XHJcbiAgaWYgKHN0cCAmJiBzdHIpIHtcclxuICAgIC8vIFJlZ2lzdGVyIEJPVEggaGVyZVxyXG4gICAgZ3NhcC5yZWdpc3RlclBsdWdpbihzdHAsIHN0cik7XHJcbiAgICAvLyAxLiBJbml0aWFsaXplIHlvdXIgY3VzdG9tIGxvZ2ljXHJcbiAgICBpbml0U2Nyb2xsTmV4dCgpO1xyXG4gICAgLy8gMi4gU2V0dXAgdGhlIE9ic2VydmVyIE9OTFkgT05DRSBhZnRlciBwbHVnaW5zIGFyZSByZWFkeVxyXG4gICAgY29uc3Qgb2JzZXJ2ZXJPcHRpb25zID0ge1xyXG4gICAgICByb290OiBudWxsLFxyXG4gICAgICB0aHJlc2hvbGQ6IDAuNixcclxuICAgIH07XHJcbiAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlcigoZW50cmllcykgPT4ge1xyXG4gICAgICBlbnRyaWVzLmZvckVhY2goKGVudHJ5KSA9PiB7XHJcbiAgICAgICAgaWYgKGVudHJ5LmlzSW50ZXJzZWN0aW5nKSB7XHJcbiAgICAgICAgICAvLyBDaGVjayBpZiBHU0FQIGlzIGN1cnJlbnRseSBhbmltYXRpbmcgYSBzY3JvbGxcclxuICAgICAgICAgIGlmICghZ3NhcC5pc1R3ZWVuaW5nKHdpbmRvdykpIHtcclxuICAgICAgICAgICAgc2VjdGlvblJlYWNoZWQoZW50cnkudGFyZ2V0LmlkKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSwgb2JzZXJ2ZXJPcHRpb25zKTtcclxuICAgIHNlY3Rpb25zLmZvckVhY2goKHNlY3Rpb24pID0+IG9ic2VydmVyLm9ic2VydmUoc2VjdGlvbikpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyBJZiBub3QgZm91bmQgeWV0LCB3YWl0IGFuZCB0cnkgYWdhaW5cclxuICAgIHNldFRpbWVvdXQoc3RhcnRBcHAsIDUwKTtcclxuICB9XHJcbn1cclxuLy8gU3RhcnQgdGhlIGNoZWNrIGFzIHNvb24gYXMgdGhlIHNjcmlwdCBsb2Fkc1xyXG5zdGFydEFwcCgpO1xyXG5mdW5jdGlvbiBpbml0U2Nyb2xsTmV4dCgpIHtcclxuICAvL2ZvciBzY3JvbGwtc25hcHBpbmdcclxuICBjb25zdCBuZXh0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5idG4uc2Nyb2xsLW5leHQtYnRuXCIpO1xyXG4gIGlmICghbmV4dEJ0biB8fCBzZWN0aW9ucy5sZW5ndGggPT09IDApIHJldHVybjtcclxuICBuZXh0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAvLyAxLiBLaWxsIHRoZSBzbmFwIHNvIHRoZSBicm93c2VyIHN0b3BzIGZpZ2h0aW5nXHJcbiAgICB0b2dnbGVTbmFwKGZhbHNlKTtcclxuICAgIC8vIDEuIERldGVybWluZSB3aGljaCBzZWN0aW9uIGlzIGN1cnJlbnRseSBpbiB2aWV3XHJcbiAgICBsZXQgY3VycmVudFNlY3Rpb25JbmRleCA9IHNlY3Rpb25zLmZpbmRJbmRleCgoc2VjdGlvbikgPT4ge1xyXG4gICAgICBjb25zdCByZWN0ID0gc2VjdGlvbi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgLy8gQ2hlY2sgaWYgdGhlIHRvcCBvZiB0aGUgc2VjdGlvbiBpcyByb3VnaGx5IGF0IHRoZSB0b3Agb2YgdGhlIHZpZXdwb3J0XHJcbiAgICAgIHJldHVybiByZWN0LnRvcCA+PSAtMTAwICYmIHJlY3QudG9wIDw9IDEwMDtcclxuICAgIH0pO1xyXG4gICAgLy8gMi4gRmluZCB0aGUgbmV4dCBzZWN0aW9uIChvciBsb29wIGJhY2sgdG8gdGhlIGZpcnN0KVxyXG4gICAgbGV0IG5leHRTZWN0aW9uSW5kZXggPSAoY3VycmVudFNlY3Rpb25JbmRleCArIDEpICUgc2VjdGlvbnMubGVuZ3RoO1xyXG4gICAgY29uc3QgdGFyZ2V0U2VjdGlvbiA9IHNlY3Rpb25zW25leHRTZWN0aW9uSW5kZXhdO1xyXG4gICAgLy8gMy4gR1NBUCBTY3JvbGwgdG8gdGhhdCBzZWN0aW9uXHJcbiAgICBnc2FwLnRvKHdpbmRvdywge1xyXG4gICAgICBkdXJhdGlvbjogMC44LFxyXG4gICAgICBzY3JvbGxUbzogeyB5OiB0YXJnZXRTZWN0aW9uLCBhdXRvS2lsbDogZmFsc2UgfSxcclxuICAgICAgZWFzZTogXCJwb3dlcjIuaW5PdXRcIixcclxuICAgICAgb25Db21wbGV0ZTogKCkgPT4ge1xyXG4gICAgICAgIC8vIE5vdGlmeSB5b3VyIGFwcCBoZXJlXHJcbiAgICAgICAgY29uc3QgYWN0aXZlSWQgPSB0YXJnZXRTZWN0aW9uLmlkO1xyXG4gICAgICAgIHNlY3Rpb25SZWFjaGVkKGFjdGl2ZUlkKTtcclxuICAgICAgICAvLyBZb3VyIGV4aXN0aW5nIGhhc2ggdXBkYXRlXHJcbiAgICAgICAgaWYgKGFjdGl2ZUlkKSBoaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBudWxsLCBgIyR7YWN0aXZlSWR9YCk7XHJcbiAgICAgICAgLy8gMi4gUmUtZW5hYmxlIHNuYXBwaW5nIG9uY2UgdGhlIGFuaW1hdGlvbiBmaW5pc2hlc1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgdG9nZ2xlU25hcCh0cnVlKTtcclxuICAgICAgICB9LCAyMDApO1xyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn1cclxuLy8gSGVscGVyIHRvIHRvZ2dsZSBzbmFwcGluZ1xyXG5mdW5jdGlvbiB0b2dnbGVTbmFwKGVuYWJsZWQpIHtcclxuICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuc2Nyb2xsU25hcFR5cGUgPSBlbmFibGVkXHJcbiAgICA/IFwieSBtYW5kYXRvcnlcIlxyXG4gICAgOiBcIm5vbmVcIjtcclxuICBkb2N1bWVudC5ib2R5LnN0eWxlLnNjcm9sbFNuYXBUeXBlID0gZW5hYmxlZCA/IFwieSBtYW5kYXRvcnlcIiA6IFwibm9uZVwiO1xyXG59XHJcbmZ1bmN0aW9uIHNlY3Rpb25SZWFjaGVkKGlkKSB7XHJcbiAgYWxsTmF2TGlua3MuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgIGVsLnF1ZXJ5U2VsZWN0b3IoXCIubmF2X21lbnVfbGluay1iYXJcIikuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICB9KTtcclxuICBhY3RpdmVOYXZMaW5rID0gYWxsTmF2TGlua3MuZmluZChcclxuICAgIChlbCkgPT4gZWwucXVlcnlTZWxlY3RvcihcIi5uYXZfbWVudV9saW5rXCIpLmlubmVySFRNTCA9PT0gaWQsXHJcbiAgKTtcclxuICBhY3RpdmVOYXZMaW5rLnF1ZXJ5U2VsZWN0b3IoXCIubmF2X21lbnVfbGluay1iYXJcIikuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxufVxyXG5mdW5jdGlvbiBpbml0KCkge1xyXG4gIGNvbnN0IG1vYmlsZVBvcnRyYWl0UXVlcnkgPSB3aW5kb3cubWF0Y2hNZWRpYShcIihtYXgtd2lkdGg6IDQ3OXB4KVwiKTtcclxuICBpZiAobW9iaWxlUG9ydHJhaXRRdWVyeS5tYXRjaGVzKSB7XHJcbiAgICBpc01vYmlsZVBvcnRyYWl0ID0gdHJ1ZTtcclxuICAgIGFsbFR4dFdyYXBzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgaWYgKGlzTW9iaWxlUG9ydHJhaXQgIT09IHRydWUpIHtcclxuICAgIHNldEFjdGl2ZVZpZERpdigpO1xyXG4gICAgc2V0QWN0aXZlVHh0KFwicHJvZHVjdC0xXCIpO1xyXG4gICAgc2V0QWN0aXZlUmV2ZWFsQW5kUm90YXRlVmlkcyhcInByb2R1Y3QtMVwiKTtcclxuICAgIGlmIChhY3RpdmVWaWQpIGFjdGl2ZVZpZC5wbGF5KCk7XHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIGFjdGl2YXRlUHJvZHVjdChkYXRhc2V0QWN0aW9uKSB7XHJcbiAgc2V0QWN0aXZlVHh0KGRhdGFzZXRBY3Rpb24pO1xyXG4gIHNldEFjdGl2ZVZpZERpdigpO1xyXG4gIHNldEFjdGl2ZVJldmVhbEFuZFJvdGF0ZVZpZHMoZGF0YXNldEFjdGlvbik7XHJcbiAgYWN0aXZlVmlkLnBsYXkoKTtcclxufVxyXG5mdW5jdGlvbiBzZXRBY3RpdmVUeHQoZGF0YXNldEFjdGlvbikge1xyXG4gIGFsbFR4dFdyYXBzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gICAgaWYgKGVsLmRhdGFzZXQucHJvZHVjdCA9PT0gZGF0YXNldEFjdGlvbikge1xyXG4gICAgICBlbC5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xyXG4gICAgICBhY3RpdmVUeHRXcmFwID0gZWw7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuZnVuY3Rpb24gc2V0QWN0aXZlVmlkRGl2KCkge1xyXG4gIGFsbFZpZERpdnMuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgfSk7XHJcbiAgaWYgKGlzTW9iaWxlUG9ydHJhaXQpIHtcclxuICAgIGFjdGl2ZVZpZERpdiA9IGFsbFZpZERpdnMuZmluZCgoZWwpID0+IGVsLmNsYXNzTGlzdC5jb250YWlucyhcIm1wXCIpKTtcclxuICB9IGVsc2UgYWN0aXZlVmlkRGl2ID0gYWxsVmlkRGl2cy5maW5kKChlbCkgPT4gIWVsLmNsYXNzTGlzdC5jb250YWlucyhcIm1wXCIpKTtcclxuICBpZiAoYWN0aXZlVmlkRGl2KSBhY3RpdmVWaWREaXYuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxufVxyXG5mdW5jdGlvbiBzZXRBY3RpdmVSZXZlYWxBbmRSb3RhdGVWaWRzKGRhdGFzZXRBY3Rpb24pIHtcclxuICBpZiAoYWN0aXZlVmlkRGl2KSB7XHJcbiAgICBhY3RpdmVWaWREaXYucXVlcnlTZWxlY3RvckFsbChcIi52aWQtY29kZVwiKS5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICBjb25zdCB2aWQgPSBlbC5xdWVyeVNlbGVjdG9yKFwiLnZpZFwiKTtcclxuICAgICAgY29uc3Qgc291cmNlID0gdmlkLnF1ZXJ5U2VsZWN0b3IoXCJzb3VyY2VcIik7XHJcbiAgICAgIGlmICghc291cmNlKSByZXR1cm47XHJcbiAgICAgIC8vIDEuIElmIGl0J3MgTk9UIHRoZSBhY3RpdmUgcHJvZHVjdCwga2lsbCB0aGUgY29ubmVjdGlvbiB0byBzYXZlIGRhdGFcclxuICAgICAgaWYgKGVsLmRhdGFzZXQucHJvZHVjdCAhPT0gZGF0YXNldEFjdGlvbikge1xyXG4gICAgICAgIHZpZC5wYXVzZSgpO1xyXG4gICAgICAgIHNvdXJjZS5zcmMgPSBcIlwiO1xyXG4gICAgICAgIHZpZC5sb2FkKCk7XHJcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgLy8gMi4gSWYgaXQgSVMgdGhlIGFjdGl2ZSBwcm9kdWN0LCBsb2FkIHRoZSBkYXRhXHJcbiAgICAgIGlmIChzb3VyY2Uuc3JjICE9PSBzb3VyY2UuZGF0YXNldC5zcmMpIHtcclxuICAgICAgICBzb3VyY2Uuc3JjID0gc291cmNlLmRhdGFzZXQuc3JjO1xyXG4gICAgICAgIHZpZC5sb2FkKCk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gLS0tIFRIRSBTRVFVRU5DRSBMT0dJQyAtLS1cclxuICAgICAgaWYgKGVsLmRhdGFzZXQudmlkVHlwZSA9PT0gXCJyZXZlYWxcIikge1xyXG4gICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7IC8vIFNIT1cgdGhlIFJldmVhbCB2aWRlb1xyXG4gICAgICAgIGFjdGl2ZVZpZCA9IHZpZDsgLy8gU2V0IHRoaXMgYXMgdGhlIG9uZSB0byAucGxheSgpIGltbWVkaWF0ZWx5XHJcbiAgICAgIH0gZWxzZSBpZiAoZWwuZGF0YXNldC52aWRUeXBlID09PSBcInJvdGF0ZVwiKSB7XHJcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTsgLy8gSElERSB0aGUgUm90YXRlIHZpZGVvIChmb3Igbm93KVxyXG4gICAgICAgIGFjdGl2ZVJvdGF0ZVZpZCA9IHZpZDsgLy8gU3RvcmUgcmVmZXJlbmNlIGZvciB0aGUgJ2VuZGVkJyBoYW5kLW9mZlxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gcmVzZXREcmFnQ29udHJvbCgpIHtcclxuICAvLyAxLiBSZXNldCB0aGUgYWN0aXZlVmlkIGltbWVkaWF0ZWx5XHJcbiAgYWN0aXZlVmlkLmN1cnJlbnRUaW1lID0gMDtcclxuICAvLyAyLiBBbmltYXRlIGRyYWdIYW5kbGUgYmFjayB0byBzdGFydCAoeDogMClcclxuICBnc2FwLnRvKGRyYWdIYW5kbGUsIHtcclxuICAgIHg6IDAsXHJcbiAgICBkdXJhdGlvbjogMC41LFxyXG4gICAgZWFzZTogXCJwb3dlcjIuaW5PdXRcIixcclxuICAgIG9uVXBkYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIC8vIDMuIElNUE9SVEFOVDogVGVsbCBEcmFnZ2FibGUgdGhlIGRyYWdIYW5kbGUgaGFzIG1vdmVkXHJcbiAgICAgIC8vIGRyYWdJbnN0YW5jZSBzaG91bGQgYmUgdGhlIHZhcmlhYmxlIHdoZXJlIHlvdSBzdG9yZWQgRHJhZ2dhYmxlLmNyZWF0ZSgpXHJcbiAgICAgIGRyYWdJbnN0YW5jZS51cGRhdGUoKTtcclxuICAgIH0sXHJcbiAgfSk7XHJcbn1cclxuZnVuY3Rpb24gdG9nZ2xlTW9iaWxlUHJvZHVjdE9wdHMoKSB7XHJcbiAgYmxhY2tvdXQuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxuICBpZiAobW9iaWxlU2VsZWN0ZWRQcm9kdWN0Vmlldykge1xyXG4gICAgLy8gMS4gRm9yY2UgYSBoZWlnaHQgdGhhdCBTYWZhcmkgY2Fubm90IGlnbm9yZVxyXG4gICAgdHh0QW5kQnRuc1dyYXAuc3R5bGUuc2V0UHJvcGVydHkoXCJoZWlnaHRcIiwgXCIyMHJlbVwiLCBcImltcG9ydGFudFwiKTtcclxuICAgIC8vIDIuIFN0YW5kYXJkIHRvZ2dsZXNcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYnRucy1ncmlkXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgICBhY3RpdmVWaWREaXYuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxuICAgIC8vIDMuIGlQaG9uZSBWaXNpYmlsaXR5IEZpeGVzXHJcbiAgICBhY3RpdmVUeHRXcmFwLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XHJcbiAgICBhY3RpdmVUeHRXcmFwLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjsgLy8gRm9yY2UgdmlzaWJpbGl0eVxyXG4gICAgYWN0aXZlVHh0V3JhcC5zdHlsZS5vcGFjaXR5ID0gXCIxXCI7IC8vIEZvcmNlIG9wYWNpdHlcclxuICAgIGFjdGl2ZVR4dFdyYXAuc3R5bGUuekluZGV4ID0gXCIxMFwiOyAvLyBGb3JjZSB0byB0aGUgZnJvbnRcclxuICAgIC8vIDQuIFRoZSBcIk1hZ2ljXCIgUmVmbG93IChDcml0aWNhbCBmb3IgaU9TKVxyXG4gICAgdm9pZCBhY3RpdmVUeHRXcmFwLm9mZnNldEhlaWdodDtcclxuICB9IGVsc2Uge1xyXG4gICAgdHh0QW5kQnRuc1dyYXAuc3R5bGUuaGVpZ2h0ID0gXCIxMDAlXCI7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmJ0bnMtZ3JpZFwiKS5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xyXG4gICAgYWN0aXZlVmlkRGl2LmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmRyYWctd3JhcFwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gICAgYWN0aXZlVHh0V3JhcC5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gIH1cclxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgIGJsYWNrb3V0LmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgfSwgMjUwKTtcclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiOztBQUVBLE1BQU0sU0FBUyxTQUFTLGNBQWMsZ0JBQWdCO0FBQ3RELE1BQU0sVUFBVSxTQUFTLGNBQWMsV0FBVztBQUNsRCxNQUFNLFNBQVMsU0FBUyxjQUFjLGFBQWE7QUFDbkQsTUFBTSxjQUFjLENBQUMsR0FBRyxPQUFPLGlCQUFpQixxQkFBcUIsQ0FBQztBQUN0RSxNQUFJLGdCQUFnQixZQUFZLENBQUM7QUFDakMsTUFBTSxXQUFXLFNBQVMsY0FBYyxlQUFlO0FBQ3ZELE1BQU0sV0FBVyxTQUFTLGNBQWMsV0FBVztBQUNuRCxNQUFNLGlCQUFpQixTQUFTLGNBQWMsb0JBQW9CO0FBQ2xFLE1BQU0sY0FBYyxDQUFDLEdBQUcsU0FBUyxpQkFBaUIsV0FBVyxDQUFDO0FBQzlELE1BQU0sYUFBYSxDQUFDLEdBQUcsU0FBUyxpQkFBaUIsVUFBVSxDQUFDO0FBQzVELE1BQU0sYUFBYSxDQUFDLEdBQUcsU0FBUyxpQkFBaUIsV0FBVyxDQUFDO0FBQzdELE1BQU0sVUFBVSxTQUFTLGlCQUFpQixNQUFNO0FBQ2hELE1BQU0sa0JBQWtCLFNBQVMsaUJBQWlCLGVBQWU7QUFDakUsTUFBTSxjQUFjLFNBQVMsY0FBYyxvQkFBb0I7QUFDL0QsTUFBSSxlQUFlO0FBQ25CLE1BQUksZ0JBQWdC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
