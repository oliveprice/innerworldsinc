document.addEventListener("DOMContentLoaded", function () {
  // Make sure we're on index.html
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
    const container = document.getElementById('open-screen-animation');

    const animation = lottie.loadAnimation({
      container: container,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      path: './resources/animations/open-screen/data.json'
    });

    animation.setSpeed(1);

    setTimeout(() => {
      window.location.href = 'home.html';
    }, 2000); // redirect after 2 seconds
  }
});
