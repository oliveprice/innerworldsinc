
// array of all chapters with their content
const chapters = [
  {
    id: 'chapter-1',
    blockImage: './resources/animations/chapter-1/images/img_12.png',
    flowerLottie: './resources/animations/chapter-1/images/img_1.png',
    chapterNumber: '1',
    chapterName: 'CODE RED',
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
    { name: 'social media & narcissism', number: '6' },
    { name: 'the death of peprsonal style', number: '7' },
    { name: 'power through transmutation', number: '8' }
  ]
}



,
  // add more here...
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

  const pages = data.pages || [
  { name: 'Kody Joliet', number: '1' },
  { name: 'Code Red', number: '2' },
  { name: 'r8r.world', number: '3' }
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
  chapterText.textContent = page.name;

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

// ENTRY POINT: When user hovers a chapter
function initChapterReveal(container) {
  const chapterBlock = container.querySelector('.chapter-block-img');

  chapterBlock.style.transform = 'translateX(0)';
  chapterBlock.style.transition = 'transform 0.8s ease';

  container.addEventListener('mouseenter', () => {
    startChapterSequence(container, chapterBlock);
  });

  container.addEventListener('mouseleave', () => {
    slideChapterBlockIn(chapterBlock);
  });
}

// LEVEL 1: Chapter hover → trigger whole sequence
function startChapterSequence(container, chapterBlock) {
  slideChapterBlockOut(chapterBlock);

  setTimeout(() => {
    revealPageNodesInOrder(container);
  }, 500);
}

// LEVEL 2: Stagger in page nodes, one per second
function revealPageNodesInOrder(container) {
  const pageNodes = container.querySelectorAll('.page-node');

  pageNodes.forEach((node, i) => {
    setTimeout(() => {
      revealPageNodeInSequence(node);
    }, i * 500);
  });
}

// LEVEL 3: Animate a single page node’s elements
function revealPageNodeInSequence(node) {
  setTimeout(() => animateFlower(node), 0);
  setTimeout(() => animateNumber(node), 150);
  setTimeout(() => animateLine(node), 300);
  setTimeout(() => animateText(node), 450);
}

// BASIC ELEMENT ANIMATIONS
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

function reverseNumber(node) {
  const number = node.querySelector('.chapter-number');
  if (number) {
    number.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out';
    number.style.opacity = '0';
    number.style.transform = 'translateY(10px)';
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

function reverseLine(node) {
  const line = node.querySelector('.text-and-line img');
  if (line) {
    line.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out';
    line.style.opacity = '0';
    line.style.transform = 'translateX(40px)';
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

function reverseText(node) {
  const text = node.querySelector('.chapter-text');
  if (text) {
    text.style.transition = 'opacity 0.25s ease-in, transform 0.25s ease-in';
    text.style.opacity = '0';
    text.style.transform = 'translateY(10px)';
  }
}


function slideChapterBlockOut(chapterBlock) {
  chapterBlock.style.transform = 'translateX(-150%)';
}

function slideChapterBlockIn(chapterBlock) {
  chapterBlock.style.transform = 'translateX(0)';
}
// Reverse all page nodes in order, from last to first
function reversePageNodesInOrder(container) {
  const pageNodes = Array.from(container.querySelectorAll('.page-node')).reverse();

  pageNodes.forEach((node, i) => {
    setTimeout(() => {
      reversePageNodeSequence(node);
    }, i * 500);
  });
}

// Reverse animation of one page node's parts
function reversePageNodeSequence(node) {
  setTimeout(() => reverseText(node), 0);
  setTimeout(() => reverseLine(node), 150);
  setTimeout(() => reverseNumber(node), 300);
  setTimeout(() => reverseFlower(node), 450);
}

// Reverse flower
function reverseFlower(node) {
  const flower = node.querySelector('.animated-flower');
  if (flower) {
    flower.style.transform = 'scale(0)';
    flower.style.opacity = '0';
  }
}

// Reverse number
function reverseNumber(node) {
  const number = node.querySelector('.chapter-number');
  if (number) {
    number.style.opacity = '0';
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

function reverseLine(node) {
  const line = node.querySelector('.text-and-line img');
  if (line) {
    line.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out';
    line.style.opacity = '0';
    line.style.transform = 'translateX(40px)';
  }
}

// Reverse text
function reverseText(node) {
  const text = node.querySelector('.chapter-text');
  if (text) {
    text.style.opacity = '0';
  }
}

// 🧠 ADD: Setup initial state for all pieces on load
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

// MODIFIED: initChapterReveal to include reverse trigger
function initChapterReveal(container) {
  const chapterBlock = container.querySelector('.chapter-block-img');

  chapterBlock.style.transform = 'translateX(0)';
  chapterBlock.style.transition = 'transform 0.8s ease';

  setInitialState(container); // <-- new

  container.addEventListener('mouseenter', () => {
    startChapterSequence(container, chapterBlock);
  });

  container.addEventListener('mouseleave', () => {
    reversePageNodesInOrder(container);
    setTimeout(() => {
      slideChapterBlockIn(chapterBlock);
    }, 500 * 3); // after 3 page nodes reverse
  });
}

// init
chapters.forEach((chapterData) => {
  const chapterEl = createChapterHTML(chapterData);
  document.querySelector('#chapters-wrapper').appendChild(chapterEl);
  initChapterReveal(chapterEl);
});
