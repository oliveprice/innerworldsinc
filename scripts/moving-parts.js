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
    path: './resources/animations/final-octo-test/data.json'
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

function supportsWebMAlpha() {
  const video = document.createElement('video');
  return video.canPlayType('video/webm; codecs="vp8, vorbis"') !== '';
}

const container = document.getElementById('octo-placeholder');

if (supportsWebMAlpha()) {
  // Use WebM for Chrome/Firefox/Edge
  container.innerHTML = `
    <video class="octo-video" autoplay loop muted playsinline>
      <source src="./resources/animations/octo-loop.webm" type="video/webm">
    </video>
  `;
} else {
  // Use Lottie for Safari and friends
  container.innerHTML = `<div id="octo-lottie" class="octo-video"></div>`;

  // Load the Lottie player
  lottie.loadAnimation({
    container: document.getElementById('octo-lottie'),
    renderer: 'canvas',
    loop: true,
    autoplay: true,
    path: './resources/animations/octo-loop-lottie.json'
  });
}
