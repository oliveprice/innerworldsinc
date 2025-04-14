  document.addEventListener("DOMContentLoaded", function () {
    const opener = document.getElementById('opener');

    const animation = lottie.loadAnimation({
      container: opener,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      path: '/resources/animations/title/title.json'
    });

    animation.setSpeed(0.4); 


    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animation.stop();     // Reset
            animation.play();     // Replay
          }
        });
      },
      {
        threshold: 0.6 
      }
    );

    observer.observe(opener);
  });