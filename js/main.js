/* MouseTestHQ — Shared site utilities (theme, nav, cookie banner) */

(function () {
  'use strict';

  // ---- Theme toggle ----
  const THEME_KEY = 'mthq_theme';
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.querySelector('.theme-toggle');
    if (btn) btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
  }
  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    const theme = saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    applyTheme(theme);
    const btn = document.querySelector('.theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'light' ? 'dark' : 'light';
        applyTheme(next);
        try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      });
    }
  }

  // ---- Mobile nav ----
  function initNav() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.primary-nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });

    // Dropdown triggers (click toggles on mobile + for accessibility)
    nav.querySelectorAll('.nav-item').forEach(function (item) {
      const trigger = item.querySelector('.nav-trigger');
      const dropdown = item.querySelector('.nav-dropdown');
      if (!trigger || !dropdown) return;
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = dropdown.classList.toggle('open');
        trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        // Close other open dropdowns
        nav.querySelectorAll('.nav-dropdown.open').forEach(function (other) {
          if (other !== dropdown) {
            other.classList.remove('open');
            const otherTrigger = other.parentElement.querySelector('.nav-trigger');
            if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          }
        });
      });
    });
    // Close dropdowns when clicking outside
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) {
        nav.querySelectorAll('.nav-dropdown.open').forEach(function (d) {
          d.classList.remove('open');
          const t = d.parentElement.querySelector('.nav-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }

  // ---- Cookie banner ----
  const COOKIE_KEY = 'mthq_cookie_consent';
  function initCookieBanner() {
    let consent = null;
    try { consent = localStorage.getItem(COOKIE_KEY); } catch (e) {}
    if (consent) return;
    const banner = document.querySelector('.cookie-banner');
    if (!banner) return;
    banner.classList.add('show');
    banner.querySelectorAll('[data-cookie-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const action = btn.getAttribute('data-cookie-action');
        try { localStorage.setItem(COOKIE_KEY, action); } catch (e) {}
        banner.classList.remove('show');
      });
    });
  }

  // ---- Footer year ----
  function setYear() {
    const el = document.querySelector('[data-year]');
    if (el) el.textContent = new Date().getFullYear();
  }

  // ---- Contact form (client-only success popup) ----
  function initContactForm() {
    const form = document.querySelector('[data-contact-form]');
    const modal = document.getElementById('success-modal');
    if (!form || !modal) return;

    function openModal() {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      const closeBtn = modal.querySelector('[data-modal-close].btn');
      if (closeBtn) closeBtn.focus();
    }
    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // Clear all fields (select, input, textarea) so the user sees their message was "sent"
      form.querySelectorAll('input, textarea, select').forEach(function (el) {
        if (el.type === 'submit' || el.type === 'button') return;
        if (el.tagName === 'SELECT') el.selectedIndex = 0;
        else el.value = '';
      });
      openModal();
    });

    modal.querySelectorAll('[data-modal-close]').forEach(function (btn) {
      btn.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initNav();
    initCookieBanner();
    setYear();
    initContactForm();
  });
})();
