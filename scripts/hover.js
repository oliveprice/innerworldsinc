
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


Object.values(underlineAnimations).forEach((anim) => {
  anim.setSpeed(3); 
});


document.querySelectorAll('.link-container').forEach((link) => {
  const linkId = link.querySelector('.underline-animation').id.replace('underline-', '');
  const anim = underlineAnimations[linkId];

  link.addEventListener('mouseenter', () => {
    anim.setDirection(1); 
    anim.goToAndStop(0, true); 
    anim.play();
  });

  link.addEventListener('mouseleave', () => {
    anim.setDirection(-1); 
    anim.play();
  });

  
  anim.addEventListener('complete', () => {
    if (!link.matches(':hover')) {
      anim.setDirection(-1); 
      anim.play();
    }
  });
});