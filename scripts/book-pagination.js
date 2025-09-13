// ./scripts/book-pagination.js
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const book = document.getElementById('book');
    if (!book) return;

    const pages = Array.from(book.querySelectorAll('.book-page'));
    const total = pages.length;

    let isLocked = false;
    let currentPage = 0; // 0-indexed
    const transitionTime = 800;

    // --- helpers ---
    function clamp(n, min, max) {
      return Math.max(min, Math.min(max, n));
    }

    function setHash(index) {
      const oneBased = index + 1;
      const newHash = `#page-${oneBased}`;
      if (location.hash !== newHash) {
        history.replaceState(null, '', newHash);
      }
    }

    function getIndexFromHash() {
      const m = (location.hash || '').match(/#page-(\d+)/i);
      if (!m) return null;
      const idx = parseInt(m[1], 10) - 1;
      if (Number.isNaN(idx)) return null;
      return clamp(idx, 0, total - 1);
    }

    function showPage(index) {
      pages.forEach((page, i) => {
        if (i === index) {
          page.classList.add('visible');
        } else {
          page.classList.remove('visible');
        }
      });
      updateAllPickers(index);
      setHash(index);
    }

    function goToPage(index) {
      const target = clamp(index, 0, total - 1);
      currentPage = target;
      showPage(currentPage);
    }

    function lockAndRun(fn) {
      if (isLocked) return;
      isLocked = true;
      fn();
      setTimeout(() => (isLocked = false), transitionTime);
    }

    // --- Page Picker UI (appears on every .book-page) ---
    function buildPicker(activeIndex) {
      const wrapper = document.createElement('div');
      wrapper.className = 'page-picker';

      const container = document.createElement('div');
      container.className = 'container inset-0';

      const ul = document.createElement('ul');
      ul.className = 'flex-row pages flex-wrap';

      for (let i = 0; i < total; i++) {
        const li = document.createElement('li');
        li.className = 'page' + (i === activeIndex ? ' active' : '');
        li.textContent = String(i + 1);
        li.setAttribute('data-page-index', String(i));
        ul.appendChild(li);
      }

      container.appendChild(ul);
      wrapper.appendChild(container);

      // Click -> navigate
      wrapper.addEventListener('click', (e) => {
        const li = e.target.closest('.page');
        if (!li) return;
        const idx = parseInt(li.getAttribute('data-page-index') || '', 10);
        if (Number.isNaN(idx)) return;
        if (idx === currentPage) return;
        lockAndRun(() => goToPage(idx));
      });

      return wrapper;
    }

    function ensurePickerOnPage(pageEl, activeIndex) {
      // If author already put a .page-picker in the markup, reuse that shell and rebuild list inside.
      let picker = pageEl.querySelector('.page-picker');
      if (!picker) {
        // inject at the top of the page
        picker = buildPicker(activeIndex);
        pageEl.insertBefore(picker, pageEl.firstChild);
      } else {
        // normalize existing to match our structure
        picker.innerHTML = '';
        const rebuilt = buildPicker(activeIndex);
        // move children from rebuilt into existing picker
        while (rebuilt.firstChild) picker.appendChild(rebuilt.firstChild);
      }
    }

    function mountPickers(activeIndex) {
      pages.forEach((page) => ensurePickerOnPage(page, activeIndex));
    }

    function updateAllPickers(activeIndex) {
      const allPickers = book.querySelectorAll('.page-picker');
      allPickers.forEach((picker) => {
        const items = picker.querySelectorAll('.page');
        items.forEach((li, i) => {
          if (i === activeIndex) {
            li.classList.add('active');
          } else {
            li.classList.remove('active');
          }
        });
      });
    }

    // --- Input: wheel + touch ---
    function handleWheel(e) {
      e.preventDefault();
      if (isLocked) return;
      if (e.deltaY > 10) {
        lockAndRun(() => goToPage(currentPage + 1));
      } else if (e.deltaY < -10) {
        lockAndRun(() => goToPage(currentPage - 1));
      }
    }

    let touchStartY = null;
    function onTouchStart(e) {
      touchStartY = e.changedTouches[0].clientY;
    }
    function onTouchEnd(e) {
      if (touchStartY === null) return;
      if (isLocked) {
        touchStartY = null;
        return;
      }
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;
      if (Math.abs(diff) > 50) {
        lockAndRun(() => {
          if (diff > 0) goToPage(currentPage + 1);
          else goToPage(currentPage - 1);
        });
      }
      touchStartY = null;
    }

    // --- Keyboard (optional but handy) ---
    function onKeyDown(e) {
      if (isLocked) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        lockAndRun(() => goToPage(currentPage + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        lockAndRun(() => goToPage(currentPage - 1));
      } else if (/^\d$/.test(e.key)) {
        // quick jump for 1–9 (if within range)
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= total) {
          e.preventDefault();
          lockAndRun(() => goToPage(num - 1));
        }
      }
    }

    // --- Init ---
    const hashIndex = getIndexFromHash();
    currentPage = hashIndex != null ? hashIndex : 0;

    // Build pickers for every page once
    mountPickers(currentPage);

    // Show the starting page and sync pickers/hash
    showPage(currentPage);

    // Bind inputs
    book.addEventListener('wheel', handleWheel, { passive: false });
    book.addEventListener('touchstart', onTouchStart, { passive: true });
    book.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    // Support direct hash changes (e.g., user edits URL)
    window.addEventListener('hashchange', () => {
      const idx = getIndexFromHash();
      if (idx == null || idx === currentPage) return;
      lockAndRun(() => goToPage(idx));
    });
  });
})();
