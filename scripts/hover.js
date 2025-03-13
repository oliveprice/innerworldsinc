// Initialize Lottie animations for each underline
const underlineAnimations = {
  'about-me': lottie.loadAnimation({
    container: document.getElementById('underline-about-me'),
    renderer: 'svg',
    loop: false,
    autoplay: false,
    path: './resources/animations/hover/underline.json', 
  }),
  'change-log': lottie.loadAnimation({
    container: document.getElementById('underline-change-log'),
    renderer: 'svg',
    loop: false,
    autoplay: false,
    path: './resources/animations/hover/underline.json', 
  }),
  'colophon': lottie.loadAnimation({
    container: document.getElementById('underline-colophon'),
    renderer: 'svg',
    loop: false,
    autoplay: false,
    path: './resources/animations/hover/underline.json', 
  }),
  'guestbook': lottie.loadAnimation({
    container: document.getElementById('underline-guestbook'),
    renderer: 'svg',
    loop: false,
    autoplay: false,
    path: './resources/animations/hover/underline.json', 
  }),
};

// Set animation speed to 2x (twice as fast)
Object.values(underlineAnimations).forEach((anim) => {
  anim.setSpeed(3); // 2x speed
});

// Add hover event listeners to each link
document.querySelectorAll('.link-container').forEach((link) => {
  const linkId = link.querySelector('.underline-animation').id.replace('underline-', '');
  const anim = underlineAnimations[linkId];

  link.addEventListener('mouseenter', () => {
    anim.setDirection(1); // Play forward
    anim.goToAndStop(0, true); // Reset to the start
    anim.play();
  });

  link.addEventListener('mouseleave', () => {
    anim.setDirection(-1); // Play in reverse
    anim.play();
  });

  // Ensure the animation reverses even if it has finished playing
  anim.addEventListener('complete', () => {
    if (!link.matches(':hover')) {
      anim.setDirection(-1); // Play in reverse
      anim.play();
    }
  });
});