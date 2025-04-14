
function initializeChapterAnimation(chapterId, animationPath) {
  const container = document.getElementById(chapterId);
  if (!container) return; 

  const animation = lottie.loadAnimation({
    container: container, 
    renderer: 'svg',
    loop: false,
    autoplay: false,
    path: animationPath, 
  });


  animation.addEventListener('DOMLoaded', () => {
    animation.goToAndStop(0, true);
  });


  container.addEventListener('mouseenter', () => {
    animation.setSpeed(1); 
    animation.setDirection(1);
    animation.play();
  });


  container.addEventListener('mouseleave', () => {
    animation.setSpeed(2); 
    animation.setDirection(-1);
    animation.play();
  });

  return animation; 
}


initializeChapterAnimation('chapter-1-animation-container', './resources/animations/chapter-1/chapter-block.json');
initializeChapterAnimation('chapter-2-animation-container', './resources/animations/chapter-2/chapter-block.json');
initializeChapterAnimation('chapter-3-animation-container', './resources/animations/chapter-3/chapter-block.json');
