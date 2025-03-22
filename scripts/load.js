
  document.body.classList.add('loading-hidden');

  const animationContainer = document.getElementById('loading-screen');

  const animation = lottie.loadAnimation({
    container: animationContainer,
    renderer: 'svg',
    loop: false,
    autoplay: true,
    path: './resources/animations/loading/loading.json' // 
  });

animation.setSpeed(3);

  animation.addEventListener('complete', function () {
    // Hide the loading screen
    animationContainer.style.display = 'none';

    // Reveal your content
    document.querySelector('.display-none').style.display = 'block';
    document.body.classList.remove('loading-hidden');
  });
