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
        overwrite: "auto",
        // Ensure no other tweens interfere
        onComplete: () => {
          const activeId = targetSection.id;
          sectionReached(activeId);
          if (activeId) history.pushState(null, null, `#${activeId}`);
          toggleSnap(true);
          const targetPos = targetSection.offsetTop;
          window.scrollTo({
            top: targetPos + 1,
            behavior: "auto"
          });
          setTimeout(() => {
            window.scrollTo({
              top: targetPos,
              behavior: "auto"
            });
            toggleSnap(true);
          }, 60);
        }
      });
    });
  }
  function toggleSnap(enabled) {
    const sections2 = document.querySelectorAll(".section");
    sections2.forEach((section) => {
      section.style.scrollSnapAlign = enabled ? "start" : "none";
    });
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL3NjcmlwdC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxyXG4vL1ZJRCBDVFJMUyBERUZJTklUSU9OUy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXHJcbmNvbnN0IG5hdkJhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubmF2X2NvbXBvbmVudFwiKTtcclxuY29uc3QgbmF2TWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubmF2X21lbnVcIik7XHJcbmNvbnN0IG5hdkJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubmF2X2J1dHRvblwiKTtcclxuY29uc3QgYWxsTmF2TGlua3MgPSBbLi4ubmF2QmFyLnF1ZXJ5U2VsZWN0b3JBbGwoXCIubmF2X21lbnVfbGluay13cmFwXCIpXTtcclxubGV0IGFjdGl2ZU5hdkxpbmsgPSBhbGxOYXZMaW5rc1swXTsgLy9maXggdGhpc1xyXG5jb25zdCBtYWluV3JhcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWFpbi13cmFwcGVyXCIpO1xyXG5jb25zdCBibGFja291dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYmxhY2tvdXRcIik7XHJcbmNvbnN0IHR4dEFuZEJ0bnNXcmFwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi50eHQtYW5kLWJ0bnMtd3JhcFwiKTtcclxuY29uc3QgYWxsVHh0V3JhcHMgPSBbLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50eHQtd3JhcFwiKV07XHJcbmNvbnN0IGFsbFZpZERpdnMgPSBbLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi52aWQtZGl2XCIpXTtcclxuY29uc3QgYWxsVmlkQ29kZSA9IFsuLi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnZpZC1jb2RlXCIpXTtcclxuY29uc3QgYWxsVmlkcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudmlkXCIpO1xyXG5jb25zdCBhbGxQcm9kdWN0c0J0bnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmJ0bi5wcm9kdWN0c1wiKTtcclxuY29uc3QgY3RybEJ0bldyYXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnNlY3Rpb24td3JhcC1idG5zXCIpO1xyXG5sZXQgYWN0aXZlVmlkRGl2ID0gbnVsbDtcclxubGV0IGFjdGl2ZVR4dFdyYXAgPSBudWxsO1xyXG5sZXQgYWN0aXZlVmlkQ29kZSA9IG51bGw7XHJcbmxldCBhY3RpdmVWaWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnZpZFwiKVsxXTsgLy9maXggdGhpc1xyXG5sZXQgaXNNb2JpbGVQb3J0cmFpdCA9IGZhbHNlO1xyXG4vLy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXHJcbi8vR1NBUCBERUZJTklUSU9OUy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cclxuY29uc3Qgc2VjdGlvbnMgPSBnc2FwLnV0aWxzLnRvQXJyYXkoXCIuc2VjdGlvblwiKTtcclxuXHJcbmNvbnN0IGRyYWdXcmFwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5kcmFnLXdyYXBcIik7XHJcbmNvbnN0IGRyYWdUcmFjayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZHJhZy10cmFja1wiKTtcclxuY29uc3QgZHJhZ0hhbmRsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZHJhZy1oYW5kbGVcIik7XHJcbmxldCBkcmFnSW5zdGFuY2U7XHJcbmxldCBhY3RpdmVSb3RhdGVWaWQgPSBudWxsO1xyXG5sZXQgbW9iaWxlU2VsZWN0ZWRQcm9kdWN0VmlldyA9IGZhbHNlO1xyXG5sZXQgaXNTZWVraW5nID0gZmFsc2U7IC8vIFRoZSBcImxvY2tcIiB0byBwcmV2ZW50IG92ZXItdGF4aW5nIHRoZSBDUFVcclxuLy8uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cclxuLy9FVkVOVFMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cclxubmF2QmFyLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xyXG4gIGNvbnN0IGNsaWNrZWQgPSBlLnRhcmdldC5jbG9zZXN0KFwiLm5hdl9tZW51X2xpbmtcIik7XHJcbiAgaWYgKCFjbGlja2VkKSByZXR1cm47XHJcbiAgLy8gYmxhY2tvdXQuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxuICBpZiAoXCJuYXZNZW51T3BlblwiIGluIG5hdk1lbnUuZGF0YXNldCkgbmF2QnRuLmNsaWNrKCk7XHJcbn0pO1xyXG5tYWluV3JhcC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGUpIHtcclxuICBjb25zdCBjbGlja2VkID0gZS50YXJnZXQuY2xvc2VzdChcIltkYXRhLWNsaWNrLWFjdGlvbl1cIik7XHJcbiAgaWYgKCFjbGlja2VkKSByZXR1cm47XHJcbiAgY29uc3QgZGF0YXNldEFjdGlvbiA9IGNsaWNrZWQuZGF0YXNldC5wcm9kdWN0O1xyXG4gIGlmIChcclxuICAgIGRhdGFzZXRBY3Rpb24gIT09IFwicHJvZHVjdC0xXCIgJiZcclxuICAgIGRhdGFzZXRBY3Rpb24gIT09IFwicHJvZHVjdC0yXCIgJiZcclxuICAgIGRhdGFzZXRBY3Rpb24gIT09IFwicHJvZHVjdC0zXCJcclxuICApXHJcbiAgICByZXR1cm47XHJcbiAgZHJhZ1dyYXAuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICByZXNldERyYWdDb250cm9sKCk7XHJcbiAgYWN0aXZhdGVQcm9kdWN0KGRhdGFzZXRBY3Rpb24pO1xyXG4gIGlmIChhY3RpdmVWaWQucGFyZW50RWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJtcFwiKSkge1xyXG4gICAgbW9iaWxlU2VsZWN0ZWRQcm9kdWN0VmlldyA9IHRydWU7XHJcbiAgICB0b2dnbGVNb2JpbGVQcm9kdWN0T3B0cygpO1xyXG4gIH1cclxufSk7XHJcbmFsbFByb2R1Y3RzQnRucy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAoYWN0aXZlVmlkLnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwibXBcIikpIHtcclxuICAgICAgbW9iaWxlU2VsZWN0ZWRQcm9kdWN0VmlldyA9IGZhbHNlO1xyXG4gICAgICB0b2dnbGVNb2JpbGVQcm9kdWN0T3B0cygpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59KTtcclxuYWxsVmlkcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJlbmRlZFwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgY29uc3QgZW5kZWRWaWQgPSBlLnRhcmdldC5jbG9zZXN0KFwiLnZpZFwiKTtcclxuICAgIGlmIChlbmRlZFZpZC5wYXJlbnRFbGVtZW50LmRhdGFzZXQudmlkVHlwZSAhPT0gXCJyZXZlYWxcIikgcmV0dXJuO1xyXG4gICAgYWN0aXZlUm90YXRlVmlkLnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxuICAgIGFjdGl2ZVZpZCA9IGFjdGl2ZVJvdGF0ZVZpZDtcclxuICAgIGFjdGl2ZVZpZC5sb2FkKCk7XHJcbiAgICBkcmFnV3JhcC5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xyXG4gIH0pO1xyXG59KTtcclxuLy90b3VjaHN0YXJ0IGluaXQsIEdTQVAgc2xpZGVyXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcclxuICBmdW5jdGlvbiB1cGRhdGVWaWRlbyhpbnN0YW5jZSkge1xyXG4gICAgLy8gMS4gU2FmZXR5IGNoZWNrczogRW5zdXJlIHRoZXJlIGlzIGEgdmlkZW8gYW5kIGl0IGhhcyBhIGR1cmF0aW9uXHJcbiAgICBpZiAoIWFjdGl2ZVZpZCB8fCAhYWN0aXZlVmlkLmR1cmF0aW9uKSByZXR1cm47XHJcbiAgICAvLyAyLiBQZXJmb3JtYW5jZSBDaGVjazogSWYgdGhlIHBob25lIGlzIHN0aWxsIHByb2Nlc3NpbmcgdGhlIGxhc3QgZnJhbWUsIHNraXAgdGhpcyBvbmVcclxuICAgIGlmIChpc1NlZWtpbmcpIHJldHVybjtcclxuICAgIGlzU2Vla2luZyA9IHRydWU7IC8vIExvY2tcclxuICAgIC8vIDMuIFN5bmMgd2l0aCB0aGUgc2NyZWVuJ3MgcmVmcmVzaCByYXRlXHJcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xyXG4gICAgICBsZXQgcHJvZ3Jlc3MgPSBpbnN0YW5jZS54IC8gaW5zdGFuY2UubWF4WDtcclxuICAgICAgLy8gNC4gVXBkYXRlIHRoZSB2aWRlbyB0aW1lXHJcbiAgICAgIGFjdGl2ZVZpZC5jdXJyZW50VGltZSA9IHByb2dyZXNzICogYWN0aXZlVmlkLmR1cmF0aW9uO1xyXG4gICAgICBpc1NlZWtpbmcgPSBmYWxzZTsgLy8gVW5sb2NrIGZvciB0aGUgbmV4dCBmcmFtZVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIC8vdG91Y2hzdGFydCBldmVudFxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICBcInRvdWNoc3RhcnRcIixcclxuICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgYWxsVmlkcy5mb3JFYWNoKCh2aWQpID0+IHtcclxuICAgICAgICAvLyBQbGF5IGZvciBhIHNwbGl0IHNlY29uZCB0aGVuIHBhdXNlIHRvIGZvcmNlIGEgYnVmZmVyIGZpbGxcclxuICAgICAgICB2aWRcclxuICAgICAgICAgIC5wbGF5KClcclxuICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgdmlkLnBhdXNlKCk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgLyogSW50ZW50aW9uYWwgc2lsZW5jZTogd2UgYXJlIGp1c3Qgd2FybWluZyB0aGUgYnVmZmVyICovXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgeyBvbmNlOiB0cnVlIH0sXHJcbiAgKTsgLy8gT25seSBydW5zIG9uIHRoZSB2ZXJ5IGZpcnN0IHRhcFxyXG4gIGdzYXAucmVnaXN0ZXJQbHVnaW4oRHJhZ2dhYmxlKTtcclxuICAvLyBDcmVhdGUgdGhlIGRyYWdnYWJsZSBhbmQgc3RvcmUgaXQgaW4gYSB2YXJpYWJsZVxyXG4gIGRyYWdJbnN0YW5jZSA9IERyYWdnYWJsZS5jcmVhdGUoZHJhZ0hhbmRsZSwge1xyXG4gICAgdHlwZTogXCJ4XCIsXHJcbiAgICBib3VuZHM6IGRyYWdUcmFjayxcclxuICAgIGluZXJ0aWE6IHRydWUsXHJcbiAgICBlZGdlUmVzaXN0YW5jZTogMSxcclxuICAgIG92ZXJzaG9vdFRvbGVyYW5jZTogMCxcclxuICAgIG9uRHJhZzogZnVuY3Rpb24gKCkge1xyXG4gICAgICB1cGRhdGVWaWRlbyh0aGlzKTtcclxuICAgIH0sXHJcbiAgICBvblRocm93VXBkYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHVwZGF0ZVZpZGVvKHRoaXMpO1xyXG4gICAgfSxcclxuICB9KVswXTsgLy8gRHJhZ2dhYmxlLmNyZWF0ZSByZXR1cm5zIGFuIGFycmF5OyB3ZSB3YW50IHRoZSBmaXJzdCBpdGVtXHJcbiAgLy8gLS0tIENMSUNLIFRPIFNOQVAgTE9HSUMgLS0tXHJcbiAgaWYgKGRyYWdUcmFjaykge1xyXG4gICAgZHJhZ1RyYWNrLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4ge1xyXG4gICAgICAvLyBJZ25vcmUgaWYgdGhlIHVzZXIgY2xpY2tlZCB0aGUgZHJhZ0hhbmRsZSBpdHNlbGZcclxuICAgICAgaWYgKGUudGFyZ2V0ID09PSBkcmFnSGFuZGxlKSByZXR1cm47XHJcbiAgICAgIC8vIENhbGN1bGF0ZSBjbGljayBwb3NpdGlvbiByZWxhdGl2ZSB0byBkcmFnVHJhY2tcclxuICAgICAgY29uc3QgZHJhZ1RyYWNrUmVjdCA9IGRyYWdUcmFjay5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgY29uc3QgZHJhZ0hhbmRsZVdpZHRoID0gZHJhZ0hhbmRsZS5vZmZzZXRXaWR0aDtcclxuICAgICAgLy8gQ2VudGVyIHRoZSBkcmFnSGFuZGxlIG9uIHRoZSBjbGljayBwb2ludFxyXG4gICAgICBsZXQgY2xpY2tYID0gZS5jbGllbnRYIC0gZHJhZ1RyYWNrUmVjdC5sZWZ0IC0gZHJhZ0hhbmRsZVdpZHRoIC8gMjtcclxuICAgICAgLy8gQ2xhbXAgYmV0d2VlbiAwIGFuZCBtYXhYXHJcbiAgICAgIGNvbnN0IGZpbmFsWCA9IE1hdGgubWF4KDAsIE1hdGgubWluKGNsaWNrWCwgZHJhZ0luc3RhbmNlLm1heFgpKTtcclxuICAgICAgLy8gQW5pbWF0ZSBkcmFnSGFuZGxlIGFuZCBzeW5jIHZpZGVvXHJcbiAgICAgIGdzYXAudG8oZHJhZ0hhbmRsZSwge1xyXG4gICAgICAgIHg6IGZpbmFsWCxcclxuICAgICAgICBkdXJhdGlvbjogMC40LFxyXG4gICAgICAgIGVhc2U6IFwicG93ZXIyLm91dFwiLFxyXG4gICAgICAgIG9uVXBkYXRlOiAoKSA9PiB7XHJcbiAgICAgICAgICAvLyBTeW5jIERyYWdnYWJsZSdzIGludGVybmFsICd4JyBkdXJpbmcgYW5pbWF0aW9uXHJcbiAgICAgICAgICBkcmFnSW5zdGFuY2UudXBkYXRlKCk7XHJcbiAgICAgICAgICB1cGRhdGVWaWRlbyhkcmFnSW5zdGFuY2UpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGluaXQoKTtcclxufSk7XHJcbi8vLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXHJcbi8vRlVOQ1RJT05TLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXHJcbi8vU0NST0xMIFNOQVBQSU5HXHJcbmZ1bmN0aW9uIHN0YXJ0QXBwKCkge1xyXG4gIC8vIENoZWNrIGZvciBib3RoIFNjcm9sbFRvIGFuZCBTY3JvbGxUcmlnZ2VyXHJcbiAgY29uc3Qgc3RwID1cclxuICAgIHdpbmRvdy5TY3JvbGxUb1BsdWdpbiB8fFxyXG4gICAgKHdpbmRvdy5nc2FwICYmIHdpbmRvdy5nc2FwLnBsdWdpbnMgJiYgd2luZG93LmdzYXAucGx1Z2lucy5zY3JvbGxUbyk7XHJcbiAgY29uc3Qgc3RyID0gd2luZG93LlNjcm9sbFRyaWdnZXI7XHJcbiAgaWYgKHN0cCAmJiBzdHIpIHtcclxuICAgIC8vIFJlZ2lzdGVyIEJPVEggaGVyZVxyXG4gICAgZ3NhcC5yZWdpc3RlclBsdWdpbihzdHAsIHN0cik7XHJcbiAgICAvLyAxLiBJbml0aWFsaXplIHlvdXIgY3VzdG9tIGxvZ2ljXHJcbiAgICBpbml0U2Nyb2xsTmV4dCgpO1xyXG4gICAgLy8gMi4gU2V0dXAgdGhlIE9ic2VydmVyIE9OTFkgT05DRSBhZnRlciBwbHVnaW5zIGFyZSByZWFkeVxyXG4gICAgY29uc3Qgb2JzZXJ2ZXJPcHRpb25zID0ge1xyXG4gICAgICByb290OiBudWxsLFxyXG4gICAgICB0aHJlc2hvbGQ6IDAuNixcclxuICAgIH07XHJcbiAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlcigoZW50cmllcykgPT4ge1xyXG4gICAgICBlbnRyaWVzLmZvckVhY2goKGVudHJ5KSA9PiB7XHJcbiAgICAgICAgaWYgKGVudHJ5LmlzSW50ZXJzZWN0aW5nKSB7XHJcbiAgICAgICAgICAvLyBDaGVjayBpZiBHU0FQIGlzIGN1cnJlbnRseSBhbmltYXRpbmcgYSBzY3JvbGxcclxuICAgICAgICAgIGlmICghZ3NhcC5pc1R3ZWVuaW5nKHdpbmRvdykpIHtcclxuICAgICAgICAgICAgc2VjdGlvblJlYWNoZWQoZW50cnkudGFyZ2V0LmlkKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSwgb2JzZXJ2ZXJPcHRpb25zKTtcclxuICAgIHNlY3Rpb25zLmZvckVhY2goKHNlY3Rpb24pID0+IG9ic2VydmVyLm9ic2VydmUoc2VjdGlvbikpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyBJZiBub3QgZm91bmQgeWV0LCB3YWl0IGFuZCB0cnkgYWdhaW5cclxuICAgIHNldFRpbWVvdXQoc3RhcnRBcHAsIDUwKTtcclxuICB9XHJcbn1cclxuLy8gU3RhcnQgdGhlIGNoZWNrIGFzIHNvb24gYXMgdGhlIHNjcmlwdCBsb2Fkc1xyXG5zdGFydEFwcCgpO1xyXG5mdW5jdGlvbiBpbml0U2Nyb2xsTmV4dCgpIHtcclxuICAvL2ZvciBzY3JvbGwtc25hcHBpbmdcclxuICBjb25zdCBuZXh0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5idG4uc2Nyb2xsLW5leHQtYnRuXCIpO1xyXG4gIGlmICghbmV4dEJ0biB8fCBzZWN0aW9ucy5sZW5ndGggPT09IDApIHJldHVybjtcclxuICBuZXh0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAvLyAxLiBLaWxsIHRoZSBzbmFwIHNvIHRoZSBicm93c2VyIHN0b3BzIGZpZ2h0aW5nXHJcbiAgICB0b2dnbGVTbmFwKGZhbHNlKTtcclxuICAgIC8vIDEuIERldGVybWluZSB3aGljaCBzZWN0aW9uIGlzIGN1cnJlbnRseSBpbiB2aWV3XHJcbiAgICBsZXQgY3VycmVudFNlY3Rpb25JbmRleCA9IHNlY3Rpb25zLmZpbmRJbmRleCgoc2VjdGlvbikgPT4ge1xyXG4gICAgICBjb25zdCByZWN0ID0gc2VjdGlvbi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgLy8gQ2hlY2sgaWYgdGhlIHRvcCBvZiB0aGUgc2VjdGlvbiBpcyByb3VnaGx5IGF0IHRoZSB0b3Agb2YgdGhlIHZpZXdwb3J0XHJcbiAgICAgIHJldHVybiByZWN0LnRvcCA+PSAtMTAwICYmIHJlY3QudG9wIDw9IDEwMDtcclxuICAgIH0pO1xyXG4gICAgLy8gMi4gRmluZCB0aGUgbmV4dCBzZWN0aW9uIChvciBsb29wIGJhY2sgdG8gdGhlIGZpcnN0KVxyXG4gICAgbGV0IG5leHRTZWN0aW9uSW5kZXggPSAoY3VycmVudFNlY3Rpb25JbmRleCArIDEpICUgc2VjdGlvbnMubGVuZ3RoO1xyXG4gICAgY29uc3QgdGFyZ2V0U2VjdGlvbiA9IHNlY3Rpb25zW25leHRTZWN0aW9uSW5kZXhdO1xyXG4gICAgLy8gMy4gR1NBUCBTY3JvbGwgdG8gdGhhdCBzZWN0aW9uXHJcbiAgICBnc2FwLnRvKHdpbmRvdywge1xyXG4gICAgICBkdXJhdGlvbjogMC44LFxyXG4gICAgICBzY3JvbGxUbzogeyB5OiB0YXJnZXRTZWN0aW9uLCBhdXRvS2lsbDogZmFsc2UgfSxcclxuICAgICAgZWFzZTogXCJwb3dlcjIuaW5PdXRcIixcclxuICAgICAgb3ZlcndyaXRlOiBcImF1dG9cIiwgLy8gRW5zdXJlIG5vIG90aGVyIHR3ZWVucyBpbnRlcmZlcmVcclxuICAgICAgb25Db21wbGV0ZTogKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGFjdGl2ZUlkID0gdGFyZ2V0U2VjdGlvbi5pZDtcclxuICAgICAgICBzZWN0aW9uUmVhY2hlZChhY3RpdmVJZCk7XHJcbiAgICAgICAgaWYgKGFjdGl2ZUlkKSBoaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBudWxsLCBgIyR7YWN0aXZlSWR9YCk7XHJcbiAgICAgICAgLy8gMS4gUmUtZW5hYmxlIHRoZSBzbmFwLWFsaWduIG1hZ25ldHNcclxuICAgICAgICB0b2dnbGVTbmFwKHRydWUpO1xyXG4gICAgICAgIC8vIDIuIFRIRSBGSVg6IEZvcmNlIGEgbmF0aXZlICdTY3JvbGwnIGV2ZW50XHJcbiAgICAgICAgLy8gU2FmYXJpIG9ubHkgdXBkYXRlcyBpdHMgaW50ZXJuYWwgc25hcCBpbmRleCBvbiBOQVRJVkUgc2Nyb2xsIGV2ZW50cy5cclxuICAgICAgICAvLyBXZSBtb3ZlIDFweCBhbmQgYmFjayB0byB0cmlnZ2VyIHRoYXQgaW50ZXJuYWwgdXBkYXRlLlxyXG4gICAgICAgIGNvbnN0IHRhcmdldFBvcyA9IHRhcmdldFNlY3Rpb24ub2Zmc2V0VG9wO1xyXG4gICAgICAgIHdpbmRvdy5zY3JvbGxUbyh7XHJcbiAgICAgICAgICB0b3A6IHRhcmdldFBvcyArIDEsXHJcbiAgICAgICAgICBiZWhhdmlvcjogXCJhdXRvXCIsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gMy4gU2V0dGxpbmcgdGltZW91dFxyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgd2luZG93LnNjcm9sbFRvKHtcclxuICAgICAgICAgICAgdG9wOiB0YXJnZXRQb3MsXHJcbiAgICAgICAgICAgIGJlaGF2aW9yOiBcImF1dG9cIixcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgLy8gRmluYWwgYW5jaG9yIHRvIGVuc3VyZSB3ZSBhcmUgcGl4ZWwtcGVyZmVjdFxyXG4gICAgICAgICAgdG9nZ2xlU25hcCh0cnVlKTtcclxuICAgICAgICB9LCA2MCk7XHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuICB9KTtcclxufVxyXG4vLyBIZWxwZXIgdG8gdG9nZ2xlIHNuYXBwaW5nXHJcbi8vIGZ1bmN0aW9uIHRvZ2dsZVNuYXAoZW5hYmxlZCkge1xyXG4vLyAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5zY3JvbGxTbmFwVHlwZSA9IGVuYWJsZWRcclxuLy8gICAgID8gXCJ5IG1hbmRhdG9yeVwiXHJcbi8vICAgICA6IFwibm9uZVwiO1xyXG4vLyAgIGRvY3VtZW50LmJvZHkuc3R5bGUuc2Nyb2xsU25hcFR5cGUgPSBlbmFibGVkID8gXCJ5IG1hbmRhdG9yeVwiIDogXCJub25lXCI7XHJcbi8vIH1cclxuZnVuY3Rpb24gdG9nZ2xlU25hcChlbmFibGVkKSB7XHJcbiAgLy8gVGFyZ2V0IGFsbCB5b3VyIHNlY3Rpb25zXHJcbiAgY29uc3Qgc2VjdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNlY3Rpb25cIik7XHJcbiAgc2VjdGlvbnMuZm9yRWFjaCgoc2VjdGlvbikgPT4ge1xyXG4gICAgLy8gSWYgZGlzYWJsZWQsIHJlbW92ZSB0aGUgYWxpZ25tZW50IHNvIHRoZXJlJ3Mgbm90aGluZyB0byBzbmFwIFRPXHJcbiAgICBzZWN0aW9uLnN0eWxlLnNjcm9sbFNuYXBBbGlnbiA9IGVuYWJsZWQgPyBcInN0YXJ0XCIgOiBcIm5vbmVcIjtcclxuICB9KTtcclxufVxyXG5mdW5jdGlvbiBzZWN0aW9uUmVhY2hlZChpZCkge1xyXG4gIGFsbE5hdkxpbmtzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICBlbC5xdWVyeVNlbGVjdG9yKFwiLm5hdl9tZW51X2xpbmstYmFyXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgfSk7XHJcbiAgYWN0aXZlTmF2TGluayA9IGFsbE5hdkxpbmtzLmZpbmQoXHJcbiAgICAoZWwpID0+IGVsLnF1ZXJ5U2VsZWN0b3IoXCIubmF2X21lbnVfbGlua1wiKS5pbm5lckhUTUwgPT09IGlkLFxyXG4gICk7XHJcbiAgYWN0aXZlTmF2TGluay5xdWVyeVNlbGVjdG9yKFwiLm5hdl9tZW51X2xpbmstYmFyXCIpLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XHJcbn1cclxuZnVuY3Rpb24gaW5pdCgpIHtcclxuICBjb25zdCBtb2JpbGVQb3J0cmFpdFF1ZXJ5ID0gd2luZG93Lm1hdGNoTWVkaWEoXCIobWF4LXdpZHRoOiA0NzlweClcIik7XHJcbiAgaWYgKG1vYmlsZVBvcnRyYWl0UXVlcnkubWF0Y2hlcykge1xyXG4gICAgaXNNb2JpbGVQb3J0cmFpdCA9IHRydWU7XHJcbiAgICBhbGxUeHRXcmFwcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGlmIChpc01vYmlsZVBvcnRyYWl0ICE9PSB0cnVlKSB7XHJcbiAgICBzZXRBY3RpdmVWaWREaXYoKTtcclxuICAgIHNldEFjdGl2ZVR4dChcInByb2R1Y3QtMVwiKTtcclxuICAgIHNldEFjdGl2ZVJldmVhbEFuZFJvdGF0ZVZpZHMoXCJwcm9kdWN0LTFcIik7XHJcbiAgICBpZiAoYWN0aXZlVmlkKSBhY3RpdmVWaWQucGxheSgpO1xyXG4gIH1cclxufVxyXG5mdW5jdGlvbiBhY3RpdmF0ZVByb2R1Y3QoZGF0YXNldEFjdGlvbikge1xyXG4gIHNldEFjdGl2ZVR4dChkYXRhc2V0QWN0aW9uKTtcclxuICBzZXRBY3RpdmVWaWREaXYoKTtcclxuICBzZXRBY3RpdmVSZXZlYWxBbmRSb3RhdGVWaWRzKGRhdGFzZXRBY3Rpb24pO1xyXG4gIGFjdGl2ZVZpZC5wbGF5KCk7XHJcbn1cclxuZnVuY3Rpb24gc2V0QWN0aXZlVHh0KGRhdGFzZXRBY3Rpb24pIHtcclxuICBhbGxUeHRXcmFwcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgZWwuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICAgIGlmIChlbC5kYXRhc2V0LnByb2R1Y3QgPT09IGRhdGFzZXRBY3Rpb24pIHtcclxuICAgICAgZWwuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxuICAgICAgYWN0aXZlVHh0V3JhcCA9IGVsO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcbmZ1bmN0aW9uIHNldEFjdGl2ZVZpZERpdigpIHtcclxuICBhbGxWaWREaXZzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gIH0pO1xyXG4gIGlmIChpc01vYmlsZVBvcnRyYWl0KSB7XHJcbiAgICBhY3RpdmVWaWREaXYgPSBhbGxWaWREaXZzLmZpbmQoKGVsKSA9PiBlbC5jbGFzc0xpc3QuY29udGFpbnMoXCJtcFwiKSk7XHJcbiAgfSBlbHNlIGFjdGl2ZVZpZERpdiA9IGFsbFZpZERpdnMuZmluZCgoZWwpID0+ICFlbC5jbGFzc0xpc3QuY29udGFpbnMoXCJtcFwiKSk7XHJcbiAgaWYgKGFjdGl2ZVZpZERpdikgYWN0aXZlVmlkRGl2LmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XHJcbn1cclxuZnVuY3Rpb24gc2V0QWN0aXZlUmV2ZWFsQW5kUm90YXRlVmlkcyhkYXRhc2V0QWN0aW9uKSB7XHJcbiAgaWYgKGFjdGl2ZVZpZERpdikge1xyXG4gICAgYWN0aXZlVmlkRGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudmlkLWNvZGVcIikuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgY29uc3QgdmlkID0gZWwucXVlcnlTZWxlY3RvcihcIi52aWRcIik7XHJcbiAgICAgIGNvbnN0IHNvdXJjZSA9IHZpZC5xdWVyeVNlbGVjdG9yKFwic291cmNlXCIpO1xyXG4gICAgICBpZiAoIXNvdXJjZSkgcmV0dXJuO1xyXG4gICAgICAvLyAxLiBJZiBpdCdzIE5PVCB0aGUgYWN0aXZlIHByb2R1Y3QsIGtpbGwgdGhlIGNvbm5lY3Rpb24gdG8gc2F2ZSBkYXRhXHJcbiAgICAgIGlmIChlbC5kYXRhc2V0LnByb2R1Y3QgIT09IGRhdGFzZXRBY3Rpb24pIHtcclxuICAgICAgICB2aWQucGF1c2UoKTtcclxuICAgICAgICBzb3VyY2Uuc3JjID0gXCJcIjtcclxuICAgICAgICB2aWQubG9hZCgpO1xyXG4gICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIDIuIElmIGl0IElTIHRoZSBhY3RpdmUgcHJvZHVjdCwgbG9hZCB0aGUgZGF0YVxyXG4gICAgICBpZiAoc291cmNlLnNyYyAhPT0gc291cmNlLmRhdGFzZXQuc3JjKSB7XHJcbiAgICAgICAgc291cmNlLnNyYyA9IHNvdXJjZS5kYXRhc2V0LnNyYztcclxuICAgICAgICB2aWQubG9hZCgpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIC0tLSBUSEUgU0VRVUVOQ0UgTE9HSUMgLS0tXHJcbiAgICAgIGlmIChlbC5kYXRhc2V0LnZpZFR5cGUgPT09IFwicmV2ZWFsXCIpIHtcclxuICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpOyAvLyBTSE9XIHRoZSBSZXZlYWwgdmlkZW9cclxuICAgICAgICBhY3RpdmVWaWQgPSB2aWQ7IC8vIFNldCB0aGlzIGFzIHRoZSBvbmUgdG8gLnBsYXkoKSBpbW1lZGlhdGVseVxyXG4gICAgICB9IGVsc2UgaWYgKGVsLmRhdGFzZXQudmlkVHlwZSA9PT0gXCJyb3RhdGVcIikge1xyXG4gICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7IC8vIEhJREUgdGhlIFJvdGF0ZSB2aWRlbyAoZm9yIG5vdylcclxuICAgICAgICBhY3RpdmVSb3RhdGVWaWQgPSB2aWQ7IC8vIFN0b3JlIHJlZmVyZW5jZSBmb3IgdGhlICdlbmRlZCcgaGFuZC1vZmZcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIHJlc2V0RHJhZ0NvbnRyb2woKSB7XHJcbiAgLy8gMS4gUmVzZXQgdGhlIGFjdGl2ZVZpZCBpbW1lZGlhdGVseVxyXG4gIGFjdGl2ZVZpZC5jdXJyZW50VGltZSA9IDA7XHJcbiAgLy8gMi4gQW5pbWF0ZSBkcmFnSGFuZGxlIGJhY2sgdG8gc3RhcnQgKHg6IDApXHJcbiAgZ3NhcC50byhkcmFnSGFuZGxlLCB7XHJcbiAgICB4OiAwLFxyXG4gICAgZHVyYXRpb246IDAuNSxcclxuICAgIGVhc2U6IFwicG93ZXIyLmluT3V0XCIsXHJcbiAgICBvblVwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAvLyAzLiBJTVBPUlRBTlQ6IFRlbGwgRHJhZ2dhYmxlIHRoZSBkcmFnSGFuZGxlIGhhcyBtb3ZlZFxyXG4gICAgICAvLyBkcmFnSW5zdGFuY2Ugc2hvdWxkIGJlIHRoZSB2YXJpYWJsZSB3aGVyZSB5b3Ugc3RvcmVkIERyYWdnYWJsZS5jcmVhdGUoKVxyXG4gICAgICBkcmFnSW5zdGFuY2UudXBkYXRlKCk7XHJcbiAgICB9LFxyXG4gIH0pO1xyXG59XHJcbmZ1bmN0aW9uIHRvZ2dsZU1vYmlsZVByb2R1Y3RPcHRzKCkge1xyXG4gIGJsYWNrb3V0LmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XHJcbiAgaWYgKG1vYmlsZVNlbGVjdGVkUHJvZHVjdFZpZXcpIHtcclxuICAgIC8vIDEuIEZvcmNlIGEgaGVpZ2h0IHRoYXQgU2FmYXJpIGNhbm5vdCBpZ25vcmVcclxuICAgIHR4dEFuZEJ0bnNXcmFwLnN0eWxlLnNldFByb3BlcnR5KFwiaGVpZ2h0XCIsIFwiMjByZW1cIiwgXCJpbXBvcnRhbnRcIik7XHJcbiAgICAvLyAyLiBTdGFuZGFyZCB0b2dnbGVzXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmJ0bnMtZ3JpZFwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gICAgYWN0aXZlVmlkRGl2LmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XHJcbiAgICAvLyAzLiBpUGhvbmUgVmlzaWJpbGl0eSBGaXhlc1xyXG4gICAgYWN0aXZlVHh0V3JhcC5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xyXG4gICAgYWN0aXZlVHh0V3JhcC5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7IC8vIEZvcmNlIHZpc2liaWxpdHlcclxuICAgIGFjdGl2ZVR4dFdyYXAuc3R5bGUub3BhY2l0eSA9IFwiMVwiOyAvLyBGb3JjZSBvcGFjaXR5XHJcbiAgICBhY3RpdmVUeHRXcmFwLnN0eWxlLnpJbmRleCA9IFwiMTBcIjsgLy8gRm9yY2UgdG8gdGhlIGZyb250XHJcbiAgICAvLyA0LiBUaGUgXCJNYWdpY1wiIFJlZmxvdyAoQ3JpdGljYWwgZm9yIGlPUylcclxuICAgIHZvaWQgYWN0aXZlVHh0V3JhcC5vZmZzZXRIZWlnaHQ7XHJcbiAgfSBlbHNlIHtcclxuICAgIHR4dEFuZEJ0bnNXcmFwLnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5idG5zLWdyaWRcIikuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxuICAgIGFjdGl2ZVZpZERpdi5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5kcmFnLXdyYXBcIikuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICAgIGFjdGl2ZVR4dFdyYXAuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICB9XHJcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICBibGFja291dC5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gIH0sIDI1MCk7XHJcbn1cclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7QUFFQSxNQUFNLFNBQVMsU0FBUyxjQUFjLGdCQUFnQjtBQUN0RCxNQUFNLFVBQVUsU0FBUyxjQUFjLFdBQVc7QUFDbEQsTUFBTSxTQUFTLFNBQVMsY0FBYyxhQUFhO0FBQ25ELE1BQU0sY0FBYyxDQUFDLEdBQUcsT0FBTyxpQkFBaUIscUJBQXFCLENBQUM7QUFDdEUsTUFBSSxnQkFBZ0IsWUFBWSxDQUFDO0FBQ2pDLE1BQU0sV0FBVyxTQUFTLGNBQWMsZUFBZTtBQUN2RCxNQUFNLFdBQVcsU0FBUyxjQUFjLFdBQVc7QUFDbkQsTUFBTSxpQkFBaUIsU0FBUyxjQUFjLG9CQUFvQjtBQUNsRSxNQUFNLGNBQWMsQ0FBQyxHQUFHLFNBQVMsaUJBQWlCLFdBQVcsQ0FBQztBQUM5RCxNQUFNLGFBQWEsQ0FBQyxHQUFHLFNBQVMsaUJBQWlCLFVBQVUsQ0FBQztBQUM1RCxNQUFNLGFBQWEsQ0FBQyxHQUFHLFNBQVMsaUJBQWlCLFdBQVcsQ0FBQztBQUM3RCxNQUFNLFVBQVUsU0FBUyxpQkFBaUIsTUFBTTtBQUNoRCxNQUFNLGtCQUFrQixTQUFTLGlCQUFpQixlQUFlO0FBQ2pFLE1BQU0sY0FBYyxTQUFTLGNBQWMsb0JBQW9CO0FBQy9E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
