document.addEventListener("DOMContentLoaded", function () {
  const opener = document.getElementById('opener');

  const animation = lottie.loadAnimation({
    container: opener,
    renderer: 'svg', // KEEPING SVG
    loop: false,
    autoplay: false,
    path: '/resources/animations/title/title.json'
  });

  animation.setSpeed(0.4);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animation.setDirection(1);
          animation.setSpeed(0.4);
          animation.play();
        } else {
          animation.setDirection(-1);
          animation.setSpeed(1.2);
          animation.play();
        }
      });
    },
    {
      threshold: 0.6
    }
  );

  observer.observe(opener);
});
