// Function to initialize an animation for any chapter
function initializeChapterAnimation(chapterId, animationPath) {
  const container = document.getElementById(chapterId);
  if (!container) return; // Prevent errors if the element doesn't exist yet

  const animation = lottie.loadAnimation({
    container: container, // Use the provided chapter container
    renderer: 'svg',
    loop: false,
    autoplay: false,
    path: animationPath, // Use the provided animation path
  });

  // Ensure animation is fully loaded and set to the first frame
  animation.addEventListener('DOMLoaded', () => {
    animation.goToAndStop(0, true);
  });

  // Play animation on hover (normal speed)
  container.addEventListener('mouseenter', () => {
    animation.setSpeed(1); // Normal speed forward
    animation.setDirection(1);
    animation.play();
  });

  // Reverse the animation on hover out (2x speed)
  container.addEventListener('mouseleave', () => {
    animation.setSpeed(2); // 2x speed in reverse
    animation.setDirection(-1);
    animation.play();
  });

  return animation; // Return the animation instance if needed
}

// Initialize animations for existing chapters
initializeChapterAnimation('chapter-1-animation-container', './resources/animations/chapter-1/chapter-block.json');
// Future chapters can be added like this:
initializeChapterAnimation('chapter-2-animation-container', './resources/animations/chapter-2/chapter-block.json');
initializeChapterAnimation('chapter-3-animation-container', './resources/animations/chapter-3/chapter-block.json');
