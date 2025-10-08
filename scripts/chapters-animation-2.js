// ========================= STATE =========================
let activeTimeouts = [];
let leaveTimeout = null;
let activeContainer = null;

// map visible names -> project keys
const projectKeyMap = {
  'viridian': 'viridian',
  'kody joliet': 'kjp',
  'kody joliet photos': 'kjp',
  'r8r.world': 'r8r.world',
  'scent': 'scent',
  'hiccup tool': 'hiccup-tool'
};

const LOCKED_TITLES = new Set([
  'learn through imitation',
  'process life through music'
]);

function isLockedPage(page) {
  return LOCKED_TITLES.has((page?.name || '').trim().toLowerCase());
}

// ========================= ACCESS GATE =========================
function openAccessGate(msg = "Sorry, but I am still working on this page. You can't see it yet.") {
  const modal = document.getElementById('change-log-modal');
  if (!modal) return;
  const container = modal.querySelector('.commit-container');
  const closeBtn = modal.querySelector('.close-button');

  if (container && !container.__originalHTML) {
    container.__originalHTML = container.innerHTML;
  }

  if (container) {
    container.classList.add('no-scroll');
    container.innerHTML = `
      <div class="access-gate" style="padding:1.25rem;">
        <p class="handwritten">${msg}</p>
        <div class="flex-justify-center flex-center-center">
          <img src="../resources/images/angel-girl.png">
        </div>
      </div>`;
  }

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  function restore() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    if (container) {
      container.classList.remove('no-scroll');
      if (container.__originalHTML != null) container.innerHTML = container.__originalHTML;
    }
  }

  if (!modal.__wired) {
    modal.__wired = true;
    closeBtn?.addEventListener('click', restore);
    modal.addEventListener('click', (e) => { if (e.target === modal) restore(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) restore();
    });
  }

  closeBtn?.focus?.();
}

// Optional: specific series modal wrapper (uses access gate for now)
function openSeriesModal() {
  openAccessGate("Sorry, but I'm still working on this page. You can't see it yet.");
}

// ========================= DATA =========================
const chapters = [
  {
    id: 'chapter-1',
    blockImage: './resources/animations/chapter-1/images/img_12.png',
    flowerLottie: './resources/animations/chapter-1/images/img_1.png',
    chapterNumber: '1',
    chapterName: 'Viridian',
    lineImage: './resources/animations/chapter-1/images/img_7.png'
  },
  {
    id: 'chapter-2',
    blockImage: './resources/animations/chapter-2/images/img_0.png',
    flowerLottie: './resources/animations/chapter-2/images/img_1.png',
    chapterNumber: '2',
    chapterName: 'BLAH BLAH',
    lineImage: './resources/animations/chapter-2/images/img_7.png',
    pages: [
      { name: 'Learn Through Imitation', number: '4' },
      { name: 'Process Life Through Music', number: '5' }
    ]
  },
  {
    id: 'chapter-3',
    blockImage: './resources/animations/chapter-3/images/img_0.png',
    flowerLottie: './resources/animations/chapter-3/images/img_1.png',
    chapterNumber: '3',
    chapterName: 'DEEP THOUGHT',
    lineImage: './resources/animations/chapter-3/images/img_7.png',
    pages: [
      { name: 'Power Through Transmutation', number: '6' }
    ]
  }
];

// ========================= MOBILE DIRECT NAV (tap whole card) =========================
// MOBILE ONLY routes for each chapter container (by id).
const MOBILE_ROUTES = {
  // projects page
  'chapter-1': { kind: 'url', href: './projects.html' },
  // series modal
  'chapter-2': { kind: 'modal', fn: openSeriesModal },
  // blog root
  'chapter-3': { kind: 'url', href: './power-through-transmutation.html' },
};

// ========================= DOM BUILDERS =========================
function buildProjectURL(key){
  const url = new URL('projects.html', location.href);
  url.searchParams.set('open', key);
  return url.toString();
}

function createChapterHTML(data) {
  const container = document.createElement('div');
  container.classList.add('chapter-container');
  container.id = data.id;

  const stack = document.createElement('div');
  stack.classList.add('chapter-reveal-stack');

  const blockImg = document.createElement('img');
  blockImg.classList.add('chapter-block-img');
  blockImg.src = data.blockImage;
  blockImg.alt = 'Chapter Block';

  const flexColumn = document.createElement('div');
  flexColumn.classList.add('flex-column-special', 'gap-0');

  const pages = data.pages || [
    { name: 'Viridian',    number: '1' },
    { name: 'Kody Joliet', number: '2' },
    { name: 'r8r.world',   number: '3' },
    { name: 'Scent',       number: '4' },
    { name: 'Hiccup Tool', number: '5' },
  ];

  pages.forEach((page, index) => {
    const pageNode = createPageNode(page, index);
    flexColumn.appendChild(pageNode);
  });

  stack.appendChild(blockImg);
  stack.appendChild(flexColumn);
  container.appendChild(stack);
  return container;
}

function createPageNode(page, index) {
  const pageNode = document.createElement('div');
  pageNode.classList.add('page-node');

  const textAndLine = document.createElement('div');
  textAndLine.classList.add('text-and-line');

  const chapterText = document.createElement('p');
  chapterText.classList.add('chapter-text');

  if (isLockedPage(page)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = page.name;
    btn.style.all = 'unset';
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', (e) => { e.preventDefault(); openAccessGate(); });
    chapterText.appendChild(btn);
  } else if ((page.name || '').toLowerCase() === 'power through transmutation') {
    const a = document.createElement('a');
    a.href = './power-through-transmutation.html';
    a.textContent = page.name;
    a.style.textDecoration = 'none';
    a.style.color = 'inherit';
    a.rel = 'noopener';
    chapterText.appendChild(a);
  } else {
    const key = projectKeyFor(page);
    const label = page.name || '';
    if (key) {
      const a = document.createElement('a');
      a.href = buildProjectURL(key);
      a.textContent = label;
      a.style.textDecoration = 'none';
      a.style.color = 'inherit';
      a.rel = 'noopener';
      a.className = 'project-link';
      chapterText.appendChild(a);
    } else {
      chapterText.textContent = label;
    }
  }

  const lineImg = document.createElement('img');
  lineImg.src = './resources/animations/chapter-1/images/img_1.png';

  textAndLine.appendChild(chapterText);
  textAndLine.appendChild(lineImg);

  const flowerAndNumber = document.createElement('div');
  flowerAndNumber.classList.add('flower-and-number');

  const chapterNumber = document.createElement('p');
  chapterNumber.classList.add('chapter-number');
  chapterNumber.textContent = page.number;

  const flowerImg = document.createElement('img');
  flowerImg.src = './resources/animations/chapter-1/images/img_2.png';
  flowerImg.classList.add('animated-flower');
  flowerImg.style.transform = 'scale(0)';
  flowerImg.style.opacity = '0';
  flowerImg.style.transition = 'transform 0.25s ease-out, opacity 0.25s ease-out';

  flowerAndNumber.appendChild(chapterNumber);
  flowerAndNumber.appendChild(flowerImg);

  pageNode.appendChild(textAndLine);
  pageNode.appendChild(flowerAndNumber);
  return pageNode;
}

// ========================= NAV HELPERS =========================
function projectKeyFor(page) {
  if (page.key) return page.key;
  const label = (page.name || '').toLowerCase().trim();
  return projectKeyMap[label] || null;
}

function makeRowDeepLink(rowEl, key) {
  // no-op: links are now rendered directly as <a> in createPageNode
}

// ========================= ANIMATION PIPELINE =========================
function setInitialState(container) {
  const pageNodes = container.querySelectorAll('.page-node');
  pageNodes.forEach((node) => {
    const text = node.querySelector('.chapter-text');
    text.style.opacity = '0';
    text.style.transform = 'translateY(10px)';

    const img = node.querySelector('.text-and-line img');
    img.style.opacity = '0';
    img.style.transform = 'translateX(40px)';

    const num = node.querySelector('.chapter-number');
    num.style.opacity = '0';
    num.style.transform = 'translateY(10px)';

    const flower = node.querySelector('.animated-flower');
    flower.style.transform = 'scale(0)';
    flower.style.opacity = '0';
  });
}

function animateFlower(node) {
  const flower = node.querySelector('.animated-flower');
  if (!flower) return;
  flower.style.transform = 'scale(1)';
  flower.style.opacity = '1';
}

function animateNumber(node) {
  const number = node.querySelector('.chapter-number');
  if (!number) return;
  number.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out';
  number.style.opacity = '1';
  number.style.transform = 'translateY(0)';
}

function animateLine(node) {
  const line = node.querySelector('.text-and-line img');
  if (!line) return;
  line.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out';
  line.style.opacity = '1';
  line.style.transform = 'translateX(0)';
}

function animateText(node) {
  const text = node.querySelector('.chapter-text');
  if (!text) return;
  text.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out';
  text.style.opacity = '1';
  text.style.transform = 'translateY(0)';
}

function revealPageNodeInSequence(node) {
  activeTimeouts.push(setTimeout(() => animateFlower(node), 0));
  activeTimeouts.push(setTimeout(() => animateNumber(node), 150));
  activeTimeouts.push(setTimeout(() => animateLine(node), 300));
  activeTimeouts.push(setTimeout(() => animateText(node), 450));
}

// >>> guaranteed visibility helper (used on mobile + as desktop fallback)
function forceRevealNow(container){
  const nodes = container.querySelectorAll('.page-node');

  const els = container.querySelectorAll(
    '.page-node .chapter-text, .page-node .text-and-line img, .page-node .chapter-number, .page-node .animated-flower'
  );
  els.forEach(el => el.__oldTransition = el.style.transition || '');
  els.forEach(el => { el.style.transition = 'none'; });

  nodes.forEach((node) => {
    const text = node.querySelector('.chapter-text');
    if (text) { text.style.opacity = '1'; text.style.transform = 'translateY(0)'; }
    const line = node.querySelector('.text-and-line img');
    if (line) { line.style.opacity = '1'; line.style.transform = 'translateX(0)'; }
    const number = node.querySelector('.chapter-number');
    if (number) { number.style.opacity = '1'; number.style.transform = 'translateY(0)'; }
    const flower = node.querySelector('.animated-flower');
    if (flower) { flower.style.opacity = '1'; flower.style.transform = 'scale(1)'; }
  });

  const column = container.querySelector('.flex-column-special');
  if (!column) return;

  const oldColTransition = column.style.transition || '';
  column.style.willChange = 'opacity, transform';
  column.style.transition = 'none';
  column.style.opacity = '0';
  column.style.transform = 'translateY(0)';
  column.offsetHeight;

  requestAnimationFrame(() => {
    column.style.transition = 'opacity 220ms ease';
    column.style.opacity = '1';
    setTimeout(() => {
      column.style.transition = oldColTransition;
      els.forEach(el => { el.style.transition = el.__oldTransition; delete el.__oldTransition; });
      column.style.willChange = '';
    }, 260);
  });
}

function reverseText(node) {
  const text = node.querySelector('.chapter-text');
  if (!text) return;
  text.style.transition = 'opacity 0.25s ease-in, transform 0.25s ease-in';
  text.style.opacity = '0';
  text.style.transform = 'translateY(10px)';
}
function reverseLine(node) {
  const line = node.querySelector('.text-and-line img');
  if (!line) return;
  line.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out';
  line.style.opacity = '0';
  line.style.transform = 'translateX(40px)';
}
function reverseNumber(node) {
  const number = node.querySelector('.chapter-number');
  if (!number) return;
  number.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out';
  number.style.opacity = '0';
  number.style.transform = 'translateY(10px)';
}
function reverseFlower(node) {
  const flower = node.querySelector('.animated-flower');
  if (!flower) return;
  flower.style.transform = 'scale(0)';
  flower.style.opacity = '0';
}

function slideChapterBlockOut(chapterBlock) {
  chapterBlock.style.transform = 'translateX(-150%)';
}
function slideChapterBlockIn(chapterBlock) {
  chapterBlock.style.transform = 'translateX(0)';
}

// ========================= QUEUE + SESSIONS (STABLE HOVER) =========================
const _timers = new WeakMap();
const _session = new WeakMap();
let   _active = null;

function _getSet(container){ let s = _timers.get(container); if (!s){ s=new Set(); _timers.set(container,s);} return s; }
function _clearAll(container){ const set=_getSet(container); set.forEach(id=>clearTimeout(id)); set.clear(); }
function _bumpSession(container){ const n = (_session.get(container)||0)+1; _session.set(container, n); return n; }
function _currentSession(container){ return _session.get(container)||0; }
function _schedule(container, fn, delay){
  const mySession = _currentSession(container);
  const id = setTimeout(()=>{ if (_currentSession(container)!==mySession) return; fn(); }, delay);
  _getSet(container).add(id);
  return id;
}
function _resetChapter(container){
  setInitialState(container);
  container.querySelectorAll('.page-node .chapter-text, .page-node .text-and-line img, .page-node .chapter-number, .page-node .animated-flower')
    .forEach(el => { void el.offsetWidth; });
}

// ========================= INIT (HOVER) =========================
function revealPageNodesInOrder(container) {
  const pageNodes = container.querySelectorAll('.page-node');
  pageNodes.forEach((node, i) => _schedule(container, () => revealPageNodeInSequence(node), i * 500));
}

function reversePageNodesInOrder(container) {
  activeTimeouts.forEach(id => clearTimeout(id));
  activeTimeouts = [];
  const pageNodes = Array.from(container.querySelectorAll('.page-node')).reverse();
  pageNodes.forEach((node, i) => _schedule(container, () => {
    reverseText(node); reverseLine(node); reverseNumber(node); reverseFlower(node);
  }, i * 500));
}

function startChapterSequence(container, chapterBlock) {
  slideChapterBlockOut(chapterBlock);
  _schedule(container, () => { forceRevealNow(container); }, 120);
}

function initChapterReveal(container) {
  const chapterBlock = container.querySelector('.chapter-block-img');
  chapterBlock.style.transform = 'translateX(0)';
  chapterBlock.style.transition = 'transform 0.8s ease';
  setInitialState(container);

  container.addEventListener('pointerenter', () => {
    _bumpSession(container); _clearAll(container);
    if (_active && _active !== container) {
      _bumpSession(_active); _clearAll(_active); _resetChapter(_active);
      slideChapterBlockIn(_active.querySelector('.chapter-block-img'));
    }
    _active = container;
    _resetChapter(container);
    startChapterSequence(container, chapterBlock);
  });

  container.addEventListener('pointerleave', () => {
    if (container.dataset.mobileOpen === '1') return;
    _bumpSession(container); _clearAll(container);
    _resetChapter(container);
    slideChapterBlockIn(chapterBlock);
    if (_active === container) _active = null;
  });
}

// ========================= MOBILE DETECTION =========================
window.FORCE_MOBILE = window.FORCE_MOBILE ?? false;
const isMobileLike = () =>
  window.FORCE_MOBILE ||
  matchMedia('(any-pointer: coarse)').matches ||
  matchMedia('(hover: none)').matches;

let mobileOpen = null;

function __set(ctn){ let s=__timers.get(ctn); if(!s){s=new Set(); __timers.set(ctn,s);} return s; }
function __clear(ctn){ const s=__set(ctn); s.forEach(id=>clearTimeout(id)); s.clear(); }
function __bump(ctn){ const n=(__session.get(ctn)||0)+1; __session.set(ctn,n); return n; }
function __cur(ctn){ return __session.get(ctn)||0; }
function __schedule(ctn, fn, delay){ const mine=__cur(ctn); const id=setTimeout(()=>{ if(__cur(ctn)!==mine) return; fn(); }, delay); __set(ctn).add(id); return id; }

function __hardReset(container){
  const els = container.querySelectorAll('.page-node .chapter-text, .page-node .text-and-line img, .page-node .chapter-number, .page-node .animated-flower');
  els.forEach(el => el.style.transition = 'none');
  setInitialState(container);
  container.offsetHeight;
  els.forEach(el => el.style.transition = '');
}

function setCoverInteractivity(container, enabled){
  const block = container.querySelector('.chapter-block-img');
  if (!block) return;
  block.style.pointerEvents = enabled ? 'auto' : 'none';
}

// ========================= MOBILE: DIRECT NAV ON CARD TAP =========================
function enableMobileContainerDirectNav(container){
  if (!isMobileLike()) return;

  const route = MOBILE_ROUTES[container.id];
  if (!route) return;

  container.dataset.mobileDirectNav = '1';
  try { container.style.touchAction = 'manipulation'; } catch {}

  const go = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (route.kind === 'url' && route.href) {
      window.location.assign(route.href);
    } else if (route.kind === 'modal' && typeof route.fn === 'function') {
      route.fn();
    }
  };

  // Single-tap, no zoom, no double-tap requirement
  container.addEventListener('touchend', go, { passive: false });
  container.addEventListener('click', go);
}

// ========================= MOBILE: REVEAL TOGGLE (only if NOT direct-nav) =========================
function openMobileChapter(container){
  if (mobileOpen && mobileOpen !== container) closeMobileChapter(mobileOpen);
  const chapterBlock = container.querySelector('.chapter-block-img');

  container.dataset.mobileOpen = '1';
  mobileOpen = container;

  slideChapterBlockOut(chapterBlock);
  setCoverInteractivity(container, false);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      forceRevealNow(container);
    });
  });

  setTimeout(() => { forceRevealNow(container); }, 400);
}

function closeMobileChapter(container){
  const chapterBlock = container.querySelector('.chapter-block-img');
  try { __bump(container); __clear(container); } catch {}
  __hardReset(container);
  slideChapterBlockIn(chapterBlock);
  setCoverInteractivity(container, true);
  delete container.dataset.mobileOpen;
  if (mobileOpen === container) mobileOpen = null;
}

function toggleMobileChapter(container){
  if (container.dataset.mobileOpen === '1') closeMobileChapter(container);
  else openMobileChapter(container);
}

function onTap(handler){
  let fired = false;
  return (e) => { if (fired) return; fired = true; handler(e); setTimeout(()=>fired=false,0); };
}

function enableMobileTap(container){
  if (container.dataset.mobileDirectNav === '1') return; // direct-nav wins on mobile

  const block = container.querySelector('.chapter-block-img');
  if (!block) return;

  block.addEventListener('touchend', onTap((e)=>{
    if (!isMobileLike()) return;
    e.preventDefault(); e.stopPropagation();
    toggleMobileChapter(container);
  }), {passive:false});

  block.addEventListener('click', (e)=>{
    if (!isMobileLike()) return;
    e.preventDefault(); e.stopPropagation();
    toggleMobileChapter(container);
  });
}

// single outside click closer (for reveal flow)
document.addEventListener('click', (e) => {
  if (!isMobileLike() || !mobileOpen) return;
  if (!e.target.closest('.chapter-container')) closeMobileChapter(mobileOpen);
});

window.addEventListener('resize', () => {
  if (!isMobileLike() && mobileOpen) closeMobileChapter(mobileOpen);
});

// ========================= BOOT =========================
(function boot(){
  const wrapper = document.querySelector('#chapters-wrapper');
  if (!wrapper) { console.error('#chapters-wrapper not found'); return; }

  chapters.forEach((chapterData) => {
    const chapterEl = createChapterHTML(chapterData);
    wrapper.appendChild(chapterEl);

    // Desktop behavior unchanged
    initChapterReveal(chapterEl);

    // Mobile: tap whole card to go (per mapping)
    enableMobileContainerDirectNav(chapterEl);

    // If no direct route configured, fall back to mobile toggle
    enableMobileTap(chapterEl);
  });
})();
