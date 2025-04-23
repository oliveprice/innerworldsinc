document.addEventListener("DOMContentLoaded", function () {
  const angel = document.getElementById('angel-lottie');

  const animation = lottie.loadAnimation({
    container: angel,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: './resources/animations/angel/data.json'
  });

  animation.setSpeed(1); // adjust this if needed
});


document.addEventListener("DOMContentLoaded", function () {
  const octo = document.getElementById('octo-lottie');

  const animation = lottie.loadAnimation({
    container: octo,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: './resources/animations/octopus/data.json'
  });

  animation.setSpeed(1);
});

document.addEventListener("DOMContentLoaded", function () {
  const octo = document.getElementById('womp-lottie');

  const animation = lottie.loadAnimation({
    container: octo,
    renderer: 'svg',
    loop: false,
    autoplay: true,
    path: './resources/animations/womp/data.json'
  });

  animation.setSpeed(1);
});

