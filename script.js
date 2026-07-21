"use strict";

/* AL AMAL — interactions
   FAQ · smooth scroll · testimonials · counters · reveal
   back-to-top · active nav · mobile menu · language dropdown */

/* ---------- FAQ accordion ---------- */
function initFaqAccordion() {
  const items = document.querySelectorAll(".faq-item");
  items.forEach((item) => {
    const q = item.querySelector(".faq-question");
    if (!q) return;
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");
      items.forEach((el) => el.classList.remove("active"));
      if (!isOpen) item.classList.add("active");
    });
  });
}

/* ---------- Smooth scrolling ---------- */
function initSmoothScrolling() {
  const offset = 80;
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
}

/* ---------- Testimonials carousel ---------- */
function initTestimonials() {
  const slides = document.querySelectorAll(".testimonial");
  const dots = document.querySelectorAll(".dot");
  const prev = document.querySelector(".prev-testimonial");
  const next = document.querySelector(".next-testimonial");
  if (slides.length < 2) {
    if (slides.length === 1) slides[0].classList.add("fade-in");
    return;
  }

  let current = 0;
  let timer;

  function show(index) {
    slides.forEach((s) => {
      s.style.display = "none";
      s.classList.remove("fade-in");
    });
    dots.forEach((d) => d.classList.remove("active"));
    slides[index].style.display = "block";
    // force reflow so the fade transition runs
    void slides[index].offsetWidth;
    slides[index].classList.add("fade-in");
    if (dots[index]) dots[index].classList.add("active");
    current = index;
  }

  function start() {
    clearInterval(timer);
    timer = setInterval(() => show((current + 1) % slides.length), 8000);
  }

  slides.forEach((s, i) => (s.style.display = i === 0 ? "block" : "none"));
  show(0);

  if (prev) prev.addEventListener("click", () => { show((current - 1 + slides.length) % slides.length); start(); });
  if (next) next.addEventListener("click", () => { show((current + 1) % slides.length); start(); });
  dots.forEach((dot, i) => dot.addEventListener("click", () => { show(i); start(); }));

  const controls = document.querySelector(".testimonial-controls");
  if (controls) {
    controls.addEventListener("mouseenter", () => clearInterval(timer));
    controls.addEventListener("mouseleave", start);
  }
  start();
}

/* ---------- Animated counters ---------- */
function animateCounter(el) {
  const target = parseInt(el.getAttribute("data-count"), 10);
  if (isNaN(target)) return;
  const duration = 1800;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ---------- Scroll reveal + counters ---------- */
function initScrollAnimations() {
  const revealEls = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    revealEls.forEach((el) => {
      el.classList.add("active");
      el.querySelectorAll(".stat-number").forEach(animateCounter);
    });
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("active");
        entry.target.querySelectorAll(".stat-number").forEach(animateCounter);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -50px 0px" }
  );
  revealEls.forEach((el) => observer.observe(el));
}

/* ---------- Back to top ---------- */
function initBackToTop() {
  const btn = document.querySelector(".back-to-top");
  if (!btn) return;
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      btn.classList.toggle("active", window.pageYOffset > 300);
      ticking = false;
    });
  });
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ---------- Active section in nav ---------- */
function initNavHighlighting() {
  const sections = document.querySelectorAll("section[id]");
  const links = document.querySelectorAll("#nav-menu li a");
  if (!sections.length) return;
  let ticking = false;
  function update() {
    const pos = window.scrollY + 100;
    sections.forEach((section) => {
      const top = section.offsetTop;
      const bottom = top + section.clientHeight;
      const id = section.getAttribute("id");
      if (pos >= top && pos < bottom) {
        links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${id}`));
      }
    });
  }
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  });
  update();
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
  const toggle = document.getElementById("mobile-menu-toggle");
  const nav = document.getElementById("main-nav");
  if (!toggle || !nav) return;

  let overlay = document.querySelector(".menu-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "menu-overlay";
    document.body.appendChild(overlay);
  }

  function open() {
    nav.classList.add("active");
    toggle.classList.add("active");
    overlay.classList.add("active");
    document.body.classList.add("menu-active");
    document.body.style.overflow = "hidden";
  }
  function close() {
    nav.classList.remove("active");
    toggle.classList.remove("active");
    overlay.classList.remove("active");
    document.body.classList.remove("menu-active");
    document.body.style.overflow = "";
  }

  toggle.addEventListener("click", () =>
    nav.classList.contains("active") ? close() : open()
  );
  overlay.addEventListener("click", close);
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("active")) close();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 991) close();
  });

  // Language dropdown: tap to toggle on touch / narrow screens
  document.querySelectorAll(".language-selector .dropbtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const selector = btn.closest(".language-selector");
      if (window.innerWidth <= 991) {
        e.preventDefault();
        selector.classList.toggle("open");
      }
    });
  });
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initFaqAccordion();
  initSmoothScrolling();
  initTestimonials();
  initScrollAnimations();
  initBackToTop();
  initNavHighlighting();
  initMobileMenu();
});
