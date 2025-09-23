

let activeTimeouts = [];
let leaveTimeout = null;
let activeContainer = null;

// Known projects -> canonical keys used by projects.html (.piece[data-key])
// Left-hand side should match the VISIBLE NAME on the home page (case-insensitive).
const projectKeyMap = {
  'kody joliet': 'kjp',
  'kody joliet photos': 'kjp',
  'r8r.world': 'r8r.world',
  'scent': 'scent',
  'hiccup tool': 'hiccup-tool',
  'viridian': 'viridian'
};

// ---- LOCKS ----
// Titles that should NOT navigate; they should show the "no access" modal.
const LOCKED_TITLES = new Set([
  'learn through imitation',
  'process life through music'
]);

function isLockedPage(page) {
  return LOCKED_TITLES.has((page?.name || '').trim().toLowerCase());
}


function openAccessGate(msg = "Sorry, but I am still working on this page. You can't see it yet.") {
  const modal = document.getElementById('change-log-modal');
  if (!modal) return; // modal comes from change-log.js on home.html
  const container = modal.querySelector('.commit-container');
  const closeBtn = modal.querySelector('.close-button');

  // stash original content once
  if (container && !container.__originalHTML) {
    container.__originalHTML = container.innerHTML;
  }

  if (container) {
    container.innerHTML = `
      <div class="access-gate" style="padding:1.25rem;">
        <p class="handwritten" style="margin:0 0rem 1rem 0; line-height: 2rem;">${msg}</p>
        <div class="flex-justify-center flex-center-center">
        <img src="../resources/images/angel-girl.png" class="margin-bottom-plus-5">
      </div> </div>`;
  }
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  function restore() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    if (container && container.__originalHTML != null) {
      container.innerHTML = container.__originalHTML;
    }
  }

  // wire close once
  if (!modal.__wired) {
    modal.__wired = true;
    closeBtn?.addEventListener('click', restore);
    modal.addEventListener('click', (e) => { if (e.target === modal) restore(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) restore();
    });
  }

  // focus for a11y
  closeBtn?.focus?.();
}

const chapters = [
  {
    id: 'chapter-1',
    blockImage: './resources/animations/chapter-1/images/img_12.png',
    flowerLottie: './resources/animations/chapter-1/images/img_1.png',
    chapterNumber: '1',
    chapterName: 'Viridian',
    lineImage: './resources/animations/chapter-1/images/img_7.png'
    // no pages -> will use the fallback list defined in createChapterHTML()
  },
  {
    id: 'chapter-2',
    blockImage: './resources/animations/chapter-2/images/img_0.png',
    flowerLottie: './resources/animations/chapter-2/images/img_1.png',
    chapterNumber: '2',
    chapterName: 'BLAH BLAH',
    lineImage: './resources/animations/chapter-2/images/img_7.png',
    pages: [
      // These two are locked (modal instead of navigation)
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
  
      { name: 'power through transmutation', number: '6' }
    ]
  }
];

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

  // EXPANDED FALLBACK: show project names when a chapter doesn't specify pages.
  const pages = data.pages || [
    { name: 'Kody Joliet', number: '1' },
    { name: 'r8r.world',   number: '2' },
    { name: 'Scent',       number: '3' },
    { name: 'Hiccup Tool', number: '4' },
    { name: 'Viridian',    number: '5' } // keep if you want Viridian listed here too
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

  // BLOG: keep original behavior
  if (page.name.toLowerCase() === 'power through transmutation') {
    const link = document.createElement('a');
    link.href = './power-through-transmutation.html';
    link.textContent = page.name;
    link.style.textDecoration = 'none';
    link.style.color = 'inherit';
    chapterText.appendChild(link);
  } else {
    // For everything else, render the plain text…
    chapterText.textContent = page.name;

    // Gate or navigate?
    if (isLockedPage(page)) {
      // Locked: open modal, do NOT navigate
      pageNode.style.cursor = 'pointer';
      pageNode.tabIndex = 0;
      pageNode.setAttribute('role', 'button');

      const open = (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        openAccessGate();
      };

      pageNode.addEventListener('click', open);
      pageNode.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openAccessGate();
        }
      });
    } else {
      // Only known projects get deep-linked
      const key = projectKeyFor(page);
      if (key) {
        makeRowDeepLink(pageNode, key);
      }
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

  flowerAndNumber.appendChild(chapterNumber);

  const flowerImg = document.createElement('img');
  flowerImg.src = './resources/animations/chapter-1/images/img_2.png';
  flowerImg.classList.add('animated-flower');
  flowerImg.style.transform = 'scale(0)';
  flowerImg.style.opacity = '0';
  flowerImg.style.transition = 'transform 0.25s ease-out, opacity 0.25s ease-out';
  flowerAndNumber.appendChild(flowerImg);

  pageNode.appendChild(textAndLine);
  pageNode.appendChild(flowerAndNumber);
  return pageNode;
}

// --- Deep link helpers ---
function projectKeyFor(page) {
  // allow page.key override if you start adding keys directly in the data
  if (page.key) return page.key;
  const label = (page.name || '').toLowerCase().trim();
  // IMPORTANT: only navigate if it's an explicitly known project
  return projectKeyMap[label] || null;
}

function makeRowDeepLink(rowEl, key) {
  rowEl.dataset.openProject = key;
  rowEl.tabIndex = 0;
  rowEl.setAttribute('role', 'link');
  rowEl.style.cursor = 'pointer';

  const go = () => {
    try { sessionStorage.setItem('openProjectKey', key); } catch {}
    const url = new URL('projects.html', location.href);
    url.searchParams.set('open', key);
    location.href = url.toString();
  };

  rowEl.addEventListener('click', (e) => {
    // if anything marks this node as locked in the future, bail
    if (rowEl.dataset.locked === '1') return;
    go();
  });

  rowEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
  });
}

// --- Animation pipeline (UNCHANGED) ---
function setInitialState(container) {
  const pageNodes = container.querySelectorAll('.page-node');
  pageNodes.forEach((node) => {
    const text = node.querySelector('.chapter-text');
    text.style.opacity = '0';
    text.style.transform = 'translateY(10px)';
    node.querySelector('.text-and-line img').style.opacity = '0';
    node.querySelector('.text-and-line img').style.transform = 'translateX(40px)';
    node.querySelector('.chapter-number').style.opacity = '0';
    node.querySelector('.chapter-number').style.transform = 'translateY(10px)';
    node.querySelector('.animated-flower').style.transform = 'scale(0)';
    node.querySelector('.animated-flower').style.opacity = '0';
  });
}

function initChapterReveal(container) {
  const chapterBlock = container.querySelector('.chapter-block-img');

  chapterBlock.style.transform = 'translateX(0)';
  chapterBlock.style.transition = 'transform 0.8s ease';

  setInitialState(container);

  container.addEventListener('pointerenter', () => {
    if (leaveTimeout) {
      clearTimeout(leaveTimeout);
      leaveTimeout = null;
    }
    if (activeContainer === container) return;
    activeContainer = container;
    startChapterSequence(container, chapterBlock);
  });

  container.addEventListener('pointerleave', () => {
    leaveTimeout = setTimeout(() => {
      reversePageNodesInOrder(container);
      slideChapterBlockIn(chapterBlock);
      activeContainer = null;
    }, 600); // delay before reverse starts
  });
}

function startChapterSequence(container, chapterBlock) {
  slideChapterBlockOut(chapterBlock);
  setTimeout(() => {
    revealPageNodesInOrder(container);
  }, 500);
}

function revealPageNodesInOrder(container) {
  const pageNodes = container.querySelectorAll('.page-node');

  pageNodes.forEach((node, i) => {
    activeTimeouts.push(setTimeout(() => {
      revealPageNodeInSequence(node);
    }, i * 500));
  });
}

function revealPageNodeInSequence(node) {
  activeTimeouts.push(setTimeout(() => animateFlower(node), 0));
  activeTimeouts.push(setTimeout(() => animateNumber(node), 150));
  activeTimeouts.push(setTimeout(() => animateLine(node), 300));
  activeTimeouts.push(setTimeout(() => animateText(node), 450));
}

function animateFlower(node) {
  const flower = node.querySelector('.animated-flower');
  if (flower) {
    flower.style.transform = 'scale(1)';
    flower.style.opacity = '1';
  }
}

function animateNumber(node) {
  const number = node.querySelector('.chapter-number');
  if (number) {
    number.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out';
    number.style.opacity = '1';
    number.style.transform = 'translateY(0)';
  }
}

function animateLine(node) {
  const line = node.querySelector('.text-and-line img');
  if (line) {
    line.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out';
    line.style.opacity = '1';
    line.style.transform = 'translateX(0)';
  }
}

function animateText(node) {
  const text = node.querySelector('.chapter-text');
  if (text) {
    text.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out';
    text.style.opacity = '1';
    text.style.transform = 'translateY(0)';
  }
}

function reversePageNodesInOrder(container) {
  activeTimeouts.forEach(timeout => clearTimeout(timeout));
  activeTimeouts = [];

  const pageNodes = Array.from(container.querySelectorAll('.page-node')).reverse();

  pageNodes.forEach((node, i) => {
    activeTimeouts.push(setTimeout(() => {
      reversePageNodeSequence(node);
    }, i * 500));
  });
}

function reversePageNodeSequence(node) {
  activeTimeouts.push(setTimeout(() => reverseText(node), 0));
  activeTimeouts.push(setTimeout(() => reverseLine(node), 150));
  activeTimeouts.push(setTimeout(() => reverseNumber(node), 300));
  activeTimeouts.push(setTimeout(() => reverseFlower(node), 450));
}

function reverseText(node) {
  const text = node.querySelector('.chapter-text');
  if (text) {
    text.style.transition = 'opacity 0.25s ease-in, transform 0.25s ease-in';
    text.style.opacity = '0';
    text.style.transform = 'translateY(10px)';
  }
}

function reverseLine(node) {
  const line = node.querySelector('.text-and-line img');
  if (line) {
    line.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out';
    line.style.opacity = '0';
    line.style.transform = 'translateX(40px)';
  }
}

function reverseNumber(node) {
  const number = node.querySelector('.chapter-number');
  if (number) {
    number.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out';
    number.style.opacity = '0';
    number.style.transform = 'translateY(10px)';
  }
}

function reverseFlower(node) {
  const flower = node.querySelector('.animated-flower');
  if (flower) {
    flower.style.transform = 'scale(0)';
    flower.style.opacity = '0';
  }
}

function slideChapterBlockOut(chapterBlock) {
  chapterBlock.style.transform = 'translateX(-150%)';
}

function slideChapterBlockIn(chapterBlock) {
  chapterBlock.style.transform = 'translateX(0)';
}

// ----- boot -----
chapters.forEach((chapterData) => {
  const chapterEl = createChapterHTML(chapterData);
  document.querySelector('#chapters-wrapper').appendChild(chapterEl);
  initChapterReveal(chapterEl);
});



// ---------- HOVER-STABLE PATCH (keeps your pipeline, fixes race conditions) ----------

const _timers = new WeakMap();         // container -> Set<timeoutId>
const _session = new WeakMap();        // container -> integer session id
let   _active = null;

function _getSet(container){
  let s = _timers.get(container);
  if (!s) { s = new Set(); _timers.set(container, s); }
  return s;
}
function _clearAll(container){
  const set = _getSet(container);
  set.forEach(id => clearTimeout(id));
  set.clear();
}
function _bumpSession(container){
  const n = (_session.get(container) || 0) + 1;
  _session.set(container, n);
  return n;
}
function _currentSession(container){ return _session.get(container) || 0; }
function _schedule(container, fn, delay){
  const mySession = _currentSession(container);
  const id = setTimeout(() => {
    if (_currentSession(container) !== mySession) return; // stale
    fn();
  }, delay);
  _getSet(container).add(id);
  return id;
}

// Hard reset all rows in a chapter to their baseline (your existing function)
function _resetChapter(container){
  setInitialState(container);
  // also stop any CSS transitions mid-flight by forcing computed style
  container.querySelectorAll('.page-node .chapter-text, .page-node .text-and-line img, .page-node .chapter-number, .page-node .animated-flower')
    .forEach(el => { void el.offsetWidth; });
}

// OVERRIDE: initChapterReveal (only wiring changes)
function initChapterReveal(container) {
  const chapterBlock = container.querySelector('.chapter-block-img');

  chapterBlock.style.transform = 'translateX(0)';
  chapterBlock.style.transition = 'transform 0.8s ease';

  // ensure baseline visuals on first paint
  setInitialState(container);

  container.addEventListener('pointerenter', () => {
    // cancel any pending leave for this or other chapters
    _bumpSession(container);
    _clearAll(container);

    if (_active && _active !== container) {
      // instantly restore previously active chapter
      _bumpSession(_active);
      _clearAll(_active);
      _resetChapter(_active);
      slideChapterBlockIn(_active.querySelector('.chapter-block-img'));
    }
    _active = container;

    // before revealing, force a clean baseline every time
    _resetChapter(container);

    slideChapterBlockOut(chapterBlock);
    _schedule(container, () => revealPageNodesInOrder(container), 500);
  });

  container.addEventListener('pointerleave', () => {
    // nuke everything immediately; no grace delay (delays cause races)
    _bumpSession(container);
    _clearAll(container);
    _resetChapter(container);
    slideChapterBlockIn(chapterBlock);
    if (_active === container) _active = null;
  });
}

// OVERRIDE: reveal + reverse queue through the scheduler so they auto-cancel
function revealPageNodesInOrder(container) {
  const pageNodes = container.querySelectorAll('.page-node');
  pageNodes.forEach((node, i) => {
    _schedule(container, () => revealPageNodeInSequence(node), i * 500);
  });
}

function reversePageNodesInOrder(container) {
  // also clear any legacy global timeouts to be safe
  activeTimeouts.forEach(id => clearTimeout(id));
  activeTimeouts = [];

  const pageNodes = Array.from(container.querySelectorAll('.page-node')).reverse();
  pageNodes.forEach((node, i) => {
    _schedule(container, () => reversePageNodeSequence(node), i * 500);
  });
}



// ================= IMMEDIATE-STOP PATCH =================

// per-container queues (from earlier patch)
const __timers = new WeakMap();
const __session = new WeakMap();
function __set(ctn){ let s=__timers.get(ctn); if(!s){s=new Set(); __timers.set(ctn,s);} return s; }
function __clear(ctn){ const s=__set(ctn); s.forEach(id=>clearTimeout(id)); s.clear(); }
function __bump(ctn){ const n=(__session.get(ctn)||0)+1; __session.set(ctn,n); return n; }
function __cur(ctn){ return __session.get(ctn)||0; }
function __schedule(ctn, fn, delay){
  const mine = __cur(ctn);
  const id = setTimeout(()=>{ if(__cur(ctn)!==mine) return; fn(); }, delay);
  __set(ctn).add(id);
  return id;
}

// hard reset without animating back (instant)
function __hardReset(container){
  // kill transitions while we slam baseline
  const els = container.querySelectorAll(
    '.page-node .chapter-text, .page-node .text-and-line img, .page-node .chapter-number, .page-node .animated-flower'
  );
  els.forEach(el => el.style.transition = 'none');

  // your baseline
  setInitialState(container);

  // force reflow so styles stick right now
  // eslint-disable-next-line no-unused-expressions
  container.offsetHeight;

  // allow future animations again
  els.forEach(el => el.style.transition = '');
}

// 1) OVERRIDE startChapterSequence -> session-scoped (no stray 500ms)
function startChapterSequence(container, chapterBlock) {
  slideChapterBlockOut(chapterBlock);
  __schedule(container, () => { revealPageNodesInOrder(container); }, 500);
}

// 2) OVERRIDE initChapterReveal -> instant stop on leave (kills ALL timers)
(function patchInit(){
  const _orig = initChapterReveal;
  initChapterReveal = function(container){
    const chapterBlock = container.querySelector('.chapter-block-img');

    // call original to keep your enter wiring (we'll add our leave behavior)
    _orig(container);


    // Enter: kill any stale timeouts and ensure a clean slate
    container.addEventListener('pointerenter', (ev) => {
      // make sure we own the session
      __bump(container);
      __clear(container);
      try {
        if (Array.isArray(activeTimeouts) && activeTimeouts.length){
          activeTimeouts.forEach(id => clearTimeout(id));
          activeTimeouts.length = 0;
        }
        if (leaveTimeout) { clearTimeout(leaveTimeout); leaveTimeout = null; }
      } catch {}
    }, {capture:true});
    // Remove the original leave listener and replace with immediate stop.
    // Easiest: add a capturing listener that runs first and cancels everything.
    container.addEventListener('pointerleave', (ev) => {
      // cancel any other leave handlers and run first
      if (ev && ev.stopImmediatePropagation) ev.stopImmediatePropagation();
      __bump(container);
__clear(container);

      // also clear any legacy global timeouts used inside revealPageNodeInSequence
      try {
        if (Array.isArray(activeTimeouts) && activeTimeouts.length){
          activeTimeouts.forEach(id => clearTimeout(id));
          activeTimeouts.length = 0;
        }
        if (leaveTimeout) { clearTimeout(leaveTimeout); leaveTimeout = null; }
      } catch {}

      // snap visuals back NOW (no reverse animation)
      __hardReset(container);
      slideChapterBlockIn(chapterBlock);
      if (typeof activeContainer !== 'undefined' && activeContainer === container) {
        activeContainer = null;
      }
    }, { capture: true }); // run before any bubbling handlers that might queue more work
  };
})();

// 3) Make revealPageNodesInOrder also session-scoped (safety)
(function patchReveal(){
  const _origReveal = revealPageNodesInOrder;
  revealPageNodesInOrder = function(container){
    // Clear any stray legacy timeouts before scheduling fresh
    if (Array.isArray(activeTimeouts) && activeTimeouts.length){
      activeTimeouts.forEach(id => clearTimeout(id));
      activeTimeouts.length = 0;
    }
    const nodes = container.querySelectorAll('.page-node');
    nodes.forEach((node, i) => {
      __schedule(container, () => { _origReveal.length; revealPageNodeInSequence(node); }, i * 500);
    });
  };
})();

// 4) Optional: ensure reverse queue also cancels instantly if ever called mid-leave
(function patchReverse(){
  const _origReverse = reversePageNodesInOrder;
  reversePageNodesInOrder = function(container){
    __bump(container); // invalidate any reveals still pending
    __clear(container);
    if (Array.isArray(activeTimeouts) && activeTimeouts.length){
      activeTimeouts.forEach(id => clearTimeout(id));
      activeTimeouts.length = 0;
    }
    _origReverse(container);
  };
})();





// ================= MOBILE TAP TOGGLE =================
// For devices that don't really hover. Doesn't affect desktop.
(function mobileChapterToggle(){
  const isMobileLike = () => window.matchMedia('(hover: none), (pointer: coarse)').matches;

  // Track the currently open chapter (mobile mode only)
  let mobileOpen = null;

  function openMobileChapter(container){
    // Close any other open one first
    if (mobileOpen && mobileOpen !== container) closeMobileChapter(mobileOpen);

    const chapterBlock = container.querySelector('.chapter-block-img');
    // clean slate and own the session
    try { __bump(container); __clear(container); } catch {}
    _resetChapter(container);

    // mark state
    container.dataset.mobileOpen = '1';
    mobileOpen = container;

    // run your reveal pipeline
    slideChapterBlockOut(chapterBlock);
    __schedule(container, () => revealPageNodesInOrder(container), 500);
  }

  function closeMobileChapter(container){
    const chapterBlock = container.querySelector('.chapter-block-img');
    try { __bump(container); __clear(container); } catch {}
    __hardReset(container);                // instant snap-back
    slideChapterBlockIn(chapterBlock);
    delete container.dataset.mobileOpen;
    if (mobileOpen === container) mobileOpen = null;
  }

  function toggleMobileChapter(container){
    if (container.dataset.mobileOpen === '1') {
      closeMobileChapter(container);
    } else {
      openMobileChapter(container);
    }
  }

  // Wire per-chapter handlers
  function enableMobileTap(container){
    const chapterBlock = container.querySelector('.chapter-block-img');
    if (!chapterBlock) return;

    // Tap on the block toggles open/close in mobile mode
    chapterBlock.addEventListener('click', (e) => {
      if (!isMobileLike()) return; // ignore on desktop
      e.preventDefault();
      e.stopPropagation();
      toggleMobileChapter(container);
    });

    // If the user taps INSIDE the open container but on a link, let it navigate.
    // Otherwise do nothing (keeps it open) — outside tap handler (below) will close.

    // Outside tap closes if this container is open
    document.addEventListener('click', (e) => {
      if (!isMobileLike()) return;
      if (container.dataset.mobileOpen === '1') {
        const inside = e.target.closest('.chapter-container') === container;
        if (!inside) closeMobileChapter(container);
      }
    });

    // Also close on ESC (useful for mobile keyboards / a11y)
    document.addEventListener('keydown', (e) => {
      if (!isMobileLike()) return;
      if (e.key === 'Escape' && container.dataset.mobileOpen === '1') {
        closeMobileChapter(container);
      }
    });

    // If viewport mode changes (rotate / attach mouse), ensure clean state
    window.addEventListener('resize', () => {
      if (!isMobileLike() && container.dataset.mobileOpen === '1') {
        closeMobileChapter(container);
      }
    });
  }

  // Hook it up for all chapters you create
  // (Runs alongside your existing boot code)
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.chapter-container').forEach(enableMobileTap);
  });

  // If chapters are injected before DOMContentLoaded (as in your boot),
  // run once now too:
  document.querySelectorAll('.chapter-container').forEach(enableMobileTap);
})();
