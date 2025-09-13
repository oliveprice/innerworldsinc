// ./scripts/book-mobile.js
(function () {
  'use strict';

  const mq = window.matchMedia('(max-width: 900px)');
  let mobileBuilt = false;

  function stopper(e) {
    // Kill desktop pagination listeners attached elsewhere (wheel/swipe/keys) on mobile
    e.stopImmediatePropagation();
  }

  function buildMobileEssay(book) {
    if (mobileBuilt) return;

    const pages = Array.from(book.querySelectorAll('.book-page'));
    if (pages.length < 2) return;

    // --- Create the new single-column page as page 2 ---
    const mobile = document.createElement('div');
    mobile.className = 'book-page mobile-essay';

    // One big measure.default for the entire essay
    const bigMeasure = document.createElement('div');
    bigMeasure.className = 'measure default mobile-essay-measure';

    // Collect writing blocks from every page after the first
    for (let i = 1; i < pages.length; i++) {
      const blocks = pages[i].querySelectorAll('.measure, .measure-col');
      blocks.forEach((blk) => {
        // Append children of each block, not the wrapper itself
        Array.from(blk.childNodes).forEach((node) => {
          bigMeasure.appendChild(node.cloneNode(true));
        });
      });
    }

    // Append our single measure to the mobile essay page
    mobile.appendChild(bigMeasure);

    // Insert as the new second page (after the title page)
    pages[0].insertAdjacentElement('afterend', mobile);

    // Mark the original content pages (page 2..end) so CSS can hide them on mobile
    pages.slice(1).forEach((p) => p.classList.add('hidden-mobile-original'));

    mobileBuilt = true;
  }

  function setupMobile() {
    const book = document.getElementById('book');
    if (!book) return;

    // Stop desktop pagination handlers without changing that code
    ['wheel', 'touchstart', 'touchend'].forEach((t) =>
      book.addEventListener(t, stopper, { capture: true, passive: true })
    );
    window.addEventListener('keydown', stopper, { capture: true });

    buildMobileEssay(book);
  }

  function teardownMobile() {
    const book = document.getElementById('book');
    if (!book) return;

    // Remove the mobile page and unhide originals
    const mobile = book.querySelector('.book-page.mobile-essay');
    if (mobile) mobile.remove();
    book.querySelectorAll('.hidden-mobile-original')
        .forEach((el) => el.classList.remove('hidden-mobile-original'));

    // Remove our capture-stoppers
    ['wheel', 'touchstart', 'touchend'].forEach((t) =>
      book.removeEventListener(t, stopper, { capture: true })
    );
    window.removeEventListener('keydown', stopper, { capture: true });

    mobileBuilt = false;
  }

  function applyMode() {
    if (mq.matches) setupMobile();
    else teardownMobile();
  }

  document.addEventListener('DOMContentLoaded', applyMode);
  mq.addEventListener('change', applyMode);
})();
