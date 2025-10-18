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
  'music posters',
  'book posters'
]);

function isLockedPage(page) {
  return LOCKED_TITLES.has((page?.name || '').trim().toLowerCase());
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
      { name: 'Music Posters', number: '6' },
      { name: 'Book Posters', number: '7' }
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
      { name: 'Power Through Transmutation', number: '8' }
    ]
  }
];

// ========================= MOBILE DIRECT NAV =========================
const MOBILE_ROUTES = {
  'chapter-1': { kind: 'url', href: './projects.html' },
  'chapter-2': { kind: 'url', href: './series.html' },
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

  // Locked pages → go to series.html
  if (isLockedPage(page)) {
    const a = document.createElement('a');
    a.href = './series.html';
    a.textContent = page.name;
    a.style.textDecoration = 'none';
    a.style.color = 'inherit';
    a.rel = 'noopener';
    chapterText.appendChild(a);
  } 
  else if ((page.name || '').toLowerCase() === 'power through transmutation') {
    const a = document.createElement('a');
    a.href = './power-through-transmutation.html';
    a.textContent = page.name;
    a.style.textDecoration = 'none';
    a.style.color = 'inherit';
    a.rel = 'noopener';
    chapterText.appendChild(a);
  } 
  else {
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

function makeRowDeepLink(rowEl, key) {}

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

function animateFlower(node){ const f=node.querySelector('.animated-flower'); if(!f)return; f.style.transform='scale(1)'; f.style.opacity='1'; }
function animateNumber(node){ const n=node.querySelector('.chapter-number'); if(!n)return; n.style.transition='opacity 0.25s ease-out, transform 0.25s ease-out'; n.style.opacity='1'; n.style.transform='translateY(0)'; }
function animateLine(node){ const l=node.querySelector('.text-and-line img'); if(!l)return; l.style.transition='opacity 0.25s ease-out, transform 0.25s ease-out'; l.style.opacity='1'; l.style.transform='translateX(0)'; }
function animateText(node){ const t=node.querySelector('.chapter-text'); if(!t)return; t.style.transition='opacity 0.25s ease-out, transform 0.25s ease-out'; t.style.opacity='1'; t.style.transform='translateY(0)'; }
function revealPageNodeInSequence(node){ activeTimeouts.push(setTimeout(()=>animateFlower(node),0)); activeTimeouts.push(setTimeout(()=>animateNumber(node),150)); activeTimeouts.push(setTimeout(()=>animateLine(node),300)); activeTimeouts.push(setTimeout(()=>animateText(node),450)); }

function forceRevealNow(container){
  const nodes = container.querySelectorAll('.page-node');
  const els = container.querySelectorAll('.page-node .chapter-text, .page-node .text-and-line img, .page-node .chapter-number, .page-node .animated-flower');
  els.forEach(el => el.__oldTransition = el.style.transition || '');
  els.forEach(el => { el.style.transition = 'none'; });
  nodes.forEach((node) => {
    const text = node.querySelector('.chapter-text'); if (text) { text.style.opacity = '1'; text.style.transform = 'translateY(0)'; }
    const line = node.querySelector('.text-and-line img'); if (line) { line.style.opacity = '1'; line.style.transform = 'translateX(0)'; }
    const number = node.querySelector('.chapter-number'); if (number) { number.style.opacity = '1'; number.style.transform = 'translateY(0)'; }
    const flower = node.querySelector('.animated-flower'); if (flower) { flower.style.opacity = '1'; flower.style.transform = 'scale(1)'; }
  });
  const column = container.querySelector('.flex-column-special'); if (!column) return;
  const oldColTransition = column.style.transition || '';
  column.style.willChange = 'opacity, transform'; column.style.transition = 'none'; column.style.opacity = '0'; column.style.transform = 'translateY(0)'; column.offsetHeight;
  requestAnimationFrame(() => { column.style.transition = 'opacity 220ms ease'; column.style.opacity = '1';
    setTimeout(() => { column.style.transition = oldColTransition; els.forEach(el => { el.style.transition = el.__oldTransition; delete el.__oldTransition; }); column.style.willChange = ''; }, 260);
  });
}

function reverseText(n){const t=n.querySelector('.chapter-text');if(!t)return;t.style.transition='opacity 0.25s ease-in, transform 0.25s ease-in';t.style.opacity='0';t.style.transform='translateY(10px)';}
function reverseLine(n){const l=n.querySelector('.text-and-line img');if(!l)return;l.style.transition='opacity 0.25s ease-out, transform 0.25s ease-out';l.style.opacity='0';l.style.transform='translateX(40px)';}
function reverseNumber(n){const m=n.querySelector('.chapter-number');if(!m)return;m.style.transition='opacity 0.25s ease-out, transform 0.25s ease-out';m.style.opacity='0';m.style.transform='translateY(10px)';}
function reverseFlower(n){const f=n.querySelector('.animated-flower');if(!f)return;f.style.transform='scale(0)';f.style.opacity='0';}

function slideChapterBlockOut(c){c.style.transform='translateX(-150%)';}
function slideChapterBlockIn(c){c.style.transform='translateX(0)';}

// ========================= HOVER / MOBILE INTERACTION =========================
const _timers = new WeakMap();
const _session = new WeakMap();
let _active = null;

function _getSet(c){let s=_timers.get(c);if(!s){s=new Set();_timers.set(c,s);}return s;}
function _clearAll(c){const s=_getSet(c);s.forEach(id=>clearTimeout(id));s.clear();}
function _bumpSession(c){const n=(_session.get(c)||0)+1;_session.set(c,n);return n;}
function _currentSession(c){return _session.get(c)||0;}
function _schedule(c,fn,d){const s=_currentSession(c);const id=setTimeout(()=>{if(_currentSession(c)!==s)return;fn();},d);_getSet(c).add(id);return id;}
function _resetChapter(c){setInitialState(c);c.querySelectorAll('.page-node .chapter-text,.page-node .text-and-line img,.page-node .chapter-number,.page-node .animated-flower').forEach(el=>{void el.offsetWidth;});}

function revealPageNodesInOrder(c){const n=c.querySelectorAll('.page-node');n.forEach((node,i)=>_schedule(c,()=>revealPageNodeInSequence(node),i*500));}
function reversePageNodesInOrder(c){activeTimeouts.forEach(id=>clearTimeout(id));activeTimeouts=[];const n=Array.from(c.querySelectorAll('.page-node')).reverse();n.forEach((node,i)=>_schedule(c,()=>{reverseText(node);reverseLine(node);reverseNumber(node);reverseFlower(node);},i*500));}

function startChapterSequence(c,b){slideChapterBlockOut(b);_schedule(c,()=>{forceRevealNow(c);},120);}
function initChapterReveal(c){const b=c.querySelector('.chapter-block-img');b.style.transform='translateX(0)';b.style.transition='transform 0.8s ease';setInitialState(c);
  c.addEventListener('pointerenter',()=>{_bumpSession(c);_clearAll(c);if(_active&&_active!==c){_bumpSession(_active);_clearAll(_active);_resetChapter(_active);slideChapterBlockIn(_active.querySelector('.chapter-block-img'));}_active=c;_resetChapter(c);startChapterSequence(c,b);});
  c.addEventListener('pointerleave',()=>{if(c.dataset.mobileOpen==='1')return;_bumpSession(c);_clearAll(c);_resetChapter(c);slideChapterBlockIn(b);if(_active===c)_active=null;});
}

// ========================= MOBILE DIRECT NAV =========================
window.FORCE_MOBILE = window.FORCE_MOBILE ?? false;
const isMobileLike=()=>window.FORCE_MOBILE||matchMedia('(any-pointer:coarse)').matches||matchMedia('(hover:none)').matches;
let mobileOpen=null;

function setCoverInteractivity(c,e){const b=c.querySelector('.chapter-block-img');if(!b)return;b.style.pointerEvents=e?'auto':'none';}

function enableMobileContainerDirectNav(c){
  if(!isMobileLike())return;
  const r=MOBILE_ROUTES[c.id];if(!r)return;
  c.dataset.mobileDirectNav='1';try{c.style.touchAction='manipulation';}catch{}
  const go=(e)=>{e.preventDefault();e.stopPropagation();if(r.kind==='url'&&r.href){window.location.assign(r.href);}};
  c.addEventListener('touchend',go,{passive:false});c.addEventListener('click',go);
}

function openMobileChapter(c){if(mobileOpen&&mobileOpen!==c)closeMobileChapter(mobileOpen);const b=c.querySelector('.chapter-block-img');c.dataset.mobileOpen='1';mobileOpen=c;slideChapterBlockOut(b);setCoverInteractivity(c,false);requestAnimationFrame(()=>{requestAnimationFrame(()=>{forceRevealNow(c);});});setTimeout(()=>{forceRevealNow(c);},400);}
function closeMobileChapter(c){const b=c.querySelector('.chapter-block-img');setInitialState(c);slideChapterBlockIn(b);setCoverInteractivity(c,true);delete c.dataset.mobileOpen;if(mobileOpen===c)mobileOpen=null;}
function toggleMobileChapter(c){if(c.dataset.mobileOpen==='1')closeMobileChapter(c);else openMobileChapter(c);}

document.addEventListener('click',(e)=>{if(!isMobileLike()||!mobileOpen)return;if(!e.target.closest('.chapter-container'))closeMobileChapter(mobileOpen);});
window.addEventListener('resize',()=>{if(!isMobileLike()&&mobileOpen)closeMobileChapter(mobileOpen);});

// ========================= BOOT =========================
(function boot(){
  const wrapper=document.querySelector('#chapters-wrapper');
  if(!wrapper){console.error('#chapters-wrapper not found');return;}
  chapters.forEach((chapterData)=>{
    const chapterEl=createChapterHTML(chapterData);
    wrapper.appendChild(chapterEl);
    initChapterReveal(chapterEl);
    enableMobileContainerDirectNav(chapterEl);
  });
})();
