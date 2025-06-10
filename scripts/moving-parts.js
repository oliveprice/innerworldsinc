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

const container = document.getElementById('octo-placeholder');

console.log("🧪 TEST MODE: Forcing Lottie everywhere");

container.innerHTML = `<div id="octo-lottie" class="octo-video"></div>`;

lottie.loadAnimation({
  container: document.getElementById('octo-lottie'),
  renderer: 'svg', // stick with svg — it fixed the canvas issues
  loop: true,
  autoplay: true,
  path: './resources/animations/final-octo-test/data.json'
});


console.log("🧜‍♀️ Forcing Lottie mermaid everywhere");

const mermaidContainer = document.getElementById('mermaid-lottie');

lottie.loadAnimation({
  container: mermaidContainer,
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: './resources/animations/final-mermaid/data.json'
});
