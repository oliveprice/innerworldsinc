// chapters-animation-2.js  — FULL FILE (keeps ALL your existing behavior)
// Adds: more project names in the fallback list + deep-link to projects.html
// Clicking a known project row will navigate to projects.html?open=<key>
// and your projects page will auto-open that card (using your existing script).

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
      // These look like non-project entries, so they remain plain text.
      { name: 'Learn through Imitation', number: '4' },
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
      // Blog entry stays a real <a> to your blog page.
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

  // EXPANDED FALLBACK: show all your project names when a chapter doesn't specify pages.
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

  // BLOG: keep your original behavior
  if (page.name.toLowerCase() === 'power through transmutation') {
    const link = document.createElement('a');
    link.href = '/blogs/power-through-transmutation.html';
    link.textContent = page.name;
    link.style.textDecoration = 'none';
    link.style.color = 'inherit';
    chapterText.appendChild(link);
  } else {
    // For everything else, render the plain text…
    chapterText.textContent = page.name;

    // …and if it's a known project, make the ENTIRE ROW navigate to projects.html
    const key = projectKeyFor(page);
    if (key) {
      makeRowDeepLink(pageNode, key);
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
function slug(t) {
  return (t || '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9.-]+/g, '');
}

function projectKeyFor(page) {
  // allow page.key override if you start adding keys directly in the data
  if (page.key) return page.key;
  const label = (page.name || '').toLowerCase().trim();
  if (projectKeyMap[label]) return projectKeyMap[label];
  // fallback: use slugged label (projects.html auto-open script can also match by <h4> title)
  return slug(label);
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

  rowEl.addEventListener('click', go);
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
