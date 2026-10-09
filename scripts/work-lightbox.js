(function () {
  const items = Array.from(document.querySelectorAll('.work-grid .work-card-media'));
  if (!items.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'work-lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Enlarged image');
  overlay.hidden = true;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'work-lightbox-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = '&times;';

  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'work-lightbox-nav work-lightbox-prev';
  prevBtn.setAttribute('aria-label', 'Previous');
  prevBtn.innerHTML = '&#8249;';

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'work-lightbox-nav work-lightbox-next';
  nextBtn.setAttribute('aria-label', 'Next');
  nextBtn.innerHTML = '&#8250;';

  const stage = document.createElement('div');
  stage.className = 'work-lightbox-stage';

  overlay.appendChild(stage);
  overlay.appendChild(prevBtn);
  overlay.appendChild(nextBtn);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);

  let current = -1;
  let opener = null;
  let media = null;

  function fit() {
    if (!media) return;
    const w = media.naturalWidth || media.videoWidth;
    const h = media.naturalHeight || media.videoHeight;
    if (!w || !h) return;
    const cs = getComputedStyle(stage);
    const availW = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const availH = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const scale = Math.min(availW / w, availH / h);
    media.style.width = Math.floor(w * scale) + 'px';
    media.style.height = Math.floor(h * scale) + 'px';
  }

  function render(index) {
    current = (index + items.length) % items.length;
    const src = items[current];
    stage.innerHTML = '';
    if (src.tagName === 'VIDEO') {
      media = document.createElement('video');
      media.autoplay = true;
      media.muted = true;
      media.loop = true;
      media.playsInline = true;
      media.controls = true;
      media.setAttribute('aria-label', src.getAttribute('aria-label') || '');
      media.addEventListener('loadedmetadata', fit);
      media.src = src.currentSrc || src.src;
    } else {
      media = document.createElement('img');
      media.alt = src.alt || '';
      media.addEventListener('load', fit);
      media.src = src.currentSrc || src.src;
    }
    media.className = 'work-lightbox-media';
    stage.appendChild(media);
    if (media.complete) fit();
  }

  function open(index) {
    opener = items[index];
    overlay.hidden = false;
    render(index);
    closeBtn.focus();
  }

  function close() {
    overlay.hidden = true;
    stage.innerHTML = '';
    media = null;
    current = -1;
    if (opener) opener.focus();
  }

  items.forEach((el, i) => {
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.addEventListener('click', () => open(i));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(i);
      }
    });
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => render(current - 1));
  nextBtn.addEventListener('click', () => render(current + 1));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target === stage) close();
  });

  window.addEventListener('resize', () => {
    if (!overlay.hidden) fit();
  });

  document.addEventListener('keydown', (e) => {
    if (overlay.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') render(current + 1);
    else if (e.key === 'ArrowLeft') render(current - 1);
  });
})();
