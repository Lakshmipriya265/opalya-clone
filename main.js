"use strict";

const ThemeManager = (() => {
  const ROOT    = document.documentElement;
  const STORAGE = "nexus-theme";
  const THEMES  = { light: "light", dark: "dark" };
  function getInitialTheme() {
    const stored = localStorage.getItem(STORAGE);
    if (stored === THEMES.light || stored === THEMES.dark) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? THEMES.dark
      : THEMES.light;
  }
  function applyTheme(theme) {
    ROOT.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE, theme);
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.setAttribute("aria-pressed", String(theme === THEMES.dark));
  }
  function toggle() {
    const current = ROOT.getAttribute("data-theme") || THEMES.light;
    applyTheme(current === THEMES.light ? THEMES.dark : THEMES.light);
  }
  function init() {
    applyTheme(getInitialTheme());
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.addEventListener("click", toggle);
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem(STORAGE)) {
          applyTheme(e.matches ? THEMES.dark : THEMES.light);
        }
      });
  }
  return { init, toggle, applyTheme };
})();
const NavbarManager = (() => {
  const SCROLLED_CLASS  = "navbar--scrolled";
  const OPEN_CLASS      = "is-open";
  const ACTIVE_CLASS    = "is-active";
  const SCROLL_THRESHOLD = 20;

  let navbar    = null;
  let burger    = null;
  let mobileNav = null;
  let navLinks  = [];
  let isOpen    = false;
  function onScroll() {
    if (!navbar) return;
    navbar.classList.toggle(SCROLLED_CLASS, window.scrollY > SCROLL_THRESHOLD);
  }
  function openDrawer() {
    isOpen = true;
    burger.setAttribute("aria-expanded", "true");
    mobileNav.classList.add(OPEN_CLASS);
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    isOpen = false;
    burger.setAttribute("aria-expanded", "false");
    mobileNav.classList.remove(OPEN_CLASS);
    document.body.style.overflow = "";
  }
  function toggleDrawer() {
    isOpen ? closeDrawer() : openDrawer();
  }
  function updateActiveLink() {
    const sections = document.querySelectorAll("section[id]");
    let currentId  = "";
    sections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top;
      if (sectionTop <= 80) currentId = section.id;
    });
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      const match = href && href.slice(1) === currentId;
      link.classList.toggle(ACTIVE_CLASS, match);
    });
  }
  function init() {
    navbar    = document.querySelector(".navbar");
    burger    = document.getElementById("nav-burger");
    mobileNav = document.getElementById("mobile-nav");
    navLinks  = Array.from(document.querySelectorAll(".navbar__link"));
    if (!navbar) return;
    window.addEventListener("scroll", onScroll,          { passive: true });
    window.addEventListener("scroll", updateActiveLink,  { passive: true });
    onScroll();
    if (burger && mobileNav) {
      burger.addEventListener("click", toggleDrawer);
      mobileNav.querySelectorAll(".navbar__mobile-link").forEach((link) => {
        link.addEventListener("click", closeDrawer);
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isOpen) closeDrawer();
      });
      document.addEventListener("click", (e) => {
        if (isOpen && !navbar.contains(e.target) && !mobileNav.contains(e.target)) {
          closeDrawer();
        }
      });
    }
  }
  return { init, closeDrawer };
})();
const ScrollReveal = (() => {
  const VISIBLE_CLASS = "is-visible";
  const SELECTOR      = ".feature-card";
  const OPTIONS = {
    threshold:  0.1,
    rootMargin: "0px 0px -40px 0px",
  };
  function init() {
    const cards = document.querySelectorAll(SELECTOR);
    if (!cards.length) return;
    if (!("IntersectionObserver" in window)) {
      cards.forEach((card) => card.classList.add(VISIBLE_CLASS));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = Number(entry.target.dataset.revealDelay || 0);
          setTimeout(() => {
            entry.target.classList.add(VISIBLE_CLASS);
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, OPTIONS);
    cards.forEach((card, i) => {
      card.dataset.revealDelay = i * 80; 
      observer.observe(card);
    });
  }
  return { init };
})();
const SmoothScroll = (() => {
  const NAV_HEIGHT = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue("--nav-height") || "68",
    10
  );
  function scrollToTarget(targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT - 8;
    window.scrollTo({ top, behavior: "smooth" });
  }
  function init() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const href = anchor.getAttribute("href");
        if (!href || href === "#") return;
        const targetId = href.slice(1);
        const target   = document.getElementById(targetId);
        if (!target) return;
        e.preventDefault();
        NavbarManager.closeDrawer();
        scrollToTarget(targetId);
      });
    });
  }
  return { init };
})();
document.addEventListener("DOMContentLoaded", () => {
  ThemeManager.init();
  NavbarManager.init();
  ScrollReveal.init();
  SmoothScroll.init();
});