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
  function startApp() {
    const stp = window.ScrollToPlugin || window.gsap && window.gsap.plugins && window.gsap.plugins.scrollTo;
    if (stp) {
      gsap.registerPlugin(stp);
      ScrollTrigger.normalizeScroll(true);
      initScrollNext();
    } else {
      setTimeout(startApp, 50);
    }
    const observerOptions = {
      root: null,
      // use the viewport
      threshold: 0.6
      // fire when 60% of the section is visible
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
  }
  startApp();
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
  function initScrollNext() {
    const nextBtn = document.querySelector(".btn.scroll-next-btn");
    if (!nextBtn || sections.length === 0) return;
    nextBtn.addEventListener("click", () => {
      let currentSectionIndex = sections.findIndex((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top >= -50 && rect.top <= 50;
      });
      let nextSectionIndex = currentSectionIndex + 1;
      if (nextSectionIndex >= sections.length) {
        nextSectionIndex = 0;
      }
      gsap.to(window, {
        duration: 0.8,
        scrollTo: { y: sections[nextSectionIndex], autoKill: false },
        ease: "power2.inOut",
        onComplete: () => {
          const activeId = sections[nextSectionIndex].id;
          sectionReached(activeId);
          if (activeId) history.pushState(null, null, `#${activeId}`);
        }
      });
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL3NjcmlwdC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxyXG4vL1ZJRCBDVFJMUyBERUZJTklUSU9OUy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXHJcbmNvbnN0IG5hdkJhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubmF2X2NvbXBvbmVudFwiKTtcclxuY29uc3QgbmF2TWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubmF2X21lbnVcIik7XHJcbmNvbnN0IG5hdkJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubmF2X2J1dHRvblwiKTtcclxuY29uc3QgYWxsTmF2TGlua3MgPSBbLi4ubmF2QmFyLnF1ZXJ5U2VsZWN0b3JBbGwoXCIubmF2X21lbnVfbGluay13cmFwXCIpXTtcclxubGV0IGFjdGl2ZU5hdkxpbmsgPSBhbGxOYXZMaW5rc1swXTsgLy9maXggdGhpc1xyXG5jb25zdCBtYWluV3JhcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWFpbi13cmFwcGVyXCIpO1xyXG5jb25zdCBibGFja291dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYmxhY2tvdXRcIik7XHJcbmNvbnN0IHR4dEFuZEJ0bnNXcmFwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi50eHQtYW5kLWJ0bnMtd3JhcFwiKTtcclxuY29uc3QgYWxsVHh0V3JhcHMgPSBbLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50eHQtd3JhcFwiKV07XHJcbmNvbnN0IGFsbFZpZERpdnMgPSBbLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi52aWQtZGl2XCIpXTtcclxuY29uc3QgYWxsVmlkQ29kZSA9IFsuLi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnZpZC1jb2RlXCIpXTtcclxuY29uc3QgYWxsVmlkcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudmlkXCIpO1xyXG5jb25zdCBhbGxQcm9kdWN0c0J0bnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmJ0bi5wcm9kdWN0c1wiKTtcclxuY29uc3QgY3RybEJ0bldyYXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnNlY3Rpb24td3JhcC1idG5zXCIpO1xyXG5sZXQgYWN0aXZlVmlkRGl2ID0gbnVsbDtcclxubGV0IGFjdGl2ZVR4dFdyYXAgPSBudWxsO1xyXG5sZXQgYWN0aXZlVmlkQ29kZSA9IG51bGw7XHJcbmxldCBhY3RpdmVWaWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnZpZFwiKVsxXTsgLy9maXggdGhpc1xyXG5sZXQgaXNNb2JpbGVQb3J0cmFpdCA9IGZhbHNlO1xyXG4vLy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXHJcbi8vR1NBUCBERUZJTklUSU9OUy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cclxuY29uc3Qgc2VjdGlvbnMgPSBnc2FwLnV0aWxzLnRvQXJyYXkoXCIuc2VjdGlvblwiKTtcclxuXHJcbmNvbnN0IGRyYWdXcmFwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5kcmFnLXdyYXBcIik7XHJcbmNvbnN0IGRyYWdUcmFjayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZHJhZy10cmFja1wiKTtcclxuY29uc3QgZHJhZ0hhbmRsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZHJhZy1oYW5kbGVcIik7XHJcbmxldCBkcmFnSW5zdGFuY2U7XHJcbmxldCBhY3RpdmVSb3RhdGVWaWQgPSBudWxsO1xyXG5sZXQgbW9iaWxlU2VsZWN0ZWRQcm9kdWN0VmlldyA9IGZhbHNlO1xyXG5sZXQgaXNTZWVraW5nID0gZmFsc2U7IC8vIFRoZSBcImxvY2tcIiB0byBwcmV2ZW50IG92ZXItdGF4aW5nIHRoZSBDUFVcclxuLy8uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cclxuLy9FVkVOVFMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cclxubmF2QmFyLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xyXG4gIGNvbnN0IGNsaWNrZWQgPSBlLnRhcmdldC5jbG9zZXN0KFwiLm5hdl9tZW51X2xpbmtcIik7XHJcbiAgaWYgKCFjbGlja2VkKSByZXR1cm47XHJcbiAgLy8gYmxhY2tvdXQuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxuICBpZiAoXCJuYXZNZW51T3BlblwiIGluIG5hdk1lbnUuZGF0YXNldCkgbmF2QnRuLmNsaWNrKCk7XHJcbn0pO1xyXG5tYWluV3JhcC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGUpIHtcclxuICBjb25zdCBjbGlja2VkID0gZS50YXJnZXQuY2xvc2VzdChcIltkYXRhLWNsaWNrLWFjdGlvbl1cIik7XHJcbiAgaWYgKCFjbGlja2VkKSByZXR1cm47XHJcbiAgY29uc3QgZGF0YXNldEFjdGlvbiA9IGNsaWNrZWQuZGF0YXNldC5wcm9kdWN0O1xyXG4gIGlmIChcclxuICAgIGRhdGFzZXRBY3Rpb24gIT09IFwicHJvZHVjdC0xXCIgJiZcclxuICAgIGRhdGFzZXRBY3Rpb24gIT09IFwicHJvZHVjdC0yXCIgJiZcclxuICAgIGRhdGFzZXRBY3Rpb24gIT09IFwicHJvZHVjdC0zXCJcclxuICApXHJcbiAgICByZXR1cm47XHJcbiAgZHJhZ1dyYXAuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICByZXNldERyYWdDb250cm9sKCk7XHJcbiAgYWN0aXZhdGVQcm9kdWN0KGRhdGFzZXRBY3Rpb24pO1xyXG4gIGlmIChhY3RpdmVWaWQucGFyZW50RWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJtcFwiKSkge1xyXG4gICAgbW9iaWxlU2VsZWN0ZWRQcm9kdWN0VmlldyA9IHRydWU7XHJcbiAgICB0b2dnbGVNb2JpbGVQcm9kdWN0T3B0cygpO1xyXG4gIH1cclxufSk7XHJcbmFsbFByb2R1Y3RzQnRucy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAoYWN0aXZlVmlkLnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwibXBcIikpIHtcclxuICAgICAgbW9iaWxlU2VsZWN0ZWRQcm9kdWN0VmlldyA9IGZhbHNlO1xyXG4gICAgICB0b2dnbGVNb2JpbGVQcm9kdWN0T3B0cygpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59KTtcclxuYWxsVmlkcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJlbmRlZFwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgY29uc3QgZW5kZWRWaWQgPSBlLnRhcmdldC5jbG9zZXN0KFwiLnZpZFwiKTtcclxuICAgIGlmIChlbmRlZFZpZC5wYXJlbnRFbGVtZW50LmRhdGFzZXQudmlkVHlwZSAhPT0gXCJyZXZlYWxcIikgcmV0dXJuO1xyXG4gICAgYWN0aXZlUm90YXRlVmlkLnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxuICAgIGFjdGl2ZVZpZCA9IGFjdGl2ZVJvdGF0ZVZpZDtcclxuICAgIGFjdGl2ZVZpZC5sb2FkKCk7XHJcbiAgICBkcmFnV3JhcC5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xyXG4gIH0pO1xyXG59KTtcclxuLy8uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cclxuLy9TQ1JPTEwgU05BUFBJTkdcclxuZnVuY3Rpb24gc3RhcnRBcHAoKSB7XHJcbiAgLy8gQ2hlY2sgZXZlcnkgcG9zc2libGUgZ2xvYmFsIGxvY2F0aW9uIGZvciB0aGUgcGx1Z2luXHJcbiAgY29uc3Qgc3RwID1cclxuICAgIHdpbmRvdy5TY3JvbGxUb1BsdWdpbiB8fFxyXG4gICAgKHdpbmRvdy5nc2FwICYmIHdpbmRvdy5nc2FwLnBsdWdpbnMgJiYgd2luZG93LmdzYXAucGx1Z2lucy5zY3JvbGxUbyk7XHJcblxyXG4gIGlmIChzdHApIHtcclxuICAgIGdzYXAucmVnaXN0ZXJQbHVnaW4oc3RwKTtcclxuICAgIFNjcm9sbFRyaWdnZXIubm9ybWFsaXplU2Nyb2xsKHRydWUpO1xyXG5cclxuICAgIGluaXRTY3JvbGxOZXh0KCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIElmIG5vdCBmb3VuZCB5ZXQsIHdhaXQgNTBtcyBhbmQgdHJ5IGFnYWluXHJcbiAgICBzZXRUaW1lb3V0KHN0YXJ0QXBwLCA1MCk7XHJcbiAgfVxyXG4gIGNvbnN0IG9ic2VydmVyT3B0aW9ucyA9IHtcclxuICAgIHJvb3Q6IG51bGwsIC8vIHVzZSB0aGUgdmlld3BvcnRcclxuICAgIHRocmVzaG9sZDogMC42LCAvLyBmaXJlIHdoZW4gNjAlIG9mIHRoZSBzZWN0aW9uIGlzIHZpc2libGVcclxuICB9O1xyXG5cclxuICBjb25zdCBvYnNlcnZlciA9IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlcigoZW50cmllcykgPT4ge1xyXG4gICAgZW50cmllcy5mb3JFYWNoKChlbnRyeSkgPT4ge1xyXG4gICAgICBpZiAoZW50cnkuaXNJbnRlcnNlY3RpbmcpIHtcclxuICAgICAgICAvLyBPbmx5IG5vdGlmeSBpZiB0aGUgc2Nyb2xsIHdhc24ndCB0cmlnZ2VyZWQgYnkgdGhlIGJ1dHRvbiAodG8gYXZvaWQgZG91YmxlLWZpcmluZylcclxuICAgICAgICBpZiAoIWdzYXAuaXNUd2VlbmluZyh3aW5kb3cpKSB7XHJcbiAgICAgICAgICBzZWN0aW9uUmVhY2hlZChlbnRyeS50YXJnZXQuaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfSwgb2JzZXJ2ZXJPcHRpb25zKTtcclxuICAvLyBUZWxsIHRoZSBvYnNlcnZlciB0byB3YXRjaCBldmVyeSBzZWN0aW9uXHJcbiAgc2VjdGlvbnMuZm9yRWFjaCgoc2VjdGlvbikgPT4gb2JzZXJ2ZXIub2JzZXJ2ZShzZWN0aW9uKSk7XHJcbn1cclxuLy8gU3RhcnQgdGhlIGNoZWNrIGFzIHNvb24gYXMgdGhlIHNjcmlwdCBsb2Fkc1xyXG5zdGFydEFwcCgpO1xyXG4vLy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxyXG4vL1RPVUNIU1RBUlQgSU5JVCwgQU5EIEdTQVAgU0xJREVSIEVWRU5UU1xyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XHJcbiAgZnVuY3Rpb24gdXBkYXRlVmlkZW8oaW5zdGFuY2UpIHtcclxuICAgIC8vIDEuIFNhZmV0eSBjaGVja3M6IEVuc3VyZSB0aGVyZSBpcyBhIHZpZGVvIGFuZCBpdCBoYXMgYSBkdXJhdGlvblxyXG4gICAgaWYgKCFhY3RpdmVWaWQgfHwgIWFjdGl2ZVZpZC5kdXJhdGlvbikgcmV0dXJuO1xyXG4gICAgLy8gMi4gUGVyZm9ybWFuY2UgQ2hlY2s6IElmIHRoZSBwaG9uZSBpcyBzdGlsbCBwcm9jZXNzaW5nIHRoZSBsYXN0IGZyYW1lLCBza2lwIHRoaXMgb25lXHJcbiAgICBpZiAoaXNTZWVraW5nKSByZXR1cm47XHJcbiAgICBpc1NlZWtpbmcgPSB0cnVlOyAvLyBMb2NrXHJcbiAgICAvLyAzLiBTeW5jIHdpdGggdGhlIHNjcmVlbidzIHJlZnJlc2ggcmF0ZVxyXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcclxuICAgICAgbGV0IHByb2dyZXNzID0gaW5zdGFuY2UueCAvIGluc3RhbmNlLm1heFg7XHJcbiAgICAgIC8vIDQuIFVwZGF0ZSB0aGUgdmlkZW8gdGltZVxyXG4gICAgICBhY3RpdmVWaWQuY3VycmVudFRpbWUgPSBwcm9ncmVzcyAqIGFjdGl2ZVZpZC5kdXJhdGlvbjtcclxuICAgICAgaXNTZWVraW5nID0gZmFsc2U7IC8vIFVubG9jayBmb3IgdGhlIG5leHQgZnJhbWVcclxuICAgIH0pO1xyXG4gIH1cclxuICAvL3RvdWNoc3RhcnQgZXZlbnRcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgXCJ0b3VjaHN0YXJ0XCIsXHJcbiAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGFsbFZpZHMuZm9yRWFjaCgodmlkKSA9PiB7XHJcbiAgICAgICAgLy8gUGxheSBmb3IgYSBzcGxpdCBzZWNvbmQgdGhlbiBwYXVzZSB0byBmb3JjZSBhIGJ1ZmZlciBmaWxsXHJcbiAgICAgICAgdmlkXHJcbiAgICAgICAgICAucGxheSgpXHJcbiAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIHZpZC5wYXVzZSgpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgIC8qIEludGVudGlvbmFsIHNpbGVuY2U6IHdlIGFyZSBqdXN0IHdhcm1pbmcgdGhlIGJ1ZmZlciAqL1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHsgb25jZTogdHJ1ZSB9LFxyXG4gICk7IC8vIE9ubHkgcnVucyBvbiB0aGUgdmVyeSBmaXJzdCB0YXBcclxuICBnc2FwLnJlZ2lzdGVyUGx1Z2luKERyYWdnYWJsZSk7XHJcbiAgLy8gQ3JlYXRlIHRoZSBkcmFnZ2FibGUgYW5kIHN0b3JlIGl0IGluIGEgdmFyaWFibGVcclxuICBkcmFnSW5zdGFuY2UgPSBEcmFnZ2FibGUuY3JlYXRlKGRyYWdIYW5kbGUsIHtcclxuICAgIHR5cGU6IFwieFwiLFxyXG4gICAgYm91bmRzOiBkcmFnVHJhY2ssXHJcbiAgICBpbmVydGlhOiB0cnVlLFxyXG4gICAgZWRnZVJlc2lzdGFuY2U6IDEsXHJcbiAgICBvdmVyc2hvb3RUb2xlcmFuY2U6IDAsXHJcbiAgICBvbkRyYWc6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdXBkYXRlVmlkZW8odGhpcyk7XHJcbiAgICB9LFxyXG4gICAgb25UaHJvd1VwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICB1cGRhdGVWaWRlbyh0aGlzKTtcclxuICAgIH0sXHJcbiAgfSlbMF07IC8vIERyYWdnYWJsZS5jcmVhdGUgcmV0dXJucyBhbiBhcnJheTsgd2Ugd2FudCB0aGUgZmlyc3QgaXRlbVxyXG4gIC8vIC0tLSBDTElDSyBUTyBTTkFQIExPR0lDIC0tLVxyXG4gIGlmIChkcmFnVHJhY2spIHtcclxuICAgIGRyYWdUcmFjay5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcclxuICAgICAgLy8gSWdub3JlIGlmIHRoZSB1c2VyIGNsaWNrZWQgdGhlIGRyYWdIYW5kbGUgaXRzZWxmXHJcbiAgICAgIGlmIChlLnRhcmdldCA9PT0gZHJhZ0hhbmRsZSkgcmV0dXJuO1xyXG4gICAgICAvLyBDYWxjdWxhdGUgY2xpY2sgcG9zaXRpb24gcmVsYXRpdmUgdG8gZHJhZ1RyYWNrXHJcbiAgICAgIGNvbnN0IGRyYWdUcmFja1JlY3QgPSBkcmFnVHJhY2suZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgIGNvbnN0IGRyYWdIYW5kbGVXaWR0aCA9IGRyYWdIYW5kbGUub2Zmc2V0V2lkdGg7XHJcbiAgICAgIC8vIENlbnRlciB0aGUgZHJhZ0hhbmRsZSBvbiB0aGUgY2xpY2sgcG9pbnRcclxuICAgICAgbGV0IGNsaWNrWCA9IGUuY2xpZW50WCAtIGRyYWdUcmFja1JlY3QubGVmdCAtIGRyYWdIYW5kbGVXaWR0aCAvIDI7XHJcbiAgICAgIC8vIENsYW1wIGJldHdlZW4gMCBhbmQgbWF4WFxyXG4gICAgICBjb25zdCBmaW5hbFggPSBNYXRoLm1heCgwLCBNYXRoLm1pbihjbGlja1gsIGRyYWdJbnN0YW5jZS5tYXhYKSk7XHJcbiAgICAgIC8vIEFuaW1hdGUgZHJhZ0hhbmRsZSBhbmQgc3luYyB2aWRlb1xyXG4gICAgICBnc2FwLnRvKGRyYWdIYW5kbGUsIHtcclxuICAgICAgICB4OiBmaW5hbFgsXHJcbiAgICAgICAgZHVyYXRpb246IDAuNCxcclxuICAgICAgICBlYXNlOiBcInBvd2VyMi5vdXRcIixcclxuICAgICAgICBvblVwZGF0ZTogKCkgPT4ge1xyXG4gICAgICAgICAgLy8gU3luYyBEcmFnZ2FibGUncyBpbnRlcm5hbCAneCcgZHVyaW5nIGFuaW1hdGlvblxyXG4gICAgICAgICAgZHJhZ0luc3RhbmNlLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgdXBkYXRlVmlkZW8oZHJhZ0luc3RhbmNlKTtcclxuICAgICAgICB9LFxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBpbml0KCk7XHJcbn0pO1xyXG4vLy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxyXG4vL0ZVTkNUSU9OUy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxyXG5mdW5jdGlvbiBpbml0U2Nyb2xsTmV4dCgpIHtcclxuICAvL2ZvciBzY3JvbGwtc25hcHBpbmdcclxuICBjb25zdCBuZXh0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5idG4uc2Nyb2xsLW5leHQtYnRuXCIpO1xyXG4gIGlmICghbmV4dEJ0biB8fCBzZWN0aW9ucy5sZW5ndGggPT09IDApIHJldHVybjtcclxuICBuZXh0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAvLyAxLiBEZXRlcm1pbmUgd2hpY2ggc2VjdGlvbiBpcyBjdXJyZW50bHkgaW4gdmlld1xyXG4gICAgbGV0IGN1cnJlbnRTZWN0aW9uSW5kZXggPSBzZWN0aW9ucy5maW5kSW5kZXgoKHNlY3Rpb24pID0+IHtcclxuICAgICAgY29uc3QgcmVjdCA9IHNlY3Rpb24uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgIC8vIENoZWNrIGlmIHRoZSB0b3Agb2YgdGhlIHNlY3Rpb24gaXMgcm91Z2hseSBhdCB0aGUgdG9wIG9mIHRoZSB2aWV3cG9ydFxyXG4gICAgICByZXR1cm4gcmVjdC50b3AgPj0gLTUwICYmIHJlY3QudG9wIDw9IDUwO1xyXG4gICAgfSk7XHJcbiAgICAvLyAyLiBGaW5kIHRoZSBuZXh0IHNlY3Rpb24gKG9yIGxvb3AgYmFjayB0byB0aGUgZmlyc3QpXHJcbiAgICBsZXQgbmV4dFNlY3Rpb25JbmRleCA9IGN1cnJlbnRTZWN0aW9uSW5kZXggKyAxO1xyXG4gICAgaWYgKG5leHRTZWN0aW9uSW5kZXggPj0gc2VjdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgIG5leHRTZWN0aW9uSW5kZXggPSAwOyAvLyBPcHRpb25hbDogTG9vcCB0byBzdGFydFxyXG4gICAgfVxyXG4gICAgLy8gMy4gR1NBUCBTY3JvbGwgdG8gdGhhdCBzZWN0aW9uXHJcbiAgICBnc2FwLnRvKHdpbmRvdywge1xyXG4gICAgICBkdXJhdGlvbjogMC44LFxyXG4gICAgICBzY3JvbGxUbzogeyB5OiBzZWN0aW9uc1tuZXh0U2VjdGlvbkluZGV4XSwgYXV0b0tpbGw6IGZhbHNlIH0sXHJcbiAgICAgIGVhc2U6IFwicG93ZXIyLmluT3V0XCIsXHJcbiAgICAgIG9uQ29tcGxldGU6ICgpID0+IHtcclxuICAgICAgICAvLyBOb3RpZnkgeW91ciBhcHAgaGVyZVxyXG4gICAgICAgIGNvbnN0IGFjdGl2ZUlkID0gc2VjdGlvbnNbbmV4dFNlY3Rpb25JbmRleF0uaWQ7XHJcbiAgICAgICAgc2VjdGlvblJlYWNoZWQoYWN0aXZlSWQpO1xyXG5cclxuICAgICAgICAvLyBZb3VyIGV4aXN0aW5nIGhhc2ggdXBkYXRlXHJcbiAgICAgICAgaWYgKGFjdGl2ZUlkKSBoaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBudWxsLCBgIyR7YWN0aXZlSWR9YCk7XHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuICB9KTtcclxufVxyXG5mdW5jdGlvbiBzZWN0aW9uUmVhY2hlZChpZCkge1xyXG4gIGFsbE5hdkxpbmtzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICBlbC5xdWVyeVNlbGVjdG9yKFwiLm5hdl9tZW51X2xpbmstYmFyXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgfSk7XHJcbiAgYWN0aXZlTmF2TGluayA9IGFsbE5hdkxpbmtzLmZpbmQoXHJcbiAgICAoZWwpID0+IGVsLnF1ZXJ5U2VsZWN0b3IoXCIubmF2X21lbnVfbGlua1wiKS5pbm5lckhUTUwgPT09IGlkLFxyXG4gICk7XHJcbiAgYWN0aXZlTmF2TGluay5xdWVyeVNlbGVjdG9yKFwiLm5hdl9tZW51X2xpbmstYmFyXCIpLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XHJcbiAgLy8gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgLy8gICBibGFja291dC5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gIC8vIH0sIDI1MCk7XHJcbn1cclxuZnVuY3Rpb24gaW5pdCgpIHtcclxuICBjb25zdCBtb2JpbGVQb3J0cmFpdFF1ZXJ5ID0gd2luZG93Lm1hdGNoTWVkaWEoXCIobWF4LXdpZHRoOiA0NzlweClcIik7XHJcbiAgaWYgKG1vYmlsZVBvcnRyYWl0UXVlcnkubWF0Y2hlcykge1xyXG4gICAgaXNNb2JpbGVQb3J0cmFpdCA9IHRydWU7XHJcbiAgICBhbGxUeHRXcmFwcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGlmIChpc01vYmlsZVBvcnRyYWl0ICE9PSB0cnVlKSB7XHJcbiAgICBzZXRBY3RpdmVWaWREaXYoKTtcclxuICAgIHNldEFjdGl2ZVR4dChcInByb2R1Y3QtMVwiKTtcclxuICAgIHNldEFjdGl2ZVJldmVhbEFuZFJvdGF0ZVZpZHMoXCJwcm9kdWN0LTFcIik7XHJcbiAgICBpZiAoYWN0aXZlVmlkKSBhY3RpdmVWaWQucGxheSgpO1xyXG4gIH1cclxufVxyXG5mdW5jdGlvbiBhY3RpdmF0ZVByb2R1Y3QoZGF0YXNldEFjdGlvbikge1xyXG4gIHNldEFjdGl2ZVR4dChkYXRhc2V0QWN0aW9uKTtcclxuICBzZXRBY3RpdmVWaWREaXYoKTtcclxuICBzZXRBY3RpdmVSZXZlYWxBbmRSb3RhdGVWaWRzKGRhdGFzZXRBY3Rpb24pO1xyXG4gIGFjdGl2ZVZpZC5wbGF5KCk7XHJcbn1cclxuZnVuY3Rpb24gc2V0QWN0aXZlVHh0KGRhdGFzZXRBY3Rpb24pIHtcclxuICBhbGxUeHRXcmFwcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgZWwuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICAgIGlmIChlbC5kYXRhc2V0LnByb2R1Y3QgPT09IGRhdGFzZXRBY3Rpb24pIHtcclxuICAgICAgZWwuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxuICAgICAgYWN0aXZlVHh0V3JhcCA9IGVsO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcbmZ1bmN0aW9uIHNldEFjdGl2ZVZpZERpdigpIHtcclxuICBhbGxWaWREaXZzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gIH0pO1xyXG4gIGlmIChpc01vYmlsZVBvcnRyYWl0KSB7XHJcbiAgICBhY3RpdmVWaWREaXYgPSBhbGxWaWREaXZzLmZpbmQoKGVsKSA9PiBlbC5jbGFzc0xpc3QuY29udGFpbnMoXCJtcFwiKSk7XHJcbiAgfSBlbHNlIGFjdGl2ZVZpZERpdiA9IGFsbFZpZERpdnMuZmluZCgoZWwpID0+ICFlbC5jbGFzc0xpc3QuY29udGFpbnMoXCJtcFwiKSk7XHJcbiAgaWYgKGFjdGl2ZVZpZERpdikgYWN0aXZlVmlkRGl2LmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XHJcbn1cclxuZnVuY3Rpb24gc2V0QWN0aXZlUmV2ZWFsQW5kUm90YXRlVmlkcyhkYXRhc2V0QWN0aW9uKSB7XHJcbiAgaWYgKGFjdGl2ZVZpZERpdikge1xyXG4gICAgYWN0aXZlVmlkRGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudmlkLWNvZGVcIikuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgY29uc3QgdmlkID0gZWwucXVlcnlTZWxlY3RvcihcIi52aWRcIik7XHJcbiAgICAgIGNvbnN0IHNvdXJjZSA9IHZpZC5xdWVyeVNlbGVjdG9yKFwic291cmNlXCIpO1xyXG4gICAgICBpZiAoIXNvdXJjZSkgcmV0dXJuO1xyXG4gICAgICAvLyAxLiBJZiBpdCdzIE5PVCB0aGUgYWN0aXZlIHByb2R1Y3QsIGtpbGwgdGhlIGNvbm5lY3Rpb24gdG8gc2F2ZSBkYXRhXHJcbiAgICAgIGlmIChlbC5kYXRhc2V0LnByb2R1Y3QgIT09IGRhdGFzZXRBY3Rpb24pIHtcclxuICAgICAgICB2aWQucGF1c2UoKTtcclxuICAgICAgICBzb3VyY2Uuc3JjID0gXCJcIjtcclxuICAgICAgICB2aWQubG9hZCgpO1xyXG4gICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIDIuIElmIGl0IElTIHRoZSBhY3RpdmUgcHJvZHVjdCwgbG9hZCB0aGUgZGF0YVxyXG4gICAgICBpZiAoc291cmNlLnNyYyAhPT0gc291cmNlLmRhdGFzZXQuc3JjKSB7XHJcbiAgICAgICAgc291cmNlLnNyYyA9IHNvdXJjZS5kYXRhc2V0LnNyYztcclxuICAgICAgICB2aWQubG9hZCgpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIC0tLSBUSEUgU0VRVUVOQ0UgTE9HSUMgLS0tXHJcbiAgICAgIGlmIChlbC5kYXRhc2V0LnZpZFR5cGUgPT09IFwicmV2ZWFsXCIpIHtcclxuICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpOyAvLyBTSE9XIHRoZSBSZXZlYWwgdmlkZW9cclxuICAgICAgICBhY3RpdmVWaWQgPSB2aWQ7IC8vIFNldCB0aGlzIGFzIHRoZSBvbmUgdG8gLnBsYXkoKSBpbW1lZGlhdGVseVxyXG4gICAgICB9IGVsc2UgaWYgKGVsLmRhdGFzZXQudmlkVHlwZSA9PT0gXCJyb3RhdGVcIikge1xyXG4gICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7IC8vIEhJREUgdGhlIFJvdGF0ZSB2aWRlbyAoZm9yIG5vdylcclxuICAgICAgICBhY3RpdmVSb3RhdGVWaWQgPSB2aWQ7IC8vIFN0b3JlIHJlZmVyZW5jZSBmb3IgdGhlICdlbmRlZCcgaGFuZC1vZmZcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIHJlc2V0RHJhZ0NvbnRyb2woKSB7XHJcbiAgLy8gMS4gUmVzZXQgdGhlIGFjdGl2ZVZpZCBpbW1lZGlhdGVseVxyXG4gIGFjdGl2ZVZpZC5jdXJyZW50VGltZSA9IDA7XHJcbiAgLy8gMi4gQW5pbWF0ZSBkcmFnSGFuZGxlIGJhY2sgdG8gc3RhcnQgKHg6IDApXHJcbiAgZ3NhcC50byhkcmFnSGFuZGxlLCB7XHJcbiAgICB4OiAwLFxyXG4gICAgZHVyYXRpb246IDAuNSxcclxuICAgIGVhc2U6IFwicG93ZXIyLmluT3V0XCIsXHJcbiAgICBvblVwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAvLyAzLiBJTVBPUlRBTlQ6IFRlbGwgRHJhZ2dhYmxlIHRoZSBkcmFnSGFuZGxlIGhhcyBtb3ZlZFxyXG4gICAgICAvLyBkcmFnSW5zdGFuY2Ugc2hvdWxkIGJlIHRoZSB2YXJpYWJsZSB3aGVyZSB5b3Ugc3RvcmVkIERyYWdnYWJsZS5jcmVhdGUoKVxyXG4gICAgICBkcmFnSW5zdGFuY2UudXBkYXRlKCk7XHJcbiAgICB9LFxyXG4gIH0pO1xyXG59XHJcbmZ1bmN0aW9uIHRvZ2dsZU1vYmlsZVByb2R1Y3RPcHRzKCkge1xyXG4gIGJsYWNrb3V0LmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XHJcbiAgaWYgKG1vYmlsZVNlbGVjdGVkUHJvZHVjdFZpZXcpIHtcclxuICAgIC8vIDEuIEZvcmNlIGEgaGVpZ2h0IHRoYXQgU2FmYXJpIGNhbm5vdCBpZ25vcmVcclxuICAgIHR4dEFuZEJ0bnNXcmFwLnN0eWxlLnNldFByb3BlcnR5KFwiaGVpZ2h0XCIsIFwiMjByZW1cIiwgXCJpbXBvcnRhbnRcIik7XHJcbiAgICAvLyAyLiBTdGFuZGFyZCB0b2dnbGVzXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmJ0bnMtZ3JpZFwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gICAgYWN0aXZlVmlkRGl2LmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XHJcbiAgICAvLyAzLiBpUGhvbmUgVmlzaWJpbGl0eSBGaXhlc1xyXG4gICAgYWN0aXZlVHh0V3JhcC5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xyXG4gICAgYWN0aXZlVHh0V3JhcC5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7IC8vIEZvcmNlIHZpc2liaWxpdHlcclxuICAgIGFjdGl2ZVR4dFdyYXAuc3R5bGUub3BhY2l0eSA9IFwiMVwiOyAvLyBGb3JjZSBvcGFjaXR5XHJcbiAgICBhY3RpdmVUeHRXcmFwLnN0eWxlLnpJbmRleCA9IFwiMTBcIjsgLy8gRm9yY2UgdG8gdGhlIGZyb250XHJcbiAgICAvLyA0LiBUaGUgXCJNYWdpY1wiIFJlZmxvdyAoQ3JpdGljYWwgZm9yIGlPUylcclxuICAgIHZvaWQgYWN0aXZlVHh0V3JhcC5vZmZzZXRIZWlnaHQ7XHJcbiAgfSBlbHNlIHtcclxuICAgIHR4dEFuZEJ0bnNXcmFwLnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5idG5zLWdyaWRcIikuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxuICAgIGFjdGl2ZVZpZERpdi5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5kcmFnLXdyYXBcIikuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICAgIGFjdGl2ZVR4dFdyYXAuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICB9XHJcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICBibGFja291dC5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xyXG4gIH0sIDI1MCk7XHJcbn1cclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7QUFFQSxNQUFNLFNBQVMsU0FBUyxjQUFjLGdCQUFnQjtBQUN0RCxNQUFNLFVBQVUsU0FBUyxjQUFjLFdBQVc7QUFDbEQsTUFBTSxTQUFTLFNBQVMsY0FBYyxhQUFhO0FBQ25ELE1BQU0sY0FBYyxDQUFDLEdBQUcsT0FBTyxpQkFBaUIscUJBQXFCLENBQUM7QUFDdEUsTUFBSSxnQkFBZ0IsWUFBWSxDQUFDO0FBQ2pDLE1BQU0sV0FBVyxTQUFTLGNBQWMsZUFBZTtBQUN2RCxNQUFNLFdBQVcsU0FBUyxjQUFjLFdBQVc7QUFDbkQsTUFBTSxpQkFBaUIsU0FBUyxjQUFjLG9CQUFvQjtBQUNsRSxNQUFNLGNBQWMsQ0FBQyxHQUFHLFNBQVMsaUJBQWlCLFdBQVcsQ0FBQztBQUM5RCxNQUFNLGFBQWEsQ0FBQyxHQUFHLFNBQVMsaUJBQWlCLFVBQVUsQ0FBQztBQUM1RCxNQUFNLGFBQWEsQ0FBQyxHQUFHLFNBQVMsaUJBQWlCLFdBQVcsQ0FBQztBQUM3RCxNQUFNLFVBQVUsU0FBUyxpQkFBaUIsTUFBTTtBQUNoRCxNQUFNLGtCQUFrQixTQUFTLGlCQUFpQixlQUFlO0FBQ2pFLE1BQU0sY0FBYyxTQUFTLGNBQWMsb0JBQW9CO0FBQy9ELE1BQUksZUFBZTtBQUNuQixNQUFJLGdCQUFnQjtBQUVwQixNQUFJLFlBQVksU0FBUyxpQkFBaUIsTUFBTSxFQUFFLENBQUM7QUFDbkQsTUFBSSxtQkFBbUI7QUFHdkIsTUFBTSxXQUFXLEtBQUssTUFBTSxRQUFRLFVBQVU7QUFFOUMsTUFBTSxXQUFXLFNBQVMsY0FBYyxZQUFZO0FBQ3BELE1BQU0sWUFBWSxTQUFTLGNBQWMsYUFBYTtBQUN0RCxNQUFNLGFBQWEsU0FBUyxjQUFj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
