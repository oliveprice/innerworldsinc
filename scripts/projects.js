(() => {
  if (window.__pieceGrowInit) return;
  window.__pieceGrowInit = true;

  const TARGET_W = 900; // matches your video max-width
  const DUR = 900;
  const EASE = 'cubic-bezier(.2,.8,.2,1)';

  document.addEventListener('click', (e) => {
    const piece = e.target.closest('.piece');
    if (!piece) return;

    // (optional) only one open at a time
    document.querySelectorAll('.piece.open').forEach(p => p !== piece && closeSmooth(p));

    piece.classList.contains('open') ? closeSmooth(piece) : openSmooth(piece);
  });

  // --- NEW: tilt control ---
  function disableTilt(el) {
    // stash any existing inline transform
    if (el.dataset.prevTransform === undefined) {
      el.dataset.prevTransform = el.style.transform || '';
    }
    // hard-stop any tilt, even if your CSS/JS sets it
    el.style.transform = 'none';
    // if you used CSS vars for tilt, zero them too (harmless if unused)
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  }
  function enableTilt(el) {
    // only re-enable when not open
    if (!el.classList.contains('open')) {
      el.style.transform = el.dataset.prevTransform || '';
    }
    delete el.dataset.prevTransform;
    el.style.removeProperty('--rx');
    el.style.removeProperty('--ry');
  }
  // -------------------------

  async function openSmooth(piece) {
    // STOP TILT immediately so the grow isn't angled
    disableTilt(piece);

    const src = piece.dataset.video || piece.getAttribute('data-video');
    if (!src) { console.warn('Missing data-video on clicked .piece'); return; }

    if (!piece.dataset.closedHtml) piece.dataset.closedHtml = piece.innerHTML;

    // 1) lock current size
    const r = piece.getBoundingClientRect();
    piece.style.width  = r.width  + 'px';
    piece.style.height = r.height + 'px';

    // 2) clear header/img right away
    piece.innerHTML = '';

    // 3) compute target size from the video's intrinsic ratio
    const { targetW, targetH } = await measureVideoSize(src, TARGET_W);

    // 4) animate width/height to target
    const prevTransition = piece.style.transition;
    piece.style.transition = `width ${DUR}ms ${EASE}, height ${DUR}ms ${EASE}`;

    const { widthCSS, heightCSS } = toCssContentBox(piece, targetW, targetH);
    requestAnimationFrame(() => {
      piece.style.width  = widthCSS;
      piece.style.height = heightCSS;
    });

    // 5) on finish, mark open + inject video; keep tilt off while open
    const onEnd = (ev) => {
      if (ev.target !== piece || (ev.propertyName !== 'width' && ev.propertyName !== 'height')) return;
      piece.removeEventListener('transitionend', onEnd);

      piece.classList.add('open');
      piece.innerHTML = `
        <video class="teaser" autoplay muted playsinline loop preload="auto">
          <source src="${src}" type="video/mp4">
        </video>
      `;
      piece.style.transition = prevTransition || '';
      // NOTE: we intentionally do NOT re-enable tilt here; open stays flat
    };
    piece.addEventListener('transitionend', onEnd);
  }

  function closeSmooth(piece) {
    // keep it flat during the shrink, too
    disableTilt(piece);

    // 1) lock current (open) size
    const r = piece.getBoundingClientRect();
    piece.style.width  = r.width  + 'px';
    piece.style.height = r.height + 'px';

    // 2) stop/unload video
    const v = piece.querySelector('video');
    if (v) { v.pause(); v.removeAttribute('src'); v.load(); }

    // 3) restore closed DOM
    piece.classList.remove('open');
    if (piece.dataset.closedHtml) piece.innerHTML = piece.dataset.closedHtml;

    // 4) measure natural closed size
    piece.offsetWidth; // reflow
    const targetW = piece.scrollWidth;
    const targetH = piece.scrollHeight;

    const prevTransition = piece.style.transition;
    piece.style.transition = `width ${DUR}ms ${EASE}, height ${DUR}ms ${EASE}`;

    const dims = toCssContentBox(piece, targetW, targetH);
    requestAnimationFrame(() => {
      piece.style.width  = dims.widthCSS;
      piece.style.height = dims.heightCSS;
    });

    const onEnd = (ev) => {
      if (ev.target !== piece || (ev.propertyName !== 'width' && ev.propertyName !== 'height')) return;
      piece.removeEventListener('transitionend', onEnd);
      piece.style.transition = prevTransition || '';
      piece.style.width = '';
      piece.style.height = '';
      // NOW that it's fully closed, bring tilt back
      enableTilt(piece);
    };
    piece.addEventListener('transitionend', onEnd);
  }

  function measureVideoSize(src, targetW) {
    return new Promise((resolve) => {
      const vid = document.createElement('video');
      vid.preload = 'metadata';
      vid.src = src;
      const done = (vw, vh) => {
        const ratio = (vw && vh) ? (vh / vw) : (9 / 16);
        resolve({ targetW, targetH: Math.round(targetW * ratio) });
      };
      vid.addEventListener('loadedmetadata', () => done(vid.videoWidth, vid.videoHeight), { once: true });
      vid.addEventListener('error', () => done(16, 9), { once: true });
      setTimeout(() => done(16, 9), 800); // fallback
    });
  }

  function toCssContentBox(el, contentW, contentH) {
    const cs = getComputedStyle(el);
    const borderBox = cs.boxSizing === 'border-box';
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const padY = parseFloat(cs.paddingTop)  + parseFloat(cs.paddingBottom);
    const borderX = parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
    const borderY = parseFloat(cs.borderTopWidth)  + parseFloat(cs.borderBottomWidth);
    let w = contentW, h = contentH;
    if (borderBox) { w += padX + borderX; h += padY + borderY; }
    return { widthCSS: w + 'px', heightCSS: h + 'px' };
  }
})();