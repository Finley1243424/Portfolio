/* ============================================================
   FINLEY IRVINE — PORTFOLIO JS
   ScrollReveal · Theme Toggle · Typewriter · Counters · Nav
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     THEME MANAGEMENT
     ---------------------------------------------------------- */
  function initTheme() {
    // Inline script in <head> already sets data-theme to prevent flash.
    // This just wires up the toggle button.
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;

    const sunIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
    const moonIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

    function updateIcon() {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      toggle.innerHTML = isDark ? sunIcon : moonIcon;
      toggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    }

    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateIcon();
    });

    updateIcon();
  }


  /* ----------------------------------------------------------
     NAVIGATION
     ---------------------------------------------------------- */
  function initNav() {
    const nav = document.querySelector('.site-nav');
    const hamburger = document.querySelector('.nav-hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links a[href^="#"]');

    // Scroll class on nav
    if (nav) {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            nav.classList.toggle('scrolled', window.scrollY > 20);
            ticking = false;
          });
          ticking = true;
        }
      });
    }

    // Hamburger toggle
    if (hamburger && navLinks) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navLinks.classList.toggle('open');
        const isOpen = navLinks.classList.contains('open');
        hamburger.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });
    }

    // Smooth scroll + close mobile nav
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 64;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
        // Close mobile nav
        if (hamburger && navLinks) {
          hamburger.classList.remove('open');
          navLinks.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    });

    // Active section highlighting
    const sections = document.querySelectorAll('section[id]');
    if (sections.length) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
          }
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      sections.forEach(s => observer.observe(s));
    }
  }


  /* ----------------------------------------------------------
     SCROLL REVEAL CONTROLLER
     ---------------------------------------------------------- */
  class ScrollRevealController {
    constructor() {
      this.observer = new IntersectionObserver(
        this.handleIntersect.bind(this),
        { threshold: [0, 0.15], rootMargin: '0px 0px -60px 0px' }
      );

      // Setup stagger indices inside reveal groups
      document.querySelectorAll('[data-reveal-group]').forEach(group => {
        const children = group.querySelectorAll('[data-reveal]');
        children.forEach((child, i) => child.style.setProperty('--i', i));
      });

      // Setup assemble text
      document.querySelectorAll('[data-reveal="assemble"]').forEach(el => {
        this.splitTextIntoSpans(el);
      });

      // Observe all reveal elements
      document.querySelectorAll('[data-reveal]').forEach(el => {
        this.observer.observe(el);
      });

      // Also observe section dividers
      document.querySelectorAll('.section-divider').forEach(el => {
        this.observer.observe(el);
      });

      // Also observe standalone counters (not inside [data-reveal] elements)
      document.querySelectorAll('[data-counter]').forEach(el => {
        if (!el.closest('[data-reveal]')) {
          this.observer.observe(el);
        }
      });
    }

    handleIntersect(entries) {
      entries.forEach(entry => {
        if (entry.intersectionRatio >= 0.15 || entry.isIntersecting) {
          entry.target.classList.add('revealed');

          // Trigger counters
          if (entry.target.hasAttribute('data-counter')) {
            this.animateCounter(entry.target);
          }

          this.observer.unobserve(entry.target);
        }
      });
    }

    splitTextIntoSpans(el) {
      const text = el.textContent;
      el.textContent = '';
      const words = text.split(/(\s+)/);
      words.forEach((word, wi) => {
        if (/^\s+$/.test(word)) {
          el.appendChild(document.createTextNode(word));
          return;
        }
        const chars = word.split('');
        chars.forEach((char, ci) => {
          const span = document.createElement('span');
          span.className = 'assemble-char';
          span.textContent = char;
          const idx = wi * 3 + ci;
          span.style.setProperty('--i', idx);
          // Small pseudo-random scatter
          const sx = ((idx * 7 + 13) % 25) - 12;
          const sy = ((idx * 11 + 3) % 20) - 10;
          span.style.setProperty('--scatter-x', sx + 'px');
          span.style.setProperty('--scatter-y', sy + 'px');
          el.appendChild(span);
        });
      });
    }

    animateCounter(el) {
      const target = parseFloat(el.getAttribute('data-counter'));
      const suffix = el.getAttribute('data-counter-suffix') || '';
      const prefix = el.getAttribute('data-counter-prefix') || '';
      const duration = 1200;
      const start = performance.now();
      const isInt = Number.isInteger(target);

      function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
      }

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutQuart(progress);
        const current = eased * target;
        el.textContent = prefix + (isInt ? Math.round(current).toLocaleString() : current.toFixed(2)) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    }
  }


  /* ----------------------------------------------------------
     TYPEWRITER EFFECT
     ---------------------------------------------------------- */
  function initTypewriter() {
    const el = document.querySelector('[data-typewriter]');
    if (!el) return;

    const text = el.getAttribute('data-typewriter');
    const speed = 40; // ms per character
    const startDelay = 600;

    el.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.textContent = '';
    el.appendChild(cursor);

    // Check reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = text;
      return;
    }

    let i = 0;
    function type() {
      if (i < text.length) {
        el.insertBefore(document.createTextNode(text[i]), cursor);
        i++;
        setTimeout(type, speed);
      }
    }

    setTimeout(type, startDelay);
  }


  /* ----------------------------------------------------------
     PARALLAX (hero only)
     ---------------------------------------------------------- */
  function initParallax() {
    const hero = document.querySelector('.hero-grid');
    if (!hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y < window.innerHeight) {
            hero.style.transform = `translateY(${y * 0.3}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }


  /* ----------------------------------------------------------
     INIT
     ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNav();
    new ScrollRevealController();
    initTypewriter();
    initParallax();
  });

})();
